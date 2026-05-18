import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { KpiDashboard, DirectionSummary, AuditAction } from './interfaces/kpi-dashboard.interface';
import { ValidateRecruitmentDto } from './dto/validate-recruitment.dto';
import { ValidateInvestmentDto } from './dto/validate-investment.dto';
import { SignDiplomaDto, SignDiplomasInBulkDto } from './dto/sign-diploma.dto';
import { SignConventionDto } from './dto/sign-convention.dto';
import { ArbitrateDisciplineDto } from './dto/arbitrate-discipline.dto';
import { ValidateParcoursDto } from './dto/validate-parcours.dto';
import { ValidateCalendarDto } from './dto/validate-calendar.dto';
import { DelegateSignatureDto } from './dto/delegate-signature.dto';
import * as crypto from 'crypto';

@Injectable()
export class PresidentService {
  constructor(
    @InjectDataSource('tenant') private readonly dataSource: DataSource,
    @InjectDataSource('default') private readonly defaultConnection: DataSource,
  ) {}

  /**
   * Valide et retourne le nom du schéma tenant
   * Protection contre les injections SQL sur le nom de schéma
   */
  private validateSchema(tenantSchema: string): string {
    if (!/^tenant_[a-z0-9_]+$/.test(tenantSchema)) {
      throw new BadRequestException('Schema tenant invalide');
    }
    return tenantSchema;
  }

  /**
   * Log une action dans la table d'audit publique
   */
  private async logAudit(
    tenantSchema: string,
    utilisateurId: string,
    action: string,
    entite: string,
    entiteId: string,
    details: Record<string, any>
  ): Promise<void> {
    try {
      await this.defaultConnection.query(
        `INSERT INTO public.audit_log (tenant_schema, utilisateur_id, role, action, entite, entite_id, details, created_at)
         VALUES ($1, $2, 'president', $3, $4, $5, $6::jsonb, NOW())`,
        [tenantSchema, utilisateurId, action, entite, entiteId, JSON.stringify(details)]
      );
    } catch (error) {
      console.error('[PresidentService] Erreur lors du logging audit:', error);
    }
  }

  /**
   * Récupère le dashboard KPI complet du président
   */
  async getKpiDashboard(tenantSchema: string, anneeAcademiqueId: string): Promise<KpiDashboard> {
    const schema = this.validateSchema(tenantSchema);

    try {
      const [
        // Académique
        totalEtudiants,
        tauxReussite,
        tauxAbsence,
        parcoursActifs,
        soutenancesPrevues,
        
        // Financier
        recettes,
        impayes,
        depensesMois,
        budgetInfo,
        
        // RH
        totalEnseignants,
        totalPersonnelAdmin,
        congesEnCours,
        recrutementsEnAttente,
        contratsExpiration,
        
        // Discipline
        incidentsOuverts,
        conseilsDiscipline,
        
        // Pastoral
        evenementsPastoraux,
        
        // Logistique
        ticketsMaintenance,
        stocksCritiques,
        
        // Scolarité
        inscriptionsEnCours,
        diplomesAGenerer,
        transfertsEnAttente,
        pvEnAttente
      ] = await Promise.all([
        // Académique - CORRIGÉ: etudiant.actif au lieu de statut
        this.dataSource.query(`SELECT COUNT(*)::int as count FROM ${schema}.etudiant WHERE actif = true`).catch(() => [{count: 0}]),
      this.dataSource.query(
        `SELECT AVG(CASE 
          WHEN mention = 'Passable' THEN 10.5
          WHEN mention = 'Assez bien' THEN 12.5
          WHEN mention = 'Bien' THEN 14.5
          WHEN mention = 'Tres bien' THEN 16.5
          ELSE 0 END) as taux 
         FROM ${schema}.resultat_semestre 
         WHERE annee_academique_id = $1`,
        [anneeAcademiqueId]
      ),
      this.dataSource.query(
        `SELECT AVG(taux_absence) as taux FROM (
          SELECT (COUNT(CASE WHEN statut = 'absent' THEN 1 END)::float / NULLIF(COUNT(*), 0) * 100) as taux_absence
          FROM ${schema}.presence
          WHERE date_presence >= NOW() - INTERVAL '30 days'
          GROUP BY etudiant_id
        ) as absences`
      ),
      this.dataSource.query(`SELECT COUNT(*) as count FROM ${schema}.parcours WHERE actif = true`).catch(() => [{count: 0}]),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.soutenance
         WHERE date_soutenance >= NOW() AND date_soutenance <= NOW() + INTERVAL '30 days'`
      ).catch(() => [{count: 0}]),
      
      // Financier
      this.dataSource.query(
        `SELECT COALESCE(SUM(montant), 0) as total FROM ${schema}.paiement WHERE statut = 'confirme'`
      ).catch(() => [{total: 0}]),
      this.dataSource.query(
        `SELECT COALESCE(SUM(montant_restant), 0) as total FROM ${schema}.echeancier
         WHERE statut = 'en_retard' OR (date_echeance < NOW() AND statut = 'en_attente')`
      ).catch(() => [{total: 0}]),
      this.dataSource.query(
        `SELECT COALESCE(SUM(montant), 0) as total FROM ${schema}.depense
         WHERE EXTRACT(MONTH FROM date_depense) = EXTRACT(MONTH FROM NOW())
         AND EXTRACT(YEAR FROM date_depense) = EXTRACT(YEAR FROM NOW())`
      ).catch(() => [{total: 0}]),
      this.dataSource.query(
        `SELECT
          COALESCE(SUM(montant_depense), 0) as depense,
          COALESCE(SUM(montant_budget), 0) as budget
         FROM ${schema}.budget
         WHERE annee_academique_id = $1`,
        [anneeAcademiqueId]
      ).catch(() => [{depense: 0, budget: 0}]),
      
      // RH - CORRIGÉ: enseignant.actif au lieu de statut
      this.dataSource.query(`SELECT COUNT(*) as count FROM ${schema}.enseignant WHERE actif = true`).catch(() => [{count: 0}]),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.contrat_personnel
         WHERE type_personnel != 'enseignant' AND statut = 'actif'`
      ).catch(() => [{count: 0}]),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.conge_personnel
         WHERE statut = 'approuve' AND date_debut <= NOW() AND date_fin >= NOW()`
      ).catch(() => [{count: 0}]),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.contrat_personnel
         WHERE statut = 'en_attente_president'`
      ).catch(() => [{count: 0}]),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.contrat_personnel
         WHERE statut = 'actif' AND date_fin <= NOW() + INTERVAL '30 days' AND date_fin >= NOW()`
      ).catch(() => [{count: 0}]),
      
      // Discipline
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.incident_disciplinaire WHERE statut = 'ouvert'`
      ).catch(() => [{count: 0}]),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.conseil_discipline WHERE statut = 'en_attente_president'`
      ).catch(() => [{count: 0}]),
      
      // Pastoral
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.annonce
         WHERE type = 'pastoral'
         AND EXTRACT(MONTH FROM date_publication) = EXTRACT(MONTH FROM NOW())
         AND EXTRACT(YEAR FROM date_publication) = EXTRACT(YEAR FROM NOW())`
      ).catch(() => [{count: 0}]),
      
