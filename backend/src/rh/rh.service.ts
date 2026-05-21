import { Injectable, Logger, NotFoundException, Inject, Scope, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class RHService {
  private readonly logger = new Logger(RHService.name);
  private tenantSchema: string;

  constructor(
    @InjectDataSource('tenant') private dataSource: DataSource,
    @Inject(REQUEST) private request: any,
  ) {
    // Récupérer le schéma du tenant depuis la requête
    this.tenantSchema = this.request.tenantSchema || 'public';
    this.logger.log(`RHService initialized with schema: ${this.tenantSchema}`);
    
    if (!this.request.tenantSchema) {
      this.logger.warn('No tenant schema found in request! Using public schema as fallback.');
    }
  }

  // Méthode helper pour exécuter des requêtes avec le bon schéma
  private async query(sql: string, params?: any[]): Promise<any> {
    try {
      if (!this.tenantSchema || this.tenantSchema === 'public') {
        throw new BadRequestException('Tenant schema not set. Please provide X-Tenant-Id header.');
      }
      
      // Utiliser un QueryRunner pour garantir que SET search_path et la requête
      // s'exécutent sur la même connexion
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      
      try {
        await queryRunner.query(`SET search_path TO "${this.tenantSchema}", public`);
        this.logger.debug(`Executing query in schema: ${this.tenantSchema}`);
        const result = await queryRunner.query(sql, params);
        return result;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Query error in schema ${this.tenantSchema}: ${errorMessage}`);
      throw error;
    }
  }

  // Helper pour convertir snake_case en camelCase
  private toCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.toCamelCase(item));
    }
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = this.toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }

  // ========== UTILISATEURS & DÉPARTEMENTS ==========
  async getUtilisateurs(): Promise<any[]> {
    this.logger.log(`[getUtilisateurs] Fetching users from schema: ${this.tenantSchema}`);
    const result = await this.query(`
      SELECT id, nom, prenom, email, role, actif
      FROM "${this.tenantSchema}".utilisateur
      ORDER BY nom, prenom
    `);
    this.logger.log(`[getUtilisateurs] Found ${result.length} users in schema ${this.tenantSchema}`);
    return this.toCamelCase(result);
  }

  async getDepartements(): Promise<any[]> {
    const result = await this.query(`
      SELECT id, nom, code, description
      FROM "${this.tenantSchema}".departement
      ORDER BY nom
    `);
    return this.toCamelCase(result);
  }

  // ========== CONTRATS ==========
  async createContrat(data: any): Promise<any> {
    const result = await this.query(`
      INSERT INTO "${this.tenantSchema}".contrat_personnel (
        utilisateur_id, type_contrat, poste, departement_id, date_debut, date_fin,
        salaire_brut, salaire_net, volume_horaire_hebdo, actif, observations
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      data.utilisateurId, data.typeContrat, data.poste, data.departementId,
      data.dateDebut, data.dateFin, data.salaireBrut, data.salaireNet,
      data.volumeHoraireHebdo, data.actif !== false, data.observations
    ]);
    return this.toCamelCase(result[0]);
  }

  async findContrats(filters?: { typeContrat?: string; actif?: boolean; departementId?: string }): Promise<any[]> {
    let query = `
      SELECT
        c.*,
        u.nom as utilisateur_nom,
        u.prenom as utilisateur_prenom,
        d.nom as departement_nom
      FROM "${this.tenantSchema}".contrat_personnel c
      LEFT JOIN "${this.tenantSchema}".utilisateur u ON u.id = c.utilisateur_id
      LEFT JOIN "${this.tenantSchema}".departement d ON d.id = c.departement_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.typeContrat) {
      query += ` AND c.type_contrat = $${++paramCount}`;
      params.push(filters.typeContrat);
    }
    if (filters?.actif !== undefined) {
      query += ` AND c.actif = $${++paramCount}`;
      params.push(filters.actif);
    }
    if (filters?.departementId) {
      query += ` AND c.departement_id = $${++paramCount}`;
      params.push(filters.departementId);
    }

    query += ` ORDER BY c.date_debut DESC`;
    const result = await this.query(query, params);
    return this.toCamelCase(result);
  }

  async renouvelerContrat(id: string, data: { nouvelleDateFin: Date; nouveauSalaire?: number }): Promise<any> {
    const contrats = await this.query(`SELECT * FROM "${this.tenantSchema}".contrat_personnel WHERE id = $1`, [id]);
    if (!contrats || contrats.length === 0) {
      throw new NotFoundException('Contrat non trouvé');
    }

    if (data.nouveauSalaire) {
      await this.query(`
        UPDATE "${this.tenantSchema}".contrat_personnel
        SET date_fin = $1, salaire_brut = $2, updated_at = NOW()
        WHERE id = $3
      `, [data.nouvelleDateFin, data.nouveauSalaire, id]);
    } else {
      await this.query(`
        UPDATE "${this.tenantSchema}".contrat_personnel
        SET date_fin = $1, updated_at = NOW()
        WHERE id = $2
      `, [data.nouvelleDateFin, id]);
    }

    const result = await this.query(`SELECT * FROM "${this.tenantSchema}".contrat_personnel WHERE id = $1`, [id]);
    return this.toCamelCase(result[0]);
  }

  async resilierContrat(id: string, motif: string): Promise<any> {
    await this.query(`
      UPDATE "${this.tenantSchema}".contrat_personnel
      SET actif = false, observations = $1, updated_at = NOW()
      WHERE id = $2
    `, [motif, id]);

    const result = await this.query(`SELECT * FROM "${this.tenantSchema}".contrat_personnel WHERE id = $1`, [id]);
    return this.toCamelCase(result[0]);
  }

  // ========== HEURES COMPLÉMENTAIRES ==========
  async createHeuresComplementaires(data: any): Promise<any> {
    // Créer une entrée dans une table heures_complementaires si elle existe
    // Sinon stocker dans les observations de la fiche de paie
    const heuresComp = await this.query(`
      INSERT INTO "${this.tenantSchema}".heure_complementaire (enseignant_id, date_travail, nb_heures, taux_horaire, motif, statut, created_at)
      VALUES ($1, $2, $3, $4, $5, 'saisie', NOW())
      RETURNING *
    `, [data.enseignantId, data.dateTravail, data.nbHeures, data.tauxHoraire, data.motif]);
    
    return this.toCamelCase(heuresComp[0]);
  }

  async findHeuresComplementaires(filters?: { enseignantId?: string; statut?: string; mois?: number; annee?: number }): Promise<any[]> {
    let query = `SELECT hc.*, e.nom, e.prenom FROM "${this.tenantSchema}".heure_complementaire hc
                 JOIN "${this.tenantSchema}".enseignant e ON e.id = hc.enseignant_id WHERE 1=1`;
    const params: any[] = [];
    let paramCount = 0;
    
    if (filters?.enseignantId) {
      query += ` AND hc.enseignant_id = $${++paramCount}`;
      params.push(filters.enseignantId);
    }
    if (filters?.statut) {
      query += ` AND hc.statut = $${++paramCount}`;
      params.push(filters.statut);
    }
    if (filters?.mois && filters?.annee) {
      query += ` AND EXTRACT(MONTH FROM hc.date_travail) = $${++paramCount} AND EXTRACT(YEAR FROM hc.date_travail) = $${++paramCount}`;
      params.push(filters.mois, filters.annee);
    }
    
    query += ` ORDER BY hc.date_travail DESC`;
    const result = await this.query(query, params);
    return this.toCamelCase(result);
  }

  async validerHeuresComplementaires(id: string, validePar: string): Promise<any> {
    await this.query(`
      UPDATE "${this.tenantSchema}".heure_complementaire
      SET statut = 'valide', valide_par = $1, date_validation = NOW()
      WHERE id = $2
    `, [validePar, id]);
    const result = await this.query(`SELECT * FROM "${this.tenantSchema}".heure_complementaire WHERE id = $1`, [id]);
    return this.toCamelCase(result[0]);
  }

  async getVolumeHoraireEnseignant(enseignantId: string, annee?: number): Promise<any> {
    const anneeFilter = annee ? `AND EXTRACT(YEAR FROM date_travail) = ${annee}` : '';
    
    const result = await this.query(`
      SELECT
        COALESCE(SUM(nb_heures), 0) as total_heures,
        COUNT(*) as nb_seances,
        COALESCE(SUM(CASE WHEN statut = 'valide' THEN nb_heures ELSE 0 END), 0) as heures_validees,
        COALESCE(SUM(CASE WHEN statut = 'saisie' THEN nb_heures ELSE 0 END), 0) as heures_en_attente
      FROM "${this.tenantSchema}".heure_complementaire
      WHERE enseignant_id = $1 ${anneeFilter}
    `, [enseignantId]);
    
    return this.toCamelCase(result[0]);
  }

  // ========== CONGÉS ==========
  async demanderConge(data: any): Promise<any> {
    const result = await this.query(`
      INSERT INTO "${this.tenantSchema}".conge_personnel (
        utilisateur_id, type_conge, date_debut, date_fin, nb_jours, motif, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, 'demande')
      RETURNING *
    `, [
      data.utilisateurId, data.typeConge, data.dateDebut, data.dateFin,
      data.nbJours, data.motif
    ]);
    return this.toCamelCase(result[0]);
  }

  async findConges(filters?: { utilisateurId?: string; statut?: string; typeConge?: string }): Promise<any[]> {
    let query = `
      SELECT c.*, u.nom as utilisateur_nom, u.prenom as utilisateur_prenom
      FROM "${this.tenantSchema}".conge_personnel c
      LEFT JOIN "${this.tenantSchema}".utilisateur u ON u.id = c.utilisateur_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.utilisateurId) {
      query += ` AND c.utilisateur_id = $${++paramCount}`;
      params.push(filters.utilisateurId);
    }
    if (filters?.statut) {
      query += ` AND c.statut = $${++paramCount}`;
      params.push(filters.statut);
    }
    if (filters?.typeConge) {
      query += ` AND c.type_conge = $${++paramCount}`;
      params.push(filters.typeConge);
    }

    query += ` ORDER BY c.date_debut DESC`;
    const result = await this.query(query, params);
    return this.toCamelCase(result);
  }

  async approuverConge(id: string, data: { approuvePar: string; commentaire?: string }): Promise<any> {
    await this.query(`
      UPDATE "${this.tenantSchema}".conge_personnel
      SET statut = 'approuve', approuve_par = $1, date_approbation = NOW()
      WHERE id = $2
    `, [data.approuvePar, id]);

    const result = await this.query(`SELECT * FROM "${this.tenantSchema}".conge_personnel WHERE id = $1`, [id]);
    return result[0];
  }

  async refuserConge(id: string, data: { approuvePar: string; motif: string }): Promise<any> {
    await this.query(`
      UPDATE "${this.tenantSchema}".conge_personnel
      SET statut = 'refuse', approuve_par = $1, date_approbation = NOW(), motif = $2
      WHERE id = $3
    `, [data.approuvePar, data.motif, id]);

    const result = await this.query(`SELECT * FROM "${this.tenantSchema}".conge_personnel WHERE id = $1`, [id]);
    return result[0];
  }

  async getSoldeConges(utilisateurId: string): Promise<any> {
    const result = await this.query(`
      SELECT
        25 as conges_acquis_annuels,
        COALESCE(SUM(nb_jours), 0) as conges_pris,
        25 - COALESCE(SUM(nb_jours), 0) as solde_restant
      FROM "${this.tenantSchema}".conge_personnel
      WHERE utilisateur_id = $1
        AND statut = 'approuve'
        AND EXTRACT(YEAR FROM date_debut) = EXTRACT(YEAR FROM NOW())
    `, [utilisateurId]);
    
    return result[0] || { conges_acquis_annuels: 25, conges_pris: 0, solde_restant: 25 };
  }

  // ========== FICHES DE PAIE ==========
  async genererFichePaie(data: any): Promise<any> {
    // Calcul automatique des cotisations (simplifié)
    const cotisations = data.salaireBrut * 0.22; // 22% de cotisations approximatif
    const netAPayer = data.salaireBrut - cotisations + (data.primes || 0) - (data.retenues || 0) + (data.montantHeuresSupp || 0);
    
    const result = await this.query(`
      INSERT INTO "${this.tenantSchema}".fiche_paie (
        contrat_id, annee, mois, salaire_brut, cotisations, primes, retenues,
        net_a_payer, heures_supp, montant_heures_supp, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'brouillon')
      RETURNING *
    `, [
      data.contratId, data.annee, data.mois, data.salaireBrut, cotisations,
      data.primes || 0, data.retenues || 0, netAPayer, data.heuresSupp || 0,
      data.montantHeuresSupp || 0
    ]);
    return result[0];
  }

  async findFichesPaie(filters?: { contratId?: string; annee?: number; mois?: number }): Promise<any[]> {
    let query = `
      SELECT fp.*, c.poste, u.nom as utilisateur_nom, u.prenom as utilisateur_prenom
      FROM "${this.tenantSchema}".fiche_paie fp
      LEFT JOIN "${this.tenantSchema}".contrat_personnel c ON c.id = fp.contrat_id
      LEFT JOIN "${this.tenantSchema}".utilisateur u ON u.id = c.utilisateur_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.contratId) {
      query += ` AND fp.contrat_id = $${++paramCount}`;
      params.push(filters.contratId);
    }
    if (filters?.annee) {
      query += ` AND fp.annee = $${++paramCount}`;
      params.push(filters.annee);
    }
    if (filters?.mois) {
      query += ` AND fp.mois = $${++paramCount}`;
      params.push(filters.mois);
    }

    query += ` ORDER BY fp.annee DESC, fp.mois DESC`;
    const result = await this.query(query, params);
    return this.toCamelCase(result);
  }

  async validerFichePaie(id: string): Promise<any> {
    await this.query(`
      UPDATE "${this.tenantSchema}".fiche_paie
      SET statut = 'valide'
      WHERE id = $1
    `, [id]);

    const result = await this.query(`SELECT * FROM "${this.tenantSchema}".fiche_paie WHERE id = $1`, [id]);
    return result[0];
  }

  async genererFichesPaieMasse(annee: number, mois: number): Promise<any> {
    // Générer automatiquement pour tous les contrats actifs
    const contrats = await this.query(`SELECT * FROM "${this.tenantSchema}".contrat_personnel WHERE actif = true`);
    const results = [];
    
    for (const contrat of contrats) {
      const existing = await this.query(`
        SELECT * FROM "${this.tenantSchema}".fiche_paie
        WHERE contrat_id = $1 AND annee = $2 AND mois = $3
      `, [contrat.id, annee, mois]);
      
      if (!existing || existing.length === 0) {
        const cotisations = Number(contrat.salaire_brut) * 0.22;
        const netAPayer = Number(contrat.salaire_net) || (Number(contrat.salaire_brut) - cotisations);
        
        const result = await this.query(`
          INSERT INTO "${this.tenantSchema}".fiche_paie (
            contrat_id, annee, mois, salaire_brut, cotisations, net_a_payer, statut
          ) VALUES ($1, $2, $3, $4, $5, $6, 'brouillon')
          RETURNING *
        `, [contrat.id, annee, mois, contrat.salaire_brut, cotisations, netAPayer]);
        
        results.push(result[0]);
      }
    }
    
    return { generees: results.length };
  }

  // ========== ÉVALUATIONS ==========
  async createEvaluation(data: any): Promise<any> {
    const evalResult = await this.query(`
      INSERT INTO "${this.tenantSchema}".evaluation_personnel (
        utilisateur_id, evaluateur_id, annee_evaluation, date_evaluation, objectifs, competences, statut
      ) VALUES ($1, $2, $3, NOW(), $4, $5, 'en_cours')
      RETURNING *
    `, [data.utilisateurId, data.evaluateurId, data.anneeEvaluation, data.objectifs, data.competences]);
    
    return evalResult[0];
  }

  async findEvaluations(filters?: { utilisateurId?: string; annee?: number; statut?: string }): Promise<any[]> {
    let query = `
      SELECT
        ep.*,
        u.nom as utilisateur_nom,
        u.prenom as utilisateur_prenom,
        ev.nom as evaluateur_nom,
        ev.prenom as evaluateur_prenom
      FROM "${this.tenantSchema}".evaluation_personnel ep
      LEFT JOIN "${this.tenantSchema}".utilisateur u ON u.id = ep.utilisateur_id
      LEFT JOIN "${this.tenantSchema}".utilisateur ev ON ev.id = ep.evaluateur_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;
    
    if (filters?.utilisateurId) {
      query += ` AND ep.utilisateur_id = $${++paramCount}`;
      params.push(filters.utilisateurId);
    }
    if (filters?.annee) {
      query += ` AND ep.annee_evaluation = $${++paramCount}`;
      params.push(filters.annee);
    }
    if (filters?.statut) {
      query += ` AND ep.statut = $${++paramCount}`;
      params.push(filters.statut);
    }
    
    query += ` ORDER BY ep.date_evaluation DESC`;
    const result = await this.query(query, params);
    return this.toCamelCase(result);
  }

  async submitAutoEvaluation(id: string, data: any): Promise<any> {
    await this.query(`
      UPDATE "${this.tenantSchema}".evaluation_personnel
      SET auto_evaluation = $1, date_auto_evaluation = NOW(), statut = 'auto_evalue'
      WHERE id = $2
    `, [JSON.stringify(data), id]);
    const result = await this.query(`SELECT * FROM "${this.tenantSchema}".evaluation_personnel WHERE id = $1`, [id]);
    return result[0];
  }

  async finaliserEvaluation(id: string, data: any): Promise<any> {
    await this.query(`
      UPDATE "${this.tenantSchema}".evaluation_personnel
      SET appreciation = $1, points_forts = $2, axes_amelioration = $3,
          note_globale = $4, statut = 'finalise', date_finalisation = NOW()
      WHERE id = $5
    `, [data.appreciation, data.pointsForts, data.axesAmelioration, data.noteGlobale, id]);
    const result = await this.query(`SELECT * FROM "${this.tenantSchema}".evaluation_personnel WHERE id = $1`, [id]);
    return result[0];
  }

  // ========== DÉCLARATIONS SOCIALES ==========
  async createDeclarationSociale(data: any): Promise<any> {
    const decl = await this.query(`
      INSERT INTO "${this.tenantSchema}".declaration_sociale (
        type_declaration, periode_debut, periode_fin, organisme,
        montant_total_cotisations, nb_salaries, statut, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'preparation', NOW())
      RETURNING *
    `, [data.type, data.periodeDebut, data.periodeFin, data.organisme, data.montantTotal, data.nbSalaries]);
    
    return decl[0];
  }

  async findDeclarationsSociales(filters?: { type?: string; organisme?: string; statut?: string }): Promise<any[]> {
    let query = `SELECT * FROM "${this.tenantSchema}".declaration_sociale WHERE 1=1`;
    const params: any[] = [];
    let paramCount = 0;
    
    if (filters?.type) {
      query += ` AND type_declaration = $${++paramCount}`;
      params.push(filters.type);
    }
    if (filters?.organisme) {
      query += ` AND organisme = $${++paramCount}`;
      params.push(filters.organisme);
    }
    if (filters?.statut) {
      query += ` AND statut = $${++paramCount}`;
      params.push(filters.statut);
    }
    
    query += ` ORDER BY periode_debut DESC`;
    const result = await this.query(query, params);
    return this.toCamelCase(result);
  }

  async exportDeclarationSociale(id: string): Promise<any> {
    // Générer un export au format attendu par l'organisme
    const declaration = await this.query(`
      SELECT ds.*,
        json_agg(json_build_object(
          'salarie', u.nom || ' ' || u.prenom,
          'salaire_brut', fp.salaire_brut,
          'cotisations', fp.cotisations
        )) as lignes
      FROM "${this.tenantSchema}".declaration_sociale ds
      JOIN "${this.tenantSchema}".fiche_paie fp ON fp.annee = EXTRACT(YEAR FROM ds.periode_debut)
        AND fp.mois = EXTRACT(MONTH FROM ds.periode_debut)
      JOIN "${this.tenantSchema}".contrat_personnel cp ON cp.id = fp.contrat_id
      JOIN "${this.tenantSchema}".utilisateur u ON u.id = cp.utilisateur_id
      WHERE ds.id = $1
      GROUP BY ds.id
    `, [id]);
    
    return declaration[0];
  }

  // ========== RECRUTEMENT ==========
  async createRecrutement(data: any): Promise<any> {
    const recrutement = await this.query(`
      INSERT INTO "${this.tenantSchema}".recrutement (
        poste, type_contrat, departement_id, nb_postes, date_cloture,
        statut, created_at, description
      ) VALUES ($1, $2, $3, $4, $5, 'ouvert', NOW(), $6)
      RETURNING *
    `, [data.poste, data.typeContrat, data.departementId, data.nbPostes, data.dateCloture, data.description]);
    
    return recrutement[0];
  }

  async findRecrutements(filters?: { statut?: string; departementId?: string }): Promise<any[]> {
    let query = `SELECT r.*, d.nom as departement_nom FROM "${this.tenantSchema}".recrutement r
                 LEFT JOIN "${this.tenantSchema}".departement d ON d.id = r.departement_id WHERE 1=1`;
    const params: any[] = [];
    let paramCount = 0;
    
    if (filters?.statut) {
      query += ` AND r.statut = $${++paramCount}`;
      params.push(filters.statut);
    }
    if (filters?.departementId) {
      query += ` AND r.departement_id = $${++paramCount}`;
      params.push(filters.departementId);
    }
    
    query += ` ORDER BY r.created_at DESC`;
    const result = await this.query(query, params);
    return this.toCamelCase(result);
  }

  // ========== STATISTIQUES ==========
  async getStatsRH(): Promise<any> {
    const effectifsResult = await this.query(`
      SELECT COUNT(*) as count FROM "${this.tenantSchema}".contrat_personnel WHERE actif = true
    `);
    
    const masseSalariale = await this.query(`
      SELECT COALESCE(SUM(salaire_brut), 0) as total FROM "${this.tenantSchema}".contrat_personnel WHERE actif = true
    `);
    
    const contratsParType = await this.query(`
      SELECT type_contrat, COUNT(*) as count FROM "${this.tenantSchema}".contrat_personnel
      WHERE actif = true GROUP BY type_contrat
    `);
    
    const congesEnAttenteResult = await this.query(`
      SELECT COUNT(*) as count FROM "${this.tenantSchema}".conge_personnel WHERE statut = 'demande'
    `);

    return {
      effectifs: parseInt(effectifsResult[0]?.count || 0),
      masseSalarialeMensuelle: parseFloat(masseSalariale[0]?.total || 0),
      repartitionContrats: contratsParType,
      congesEnAttente: parseInt(congesEnAttenteResult[0]?.count || 0),
    };
  }

  async getStatsHeuresComplementaires(annee: number, mois: number): Promise<any> {
    const result = await this.query(`
      SELECT
        COUNT(DISTINCT enseignant_id) as nb_enseignants,
        COALESCE(SUM(nb_heures), 0) as total_heures,
        COALESCE(SUM(nb_heures * taux_horaire), 0) as cout_total
      FROM "${this.tenantSchema}".heure_complementaire
      WHERE EXTRACT(YEAR FROM date_travail) = $1 AND EXTRACT(MONTH FROM date_travail) = $2
        AND statut = 'valide'
    `, [annee, mois]);
    
    return result[0];
  }
  
  // ========== GESTION DES COURS (UE) ==========
  
  /**
   * Créer une Unité d'Enseignement (Cours)
   */
  async creerCours(data: {
    parcoursId: string;
    code: string;
    intitule: string;
    creditsEcts: number;
    coefficient: number;
    volumeCm?: number;
    volumeTd?: number;
    volumeTp?: number;
    semestre: number;
    anneeNiveau: number;
    typeUe?: 'obligatoire' | 'optionnel' | 'libre';
    enseignantId?: string;
  }): Promise<any> {
    const result = await this.query(`
      INSERT INTO "${this.tenantSchema}".unite_enseignement (
        parcours_id, code, intitule, credits_ects, coefficient,
        volume_cm, volume_td, volume_tp, semestre, annee_niveau,
        type_ue, enseignant_id, actif, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, TRUE, NOW())
      RETURNING *
    `, [
      data.parcoursId, data.code, data.intitule, data.creditsEcts, data.coefficient,
      data.volumeCm || 0, data.volumeTd || 0, data.volumeTp || 0,
      data.semestre, data.anneeNiveau, data.typeUe || 'obligatoire', data.enseignantId || null
    ]);

    this.logger.log(`Cours (UE) créé: ${data.code} - ${data.intitule}`);
    return result[0];
  }

  /**
   * Modifier une Unité d'Enseignement
   */
  async modifierCours(id: string, data: Partial<{
    code: string;
    intitule: string;
    creditsEcts: number;
    coefficient: number;
    volumeCm: number;
    volumeTd: number;
    volumeTp: number;
    semestre: number;
    anneeNiveau: number;
    typeUe: 'obligatoire' | 'optionnel' | 'libre';
    enseignantId: string;
    actif: boolean;
  }>): Promise<any> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (data.code !== undefined) {
      fields.push(`code = $${++paramCount}`);
      values.push(data.code);
    }
    if (data.intitule !== undefined) {
      fields.push(`intitule = $${++paramCount}`);
      values.push(data.intitule);
    }
    if (data.creditsEcts !== undefined) {
      fields.push(`credits_ects = $${++paramCount}`);
      values.push(data.creditsEcts);
    }
    if (data.coefficient !== undefined) {
      fields.push(`coefficient = $${++paramCount}`);
      values.push(data.coefficient);
    }
    if (data.volumeCm !== undefined) {
      fields.push(`volume_cm = $${++paramCount}`);
      values.push(data.volumeCm);
    }
    if (data.volumeTd !== undefined) {
      fields.push(`volume_td = $${++paramCount}`);
      values.push(data.volumeTd);
    }
    if (data.volumeTp !== undefined) {
      fields.push(`volume_tp = $${++paramCount}`);
      values.push(data.volumeTp);
    }
    if (data.semestre !== undefined) {
      fields.push(`semestre = $${++paramCount}`);
      values.push(data.semestre);
    }
    if (data.anneeNiveau !== undefined) {
      fields.push(`annee_niveau = $${++paramCount}`);
      values.push(data.anneeNiveau);
    }
    if (data.typeUe !== undefined) {
      fields.push(`type_ue = $${++paramCount}`);
      values.push(data.typeUe);
    }
    if (data.enseignantId !== undefined) {
      fields.push(`enseignant_id = $${++paramCount}`);
      values.push(data.enseignantId);
    }
    if (data.actif !== undefined) {
      fields.push(`actif = $${++paramCount}`);
      values.push(data.actif);
    }

    if (fields.length === 0) {
      throw new BadRequestException('Aucune donnée à modifier');
    }

    values.push(id);
    const result = await this.query(`
      UPDATE "${this.tenantSchema}".unite_enseignement
      SET ${fields.join(', ')}
      WHERE id = $${++paramCount}
      RETURNING *
    `, values);

    if (result.length === 0) {
      throw new NotFoundException(`Cours (UE) avec l'ID ${id} non trouvé`);
    }

    this.logger.log(`Cours (UE) modifié: ${id}`);
    return result[0];
  }

  /**
   * Lister tous les cours (UE) avec filtres
   */
  async getCours(filters?: {
    parcoursId?: string;
    semestre?: number;
    anneeNiveau?: number;
    enseignantId?: string;
    actif?: boolean;
  }): Promise<any[]> {
    let query = `
      SELECT 
        ue.*,
        p.nom as parcours_nom,
        p.code as parcours_code,
        e.nom as enseignant_nom,
        e.prenom as enseignant_prenom,
        (SELECT COUNT(*) FROM "${this.tenantSchema}".element_constitutif ec WHERE ec.ue_id = ue.id AND ec.actif = TRUE) as nb_elements_constitutifs,
        (SELECT COUNT(*) FROM "${this.tenantSchema}".affectation_cours ac WHERE ac.ue_id = ue.id) as nb_affectations
      FROM "${this.tenantSchema}".unite_enseignement ue
      LEFT JOIN "${this.tenantSchema}".parcours p ON p.id = ue.parcours_id
      LEFT JOIN "${this.tenantSchema}".enseignant e ON e.id = ue.enseignant_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.parcoursId) {
      query += ` AND ue.parcours_id = $${++paramCount}`;
      params.push(filters.parcoursId);
    }
    if (filters?.semestre) {
      query += ` AND ue.semestre = $${++paramCount}`;
      params.push(filters.semestre);
    }
    if (filters?.anneeNiveau) {
      query += ` AND ue.annee_niveau = $${++paramCount}`;
      params.push(filters.anneeNiveau);
    }
    if (filters?.enseignantId) {
      query += ` AND ue.enseignant_id = $${++paramCount}`;
      params.push(filters.enseignantId);
    }
    if (filters?.actif !== undefined) {
      query += ` AND ue.actif = $${++paramCount}`;
      params.push(filters.actif);
    }

    query += ` ORDER BY ue.annee_niveau, ue.semestre, ue.code`;

    return this.query(query, params);
  }

  /**
   * Obtenir un cours (UE) par ID avec détails
   */
  async getCoursById(id: string): Promise<any> {
    const result = await this.query(`
      SELECT 
        ue.*,
        p.nom as parcours_nom,
        p.code as parcours_code,
        p.niveau_etude_id,
        e.nom as enseignant_nom,
        e.prenom as enseignant_prenom,
        e.email as enseignant_email,
        (SELECT COUNT(*) FROM "${this.tenantSchema}".element_constitutif ec WHERE ec.ue_id = ue.id AND ec.actif = TRUE) as nb_elements_constitutifs,
        (SELECT COUNT(*) FROM "${this.tenantSchema}".affectation_cours ac WHERE ac.ue_id = ue.id) as nb_affectations,
        (SELECT json_agg(json_build_object(
          'id', ec.id,
          'code', ec.code,
          'intitule', ec.intitule,
          'coefficient', ec.coefficient,
          'actif', ec.actif
        )) FROM "${this.tenantSchema}".element_constitutif ec WHERE ec.ue_id = ue.id) as elements_constitutifs
      FROM "${this.tenantSchema}".unite_enseignement ue
      LEFT JOIN "${this.tenantSchema}".parcours p ON p.id = ue.parcours_id
      LEFT JOIN "${this.tenantSchema}".enseignant e ON e.id = ue.enseignant_id
      WHERE ue.id = $1
    `, [id]);

    if (result.length === 0) {
      throw new NotFoundException(`Cours (UE) avec l'ID ${id} non trouvé`);
    }

    return result[0];
  }

  /**
   * Affecter un enseignant à un cours (UE)
   */
  async affecterEnseignantCours(data: {
    ueId: string;
    enseignantId: string;
    anneeAcademiqueId: string;
    typeSeance: 'CM' | 'TD' | 'TP';
    volumePrevu: number;
  }): Promise<any> {
    // Vérifier que l'UE existe
    const ue = await this.query(`
      SELECT id FROM "${this.tenantSchema}".unite_enseignement WHERE id = $1
    `, [data.ueId]);

    if (ue.length === 0) {
      throw new NotFoundException(`Cours (UE) avec l'ID ${data.ueId} non trouvé`);
    }

    // Vérifier que l'enseignant existe
    const enseignant = await this.query(`
      SELECT id FROM "${this.tenantSchema}".enseignant WHERE id = $1
    `, [data.enseignantId]);

    if (enseignant.length === 0) {
      throw new NotFoundException(`Enseignant avec l'ID ${data.enseignantId} non trouvé`);
    }

    // Créer l'affectation
    const result = await this.query(`
      INSERT INTO "${this.tenantSchema}".affectation_cours (
        enseignant_id, ue_id, annee_academique_id, type_seance, volume_prevu, volume_realise, created_at
      ) VALUES ($1, $2, $3, $4, $5, 0, NOW())
      RETURNING *
    `, [data.enseignantId, data.ueId, data.anneeAcademiqueId, data.typeSeance, data.volumePrevu]);

    this.logger.log(`Enseignant ${data.enseignantId} affecté au cours ${data.ueId}`);
    return result[0];
  }

  /**
   * Lister les affectations de cours
   */
  async getAffectationsCours(filters?: {
    enseignantId?: string;
    ueId?: string;
    anneeAcademiqueId?: string;
  }): Promise<any[]> {
    let query = `
      SELECT 
        ac.*,
        ue.code as ue_code,
        ue.intitule as ue_intitule,
        ue.credits_ects,
        e.nom as enseignant_nom,
        e.prenom as enseignant_prenom,
        aa.libelle as annee_academique,
        p.nom as parcours_nom
      FROM "${this.tenantSchema}".affectation_cours ac
      JOIN "${this.tenantSchema}".unite_enseignement ue ON ue.id = ac.ue_id
      JOIN "${this.tenantSchema}".enseignant e ON e.id = ac.enseignant_id
      JOIN "${this.tenantSchema}".annee_academique aa ON aa.id = ac.annee_academique_id
      JOIN "${this.tenantSchema}".parcours p ON p.id = ue.parcours_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.enseignantId) {
      query += ` AND ac.enseignant_id = $${++paramCount}`;
      params.push(filters.enseignantId);
    }
    if (filters?.ueId) {
      query += ` AND ac.ue_id = $${++paramCount}`;
      params.push(filters.ueId);
    }
    if (filters?.anneeAcademiqueId) {
      query += ` AND ac.annee_academique_id = $${++paramCount}`;
      params.push(filters.anneeAcademiqueId);
    }

    query += ` ORDER BY aa.date_debut DESC, ue.code`;

    return this.query(query, params);
  }

  /**
   * Supprimer une affectation de cours
   */
  async supprimerAffectationCours(id: string): Promise<void> {
    const result = await this.query(`
      DELETE FROM "${this.tenantSchema}".affectation_cours
      WHERE id = $1
      RETURNING id
    `, [id]);

    if (result.length === 0) {
      throw new NotFoundException(`Affectation avec l'ID ${id} non trouvée`);
    }

    this.logger.log(`Affectation de cours supprimée: ${id}`);
  }

  /**
   * Obtenir les parcours disponibles pour créer des cours
   */
  async getParcoursDisponibles(): Promise<any[]> {
    return this.query(`
      SELECT 
        p.*,
        ne.nom as niveau_etude_nom,
        ne.code as niveau_etude_code,
        (SELECT COUNT(*) FROM "${this.tenantSchema}".unite_enseignement ue WHERE ue.parcours_id = p.id AND ue.actif = TRUE) as nb_cours
      FROM "${this.tenantSchema}".parcours p
      LEFT JOIN "${this.tenantSchema}".niveau_etude ne ON ne.id = p.niveau_etude_id
      WHERE p.actif = TRUE
      ORDER BY ne.ordre, p.nom
    `);
  }

  /**
   * Obtenir les enseignants disponibles pour affectation
   */
  async getEnseignantsDisponibles(): Promise<any[]> {
    return this.query(`
      SELECT 
        e.*,
        u.email,
        u.telephone,
        d.nom as departement_nom,
        (SELECT COUNT(*) FROM "${this.tenantSchema}".affectation_cours ac WHERE ac.enseignant_id = e.id) as nb_affectations,
        (SELECT COUNT(*) FROM "${this.tenantSchema}".unite_enseignement ue WHERE ue.enseignant_id = e.id) as nb_cours_responsable
      FROM "${this.tenantSchema}".enseignant e
      JOIN "${this.tenantSchema}".utilisateur u ON u.id = e.utilisateur_id
      LEFT JOIN "${this.tenantSchema}".departement d ON d.id = e.departement_id
      WHERE e.actif = TRUE AND u.actif = TRUE
      ORDER BY e.nom, e.prenom
    `);
  }
}
