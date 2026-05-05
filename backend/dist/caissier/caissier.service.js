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
var CaissierService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaissierService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const finance_entities_1 = require("../finance/finance.entities");
let CaissierService = CaissierService_1 = class CaissierService {
    constructor(paiementRepo, echeancierRepo, dataSource) {
        this.paiementRepo = paiementRepo;
        this.echeancierRepo = echeancierRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(CaissierService_1.name);
    }
    async createPaiement(data) {
        const numeroRecu = await this.genererNumeroRecu();
        const paiement = this.paiementRepo.create({
            ...data,
            numeroRecu,
            datePaiement: new Date(),
            statut: 'valide',
        });
        const saved = await this.paiementRepo.save(paiement);
        const savedPaiement = Array.isArray(saved) ? saved[0] : saved;
        if (data.echeancierId) {
            await this.echeancierRepo.update(data.echeancierId, { statut: 'paye' });
        }
        await this.verifierEtDebloquerNotes(data.inscriptionId);
        return savedPaiement;
    }
    async findPaiements(date, mode) {
        const query = this.paiementRepo.createQueryBuilder('p')
            .leftJoinAndSelect('p.inscription', 'i')
            .leftJoinAndSelect('i.etudiant', 'e');
        if (date) {
            query.andWhere('DATE(p.datePaiement) = :date', { date });
        }
        else {
            query.andWhere('DATE(p.datePaiement) = CURRENT_DATE');
        }
        if (mode) {
            query.andWhere('p.modePaiement = :mode', { mode });
        }
        return query.orderBy('p.datePaiement', 'DESC').getMany();
    }
    async findPaiementsByEtudiant(etudiantId) {
        return this.dataSource.query(`
      SELECT p.*, i.annee_academique_id, par.nom as parcours
      FROM paiement p
      JOIN inscription i ON i.id = p.inscription_id
      JOIN parcours par ON par.id = i.parcours_id
      WHERE i.etudiant_id = $1
      ORDER BY p.date_paiement DESC
    `, [etudiantId]);
    }
    async annulerPaiement(id, motif, annulePar) {
        const paiement = await this.paiementRepo.findOne({ where: { id } });
        if (!paiement)
            throw new common_1.NotFoundException('Paiement non trouvé');
        await this.paiementRepo.update(id, {
            statut: 'annule',
            motifAnnulation: motif,
        });
        if (paiement.echeancierId) {
            await this.echeancierRepo.update(paiement.echeancierId, { statut: 'en_attente' });
        }
        return this.paiementRepo.findOne({ where: { id } });
    }
    async genererRecu(id) {
        const paiement = await this.dataSource.query(`
      SELECT 
        p.*,
        e.nom, e.prenom, e.matricule,
        par.nom as parcours,
        aa.libelle as annee_academique,
        i.annee_niveau
      FROM paiement p
      JOIN inscription i ON i.id = p.inscription_id
      JOIN etudiant e ON e.id = i.etudiant_id
      JOIN parcours par ON par.id = i.parcours_id
      JOIN annee_academique aa ON aa.id = i.annee_academique_id
      WHERE p.id = $1
    `, [id]);
        if (!paiement.length)
            throw new common_1.NotFoundException('Paiement non trouvé');
        return {
            ...paiement[0],
            typeDocument: 'recu_fiscal',
            dateGeneration: new Date(),
        };
    }
    async createEcheancier(data) {
        const echeancier = this.echeancierRepo.create(data);
        const saved = await this.echeancierRepo.save(echeancier);
        return Array.isArray(saved) ? saved[0] : saved;
    }
    async findEcheances(dateDebut, dateFin, statut) {
        const query = this.echeancierRepo.createQueryBuilder('e')
            .leftJoinAndSelect('e.inscription', 'i')
            .leftJoinAndSelect('i.etudiant', 'et');
        if (dateDebut && dateFin) {
            query.andWhere('e.dateEcheance BETWEEN :debut AND :fin', { debut: dateDebut, fin: dateFin });
        }
        if (statut) {
            query.andWhere('e.statut = :statut', { statut });
        }
        return query.orderBy('e.dateEcheance', 'ASC').getMany();
    }
    async findEcheancesByEtudiant(etudiantId) {
        return this.dataSource.query(`
      SELECT e.*, i.annee_academique_id, par.nom as parcours,
             CASE 
               WHEN e.date_echeance < NOW() AND e.statut != 'paye' THEN 'en_retard'
               ELSE e.statut
             END as statut_calcule
      FROM echeancier e
      JOIN inscription i ON i.id = e.inscription_id
      JOIN parcours par ON par.id = i.parcours_id
      WHERE i.etudiant_id = $1
      ORDER BY e.date_echeance
    `, [etudiantId]);
    }
    async modifierEcheance(id, dto) {
        await this.echeancierRepo.update(id, {
            dateEcheance: new Date(dto.nouvelleDate),
        });
        await this.dataSource.query(`
      INSERT INTO historique_echeancier (echeancier_id, action, motif, date_modification)
      VALUES ($1, 'report', $2, NOW())
    `, [id, dto.motif]);
        return this.echeancierRepo.findOne({ where: { id } });
    }
    async findImpayes(jours = 30) {
        return this.dataSource.query(`
      SELECT 
        i.id as inscription_id,
        e.id as etudiant_id,
        e.nom, e.prenom, e.email, e.telephone,
        par.nom as parcours,
        aa.libelle as annee_academique,
        gt.montant_total as montant_du,
        COALESCE(payes.total_paye, 0) as montant_paye,
        gt.montant_total - COALESCE(payes.total_paye, 0) as montant_restant,
        MAX(ec.date_echeance) as date_derniere_echeance,
        COUNT(ec.id) FILTER (WHERE ec.statut != 'paye' AND ec.date_echeance < NOW()) as nb_echeances_retard,
        CASE 
          WHEN notes_bloquees.id IS NOT NULL THEN true 
          ELSE false 
        END as notes_bloquees
      FROM inscription i
      JOIN etudiant e ON e.id = i.etudiant_id
      JOIN parcours par ON par.id = i.parcours_id
      JOIN annee_academique aa ON aa.id = i.annee_academique_id
      JOIN grille_tarifaire gt ON gt.parcours_id = i.parcours_id AND gt.annee_academique_id = i.annee_academique_id
      LEFT JOIN echeancier ec ON ec.inscription_id = i.id
      LEFT JOIN (
        SELECT inscription_id, SUM(montant) as total_paye
        FROM paiement WHERE statut = 'valide' GROUP BY inscription_id
      ) payes ON payes.inscription_id = i.id
      LEFT JOIN (
        SELECT inscription_id, id FROM blocage_notes WHERE actif = true
      ) notes_bloquees ON notes_bloquees.inscription_id = i.id
      WHERE i.statut = 'validee'
        AND gt.montant_total > COALESCE(payes.total_paye, 0)
        AND ec.date_echeance < NOW() - INTERVAL '${jours} days'
      GROUP BY i.id, e.id, e.nom, e.prenom, e.email, e.telephone, 
               par.nom, aa.libelle, gt.montant_total, payes.total_paye, notes_bloquees.id
      ORDER BY montant_restant DESC
    `);
    }
    async createRelance(data) {
        const relance = await this.dataSource.query(`
      INSERT INTO relance_impaye (
        inscription_id, type_relance, niveau_relance, message, 
        date_relance, statut, created_at
      ) VALUES ($1, $2, $3, $4, NOW(), 'preparation', NOW())
      RETURNING *
    `, [data.inscriptionId, data.typeRelance || 'email', data.niveau || 1, data.message]);
        return relance[0];
    }
    async envoyerRelance(id) {
        const relance = await this.dataSource.query(`
      SELECT r.*, e.email, e.telephone, e.nom, e.prenom
      FROM relance_impaye r
      JOIN inscription i ON i.id = r.inscription_id
      JOIN etudiant e ON e.id = i.etudiant_id
      WHERE r.id = $1
    `, [id]);
        if (!relance.length)
            throw new common_1.NotFoundException('Relance non trouvée');
        await this.dataSource.query(`
      UPDATE relance_impaye 
      SET statut = 'envoye', date_envoi = NOW()
      WHERE id = $1
    `, [id]);
        return { ...relance[0], statut: 'envoye', message: 'Relance envoyée avec succès' };
    }
    async bloquerNotes(inscriptionId) {
        await this.dataSource.query(`
      INSERT INTO blocage_notes (inscription_id, motif, date_blocage, actif)
      VALUES ($1, 'impayes', NOW(), true)
      ON CONFLICT (inscription_id) DO UPDATE SET actif = true, date_blocage = NOW()
    `, [inscriptionId]);
        return { message: 'Notes bloquées pour impayés' };
    }
    async debloquerNotes(inscriptionId) {
        await this.dataSource.query(`
      UPDATE blocage_notes 
      SET actif = false, date_deblocage = NOW()
      WHERE inscription_id = $1
    `, [inscriptionId]);
        return { message: 'Notes débloquées' };
    }
    async verifierEtDebloquerNotes(inscriptionId) {
        const solde = await this.dataSource.query(`
      SELECT gt.montant_total - COALESCE(SUM(p.montant), 0) as solde
      FROM inscription i
      JOIN grille_tarifaire gt ON gt.parcours_id = i.parcours_id AND gt.annee_academique_id = i.annee_academique_id
      LEFT JOIN paiement p ON p.inscription_id = i.id AND p.statut = 'valide'
      WHERE i.id = $1
      GROUP BY gt.montant_total
    `, [inscriptionId]);
        if (solde.length && parseFloat(solde[0].solde) <= 0) {
            await this.debloquerNotes(inscriptionId);
        }
    }
    async getClotureJournaliere(date) {
        const dateCible = date || new Date().toISOString().split('T')[0];
        const [totaux, details] = await Promise.all([
            this.dataSource.query(`
        SELECT 
          COALESCE(SUM(montant), 0) as total_encaisse,
          COUNT(*) as nb_transactions,
          COALESCE(SUM(montant) FILTER (WHERE mode_paiement = 'especes'), 0) as especes,
          COALESCE(SUM(montant) FILTER (WHERE mode_paiement = 'cheque'), 0) as cheques,
          COALESCE(SUM(montant) FILTER (WHERE mode_paiement = 'virement'), 0) as virements,
          COALESCE(SUM(montant) FILTER (WHERE mode_paiement = 'carte'), 0) as cartes
        FROM paiement
        WHERE DATE(date_paiement) = $1 AND statut = 'valide'
      `, [dateCible]),
            this.dataSource.query(`
        SELECT 
          mode_paiement,
          COUNT(*) as nb,
          SUM(montant) as total
        FROM paiement
        WHERE DATE(date_paiement) = $1 AND statut = 'valide'
        GROUP BY mode_paiement
      `, [dateCible]),
        ]);
        return {
            date: dateCible,
            totaux: totaux[0],
            details: details,
        };
    }
    async validerCloture(date, validePar) {
        const cloture = await this.dataSource.query(`
      INSERT INTO cloture_caisse (date_cloture, valide_par, date_validation, statut)
      VALUES ($1, $2, NOW(), 'valide')
      ON CONFLICT (date_cloture) DO UPDATE SET valide_par = $2, date_validation = NOW(), statut = 'valide'
      RETURNING *
    `, [date, validePar]);
        return cloture[0];
    }
    async getRapprochementBancaire(date) {
        const dateCible = date || new Date().toISOString().split('T')[0];
        const virements = await this.dataSource.query(`
      SELECT 
        reference,
        montant,
        date_paiement,
        statut
      FROM paiement
      WHERE mode_paiement = 'virement'
        AND DATE(date_paiement) = $1
      ORDER BY date_paiement
    `, [dateCible]);
        return {
            date: dateCible,
            virementsAttendus: virements.filter((v) => v.statut === 'en_attente'),
            virementsRecus: virements.filter((v) => v.statut === 'valide'),
            totalVirements: virements.reduce((acc, v) => acc + parseFloat(v.montant), 0),
        };
    }
    async getStatsJournalieres(date) {
        const dateCible = date || new Date().toISOString().split('T')[0];
        return this.getClotureJournaliere(dateCible);
    }
    async getStatsMensuelles(mois, annee) {
        const [totaux, parMode, nouveauxPayeurs] = await Promise.all([
            this.dataSource.query(`
        SELECT 
          COALESCE(SUM(montant), 0) as total_encaisse,
          COUNT(*) as nb_transactions,
          COUNT(DISTINCT inscription_id) as nb_etudiants
        FROM paiement
        WHERE EXTRACT(MONTH FROM date_paiement) = $1 
          AND EXTRACT(YEAR FROM date_paiement) = $2
          AND statut = 'valide'
      `, [mois, annee]),
            this.dataSource.query(`
        SELECT 
          mode_paiement,
          COUNT(*) as nb,
          SUM(montant) as total
        FROM paiement
        WHERE EXTRACT(MONTH FROM date_paiement) = $1 
          AND EXTRACT(YEAR FROM date_paiement) = $2
          AND statut = 'valide'
        GROUP BY mode_paiement
      `, [mois, annee]),
            this.dataSource.query(`
        SELECT COUNT(DISTINCT inscription_id) as nb
        FROM paiement
        WHERE EXTRACT(MONTH FROM date_paiement) = $1 
          AND EXTRACT(YEAR FROM date_paiement) = $2
          AND statut = 'valide'
          AND created_at >= DATE_TRUNC('month', MAKE_DATE($2, $1, 1))
      `, [mois, annee]),
        ]);
        return {
            periode: `${mois}/${annee}`,
            totaux: totaux[0],
            repartitionParMode: parMode,
            nouveauxPayeurs: nouveauxPayeurs[0]?.nb || 0,
        };
    }
    async genererNumeroRecu() {
        const date = new Date();
        const annee = date.getFullYear();
        const mois = String(date.getMonth() + 1).padStart(2, '0');
        const jour = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `REC-${annee}${mois}${jour}-${random}`;
    }
};
exports.CaissierService = CaissierService;
exports.CaissierService = CaissierService = CaissierService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(finance_entities_1.Paiement)),
    __param(1, (0, typeorm_1.InjectRepository)(finance_entities_1.Echeancier)),
    __param(2, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], CaissierService);
//# sourceMappingURL=caissier.service.js.map