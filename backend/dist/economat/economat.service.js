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
var EconomatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EconomatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const finance_entities_1 = require("../finance/finance.entities");
const logistics_entities_1 = require("../logistics/logistics.entities");
let EconomatService = EconomatService_1 = class EconomatService {
    constructor(budgetRepo, depenseRepo, stockRepo, dataSource) {
        this.budgetRepo = budgetRepo;
        this.depenseRepo = depenseRepo;
        this.stockRepo = stockRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(EconomatService_1.name);
    }
    async createBudget(data) {
        const budget = this.budgetRepo.create(data);
        return this.budgetRepo.save(budget);
    }
    async findBudgets(filters) {
        const query = this.budgetRepo.createQueryBuilder('b')
            .leftJoinAndSelect('b.departement', 'd');
        if (filters?.anneeAcademiqueId)
            query.andWhere('b.anneeAcademiqueId = :aid', { aid: filters.anneeAcademiqueId });
        if (filters?.departementId)
            query.andWhere('b.departementId = :did', { did: filters.departementId });
        return query.orderBy('b.categorie').getMany();
    }
    async getBudgetByAnnee(anneeAcademiqueId) {
        const budgets = await this.budgetRepo.find({
            where: { anneeAcademiqueId },
            order: { categorie: 'ASC' },
        });
        const totalPrevu = budgets.reduce((acc, b) => acc + Number(b.montantPrevu), 0);
        const totalRealise = budgets.reduce((acc, b) => acc + Number(b.montantRealise), 0);
        return {
            budgets,
            totalPrevu,
            totalRealise,
            ecart: totalPrevu - totalRealise,
            tauxExecution: totalPrevu > 0 ? (totalRealise / totalPrevu) * 100 : 0,
        };
    }
    async allouerBudget(id, montant) {
        await this.budgetRepo.update(id, { montantPrevu: montant });
        return this.budgetRepo.findOne({ where: { id } });
    }
    async getExecutionBudget(id) {
        const budget = await this.budgetRepo.findOne({ where: { id } });
        if (!budget)
            throw new common_1.NotFoundException('Budget non trouvé');
        const depenses = await this.dataSource.query(`
      SELECT COALESCE(SUM(montant), 0) as total
      FROM depense
      WHERE budget_id = $1 AND statut = 'paye'
    `, [id]);
        const montantRealise = parseFloat(depenses[0]?.total || 0);
        const montantPrevu = Number(budget.montantPrevu);
        return {
            budget,
            montantRealise,
            tauxExecution: montantPrevu > 0 ? (montantRealise / montantPrevu) * 100 : 0,
            ecart: montantPrevu - montantRealise,
        };
    }
    async createDemandeAchat(data) {
        const demande = await this.dataSource.query(`
      INSERT INTO demande_achat (
        demandeur_id, departement_id, description, montant_estime, 
        categorie, priorite, statut, date_besoin, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'soumise', $7, NOW())
      RETURNING *
    `, [data.demandeurId, data.departementId, data.description, data.montantEstime,
            data.categorie, data.priorite || 'normale', data.dateBesoin]);
        return demande[0];
    }
    async findDemandesAchat(filters) {
        let query = `SELECT da.*, d.nom as departement_nom, u.nom || ' ' || u.prenom as demandeur_nom
                 FROM demande_achat da
                 LEFT JOIN departement d ON d.id = da.departement_id
                 LEFT JOIN utilisateur u ON u.id = da.demandeur_id
                 WHERE 1=1`;
        const params = [];
        let paramCount = 0;
        if (filters?.statut) {
            query += ` AND da.statut = $${++paramCount}`;
            params.push(filters.statut);
        }
        if (filters?.departementId) {
            query += ` AND da.departement_id = $${++paramCount}`;
            params.push(filters.departementId);
        }
        if (filters?.priorite) {
            query += ` AND da.priorite = $${++paramCount}`;
            params.push(filters.priorite);
        }
        query += ` ORDER BY 
      CASE da.priorite 
        WHEN 'urgente' THEN 1 
        WHEN 'haute' THEN 2 
        WHEN 'normale' THEN 3 
        ELSE 4 
      END,
      da.created_at DESC`;
        return this.dataSource.query(query, params);
    }
    async validerDemandeAchat(id, validePar) {
        await this.dataSource.query(`
      UPDATE demande_achat 
      SET statut = 'validee', valide_par = $1, date_validation = NOW()
      WHERE id = $2
    `, [validePar, id]);
        return this.dataSource.query(`SELECT * FROM demande_achat WHERE id = $1`, [id]);
    }
    async rejeterDemandeAchat(id, data) {
        await this.dataSource.query(`
      UPDATE demande_achat 
      SET statut = 'rejetee', valide_par = $1, date_validation = NOW(), motif_rejet = $2
      WHERE id = $3
    `, [data.validePar, data.motif, id]);
        return this.dataSource.query(`SELECT * FROM demande_achat WHERE id = $1`, [id]);
    }
    async createDepense(data) {
        const depense = this.depenseRepo.create(data);
        return this.depenseRepo.save(depense);
    }
    async findDepenses(filters) {
        const query = this.depenseRepo.createQueryBuilder('d');
        if (filters?.statut)
            query.andWhere('d.statut = :statut', { statut: filters.statut });
        if (filters?.budgetId)
            query.andWhere('d.budgetId = :bid', { bid: filters.budgetId });
        if (filters?.anneeAcademiqueId)
            query.andWhere('d.anneeAcademiqueId = :aid', { aid: filters.anneeAcademiqueId });
        return query.orderBy('d.dateDepense', 'DESC').getMany();
    }
    async approuverDepense(id, approuvePar) {
        await this.depenseRepo.update(id, {
            statut: 'approuve',
            approuvePar,
            dateApprobation: new Date(),
        });
        return this.depenseRepo.findOne({ where: { id } });
    }
    async getDepensesParCategorie(anneeAcademiqueId) {
        let query = `
      SELECT categorie, SUM(montant) as total, COUNT(*) as nb_transactions
      FROM depense
      WHERE statut = 'paye'
    `;
        const params = [];
        if (anneeAcademiqueId) {
            query += ` AND annee_academique_id = $1`;
            params.push(anneeAcademiqueId);
        }
        query += ` GROUP BY categorie ORDER BY total DESC`;
        return this.dataSource.query(query, params);
    }
    async getStockAlertes() {
        return this.stockRepo.find({
            where: { quantiteStock: 0 },
            order: { libelle: 'ASC' },
        });
    }
    async getValeurStock() {
        const result = await this.dataSource.query(`
      SELECT 
        COALESCE(SUM(quantite_stock * prix_unitaire), 0) as valeur_totale,
        COUNT(*) as nb_articles,
        COALESCE(SUM(CASE WHEN quantite_stock <= seuil_alerte THEN 1 ELSE 0 END), 0) as articles_alerte
      FROM stock
    `);
        return result[0];
    }
    async getStatsRecouvrement(anneeAcademiqueId) {
        const anneeFilter = anneeAcademiqueId ? `AND i.annee_academique_id = '${anneeAcademiqueId}'` : `AND aa.active = true`;
        const result = await this.dataSource.query(`
      SELECT 
        SUM(gt.montant_total) as total_frais,
        COALESCE(SUM(payes.montant_paye), 0) as total_encaisse,
        SUM(gt.montant_total) - COALESCE(SUM(payes.montant_paye), 0) as total_restant,
        ROUND(100.0 * COALESCE(SUM(payes.montant_paye), 0) / NULLIF(SUM(gt.montant_total), 0), 2) as taux_recouvrement,
        COUNT(CASE WHEN gt.montant_total > COALESCE(payes.montant_paye, 0) THEN 1 END) as nb_impayes
      FROM inscription i
      JOIN grille_tarifaire gt ON gt.parcours_id = i.parcours_id AND gt.annee_academique_id = i.annee_academique_id
      LEFT JOIN (
        SELECT inscription_id, SUM(montant) as montant_paye
        FROM paiement WHERE statut = 'valide' GROUP BY inscription_id
      ) payes ON payes.inscription_id = i.id
      JOIN annee_academique aa ON aa.id = i.annee_academique_id
      WHERE i.statut = 'validee' ${anneeFilter}
    `);
        return result[0];
    }
    async getImpayes(filters) {
        let query = `
      SELECT 
        e.nom, e.prenom, e.email,
        p.code as parcours_code, p.nom as parcours_nom,
        gt.montant_total as montant_du,
        COALESCE(payes.montant_paye, 0) as montant_paye,
        gt.montant_total - COALESCE(payes.montant_paye, 0) as montant_restant,
        i.date_inscription,
        MAX(ech.date_echeance) as prochaine_echeance
      FROM inscription i
      JOIN etudiant e ON e.id = i.etudiant_id
      JOIN parcours p ON p.id = i.parcours_id
      JOIN grille_tarifaire gt ON gt.parcours_id = i.parcours_id AND gt.annee_academique_id = i.annee_academique_id
      LEFT JOIN (
        SELECT inscription_id, SUM(montant) as montant_paye
        FROM paiement WHERE statut = 'valide' GROUP BY inscription_id
      ) payes ON payes.inscription_id = i.id
      LEFT JOIN echeancier ech ON ech.inscription_id = i.id AND ech.statut = 'en_attente'
      WHERE i.statut = 'validee'
        AND gt.montant_total > COALESCE(payes.montant_paye, 0)
    `;
        const params = [];
        let paramCount = 0;
        if (filters?.jours) {
            query += ` AND ech.date_echeance <= NOW() + INTERVAL '${filters.jours} days'`;
        }
        if (filters?.montantMin) {
            query += ` AND (gt.montant_total - COALESCE(payes.montant_paye, 0)) >= $${++paramCount}`;
            params.push(filters.montantMin);
        }
        query += ` GROUP BY e.id, e.nom, e.prenom, e.email, p.code, p.nom, gt.montant_total, payes.montant_paye, i.date_inscription
              ORDER BY montant_restant DESC`;
        return this.dataSource.query(query, params);
    }
    async getCreancesAging(jours = 30) {
        const result = await this.dataSource.query(`
      SELECT 
        CASE 
          WHEN echeance >= NOW() THEN 'a_echeance'
          WHEN echeance >= NOW() - INTERVAL '30 days' THEN '1_30_jours'
          WHEN echeance >= NOW() - INTERVAL '60 days' THEN '31_60_jours'
          WHEN echeance >= NOW() - INTERVAL '90 days' THEN '61_90_jours'
          ELSE 'plus_90_jours'
        END as tranche,
        COUNT(*) as nb_creances,
        SUM(montant_restant) as montant_total
      FROM (
        SELECT 
          MAX(ech.date_echeance) as echeance,
          gt.montant_total - COALESCE(
            (SELECT SUM(montant) FROM paiement WHERE inscription_id = i.id AND statut = 'valide'), 0
          ) as montant_restant
        FROM inscription i
        JOIN grille_tarifaire gt ON gt.parcours_id = i.parcours_id AND gt.annee_academique_id = i.annee_academique_id
        JOIN echeancier ech ON ech.inscription_id = i.id
        WHERE i.statut = 'validee'
          AND ech.statut = 'en_attente'
        GROUP BY i.id, gt.montant_total
        HAVING gt.montant_total > COALESCE(
          (SELECT SUM(montant) FROM paiement WHERE inscription_id = i.id AND statut = 'valide'), 0
        )
      ) creances
      GROUP BY tranche
    `);
        return result;
    }
    async getRapportMensuel(mois, annee) {
        const [recettes, depenses, nouvellesInscriptions, solde] = await Promise.all([
            this.dataSource.query(`
        SELECT COALESCE(SUM(montant), 0) as total, COUNT(*) as nb_transactions
        FROM paiement
        WHERE EXTRACT(MONTH FROM date_paiement) = $1 AND EXTRACT(YEAR FROM date_paiement) = $2
          AND statut = 'valide'
      `, [mois, annee]),
            this.dataSource.query(`
        SELECT COALESCE(SUM(montant), 0) as total, COUNT(*) as nb_transactions
        FROM depense
        WHERE EXTRACT(MONTH FROM date_depense) = $1 AND EXTRACT(YEAR FROM date_depense) = $2
          AND statut = 'paye'
      `, [mois, annee]),
            this.dataSource.query(`
        SELECT COUNT(*) as total
        FROM inscription
        WHERE EXTRACT(MONTH FROM date_inscription) = $1 AND EXTRACT(YEAR FROM date_inscription) = $2
          AND statut = 'validee'
      `, [mois, annee]),
            this.getBilanFinancier(),
        ]);
        return {
            periode: `${mois}/${annee}`,
            recettes: recettes[0],
            depenses: depenses[0],
            nouvellesInscriptions: nouvellesInscriptions[0]?.total || 0,
            solde: parseFloat(recettes[0]?.total || 0) - parseFloat(depenses[0]?.total || 0),
            bilanGlobal: solde,
        };
    }
    async getBilanFinancier(anneeAcademiqueId) {
        const anneeFilter = anneeAcademiqueId
            ? `WHERE aa.id = '${anneeAcademiqueId}'`
            : `WHERE aa.active = true`;
        const [recettes, depenses, budget, creances] = await Promise.all([
            this.dataSource.query(`
        SELECT COALESCE(SUM(p.montant), 0) as total
        FROM paiement p
        JOIN inscription i ON i.id = p.inscription_id
        JOIN annee_academique aa ON aa.id = i.annee_academique_id
        ${anneeFilter.replace('WHERE', 'WHERE p.statut = \'valide\' AND')}
      `),
            this.dataSource.query(`
        SELECT COALESCE(SUM(d.montant), 0) as total
        FROM depense d
        JOIN annee_academique aa ON aa.id = d.annee_academique_id
        ${anneeFilter.replace('WHERE', 'WHERE d.statut = \'paye\' AND')}
      `),
            this.dataSource.query(`
        SELECT COALESCE(SUM(b.montant_prevu), 0) as total_prevu,
               COALESCE(SUM(b.montant_realise), 0) as total_realise
        FROM budget b
        JOIN annee_academique aa ON aa.id = b.annee_academique_id
        ${anneeFilter}
      `),
            this.getStatsRecouvrement(anneeAcademiqueId),
        ]);
        return {
            recettes: parseFloat(recettes[0]?.total || 0),
            depenses: parseFloat(depenses[0]?.total || 0),
            resultat: parseFloat(recettes[0]?.total || 0) - parseFloat(depenses[0]?.total || 0),
            budget: {
                prevu: parseFloat(budget[0]?.total_prevu || 0),
                realise: parseFloat(budget[0]?.total_realise || 0),
                ecart: parseFloat(budget[0]?.total_prevu || 0) - parseFloat(budget[0]?.total_realise || 0),
            },
            recouvrement: creances,
        };
    }
    async getPrevisionTresorerie(mois = 6) {
        const previsions = [];
        const today = new Date();
        for (let i = 0; i < mois; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
            const m = date.getMonth() + 1;
            const a = date.getFullYear();
            const echeances = await this.dataSource.query(`
        SELECT COALESCE(SUM(montant_du), 0) as attendu
        FROM echeancier
        WHERE EXTRACT(MONTH FROM date_echeance) = $1 AND EXTRACT(YEAR FROM date_echeance) = $2
          AND statut IN ('en_attente', 'en_retard')
      `, [m, a]);
            const depensesPrevues = await this.dataSource.query(`
        SELECT COALESCE(SUM(montant_prevu), 0) / 12 as mensuel
        FROM budget
        JOIN annee_academique aa ON aa.id = annee_academique_id
        WHERE aa.active = true
      `);
            previsions.push({
                mois: m,
                annee: a,
                entreesAttendues: parseFloat(echeances[0]?.attendu || 0),
                sortiesPrevues: parseFloat(depensesPrevues[0]?.mensuel || 0),
                soldePrevisionnel: parseFloat(echeances[0]?.attendu || 0) - parseFloat(depensesPrevues[0]?.mensuel || 0),
            });
        }
        return previsions;
    }
};
exports.EconomatService = EconomatService;
exports.EconomatService = EconomatService = EconomatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(finance_entities_1.Budget)),
    __param(1, (0, typeorm_1.InjectRepository)(finance_entities_1.Depense)),
    __param(2, (0, typeorm_1.InjectRepository)(logistics_entities_1.Stock)),
    __param(3, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], EconomatService);
//# sourceMappingURL=economat.service.js.map