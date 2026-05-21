import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  AutorisationSortieDto,
  JustifierAbsenceDto,
  EnvoyerMessageDto,
  RepondreMessageDto,
  SoumettrePreuvePaiementDto,
  GetBulletinQueryDto,
  GetAbsencesQueryDto,
  GetEmploiDuTempsQueryDto,
  GetMessagesQueryDto
} from './dto/parent.dto';

@Injectable()
export class PortailParentServiceEnhanced {
  private readonly logger = new Logger(PortailParentServiceEnhanced.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  /**
   * Récupère le schéma du tenant depuis le contexte de la requête
   */
  private getSchemaName(req?: any): string {
    // Le schéma est défini par le middleware tenant
    return req?.tenantSchema || 'tenant_ispm';
  }

  /**
   * Vérifie que le parent a bien accès aux informations de l'étudiant
   * Méthode 1 : Vérification UNIQUEMENT par email (recommandée)
   */
  private async verifierLienParentEnfant(
    parentUserId: string,
    etudiantId: string,
    schemaName: string
  ): Promise<void> {
    // 1. Récupérer UNIQUEMENT l'email du parent
    const parent = await this.dataSource.query(`
      SELECT email FROM ${schemaName}.utilisateur
      WHERE id = $1 AND role = 'parent'
    `, [parentUserId]);

    if (!parent.length) {
      throw new ForbiddenException('Utilisateur parent non trouvé');
    }

    // 2. Vérifier UNIQUEMENT par email (égalité stricte)
    const lien = await this.dataSource.query(`
      SELECT 1 FROM ${schemaName}.etudiant e
      WHERE e.id = $1 AND e.email_parent = $2
    `, [etudiantId, parent[0].email]);

    if (!lien.length) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à consulter les informations de cet étudiant');
    }
  }

  /**
   * Vérifie si l'étudiant est mineur (< 18 ans)
   */
  private async estMineur(etudiantId: string, schemaName: string): Promise<boolean> {
    const result = await this.dataSource.query(`
      SELECT EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_naissance)) < 18 as est_mineur
      FROM ${schemaName}.etudiant
      WHERE id = $1
    `, [etudiantId]);

    return result[0]?.est_mineur || false;
  }

  /**
   * Liste tous les enfants liés au parent
   * Méthode 1 : Filtrage UNIQUEMENT par email (recommandée)
   */
  async getEnfants(parentUserId: string, schemaName: string): Promise<any[]> {
    // 1. Récupérer UNIQUEMENT l'email du parent
    const parent = await this.dataSource.query(`
      SELECT email FROM ${schemaName}.utilisateur
      WHERE id = $1 AND role = 'parent'
    `, [parentUserId]);

    if (!parent.length) {
      throw new NotFoundException('Parent non trouvé');
    }

    // 2. Filtrer les enfants UNIQUEMENT par email
    const enfants = await this.dataSource.query(`
      SELECT
        e.id,
        e.nom,
        e.prenom,
        e.matricule,
        e.photo_url,
        e.date_naissance,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.date_naissance)) as age,
        p.nom as parcours,
        p.code as parcours_code,
        p.niveau as niveau_etude,
        aa.libelle as annee_academique,
        i.annee_niveau,
        i.statut as statut_inscription,
        d.nom as departement
      FROM ${schemaName}.etudiant e
      LEFT JOIN ${schemaName}.inscription i ON i.etudiant_id = e.id
        AND i.statut = 'validee'
      LEFT JOIN ${schemaName}.parcours p ON p.id = i.parcours_id
      LEFT JOIN ${schemaName}.departement d ON d.id = p.departement_id
      LEFT JOIN ${schemaName}.annee_academique aa ON aa.id = i.annee_academique_id AND aa.active = true
      WHERE e.email_parent = $1
        AND e.actif = true
      ORDER BY e.nom, e.prenom
    `, [parent[0].email]);

    return enfants;
  }

