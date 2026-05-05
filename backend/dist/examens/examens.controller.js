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
exports.ExamensController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const examens_service_1 = require("./examens.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let ExamensController = class ExamensController {
    constructor(svc) {
        this.svc = svc;
    }
    createSujet(dto) {
        return this.svc.createSujet(dto);
    }
    findSujets(filters) {
        return this.svc.findSujets(filters);
    }
    validerSujet(id, validePar) {
        return this.svc.validerSujet(id, validePar);
    }
    refuserSujet(id, motif) {
        return this.svc.refuserSujet(id, motif);
    }
    createDeliberation(dto) {
        return this.svc.createDeliberation(dto);
    }
    findDeliberations(sessionId) {
        return this.svc.findDeliberations(sessionId);
    }
    verrouillerDeliberation(id, verrouillePar) {
        return this.svc.verrouillerDeliberation(id, verrouillePar);
    }
    publierDeliberation(id) {
        return this.svc.publierDeliberation(id);
    }
    ajouterJury(deliberationId, dto) {
        return this.svc.ajouterMembreJury({ ...dto, deliberationId });
    }
    getJury(deliberationId) {
        return this.svc.getJuryByDeliberation(deliberationId);
    }
    createPV(dto) {
        return this.svc.createPVNote(dto);
    }
    getPV(deliberationId) {
        return this.svc.getPVByDeliberation(deliberationId);
    }
    getStatsDeliberation(deliberationId) {
        return this.svc.calculerStatsDeliberation(deliberationId);
    }
};
exports.ExamensController = ExamensController;
__decorate([
    (0, common_1.Post)('sujets'),
    (0, roles_decorator_1.Roles)('professeur', 'responsable_pedagogique'),
    (0, swagger_1.ApiOperation)({ summary: 'Déposer un sujet d\'examen' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExamensController.prototype, "createSujet", null);
__decorate([
    (0, common_1.Get)('sujets'),
    (0, roles_decorator_1.Roles)('professeur', 'responsable_pedagogique', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des sujets' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExamensController.prototype, "findSujets", null);
__decorate([
    (0, common_1.Patch)('sujets/:id/valider'),
    (0, roles_decorator_1.Roles)('responsable_pedagogique', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Valider un sujet d\'examen' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('validePar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ExamensController.prototype, "validerSujet", null);
__decorate([
    (0, common_1.Patch)('sujets/:id/refuser'),
    (0, roles_decorator_1.Roles)('responsable_pedagogique', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Refuser un sujet' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('motif')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ExamensController.prototype, "refuserSujet", null);
__decorate([
    (0, common_1.Post)('deliberations'),
    (0, roles_decorator_1.Roles)('admin', 'secretaire', 'responsable_pedagogique'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une délibération' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExamensController.prototype, "createDeliberation", null);
__decorate([
    (0, common_1.Get)('sessions/:sessionId/deliberations'),
    (0, roles_decorator_1.Roles)('admin', 'secretaire', 'responsable_pedagogique', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Délibérations d\'une session' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExamensController.prototype, "findDeliberations", null);
__decorate([
    (0, common_1.Patch)('deliberations/:id/verrouiller'),
    (0, roles_decorator_1.Roles)('responsable_pedagogique', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Verrouiller une délibération' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('verrouillePar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ExamensController.prototype, "verrouillerDeliberation", null);
__decorate([
    (0, common_1.Patch)('deliberations/:id/publier'),
    (0, roles_decorator_1.Roles)('admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Publier les résultats' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExamensController.prototype, "publierDeliberation", null);
__decorate([
    (0, common_1.Post)('deliberations/:id/jury'),
    (0, roles_decorator_1.Roles)('admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter un membre au jury' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ExamensController.prototype, "ajouterJury", null);
__decorate([
    (0, common_1.Get)('deliberations/:id/jury'),
    (0, roles_decorator_1.Roles)('admin', 'secretaire', 'responsable_pedagogique'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des membres du jury' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExamensController.prototype, "getJury", null);
__decorate([
    (0, common_1.Post)('pv-notes'),
    (0, roles_decorator_1.Roles)('admin', 'secretaire', 'responsable_pedagogique'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une entrée PV' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ExamensController.prototype, "createPV", null);
__decorate([
    (0, common_1.Get)('deliberations/:id/pv'),
    (0, roles_decorator_1.Roles)('admin', 'secretaire', 'responsable_pedagogique', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'PV de délibération' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExamensController.prototype, "getPV", null);
__decorate([
    (0, common_1.Get)('deliberations/:id/stats'),
    (0, roles_decorator_1.Roles)('admin', 'secretaire', 'responsable_pedagogique', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques de la délibération' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExamensController.prototype, "getStatsDeliberation", null);
exports.ExamensController = ExamensController = __decorate([
    (0, swagger_1.ApiTags)('Examens - Sujets et Délibérations'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('examens'),
    __metadata("design:paramtypes", [examens_service_1.ExamensService])
], ExamensController);
//# sourceMappingURL=examens.controller.js.map