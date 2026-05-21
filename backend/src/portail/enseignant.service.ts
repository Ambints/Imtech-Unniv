import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TenantConnectionService } from '../tenants/tenant-connection.service';

@Injectable()
export class PortailEnseignantService {
  private readonly logger = new Logger(PortailEnseignantService.name);

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  // ========== PROFIL & MES COURS ==========
  async getProfil(utilisateurId: string): Promise<any> {
    const profil = await this.dataSource.query(`
      SELECT
        e.*,
        d.nom as departement_nom,
        u.email, u.telephone, u.photo_url
      FROM enseignant e
      LEFT JOIN departement d ON d.id = e.departement_id
      JOIN utilisateur u ON u.id = e.utilisateur_id
      WHERE e.utilisateur_id = $1
    `, [utilisateurId]);

    if (!profil.length) {
      // Si l'enseignant n'existe pas, retourner un profil par défaut basé sur l'utilisateur
      const user = await this.dataSource.query(`
        SELECT id, nom, prenom, email, telephone, photo_url
        FROM utilisateur WHERE id = $1
      `, [utilisateurId]);
      
      if (!user.length) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      return {
        utilisateur_id: user[0].id,
        nom: user[0].nom,
        prenom: user[0].prenom,
        email: user[0].email,
        telephone: user[0].telephone,
        photo_url: user[0].photo_url,
        departement_nom: null,
        stats: { nb_cours: 0, nb_annees: 0 }
      };
    }

    // Ajouter les statistiques
    const stats = await this.dataSource.query(`
      SELECT
        COUNT(DISTINCT ac.id) as nb_cours,
        COUNT(DISTINCT ac.annee_academique_id) as nb_annees
      FROM affectation_cours ac
      JOIN enseignant e ON e.id = ac.enseignant_id
      WHERE e.utilisateur_id = $1
    `, [utilisateurId]);

    return { ...profil[0], stats: stats[0] || { nb_cours: 0, nb_annees: 0 } };
  }

  async getMesCours(tenantId: string, utilisateurId: string, anneeAcademiqueId?: string): Promise<any[]> {
    await this.tenantConnection.setTenantSchema(tenantId);
    const connection = this.tenantConnection.getConnection();
    
    // Vérifier si l'enseignant existe
    const enseignant = await connection.query(`
      SELECT id FROM enseignant WHERE utilisateur_id = $1
    `, [utilisateurId]);

    if (!enseignant.length) {
      return []; // Retourner un tableau vide si pas d'enseignant
    }
    
    const anneeFilter = anneeAcademiqueId
      ? `AND ac.annee_academique_id = '${anneeAcademiqueId}'`
      : `AND aa.active = true`;

    const cours = await connection.query(`
      SELECT
        ac.id,
        ac.enseignant_id,
        ac.ue_id,
        ac.ec_id,
        ac.type_seance,
        ac.volume_prevu,
        ac.volume_realise,
        ac.annee_academique_id,
        COALESCE(ec.intitule, ue.intitule) as cours_nom,
        COALESCE(ec.code, ue.code) as cours_code,
        ue.credits_ects as credits_ects,
        ue.intitule as ue_nom,
        ue.code as ue_code,
        ue.semestre,
        aa.libelle as annee_academique,
        aa.date_debut,
        aa.date_fin,
        0 as nb_seances,
        0 as nb_etudiants
      FROM affectation_cours ac
      LEFT JOIN element_constitutif ec ON ec.id = ac.ec_id
      LEFT JOIN unite_enseignement ue ON ue.id = COALESCE(ac.ue_id, ec.ue_id)
      JOIN annee_academique aa ON aa.id = ac.annee_academique_id
      JOIN enseignant e ON e.id = ac.enseignant_id
      WHERE e.utilisateur_id = $1 ${anneeFilter}
      ORDER BY aa.date_debut DESC, ue.code, COALESCE(ec.code, '')
    `, [utilisateurId]);

    return cours || [];
  }

  async getEtudiantsParCours(affectationId: string): Promise<any[]> {
    // Retourner un tableau vide car la relation parcours n'existe pas dans affectation_cours
    return [];
  }

  // ========== SUPPORTS DE COURS ==========
  async uploadSupportCours(data: any, utilisateurId: string): Promise<any> {
    const support = await this.dataSource.query(`
      INSERT INTO support_cours (
        titre, description, type_fichier, fichier_url, ec_id,
        auteur_id, date_depot, partage_parcours_ids
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
      RETURNING *
    `, [data.titre, data.description, data.typeFichier, data.fichierUrl, 
        data.ecId, utilisateurId, data.parcoursIds || []]);

    return support[0];
  }