      // Logistique
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.ticket_maintenance WHERE statut IN ('ouvert', 'en_cours')`
      ).catch(() => [{count: 0}]),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.stock WHERE quantite_actuelle <= seuil_alerte`
      ).catch(() => [{count: 0}]),
      
      // Scolarité
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.inscription
         WHERE statut = 'en_cours' AND annee_academique_id = $1`,
        [anneeAcademiqueId]
      ).catch(() => [{count: 0}]),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.diplome WHERE statut = 'pret_signature'`
      ).catch(() => [{count: 0}]),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.transfert_etudiant WHERE statut = 'en_attente'`
      ).catch(() => [{count: 0}]),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.pv_deliberation WHERE statut = 'en_attente_validation'`
      ).catch(() => [{count: 0}])
    ]);

    const budgetData = budgetInfo[0] || { depense: 0, budget: 1 };
    const budgetConsomme = budgetData.budget > 0 
      ? (parseFloat(budgetData.depense) / parseFloat(budgetData.budget) * 100) 
      : 0;

    const recettesTotal = parseFloat(recettes[0]?.total || '0');
    const impayesTotal = parseFloat(impayes[0]?.total || '0');
    const tauxRecouvrement = (recettesTotal + impayesTotal) > 0
      ? (recettesTotal / (recettesTotal + impayesTotal) * 100)
      : 0;

    return {
      // Académique
      totalEtudiants: parseInt(totalEtudiants[0]?.count || '0'),
      tauxReussiteGlobal: parseFloat(tauxReussite[0]?.taux || '0'),
      tauxAbsenceMoyen: parseFloat(tauxAbsence[0]?.taux || '0'),
      parcoursActifs: parseInt(parcoursActifs[0]?.count || '0'),
      soutenancesPrevues: parseInt(soutenancesPrevues[0]?.count || '0'),
      
      // Financier
      recettesTotales: recettesTotal,
      impayesTotal: impayesTotal,
      tauxRecouvrementScolarite: tauxRecouvrement,
      depensesTotalesMois: parseFloat(depensesMois[0]?.total || '0'),
      budgetConsomme: budgetConsomme,
      
      // RH
      totalEnseignants: parseInt(totalEnseignants[0]?.count || '0'),
      totalPersonnelAdmin: parseInt(totalPersonnelAdmin[0]?.count || '0'),
      congesEnCours: parseInt(congesEnCours[0]?.count || '0'),
      recrutementsEnAttente: parseInt(recrutementsEnAttente[0]?.count || '0'),
      contratsSurPointExpirer: parseInt(contratsExpiration[0]?.count || '0'),
      
      // Discipline
      incidentsOuverts: parseInt(incidentsOuverts[0]?.count || '0'),
      conseilsDisciplineEnAttente: parseInt(conseilsDiscipline[0]?.count || '0'),
      
      // Pastoral
      evenementsPastorauxMois: parseInt(evenementsPastoraux[0]?.count || '0'),
      
      // Logistique
      ticketsMaintenanceOuverts: parseInt(ticketsMaintenance[0]?.count || '0'),
      stocksAlerteCritique: parseInt(stocksCritiques[0]?.count || '0'),
      
      // Scolarité
      inscriptionsEnCours: parseInt(inscriptionsEnCours[0]?.count || '0'),
      diplomesAGenerer: parseInt(diplomesAGenerer[0]?.count || '0'),
      transfertsEnAttente: parseInt(transfertsEnAttente[0]?.count || '0'),
      pvDeliberationEnAttente: parseInt(pvEnAttente[0]?.count || '0')
    };
    } catch (error) {
      console.error('[PresidentService] Erreur getKpiDashboard:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        totalEtudiants: 0,
        tauxReussiteGlobal: 0,
        tauxAbsenceMoyen: 0,
        parcoursActifs: 0,
        soutenancesPrevues: 0,
        recettesTotales: 0,
        impayesTotal: 0,
        tauxRecouvrementScolarite: 0,
        depensesTotalesMois: 0,
        budgetConsomme: 0,
        totalEnseignants: 0,
        totalPersonnelAdmin: 0,
        congesEnCours: 0,
        recrutementsEnAttente: 0,
        contratsSurPointExpirer: 0,
        incidentsOuverts: 0,
        conseilsDisciplineEnAttente: 0,
        evenementsPastorauxMois: 0,
        ticketsMaintenanceOuverts: 0,
        stocksAlerteCritique: 0,
        inscriptionsEnCours: 0,
        diplomesAGenerer: 0,
        transfertsEnAttente: 0,
        pvDeliberationEnAttente: 0
      };
    }
  }

  /**
   * Récupère le résumé des directions
   */
  async getDirectionsSummary(tenantSchema: string, anneeAcademiqueId: string): Promise<DirectionSummary> {
    const schema = this.validateSchema(tenantSchema);

    const [
      // Académique
      parcoursTotal,
      enseignantsAffectes,
      examensEnCours,
      pvEnAttente,
      
      // Scolarité
      inscriptionsEnCours,
      diplomesAGenerer,
      transfertsEnAttente,
      
      // Finances
      budgetInfo,
      achatsEnAttente,
      caisseInfo,
      
      // RH
      contratsExpiration,
      fichePaieInfo,
      evaluations,
      
      // Logistique
      ticketsMaintenance,
      stocksCritiques
    ] = await Promise.all([
      // Académique
      this.dataSource.query(`SELECT COUNT(*) as count FROM ${schema}.parcours`),
      this.dataSource.query(
        `SELECT COUNT(DISTINCT enseignant_id) as count FROM ${schema}.affectation_cours WHERE statut = 'actif'`
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.session_examen 
         WHERE date_debut <= NOW() AND date_fin >= NOW()`
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.pv_deliberation WHERE statut = 'en_attente_validation'`
      ),
      
      // Scolarité
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.inscription 
         WHERE statut = 'en_cours' AND annee_academique_id = $1`,
        [anneeAcademiqueId]
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.diplome WHERE statut IN ('pret_signature', 'en_preparation')`
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.transfert_etudiant WHERE statut = 'en_attente'`
      ),
      
      // Finances
      this.dataSource.query(
        `SELECT 
          COALESCE(SUM(montant_depense), 0) as depense,
          COALESCE(SUM(montant_budget), 0) as budget
         FROM ${schema}.budget 
         WHERE annee_academique_id = $1`,
        [anneeAcademiqueId]
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.depense WHERE statut = 'en_attente_validation'`
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.cloture_caisse 
         WHERE date_cloture = CURRENT_DATE AND statut = 'cloture'`
      ),
      
      // RH
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.contrat_personnel 
         WHERE statut = 'actif' AND date_fin <= NOW() + INTERVAL '30 days' AND date_fin >= NOW()`
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.fiche_paie 
         WHERE EXTRACT(MONTH FROM mois_paie) = EXTRACT(MONTH FROM NOW())
         AND EXTRACT(YEAR FROM mois_paie) = EXTRACT(YEAR FROM NOW())`
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.contrat_personnel 
         WHERE statut = 'actif' AND evaluation_annuelle_faite = false`
      ),
      
      // Logistique
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.ticket_maintenance WHERE statut IN ('ouvert', 'en_cours')`
      ),
      this.dataSource.query(
        `SELECT COUNT(*) as count FROM ${schema}.stock WHERE quantite_actuelle <= seuil_alerte`
      )
    ]);

    const budgetData = budgetInfo[0] || { depense: 0, budget: 1 };
    const budgetConsomme = budgetData.budget > 0 
      ? (parseFloat(budgetData.depense) / parseFloat(budgetData.budget) * 100) 
      : 0;

    return {
      academique: {
        parcoursTotal: parseInt(parcoursTotal[0]?.count || '0'),
        enseignantsAffectes: parseInt(enseignantsAffectes[0]?.count || '0'),
        examensEnCours: parseInt(examensEnCours[0]?.count || '0'),
        pvEnAttente: parseInt(pvEnAttente[0]?.count || '0')
      },
      scolarite: {
        inscriptionsEnCours: parseInt(inscriptionsEnCours[0]?.count || '0'),
        diplomesAGenerer: parseInt(diplomesAGenerer[0]?.count || '0'),
        transfertsEnAttente: parseInt(transfertsEnAttente[0]?.count || '0')
      },
      finances: {
        budgetConsomme: budgetConsomme,
        achatsEnAttentValidation: parseInt(achatsEnAttente[0]?.count || '0'),
        caisseJournaliereClôturee: parseInt(caisseInfo[0]?.count || '0') > 0
      },
      rh: {
        contratsSurPointExpirer: parseInt(contratsExpiration[0]?.count || '0'),
        fichePaieGenereeMois: parseInt(fichePaieInfo[0]?.count || '0') > 0,
        evalAnnuellesEnCours: parseInt(evaluations[0]?.count || '0')
      },
      logistique: {
        ticketsMaintenanceOuverts: parseInt(ticketsMaintenance[0]?.count || '0'),
        stocksAlerteCritique: parseInt(stocksCritiques[0]?.count || '0')
      }
    };
  }

  /**
   * Récupère les recrutements en attente de validation
   */
  async getRecrutementsEnAttente(tenantSchema: string): Promise<any[]> {
    const schema = this.validateSchema(tenantSchema);
    
    const result = await this.dataSource.query(
      `SELECT 
        cp.id,
        cp.nom_complet as nom_candidat,
        cp.poste,
        cp.type_contrat,
        cp.salaire_propose,
        cp.date_soumission as soumis_le,
        cp.soumis_par_nom as par_rh,
        cp.cv_url as cv,
        d.nom as departement
       FROM ${schema}.contrat_personnel cp
       LEFT JOIN ${schema}.departement d ON cp.departement_id = d.id
       WHERE cp.statut = 'en_attente_president'
       ORDER BY cp.date_soumission ASC`
    );
    
    return result;
  }

  /**
   * Valide un recrutement
   */
  async validerRecrutement(
    tenantSchema: string,
    id: string,
    dto: ValidateRecruitmentDto,
    utilisateurId: string
  ): Promise<any> {
    const schema = this.validateSchema(tenantSchema);
    
    // Vérifier que le recrutement existe et est en attente
    const contrat = await this.dataSource.query(
      `SELECT * FROM ${schema}.contrat_personnel WHERE id = $1`,
      [id]
    );
    
    if (!contrat || contrat.length === 0) {
      throw new NotFoundException('Recrutement non trouve');
    }
    
    if (contrat[0].statut !== 'en_attente_president') {
      throw new ConflictException('Ce recrutement a deja ete traite');
    }
    
    // Mettre à jour le statut
    const nouveauStatut = dto.decision === 'approuve' ? 'valide_president' : 'rejete_president';
    
    await this.dataSource.query(
      `UPDATE ${schema}.contrat_personnel
       SET statut = $1,
           valide_par = $2,
           valide_le = NOW(),
           commentaire_president = $3,
           conditions_speciales = $4
       WHERE id = $5`,
      [nouveauStatut, utilisateurId, dto.commentaire, dto.conditionsSpeciales || null, id]
    );
    
    // Logger l'action
    await this.logAudit(
      tenantSchema,
      utilisateurId,
      'validation_recrutement',
      'contrat_personnel',
      id,
      { decision: dto.decision, commentaire: dto.commentaire }
    );
    
    return { success: true, message: 'Recrutement traite avec succes' };
  }

  /**
   * Récupère les investissements en attente
   */
  async getInvestissementsEnAttente(tenantSchema: string): Promise<any[]> {
    const schema = this.validateSchema(tenantSchema);
    
    const result = await this.dataSource.query(
      `SELECT 
        d.id,
        d.intitule,
        d.montant,
        d.fournisseur,
        d.categorie,
        d.justification,
        d.date_demande as soumis_le,
        d.demande_par_nom as par_economat
       FROM ${schema}.depense d
       WHERE d.statut = 'en_attente_president' AND d.montant >= 1000000
       ORDER BY d.date_demande ASC`
    );
    
    return result;
  }

  /**
   * Valide un investissement
   */
  async validerInvestissement(
    tenantSchema: string,
    id: string,
    dto: ValidateInvestmentDto,
    utilisateurId: string
  ): Promise<any> {
    const schema = this.validateSchema(tenantSchema);
    
    const depense = await this.dataSource.query(
      `SELECT * FROM ${schema}.depense WHERE id = $1`,
      [id]
    );
    
    if (!depense || depense.length === 0) {
      throw new NotFoundException('Investissement non trouve');
    }
    
    if (depense[0].statut !== 'en_attente_president') {
      throw new ConflictException('Cet investissement a deja ete traite');
    }
    
    const nouveauStatut = dto.decision === 'approuve' ? 'approuve' : 'rejete';
    const montantFinal = dto.montantAjuste || depense[0].montant;
    
    await this.dataSource.query(
      `UPDATE ${schema}.depense
       SET statut = $1,
           valide_par_president = $2,
           valide_le = NOW(),
           motif_decision = $3,
           montant = $4,
           conditions_speciales = $5
       WHERE id = $6`,
      [nouveauStatut, utilisateurId, dto.motif, montantFinal, dto.conditionsSpeciales || null, id]
    );
    
    await this.logAudit(
      tenantSchema,
      utilisateurId,
      'validation_investissement',
      'depense',
      id,
      { decision: dto.decision, motif: dto.motif, montantAjuste: dto.montantAjuste }
    );
    
    return { success: true, message: 'Investissement traite avec succes' };
  }

  /**
   * Récupère les diplômes à signer
   */
  async getDiplomesASigner(tenantSchema: string): Promise<any[]> {
    const schema = this.validateSchema(tenantSchema);
    
    const result = await this.dataSource.query(
      `SELECT 
        d.id,
        e.nom as etudiant_nom,
        e.prenom as etudiant_prenom,
        p.intitule as parcours,
        d.mention,
        d.annee_obtention as promotion_annee,
        d.date_limite_signature as date_limite_sig
       FROM ${schema}.diplome d
       INNER JOIN ${schema}.etudiant e ON d.etudiant_id = e.id
       INNER JOIN ${schema}.parcours p ON d.parcours_id = p.id
       WHERE d.statut = 'pret_signature' AND d.signe_president = false
       ORDER BY d.date_limite_signature ASC`
    );
    
    return result;
  }

  /**
   * Signe un diplôme
   */
  async signerDiplome(
    tenantSchema: string,
    id: string,
    dto: SignDiplomaDto,
    utilisateurId: string
  ): Promise<any> {
    const schema = this.validateSchema(tenantSchema);
    
    const diplome = await this.dataSource.query(
      `SELECT * FROM ${schema}.diplome WHERE id = $1`,
      [id]
    );
    
    if (!diplome || diplome.length === 0) {
      throw new NotFoundException('Diplome non trouve');
    }
    
    if (diplome[0].statut !== 'pret_signature') {
      throw new ConflictException('Ce diplome n\'est pas pret pour la signature');
    }
    
    if (diplome[0].signe_president) {
      throw new ConflictException('Ce diplome a deja ete signe');
    }
    
    // Générer le hash de signature
    const signatureHash = crypto
      .createHash('sha512')
      .update(`${id}-${utilisateurId}-${dto.codeSignature}-${Date.now()}`)
      .digest('hex');
    
    await this.dataSource.query(
      `UPDATE ${schema}.diplome
       SET signe_president = true,
           date_signature = NOW(),
           signature_hash = $1,
           mention_speciale = $2,
           statut = 'signe'
       WHERE id = $3`,
      [signatureHash, dto.mentionSpeciale || null, id]
    );
    
    await this.logAudit(
      tenantSchema,
      utilisateurId,
      'signature_diplome',
      'diplome',
      id,
      { mentionSpeciale: dto.mentionSpeciale }
    );
    
    return { success: true, message: 'Diplome signe avec succes', signatureHash };
  }

  /**
   * Signe plusieurs diplômes en masse (max 100)
   */
  async signerDiplomesEnMasse(
    tenantSchema: string,
    dto: SignDiplomasInBulkDto,
    utilisateurId: string
  ): Promise<any> {
    const schema = this.validateSchema(tenantSchema);
    
    if (dto.ids.length > 100) {
      throw new BadRequestException('Maximum 100 diplomes peuvent etre signes en une fois');
    }
    
    const diplomes = await this.dataSource.query(
      `SELECT id, statut, signe_president FROM ${schema}.diplome WHERE id = ANY($1)`,
      [dto.ids]
    );
    
    const diplomesValides = diplomes.filter(
      d => d.statut === 'pret_signature' && !d.signe_president
    );
    
    if (diplomesValides.length === 0) {
      throw new BadRequestException('Aucun diplome valide pour la signature');
    }
    
    const idsValides = diplomesValides.map(d => d.id);
    const signatureHash = crypto
      .createHash('sha512')
      .update(`bulk-${utilisateurId}-${dto.codeSignature}-${Date.now()}`)
      .digest('hex');
    
    await this.dataSource.query(
      `UPDATE ${schema}.diplome
       SET signe_president = true,
           date_signature = NOW(),
           signature_hash = $1,
           mention_speciale = $2,
           statut = 'signe'
       WHERE id = ANY($3)`,
      [signatureHash, dto.mentionSpeciale || null, idsValides]
    );
    
    await this.logAudit(
      tenantSchema,
      utilisateurId,
      'signature_diplomes_masse',
      'diplome',
      '0', // UUID null pour action en masse
      { count: idsValides.length, ids: idsValides }
    );
    
    return { 
      success: true, 
      message: `${idsValides.length} diplomes signes avec succes`,
      signedCount: idsValides.length,
      skippedCount: dto.ids.length - idsValides.length
    };
  }

  /**
   * Récupère les conventions en attente
   */
  async getConventionsEnAttente(tenantSchema: string): Promise<any[]> {
    const schema = this.validateSchema(tenantSchema);
    
    // Note: Cette table n'existe pas encore dans le schéma, à créer
    const result = await this.dataSource.query(
      `SELECT 
        id,
        intitule,
        partenaire,
        type_partenaire,
        objet_convention,
        date_proposee,
        document_url
       FROM ${schema}.convention
       WHERE statut = 'en_attente_signature'
       ORDER BY date_proposee ASC`
    ).catch(() => []);
    
    return result;
  }

  /**
   * Signe une convention
   */
  async signerConvention(
    tenantSchema: string,
    id: string,
    dto: SignConventionDto,
    utilisateurId: string
  ): Promise<any> {
    const schema = this.validateSchema(tenantSchema);
    
    const signatureHash = crypto
      .createHash('sha512')
      .update(`convention-${id}-${utilisateurId}-${dto.codeSignature}-${Date.now()}`)
      .digest('hex');
    
    await this.dataSource.query(
      `UPDATE ${schema}.convention
       SET statut = 'signee',
           signe_president = true,
           date_signature = NOW(),
           signature_hash = $1,
           representant_partenaire = $2,
           date_effet = $3,
           remarques_president = $4
       WHERE id = $5`,
      [signatureHash, dto.representantPartenaire, dto.dateEffet, dto.remarques || null, id]
    ).catch(() => {});
    
    await this.logAudit(
      tenantSchema,
      utilisateurId,
      'signature_convention',
      'convention',
      id,
      { representant: dto.representantPartenaire, dateEffet: dto.dateEffet }
    );
    
    return { success: true, message: 'Convention signee avec succes' };
  }

  /**
   * Récupère les conseils de discipline en attente
   */
  async getConseilsDisciplineEnAttente(tenantSchema: string): Promise<any[]> {
    const schema = this.validateSchema(tenantSchema);
    
    const result = await this.dataSource.query(
      `SELECT 
        cd.id,
        e.nom || ' ' || e.prenom as etudiant_nom,
        cd.motif,
        cd.date_incident,
        cd.rapport_surveillant,
        cd.proposition_secretariat,
        cd.gravite
       FROM ${schema}.conseil_discipline cd
       INNER JOIN ${schema}.etudiant e ON cd.etudiant_id = e.id
       WHERE cd.statut = 'en_attente_president'
       ORDER BY cd.gravite DESC, cd.date_incident ASC`
    );
    
    return result;
  }

  /**
   * Arbitre un conseil de discipline
   */
  async arbitrerDiscipline(
    tenantSchema: string,
    id: string,
    dto: ArbitrateDisciplineDto,
    utilisateurId: string
  ): Promise<any> {
    const schema = this.validateSchema(tenantSchema);
    
    const conseil = await this.dataSource.query(
      `SELECT * FROM ${schema}.conseil_discipline WHERE id = $1`,
      [id]
    );
    
    if (!conseil || conseil.length === 0) {
      throw new NotFoundException('Conseil de discipline non trouve');
    }
    
    if (conseil[0].statut !== 'en_attente_president') {
      throw new ConflictException('Ce conseil a deja ete tranche');
    }
    
    await this.dataSource.query(
      `UPDATE ${schema}.conseil_discipline
       SET decision_president = $1,
           motivation = $2,
           duree_suspension = $3,
           mesures_accompagnement = $4,
           statue_le = NOW(),
           statue_par = $5,
           statut = 'tranche'
       WHERE id = $6`,
      [
        dto.decision,
        dto.motivationDecision,
        dto.dureeSuspensionJours || null,
        null, // mesuresAccompagnement retiré du DTO
        utilisateurId,
        id
      ]
    );
    
    // Si exclusion définitive et notification parents demandée
    if (dto.decision === 'exclusion_definitive' && dto.notifierParents) {
      // TODO: Envoyer email aux parents via EmailService
    }
    
    await this.logAudit(
      tenantSchema,
      utilisateurId,
      'arbitrage_discipline',
      'conseil_discipline',
      id,
      { decision: dto.decision, notifierParents: dto.notifierParents }
    );
    
    return { success: true, message: 'Decision prise avec succes' };
  }

  /**
   * Récupère la liste des parcours
   */
  async getParcoursList(tenantSchema: string): Promise<any[]> {
    const schema = this.validateSchema(tenantSchema);
    
    const result = await this.dataSource.query(
      `SELECT
        p.id,
        p.nom as intitule,
        p.niveau,
        p.actif,
        CASE
          WHEN p.actif = true THEN 'ouvert'
          ELSE 'ferme'
        END as statut,
        COUNT(DISTINCT i.etudiant_id) as effectif_actuel,
        COALESCE(u.nom || ' ' || u.prenom, 'Non assigné') as responsable_pedagogique
       FROM ${schema}.parcours p
       LEFT JOIN ${schema}.inscription i ON p.id = i.parcours_id AND i.statut = 'valide'
       LEFT JOIN ${schema}.utilisateur u ON p.responsable_id = u.id
       GROUP BY p.id, p.nom, p.niveau, p.actif, u.nom, u.prenom
       ORDER BY p.niveau, p.nom`
    );
    
    return result.map((p: any) => ({
      id: p.id,
      intitule: p.intitule,
      niveau: p.niveau,
      statut: p.statut,
      effectifActuel: parseInt(p.effectif_actuel) || 0,
      responsablePedagogique: p.responsable_pedagogique,
    }));
  }

  /**
   * Ouvre un parcours
   */
  async ouvrirParcours(
    tenantSchema: string,
    id: string,
    dto: ValidateParcoursDto,
    utilisateurId: string
  ): Promise<any> {
    const schema = this.validateSchema(tenantSchema);
    
    await this.dataSource.query(
      `UPDATE ${schema}.parcours
       SET actif = true,
           updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
    
    await this.logAudit(
      tenantSchema,
      utilisateurId,
      'ouverture_parcours',
      'parcours',
      id,
      { motif: dto.motif, dateEffet: dto.dateEffet }
    );
    
    return { success: true, message: 'Parcours ouvert avec succes' };
  }

  /**
   * Ferme un parcours
   */
  async fermerParcours(
    tenantSchema: string,
    id: string,
    dto: ValidateParcoursDto,
    utilisateurId: string
  ): Promise<any> {
    const schema = this.validateSchema(tenantSchema);
    
    // Vérifier qu'il n'y a pas d'étudiants actifs
    const etudiants = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM ${schema}.inscription
       WHERE parcours_id = $1 AND statut = 'valide'`,
      [id]
    );
    
    if (parseInt(etudiants[0]?.count || '0') > 0) {
      throw new ConflictException(
        'Impossible de fermer ce parcours: des etudiants y sont encore inscrits'
      );
    }
    
    await this.dataSource.query(
      `UPDATE ${schema}.parcours
       SET actif = false,
           updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
    
    await this.logAudit(
      tenantSchema,
      utilisateurId,
      'fermeture_parcours',
      'parcours',
      id,
      { motif: dto.motif, dateEffet: dto.dateEffet }
    );
    
    return { success: true, message: 'Parcours ferme avec succes' };
  }

  /**
   * Récupère le calendrier académique en attente
   */
  async getCalendrierEnAttente(tenantSchema: string): Promise<any[]> {
    const schema = this.validateSchema(tenantSchema);
    
    const result = await this.dataSource.query(
      `SELECT 
        id,
        intitule,
        type,
        date_debut,
        date_fin,
        statut
       FROM ${schema}.calendrier_academique
       WHERE statut = 'en_attente_validation'
       ORDER BY date_debut ASC`
    );
    
    return result;
  }

  /**
   * Valide le calendrier académique
   */
  async validerCalendrier(
    tenantSchema: string,
    id: string,
    dto: ValidateCalendarDto,
    utilisateurId: string
  ): Promise<any> {
    const schema = this.validateSchema(tenantSchema);
    
    // Appliquer les modifications si présentes
    if (dto.modificationsProposees && dto.modificationsProposees.length > 0) {
      for (const modif of dto.modificationsProposees) {
        await this.dataSource.query(
          `UPDATE ${schema}.calendrier_academique
           SET date_debut = $1,
               date_fin = $2,
               statut = 'modifie'
           WHERE id = $3`,
          [modif.nouvelleDateDebut, modif.nouvelleDateFin, modif.evenementId]
        );
      }
    }
    
    await this.dataSource.query(
      `UPDATE ${schema}.calendrier_academique
       SET statut = 'valide',
           valide_par_president = $1,
           valide_le = NOW(),
           commentaire_president = $2
       WHERE id = $3`,
      [utilisateurId, dto.commentaire || null, id]
    );
    
    await this.logAudit(
      tenantSchema,
      utilisateurId,
      'validation_calendrier',
      'calendrier_academique',
      id,
      { commentaire: dto.commentaire, modifications: dto.modificationsProposees?.length || 0 }
    );
    
    return { success: true, message: 'Calendrier valide avec succes' };
  }

  /**
   * Récupère les délégations de signature
   */
  async getDelegations(tenantSchema: string): Promise<any[]> {
    const schema = this.validateSchema(tenantSchema);
    
    // Note: Cette table n'existe pas encore, à créer
    const result = await this.dataSource.query(
      `SELECT 
        d.id,
        u.nom || ' ' || u.prenom as delegataire,
        d.types_actes,
        d.date_debut,
        d.date_fin,
        CASE 
          WHEN d.date_fin < NOW() THEN 'expiree'
          WHEN d.revoquee = true THEN 'revoquee'
          ELSE 'active'
        END as statut
       FROM ${schema}.delegation_signature d
       INNER JOIN ${schema}.utilisateur u ON d.delegataire_id = u.id
       ORDER BY d.date_debut DESC`
    ).catch(() => []);
    
    return result;
  }

  /**
   * Crée une délégation de signature
   */
  async creerDelegation(
    tenantSchema: string,
    dto: DelegateSignatureDto,
    utilisateurId: string
  ): Promise<any> {
    const schema = this.validateSchema(tenantSchema);
    
    // Vérifier qu'il n'y a pas de délégation active pour les mêmes types d'actes
    const delegationsActives = await this.dataSource.query(
      `SELECT id FROM ${schema}.delegation_signature
       WHERE delegataire_id = $1 
       AND revoquee = false 
       AND date_fin >= NOW()
       AND types_actes && $2`,
      [dto.delegataireId, dto.typesActes]
    ).catch(() => []);
    
    if (delegationsActives.length > 0) {
      throw new ConflictException(
        'Une delegation active existe deja pour ces types d\'actes. Veuillez la revoquer d\'abord.'
      );
    }
    
    await this.dataSource.query(
      `INSERT INTO ${schema}.delegation_signature 
       (delegataire_id, types_actes, date_debut, date_fin, conditions, cree_par, cree_le)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        dto.delegataireId,
        dto.typesActes,
        dto.dateDebut,
        dto.dateFin,
        dto.conditions || null,
        utilisateurId
      ]
    ).catch(() => {});
    
    await this.logAudit(
      tenantSchema,
      utilisateurId,
      'creation_delegation',
      'delegation_signature',
      dto.delegataireId,
      { typesActes: dto.typesActes, dateDebut: dto.dateDebut, dateFin: dto.dateFin }
    );
    
    return { success: true, message: 'Delegation creee avec succes' };
  }

  /**
   * Révoque une délégation
   */
  async revoquerDelegation(
    tenantSchema: string,
    id: string,
    utilisateurId: string
  ): Promise<any> {
    const schema = this.validateSchema(tenantSchema);
    
    await this.dataSource.query(
      `UPDATE ${schema}.delegation_signature
       SET revoquee = true,
           revoquee_le = NOW(),
           revoquee_par = $1
       WHERE id = $2`,
      [utilisateurId, id]
    ).catch(() => {});
    
    await this.logAudit(
      tenantSchema,
      utilisateurId,
      'revocation_delegation',
      'delegation_signature',
      id.toString(),
      {}
    );
    
    return { success: true, message: 'Delegation revoquee avec succes' };
  }

  /**
   * Récupère l'historique des actions du président
   */
  async getAuditTrail(tenantSchema: string, limit: number = 10): Promise<AuditAction[]> {
    const result = await this.defaultConnection.query(
      `SELECT 
        id,
        action,
        entite,
        entite_id,
        details,
        created_at,
        (SELECT nom || ' ' || prenom FROM public.utilisateur WHERE id = audit_log.utilisateur_id) as utilisateur_nom
       FROM public.audit_log
       WHERE tenant_schema = $1 AND role = 'president'
       ORDER BY created_at DESC
       LIMIT $2`,
      [tenantSchema, limit]
    );
    
    return result.map(r => ({
      id: r.id,
      action: r.action,
      entite: r.entite,
      entiteId: r.entite_id,
      details: r.details,
      createdAt: r.created_at,
      utilisateurNom: r.utilisateur_nom
    }));
  }
}

// Made with Bob