  /**
   * Tableau de bord parent - Vue d'ensemble
   */
  async getDashboard(parentUserId: string, etudiantId: string, schemaName: string): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, etudiantId, schemaName);

    // Récupérer les statistiques en parallèle
    const [absences, paiements, dernieresNotes, prochainEcheance] = await Promise.all([
      // Absences du mois
      this.dataSource.query(`
        SELECT 
          COUNT(*) FILTER (WHERE pr.statut = 'absent' AND pr.justifie = false) as absences_injustifiees,
          COUNT(*) FILTER (WHERE pr.statut = 'retard') as retards,
          COUNT(*) FILTER (WHERE pr.statut = 'absent') as total_absences
        FROM ${schemaName}.presence pr
        JOIN ${schemaName}.emploi_du_temps edt ON edt.id = pr.seance_id
        WHERE pr.etudiant_id = $1
          AND edt.date_seance >= DATE_TRUNC('month', CURRENT_DATE)
          AND edt.date_seance < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      `, [etudiantId]),

      // Situation financière
      this.dataSource.query(`
        SELECT 
          COALESCE(gt.montant_total, 0) as montant_total,
          COALESCE(SUM(p.montant) FILTER (WHERE p.statut = 'valide'), 0) as montant_paye,
          COALESCE(gt.montant_total, 0) - COALESCE(SUM(p.montant) FILTER (WHERE p.statut = 'valide'), 0) as reste_a_payer
        FROM ${schemaName}.inscription i
        LEFT JOIN ${schemaName}.grille_tarifaire gt ON gt.parcours_id = i.parcours_id 
          AND gt.annee_academique_id = i.annee_academique_id
        LEFT JOIN ${schemaName}.paiement p ON p.inscription_id = i.id
        WHERE i.etudiant_id = $1 AND i.statut = 'validee'
        GROUP BY gt.montant_total
      `, [etudiantId]),

      // Dernières notes
      this.dataSource.query(`
        SELECT 
          n.valeur,
          n.mention,
          n.type_evaluation,
          ec.intitule as matiere,
          ue.intitule as ue_nom,
          n.created_at
        FROM ${schemaName}.note n
        JOIN ${schemaName}.element_constitutif ec ON ec.id = n.ec_id
        JOIN ${schemaName}.unite_enseignement ue ON ue.id = ec.ue_id
        WHERE n.etudiant_id = $1
          AND n.verrouille = true
        ORDER BY n.created_at DESC
        LIMIT 5
      `, [etudiantId]),

      // Prochaine échéance de paiement
      this.dataSource.query(`
        SELECT 
          e.num_tranche,
          e.montant_du,
          e.date_echeance,
          e.statut
        FROM ${schemaName}.echeancier e
        JOIN ${schemaName}.inscription i ON i.id = e.inscription_id
        WHERE i.etudiant_id = $1
          AND e.statut = 'en_attente'
          AND e.date_echeance >= CURRENT_DATE
        ORDER BY e.date_echeance ASC
        LIMIT 1
      `, [etudiantId])
    ]);

    return {
      absences: absences[0] || { absences_injustifiees: 0, retards: 0, total_absences: 0 },
      financier: paiements[0] || { montant_total: 0, montant_paye: 0, reste_a_payer: 0 },
      dernieresNotes: dernieresNotes || [],
      prochainEcheance: prochainEcheance[0] || null
    };
  }

  /**
   * Bulletin de notes périodique
   */
  async getBulletin(
    parentUserId: string, 
    etudiantId: string, 
    schemaName: string,
    query: GetBulletinQueryDto
  ): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, etudiantId, schemaName);

    // Construire les filtres
    let filters = '';
    const params: any[] = [etudiantId];
    let paramIndex = 2;

    if (query.sessionId) {
      filters += ` AND n.session_id = $${paramIndex}`;
      params.push(query.sessionId);
      paramIndex++;
    }

    if (query.anneeAcademiqueId) {
      filters += ` AND i.annee_academique_id = $${paramIndex}`;
      params.push(query.anneeAcademiqueId);
      paramIndex++;
    }

    if (query.semestre) {
      filters += ` AND ue.semestre = $${paramIndex}`;
      params.push(query.semestre);
      paramIndex++;
    }

    // Récupérer toutes les notes avec détails
    const notes = await this.dataSource.query(`
      SELECT 
        n.id,
        n.valeur,
        n.mention,
        n.type_evaluation,
        n.created_at as date_saisie,
        ec.id as ec_id,
        ec.code as ec_code,
        ec.intitule as ec_nom,
        ec.coefficient as ec_coefficient,
        ue.id as ue_id,
        ue.code as ue_code,
        ue.intitule as ue_nom,
        ue.credits_ects,
        ue.coefficient as ue_coefficient,
        ue.semestre,
        se.libelle as session,
        se.type_session
      FROM ${schemaName}.note n
      JOIN ${schemaName}.element_constitutif ec ON ec.id = n.ec_id
      JOIN ${schemaName}.unite_enseignement ue ON ue.id = ec.ue_id
      JOIN ${schemaName}.session_examen se ON se.id = n.session_id
      JOIN ${schemaName}.inscription i ON i.etudiant_id = n.etudiant_id
      WHERE n.etudiant_id = $1
        AND n.verrouille = true
        ${filters}
      ORDER BY ue.semestre, ue.code, ec.code
    `, params);

    // Calculer les moyennes par UE
    const moyennesUE = await this.dataSource.query(`
      SELECT 
        ue.id as ue_id,
        ue.code,
        ue.intitule,
        ue.credits_ects,
        ue.coefficient,
        ue.semestre,
        ROUND(AVG(n.valeur * ec.coefficient) / AVG(ec.coefficient), 2) as moyenne_ue,
        MIN(n.valeur) as note_min,
        MAX(n.valeur) as note_max,
        COUNT(DISTINCT n.id) as nb_notes,
        COUNT(DISTINCT ec.id) as nb_matieres
      FROM ${schemaName}.note n
      JOIN ${schemaName}.element_constitutif ec ON ec.id = n.ec_id
      JOIN ${schemaName}.unite_enseignement ue ON ue.id = ec.ue_id
      JOIN ${schemaName}.inscription i ON i.etudiant_id = n.etudiant_id
      WHERE n.etudiant_id = $1
        AND n.verrouille = true
        ${filters}
      GROUP BY ue.id, ue.code, ue.intitule, ue.credits_ects, ue.coefficient, ue.semestre
      ORDER BY ue.semestre, ue.code
    `, params);

    // Calculer la moyenne générale
    const moyenneGenerale = await this.dataSource.query(`
      SELECT 
        ROUND(
          SUM(moy_ue * ue.credits_ects) / NULLIF(SUM(ue.credits_ects), 0),
          2
        ) as moyenne_generale,
        SUM(ue.credits_ects) as total_credits
      FROM (
        SELECT 
          ue.id,
          ue.credits_ects,
          AVG(n.valeur * ec.coefficient) / AVG(ec.coefficient) as moy_ue
        FROM ${schemaName}.note n
        JOIN ${schemaName}.element_constitutif ec ON ec.id = n.ec_id
        JOIN ${schemaName}.unite_enseignement ue ON ue.id = ec.ue_id
        JOIN ${schemaName}.inscription i ON i.etudiant_id = n.etudiant_id
        WHERE n.etudiant_id = $1
          AND n.verrouille = true
          ${filters}
        GROUP BY ue.id, ue.credits_ects
      ) as moyennes
      JOIN ${schemaName}.unite_enseignement ue ON ue.id = moyennes.id
    `, params);

    return {
      notes,
      moyennesUE,
      moyenneGenerale: moyenneGenerale[0]?.moyenne_generale || 0,
      totalCredits: moyenneGenerale[0]?.total_credits || 0
    };
  }

  /**
   * Suivi des absences et retards
   */
  async getAbsences(
    parentUserId: string, 
    etudiantId: string, 
    schemaName: string,
    query: GetAbsencesQueryDto
  ): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, etudiantId, schemaName);

    // Construire les filtres
    let filters = '';
    const params: any[] = [etudiantId];
    let paramIndex = 2;

    if (query.dateDebut) {
      filters += ` AND edt.date_seance >= $${paramIndex}`;
      params.push(query.dateDebut);
      paramIndex++;
    }

    if (query.dateFin) {
      filters += ` AND edt.date_seance <= $${paramIndex}`;
      params.push(query.dateFin);
      paramIndex++;
    }

    if (query.statut && query.statut !== 'tous') {
      filters += ` AND pr.statut = $${paramIndex}`;
      params.push(query.statut);
      paramIndex++;
    } else {
      filters += ` AND pr.statut IN ('absent', 'retard')`;
    }

    // Liste des absences/retards
    const absences = await this.dataSource.query(`
      SELECT 
        pr.id,
        pr.statut,
        pr.heure_arrivee,
        pr.justifie,
        pr.motif,
        pr.justificatif_url,
        edt.date_seance,
        edt.heure_debut,
        edt.heure_fin,
        edt.type_seance,
        ec.intitule as matiere,
        ec.code as matiere_code,
        ue.intitule as ue_nom,
        ens.nom as enseignant_nom,
        ens.prenom as enseignant_prenom,
        s.nom as salle
      FROM ${schemaName}.presence pr
      JOIN ${schemaName}.emploi_du_temps edt ON edt.id = pr.seance_id
      JOIN ${schemaName}.affectation_cours ac ON ac.id = edt.affectation_id
      LEFT JOIN ${schemaName}.element_constitutif ec ON ec.id = ac.ec_id
      LEFT JOIN ${schemaName}.unite_enseignement ue ON ue.id = ac.ue_id OR ue.id = ec.ue_id
      LEFT JOIN ${schemaName}.enseignant ens ON ens.id = ac.enseignant_id
      LEFT JOIN ${schemaName}.salle s ON s.id = edt.salle_id
      WHERE pr.etudiant_id = $1
        ${filters}
      ORDER BY edt.date_seance DESC, edt.heure_debut DESC
      LIMIT 100
    `, params);

    // Statistiques globales
    const stats = await this.dataSource.query(`
      SELECT 
        COUNT(*) FILTER (WHERE pr.statut = 'absent' AND pr.justifie = false) as absences_injustifiees,
        COUNT(*) FILTER (WHERE pr.statut = 'absent' AND pr.justifie = true) as absences_justifiees,
        COUNT(*) FILTER (WHERE pr.statut = 'retard') as retards,
        COUNT(*) FILTER (WHERE pr.statut = 'present') as presences,
        COUNT(*) as total_seances,
        ROUND(
          COUNT(*) FILTER (WHERE pr.statut = 'present')::numeric / NULLIF(COUNT(*), 0) * 100,
          2
        ) as taux_assiduite
      FROM ${schemaName}.presence pr
      JOIN ${schemaName}.emploi_du_temps edt ON edt.id = pr.seance_id
      WHERE pr.etudiant_id = $1
        AND edt.date_seance >= DATE_TRUNC('year', CURRENT_DATE)
    `, [etudiantId]);

    // Évolution mensuelle
    const evolutionMensuelle = await this.dataSource.query(`
      SELECT 
        TO_CHAR(edt.date_seance, 'YYYY-MM') as mois,
        COUNT(*) FILTER (WHERE pr.statut = 'absent') as absences,
        COUNT(*) FILTER (WHERE pr.statut = 'retard') as retards,
        COUNT(*) as total_seances
      FROM ${schemaName}.presence pr
      JOIN ${schemaName}.emploi_du_temps edt ON edt.id = pr.seance_id
      WHERE pr.etudiant_id = $1
        AND edt.date_seance >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(edt.date_seance, 'YYYY-MM')
      ORDER BY mois DESC
    `, [etudiantId]);

    return {
      absences,
      stats: stats[0] || {},
      evolutionMensuelle
    };
  }

  /**
   * Suivi financier complet
   */
  async getFinances(parentUserId: string, etudiantId: string, schemaName: string): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, etudiantId, schemaName);

    // Situation financière globale
    const situation = await this.dataSource.query(`
      SELECT 
        i.id as inscription_id,
        gt.montant_inscription,
        gt.montant_scolarite,
        gt.montant_total,
        gt.nb_tranches,
        COALESCE(SUM(p.montant) FILTER (WHERE p.statut = 'valide'), 0) as montant_paye,
        gt.montant_total - COALESCE(SUM(p.montant) FILTER (WHERE p.statut = 'valide'), 0) as reste_a_payer,
        i.bourse,
        i.type_bourse,
        i.montant_bourse,
        p_cours.nom as parcours,
        aa.libelle as annee_academique
      FROM ${schemaName}.inscription i
      JOIN ${schemaName}.grille_tarifaire gt ON gt.parcours_id = i.parcours_id 
        AND gt.annee_academique_id = i.annee_academique_id
      LEFT JOIN ${schemaName}.paiement p ON p.inscription_id = i.id
      LEFT JOIN ${schemaName}.parcours p_cours ON p_cours.id = i.parcours_id
      LEFT JOIN ${schemaName}.annee_academique aa ON aa.id = i.annee_academique_id
      WHERE i.etudiant_id = $1 AND i.statut = 'validee'
      GROUP BY i.id, gt.montant_inscription, gt.montant_scolarite, gt.montant_total, 
               gt.nb_tranches, i.bourse, i.type_bourse, i.montant_bourse, 
               p_cours.nom, aa.libelle
    `, [etudiantId]);

    if (!situation.length) {
      throw new NotFoundException('Aucune inscription active trouvée');
    }

    const inscriptionId = situation[0].inscription_id;

    // Échéancier
    const echeancier = await this.dataSource.query(`
      SELECT 
        e.id,
        e.num_tranche,
        e.montant_du,
        e.date_echeance,
        e.statut,
        COALESCE(SUM(p.montant) FILTER (WHERE p.statut = 'valide'), 0) as montant_paye_tranche
      FROM ${schemaName}.echeancier e
      LEFT JOIN ${schemaName}.paiement p ON p.echeancier_id = e.id
      WHERE e.inscription_id = $1
      GROUP BY e.id, e.num_tranche, e.montant_du, e.date_echeance, e.statut
      ORDER BY e.num_tranche
    `, [inscriptionId]);

    // Historique des paiements
    const paiements = await this.dataSource.query(`
      SELECT 
        p.id,
        p.montant,
        p.mode_paiement,
        p.date_paiement,
        p.reference,
        p.numero_recu,
        p.recu_url,
        p.statut,
        p.notes,
        e.num_tranche,
        u.nom as caissier_nom,
        u.prenom as caissier_prenom
      FROM ${schemaName}.paiement p
      LEFT JOIN ${schemaName}.echeancier e ON e.id = p.echeancier_id
      LEFT JOIN ${schemaName}.utilisateur u ON u.id = p.recu_par
      WHERE p.inscription_id = $1
      ORDER BY p.date_paiement DESC
    `, [inscriptionId]);

    // Paiements en attente de validation
    const paiementsEnAttente = await this.dataSource.query(`
      SELECT 
        pi.id,
        pi.montant,
        pi.methode_paiement,
        pi.reference_paiement,
        pi.date_paiement,
        pi.preuve_url,
        pi.statut,
        pi.commentaire,
        pi.created_at
      FROM ${schemaName}.paiement_inscription pi
      WHERE pi.inscription_id = $1
        AND pi.statut = 'en_attente'
      ORDER BY pi.created_at DESC
    `, [inscriptionId]);

    return {
      situation: situation[0],
      echeancier,
      paiements,
      paiementsEnAttente
    };
  }

  /**
   * Soumettre une preuve de paiement
   */
  async soumettrePreuvePaiement(
    parentUserId: string,
    dto: SoumettrePreuvePaiementDto,
    schemaName: string
  ): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, dto.etudiantId, schemaName);

    // Insérer dans paiement_inscription
    const result = await this.dataSource.query(`
      INSERT INTO ${schemaName}.paiement_inscription (
        inscription_id,
        etudiant_id,
        montant,
        methode_paiement,
        reference_paiement,
        date_paiement,
        preuve_url,
        commentaire,
        statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'en_attente')
      RETURNING id
    `, [
      dto.inscriptionId,
      dto.etudiantId,
      dto.montant,
      dto.methodePaiement,
      dto.referencePaiement,
      dto.datePaiement,
      dto.preuveUrl,
      dto.commentaire
    ]);

    // Créer une notification pour le caissier
    await this.dataSource.query(`
      INSERT INTO ${schemaName}.notification (
        utilisateur_id,
        titre,
        message,
        type_notification,
        lien
      )
      SELECT 
        u.id,
        'Nouveau paiement à valider',
        'Un parent a soumis une preuve de paiement de ' || $1 || ' pour validation',
        'paiement',
        '/caisse/validations/' || $2
      FROM ${schemaName}.utilisateur u
      WHERE u.role = 'caissier' AND u.actif = true
    `, [dto.montant, result[0].id]);

    return {
      id: result[0].id,
      message: 'Preuve de paiement soumise avec succès. Elle sera validée par le caissier.'
    };
  }

  /**
   * Emploi du temps de l'étudiant
   */
  async getEmploiDuTemps(
    parentUserId: string,
    etudiantId: string,
    schemaName: string,
    query: GetEmploiDuTempsQueryDto
  ): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, etudiantId, schemaName);

    // Récupérer l'année académique active de l'étudiant
    const inscription = await this.dataSource.query(`
      SELECT i.annee_academique_id, i.parcours_id
      FROM ${schemaName}.inscription i
      WHERE i.etudiant_id = $1 AND i.statut = 'validee'
      ORDER BY i.date_inscription DESC
      LIMIT 1
    `, [etudiantId]);

    if (!inscription.length) {
      throw new NotFoundException('Aucune inscription active trouvée');
    }

    // Construire les filtres de date
    let dateFilter = '';
    const params: any[] = [inscription[0].annee_academique_id];
    let paramIndex = 2;

    if (query.dateDebut && query.dateFin) {
      dateFilter = ` AND edt.date_seance BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(query.dateDebut, query.dateFin);
    } else {
      // Par défaut, afficher la semaine en cours
      dateFilter = ` AND edt.date_seance >= DATE_TRUNC('week', CURRENT_DATE)
                     AND edt.date_seance < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week'`;
    }

    const emploiDuTemps = await this.dataSource.query(`
      SELECT 
        edt.id,
        edt.date_seance,
        edt.heure_debut,
        edt.heure_fin,
        edt.type_seance,
        edt.statut,
        ec.intitule as matiere,
        ec.code as matiere_code,
        ue.intitule as ue_nom,
        ue.code as ue_code,
        ens.nom as enseignant_nom,
        ens.prenom as enseignant_prenom,
        s.nom as salle,
        s.capacite as salle_capacite,
        b.nom as batiment
      FROM ${schemaName}.emploi_du_temps edt
      JOIN ${schemaName}.affectation_cours ac ON ac.id = edt.affectation_id
      LEFT JOIN ${schemaName}.element_constitutif ec ON ec.id = ac.ec_id
      LEFT JOIN ${schemaName}.unite_enseignement ue ON ue.id = ac.ue_id OR ue.id = ec.ue_id
      LEFT JOIN ${schemaName}.enseignant ens ON ens.id = ac.enseignant_id
      LEFT JOIN ${schemaName}.salle s ON s.id = edt.salle_id
      LEFT JOIN ${schemaName}.batiment b ON b.id = s.batiment_id
      WHERE ac.annee_academique_id = $1
        AND edt.statut IN ('planifie', 'realise')
        ${dateFilter}
      ORDER BY edt.date_seance, edt.heure_debut
    `, params);

    return emploiDuTemps;
  }

  /**
   * Autoriser une sortie ou absence
   */
  async autoriserSortie(
    parentUserId: string,
    dto: AutorisationSortieDto,
    schemaName: string
  ): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, dto.etudiantId, schemaName);

    // Vérifier si l'étudiant est mineur
    const estMineur = await this.estMineur(dto.etudiantId, schemaName);

    // Insérer l'autorisation dans la table autorisation_sortie (si elle existe dans le schéma)
    // Sinon, utiliser une table générique ou créer un enregistrement dans une table existante
    
    try {
      const result = await this.dataSource.query(`
        INSERT INTO ${schemaName}.autorisation_sortie (
          etudiant_id,
          type,
          date_debut,
          date_fin,
          heure_debut,
          heure_fin,
          motif,
          autorisation_parentale_url,
          est_mineur,
          statut
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'en_attente')
        RETURNING id
      `, [
        dto.etudiantId,
        dto.type,
        dto.dateDebut,
        dto.dateFin,
        dto.heureDebut,
        dto.heureFin,
        dto.motif,
        dto.justificatifUrl,
        estMineur
      ]);

      // Notifier le surveillant général
      await this.dataSource.query(`
        INSERT INTO ${schemaName}.notification (
          utilisateur_id,
          titre,
          message,
          type_notification,
          lien
        )
        SELECT 
          u.id,
          'Nouvelle autorisation parentale',
          'Un parent a soumis une autorisation de sortie/absence pour validation',
          'info',
          '/surveillance/autorisations/' || $1
        FROM ${schemaName}.utilisateur u
        WHERE u.role = 'surveillant_general' AND u.actif = true
      `, [result[0].id]);

      return {
        id: result[0].id,
        message: 'Autorisation soumise avec succès. Elle sera traitée par le surveillant général.'
      };
    } catch (error) {
      this.logger.error('Erreur lors de la création de l\'autorisation', error);
      throw new BadRequestException('Impossible de créer l\'autorisation. Veuillez contacter l\'administration.');
    }
  }

  /**
   * Justifier une absence
   */
  async justifierAbsence(
    parentUserId: string,
    dto: JustifierAbsenceDto,
    schemaName: string
  ): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, dto.etudiantId, schemaName);

    // Mettre à jour la présence
    await this.dataSource.query(`
      UPDATE ${schemaName}.presence
      SET 
        justifie = true,
        motif = $1,
        justificatif_url = $2,
        updated_at = NOW()
      WHERE id = $3 AND etudiant_id = $4
    `, [dto.motif, dto.justificatifUrl, dto.presenceId, dto.etudiantId]);

    return {
      message: 'Absence justifiée avec succès'
    };
  }

  /**
   * Messagerie - Envoyer un message
   */
  async envoyerMessage(
    parentUserId: string,
    dto: EnvoyerMessageDto,
    schemaName: string
  ): Promise<any> {
    await this.verifierLienParentEnfant(parentUserId, dto.etudiantId, schemaName);

    // Récupérer le destinataire
    let destinataireId = dto.destinataireId;
    
    if (!destinataireId) {
      // Trouver un destinataire par défaut selon le type
      const destinataire = await this.dataSource.query(`
        SELECT id FROM ${schemaName}.utilisateur
        WHERE role = $1 AND actif = true
        LIMIT 1
      `, [dto.destinataireType]);

      if (!destinataire.length) {
        throw new NotFoundException(`Aucun ${dto.destinataireType} disponible`);
      }
      destinataireId = destinataire[0].id;
    }

    // Insérer le message
    const result = await this.dataSource.query(`
      INSERT INTO ${schemaName}.message (
        expediteur_id,
        destinataire_id,
        sujet,
        contenu,
        piece_jointe_url,
        etudiant_concerne_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      parentUserId,
      destinataireId,
      dto.sujet,
      dto.message,
      dto.pieceJointeUrl,
      dto.etudiantId
    ]);

    // Créer une notification pour le destinataire
    await this.dataSource.query(`
      INSERT INTO ${schemaName}.notification (
        utilisateur_id,
        titre,
        message,
        type_notification,
        lien
      ) VALUES ($1, $2, $3, 'info', $4)
    `, [
      destinataireId,
      'Nouveau message d\'un parent',
      `Nouveau message: ${dto.sujet}`,
      `/messages/${result[0].id}`
    ]);

    return {
      id: result[0].id,
      message: 'Message envoyé avec succès'
    };
  }

  /**
   * Messagerie - Récupérer les messages
   */
  async getMessages(
    parentUserId: string,
    schemaName: string,
    query: GetMessagesQueryDto
  ): Promise<any> {
    let filters = '';
    const params: any[] = [parentUserId];
    let paramIndex = 2;

    if (query.etudiantId) {
      filters += ` AND m.etudiant_concerne_id = $${paramIndex}`;
      params.push(query.etudiantId);
      paramIndex++;
    }

    if (query.nonLus) {
      filters += ` AND m.lu = false`;
    }

    const limit = query.limit || 50;

    const messages = await this.dataSource.query(`
      SELECT 
        m.id,
        m.sujet,
        m.contenu,
        m.piece_jointe_url,
        m.lu,
        m.lu_at,
        m.created_at,
        m.parent_id,
        dest.nom as destinataire_nom,
        dest.prenom as destinataire_prenom,
        dest.role as destinataire_role,
        exp.nom as expediteur_nom,
        exp.prenom as expediteur_prenom,
        e.nom as etudiant_nom,
        e.prenom as etudiant_prenom
      FROM ${schemaName}.message m
      LEFT JOIN ${schemaName}.utilisateur dest ON dest.id = m.destinataire_id
      LEFT JOIN ${schemaName}.utilisateur exp ON exp.id = m.expediteur_id
      LEFT JOIN ${schemaName}.etudiant e ON e.id = m.etudiant_concerne_id
      WHERE (m.expediteur_id = $1 OR m.destinataire_id = $1)
        ${filters}
      ORDER BY m.created_at DESC
      LIMIT ${limit}
    `, params);

    return messages;
  }

  /**
   * Notifications du parent
   */
  async getNotifications(parentUserId: string, schemaName: string): Promise<any> {
    // Récupérer les enfants du parent
    const enfants = await this.getEnfants(parentUserId, schemaName);
    const enfantIds = enfants.map(e => e.id);

    if (!enfantIds.length) {
      return [];
    }

    // Récupérer les notifications liées aux enfants
    const notifications = await this.dataSource.query(`
      SELECT 
        n.id,
        n.titre,
        n.message,
        n.type_notification,
        n.lue,
        n.lue_at,
        n.lien,
        n.created_at,
        e.nom as etudiant_nom,
        e.prenom as etudiant_prenom
      FROM ${schemaName}.notification n
      LEFT JOIN ${schemaName}.etudiant e ON e.utilisateur_id = n.utilisateur_id
      WHERE (
        n.utilisateur_id = $1
        OR e.id = ANY($2)
        OR n.type_notification IN ('paiement', 'absence', 'discipline', 'note')
      )
      ORDER BY n.created_at DESC
      LIMIT 20
    `, [parentUserId, enfantIds]);

    return notifications;
  }

  /**
   * Marquer une notification comme lue
   */
  async marquerNotificationLue(
    parentUserId: string,
    notificationId: string,
    schemaName: string
  ): Promise<any> {
    await this.dataSource.query(`
      UPDATE ${schemaName}.notification
      SET lue = true, lue_at = NOW()
      WHERE id = $1 AND utilisateur_id = $2
    `, [notificationId, parentUserId]);

    return { message: 'Notification marquée comme lue' };
  }

  /**
   * Annonces de l'établissement pour les parents
   */
  async getAnnonces(parentUserId: string, schemaName: string): Promise<any> {
    return this.dataSource.query(`
      SELECT 
        a.id,
        a.titre,
        a.contenu,
        a.type_annonce,
        a.date_publication,
        a.date_expiration,
        a.photo_url,
        u.nom as auteur_nom,
        u.prenom as auteur_prenom
      FROM ${schemaName}.annonce a
      LEFT JOIN ${schemaName}.utilisateur u ON u.id = a.auteur_id
      WHERE a.cible IN ('tous', 'parents')
        AND a.publie = true
        AND (a.date_expiration IS NULL OR a.date_expiration >= CURRENT_DATE)
      ORDER BY a.date_publication DESC
      LIMIT 10
    `);
  }
}

// Made with Bob