  async getSupportsCours(tenantId: string, utilisateurId: string, ecId?: string): Promise<any[]> {
    await this.tenantConnection.setTenantSchema(tenantId);
    
    let query = `
      SELECT sc.*, ec.intitule as ec_nom
      FROM support_cours sc
      JOIN element_constitutif ec ON ec.id = sc.ec_id
      WHERE sc.auteur_id = $1
    `;
    const params: any[] = [utilisateurId];

    if (ecId) {
      query += ` AND sc.ec_id = $2`;
      params.push(ecId);
    }

    query += ` ORDER BY sc.date_depot DESC`;
    return this.dataSource.query(query, params);
  }

  async partagerSupport(supportId: string, parcoursIds: string[]): Promise<any> {
    await this.dataSource.query(`
      UPDATE support_cours 
      SET partage_parcours_ids = $1, date_partage = NOW()
      WHERE id = $2
    `, [parcoursIds, supportId]);

    return { message: 'Support partagé avec succès' };
  }

  // ========== PRÉSENCES ==========
  async getSeancesAujourdhui(utilisateurId: string): Promise<any[]> {
    return this.dataSource.query(`
      SELECT
        edt.*,
        s.nom as salle_nom,
        s.code as salle_code,
        COALESCE(ec.intitule, ue.intitule) as cours_nom,
        COALESCE(ec.code, ue.code) as ec_code,
        p.nom as parcours_nom,
        (SELECT COUNT(*) FROM presence pr WHERE pr.seance_id = edt.id) as nb_presences_pointees
      FROM emploi_du_temps edt
      JOIN affectation_cours ac ON ac.id = edt.affectation_id
      JOIN enseignant ens ON ens.id = ac.enseignant_id
      LEFT JOIN element_constitutif ec ON ec.id = ac.ec_id
      LEFT JOIN unite_enseignement ue ON ue.id = COALESCE(ac.ue_id, ec.ue_id)
      LEFT JOIN parcours p ON p.id = ue.parcours_id
      LEFT JOIN salle s ON s.id = edt.salle_id
      WHERE ens.utilisateur_id = $1
        AND edt.date_seance = CURRENT_DATE
        AND edt.statut = 'planifie'
      ORDER BY edt.heure_debut
    `, [utilisateurId]);
  }

  async getPresencesSeance(seanceId: string): Promise<any[]> {
    return this.dataSource.query(`
      SELECT 
        pr.*,
        e.nom, e.prenom, e.matricule, e.photo_url
      FROM presence pr
      JOIN etudiant e ON e.id = pr.etudiant_id
      WHERE pr.seance_id = $1
      ORDER BY e.nom, e.prenom
    `, [seanceId]);
  }

  async pointerPresences(
    seanceId: string,
    presences: { etudiantId: string; statut: 'present' | 'absent' | 'retard' }[],
    pointePar: string,
  ): Promise<any> {
    const results = [];
    
    for (const p of presences) {
      const presence = await this.dataSource.query(`
        INSERT INTO presence (seance_id, etudiant_id, statut, pointe_par, date_pointage)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (seance_id, etudiant_id) 
        DO UPDATE SET statut = $3, pointe_par = $4, date_pointage = NOW()
        RETURNING *
      `, [seanceId, p.etudiantId, p.statut, pointePar]);
      
      results.push(presence[0]);
    }

    return { pointees: results.length };
  }

  async pointerPresenceQR(seanceId: string, qrData: string, pointePar: string): Promise<any> {
    // Décoder les données QR (format: etudiantId+timestamp+signature)
    const etudiantId = qrData.split('+')[0];
    
    const presence = await this.dataSource.query(`
      INSERT INTO presence (seance_id, etudiant_id, statut, pointe_par, date_pointage, mode_pointage)
      VALUES ($1, $2, 'present', $3, NOW(), 'qr_code')
      ON CONFLICT (seance_id, etudiant_id) 
      DO UPDATE SET statut = 'present', pointe_par = $3, date_pointage = NOW(), mode_pointage = 'qr_code'
      RETURNING *
    `, [seanceId, etudiantId, pointePar]);

    return presence[0];
  }

  async genererQREnseignant(utilisateurId: string): Promise<any> {
    // Générer un QR code unique pour l'enseignant (valable pour la journée)
    const qrData = `ENS-${utilisateurId}-${Date.now()}`;
    
    return {
      qrData,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      format: 'png',
    };
  }

