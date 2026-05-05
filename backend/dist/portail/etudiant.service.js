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
};
exports.PortailEtudiantService = PortailEtudiantService;
exports.PortailEtudiantService = PortailEtudiantService = PortailEtudiantService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], PortailEtudiantService);
//# sourceMappingURL=etudiant.service.js.map