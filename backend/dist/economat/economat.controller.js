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
exports.EconomatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const economat_service_1 = require("./economat.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let EconomatController = class EconomatController {
    constructor(svc) {
        this.svc = svc;
    }
    createBudget(dto) {
        return this.svc.createBudget(dto);
    }
    findBudgets(filters) {
        return this.svc.findBudgets(filters);
    }
    getBudgetByAnnee(anneeAcademiqueId) {
        return this.svc.getBudgetByAnnee(anneeAcademiqueId);
    }
    allouerBudget(id, montant) {
        return this.svc.allouerBudget(id, montant);
    }
    getExecutionBudget(id) {
        return this.svc.getExecutionBudget(id);
    }
    createDemandeAchat(dto) {
        return this.svc.createDemandeAchat(dto);
    }
    findDemandesAchat(filters) {
        return this.svc.findDemandesAchat(filters);
    }
    validerDemandeAchat(id, validePar) {
        return this.svc.validerDemandeAchat(id, validePar);
    }
    rejeterDemandeAchat(id, dto) {
        return this.svc.rejeterDemandeAchat(id, dto);
    }
    createDepense(dto) {
        return this.svc.createDepense(dto);
    }
    findDepenses(filters) {
        return this.svc.findDepenses(filters);
    }
    approuverDepense(id, dto) {
        return this.svc.approuverDepense(id, dto.approuvePar);
    }
    getDepensesParCategorie(anneeAcademiqueId) {
        return this.svc.getDepensesParCategorie(anneeAcademiqueId);
    }
    getStockAlertes() {
        return this.svc.getStockAlertes();
    }
    getValeurStock() {
        return this.svc.getValeurStock();
    }
    getStatsRecouvrement(anneeAcademiqueId) {
        return this.svc.getStatsRecouvrement(anneeAcademiqueId);
    }
    getImpayes(filters) {
        return this.svc.getImpayes(filters);
    }
    getCreances(jours = 30) {
        return this.svc.getCreancesAging(jours);
    }
    getRapportMensuel(mois, annee) {
        return this.svc.getRapportMensuel(mois, annee);
    }
    getBilanFinancier(anneeAcademiqueId) {
        return this.svc.getBilanFinancier(anneeAcademiqueId);
    }
    getPrevisionTresorerie(mois = 6) {
        return this.svc.getPrevisionTresorerie(mois);
    }
};
exports.EconomatController = EconomatController;
__decorate([
    (0, common_1.Post)('budgets'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Élaborer le budget annuel par département' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "createBudget", null);
__decorate([
    (0, common_1.Get)('budgets'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des budgets' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "findBudgets", null);
__decorate([
    (0, common_1.Get)('budgets/annee/:anneeAcademiqueId'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Budget complet d\'une année académique' }),
    __param(0, (0, common_1.Param)('anneeAcademiqueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "getBudgetByAnnee", null);
__decorate([
    (0, common_1.Patch)('budgets/:id/allouer'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier l\'allocation budgétaire' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('montant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "allouerBudget", null);
__decorate([
    (0, common_1.Get)('budgets/:id/execution'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Suivi d\'exécution du budget' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "getExecutionBudget", null);
__decorate([
    (0, common_1.Post)('demandes-achat'),
    (0, roles_decorator_1.Roles)('secretaire', 'responsable_pedagogique', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Soumettre une demande d\'achat' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "createDemandeAchat", null);
__decorate([
    (0, common_1.Get)('demandes-achat'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'secretaire', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des demandes d\'achat' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "findDemandesAchat", null);
__decorate([
    (0, common_1.Patch)('demandes-achat/:id/valider'),
    (0, roles_decorator_1.Roles)('economat', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Valider une demande d\'achat' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('validePar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "validerDemandeAchat", null);
__decorate([
    (0, common_1.Patch)('demandes-achat/:id/rejeter'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Rejeter une demande d\'achat' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "rejeterDemandeAchat", null);
__decorate([
    (0, common_1.Post)('depenses'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer une dépense' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "createDepense", null);
__decorate([
    (0, common_1.Get)('depenses'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des dépenses' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "findDepenses", null);
__decorate([
    (0, common_1.Patch)('depenses/:id/approuver'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Approuver une dépense' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "approuverDepense", null);
__decorate([
    (0, common_1.Get)('depenses/categories'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Répartition des dépenses par catégorie' }),
    __param(0, (0, common_1.Query)('anneeAcademiqueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "getDepensesParCategorie", null);
__decorate([
    (0, common_1.Get)('stock/alertes'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'logistique'),
    (0, swagger_1.ApiOperation)({ summary: 'Alertes de stock bas' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "getStockAlertes", null);
__decorate([
    (0, common_1.Get)('stock/valeur'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Valeur totale du stock' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "getValeurStock", null);
__decorate([
    (0, common_1.Get)('recouvrement/stats'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques de recouvrement des frais' }),
    __param(0, (0, common_1.Query)('anneeAcademiqueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "getStatsRecouvrement", null);
__decorate([
    (0, common_1.Get)('recouvrement/impayes'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des impayés' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "getImpayes", null);
__decorate([
    (0, common_1.Get)('recouvrement/creances'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Âge des créances' }),
    __param(0, (0, common_1.Query)('jours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "getCreances", null);
__decorate([
    (0, common_1.Get)('audit/rapport-mensuel'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Rapport financier mensuel pour le Président' }),
    __param(0, (0, common_1.Query)('mois')),
    __param(1, (0, common_1.Query)('annee')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "getRapportMensuel", null);
__decorate([
    (0, common_1.Get)('audit/bilan'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Bilan financier' }),
    __param(0, (0, common_1.Query)('anneeAcademiqueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "getBilanFinancier", null);
__decorate([
    (0, common_1.Get)('tresorerie'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Prévision de trésorerie' }),
    __param(0, (0, common_1.Query)('mois')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EconomatController.prototype, "getPrevisionTresorerie", null);
exports.EconomatController = EconomatController = __decorate([
    (0, swagger_1.ApiTags)('Économat - Direction Financière'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('economat'),
    __metadata("design:paramtypes", [economat_service_1.EconomatService])
], EconomatController);
//# sourceMappingURL=economat.controller.js.map