  // ========== NOTES ==========
  async getSessionsEvaluation(tenantId: string, utilisateurId: string): Promise<any[]> {
    await this.tenantConnection.setTenantSchema(tenantId);
    const connection = this.tenantConnection.getConnection();
    
    // Vérifier si l'enseignant existe
    const enseignant = await connection.query(`
      SELECT id FROM enseignant WHERE utilisateur_id = $1
    `, [utilisateurId]);

    if (!enseignant.length) {
      return []; // Retourner un tableau vide si pas d'enseignant
    }
    
    const sessions = await connection.query(`
      SELECT DISTINCT
        se.id,
        se.libelle,
        se.type_session,
        se.date_debut,
        se.date_fin,
        aa.libelle as annee_academique,
        COUNT(DISTINCT n.id) as notes_saisies,
        COUNT(DISTINCT i.etudiant_id) as total_etudiants
      FROM session_examen se
      JOIN annee_academique aa ON aa.id = se.annee_academique_id
      JOIN affectation_cours ac ON ac.annee_academique_id = se.annee_academique_id
      JOIN enseignant e ON e.id = ac.enseignant_id
      LEFT JOIN element_constitutif ec ON ec.id = ac.ec_id
      LEFT JOIN unite_enseignement ue ON ue.id = COALESCE(ac.ue_id, ec.ue_id)
      LEFT JOIN note n ON n.session_id = se.id AND n.ec_id = ac.ec_id
      LEFT JOIN inscription i ON i.annee_academique_id = se.annee_academique_id
        AND i.parcours_id = ue.parcours_id AND i.statut = 'validee'
      WHERE e.utilisateur_id = $1
        AND se.date_fin >= NOW()
      GROUP BY se.id, se.libelle, se.type_session, se.date_debut, se.date_fin, aa.libelle
      ORDER BY se.date_debut
    `, [utilisateurId]);

    return sessions || [];
  }

  async getInterfaceSaisieNotes(sessionId: string, affectationId: string): Promise<any> {
    const [cours, etudiants, notesExistantes] = await Promise.all([
      this.dataSource.query(`
        SELECT ac.*,
               COALESCE(ec.intitule, ue.intitule) as ec_nom,
               COALESCE(ac.ec_id, ac.ue_id) as ec_id
        FROM affectation_cours ac
        LEFT JOIN element_constitutif ec ON ec.id = ac.ec_id
        LEFT JOIN unite_enseignement ue ON ue.id = COALESCE(ac.ue_id, ec.ue_id)
        WHERE ac.id = $1
      `, [affectationId]),
      
      this.dataSource.query(`
        SELECT e.id, e.nom, e.prenom, e.matricule
        FROM inscription i
        JOIN etudiant e ON e.id = i.etudiant_id
        JOIN affectation_cours ac ON ac.annee_academique_id = i.annee_academique_id
        LEFT JOIN element_constitutif ec ON ec.id = ac.ec_id
        LEFT JOIN unite_enseignement ue ON ue.id = COALESCE(ac.ue_id, ec.ue_id)
        WHERE ac.id = $1
          AND i.parcours_id = ue.parcours_id
          AND i.statut = 'validee'
        ORDER BY e.nom, e.prenom
      `, [affectationId]),
      
      this.dataSource.query(`
        SELECT n.*
        FROM note n
        JOIN affectation_cours ac ON ac.ec_id = n.ec_id OR ac.ue_id = n.ec_id
        WHERE n.session_id = $1 AND ac.id = $2
      `, [sessionId, affectationId]),
    ]);

    return {
      cours: cours[0],
      etudiants: etudiants.map((e: any) => ({
        ...e,
        noteExistante: notesExistantes.find((n: any) => n.etudiant_id === e.id),
      })),
      sessionId,
    };
  }

  async saisirNotes(
    notes: { etudiantId: string; valeur: number; appreciation?: string }[],
    sessionId: string,
    ecId: string,
    saisiPar: string,
  ): Promise<any> {
    const results = [];
    
    for (const note of notes) {
      const saved = await this.dataSource.query(`
        INSERT INTO note (session_id, ec_id, etudiant_id, valeur, appreciation, saisi_par, date_saisie, statut)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'saisie')
        ON CONFLICT (session_id, ec_id, etudiant_id)
        DO UPDATE SET valeur = $4, appreciation = $5, saisi_par = $6, date_saisie = NOW()
        RETURNING *
      `, [sessionId, ecId, note.etudiantId, note.valeur, note.appreciation || '', saisiPar]);
      
      results.push(saved[0]);
    }

    return { saisies: results.length };
  }

  async modifierNote(noteId: string, dto: { valeur?: number; appreciation?: string }, modifiePar: string): Promise<any> {
    // Vérifier que la note n'est pas verrouillée
    const note = await this.dataSource.query(`
      SELECT n.*, se.date_fin, se.date_deliberation
      FROM note n
      JOIN session_examen se ON se.id = n.session_id
      WHERE n.id = $1
    `, [noteId]);

    if (!note.length) throw new NotFoundException('Note non trouvée');

    if (note[0].date_deliberation) {
      throw new Error('Impossible de modifier une note après délibération');
    }

    const updated = await this.dataSource.query(`
      UPDATE note 
      SET valeur = COALESCE($1, valeur), 
          appreciation = COALESCE($2, appreciation),
          modifie_par = $3,
          date_modification = NOW()
      WHERE id = $4
      RETURNING *
    `, [dto.valeur, dto.appreciation, modifiePar, noteId]);

    return updated[0];
  }

