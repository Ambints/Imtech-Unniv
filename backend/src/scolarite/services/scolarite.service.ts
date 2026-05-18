import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Etudiant } from '../entities/etudiant.entity';
import { Inscription } from '../entities/inscription.entity';
import { Deliberation } from '../entities/deliberation.entity';
import { Diplome } from '../entities/diplome.entity';
import { VerrouillageNotes } from '../entities/verrouillage-notes.entity';
import {
  generateCertificatInscription,
  generateAttestationStage,
  generateAttestationReussite,
  TenantInfo
} from '../utils/pdf-generator.utils';

@Injectable()
export class ScolariteService {
  constructor(
    @InjectRepository(Etudiant, 'tenant')
    private readonly etudiantRepo: Repository<Etudiant>,
    @InjectRepository(Inscription, 'tenant')
    private readonly inscriptionRepo: Repository<Inscription>,
    @InjectRepository(Deliberation, 'tenant')
    private readonly deliberationRepo: Repository<Deliberation>,
    @InjectRepository(Diplome, 'tenant')
    private readonly diplomeRepo: Repository<Diplome>,
    @InjectRepository(VerrouillageNotes, 'tenant')
    private readonly verrouillageRepo: Repository<VerrouillageNotes>,
    private dataSource: DataSource,
  ) {}

  /**
   * Récupère les statistiques générales de la scolarité
   */
  async getDashboardStats(tenantSchema: string) {
    try {
      const schema = this.validateSchema(tenantSchema);
      
      // Statistiques générales
      const totalEtudiants = await this.etudiantRepo.count({ where: { actif: true } });
      const totalInscriptions = await this.inscriptionRepo.count();
      const totalDeliberations = await this.deliberationRepo.count();
      const totalDiplomes = await this.diplomeRepo.count();

      // Statistiques par année académique
      const statsByYear = await this.dataSource.query(`
        SELECT
          aa.libelle as annee_academique,
          COUNT(*) as total_inscriptions,
          COUNT(CASE WHEN i.statut = 'valide' THEN 1 END) as inscriptions_valides,
          COUNT(CASE WHEN i.statut = 'en_attente' THEN 1 END) as inscriptions_en_attente
        FROM ${schema}.inscription i
        LEFT JOIN ${schema}.annee_academique aa ON i.annee_academique_id = aa.id
        GROUP BY aa.libelle
        ORDER BY aa.libelle DESC
        LIMIT 5
      `);

      // Statistiques des notes
      const notesStats = await this.dataSource.query(`
        SELECT
          AVG(rs.moyenne_generale) as moyenne_generale,
          COUNT(CASE WHEN rs.moyenne_generale >= 10 THEN 1 END) as admis,
          COUNT(CASE WHEN rs.moyenne_generale < 10 THEN 1 END) as ajournes,
          COUNT(*) as total_etudes
        FROM ${schema}.resultat_semestre rs
        WHERE rs.deliberation_id IN (
          SELECT d.id FROM ${schema}.deliberation d
          JOIN ${schema}.session_examen se ON d.session_examen_id = se.id
          ORDER BY se.created_at DESC
          LIMIT 1
        )
      `);

      // Dernières activités
      const recentInscriptions = await this.inscriptionRepo.find({
        relations: ['etudiant'],
        order: { createdAt: 'DESC' },
        take: 5
      });

      const recentDeliberations = await this.deliberationRepo.find({
        relations: ['sessionExamen'],
        order: { createdAt: 'DESC' },
        take: 5
      });

      return {
        overview: {
          totalEtudiants,
          totalInscriptions,
          totalDeliberations,
          totalDiplomes
        },
        statsByYear: statsByYear.map((stat: any) => ({
          anneeAcademique: stat.annee_academique,
          totalInscriptions: parseInt(stat.total_inscriptions),
          inscriptionsValides: parseInt(stat.inscriptions_valides),
          inscriptionsEnAttente: parseInt(stat.inscriptions_en_attente)
        })),
        notesStats: notesStats[0] ? {
          moyenneGenerale: parseFloat(notesStats[0].moyenne_generale) || 0,
          admis: parseInt(notesStats[0].admis) || 0,
          ajournes: parseInt(notesStats[0].ajournes) || 0,
          totalEtudes: parseInt(notesStats[0].total_etudes) || 0
        } : null,
        recentActivities: {
          inscriptions: recentInscriptions,
          deliberations: recentDeliberations
        }
      };
    } catch (error: any) {
      console.error('Erreur dashboard scolarite:', error);
      throw new BadRequestException('Impossible de récupérer les statistiques de scolarité');
    }
  }

  /**
   * Valide et retourne le nom du schéma tenant
   */
  private validateSchema(tenantSchema: string): string {
    if (!/^tenant_[a-z0-9_]+$/.test(tenantSchema)) {
      throw new BadRequestException('Schema tenant invalide');
    }
    return tenantSchema;
  }

