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
exports.PortailEtudiantController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const etudiant_service_1 = require("./etudiant.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let PortailEtudiantController = class PortailEtudiantController {
    constructor(svc) {
        this.svc = svc;
    }
    getProfil(user) {
        return this.svc.getProfil(user.id);
    }
    getEmploiDuTemps(user, dateDebut, dateFin) {
        return this.svc.getEmploiDuTemps(user.id, dateDebut, dateFin);
    }
    getNotes(user, sessionId) {
        return this.svc.getNotes(user.id, sessionId);
    }
    getMoyennes(user) {
        return this.svc.getMoyennes(user.id);
    }
    getPaiements(user) {
        return this.svc.getPaiements(user.id);
    }
    getSolde(user) {
        return this.svc.getSolde(user.id);
    }
    getAbsences(user) {
        return this.svc.getAbsences(user.id);
    }
    justifierAbsence(user, dto) {
        return this.svc.justifierAbsence(user.id, dto);
    }
    getDocuments(user) {
        return this.svc.getDocuments(user.id);
    }
    getCoursEnLigne(user) {
        return this.svc.getCoursEnLigne(user.id);
    }
    getInscriptionExamens(user) {
        return this.svc.getInscriptionsExamens(user.id);
    }
    inscrireExamen(user, dto) {
        return this.svc.inscrireExamen(user.id, dto.sessionId);
    }
};
exports.PortailEtudiantController = PortailEtudiantController;
__decorate([
    (0, common_1.Get)('profil'),
    (0, swagger_1.ApiOperation)({ summary: 'Profil de l\'étudiant connecté' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getProfil", null);
__decorate([
    (0, common_1.Get)('emploi-du-temps'),
    (0, swagger_1.ApiOperation)({ summary: 'Emploi du temps de l\'étudiant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('dateDebut')),
    __param(2, (0, common_1.Query)('dateFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getEmploiDuTemps", null);
__decorate([
    (0, common_1.Get)('notes'),
    (0, swagger_1.ApiOperation)({ summary: 'Notes de l\'étudiant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getNotes", null);
__decorate([
    (0, common_1.Get)('moyennes'),
    (0, swagger_1.ApiOperation)({ summary: 'Moyennes par semestre/UE' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getMoyennes", null);
__decorate([
    (0, common_1.Get)('paiements'),
    (0, swagger_1.ApiOperation)({ summary: 'Historique des paiements' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getPaiements", null);
__decorate([
    (0, common_1.Get)('solde'),
    (0, swagger_1.ApiOperation)({ summary: 'Solde des frais de scolarité' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getSolde", null);
__decorate([
    (0, common_1.Get)('absences'),
    (0, swagger_1.ApiOperation)({ summary: 'Historique des absences' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getAbsences", null);
__decorate([
    (0, common_1.Post)('justifier-absence'),
    (0, swagger_1.ApiOperation)({ summary: 'Déposer un justificatif d\'absence' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "justifierAbsence", null);
__decorate([
    (0, common_1.Get)('documents'),
    (0, swagger_1.ApiOperation)({ summary: 'Documents disponibles' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Get)('cours-en-ligne'),
    (0, swagger_1.ApiOperation)({ summary: 'Supports de cours' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getCoursEnLigne", null);
__decorate([
    (0, common_1.Get)('inscription-examens'),
    (0, swagger_1.ApiOperation)({ summary: 'Inscriptions aux examens' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getInscriptionExamens", null);
__decorate([
    (0, common_1.Post)('inscription-examens'),
    (0, swagger_1.ApiOperation)({ summary: 'S\'inscrire à une session d\'examen' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "inscrireExamen", null);
exports.PortailEtudiantController = PortailEtudiantController = __decorate([
    (0, swagger_1.ApiTags)('Portail Étudiant - Espace personnel'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('etudiant'),
    (0, common_1.Controller)('portail/etudiant'),
    __metadata("design:paramtypes", [etudiant_service_1.PortailEtudiantService])
], PortailEtudiantController);
//# sourceMappingURL=etudiant.controller.js.map