  async getApercuNotes(sessionId: string, affectationId: string): Promise<any> {
    const stats = await this.dataSource.query(`
      SELECT 
        COUNT(*) as total_notes,
        AVG(valeur) as moyenne,
        MIN(valeur) as note_min,
        MAX(valeur) as note_max,
        COUNT(*) FILTER (WHERE valeur >= 10) as nb_admis,
        COUNT(*) FILTER (WHERE valeur < 10) as nb_ajournes
      FROM note n
      JOIN affectation_cours ac ON ac.ec_id = n.ec_id
      WHERE n.session_id = $1 AND ac.id = $2
    `, [sessionId, affectationId]);

    const distribution = await this.dataSource.query(`
      SELECT 
        CASE 
          WHEN valeur < 5 THEN '0-5'
          WHEN valeur < 10 THEN '5-10'
          WHEN valeur < 12 THEN '10-12'
          WHEN valeur < 14 THEN '12-14'
          WHEN valeur < 16 THEN '14-16'
          ELSE '16-20'
        END as tranche,
        COUNT(*) as nb_etudiants
      FROM note n
      JOIN affectation_cours ac ON ac.ec_id = n.ec_id
      WHERE n.session_id = $1 AND ac.id = $2
      GROUP BY tranche
      ORDER BY tranche
    `, [sessionId, affectationId]);

    return { stats: stats[0], distribution };
  }

  // ========== SUJETS D'EXAMEN ==========
  async deposerSujetExamen(data: any): Promise<any> {
    const sujet = await this.dataSource.query(`
      INSERT INTO sujet_examen (
        session_id, ec_id, titre, description, duree_minutes,
        fichier_sujet_url, depose_par, date_depot, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), 'soumis')
      RETURNING *
    `, [data.sessionId, data.ecId, data.titre, data.description, data.dureeMinutes,
        data.fichierSujetUrl, data.deposePar]);

    return sujet[0];
  }

  async deposerCorrection(id: string, fichierCorrectionUrl: string, deposePar: string): Promise<any> {
    await this.dataSource.query(`
      UPDATE sujet_examen 
      SET fichier_correction_url = $1, 
          date_depot_correction = NOW(),
          statut = 'complet'
      WHERE id = $2 AND depose_par = $3
    `, [fichierCorrectionUrl, id, deposePar]);

    return { message: 'Correction déposée avec succès' };
  }

  async getMesSujets(utilisateurId: string): Promise<any[]> {
    return this.dataSource.query(`
      SELECT se.*, ec.intitule as ec_nom, sess.libelle as session_libelle
      FROM sujet_examen se
      JOIN element_constitutif ec ON ec.id = se.ec_id
      JOIN session_examen sess ON sess.id = se.session_id
      WHERE se.depose_par = $1
      ORDER BY se.date_depot DESC
    `, [utilisateurId]);
  }

  // ========== MESSAGERIE ==========
  async envoyerMessageGroupe(dto: any, expediteurId: string): Promise<any> {
    // Récupérer les étudiants selon les critères
    let query = `
      SELECT DISTINCT e.id, e.email
      FROM etudiant e
      JOIN inscription i ON i.etudiant_id = e.id
      WHERE i.statut = 'validee'
    `;
    const conditions = [];
    const params: any[] = [];
    let paramCount = 0;

    if (dto.parcoursId) {
      conditions.push(`i.parcours_id = $${++paramCount}`);
      params.push(dto.parcoursId);
    }
    if (dto.niveau) {
      conditions.push(`i.annee_niveau = $${++paramCount}`);
      params.push(dto.niveau);
    }
    if (dto.affectationId) {
      conditions.push(`EXISTS (
        SELECT 1 FROM affectation_cours ac 
        WHERE ac.id = $${++paramCount} 
        AND ac.parcours_id = i.parcours_id 
        AND ac.annee_academique_id = i.annee_academique_id
      )`);
      params.push(dto.affectationId);
    }

    if (conditions.length) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    const destinataires = await this.dataSource.query(query, params);

    // Envoyer les messages
    const messages = [];
    for (const dest of destinataires) {
      const msg = await this.dataSource.query(`
        INSERT INTO message (expediteur_id, destinataire_id, sujet, contenu, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `, [expediteurId, dest.id, dto.sujet || 'Message de votre enseignant', dto.message]);
      messages.push(msg[0]);
    }

    return { envoyes: messages.length, destinataires: destinataires.length };
  }

