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
exports.DisciplineController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const discipline_service_1 = require("./discipline.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let DisciplineController = class DisciplineController {
    constructor(svc) {
        this.svc = svc;
    }
    createIncident(dto) {
        return this.svc.createIncident(dto);
    }
    findAllIncidents(filters) {
        return this.svc.findAllIncidents(filters);
    }
    findIncidentById(id) {
        return this.svc.findIncidentById(id);
    }
    updateIncident(id, dto) {
        return this.svc.updateIncident(id, dto);
    }
    validerIncident(id, validePar) {
        return this.svc.validerIncident(id, validePar);
    }
    deleteIncident(id) {
        return this.svc.deleteIncident(id);
    }
    getIncidentsByStudent(etudiantId) {
        return this.svc.getIncidentsByStudent(etudiantId);
    }
    getIncidentsByPeriod(dateDebut, dateFin) {
        return this.svc.getIncidentsByPeriod(dateDebut, dateFin);
    }
    getIncidentsByType() {
        return this.svc.getIncidentsByType();
    }
    getStats() {
        return this.svc.getDisciplineStats();
    }
};
exports.DisciplineController = DisciplineController;
__decorate([
    (0, common_1.Post)('incidents'),
    (0, roles_decorator_1.Roles)('surveillant', 'admin', 'secretaire', 'surveillant_general'),
    (0, swagger_1.ApiOperation)({ summary: 'Déclarer un incident disciplinaire' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Incident créé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "createIncident", null);
__decorate([
    (0, common_1.Get)('incidents'),
    (0, roles_decorator_1.Roles)('surveillant', 'admin', 'secretaire', 'president', 'surveillant_general'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des incidents avec filtres' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "findAllIncidents", null);
__decorate([
    (0, common_1.Get)('incidents/:id'),
    (0, roles_decorator_1.Roles)('surveillant', 'admin', 'secretaire', 'president', 'surveillant_general'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'un incident' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "findIncidentById", null);
__decorate([
    (0, common_1.Patch)('incidents/:id'),
    (0, roles_decorator_1.Roles)('surveillant', 'admin', 'secretaire', 'surveillant_general'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un incident' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "updateIncident", null);
__decorate([
    (0, common_1.Patch)('incidents/:id/valider'),
    (0, roles_decorator_1.Roles)('admin', 'surveillant_general', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Valider un incident' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('validePar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "validerIncident", null);
__decorate([
    (0, common_1.Delete)('incidents/:id'),
    (0, roles_decorator_1.Roles)('surveillant', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un incident' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "deleteIncident", null);
__decorate([
    (0, common_1.Get)('etudiants/:etudiantId/incidents'),
    (0, roles_decorator_1.Roles)('surveillant', 'admin', 'secretaire', 'parent'),
    (0, swagger_1.ApiOperation)({ summary: 'Incidents d\'un étudiant' }),
    __param(0, (0, common_1.Param)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "getIncidentsByStudent", null);
__decorate([
    (0, common_1.Get)('rapports/periode'),
    (0, roles_decorator_1.Roles)('admin', 'surveillant_general', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Incidents par période' }),
    __param(0, (0, common_1.Query)('dateDebut')),
    __param(1, (0, common_1.Query)('dateFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "getIncidentsByPeriod", null);
__decorate([
    (0, common_1.Get)('rapports/types'),
    (0, roles_decorator_1.Roles)('admin', 'surveillant_general', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Incidents par type' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "getIncidentsByType", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('admin', 'surveillant_general', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques discipline' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "getStats", null);
exports.DisciplineController = DisciplineController = __decorate([
    (0, swagger_1.ApiTags)('Discipline - Gestion des incidents et sanctions'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('discipline'),
    __metadata("design:paramtypes", [discipline_service_1.DisciplineService])
], DisciplineController);
//# sourceMappingURL=discipline.controller.js.map