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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const finance_entities_1 = require("./finance.entities");
let FinanceService = class FinanceService {
    constructor(grilleRepo, echeancierRepo, paiementRepo, budgetRepo, depenseRepo, contratRepo, fichePaieRepo) {
        this.grilleRepo = grilleRepo;
        this.echeancierRepo = echeancierRepo;
        this.paiementRepo = paiementRepo;
        this.budgetRepo = budgetRepo;
        this.depenseRepo = depenseRepo;
        this.contratRepo = contratRepo;
        this.fichePaieRepo = fichePaieRepo;
    }
    async enregistrerPaiement(tid, dto, caissierId) {
        const reference = 'REC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        const paiement = await this.paiementRepo.save(this.paiementRepo.create({ ...dto, reference, statut: 'valide', caissierId, numeroRecu: reference }));
        return {
            paiement,
            recu: {
                numeroRecu: reference,
                date: new Date(),
                montant: dto.montant,
                mode: dto.modePaiement,
                statut: 'Paye',
                message: 'Recu de paiement - IMTECH UNIVERSITY',
            },
        };
    }
    getPaiementsEtudiant(tid, inscriptionId) {
        return this.paiementRepo.find({ where: { inscriptionId }, order: { createdAt: 'DESC' } });
    }
    async getTousPaiements(tid, date) {
        const where = {};
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59);
            where.datePaiement = (0, typeorm_2.Between)(start, end);
        }
        return this.paiementRepo.find({ where, order: { createdAt: 'DESC' } });
    }
    async getCaisseJournaliere(tid) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const paiements = await this.paiementRepo.find({
            where: { datePaiement: (0, typeorm_2.Between)(today, endOfDay), statut: 'valide' },
            order: { createdAt: 'DESC' }
        });
        const total = paiements.reduce((s, p) => s + Number(p.montant), 0);
        return { date: today, total, nombrePaiements: paiements.length, paiements };
    }
    async cloturerCaisse(tid, userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const paiements = await this.paiementRepo.find({
            where: { datePaiement: (0, typeorm_2.Between)(today, endOfDay), statut: 'valide' }
        });
        const total = paiements.reduce((s, p) => s + Number(p.montant), 0);
        return { message: 'Caisse cloturee', date: today, totalCloture: total, nombreTransactions: paiements.length, cloturePar: userId };
    }
    creerGrille(dto) {
        return this.grilleRepo.save(this.grilleRepo.create(dto));
    }
    getGrilles(parcoursId) {
        const where = {};
        if (parcoursId)
            where.parcoursId = parcoursId;
        return this.grilleRepo.find({ where });
    }
    creerBudget(tid, dto) {
        return this.budgetRepo.save(this.budgetRepo.create(dto));
    }
    getBudgets(tid, anneeAcademiqueId) {
        const where = {};
        if (anneeAcademiqueId)
            where.anneeAcademiqueId = anneeAcademiqueId;
        return this.budgetRepo.find({ where });
    }
    async ajouterDepense(tid, dto, demandePar) {
        const depense = await this.depenseRepo.save(this.depenseRepo.create({ ...dto, demandePar, statut: 'en_attente' }));
        if (dto.budgetId) {
            const budget = await this.budgetRepo.findOne({ where: { id: dto.budgetId } });
            if (budget) {
                await this.budgetRepo.save({ ...budget, montantRealise: Number(budget.montantRealise) + Number(dto.montant) });
            }
        }
        return depense;
    }
    getDepenses(tid, anneeAcademiqueId) {
        const where = {};
        if (anneeAcademiqueId)
            where.anneeAcademiqueId = anneeAcademiqueId;
        return this.depenseRepo.find({ where, order: { dateDepense: 'DESC' } });
    }
    async updateBudget(tid, id, dto) {
        const budget = await this.budgetRepo.findOne({ where: { id } });
        if (!budget)
            throw new common_1.NotFoundException('Budget non trouvé');
        return this.budgetRepo.save({ ...budget, ...dto });
    }
    async updateDepense(tid, id, dto) {
        const depense = await this.depenseRepo.findOne({ where: { id } });
        if (!depense)
            throw new common_1.NotFoundException('Dépense non trouvée');
        return this.depenseRepo.save({ ...depense, ...dto });
    }
    async deleteDepense(tid, id) {
        const depense = await this.depenseRepo.findOne({ where: { id } });
        if (!depense)
            throw new common_1.NotFoundException('Dépense non trouvée');
        await this.depenseRepo.delete(id);
        return { message: 'Dépense supprimée avec succès' };
    }
    async updateContrat(tid, id, dto) {
        const contrat = await this.contratRepo.findOne({ where: { id } });
        if (!contrat)
            throw new common_1.NotFoundException('Contrat non trouvé');
        return this.contratRepo.save({ ...contrat, ...dto });
    }
    async getRapportFinancier(tid, anneeAcademiqueId) {
        const paiements = await this.paiementRepo.find({ where: { datePaiement: (0, typeorm_2.Between)(new Date(anneeAcademiqueId), new Date()) } });
        const budgets = await this.budgetRepo.find({ where: { anneeAcademiqueId } });
        const totalRecettes = paiements.reduce((s, p) => s + Number(p.montant), 0);
        const totalBudget = budgets.reduce((s, b) => s + Number(b.montantPrevu), 0);
        const totalDepenses = budgets.reduce((s, b) => s + Number(b.montantRealise), 0);
        return { anneeAcademiqueId, totalRecettes, totalBudget, totalDepenses, solde: totalRecettes - totalDepenses, nbPaiements: paiements.length };
    }
    creerContrat(tid, dto) {
        return this.contratRepo.save(this.contratRepo.create(dto));
    }
    getContrats(tid, utilisateurId) {
        const where = {};
        if (utilisateurId)
            where.utilisateurId = utilisateurId;
        return this.contratRepo.find({ where });
    }
    creerEcheancier(tid, dto) {
        return this.echeancierRepo.save(this.echeancierRepo.create(dto));
    }
    getEcheanciers(tid, inscriptionId) {
        const where = {};
        if (inscriptionId)
            where.inscriptionId = inscriptionId;
        return this.echeancierRepo.find({ where });
    }
    creerFichePaie(dto) {
        return this.fichePaieRepo.save(this.fichePaieRepo.create(dto));
    }
    getFichesPaie(contratId) {
        const where = {};
        if (contratId)
            where.contratId = contratId;
        return this.fichePaieRepo.find({ where });
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(finance_entities_1.GrilleTarifaire, 'tenant')),
    __param(1, (0, typeorm_1.InjectRepository)(finance_entities_1.Echeancier, 'tenant')),
    __param(2, (0, typeorm_1.InjectRepository)(finance_entities_1.Paiement, 'tenant')),
    __param(3, (0, typeorm_1.InjectRepository)(finance_entities_1.Budget, 'tenant')),
    __param(4, (0, typeorm_1.InjectRepository)(finance_entities_1.Depense, 'tenant')),
    __param(5, (0, typeorm_1.InjectRepository)(finance_entities_1.ContratPersonnel, 'tenant')),
    __param(6, (0, typeorm_1.InjectRepository)(finance_entities_1.FichePaie, 'tenant')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FinanceService);
//# sourceMappingURL=finance.service.js.map