  async envoyerMessageIndividuel(dto: any, expediteurId: string): Promise<any> {
    const msg = await this.dataSource.query(`
      INSERT INTO message (expediteur_id, destinataire_id, sujet, contenu, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `, [expediteurId, dto.etudiantId, dto.sujet || 'Message de votre enseignant', dto.message]);

    return msg[0];
  }

  async getMesMessages(tenantId: string, utilisateurId: string): Promise<any[]> {
    await this.tenantConnection.setTenantSchema(tenantId);
    
    return this.dataSource.query(`
      SELECT 
        m.*,
        CASE 
          WHEN m.expediteur_id = $1 THEN 'envoyé'
          ELSE 'reçu'
        END as direction,
        e_dest.nom as destinataire_nom,
        e_dest.prenom as destinataire_prenom,
        e_exp.nom as expediteur_nom,
        e_exp.prenom as expediteur_prenom
      FROM message m
      LEFT JOIN etudiant e_dest ON e_dest.id = m.destinataire_id
      LEFT JOIN enseignant e_exp ON e_exp.utilisateur_id = m.expediteur_id
      WHERE m.expediteur_id = $1 OR m.destinataire_id = $1
      ORDER BY m.created_at DESC
      LIMIT 50
    `, [utilisateurId]);
  }

  // ========== STAGES & MÉMOIRES ==========
  async getStagesSupervises(utilisateurId: string): Promise<any[]> {
    return this.dataSource.query(`
      SELECT 
        s.*,
        e.nom as etudiant_nom, e.prenom as etudiant_prenom,
        p.nom as parcours_nom,
        (SELECT COUNT(*) FROM fiche_suivi_stage WHERE stage_id = s.id) as nb_fiches_suivi
      FROM stage s
      JOIN etudiant e ON e.id = s.etudiant_id
      JOIN parcours p ON p.id = s.parcours_id
      WHERE s.encadrant_id = $1 OR s.rapporteur_id = $1
      ORDER BY s.date_debut DESC
    `, [utilisateurId]);
  }

  async remplirFicheSuivi(stageId: string, dto: any, auteurId: string): Promise<any> {
    const fiche = await this.dataSource.query(`
      INSERT INTO fiche_suivi_stage (
        stage_id, date_rencontre, travail_effectue, observations,
        note_avancement, auteur_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `, [stageId, dto.dateRencontre, dto.travailEffectue, dto.observations, 
        dto.noteAvancement, auteurId]);

    return fiche[0];
  }

  async evaluerSoutenance(soutenanceId: string, dto: any, evaluateurId: string): Promise<any> {
    const evalResult = await this.dataSource.query(`
      INSERT INTO evaluation_soutenance (
        soutenance_id, evaluateur_id, note, appreciation, date_evaluation
      ) VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (soutenance_id, evaluateur_id)
      DO UPDATE SET note = $3, appreciation = $4, date_evaluation = NOW()
      RETURNING *
    `, [soutenanceId, evaluateurId, dto.note, dto.appreciation]);

    return evalResult[0];
  }

  // ========== RESSOURCES ==========
  async demanderRessources(dto: any, demandeurId: string): Promise<any> {
    const demande = await this.dataSource.query(`
      INSERT INTO demande_ressource (
        type_ressource, date_souhaitee, heure_debut, heure_fin,
        motif, nb_participants, materiel_requis, demandeur_id, statut, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'soumise', NOW())
      RETURNING *
    `, [dto.type, dto.dateSouhaitee, dto.heureDebut, dto.heureFin,
        dto.motif, dto.nbParticipants, dto.materielRequis, demandeurId]);

    return demande[0];
  }

  async getMesDemandesRessources(tenantId: string, utilisateurId: string): Promise<any[]> {
    await this.tenantConnection.setTenantSchema(tenantId);
    
    return this.dataSource.query(`
      SELECT * FROM demande_ressource WHERE demandeur_id = $1 ORDER BY created_at DESC
    `, [utilisateurId]);
  }

  async getSallesDisponibles(date: string, heureDebut: string, heureFin: string, type?: string): Promise<any[]> {
    let query = `
      SELECT s.*
      FROM salle s
      WHERE s.id NOT IN (
        SELECT edt.salle_id
        FROM emploi_du_temps edt
        WHERE edt.date_seance = $1
          AND edt.heure_debut < $3
          AND edt.heure_fin > $2
          AND edt.statut = 'planifie'
      )
      AND s.id NOT IN (
        SELECT rs.salle_id
        FROM reservation_salle rs
        WHERE rs.date_reservation = $1
          AND rs.heure_debut < $3
          AND rs.heure_fin > $2
          AND rs.statut = 'approuve'
      )
    `;
    const params: any[] = [date, heureDebut, heureFin];

    if (type) {
      query += ` AND s.type = $4`;
      params.push(type);
    }

    query += ` ORDER BY s.code`;
    return this.dataSource.query(query, params);
  }

