"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PortailProfesseurService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortailProfesseurService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let PortailProfesseurService = PortailProfesseurService_1 = class PortailProfesseurService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(PortailProfesseurService_1.name);
    }
    async getProfil(utilisateurId) {
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
            throw new common_1.NotFoundException('Profil enseignant non trouvé');
        }
        const stats = await this.dataSource.query(`
      SELECT 
        COUNT(DISTINCT ac.id) as nb_cours,
        COUNT(DISTINCT ac.annee_academique_id) as nb_annees
      FROM affectation_cours ac
      JOIN enseignant e ON e.id = ac.enseignant_id
      WHERE e.utilisateur_id = $1
    `, [utilisateurId]);
        return { ...profil[0], stats: stats[0] };
    }
    async getMesCours(utilisateurId, anneeAcademiqueId) {
        const anneeFilter = anneeAcademiqueId
            ? `AND ac.annee_academique_id = '${anneeAcademiqueId}'`
            : `AND aa.active = true`;
        return this.dataSource.query(`
      SELECT 
        ac.*,
        ec.intitule as ec_nom,
        ec.code as ec_code,
        ec.credits_ects,
        ue.intitule as ue_nom,
        ue.code as ue_code,
        p.nom as parcours_nom,
        p.code as parcours_code,
        aa.libelle as annee_academique,
        (SELECT COUNT(*) FROM emploi_du_temps edt WHERE edt.affectation_id = ac.id) as nb_seances,
        (SELECT COUNT(DISTINCT i.etudiant_id) 
         FROM inscription i 
         WHERE i.parcours_id = ac.parcours_id 
         AND i.annee_academique_id = ac.annee_academique_id 
         AND i.statut = 'validee') as nb_etudiants
      FROM affectation_cours ac
      JOIN element_constitutif ec ON ec.id = ac.ec_id
      JOIN unite_enseignement ue ON ue.id = ec.ue_id
      JOIN parcours p ON p.id = ac.parcours_id
      JOIN annee_academique aa ON aa.id = ac.annee_academique_id
      JOIN enseignant e ON e.id = ac.enseignant_id
      WHERE e.utilisateur_id = $1 ${anneeFilter}
      ORDER BY p.code, ec.code
    `, [utilisateurId]);
    }
    async getEtudiantsParCours(affectationId) {
        return this.dataSource.query(`
      SELECT 
        e.*,
        i.date_inscription,
        i.annee_niveau,
        i.bourse,
        (SELECT AVG(valeur) FROM note n WHERE n.etudiant_id = e.id) as moyenne_generale,
        (SELECT COUNT(*) FROM presence p 
         JOIN emploi_du_temps edt ON edt.id = p.seance_id
         WHERE p.etudiant_id = e.id AND edt.affectation_id = $1 AND p.statut = 'absent') as nb_absences
      FROM inscription i
      JOIN etudiant e ON e.id = i.etudiant_id
      JOIN affectation_cours ac ON ac.parcours_id = i.parcours_id AND ac.annee_academique_id = i.annee_academique_id
      WHERE ac.id = $1 AND i.statut = 'validee'
      ORDER BY e.nom, e.prenom
    `, [affectationId]);
    }
    async uploadSupportCours(data, utilisateurId) {
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
    async getSupportsCours(utilisateurId, ecId) {
        let query = `
      SELECT sc.*, ec.intitule as ec_nom
      FROM support_cours sc
      JOIN element_constitutif ec ON ec.id = sc.ec_id
      WHERE sc.auteur_id = $1
    `;
        const params = [utilisateurId];
        if (ecId) {
            query += ` AND sc.ec_id = $2`;
            params.push(ecId);
        }
        query += ` ORDER BY sc.date_depot DESC`;
        return this.dataSource.query(query, params);
    }
    async partagerSupport(supportId, parcoursIds) {
        await this.dataSource.query(`
      UPDATE support_cours 
      SET partage_parcours_ids = $1, date_partage = NOW()
      WHERE id = $2
    `, [parcoursIds, supportId]);
        return { message: 'Support partagé avec succès' };
    }
    async getSeancesAujourdhui(utilisateurId) {
        return this.dataSource.query(`
      SELECT 
        edt.*,
        s.nom as salle_nom,
        s.code as salle_code,
        ec.intitule as cours_nom,
        ec.code as ec_code,
        p.nom as parcours_nom,
        (SELECT COUNT(*) FROM presence pr WHERE pr.seance_id = edt.id) as nb_presences_pointees
      FROM emploi_du_temps edt
      JOIN affectation_cours ac ON ac.id = edt.affectation_id
      JOIN enseignant ens ON ens.id = ac.enseignant_id
      JOIN element_constitutif ec ON ec.id = ac.ec_id
      JOIN parcours p ON p.id = ac.parcours_id
      LEFT JOIN salle s ON s.id = edt.salle_id
      WHERE ens.utilisateur_id = $1
        AND edt.date_seance = CURRENT_DATE
        AND edt.statut = 'planifie'
      ORDER BY edt.heure_debut
    `, [utilisateurId]);
    }
    async getPresencesSeance(seanceId) {
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
    async pointerPresences(seanceId, presences, pointePar) {
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
    async pointerPresenceQR(seanceId, qrData, pointePar) {
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
    async genererQRProfesseur(utilisateurId) {
        const qrData = `PROF-${utilisateurId}-${Date.now()}`;
        return {
            qrData,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            format: 'png',
        };
    }
    async getSessionsEvaluation(utilisateurId) {
        return this.dataSource.query(`
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
      LEFT JOIN note n ON n.session_id = se.id AND n.ec_id = ac.ec_id
      LEFT JOIN inscription i ON i.annee_academique_id = se.annee_academique_id
        AND i.parcours_id = ac.parcours_id AND i.statut = 'validee'
      WHERE e.utilisateur_id = $1
        AND se.date_fin >= NOW()
      GROUP BY se.id, se.libelle, se.type_session, se.date_debut, se.date_fin, aa.libelle
      ORDER BY se.date_debut
    `, [utilisateurId]);
    }
    async getInterfaceSaisieNotes(sessionId, affectationId) {
        const [cours, etudiants, notesExistantes] = await Promise.all([
            this.dataSource.query(`
        SELECT ac.*, ec.intitule as ec_nom, ec.id as ec_id
        FROM affectation_cours ac
        JOIN element_constitutif ec ON ec.id = ac.ec_id
        WHERE ac.id = $1
      `, [affectationId]),
            this.dataSource.query(`
        SELECT e.id, e.nom, e.prenom, e.matricule
        FROM inscription i
        JOIN etudiant e ON e.id = i.etudiant_id
        JOIN affectation_cours ac ON ac.parcours_id = i.parcours_id 
          AND ac.annee_academique_id = i.annee_academique_id
        WHERE ac.id = $1 AND i.statut = 'validee'
        ORDER BY e.nom, e.prenom
      `, [affectationId]),
            this.dataSource.query(`
        SELECT n.*
        FROM note n
        JOIN affectation_cours ac ON ac.ec_id = n.ec_id
        WHERE n.session_id = $1 AND ac.id = $2
      `, [sessionId, affectationId]),
        ]);
        return {
            cours: cours[0],
            etudiants: etudiants.map((e) => ({
                ...e,
                noteExistante: notesExistantes.find((n) => n.etudiant_id === e.id),
            })),
            sessionId,
        };
    }
    async saisirNotes(notes, sessionId, ecId, saisiPar) {
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
    async modifierNote(noteId, dto, modifiePar) {
        const note = await this.dataSource.query(`
      SELECT n.*, se.date_fin, se.date_deliberation
      FROM note n
      JOIN session_examen se ON se.id = n.session_id
      WHERE n.id = $1
    `, [noteId]);
        if (!note.length)
            throw new common_1.NotFoundException('Note non trouvée');
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
    async getApercuNotes(sessionId, affectationId) {
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
    async deposerSujetExamen(data) {
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
    async deposerCorrection(id, fichierCorrectionUrl, deposePar) {
        await this.dataSource.query(`
      UPDATE sujet_examen 
      SET fichier_correction_url = $1, 
          date_depot_correction = NOW(),
          statut = 'complet'
      WHERE id = $2 AND depose_par = $3
    `, [fichierCorrectionUrl, id, deposePar]);
        return { message: 'Correction déposée avec succès' };
    }
    async getMesSujets(utilisateurId) {
        return this.dataSource.query(`
      SELECT se.*, ec.intitule as ec_nom, sess.libelle as session_libelle
      FROM sujet_examen se
      JOIN element_constitutif ec ON ec.id = se.ec_id
      JOIN session_examen sess ON sess.id = se.session_id
      WHERE se.depose_par = $1
      ORDER BY se.date_depot DESC
    `, [utilisateurId]);
    }
    async envoyerMessageGroupe(dto, expediteurId) {
        let query = `
      SELECT DISTINCT e.id, e.email
      FROM etudiant e
      JOIN inscription i ON i.etudiant_id = e.id
      WHERE i.statut = 'validee'
    `;
        const conditions = [];
        const params = [];
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
    async envoyerMessageIndividuel(dto, expediteurId) {
        const msg = await this.dataSource.query(`
      INSERT INTO message (expediteur_id, destinataire_id, sujet, contenu, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `, [expediteurId, dto.etudiantId, dto.sujet || 'Message de votre enseignant', dto.message]);
        return msg[0];
    }
    async getStagesSupervises(utilisateurId) {
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
    async remplirFicheSuivi(stageId, dto, auteurId) {
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
    async evaluerSoutenance(soutenanceId, dto, evaluateurId) {
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
    async demanderRessources(dto, demandeurId) {
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
    async getMesDemandesRessources(utilisateurId) {
        return this.dataSource.query(`
      SELECT * FROM demande_ressource WHERE demandeur_id = $1 ORDER BY created_at DESC
    `, [utilisateurId]);
    }
    async getSallesDisponibles(date, heureDebut, heureFin, type) {
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
        const params = [date, heureDebut, heureFin];
        if (type) {
            query += ` AND s.type = $4`;
            params.push(type);
        }
        query += ` ORDER BY s.code`;
        return this.dataSource.query(query, params);
    }
    async getMesStats(utilisateurId, anneeAcademiqueId) {
        const anneeFilter = anneeAcademiqueId
            ? `AND ac.annee_academique_id = '${anneeAcademiqueId}'`
            : `AND aa.active = true`;
        const [nbCours, nbSeances, nbEtudiants, tauxPresence] = await Promise.all([
            this.dataSource.query(`
        SELECT COUNT(DISTINCT ac.id) as count
        FROM affectation_cours ac
        JOIN enseignant e ON e.id = ac.enseignant_id
        JOIN annee_academique aa ON aa.id = ac.annee_academique_id
        WHERE e.utilisateur_id = $1 ${anneeFilter}
      `, [utilisateurId]),
            this.dataSource.query(`
        SELECT COUNT(DISTINCT edt.id) as count
        FROM emploi_du_temps edt
        JOIN affectation_cours ac ON ac.id = edt.affectation_id
        JOIN enseignant e ON e.id = ac.enseignant_id
        JOIN annee_academique aa ON aa.id = ac.annee_academique_id
        WHERE e.utilisateur_id = $1 ${anneeFilter}
      `, [utilisateurId]),
            this.dataSource.query(`
        SELECT COUNT(DISTINCT i.etudiant_id) as count
        FROM inscription i
        JOIN affectation_cours ac ON ac.parcours_id = i.parcours_id 
          AND ac.annee_academique_id = i.annee_academique_id
        JOIN enseignant e ON e.id = ac.enseignant_id
        JOIN annee_academique aa ON aa.id = ac.annee_academique_id
        WHERE e.utilisateur_id = $1 ${anneeFilter}
          AND i.statut = 'validee'
      `, [utilisateurId]),
            this.dataSource.query(`
        SELECT 
          ROUND(100.0 * COUNT(*) FILTER (WHERE pr.statut = 'present') / NULLIF(COUNT(*), 0), 2) as taux
        FROM presence pr
        JOIN emploi_du_temps edt ON edt.id = pr.seance_id
        JOIN affectation_cours ac ON ac.id = edt.affectation_id
        JOIN enseignant e ON e.id = ac.enseignant_id
        JOIN annee_academique aa ON aa.id = ac.annee_academique_id
        WHERE e.utilisateur_id = $1 ${anneeFilter}
      `, [utilisateurId]),
        ]);
        return {
            nbCours: parseInt(nbCours[0]?.count || 0),
            nbSeances: parseInt(nbSeances[0]?.count || 0),
            nbEtudiants: parseInt(nbEtudiants[0]?.count || 0),
            tauxPresence: parseFloat(tauxPresence[0]?.taux || 0),
        };
    }
    async getTauxReussiteEC(affectationId) {
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
};
exports.PortailProfesseurService = PortailProfesseurService;
exports.PortailProfesseurService = PortailProfesseurService = PortailProfesseurService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], PortailProfesseurService);
//# sourceMappingURL=professeur.service.js.map