  /**
   * Génère les attestations pour un étudiant
   */
  async getAttestations(tenantSchema: string, etudiantId?: string) {
    try {
      const schema = this.validateSchema(tenantSchema);
      
      let whereClause = '';
      const params: any[] = [];
      
      if (etudiantId) {
        whereClause = 'WHERE e.id = $1';
        params.push(etudiantId);
      }
      
      const attestations = await this.dataSource.query(`
        SELECT
          a.id,
          a.numero_attestation,
          a.type_attestation,
          a.statut,
          a.date_emission,
          a.motif,
          a.observations,
          a.created_at,
          e.id as etudiant_id,
          e.nom,
          e.prenom,
          e.matricule,
          e.date_naissance,
          e.lieu_naissance,
          i.id as inscription_id,
          i.annee_niveau,
          p.nom as parcours_nom,
          p.niveau as parcours_niveau,
          aa.libelle as annee_academique
        FROM ${schema}.attestation a
        INNER JOIN ${schema}.etudiant e ON a.etudiant_id = e.id
        LEFT JOIN ${schema}.inscription i ON a.inscription_id = i.id
        LEFT JOIN ${schema}.parcours p ON i.parcours_id = p.id
        LEFT JOIN ${schema}.annee_academique aa ON a.annee_academique_id = aa.id
        ${whereClause}
        ORDER BY a.created_at DESC
      `, params);

      return attestations.map((att: any) => ({
        id: att.id,
        numeroAttestation: att.numero_attestation,
        typeAttestation: att.type_attestation,
        statut: att.statut,
        dateEmission: att.date_emission || att.created_at,
        motif: att.motif,
        observations: att.observations,
        etudiantId: att.etudiant_id,
        etudiantNom: att.nom,
        etudiantPrenom: att.prenom,
        matricule: att.matricule,
        anneeAcademique: att.annee_academique || 'N/A',
        parcoursNom: att.parcours_nom,
        niveau: att.annee_niveau,
        parcoursNiveau: att.parcours_niveau
      }));
    } catch (error: any) {
      console.error('Erreur attestations:', error);
      console.error('Stack trace:', error.stack);
      throw new BadRequestException(`Erreur récupération attestations: ${error.message}`);
    }
  }

  /**
   * Génère un numéro d'attestation unique
   */
  private async genererNumeroAttestation(schema: string, type: string): Promise<string> {
    const prefixes: Record<string, string> = {
      'inscription': 'ATT-INS',
      'scolarite': 'ATT-SCO',
      'reussite': 'ATT-REU'
    };
    
    const prefix = prefixes[type] || 'ATT';
    const annee = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    
    return `${prefix}-${annee}-${timestamp}`;
  }

  /**
   * Crée une nouvelle attestation
   */
  async creerAttestation(
    tenantSchema: string,
    data: {
      etudiantId: string;
      inscriptionId?: string;
      typeAttestation: string;
      anneeAcademiqueId?: string;
      motif?: string;
      observations?: string;
    }
  ) {
    try {
      const schema = this.validateSchema(tenantSchema);
      
      // Vérifier que l'étudiant existe
      const etudiant = await this.dataSource.query(`
        SELECT id, nom, prenom, matricule 
        FROM ${schema}.etudiant 
        WHERE id = $1 AND actif = true
      `, [data.etudiantId]);
      
      if (etudiant.length === 0) {
        throw new BadRequestException('Étudiant non trouvé');
      }
      
      // Générer numéro unique
      const numeroAttestation = await this.genererNumeroAttestation(schema, data.typeAttestation);
      
      // Insérer l'attestation
      const result = await this.dataSource.query(`
        INSERT INTO ${schema}.attestation (
          etudiant_id,
          inscription_id,
          type_attestation,
          numero_attestation,
          annee_academique_id,
          motif,
          observations,
          statut,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `, [
        data.etudiantId,
        data.inscriptionId || null,
        data.typeAttestation,
        numeroAttestation,
        data.anneeAcademiqueId || null,
        data.motif || null,
        data.observations || null,
        'en_attente'
      ]);
      
      return {
        success: true,
        attestation: {
          id: result[0].id,
          numeroAttestation: result[0].numero_attestation,
          typeAttestation: result[0].type_attestation,
          statut: result[0].statut,
          dateEmission: result[0].date_emission,
          etudiant: etudiant[0]
        },
        message: 'Attestation créée avec succès'
      };
    } catch (error: any) {
      console.error('Erreur création attestation:', error);
      throw new BadRequestException(`Erreur lors de la création de l'attestation: ${error.message}`);
    }
  }