  // ========== STATISTIQUES ==========
  async getMesStats(tenantId: string, utilisateurId: string, anneeAcademiqueId?: string): Promise<any> {
    await this.tenantConnection.setTenantSchema(tenantId);
    const connection = this.tenantConnection.getConnection();
    
    // Vérifier si l'enseignant existe
    const enseignant = await connection.query(`
      SELECT id FROM enseignant WHERE utilisateur_id = $1
    `, [utilisateurId]);

    if (!enseignant.length) {
      // Retourner des stats vides si pas d'enseignant
      return {
        nbCours: 0,
        nbSeances: 0,
        nbEtudiants: 0,
        tauxPresence: 0,
      };
    }
    
    const anneeFilter = anneeAcademiqueId
      ? `AND ac.annee_academique_id = '${anneeAcademiqueId}'`
      : `AND aa.active = true`;

    const [nbCours] = await Promise.all([
      connection.query(`
        SELECT COUNT(DISTINCT ac.id) as count
        FROM affectation_cours ac
        JOIN enseignant e ON e.id = ac.enseignant_id
        JOIN annee_academique aa ON aa.id = ac.annee_academique_id
        WHERE e.utilisateur_id = $1 ${anneeFilter}
      `, [utilisateurId]),
    ]);

    return {
      nb_cours: parseInt(nbCours[0]?.count || 0),
      nb_seances: 0,
      nb_etudiants: 0,
      taux_presence: 0,
      nb_notes_a_saisir: 0,
      nb_ressources: 0,
    };
  }

  async getTauxReussiteEC(affectationId: string): Promise<any> {
    const result = await this.dataSource.query(`
      SELECT 
        ROUND(100.0 * COUNT(*) FILTER (WHERE n.valeur >= 10) / NULLIF(COUNT(*), 0), 2) as taux_reussite,
        AVG(n.valeur) as moyenne,
        COUNT(*) as total_notes
      FROM note n
      JOIN affectation_cours ac ON ac.ec_id = n.ec_id
      WHERE ac.id = $1
    `, [affectationId]);

    return result[0];
  }

  // ========== GÉNÉRATION DE COURS ==========
  async creerUniteEnseignement(dto: any, utilisateurId: string): Promise<any> {
    // Vérifier que l'enseignant existe
    const enseignant = await this.dataSource.query(`
      SELECT id FROM enseignant WHERE utilisateur_id = $1
    `, [utilisateurId]);

    if (!enseignant.length) {
      throw new NotFoundException('Enseignant non trouvé');
    }

    const ue = await this.dataSource.query(`
      INSERT INTO unite_enseignement (
        parcours_id, code, intitule, credits_ects, coefficient,
        volume_cm, volume_td, volume_tp, semestre, annee_niveau,
        type_ue, enseignant_id, actif
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
      RETURNING *
    `, [
      dto.parcoursId, dto.code, dto.intitule, dto.creditsEcts || 3,
      dto.coefficient || 1.0, dto.volumeCm || 0, dto.volumeTd || 0,
      dto.volumeTp || 0, dto.semestre, dto.anneeNiveau,
      dto.typeUe || 'obligatoire', enseignant[0].id
    ]);

    return ue[0];
  }

  async modifierUniteEnseignement(ueId: string, dto: any, utilisateurId: string): Promise<any> {
    // Vérifier que l'enseignant est responsable de l'UE
    const ue = await this.dataSource.query(`
      SELECT ue.* FROM unite_enseignement ue
      JOIN enseignant e ON e.id = ue.enseignant_id
      WHERE ue.id = $1 AND e.utilisateur_id = $2
    `, [ueId, utilisateurId]);

    if (!ue.length) {
      throw new NotFoundException('UE non trouvée ou vous n\'êtes pas responsable');
    }

    const updated = await this.dataSource.query(`
      UPDATE unite_enseignement
      SET code = COALESCE($1, code),
          intitule = COALESCE($2, intitule),
          credits_ects = COALESCE($3, credits_ects),
          coefficient = COALESCE($4, coefficient),
          volume_cm = COALESCE($5, volume_cm),
          volume_td = COALESCE($6, volume_td),
          volume_tp = COALESCE($7, volume_tp),
          semestre = COALESCE($8, semestre),
          annee_niveau = COALESCE($9, annee_niveau),
          type_ue = COALESCE($10, type_ue)
      WHERE id = $11
      RETURNING *
    `, [
      dto.code, dto.intitule, dto.creditsEcts, dto.coefficient,
      dto.volumeCm, dto.volumeTd, dto.volumeTp, dto.semestre,
      dto.anneeNiveau, dto.typeUe, ueId
    ]);

    return updated[0];
  }

