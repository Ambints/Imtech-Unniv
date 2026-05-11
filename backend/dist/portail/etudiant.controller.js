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
    async searchEtudiants(tid, query) {
        return this.svc.searchEtudiants(query);
    }
    getProfil(tid, user) {
        return this.svc.getProfil(user.id);
    }
    getEmploiDuTemps(tid, user, dateDebut, dateFin) {
        return this.svc.getEmploiDuTemps(user.id, dateDebut, dateFin);
    }
    getNotes(tid, user, sessionId) {
        return this.svc.getNotes(user.id, sessionId);
    }
    getMoyennes(tid, user) {
        return this.svc.getMoyennes(user.id);
    }
    getPaiements(tid, user) {
        return this.svc.getPaiements(user.id);
    }
    getSolde(tid, user) {
        return this.svc.getSolde(user.id);
    }
    getAbsences(tid, user) {
        return this.svc.getAbsences(user.id);
    }
    justifierAbsence(tid, user, dto) {
        return this.svc.justifierAbsence(user.id, dto);
    }
    getDocuments(tid, user) {
        return this.svc.getDocuments(user.id);
    }
    getCoursEnLigne(tid, user) {
        return this.svc.getCoursEnLigne(user.id);
    }
    getInscriptionExamens(tid, user) {
        return this.svc.getInscriptionsExamens(user.id);
    }
    inscrireExamen(tid, user, dto) {
        return this.svc.inscrireExamen(user.id, dto.sessionId);
    }
};
exports.PortailEtudiantController = PortailEtudiantController;
__decorate([
    (0, common_1.Get)('etudiants/search'),
    (0, roles_decorator_1.Roles)('surveillant', 'surveillant_general', 'admin', 'secretaire', 'responsable_pedagogique'),
    (0, swagger_1.ApiOperation)({ summary: 'Rechercher des étudiants par nom, prénom ou matricule' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PortailEtudiantController.prototype, "searchEtudiants", null);
__decorate([
    (0, roles_decorator_1.Roles)('etudiant'),
    (0, common_1.Get)('etudiant/profil'),
    (0, swagger_1.ApiOperation)({ summary: 'Profil de l\'étudiant connecté' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getProfil", null);
__decorate([
    (0, common_1.Get)('etudiant/emploi-du-temps'),
    (0, swagger_1.ApiOperation)({ summary: 'Emploi du temps de l\'étudiant' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('dateDebut')),
    __param(3, (0, common_1.Query)('dateFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getEmploiDuTemps", null);
__decorate([
    (0, common_1.Get)('etudiant/notes'),
    (0, swagger_1.ApiOperation)({ summary: 'Notes de l\'étudiant' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getNotes", null);
__decorate([
    (0, common_1.Get)('etudiant/moyennes'),
    (0, swagger_1.ApiOperation)({ summary: 'Moyennes par semestre/UE' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getMoyennes", null);
__decorate([
    (0, common_1.Get)('etudiant/paiements'),
    (0, swagger_1.ApiOperation)({ summary: 'Historique des paiements' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getPaiements", null);
__decorate([
    (0, common_1.Get)('etudiant/solde'),
    (0, swagger_1.ApiOperation)({ summary: 'Solde des frais de scolarité' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getSolde", null);
__decorate([
    (0, common_1.Get)('etudiant/absences'),
    (0, swagger_1.ApiOperation)({ summary: 'Historique des absences' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getAbsences", null);
__decorate([
    (0, common_1.Post)('etudiant/justifier-absence'),
    (0, swagger_1.ApiOperation)({ summary: 'Déposer un justificatif d\'absence' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "justifierAbsence", null);
__decorate([
    (0, common_1.Get)('etudiant/documents'),
    (0, swagger_1.ApiOperation)({ summary: 'Documents disponibles' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Get)('etudiant/cours-en-ligne'),
    (0, swagger_1.ApiOperation)({ summary: 'Supports de cours' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getCoursEnLigne", null);
__decorate([
    (0, common_1.Get)('etudiant/inscription-examens'),
    (0, swagger_1.ApiOperation)({ summary: 'Inscriptions aux examens' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "getInscriptionExamens", null);
__decorate([
    (0, common_1.Post)('etudiant/inscription-examens'),
    (0, swagger_1.ApiOperation)({ summary: 'S\'inscrire à une session d\'examen' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PortailEtudiantController.prototype, "inscrireExamen", null);
exports.PortailEtudiantController = PortailEtudiantController = __decorate([
    (0, swagger_1.ApiTags)('Portail Étudiant - Espace personnel'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('portail/:tid'),
    __metadata("design:paramtypes", [etudiant_service_1.PortailEtudiantService])
], PortailEtudiantController);
//# sourceMappingURL=etudiant.controller.js.map