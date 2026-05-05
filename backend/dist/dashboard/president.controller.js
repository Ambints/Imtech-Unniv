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
exports.PresidentDashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const president_service_1 = require("./president.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let PresidentDashboardController = class PresidentDashboardController {
    constructor(svc) {
        this.svc = svc;
    }
    getKPI(anneeAcademiqueId) {
        return this.svc.getKPI(anneeAcademiqueId);
    }
    getStatsEtudiants(anneeAcademiqueId) {
        return this.svc.getStatsEtudiants(anneeAcademiqueId);
    }
    getStatsFinancieres(anneeAcademiqueId) {
        return this.svc.getStatsFinancieres(anneeAcademiqueId);
    }
    getStatsAcademiques(sessionId) {
        return this.svc.getStatsAcademiques(sessionId);
    }
    getActiviteRecente() {
        return this.svc.getActiviteRecente();
    }
    getAlertes() {
        return this.svc.getAlertes();
    }
    getRepartitionParcours(anneeAcademiqueId) {
        return this.svc.getRepartitionParParcours(anneeAcademiqueId);
    }
};
exports.PresidentDashboardController = PresidentDashboardController;
__decorate([
    (0, common_1.Get)('kpi'),
    (0, swagger_1.ApiOperation)({ summary: 'KPI globaux de l\'université' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Indicateurs clés de performance' }),
    __param(0, (0, common_1.Query)('anneeAcademiqueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PresidentDashboardController.prototype, "getKPI", null);
__decorate([
    (0, common_1.Get)('stats-etudiants'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques étudiants' }),
    __param(0, (0, common_1.Query)('anneeAcademiqueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PresidentDashboardController.prototype, "getStatsEtudiants", null);
__decorate([
    (0, common_1.Get)('stats-financieres'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques financières' }),
    __param(0, (0, common_1.Query)('anneeAcademiqueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PresidentDashboardController.prototype, "getStatsFinancieres", null);
__decorate([
    (0, common_1.Get)('stats-academiques'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques académiques (taux de réussite)' }),
    __param(0, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PresidentDashboardController.prototype, "getStatsAcademiques", null);
__decorate([
    (0, common_1.Get)('activite-recente'),
    (0, swagger_1.ApiOperation)({ summary: 'Activité récente de l\'université' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PresidentDashboardController.prototype, "getActiviteRecente", null);
__decorate([
    (0, common_1.Get)('alertes'),
    (0, swagger_1.ApiOperation)({ summary: 'Alertes nécessitant attention du Président' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PresidentDashboardController.prototype, "getAlertes", null);
__decorate([
    (0, common_1.Get)('repartition-par-parcours'),
    (0, swagger_1.ApiOperation)({ summary: 'Répartition des étudiants par parcours' }),
    __param(0, (0, common_1.Query)('anneeAcademiqueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PresidentDashboardController.prototype, "getRepartitionParcours", null);
exports.PresidentDashboardController = PresidentDashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard Président - KPI et Indicateurs'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('president', 'admin'),
    (0, common_1.Controller)('dashboard/president'),
    __metadata("design:paramtypes", [president_service_1.PresidentDashboardService])
], PresidentDashboardController);
//# sourceMappingURL=president.controller.js.map