  async getMesUnitesEnseignement(tenantId: string, utilisateurId: string): Promise<any[]> {
    await this.tenantConnection.setTenantSchema(tenantId);
    
    return this.dataSource.query(`
      SELECT
        ue.*,
        p.nom as parcours_nom,
        p.code as parcours_code,
        (SELECT COUNT(*) FROM element_constitutif WHERE ue_id = ue.id) as nb_elements,
        (SELECT COUNT(*) FROM affectation_cours WHERE ue_id = ue.id) as nb_affectations
      FROM unite_enseignement ue
      JOIN parcours p ON p.id = ue.parcours_id
      JOIN enseignant e ON e.id = ue.enseignant_id
      WHERE e.utilisateur_id = $1
      ORDER BY ue.semestre, ue.code
    `, [utilisateurId]);
  }

  async creerElementConstitutif(dto: any, utilisateurId: string): Promise<any> {
    // Vérifier que l'enseignant est responsable de l'UE
    const ue = await this.dataSource.query(`
      SELECT ue.* FROM unite_enseignement ue
      JOIN enseignant e ON e.id = ue.enseignant_id
      WHERE ue.id = $1 AND e.utilisateur_id = $2
    `, [dto.ueId, utilisateurId]);

    if (!ue.length) {
      throw new NotFoundException('UE non trouvée ou vous n\'êtes pas responsable');
    }

    const ec = await this.dataSource.query(`
      INSERT INTO element_constitutif (
        ue_id, code, intitule, coefficient, actif
      ) VALUES ($1, $2, $3, $4, true)
      RETURNING *
    `, [dto.ueId, dto.code, dto.intitule, dto.coefficient || 1.0]);

    return ec[0];
  }

  async modifierElementConstitutif(ecId: string, dto: any, utilisateurId: string): Promise<any> {
    // Vérifier que l'enseignant est responsable de l'UE parent
    const ec = await this.dataSource.query(`
      SELECT ec.* FROM element_constitutif ec
      JOIN unite_enseignement ue ON ue.id = ec.ue_id
      JOIN enseignant e ON e.id = ue.enseignant_id
      WHERE ec.id = $1 AND e.utilisateur_id = $2
    `, [ecId, utilisateurId]);

    if (!ec.length) {
      throw new NotFoundException('EC non trouvé ou vous n\'êtes pas responsable de l\'UE');
    }

    const updated = await this.dataSource.query(`
      UPDATE element_constitutif
      SET code = COALESCE($1, code),
          intitule = COALESCE($2, intitule),
          coefficient = COALESCE($3, coefficient)
      WHERE id = $4
      RETURNING *
    `, [dto.code, dto.intitule, dto.coefficient, ecId]);

    return updated[0];
  }