  /**
   * Met à jour le statut d'une attestation
   */
  async updateAttestationStatut(
    tenantSchema: string,
    attestationId: string,
    statut: string,
    userId?: string
  ) {
    try {
      const schema = this.validateSchema(tenantSchema);
      
      // Vérifier que le statut est valide
      const statutsValides = ['en_attente', 'validee', 'delivree', 'annulee'];
      if (!statutsValides.includes(statut)) {
        throw new BadRequestException('Statut invalide');
      }
      
      // Préparer les champs à mettre à jour
      let updateFields = 'statut = $2, updated_at = NOW()';
      const params: any[] = [attestationId, statut];
      let paramIndex = 3;
      
      // Si le statut est "delivree", enregistrer qui l'a délivrée et quand
      if (statut === 'delivree' && userId) {
        updateFields += `, delivre_par = $${paramIndex}, date_delivrance = NOW()`;
        params.push(userId);
        paramIndex++;
      }
      
      const result = await this.dataSource.query(`
        UPDATE ${schema}.attestation
        SET ${updateFields}
        WHERE id = $1
        RETURNING *
      `, params);
      
      if (result.length === 0) {
        throw new BadRequestException('Attestation non trouvée');
      }
      
      return {
        success: true,
        attestation: result[0],
        message: `Attestation ${statut === 'delivree' ? 'délivrée' : 'mise à jour'} avec succès`
      };
    } catch (error: any) {
      console.error('Erreur mise à jour attestation:', error);
      throw new BadRequestException(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  /**
   * Génère les attestations de transfert
   */
  async getTransferts(tenantSchema: string, etudiantId?: string) {
    try {
      const schema = this.validateSchema(tenantSchema);
      
      const transferts = await this.dataSource.query(`
        SELECT
          e.id as etudiant_id,
          e.nom,
          e.prenom,
          (e.nom || ' ' || e.prenom) as "etudiantNom",
          e.matricule,
          i.id as inscription_id,
          i.annee_academique_id,
          i.annee_niveau,
          i.parcours_id,
          p.nom as parcours_nom,
          i.statut as inscription_statut,
          i.date_inscription,
          aa.libelle as annee_academique,
          rs.moyenne_generale,
          rs.statut as resultat_statut,
          rs.mention,
          -- Historique des transferts
          t.id as transfert_id,
          t.etablissement_origine,
          t.decision_equivalence as statut_transfert,
          t.credits_reconnus,
          t.created_at as date_transfert
        FROM ${schema}.etudiant e
        LEFT JOIN ${schema}.inscription i ON e.id = i.etudiant_id
        LEFT JOIN ${schema}.parcours p ON i.parcours_id = p.id
        LEFT JOIN ${schema}.annee_academique aa ON i.annee_academique_id = aa.id
        LEFT JOIN ${schema}.resultat_semestre rs ON e.id = rs.etudiant_id AND rs.inscription_id = i.id
        LEFT JOIN ${schema}.transfert_etudiant t ON e.id = t.etudiant_id
        WHERE e.actif = true
        ${etudiantId ? `AND e.id = $1` : ''}
        ORDER BY aa.libelle DESC, t.created_at DESC
      `, etudiantId ? [etudiantId] : []);

      return transferts.map((transfert: any) => ({
        id: transfert.transfert_id || transfert.inscription_id || transfert.etudiant_id,
        etudiantId: transfert.etudiant_id,
        etudiantNom: transfert.nom,
        etudiantPrenom: transfert.prenom,
        matricule: transfert.matricule,
        type: transfert.transfert_id ? 'transfert_entrant' : 'equivalence',
        etablissementOrigine: transfert.etablissement_origine,
        etablissementDestination: null,
        datedemande: transfert.date_transfert || transfert.date_inscription,
        statut: transfert.statut_transfert || transfert.inscription_statut || 'en_attente',
        creditsValides: transfert.credits_reconnus,
        // Données supplémentaires
        anneeAcademique: transfert.annee_academique,
        parcoursNom: transfert.parcours_nom,
        niveau: transfert.annee_niveau,
        moyenneGenerale: parseFloat(transfert.moyenne_generale) || null,
        mention: transfert.mention
      }));
    } catch (error: any) {
      console.error('Erreur transferts:', error);
      throw new BadRequestException('Impossible de récupérer les transferts');
    }
  }

  /**
   * Crée une demande de transfert
   */
  async createTransfert(tenantSchema: string, etudiantId: string, motif: string, universiteDestination: string) {
    try {
      const schema = this.validateSchema(tenantSchema);
      
      // Vérifier si l'étudiant existe et est éligible
      const etudiant = await this.etudiantRepo.findOne({
        where: { id: etudiantId, actif: true }
      });
      
      if (!etudiant) {
        throw new NotFoundException('Étudiant non trouvé');
      }

      // Vérifier l'éligibilité au transfert
      const eligibilityCheck = await this.dataSource.query(`
        SELECT i.statut, rs.statut as resultat_statut
        FROM ${schema}.inscription i
        LEFT JOIN ${schema}.resultat_semestre rs ON i.etudiant_id = rs.etudiant_id AND rs.inscription_id = i.id
        WHERE i.etudiant_id = $1
        ORDER BY i.created_at DESC
        LIMIT 1
      `, [etudiantId]);

      if (eligibilityCheck.length === 0) {
        throw new BadRequestException('Aucune inscription trouvée pour cet étudiant');
      }

      const lastInscription = eligibilityCheck[0];
      if (!this.isEligibleTransfert(lastInscription.statut, lastInscription.resultat_statut)) {
        throw new BadRequestException('Étudiant non éligible au transfert');
      }

      // Créer la demande de transfert
      const transfertQuery = `
        INSERT INTO ${schema}.transfert_etudiant (etudiant_id, etablissement_origine, decision_equivalence, created_at)
        VALUES ($1, $2, $3, $4)
        RETURNING id, etablissement_origine, decision_equivalence, created_at
      `;

      const result = await this.dataSource.query(transfertQuery, [
        etudiantId,
        universiteDestination,
        'en_attente',
        new Date()
      ]);

      return {
        success: true,
        transfert: result[0],
        message: 'Demande de transfert créée avec succès'
      };
    } catch (error: any) {
      console.error('Erreur création transfert:', error);
      throw error;
    }
  }

  /**
   * Met à jour le statut d'un transfert
   */
  async updateTransertStatut(tenantSchema: string, transfertId: string, statut: string, commentaire?: string) {
    try {
      const schema = this.validateSchema(tenantSchema);
      
      const updateQuery = `
        UPDATE ${schema}.transfert_etudiant
        SET decision_equivalence = $1, updated_at = $2
        WHERE id = $3
        RETURNING id, decision_equivalence, updated_at
      `;

      const result = await this.dataSource.query(updateQuery, [
        statut,
        new Date(),
        transfertId
      ]);

      if (result.length === 0) {
        throw new NotFoundException('Transfert non trouvé');
      }

      return {
        success: true,
        transfert: result[0],
        message: `Statut du transfert mis à jour: ${statut}`
      };
    } catch (error: any) {
      console.error('Erreur mise à jour transfert:', error);
      throw error;
    }
  }

  /**
   * Détermine le type d'attestation basé sur le statut
   */
  private determineTypeAttestation(inscriptionStatut: string, decision: string): string {
    if (!inscriptionStatut) return 'inscription';
    
    switch (inscriptionStatut) {
      case 'valide':
        if (decision === 'admis') return 'reussite';
        if (decision === 'ajourne') return 'inscription';
        return 'scolarite';
      case 'en_attente':
        return 'preinscription';
      default:
        return 'inscription';
    }
  }

  /**
   * Vérifie si un étudiant est éligible au transfert
   */
  private isEligibleTransfert(inscriptionStatut: string, decision: string): boolean {
    // Conditions d'éligibilité au transfert:
    // - Inscription valide
    // - Pas en situation d'échec persistant
    // - Pas de dettes financières (à vérifier)
    
    if (inscriptionStatut !== 'valide') {
      return false;
    }

    if (decision === 'exclu' || decision === 'radié') {
      return false;
    }

    return true;
  }

  async getDeliberations(tenantSchema: string) {
  try {
    const schema = this.validateSchema(tenantSchema);

    const deliberations = await this.dataSource.query(`
      SELECT
        d.id,
        d.statut,
        d.date_deliberation,
        d.observations_generales,
        d.created_at,
        -- Session d'examen
        se.id as session_examen_id,
        se.libelle as session_libelle,
        se.type_session,
        se.semestre,
        se.date_debut,
        se.date_fin,
        -- Parcours
        p.id as parcours_id,
        p.nom as parcours_nom,
        p.niveau as parcours_niveau,
        -- Année académique
        aa.libelle as annee_academique,
        -- Président jury
        u.nom as president_nom,
        u.prenom as president_prenom,
        -- Statistiques résultats
        COUNT(rd.id) as nb_etudiants,
        COUNT(CASE WHEN rd.decision = 'admis' THEN 1 END) as nb_admis,
        COUNT(CASE WHEN rd.decision = 'ajourne' THEN 1 END) as nb_ajournes
      FROM ${schema}.deliberation d
      LEFT JOIN ${schema}.session_examen se ON d.session_examen_id = se.id
      LEFT JOIN ${schema}.parcours p ON d.parcours_id = p.id
      LEFT JOIN ${schema}.annee_academique aa ON se.annee_academique_id = aa.id
      LEFT JOIN ${schema}.utilisateur u ON d.president_jury_id = u.id
      LEFT JOIN ${schema}.resultat_deliberation rd ON d.id = rd.pv_id
      GROUP BY d.id, se.id, p.id, aa.libelle, u.nom, u.prenom
      ORDER BY d.date_deliberation DESC
    `);

    return deliberations.map((d: any) => ({
      id: d.id,
      statut: d.statut,
      dateDeliberation: d.date_deliberation,
      observationsGenerales: d.observations_generales,
      createdAt: d.created_at,
      sessionExamen: {
        id: d.session_examen_id,
        libelle: d.session_libelle,
        typeSession: d.type_session,
        semestre: d.semestre,
        dateDebut: d.date_debut,
        dateFin: d.date_fin,
      },
      parcours: {
        id: d.parcours_id,
        nom: d.parcours_nom,
        niveau: d.parcours_niveau,
      },
      anneeAcademique: d.annee_academique,
      presidentJury: d.president_nom
        ? { nom: d.president_nom, prenom: d.president_prenom }
        : null,
      statistiques: {
        nbEtudiants: parseInt(d.nb_etudiants) || 0,
        nbAdmis: parseInt(d.nb_admis) || 0,
        nbAjournes: parseInt(d.nb_ajournes) || 0,
        tauxReussite: d.nb_etudiants > 0
          ? Math.round((d.nb_admis / d.nb_etudiants) * 100)
          : 0,
      },
    }));
  } catch (error: any) {
    console.error('Erreur délibérations:', error);
    throw new BadRequestException('Impossible de récupérer les délibérations');
  }
}

async getDiplomes(tenantSchema: string) {
  try {
    const schema = this.validateSchema(tenantSchema);

    const diplomes = await this.dataSource.query(`
      SELECT
        d.id as diplome_id,
        d.statut,
        d.type_diplome,
        d.mention_generale,
        d.moyenne_finale,
        d.date_obtention,
        d.numero_diplome,
        d.signe_president,
        d.date_signature,
        d.date_delivrance,
        d.date_retrait,
        d.observations,
        d.created_at,
        -- Étudiant
        e.id as etudiant_id,
        e.matricule,
        e.nom,
        e.prenom,
        (e.nom || ' ' || e.prenom) as "etudiantNom",
        e.date_naissance,
        -- Parcours
        p.id as parcours_id,
        p.nom as parcours_nom,
        p.niveau as parcours_niveau,
        -- Inscription
        i.id as inscription_id,
        i.annee_niveau,
        -- Année académique
        aa.libelle as annee_academique,
        -- Délivré par
        u.nom as delivre_par_nom,
        u.prenom as delivre_par_prenom
      FROM ${schema}.diplome d
      JOIN ${schema}.etudiant e ON d.etudiant_id = e.id
      JOIN ${schema}.inscription i ON d.inscription_id = i.id
      JOIN ${schema}.parcours p ON d.parcours_id = p.id
      LEFT JOIN ${schema}.annee_academique aa ON i.annee_academique_id = aa.id
      LEFT JOIN ${schema}.utilisateur u ON d.delivre_par = u.id
      WHERE e.actif = true
      ORDER BY d.created_at DESC
    `);

    return diplomes.map((d: any) => ({
      id: d.diplome_id,
      statut: d.statut,
      typeDiplome: d.type_diplome,
      mentionGenerale: d.mention_generale,
      moyenneFinale: parseFloat(d.moyenne_finale) || null,
      dateObtention: d.date_obtention,
      numeroDiplome: d.numero_diplome,
      signePresident: d.signe_president,
      dateSignature: d.date_signature,
      dateDelivrance: d.date_delivrance,
      dateRetrait: d.date_retrait,
      observations: d.observations,
      createdAt: d.created_at,
      etudiant: {
        id: d.etudiant_id,
        matricule: d.matricule,
        nom: d.nom,
        prenom: d.prenom,
        etudiantNom: d.etudiantNom,
        dateNaissance: d.date_naissance,
      },
      parcours: {
        id: d.parcours_id,
        nom: d.parcours_nom,
        niveau: d.parcours_niveau,
      },
      inscription: {
        id: d.inscription_id,
        anneeNiveau: d.annee_niveau,
      },
      anneeAcademique: d.annee_academique,
      delivrePar: d.delivre_par_nom
        ? { nom: d.delivre_par_nom, prenom: d.delivre_par_prenom }
        : null,
    }));
  } catch (error: any) {
    console.error('Erreur diplômes:', error);
    throw new BadRequestException('Impossible de récupérer les diplômes');
  }
}

  /**
   * Récupère la liste des étudiants éligibles pour un diplôme (sans les générer)
   */
  async getEtudiantsEligiblesDiplome(tenantSchema: string, anneeAcademiqueId?: string, parcoursId?: string) {
    try {
      const schema = this.validateSchema(tenantSchema);
      
      // Construire la clause WHERE
      let whereClause = `WHERE rs.statut = 'admis' AND rs.moyenne_generale >= 10`;
      const params: any[] = [];
      let paramIndex = 1;

      if (anneeAcademiqueId) {
        whereClause += ` AND i.annee_academique_id = $${paramIndex}`;
        params.push(anneeAcademiqueId);
        paramIndex++;
      }

      if (parcoursId) {
        whereClause += ` AND i.parcours_id = $${paramIndex}`;
        params.push(parcoursId);
        paramIndex++;
      }

      // Vérifier qu'il n'existe pas déjà un diplôme
      whereClause += ` AND NOT EXISTS (
        SELECT 1 FROM ${schema}.diplome d 
        WHERE d.etudiant_id = e.id AND d.inscription_id = i.id
      )`;

      const etudiantsEligibles = await this.dataSource.query(`
        SELECT DISTINCT
          e.id as etudiant_id,
          e.nom,
          e.prenom,
          e.matricule,
          e.date_naissance,
          i.id as inscription_id,
          i.parcours_id,
          i.annee_niveau,
          p.nom as parcours_nom,
          p.niveau as parcours_niveau,
          i.annee_academique_id,
          aa.libelle as annee_academique,
          rs.moyenne_generale,
          rs.mention,
          rs.date_validation
        FROM ${schema}.etudiant e
        INNER JOIN ${schema}.inscription i ON e.id = i.etudiant_id
        INNER JOIN ${schema}.parcours p ON i.parcours_id = p.id
        INNER JOIN ${schema}.annee_academique aa ON i.annee_academique_id = aa.id
        INNER JOIN ${schema}.resultat_semestre rs ON e.id = rs.etudiant_id AND rs.inscription_id = i.id
        ${whereClause}
        ORDER BY e.nom, e.prenom
      `, params);

      return {
        success: true,
        count: etudiantsEligibles.length,
        etudiants: etudiantsEligibles.map((e: any) => ({
          etudiantId: e.etudiant_id,
          matricule: e.matricule,
          nom: e.nom,
          prenom: e.prenom,
          etudiantNom: `${e.nom} ${e.prenom}`,
          dateNaissance: e.date_naissance,
          inscriptionId: e.inscription_id,
          anneeNiveau: e.annee_niveau,
          parcours: {
            id: e.parcours_id,
            nom: e.parcours_nom,
            niveau: e.parcours_niveau,
            typeDiplome: e.parcours_niveau
          },
          anneeAcademique: e.annee_academique,
          moyenneGenerale: parseFloat(e.moyenne_generale),
          mention: e.mention || 'Passable',
          dateValidation: e.date_validation
        }))
      };
    } catch (error: any) {
      console.error('Erreur récupération étudiants éligibles:', error);
      throw new BadRequestException(`Erreur lors de la récupération des étudiants éligibles: ${error.message}`);
    }
  }

  /**
   * Génère automatiquement les diplômes pour les étudiants éligibles
   */
  async genererDiplomes(tenantSchema: string, anneeAcademiqueId?: string, parcoursId?: string) {
    try {
      const schema = this.validateSchema(tenantSchema);
      
      // Récupérer les étudiants éligibles (ayant validé tous leurs modules)
      let whereClause = `WHERE rs.statut = 'admis' AND rs.moyenne_generale >= 10`;
      const params: any[] = [];
      let paramIndex = 1;

      if (anneeAcademiqueId) {
        whereClause += ` AND i.annee_academique_id = $${paramIndex}`;
        params.push(anneeAcademiqueId);
        paramIndex++;
      }

      if (parcoursId) {
        whereClause += ` AND i.parcours_id = $${paramIndex}`;
        params.push(parcoursId);
        paramIndex++;
      }

      // Vérifier qu'il n'existe pas déjà un diplôme
      whereClause += ` AND NOT EXISTS (
        SELECT 1 FROM ${schema}.diplome d 
        WHERE d.etudiant_id = e.id AND d.inscription_id = i.id
      )`;

      const etudiantsEligibles = await this.dataSource.query(`
        SELECT DISTINCT
          e.id as etudiant_id,
          e.nom,
          e.prenom,
          e.matricule,
          i.id as inscription_id,
          i.parcours_id,
          p.nom as parcours_nom,
          p.niveau as type_diplome,
          i.annee_academique_id,
          aa.libelle as annee_academique,
          rs.moyenne_generale,
          rs.mention,
          i.annee_niveau
        FROM ${schema}.etudiant e
        INNER JOIN ${schema}.inscription i ON e.id = i.etudiant_id
        INNER JOIN ${schema}.parcours p ON i.parcours_id = p.id
        INNER JOIN ${schema}.annee_academique aa ON i.annee_academique_id = aa.id
        INNER JOIN ${schema}.resultat_semestre rs ON e.id = rs.etudiant_id AND rs.inscription_id = i.id
        ${whereClause}
        ORDER BY e.nom, e.prenom
      `, params);

      if (etudiantsEligibles.length === 0) {
        return {
          success: true,
          generated: 0,
          message: 'Aucun étudiant éligible trouvé pour la génération de diplômes'
        };
      }

      // Générer les diplômes
      const diplomesGeneres = [];
      for (const etudiant of etudiantsEligibles) {
        // Générer un numéro de diplôme unique
        const numeroDiplome = `DIP-${etudiant.annee_academique.replace(/[^0-9]/g, '')}-${etudiant.matricule}-${Date.now().toString().slice(-6)}`;

        const insertQuery = `
          INSERT INTO ${schema}.diplome (
            etudiant_id,
            inscription_id,
            parcours_id,
            numero_diplome,
            type_diplome,
            date_obtention,
            moyenne_finale,
            mention_generale,
            statut,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING id, numero_diplome, statut
        `;

        const result = await this.dataSource.query(insertQuery, [
          etudiant.etudiant_id,
          etudiant.inscription_id,
          etudiant.parcours_id,
          numeroDiplome,
          etudiant.type_diplome || 'Licence',
          new Date(),
          parseFloat(etudiant.moyenne_generale),
          etudiant.mention || 'Passable',
          'en_preparation',
          new Date()
        ]);

        diplomesGeneres.push({
          ...result[0],
          etudiantNom: etudiant.nom,
          etudiantPrenom: etudiant.prenom,
          parcoursNom: etudiant.parcours_nom
        });
      }

      return {
        success: true,
        generated: diplomesGeneres.length,
        diplomes: diplomesGeneres,
        message: `${diplomesGeneres.length} diplôme(s) généré(s) avec succès`
      };
    } catch (error: any) {
      console.error('Erreur génération diplômes:', error);
      throw new BadRequestException(`Erreur lors de la génération des diplômes: ${error.message}`);
    }
  }

  /**
   * Génère le PDF d'une attestation
   */
  async genererPDFAttestation(tenantSchema: string, attestationId: string): Promise<Buffer> {
    try {
      const schema = this.validateSchema(tenantSchema);
      
      console.log('🔍 Génération PDF pour attestation:', attestationId);
      
      // Récupérer les données de l'attestation avec les infos du tenant
      const attestationData = await this.dataSource.query(`
        SELECT
          a.id,
          a.numero_attestation,
          a.type_attestation,
          a.date_emission,
          a.motif,
          a.observations,
          e.nom as etudiant_nom,
          e.prenom as etudiant_prenom,
          e.matricule,
          e.date_naissance,
          e.lieu_naissance,
          i.annee_niveau,
          i.date_inscription,
          p.nom as parcours_nom,
          p.niveau as parcours_niveau,
          aa.libelle as annee_academique,
          t.nom as universite_nom,
          t.adresse as universite_adresse,
          t.telephone as universite_telephone,
          t.email_contact as universite_email,
          t.logo_url as universite_logo,
          t.slogan as universite_slogan,
          t.pays as universite_pays
        FROM ${schema}.attestation a
        INNER JOIN ${schema}.etudiant e ON a.etudiant_id = e.id
        LEFT JOIN ${schema}.inscription i ON a.inscription_id = i.id
        LEFT JOIN ${schema}.parcours p ON i.parcours_id = p.id
        LEFT JOIN ${schema}.annee_academique aa ON a.annee_academique_id = aa.id
        INNER JOIN public.tenant t ON t.schema_name = $2
        WHERE a.id = $1
        LIMIT 1
      `, [attestationId, schema]);

      console.log('📋 Données attestation:', attestationData.length > 0 ? 'Trouvées' : 'Non trouvées');

      if (!attestationData || attestationData.length === 0) {
        throw new NotFoundException('Attestation non trouvée');
      }

      const att = attestationData[0];
      console.log('✅ Attestation:', att.numero_attestation, att.type_attestation);

      // Préparer les informations du tenant
      const tenantInfo: TenantInfo = {
        nom: att.universite_nom,
        adresse: att.universite_adresse,
        telephone: att.universite_telephone,
        email_contact: att.universite_email,
        logo_url: att.universite_logo,
        slogan: att.universite_slogan,
        pays: att.universite_pays
      };

      // Générer le PDF selon le type d'attestation
      let doc;
      const dateEmission = att.date_emission ? new Date(att.date_emission) : new Date();
      
      if (att.type_attestation === 'scolarite' || att.type_attestation === 'inscription') {
        // Déterminer le titre selon le type
        const titre = att.type_attestation === 'scolarite'
          ? 'Certificat de Scolarité'
          : 'Certificat d\'Inscription';
        
        doc = await generateCertificatInscription(tenantInfo, {
          numero_document: att.numero_attestation,
          date_delivrance: dateEmission,
          etudiant: {
            matricule: att.matricule,
            nom: att.etudiant_nom,
            prenom: att.etudiant_prenom,
            date_naissance: att.date_naissance ? new Date(att.date_naissance) : new Date(),
            lieu_naissance: att.lieu_naissance || 'Non renseigné'
          },
          formation: {
            parcours_nom: att.parcours_nom || 'Non renseigné',
            niveau: att.parcours_niveau || att.annee_niveau || 'Non renseigné',
            annee_academique: att.annee_academique || 'En cours',
            date_inscription: att.date_inscription ? new Date(att.date_inscription) : new Date()
          },
          signataire: {
            nom: 'Le Directeur de la Scolarité',
            fonction: 'Directeur de la Scolarité'
          },
          titre: titre  // Passer le titre personnalisé
        });
      } else if (att.type_attestation === 'reussite') {
        // Attestation de réussite
        doc = await generateAttestationReussite(tenantInfo, {
          numero_document: att.numero_attestation,
          date_delivrance: dateEmission,
          etudiant: {
            matricule: att.matricule,
            nom: att.etudiant_nom,
            prenom: att.etudiant_prenom,
            date_naissance: att.date_naissance ? new Date(att.date_naissance) : new Date(),
            lieu_naissance: att.lieu_naissance || 'Non renseigné'
          },
          formation: {
            diplome: att.parcours_nom || 'Non renseigné',
            niveau: att.parcours_niveau || att.annee_niveau || 'Non renseigné',
            annee_academique: att.annee_academique || 'En cours'
          },
          resultat: {
            session: 'normale'
          },
          signataire: {
            nom: 'Le Président',
            fonction: 'Président de l\'Université'
          }
        });
      } else {
        // Attestation générique (utiliser le certificat d'inscription par défaut)
        doc = await generateCertificatInscription(tenantInfo, {
          numero_document: att.numero_attestation,
          date_delivrance: dateEmission,
          etudiant: {
            matricule: att.matricule,
            nom: att.etudiant_nom,
            prenom: att.etudiant_prenom,
            date_naissance: att.date_naissance ? new Date(att.date_naissance) : new Date(),
            lieu_naissance: att.lieu_naissance || 'Non renseigné'
          },
          formation: {
            parcours_nom: att.parcours_nom || 'Non renseigné',
            niveau: att.parcours_niveau || att.annee_niveau || 'Non renseigné',
            annee_academique: att.annee_academique || 'En cours',
            date_inscription: att.date_inscription ? new Date(att.date_inscription) : new Date()
          },
          signataire: {
            nom: 'Le Directeur de la Scolarité',
            fonction: 'Directeur de la Scolarité'
          }
        });
      }

      // Convertir le PDF en Buffer
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      
      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          console.log('✅ PDF généré, taille:', Buffer.concat(chunks).length, 'bytes');
          resolve(Buffer.concat(chunks));
        });
        
        doc.on('error', (err) => {
          console.error('❌ Erreur PDFKit:', err);
          reject(err);
        });
        
        // Finaliser le PDF
        console.log('📄 Finalisation du PDF...');
        doc.end();
      });
    } catch (error: any) {
      console.error('Erreur génération PDF attestation:', error);
      throw new BadRequestException(`Erreur lors de la génération du PDF: ${error.message}`);
    }
  }

  /**
   * Valide une attestation (change le statut de en_attente à validee)
   */
  async validerAttestation(tenantSchema: string, attestationId: string, validateurId?: string): Promise<any> {
    try {
      const schema = this.validateSchema(tenantSchema);
      
      console.log('🔍 Validation attestation:', { schema, attestationId, validateurId });
      
      // Vérifier que l'attestation existe et est en attente
      const attestation = await this.dataSource.query(`
        SELECT id, statut FROM ${schema}.attestation WHERE id = $1
      `, [attestationId]);

      console.log('📋 Attestation trouvée:', attestation);

      if (!attestation || attestation.length === 0) {
        throw new NotFoundException('Attestation non trouvée');
      }

      if (attestation[0].statut !== 'en_attente') {
        throw new BadRequestException(`Impossible de valider une attestation avec le statut: ${attestation[0].statut}`);
      }

      // Mettre à jour le statut
      const result = await this.dataSource.query(`
        UPDATE ${schema}.attestation
        SET statut = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, numero_attestation, statut
      `, ['validee', attestationId]);

      console.log('✅ Attestation validée:', result[0]);

      return {
        success: true,
        attestation: result[0],
        message: 'Attestation validée avec succès'
      };
    } catch (error: any) {
      console.error('❌ Erreur validation attestation:', error);
      console.error('Stack:', error.stack);
      throw new BadRequestException(`Erreur lors de la validation: ${error.message}`);
    }
  }

  /**
   * Rejette une attestation
   */
  async rejeterAttestation(tenantSchema: string, attestationId: string, motifRejet: string, validateurId?: string): Promise<any> {
    try {
      const schema = this.validateSchema(tenantSchema);
      
      // Vérifier que l'attestation existe et est en attente
      const attestation = await this.dataSource.query(`
        SELECT id, statut FROM ${schema}.attestation WHERE id = $1
      `, [attestationId]);

      if (!attestation || attestation.length === 0) {
        throw new NotFoundException('Attestation non trouvée');
      }

      if (attestation[0].statut !== 'en_attente') {
        throw new BadRequestException(`Impossible de rejeter une attestation avec le statut: ${attestation[0].statut}`);
      }

      // Mettre à jour le statut
      const result = await this.dataSource.query(`
        UPDATE ${schema}.attestation
        SET 
          statut = 'rejetee',
          motif_rejet = $1,
          validateur_id = $2,
          updated_at = $3
        WHERE id = $4
        RETURNING id, numero_attestation, statut, motif_rejet
      `, [motifRejet, validateurId, new Date(), attestationId]);

      return {
        success: true,
        attestation: result[0],
        message: 'Attestation rejetée'
      };
    } catch (error: any) {
      console.error('Erreur rejet attestation:', error);
      throw new BadRequestException(`Erreur lors du rejet: ${error.message}`);
    }
  }
}
