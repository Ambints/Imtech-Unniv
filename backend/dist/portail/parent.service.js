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
var PortailParentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortailParentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let PortailParentService = PortailParentService_1 = class PortailParentService {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(PortailParentService_1.name);
    }
    async verifierLienParentEnfant(parentUserId, etudiantId) {
        const parent = await this.dataSource.query(`
      SELECT email FROM utilisateur WHERE id = $1
    `, [parentUserId]);
        const lien = await this.dataSource.query(`
      SELECT 1 FROM etudiant e
      WHERE e.id = $1 AND (
        e.email_parent = $2 
        OR e.email_parent LIKE $3
      )
    `, [etudiantId, parent[0]?.email, `%${parent[0]?.email}%`]);
        if (!lien.length) {
            throw new common_1.ForbiddenException('Vous n\'êtes pas autorisé à consulter ces informations');
        }
    }
    async getEnfants(parentUserId) {
        const parent = await this.dataSource.query(`
      SELECT email, telephone FROM utilisateur WHERE id = $1
    `, [parentUserId]);
        if (!parent.length) {
            throw new common_1.NotFoundException('Parent non trouvé');
        }
        return this.dataSource.query(`
      SELECT 
        e.id,
        e.nom,
        e.prenom,
        e.matricule,
        e.photo_url,
        p.nom as parcours,
        p.code as parcours_code,
        aa.libelle as annee_academique,
        i.annee_niveau
      FROM etudiant e
      LEFT JOIN inscription i ON i.etudiant_id = e.id AND i.statut = 'validee'
      LEFT JOIN parcours p ON p.id = i.parcours_id
      LEFT JOIN annee_academique aa ON aa.id = i.annee_academique_id
      WHERE e.email_parent = $1 OR e.telephone_parent = $2
         OR e.nom_parent ILIKE $3
      ORDER BY e.nom, e.prenom
    `, [parent[0].email, parent[0].telephone, `%${parent[0].email.split('@')[0]}%`]);
    }
    async getBulletin(parentUserId, etudiantId, sessionId) {
        await this.verifierLienParentEnfant(parentUserId, etudiantId);
        let sessionFilter = '';
        if (sessionId) {
            sessionFilter = `AND n.session_id = '${sessionId}'`;
        }
        const notes = await this.dataSource.query(`
      SELECT 
        n.*,
        ec.intitule as ec_nom,
        ec.code as ec_code,
        ue.intitule as ue_nom,
        ue.code as ue_code,
        ue.credits_ects,
        se.libelle as session_libelle,
        se.type_session
      FROM note n
      JOIN element_constitutif ec ON ec.id = n.ec_id
      JOIN unite_enseignement ue ON ue.id = ec.ue_id
      JOIN session_examen se ON se.id = n.session_id
      WHERE n.etudiant_id = $1 ${sessionFilter}
      ORDER BY se.date_debut DESC, ue.code, ec.code
    `, [etudiantId]);
        const moyennesUE = await this.dataSource.query(`
      SELECT 
        ue.id,
        ue.code,
        ue.intitule,
        ROUND(AVG(n.valeur), 2) as moyenne,
        COUNT(n.id) as nb_notes
      FROM note n
      JOIN element_constitutif ec ON ec.id = n.ec_id
      JOIN unite_enseignement ue ON ue.id = ec.ue_id
      WHERE n.etudiant_id = $1 ${sessionFilter}
      GROUP BY ue.id, ue.code, ue.intitule
    `, [etudiantId]);
        return { notes, moyennesUE };
    }
    async getAbsences(parentUserId, etudiantId) {
        await this.verifierLienParentEnfant(parentUserId, etudiantId);
        const [absences, stats] = await Promise.all([
            this.dataSource.query(`
        SELECT 
          pr.*,
          edt.date_seance,
          edt.heure_debut,
          edt.heure_fin,
          ec.intitule as cours_nom,
          pr.justifie
        FROM presence pr
        JOIN emploi_du_temps edt ON edt.id = pr.seance_id
        JOIN affectation_cours ac ON ac.id = edt.affectation_id
        JOIN element_constitutif ec ON ec.id = ac.ec_id
        WHERE pr.etudiant_id = $1
          AND pr.statut IN ('absent', 'retard')
        ORDER BY edt.date_seance DESC
        LIMIT 30
      `, [etudiantId]),
            this.dataSource.query(`
        SELECT 
          COUNT(*) FILTER (WHERE statut = 'absent' AND justifie = false) as absences_injustifiees,
          COUNT(*) FILTER (WHERE statut = 'retard') as retards,
          COUNT(*) FILTER (WHERE statut = 'absent' AND justifie = true) as absences_justifiees
        FROM presence
        WHERE etudiant_id = $1
      `, [etudiantId]),
        ]);
        return { absences, stats: stats[0] };
    }
    async getPaiements(parentUserId, etudiantId) {
        await this.verifierLienParentEnfant(parentUserId, etudiantId);
        return this.dataSource.query(`
      SELECT 
        p.*,
        e.num_tranche,
        e.date_echeance
      FROM paiement p
      JOIN inscription i ON i.id = p.inscription_id
      LEFT JOIN echeancier e ON e.id = p.echeancier_id
      WHERE i.etudiant_id = $1
      ORDER BY p.date_paiement DESC
    `, [etudiantId]);
    }
    async getSolde(parentUserId, etudiantId) {
        await this.verifierLienParentEnfant(parentUserId, etudiantId);
        const result = await this.dataSource.query(`
      SELECT 
        g.montant_total as montant_du,
        COALESCE(SUM(p.montant) FILTER (WHERE p.statut = 'valide'), 0) as montant_paye,
        g.montant_total - COALESCE(SUM(p.montant) FILTER (WHERE p.statut = 'valide'), 0) as solde,
        g.nb_tranches,
        i.bourse,
        i.type_bourse
      FROM inscription i
      JOIN grille_tarifaire g ON g.parcours_id = i.parcours_id 
        AND g.annee_academique_id = i.annee_academique_id
      LEFT JOIN paiement p ON p.inscription_id = i.id
      WHERE i.etudiant_id = $1 AND i.statut = 'validee'
      GROUP BY g.montant_total, g.nb_tranches, i.bourse, i.type_bourse
    `, [etudiantId]);
        return result[0] || { montant_du: 0, montant_paye: 0, solde: 0 };
    }
    async getEmploiDuTemps(parentUserId, etudiantId, dateDebut, dateFin) {
        await this.verifierLienParentEnfant(parentUserId, etudiantId);
        const etudiant = await this.dataSource.query(`
      SELECT i.annee_academique_id 
      FROM etudiant e
      JOIN inscription i ON i.etudiant_id = e.id AND i.statut = 'validee'
      WHERE e.id = $1
      ORDER BY i.date_inscription DESC
      LIMIT 1
    `, [etudiantId]);
        if (!etudiant.length) {
            throw new common_1.NotFoundException('Inscription non trouvée');
        }
        let dateFilter = '';
        if (dateDebut && dateFin) {
            dateFilter = `AND edt.date_seance BETWEEN '${dateDebut}' AND '${dateFin}'`;
        }
        return this.dataSource.query(`
      SELECT 
        edt.*,
        s.nom as salle_nom,
        ec.intitule as cours_nom,
        ens.nom as prof_nom
      FROM emploi_du_temps edt
      JOIN affectation_cours ac ON ac.id = edt.affectation_id
      JOIN element_constitutif ec ON ec.id = ac.ec_id
      JOIN enseignant ens ON ens.id = ac.enseignant_id
      LEFT JOIN salle s ON s.id = edt.salle_id
      WHERE ac.annee_academique_id = $1
        AND edt.statut = 'planifie'
        ${dateFilter}
      ORDER BY edt.date_seance, edt.heure_debut
    `, [etudiant[0].annee_academique_id]);
    }
    async autoriserSortie(parentUserId, dto) {
        await this.verifierLienParentEnfant(parentUserId, dto.etudiantId);
        await this.dataSource.query(`
      INSERT INTO autorisation_parent (
        etudiant_id, 
        parent_user_id, 
        type_autorisation, 
        date_sortie, 
        heure_sortie,
        motif,
        valide_jusqu
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
            dto.etudiantId,
            parentUserId,
            dto.type || 'sortie_antipee',
            dto.dateSortie,
            dto.heureSortie,
            dto.motif,
            dto.valideJusqu,
        ]);
        return { message: 'Autorisation enregistrée' };
    }
    async justifierAbsenceParent(parentUserId, dto) {
        await this.verifierLienParentEnfant(parentUserId, dto.etudiantId);
        await this.dataSource.query(`
      UPDATE presence
      SET justifie = true,
          justificatif_parent_url = $1,
          motif = $2,
          justifie_par_parent = true,
          date_justification_parent = NOW()
      WHERE etudiant_id = $3 AND id = $4
    `, [dto.justificatifUrl, dto.motif, dto.etudiantId, dto.presenceId]);
        return { message: 'Absence justifiée par le parent' };
    }
    async getNotifications(parentUserId) {
        const parent = await this.dataSource.query(`
      SELECT email, telephone FROM utilisateur WHERE id = $1
    `, [parentUserId]);
        return this.dataSource.query(`
      SELECT * FROM notification
      WHERE destinataire_type = 'parent'
        AND (
          destinataire_contact = $1 
          OR destinataire_contact = $2
          OR created_at > NOW() - INTERVAL '30 days'
        )
      ORDER BY created_at DESC
      LIMIT 20
    `, [parent[0].email, parent[0].telephone]);
    }
};
exports.PortailParentService = PortailParentService;
exports.PortailParentService = PortailParentService = PortailParentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], PortailParentService);
//# sourceMappingURL=parent.service.js.map