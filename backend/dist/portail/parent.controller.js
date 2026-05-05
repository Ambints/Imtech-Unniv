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
exports.PortailParentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const parent_service_1 = require("./parent.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let PortailParentController = class PortailParentController {
    constructor(svc) {
        this.svc = svc;
    }
    getEnfants(user) {
        return this.svc.getEnfants(user.id);
    }
    getBulletin(user, etudiantId, sessionId) {
        return this.svc.getBulletin(user.id, etudiantId, sessionId);
    }
    getAbsences(user, etudiantId) {
        return this.svc.getAbsences(user.id, etudiantId);
    }
    getPaiements(user, etudiantId) {
        return this.svc.getPaiements(user.id, etudiantId);
    }
    getSolde(user, etudiantId) {
        return this.svc.getSolde(user.id, etudiantId);
    }
    getEmploiDuTemps(user, etudiantId, dateDebut, dateFin) {
        return this.svc.getEmploiDuTemps(user.id, etudiantId, dateDebut, dateFin);
    }
    autoriserSortie(user, dto) {
        return this.svc.autoriserSortie(user.id, dto);
    }
    justifierAbsence(user, dto) {
        return this.svc.justifierAbsenceParent(user.id, dto);
    }
    getNotifications(user) {
        return this.svc.getNotifications(user.id);
    }
};
exports.PortailParentController = PortailParentController;
__decorate([
    (0, common_1.Get)('enfants'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des enfants liés au parent' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailParentController.prototype, "getEnfants", null);
__decorate([
    (0, common_1.Get)('enfants/:etudiantId/bulletin'),
    (0, swagger_1.ApiOperation)({ summary: 'Bulletin de notes de l\'enfant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('etudiantId')),
    __param(2, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], PortailParentController.prototype, "getBulletin", null);
__decorate([
    (0, common_1.Get)('enfants/:etudiantId/absences'),
    (0, swagger_1.ApiOperation)({ summary: 'Absences et retards de l\'enfant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PortailParentController.prototype, "getAbsences", null);
__decorate([
    (0, common_1.Get)('enfants/:etudiantId/paiements'),
    (0, swagger_1.ApiOperation)({ summary: 'Historique des paiements' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PortailParentController.prototype, "getPaiements", null);
__decorate([
    (0, common_1.Get)('enfants/:etudiantId/solde'),
    (0, swagger_1.ApiOperation)({ summary: 'Solde des frais de scolarité' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PortailParentController.prototype, "getSolde", null);
__decorate([
    (0, common_1.Get)('enfants/:etudiantId/emploi-du-temps'),
    (0, swagger_1.ApiOperation)({ summary: 'Emploi du temps de l\'enfant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('etudiantId')),
    __param(2, (0, common_1.Query)('dateDebut')),
    __param(3, (0, common_1.Query)('dateFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", void 0)
], PortailParentController.prototype, "getEmploiDuTemps", null);
__decorate([
    (0, common_1.Post)('autoriser-sortie'),
    (0, swagger_1.ApiOperation)({ summary: 'Autoriser une sortie anticipée' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PortailParentController.prototype, "autoriserSortie", null);
__decorate([
    (0, common_1.Post)('justifier-absence'),
    (0, swagger_1.ApiOperation)({ summary: 'Justifier une absence en ligne' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PortailParentController.prototype, "justifierAbsence", null);
__decorate([
    (0, common_1.Get)('notifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Notifications pour le parent' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailParentController.prototype, "getNotifications", null);
exports.PortailParentController = PortailParentController = __decorate([
    (0, swagger_1.ApiTags)('Portail Parent - Suivi enfant'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('parent'),
    (0, common_1.Controller)('portail/parent'),
    __metadata("design:paramtypes", [parent_service_1.PortailParentService])
], PortailParentController);
//# sourceMappingURL=parent.controller.js.map