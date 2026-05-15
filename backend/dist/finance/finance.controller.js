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
    getTenantId(req) {
        return req.tenantId || '';
    }
    payer(req, dto) {
        return this.svc.enregistrerPaiement(this.getTenantId(req), dto, 'caissier');
    }
    getTousPaiements(req, date) {
        return this.svc.getTousPaiements(this.getTenantId(req), date);
    }
    getPaiements(req, eid) {
        return this.svc.getPaiementsEtudiant(this.getTenantId(req), eid);
    }
    getCaisse(req) {
        return this.svc.getCaisseJournaliere(this.getTenantId(req));
    }
    cloturer(req, body) {
        return this.svc.cloturerCaisse(this.getTenantId(req), body.userId);
    }
    creerBudget(req, dto) {
        return this.svc.creerBudget(this.getTenantId(req), dto);
    }
    getBudgets(req, annee) {
        return this.svc.getBudgets(this.getTenantId(req), annee);
    }
    ajouterDepense(req, dto) {
        return this.svc.ajouterDepense(this.getTenantId(req), dto, 'user');
    }
    getDepenses(req, annee) {
        return this.svc.getDepenses(this.getTenantId(req), annee);
    }
    updateDepense(req, id, dto) {
        return this.svc.updateDepense(this.getTenantId(req), id, dto);
    }
    deleteDepense(req, id) {
        return this.svc.deleteDepense(this.getTenantId(req), id);
    }
    updateBudget(req, id, dto) {
        return this.svc.updateBudget(this.getTenantId(req), id, dto);
    }
    rapport(req, annee) {
        return this.svc.getRapportFinancier(this.getTenantId(req), annee);
    }
    creerContrat(req, dto) {
        return this.svc.creerContrat(this.getTenantId(req), dto);
    }
    getContrats(req, pid) {
        return this.svc.getContrats(this.getTenantId(req), pid);
    }
    updateContrat(req, id, dto) {
        return this.svc.updateContrat(this.getTenantId(req), id, dto);
    }
    creerEcheancier(req, dto) {
        return this.svc.creerEcheancier(this.getTenantId(req), dto);
    }
    getEcheanciers(req, eid) {
        return this.svc.getEcheanciers(this.getTenantId(req), eid);
    }
    getPaiementsEnAttente(req) {
        return this.svc.getPaiementsInscriptionEnAttente(this.getTenantId(req));
    }
    getTousPaiementsInscription(req, statut) {
        return this.svc.getTousPaiementsInscription(this.getTenantId(req), statut);
    }
    validerPaiement(req, paiementId, body) {
        return this.svc.validerPaiementInscription(this.getTenantId(req), paiementId, body.caissierId, body.noteValidation);
    }
    rejeterPaiement(req, paiementId, body) {
        return this.svc.rejeterPaiementInscription(this.getTenantId(req), paiementId, body.caissierId, body.motifRejet);
    }
    getStatistiquesPaiements(req) {
        return this.svc.getStatistiquesPaiementsInscription(this.getTenantId(req));
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Post)('paiements'),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer paiement + generer recu (Caissier)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "payer", null);
__decorate([
    (0, common_1.Get)('paiements'),
    (0, swagger_1.ApiOperation)({ summary: 'Tous les paiements (filtre par date)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getTousPaiements", null);
__decorate([
    (0, common_1.Get)('paiements/:etudiantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Paiements d un etudiant' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getPaiements", null);
__decorate([
    (0, common_1.Get)('caisse'),
    (0, swagger_1.ApiOperation)({ summary: 'Etat caisse journaliere (Caissier)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getCaisse", null);
__decorate([
    (0, common_1.Post)('caisse/cloturer'),
    (0, swagger_1.ApiOperation)({ summary: 'Cloturer la caisse du jour' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "cloturer", null);
__decorate([
    (0, common_1.Post)('budgets'),
    (0, swagger_1.ApiOperation)({ summary: 'Creer un budget (Economat)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "creerBudget", null);
__decorate([
    (0, common_1.Get)('budgets'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des budgets' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('annee')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getBudgets", null);
__decorate([
    (0, common_1.Post)('depenses'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter une depense' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "ajouterDepense", null);
__decorate([
    (0, common_1.Get)('depenses'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des depenses' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('annee')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getDepenses", null);
__decorate([
    (0, common_1.Patch)('depenses/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une depense' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "updateDepense", null);
__decorate([
    (0, common_1.Delete)('depenses/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une depense' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "deleteDepense", null);
__decorate([
    (0, common_1.Patch)('budgets/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un budget' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "updateBudget", null);
__decorate([
    (0, common_1.Get)('rapport'),
    (0, swagger_1.ApiOperation)({ summary: 'Rapport financier annuel (President / Economat)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('annee')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "rapport", null);
__decorate([
    (0, common_1.Post)('contrats'),
    (0, swagger_1.ApiOperation)({ summary: 'Creer contrat RH' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "creerContrat", null);
__decorate([
    (0, common_1.Get)('contrats'),
    (0, swagger_1.ApiOperation)({ summary: 'Contrats RH' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('personnelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getContrats", null);
__decorate([
    (0, common_1.Patch)('contrats/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un contrat' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "updateContrat", null);
__decorate([
    (0, common_1.Post)('echeanciers'),
    (0, swagger_1.ApiOperation)({ summary: 'Creer un echeancier de paiement' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "creerEcheancier", null);
__decorate([
    (0, common_1.Get)('echeanciers'),
    (0, swagger_1.ApiOperation)({ summary: 'Echeanciers' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getEcheanciers", null);
__decorate([
    (0, common_1.Get)('paiements-inscription/en-attente'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des paiements d\'inscription en attente de validation (Caissier)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getPaiementsEnAttente", null);
__decorate([
    (0, common_1.Get)('paiements-inscription'),
    (0, swagger_1.ApiOperation)({ summary: 'Tous les paiements d\'inscription (Caissier)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('statut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getTousPaiementsInscription", null);
__decorate([
    (0, common_1.Post)('paiements-inscription/:id/valider'),
    (0, swagger_1.ApiOperation)({ summary: 'Valider un paiement d\'inscription (Caissier)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "validerPaiement", null);
__decorate([
    (0, common_1.Post)('paiements-inscription/:id/rejeter'),
    (0, swagger_1.ApiOperation)({ summary: 'Rejeter un paiement d\'inscription (Caissier)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "rejeterPaiement", null);
__decorate([
    (0, common_1.Get)('paiements-inscription/statistiques'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques des paiements d\'inscription (Caissier)' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getStatistiquesPaiements", null);
exports.FinanceController = FinanceController = __decorate([
    (0, swagger_1.ApiTags)('Finance'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('finance'),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map