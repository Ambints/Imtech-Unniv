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
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const finance_service_1 = require("./finance.service");
let FinanceController = class FinanceController {
    constructor(svc) {
        this.svc = svc;
    }
    payer(tid, dto) {
        return this.svc.enregistrerPaiement(tid, dto, 'caissier');
    }
    getTousPaiements(tid, date) {
        return this.svc.getTousPaiements(tid, date);
    }
    getPaiements(tid, eid) {
        return this.svc.getPaiementsEtudiant(tid, eid);
    }
    getCaisse(tid) { return this.svc.getCaisseJournaliere(tid); }
    cloturer(tid, body) {
        return this.svc.cloturerCaisse(tid, body.userId);
    }
    creerBudget(tid, dto) { return this.svc.creerBudget(tid, dto); }
    getBudgets(tid, annee) {
        return this.svc.getBudgets(tid, annee);
    }
    ajouterDepense(tid, dto) {
        return this.svc.ajouterDepense(tid, dto, 'user');
    }
    getDepenses(tid, annee) {
        return this.svc.getDepenses(tid, annee);
    }
    updateDepense(tid, id, dto) {
        return this.svc.updateDepense(tid, id, dto);
    }
    deleteDepense(tid, id) {
        return this.svc.deleteDepense(tid, id);
    }
    updateBudget(tid, id, dto) {
        return this.svc.updateBudget(tid, id, dto);
    }
    rapport(tid, annee) {
        return this.svc.getRapportFinancier(tid, annee);
    }
    creerContrat(tid, dto) { return this.svc.creerContrat(tid, dto); }
    getContrats(tid, pid) {
        return this.svc.getContrats(tid, pid);
    }
    updateContrat(tid, id, dto) {
        return this.svc.updateContrat(tid, id, dto);
    }
    creerEcheancier(tid, dto) { return this.svc.creerEcheancier(tid, dto); }
    getEcheanciers(tid, eid) {
        return this.svc.getEcheanciers(tid, eid);
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Post)(':tid/paiements'),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer paiement + generer recu (Caissier)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "payer", null);
__decorate([
    (0, common_1.Get)(':tid/paiements'),
    (0, swagger_1.ApiOperation)({ summary: 'Tous les paiements (filtre par date)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getTousPaiements", null);
__decorate([
    (0, common_1.Get)(':tid/paiements/:etudiantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Paiements d un etudiant' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getPaiements", null);
__decorate([
    (0, common_1.Get)(':tid/caisse'),
    (0, swagger_1.ApiOperation)({ summary: 'Etat caisse journaliere (Caissier)' }),
    __param(0, (0, common_1.Param)('tid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getCaisse", null);
__decorate([
    (0, common_1.Post)(':tid/caisse/cloturer'),
    (0, swagger_1.ApiOperation)({ summary: 'Cloturer la caisse du jour' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "cloturer", null);
__decorate([
    (0, common_1.Post)(':tid/budgets'),
    (0, swagger_1.ApiOperation)({ summary: 'Creer un budget (Economat)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "creerBudget", null);
__decorate([
    (0, common_1.Get)(':tid/budgets'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des budgets' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Query)('annee')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getBudgets", null);
__decorate([
    (0, common_1.Post)(':tid/depenses'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter une depense' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "ajouterDepense", null);
__decorate([
    (0, common_1.Get)(':tid/depenses'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des depenses' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Query)('annee')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getDepenses", null);
__decorate([
    (0, common_1.Patch)(':tid/depenses/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une depense' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "updateDepense", null);
__decorate([
    (0, common_1.Delete)(':tid/depenses/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une depense' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "deleteDepense", null);
__decorate([
    (0, common_1.Patch)(':tid/budgets/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un budget' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "updateBudget", null);
__decorate([
    (0, common_1.Get)(':tid/rapport'),
    (0, swagger_1.ApiOperation)({ summary: 'Rapport financier annuel (President / Economat)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Query)('annee')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "rapport", null);
__decorate([
    (0, common_1.Post)(':tid/contrats'),
    (0, swagger_1.ApiOperation)({ summary: 'Creer contrat RH' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "creerContrat", null);
__decorate([
    (0, common_1.Get)(':tid/contrats'),
    (0, swagger_1.ApiOperation)({ summary: 'Contrats RH' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Query)('personnelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getContrats", null);
__decorate([
    (0, common_1.Patch)(':tid/contrats/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un contrat' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "updateContrat", null);
__decorate([
    (0, common_1.Post)(':tid/echeanciers'),
    (0, swagger_1.ApiOperation)({ summary: 'Creer un echeancier de paiement' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "creerEcheancier", null);
__decorate([
    (0, common_1.Get)(':tid/echeanciers'),
    (0, swagger_1.ApiOperation)({ summary: 'Echeanciers' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Query)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getEcheanciers", null);
exports.FinanceController = FinanceController = __decorate([
    (0, swagger_1.ApiTags)('Finance'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('finance'),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map