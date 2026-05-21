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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const economat_service_1 = require("./economat.service");
const create_budget_dto_1 = require("./dto/create-budget.dto");
const update_budget_dto_1 = require("./dto/update-budget.dto");
const filters_dto_1 = require("./dto/filters.dto");
let EconomatController = class EconomatController {
    constructor(economatService) {
        this.economatService = economatService;
    }
    async getAnneesAcademiques() {
        return this.economatService.getAnneesAcademiques();
    }
    async createBudget(dto) {
        return this.economatService.createBudget(dto);
    }
    async getBudgets(filters) {
        return this.economatService.getBudgets(filters);
    }
    async getBudgetStats(anneeAcademiqueId) {
        return this.economatService.getBudgetStats(anneeAcademiqueId);
    }
    async getBudgetByDepartement(anneeAcademiqueId) {
        return this.economatService.getBudgetByDepartement(anneeAcademiqueId);
    }
    async getBudgetById(id) {
        return this.economatService.getBudgetById(id);
    }
    async updateBudget(id, dto) {
        return this.economatService.updateBudget(id, dto);
    }
    async getFournisseurs(search) {
        return this.economatService.getFournisseurs(search);
    }
    async getFournisseurTransactions(fournisseur) {
        return this.economatService.getFournisseurTransactions(fournisseur);
    }
    async getRecouvrementStats(anneeAcademiqueId) {
        return this.economatService.getRecouvrementStats(anneeAcademiqueId);
    }
    async getInscriptionsImpayees(filters) {
        return this.economatService.getInscriptionsImpayees(filters);
    }
    async getRecouvrementByParcours(anneeAcademiqueId) {
        return this.economatService.getRecouvrementByParcours(anneeAcademiqueId);
    }
    async getRapportJournalier(date) {
        return this.economatService.getRapportJournalier(date);
    }
    async getRapportMensuel(mois, annee) {
        return this.economatService.getRapportMensuel(mois, annee);
    }
    async getRapportAnnuel(anneeAcademiqueId) {
        return this.economatService.getRapportAnnuel(anneeAcademiqueId);
    }
    async getBilanFinancier(anneeAcademiqueId) {
        return this.economatService.getBilanFinancier(anneeAcademiqueId);
    }
    async getSubventions(anneeAcademiqueId) {
        return this.economatService.getSubventions(anneeAcademiqueId);
    }
    async getSubventionUtilisation(id) {
        return this.economatService.getSubventionUtilisation(id);
    }
};
exports.EconomatController = EconomatController;
__decorate([
    (0, common_1.Get)('annee-academique'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getAnneesAcademiques", null);
__decorate([
    (0, common_1.Post)('budget'),
    (0, roles_decorator_1.Roles)('economat', 'admin'),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_budget_dto_1.CreateBudgetDto]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "createBudget", null);
__decorate([
    (0, common_1.Get)('budget'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filters_dto_1.BudgetFiltersDto]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getBudgets", null);
__decorate([
    (0, common_1.Get)('budget/stats'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __param(0, (0, common_1.Query)('annee_academique_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getBudgetStats", null);
__decorate([
    (0, common_1.Get)('budget/by-departement'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __param(0, (0, common_1.Query)('annee_academique_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getBudgetByDepartement", null);
__decorate([
    (0, common_1.Get)('budget/:id'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getBudgetById", null);
__decorate([
    (0, common_1.Put)('budget/:id'),
    (0, roles_decorator_1.Roles)('economat', 'admin'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_budget_dto_1.UpdateBudgetDto]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "updateBudget", null);
__decorate([
    (0, common_1.Get)('fournisseurs'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getFournisseurs", null);
__decorate([
    (0, common_1.Get)('fournisseurs/:fournisseur/transactions'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __param(0, (0, common_1.Param)('fournisseur')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getFournisseurTransactions", null);
__decorate([
    (0, common_1.Get)('recouvrement/stats'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __param(0, (0, common_1.Query)('annee_academique_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getRecouvrementStats", null);
__decorate([
    (0, common_1.Get)('recouvrement/impayes'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __param(0, (0, common_1.Query)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filters_dto_1.RecouvrementFiltersDto]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getInscriptionsImpayees", null);
__decorate([
    (0, common_1.Get)('recouvrement/by-parcours'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __param(0, (0, common_1.Query)('annee_academique_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getRecouvrementByParcours", null);
__decorate([
    (0, common_1.Get)('rapports/journalier'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getRapportJournalier", null);
__decorate([
    (0, common_1.Get)('rapports/mensuel'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __param(0, (0, common_1.Query)('mois')),
    __param(1, (0, common_1.Query)('annee')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getRapportMensuel", null);
__decorate([
    (0, common_1.Get)('rapports/annuel'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __param(0, (0, common_1.Query)('annee_academique_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getRapportAnnuel", null);
__decorate([
    (0, common_1.Get)('rapports/bilan'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __param(0, (0, common_1.Query)('annee_academique_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getBilanFinancier", null);
__decorate([
    (0, common_1.Get)('subventions'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __param(0, (0, common_1.Query)('annee_academique_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getSubventions", null);
__decorate([
    (0, common_1.Get)('subventions/:id/utilisation'),
    (0, roles_decorator_1.Roles)('economat', 'admin', 'president'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EconomatController.prototype, "getSubventionUtilisation", null);
exports.EconomatController = EconomatController = __decorate([
    (0, common_1.Controller)('economat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [economat_service_1.EconomatService])
], EconomatController);
//# sourceMappingURL=economat.controller.js.map