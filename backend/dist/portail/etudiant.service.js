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
var PortailEtudiantService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortailEtudiantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let PortailEtudiantService = PortailEtudiantService_1 = class PortailEtudiantService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(PortailEtudiantService_1.name);
    }
    async searchEtudiants(query) {
        if (!query || query.length < 2) {
            return [];
        }
        try {
            const searchTerm = `%${query.toLowerCase()}%`;
            const etudiants = await this.dataSource.query(`
        SELECT
          e.id,
          e.nom,
          e.prenom,
          e.matricule,
          e.photo_url,
          p.nom as classe,
          p.code as parcours_code
        FROM etudiant e
        LEFT JOIN inscription i ON i.etudiant_id = e.id AND i.statut = 'validee'
        LEFT JOIN parcours p ON p.id = i.parcours_id
        WHERE
          LOWER(e.nom) LIKE $1
          OR LOWER(e.prenom) LIKE $1
          OR LOWER(e.matricule) LIKE $1
          OR LOWER(CONCAT(e.prenom, ' ', e.nom)) LIKE $1
        ORDER BY e.nom, e.prenom
        LIMIT 20
      `, [searchTerm]);
            this.logger.log(`Recherche étudiants: ${etudiants.length} résultats pour "${query}"`);
            return etudiants;
        }
        catch (error) {
            this.logger.error('Erreur lors de la recherche d\'étudiants:', error);
            return [];
        }
    }
    async getProfil(utilisateurId) {
        const etudiant = await this.dataSource.query(`
      SELECT e.*, i.*, p.nom as parcours_nom, p.code as parcours_code,
             aa.libelle as annee_academique, i.annee_niveau
      FROM etudiant e
      LEFT JOIN inscription i ON i.etudiant_id = e.id AND i.statut = 'validee'
      LEFT JOIN parcours p ON p.id = i.parcours_id
      LEFT JOIN annee_academique aa ON aa.id = i.annee_academique_id
      WHERE e.utilisateur_id = $1
      ORDER BY i.date_inscription DESC
      LIMIT 1
    `, [utilisateurId]);
        if (!etudiant.length) {
            throw new common_1.NotFoundException('Profil étudiant non trouvé');
        }
        return etudiant[0];
    }
    async getEmploiDuTemps(utilisateurId, dateDebut, dateFin) {
        const etudiant = await this.getProfil(utilisateurId);
        const parcoursId = etudiant.parcours_id;
        const anneeAcademiqueId = etudiant.annee_academique_id;
        let dateFilter = '';
        if (dateDebut && dateFin) {
            dateFilter = `AND edt.date_seance BETWEEN '${dateDebut}' AND '${dateFin}'`;
        }
        return this.dataSource.query(`
      SELECT 
        edt.*,
        s.nom as salle_nom,
        s.code as salle_code,
        ec.intitule as cours_nom,
        ens.nom as prof_nom,
        ens.prenom as prof_prenom
      FROM emploi_du_temps edt
      JOIN affectation_cours ac ON ac.id = edt.affectation_id
      JOIN element_constitutif ec ON ec.id = ac.ec_id
      JOIN enseignant ens ON ens.id = ac.enseignant_id
      LEFT JOIN salle s ON s.id = edt.salle_id
      WHERE ac.annee_academique_id = $1
        AND edt.statut = 'planifie'
        ${dateFilter}
      ORDER BY edt.date_seance, edt.heure_debut
    `, [anneeAcademiqueId]);
    }
    async getNotes(utilisateurId, sessionId) {
        const etudiant = await this.getProfil(utilisateurId);
        let sessionFilter = '';
        if (sessionId) {
            sessionFilter = `AND n.session_id = '${sessionId}'`;
        }
        return this.dataSource.query(`
      SELECT 
        n.*,
        ec.intitule as ec_nom,
        ec.code as ec_code,
        ue.intitule as ue_nom,
        ue.code as ue_code,
        se.libelle as session_libelle,
        se.type_session
      FROM note n
      JOIN element_constitutif ec ON ec.id = n.ec_id
      JOIN unite_enseignement ue ON ue.id = ec.ue_id
      JOIN session_examen se ON se.id = n.session_id
      WHERE n.etudiant_id = $1 ${sessionFilter}
      ORDER BY se.date_debut DESC, ue.code, ec.code
    `, [etudiant.etudiant_id]);
    }
    async getMoyennes(utilisateurId) {
        const etudiant = await this.getProfil(utilisateurId);
        const moyennesUE = await this.dataSource.query(`
      SELECT * FROM vue_moyenne_ue
      WHERE etudiant_id = $1
    `, [etudiant.etudiant_id]).catch(() => []);
        const moyennesSemestre = await this.dataSource.query(`
      SELECT * FROM vue_moyenne_semestre
      WHERE etudiant_id = $1
    `, [etudiant.etudiant_id]).catch(() => []);
        return { moyennesUE, moyennesSemestre };
    }
    async getPaiements(utilisateurId) {
        const etudiant = await this.getProfil(utilisateurId);
        return this.dataSource.query(`
      SELECT 
        p.*,
        g.montant_total as montant_du
      FROM paiement p
      JOIN inscription i ON i.id = p.inscription_id
      JOIN grille_tarifaire g ON g.parcours_id = i.parcours_id 
        AND g.annee_academique_id = i.annee_academique_id
      WHERE i.etudiant_id = $1
      ORDER BY p.date_paiement DESC
    `, [etudiant.etudiant_id]);
    }
    async getSolde(utilisateurId) {
        const etudiant = await this.getProfil(utilisateurId);
        const result = await this.dataSource.query(`
      SELECT 
        g.montant_total as montant_du,
        COALESCE(SUM(p.montant) FILTER (WHERE p.statut = 'valide'), 0) as montant_paye,
        g.montant_total - COALESCE(SUM(p.montant) FILTER (WHERE p.statut = 'valide'), 0) as solde
      FROM inscription i
      JOIN grille_tarifaire g ON g.parcours_id = i.parcours_id 
        AND g.annee_academique_id = i.annee_academique_id
      LEFT JOIN paiement p ON p.inscription_id = i.id
      WHERE i.etudiant_id = $1 AND i.statut = 'validee'
      GROUP BY g.montant_total
    `, [etudiant.etudiant_id]);
        return result[0] || { montant_du: 0, montant_paye: 0, solde: 0 };
    }
    async getAbsences(utilisateurId) {
        const etudiant = await this.getProfil(utilisateurId);
        return this.dataSource.query(`
      SELECT 
        pr.*,
        edt.date_seance,
        edt.heure_debut,
        edt.heure_fin,
        ec.intitule as cours_nom
      FROM presence pr
      JOIN emploi_du_temps edt ON edt.id = pr.seance_id
      JOIN affectation_cours ac ON ac.id = edt.affectation_id
      JOIN element_constitutif ec ON ec.id = ac.ec_id
      WHERE pr.etudiant_id = $1
        AND pr.statut IN ('absent', 'retard')
      ORDER BY edt.date_seance DESC
    `, [etudiant.etudiant_id]);
    }
    async justifierAbsence(utilisateurId, dto) {
        const etudiant = await this.getProfil(utilisateurId);
        await this.dataSource.query(`
      UPDATE presence
      SET justifie = true,
          justificatif_url = $1,
          motif = $2
      WHERE etudiant_id = $3 AND id = $4
    `, [dto.justificatifUrl, dto.motif, etudiant.etudiant_id, dto.presenceId]);
        return { message: 'Absence justifiée avec succès' };
    }
    async getDocuments(utilisateurId) {
        const etudiant = await this.getProfil(utilisateurId);
        const [releves, attestations] = await Promise.all([
            this.dataSource.query(`
        SELECT * FROM releve_note 
        WHERE etudiant_id = $1 AND statut IN ('signe', 'delivre')
        ORDER BY date_generation DESC
      `, [etudiant.etudiant_id]),
            this.dataSource.query(`
        SELECT * FROM attestation 
        WHERE etudiant_id = $1 AND statut = 'delivre'
        ORDER BY date_delivrance DESC
      `, [etudiant.etudiant_id]),
        ]);
        return { releves, attestations };
    }
    async getCoursEnLigne(utilisateurId) {
        const etudiant = await this.getProfil(utilisateurId);
        return this.dataSource.query(`
      SELECT 
        ec.id,
        ec.intitule,
        ec.code,
        ue.intitule as ue_nom,
        ac.fichier_cours_url,
        ac.description
      FROM element_constitutif ec
      JOIN unite_enseignement ue ON ue.id = ec.ue_id
      JOIN affectation_cours ac ON ac.ec_id = ec.id
      WHERE ac.annee_academique_id = $1
      ORDER BY ue.code, ec.code
    `, [etudiant.annee_academique_id]);
    }
    async getInscriptionsExamens(utilisateurId) {
        const etudiant = await this.getProfil(utilisateurId);
        return this.dataSource.query(`
      SELECT 
        se.*,
        CASE WHEN ie.id IS NOT NULL THEN true ELSE false END as inscrit
      FROM session_examen se
      LEFT JOIN inscription_examen ie ON ie.session_id = se.id AND ie.etudiant_id = $1
      WHERE se.annee_academique_id = $2
        AND se.statut = 'planifie'
      ORDER BY se.date_debut
    `, [etudiant.etudiant_id, etudiant.annee_academique_id]);
    }
    async inscrireExamen(utilisateurId, sessionId) {
        const etudiant = await this.getProfil(utilisateurId);
        await this.dataSource.query(`
      INSERT INTO inscription_examen (etudiant_id, session_id, date_inscription)
      VALUES ($1, $2, NOW())
      ON CONFLICT DO NOTHING
    `, [etudiant.etudiant_id, sessionId]);
        return { message: 'Inscription à l\'examen réussie' };
    }
    async getInscriptions(utilisateurId) {
        try {
            const etudiantResult = await this.dataSource.query(`
        SELECT id FROM etudiant WHERE utilisateur_id = $1
      `, [utilisateurId]);
            if (etudiantResult.length === 0) {
                this.logger.warn(`Aucun profil étudiant trouvé pour utilisateur ${utilisateurId}`);
                return [];
            }
            const etudiantId = etudiantResult[0].id;
            return await this.dataSource.query(`
        SELECT
          i.*,
          p.nom as parcours_nom,
          p.code as parcours_code,
          aa.libelle as annee_academique,
          EXTRACT(YEAR FROM aa.date_debut) as annee_debut,
          EXTRACT(YEAR FROM aa.date_fin) as annee_fin
        FROM inscription i
        LEFT JOIN parcours p ON p.id = i.parcours_id
        LEFT JOIN annee_academique aa ON aa.id = i.annee_academique_id
        WHERE i.etudiant_id = $1
        ORDER BY i.date_inscription DESC
      `, [etudiantId]);
        }
        catch (error) {
            this.logger.error('Erreur getInscriptions:', error);
            return [];
        }
    }
    async getDepartements() {
        try {
            return await this.dataSource.query(`
        SELECT
          d.id,
          d.code,
          d.nom,
          d.description,
          COUNT(DISTINCT p.id) as nombre_parcours
        FROM departement d
        LEFT JOIN parcours p ON p.departement_id = d.id AND p.actif = true
        WHERE d.actif = true
        GROUP BY d.id, d.code, d.nom, d.description
        ORDER BY d.nom
      `);
        }
        catch (error) {
            this.logger.error('Erreur getDepartements:', error);
            throw error;
        }
    }
    async getParcoursDisponibles(utilisateurId) {
        try {
            return await this.dataSource.query(`
        SELECT
          p.*,
          d.nom as departement_nom,
          d.code as departement_code,
          COUNT(DISTINCT ue.id) as nombre_ues
        FROM parcours p
        LEFT JOIN departement d ON d.id = p.departement_id
        LEFT JOIN unite_enseignement ue ON ue.parcours_id = p.id
        WHERE p.actif = true
        GROUP BY p.id, d.nom, d.code
        ORDER BY d.nom, p.nom
      `);
        }
        catch (error) {
            this.logger.error('Erreur getParcoursDisponibles:', error);
            throw error;
        }
    }
    async getAnneesAcademiques() {
        try {
            return await this.dataSource.query(`
        SELECT
          id,
          libelle,
          EXTRACT(YEAR FROM date_debut) as annee_debut,
          EXTRACT(YEAR FROM date_fin) as annee_fin,
          CASE WHEN active = true THEN 'en_cours' ELSE 'terminee' END as statut,
          date_debut,
          date_fin
        FROM annee_academique
        ORDER BY date_debut DESC
      `);
        }
        catch (error) {
            this.logger.error('Erreur getAnneesAcademiques:', error);
            throw error;
        }
    }
    async getNiveauxEtude() {
        try {
            return await this.dataSource.query(`
        SELECT
          id,
          code,
          libelle,
          description,
          ordre,
          type_diplome
        FROM niveau_etude
        WHERE actif = true
        ORDER BY ordre ASC
      `);
        }
        catch (error) {
            this.logger.error('Erreur getNiveauxEtude:', error);
            throw error;
        }
    }
    async createInscription(utilisateurId, dto) {
        const etudiantResult = await this.dataSource.query(`
      SELECT id FROM etudiant WHERE utilisateur_id = $1
    `, [utilisateurId]);
        if (etudiantResult.length === 0) {
            throw new common_1.NotFoundException('Profil étudiant non trouvé');
        }
        const etudiantId = etudiantResult[0].id;
        const existingInscription = await this.dataSource.query(`
      SELECT id FROM inscription
      WHERE etudiant_id = $1 AND annee_academique_id = $2
    `, [etudiantId, dto.anneeAcademiqueId]);
        if (existingInscription.length > 0) {
            throw new Error('Vous êtes déjà inscrit pour cette année académique');
        }
        const result = await this.dataSource.query(`
      INSERT INTO inscription (
        etudiant_id,
        parcours_id,
        annee_academique_id,
        annee_niveau,
        type_inscription,
        statut,
        date_inscription
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `, [
            etudiantId,
            dto.parcoursId,
            dto.anneeAcademiqueId,
            dto.anneeNiveau,
            dto.typeInscription || 'premiere',
            'en_attente'
        ]);
        return {
            message: 'Inscription créée avec succès',
            inscription: result[0]
        };
    }
    async updateInscription(utilisateurId, inscriptionId, dto) {
        const checkResult = await this.dataSource.query(`
      SELECT id FROM inscription 
      WHERE id = $1 AND etudiant_id = (SELECT id FROM etudiant WHERE utilisateur_id = $2)
    `, [inscriptionId, utilisateurId]);
        if (checkResult.length === 0) {
            throw new Error('Inscription non trouvée ou accès non autorisé');
        }
        const result = await this.dataSource.query(`
      UPDATE inscription 
      SET observations = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [dto.observations, inscriptionId]);
        return {
            message: 'Inscription mise à jour avec succès',
            inscription: result[0]
        };
    }
    async cancelInscription(utilisateurId, inscriptionId) {
        const checkResult = await this.dataSource.query(`
      SELECT id, statut FROM inscription 
      WHERE id = $1 AND etudiant_id = (SELECT id FROM etudiant WHERE utilisateur_id = $2)
    `, [inscriptionId, utilisateurId]);
        if (checkResult.length === 0) {
            throw new Error('Inscription non trouvée ou accès non autorisé');
        }
        const inscription = checkResult[0];
        if (inscription.statut === 'validee') {
            throw new Error('Impossible d\'annuler une inscription déjà validée');
        }
        await this.dataSource.query(`
      UPDATE inscription 
      SET statut = 'annulee', updated_at = NOW()
      WHERE id = $1
    `, [inscriptionId]);
        return { message: 'Inscription annulée avec succès' };
    }
    async getMontantInscription(utilisateurId, inscriptionId) {
        try {
            const result = await this.dataSource.query(`
        SELECT
          i.id,
          i.statut as statut_inscription,
          gt.montant_total as montant_inscription,
          gt.frais_inscription,
          gt.frais_scolarite,
          p.nom as parcours_nom,
          aa.libelle as annee_academique
        FROM inscription i
        JOIN etudiant e ON e.id = i.etudiant_id
        JOIN parcours p ON p.id = i.parcours_id
        JOIN annee_academique aa ON aa.id = i.annee_academique_id
        LEFT JOIN grille_tarifaire gt ON gt.parcours_id = i.parcours_id
          AND gt.annee_academique_id = i.annee_academique_id
        WHERE i.id = $1 AND e.utilisateur_id = $2
      `, [inscriptionId, utilisateurId]);
            if (result.length === 0) {
                throw new common_1.NotFoundException('Inscription non trouvée ou accès non autorisé');
            }
            return result[0];
        }
        catch (error) {
            this.logger.error('Erreur getMontantInscription:', error);
            throw error;
        }
    }
    async submitPaiement(utilisateurId, dto) {
        try {
            const etudiantResult = await this.dataSource.query(`
        SELECT id FROM etudiant WHERE utilisateur_id = $1
      `, [utilisateurId]);
            if (etudiantResult.length === 0) {
                throw new common_1.NotFoundException('Profil étudiant non trouvé');
            }
            const etudiantId = etudiantResult[0].id;
            const inscriptionCheck = await this.dataSource.query(`
        SELECT id FROM inscription WHERE id = $1 AND etudiant_id = $2
      `, [dto.inscriptionId, etudiantId]);
            if (inscriptionCheck.length === 0) {
                throw new Error('Inscription non trouvée ou accès non autorisé');
            }
            const existingPaiement = await this.dataSource.query(`
        SELECT id FROM paiement_inscription
        WHERE inscription_id = $1 AND statut = 'en_attente'
      `, [dto.inscriptionId]);
            if (existingPaiement.length > 0) {
                throw new Error('Un paiement est déjà en attente de validation pour cette inscription');
            }
            const result = await this.dataSource.query(`
        INSERT INTO paiement_inscription (
          inscription_id,
          etudiant_id,
          montant,
          methode_paiement,
          reference_paiement,
          date_paiement,
          preuve_url,
          statut,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `, [
                dto.inscriptionId,
                etudiantId,
                dto.montant,
                dto.methodePaiement,
                dto.referencePaiement,
                dto.datePaiement || new Date(),
                dto.preuveUrl || null,
                'en_attente'
            ]);
            this.logger.log(`Paiement soumis: ${result[0].id} pour inscription ${dto.inscriptionId}`);
            return {
                message: 'Paiement soumis avec succès. En attente de validation par le caissier.',
                paiement: result[0]
            };
        }
        catch (error) {
            this.logger.error('Erreur submitPaiement:', error);
            throw error;
        }
    }
    async getPaiementStatus(utilisateurId, inscriptionId) {
        try {
            const etudiantResult = await this.dataSource.query(`
        SELECT id FROM etudiant WHERE utilisateur_id = $1
      `, [utilisateurId]);
            if (etudiantResult.length === 0) {
                throw new common_1.NotFoundException('Profil étudiant non trouvé');
            }
            const etudiantId = etudiantResult[0].id;
            const paiements = await this.dataSource.query(`
        SELECT
          pi.*,
          u.nom as validateur_nom,
          u.prenom as validateur_prenom
        FROM paiement_inscription pi
        LEFT JOIN utilisateur u ON u.id = pi.valide_par
        WHERE pi.inscription_id = $1 AND pi.etudiant_id = $2
        ORDER BY pi.created_at DESC
      `, [inscriptionId, etudiantId]);
            return paiements;
        }
        catch (error) {
            this.logger.error('Erreur getPaiementStatus:', error);
            throw error;
        }
    }
    async getPaiementsInscription(utilisateurId) {
        try {
            const etudiantResult = await this.dataSource.query(`
        SELECT id FROM etudiant WHERE utilisateur_id = $1
      `, [utilisateurId]);
            if (etudiantResult.length === 0) {
                throw new common_1.NotFoundException('Profil étudiant non trouvé');
            }
            const etudiantId = etudiantResult[0].id;
            const paiements = await this.dataSource.query(`
        SELECT
          pi.*,
          i.annee_niveau,
          p.nom as parcours_nom,
          aa.libelle as annee_academique,
          u.nom as validateur_nom,
          u.prenom as validateur_prenom
        FROM paiement_inscription pi
        JOIN inscription i ON i.id = pi.inscription_id
        JOIN parcours p ON p.id = i.parcours_id
        JOIN annee_academique aa ON aa.id = i.annee_academique_id
        LEFT JOIN utilisateur u ON u.id = pi.valide_par
        WHERE pi.etudiant_id = $1
        ORDER BY pi.created_at DESC
      `, [etudiantId]);
            return paiements;
        }
        catch (error) {
            this.logger.error('Erreur getPaiementsInscription:', error);
            throw error;
        }
    }
};
exports.PortailEtudiantService = PortailEtudiantService;
exports.PortailEtudiantService = PortailEtudiantService = PortailEtudiantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)('tenant')),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], PortailEtudiantService);
//# sourceMappingURL=etudiant.service.js.map