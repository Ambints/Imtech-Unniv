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
    validerIncident(id, validePar) {
        return this.svc.validerIncident(id, validePar);
    }
    createSanction(dto) {
        return this.svc.createSanction(dto);
    }
    findAllSanctions(filters) {
        return this.svc.findAllSanctions(filters);
    }
    findActiveSanctions(etudiantId) {
        return this.svc.findActiveSanctionsByStudent(etudiantId);
    }
    createAvertissement(dto) {
        return this.svc.createAvertissement(dto);
    }
    findAvertissements(etudiantId) {
        return this.svc.findAvertissementsByStudent(etudiantId);
    }
    getStats() {
        return this.svc.getDisciplineStats();
    }
};
exports.DisciplineController = DisciplineController;
__decorate([
    (0, common_1.Post)('incidents'),
    (0, roles_decorator_1.Roles)('surveillant', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Déclarer un incident disciplinaire' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Incident créé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "createIncident", null);
__decorate([
    (0, common_1.Get)('incidents'),
    (0, roles_decorator_1.Roles)('surveillant', 'admin', 'secretaire', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des incidents avec filtres' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "findAllIncidents", null);
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
    (0, common_1.Post)('sanctions'),
    (0, roles_decorator_1.Roles)('admin', 'surveillant_general', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une sanction' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "createSanction", null);
__decorate([
    (0, common_1.Get)('sanctions'),
    (0, roles_decorator_1.Roles)('admin', 'surveillant_general', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des sanctions' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "findAllSanctions", null);
__decorate([
    (0, common_1.Get)('etudiants/:etudiantId/sanctions'),
    (0, roles_decorator_1.Roles)('surveillant', 'admin', 'secretaire', 'parent'),
    (0, swagger_1.ApiOperation)({ summary: 'Sanctions actives d\'un étudiant' }),
    __param(0, (0, common_1.Param)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "findActiveSanctions", null);
__decorate([
    (0, common_1.Post)('avertissements'),
    (0, roles_decorator_1.Roles)('surveillant', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Émettre un avertissement' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "createAvertissement", null);
__decorate([
    (0, common_1.Get)('etudiants/:etudiantId/avertissements'),
    (0, roles_decorator_1.Roles)('surveillant', 'admin', 'secretaire', 'parent', 'etudiant'),
    (0, swagger_1.ApiOperation)({ summary: 'Avertissements d\'un étudiant' }),
    __param(0, (0, common_1.Param)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DisciplineController.prototype, "findAvertissements", null);
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