  async supprimerElementConstitutif(ecId: string, utilisateurId: string): Promise<any> {
    // Vérifier que l'enseignant est responsable de l'UE parent
    const ec = await this.dataSource.query(`
      SELECT ec.* FROM element_constitutif ec
      JOIN unite_enseignement ue ON ue.id = ec.ue_id
      JOIN enseignant e ON e.id = ue.enseignant_id
      WHERE ec.id = $1 AND e.utilisateur_id = $2
    `, [ecId, utilisateurId]);

    if (!ec.length) {
      throw new NotFoundException('EC non trouvé ou vous n\'êtes pas responsable de l\'UE');
    }

    // Vérifier qu'il n'y a pas d'affectations ou de notes
    const hasData = await this.dataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM affectation_cours WHERE ec_id = $1) as nb_affectations,
        (SELECT COUNT(*) FROM note WHERE ec_id = $1) as nb_notes
    `, [ecId]);

    if (hasData[0].nb_affectations > 0 || hasData[0].nb_notes > 0) {
      throw new Error('Impossible de supprimer: des affectations ou notes existent pour cet EC');
    }

    await this.dataSource.query(`DELETE FROM element_constitutif WHERE id = $1`, [ecId]);
    return { message: 'Élément constitutif supprimé avec succès' };
  }

  async getElementsConstitutifs(ueId: string, utilisateurId: string): Promise<any[]> {
    // Vérifier que l'enseignant est responsable de l'UE
    const ue = await this.dataSource.query(`
      SELECT ue.* FROM unite_enseignement ue
      JOIN enseignant e ON e.id = ue.enseignant_id
      WHERE ue.id = $1 AND e.utilisateur_id = $2
    `, [ueId, utilisateurId]);

    if (!ue.length) {
      throw new NotFoundException('UE non trouvée ou vous n\'êtes pas responsable');
    }

    return this.dataSource.query(`
      SELECT
        ec.*,
        (SELECT COUNT(*) FROM affectation_cours WHERE ec_id = ec.id) as nb_affectations,
        (SELECT COUNT(*) FROM support_cours WHERE ec_id = ec.id) as nb_supports
      FROM element_constitutif ec
      WHERE ec.ue_id = $1
      ORDER BY ec.code
    `, [ueId]);
  }

  async genererPlanCours(ueId: string, utilisateurId: string): Promise<any> {
    // Récupérer les informations complètes de l'UE
    const ue = await this.dataSource.query(`
      SELECT
        ue.*,
        p.nom as parcours_nom,
        p.code as parcours_code,
        d.nom as departement_nom,
        e.nom as enseignant_nom,
        e.prenom as enseignant_prenom,
        u.email as enseignant_email
      FROM unite_enseignement ue
      JOIN parcours p ON p.id = ue.parcours_id
      LEFT JOIN departement d ON d.id = p.departement_id
      JOIN enseignant e ON e.id = ue.enseignant_id
      JOIN utilisateur u ON u.id = e.utilisateur_id
      WHERE ue.id = $1 AND e.utilisateur_id = $2
    `, [ueId, utilisateurId]);

    if (!ue.length) {
      throw new NotFoundException('UE non trouvée ou vous n\'êtes pas responsable');
    }

    // Récupérer les éléments constitutifs
    const elements = await this.dataSource.query(`
      SELECT * FROM element_constitutif WHERE ue_id = $1 ORDER BY code
    `, [ueId]);

    // Récupérer les supports de cours
    const supports = await this.dataSource.query(`
      SELECT sc.* FROM support_cours sc
      WHERE sc.ec_id IN (SELECT id FROM element_constitutif WHERE ue_id = $1)
      ORDER BY sc.date_depot DESC
    `, [ueId]);

    return {
      ue: ue[0],
      elements,
      supports,
      volumeTotal: (ue[0].volume_cm || 0) + (ue[0].volume_td || 0) + (ue[0].volume_tp || 0),
      generatedAt: new Date(),
    };
  }

  async dupliquerUniteEnseignement(ueId: string, dto: any, utilisateurId: string): Promise<any> {
    // Vérifier que l'enseignant est responsable de l'UE source
    const ueSource = await this.dataSource.query(`
      SELECT ue.* FROM unite_enseignement ue
      JOIN enseignant e ON e.id = ue.enseignant_id
      WHERE ue.id = $1 AND e.utilisateur_id = $2
    `, [ueId, utilisateurId]);

    if (!ueSource.length) {
      throw new NotFoundException('UE source non trouvée ou vous n\'êtes pas responsable');
    }

    const enseignant = await this.dataSource.query(`
      SELECT id FROM enseignant WHERE utilisateur_id = $1
    `, [utilisateurId]);

    // Créer la nouvelle UE
    const nouvelleUe = await this.dataSource.query(`
      INSERT INTO unite_enseignement (
        parcours_id, code, intitule, credits_ects, coefficient,
        volume_cm, volume_td, volume_tp, semestre, annee_niveau,
        type_ue, enseignant_id, actif
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
      RETURNING *
    `, [
      dto.parcoursId || ueSource[0].parcours_id,
      dto.code || ueSource[0].code + '_COPIE',
      dto.intitule || ueSource[0].intitule + ' (Copie)',
      ueSource[0].credits_ects,
      ueSource[0].coefficient,
      ueSource[0].volume_cm,
      ueSource[0].volume_td,
      ueSource[0].volume_tp,
      dto.semestre || ueSource[0].semestre,
      dto.anneeNiveau || ueSource[0].annee_niveau,
      ueSource[0].type_ue,
      enseignant[0].id
    ]);

    // Dupliquer les éléments constitutifs si demandé
    if (dto.dupliquerElements) {
      const elements = await this.dataSource.query(`
        SELECT * FROM element_constitutif WHERE ue_id = $1
      `, [ueId]);

      for (const el of elements) {
        await this.dataSource.query(`
          INSERT INTO element_constitutif (ue_id, code, intitule, coefficient, actif)
          VALUES ($1, $2, $3, $4, $5)
        `, [nouvelleUe[0].id, el.code, el.intitule, el.coefficient, el.actif]);
      }
    }

    return nouvelleUe[0];
  }

  async getParcoursDisponibles(tenantId: string): Promise<any[]> {
    await this.tenantConnection.setTenantSchema(tenantId);
    
    return this.dataSource.query(`
      SELECT
        p.*,
        d.nom as departement_nom,
        (SELECT COUNT(*) FROM unite_enseignement WHERE parcours_id = p.id) as nb_ues
      FROM parcours p
      LEFT JOIN departement d ON d.id = p.departement_id
      WHERE p.actif = true
      ORDER BY d.nom, p.nom
    `);
  }
}
