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
exports.PortailProfesseurController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const professeur_service_1 = require("./professeur.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let PortailProfesseurController = class PortailProfesseurController {
    constructor(svc) {
        this.svc = svc;
    }
    getProfil(user) {
        return this.svc.getProfil(user.id);
    }
    getMesCours(user, anneeAcademiqueId) {
        return this.svc.getMesCours(user.id, anneeAcademiqueId);
    }
    getMesEtudiants(affectationId) {
        return this.svc.getEtudiantsParCours(affectationId);
    }
    uploadSupportCours(dto, fichier, user) {
        return this.svc.uploadSupportCours({ ...dto, fichierUrl: fichier?.path }, user.id);
    }
    getSupportsCours(user, ecId) {
        return this.svc.getSupportsCours(user.id, ecId);
    }
    partagerSupport(id, parcoursIds) {
        return this.svc.partagerSupport(id, parcoursIds);
    }
    getSeancesAujourdhui(user) {
        return this.svc.getSeancesAujourdhui(user.id);
    }
    getPresencesSeance(seanceId) {
        return this.svc.getPresencesSeance(seanceId);
    }
    pointerPresences(seanceId, presences, user) {
        return this.svc.pointerPresences(seanceId, presences, user.id);
    }
    pointerPresenceQR(seanceId, qrData, user) {
        return this.svc.pointerPresenceQR(seanceId, qrData, user.id);
    }
    getMonQR(user) {
        return this.svc.genererQRProfesseur(user.id);
    }
    getSessionsEvaluation(user) {
        return this.svc.getSessionsEvaluation(user.id);
    }
    getInterfaceSaisieNotes(sessionId, affectationId) {
        return this.svc.getInterfaceSaisieNotes(sessionId, affectationId);
    }
    saisirNotes(notes, sessionId, ecId, user) {
        return this.svc.saisirNotes(notes, sessionId, ecId, user.id);
    }
    modifierNote(noteId, dto, user) {
        return this.svc.modifierNote(noteId, dto, user.id);
    }
    getApercuNotes(sessionId, affectationId) {
        return this.svc.getApercuNotes(sessionId, affectationId);
    }
    deposerSujetExamen(dto, fichierSujet, user) {
        return this.svc.deposerSujetExamen({
            ...dto,
            fichierSujetUrl: fichierSujet?.path,
            deposePar: user.id,
        });
    }
    deposerCorrection(id, fichierCorrection, user) {
        return this.svc.deposerCorrection(id, fichierCorrection?.path, user.id);
    }
    getMesSujets(user) {
        return this.svc.getMesSujets(user.id);
    }
    envoyerMessageGroupe(dto, user) {
        return this.svc.envoyerMessageGroupe(dto, user.id);
    }
    envoyerMessageIndividuel(dto, user) {
        return this.svc.envoyerMessageIndividuel(dto, user.id);
    }
    getStagesSupervises(user) {
        return this.svc.getStagesSupervises(user.id);
    }
    remplirFicheSuivi(stageId, dto, user) {
        return this.svc.remplirFicheSuivi(stageId, dto, user.id);
    }
    evaluerSoutenance(soutenanceId, dto, user) {
        return this.svc.evaluerSoutenance(soutenanceId, dto, user.id);
    }
    demanderRessources(dto, user) {
        return this.svc.demanderRessources(dto, user.id);
    }
    getMesDemandesRessources(user) {
        return this.svc.getMesDemandesRessources(user.id);
    }
    getSallesDisponibles(date, heureDebut, heureFin, type) {
        return this.svc.getSallesDisponibles(date, heureDebut, heureFin, type);
    }
    getMesStats(user, anneeAcademiqueId) {
        return this.svc.getMesStats(user.id, anneeAcademiqueId);
    }
    getTauxReussiteEC(affectationId) {
        return this.svc.getTauxReussiteEC(affectationId);
    }
};
exports.PortailProfesseurController = PortailProfesseurController;
__decorate([
    (0, common_1.Get)('profil'),
    (0, swagger_1.ApiOperation)({ summary: 'Profil de l\'enseignant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getProfil", null);
__decorate([
    (0, common_1.Get)('mes-cours'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des cours assignés' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('anneeAcademiqueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getMesCours", null);
__decorate([
    (0, common_1.Get)('mes-etudiants/:affectationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des étudiants de mon cours' }),
    __param(0, (0, common_1.Param)('affectationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getMesEtudiants", null);
__decorate([
    (0, common_1.Post)('supports-cours'),
    (0, swagger_1.ApiOperation)({ summary: 'Déposer un support de cours' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('fichier')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "uploadSupportCours", null);
__decorate([
    (0, common_1.Get)('supports-cours'),
    (0, swagger_1.ApiOperation)({ summary: 'Mes supports de cours' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('ecId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getSupportsCours", null);
__decorate([
    (0, common_1.Post)('supports-cours/:id/partager'),
    (0, swagger_1.ApiOperation)({ summary: 'Partager avec une classe/parcours' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('parcoursIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "partagerSupport", null);
__decorate([
    (0, common_1.Get)('seances/aujourdhui'),
    (0, swagger_1.ApiOperation)({ summary: 'Mes séances du jour' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getSeancesAujourdhui", null);
__decorate([
    (0, common_1.Get)('seances/:seanceId/presences'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des présences pour une séance' }),
    __param(0, (0, common_1.Param)('seanceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getPresencesSeance", null);
__decorate([
    (0, common_1.Post)('seances/:seanceId/pointer'),
    (0, swagger_1.ApiOperation)({ summary: 'Pointer les présences' }),
    __param(0, (0, common_1.Param)('seanceId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "pointerPresences", null);
__decorate([
    (0, common_1.Post)('seances/:seanceId/pointer-qr'),
    (0, swagger_1.ApiOperation)({ summary: 'Pointer via QR Code' }),
    __param(0, (0, common_1.Param)('seanceId')),
    __param(1, (0, common_1.Body)('qrData')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "pointerPresenceQR", null);
__decorate([
    (0, common_1.Get)('mon-qr'),
    (0, swagger_1.ApiOperation)({ summary: 'Générer mon QR Code pour pointage' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getMonQR", null);
__decorate([
    (0, common_1.Get)('sessions-evaluation'),
    (0, swagger_1.ApiOperation)({ summary: 'Sessions d\'évaluation disponibles' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getSessionsEvaluation", null);
__decorate([
    (0, common_1.Get)('notes/saisie/:sessionId/:affectationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Interface de saisie des notes' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Param)('affectationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getInterfaceSaisieNotes", null);
__decorate([
    (0, common_1.Post)('notes'),
    (0, swagger_1.ApiOperation)({ summary: 'Saisir des notes' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Body)('sessionId')),
    __param(2, (0, common_1.Body)('ecId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, String, Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "saisirNotes", null);
__decorate([
    (0, common_1.Patch)('notes/:id/modifier'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une note (avant verrouillage)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "modifierNote", null);
__decorate([
    (0, common_1.Get)('notes/apercu/:sessionId/:affectationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Aperçu des notes avant validation' }),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Param)('affectationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getApercuNotes", null);
__decorate([
    (0, common_1.Post)('sujets-examens'),
    (0, swagger_1.ApiOperation)({ summary: 'Déposer un sujet d\'examen' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('fichierSujet')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "deposerSujetExamen", null);
__decorate([
    (0, common_1.Post)('sujets-examens/:id/correction'),
    (0, swagger_1.ApiOperation)({ summary: 'Déposer la correction' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('fichierCorrection')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "deposerCorrection", null);
__decorate([
    (0, common_1.Get)('mes-sujets'),
    (0, swagger_1.ApiOperation)({ summary: 'Mes sujets déposés' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getMesSujets", null);
__decorate([
    (0, common_1.Post)('messages/envoyer-groupe'),
    (0, swagger_1.ApiOperation)({ summary: 'Envoyer message à un groupe d\'étudiants' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "envoyerMessageGroupe", null);
__decorate([
    (0, common_1.Post)('messages/envoyer-individuel'),
    (0, swagger_1.ApiOperation)({ summary: 'Envoyer message à un étudiant' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "envoyerMessageIndividuel", null);
__decorate([
    (0, common_1.Get)('stages/supervises'),
    (0, swagger_1.ApiOperation)({ summary: 'Stages/mémoires que je supervise' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getStagesSupervises", null);
__decorate([
    (0, common_1.Post)('stages/:id/fiche-suivi'),
    (0, swagger_1.ApiOperation)({ summary: 'Remplir fiche de suivi de stage' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "remplirFicheSuivi", null);
__decorate([
    (0, common_1.Post)('soutenances/:id/evaluer'),
    (0, swagger_1.ApiOperation)({ summary: 'Évaluer une soutenance' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "evaluerSoutenance", null);
__decorate([
    (0, common_1.Post)('demandes-ressources'),
    (0, swagger_1.ApiOperation)({ summary: 'Demander des ressources (labo, salle, matériel)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "demanderRessources", null);
__decorate([
    (0, common_1.Get)('mes-demandes-ressources'),
    (0, swagger_1.ApiOperation)({ summary: 'Mes demandes de ressources' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getMesDemandesRessources", null);
__decorate([
    (0, common_1.Get)('salles-disponibles'),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier disponibilité des salles' }),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Query)('heureDebut')),
    __param(2, (0, common_1.Query)('heureFin')),
    __param(3, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getSallesDisponibles", null);
__decorate([
    (0, common_1.Get)('mes-stats'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques de mes cours' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('anneeAcademiqueId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getMesStats", null);
__decorate([
    (0, common_1.Get)('mes-stats/taux-reussite/:affectationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Taux de réussite par EC' }),
    __param(0, (0, common_1.Param)('affectationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortailProfesseurController.prototype, "getTauxReussiteEC", null);
exports.PortailProfesseurController = PortailProfesseurController = __decorate([
    (0, swagger_1.ApiTags)('Portail Professeur - Espace enseignant'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('professeur', 'responsable_pedagogique', 'admin'),
    (0, common_1.Controller)('portail/professeur'),
    __metadata("design:paramtypes", [professeur_service_1.PortailProfesseurService])
], PortailProfesseurController);
//# sourceMappingURL=professeur.controller.js.map