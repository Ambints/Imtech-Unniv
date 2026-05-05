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
exports.CommunicationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const communication_service_1 = require("./communication.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let CommunicationController = class CommunicationController {
    constructor(svc) {
        this.svc = svc;
    }
    createAnnonce(dto, user) {
        return this.svc.createAnnonce({ ...dto, auteurId: user.id });
    }
    findAnnonces(cible, type) {
        return this.svc.findAnnoncesPubliees(cible, type);
    }
    findAllAnnonces(filters) {
        return this.svc.findAllAnnonces(filters);
    }
    findAnnonceById(id) {
        return this.svc.findAnnonceById(id);
    }
    publierAnnonce(id) {
        return this.svc.publierAnnonce(id);
    }
    depublierAnnonce(id) {
        return this.svc.depublierAnnonce(id);
    }
    deleteAnnonce(id) {
        return this.svc.deleteAnnonce(id);
    }
    dupliquerAnnonce(id, user) {
        return this.svc.dupliquerAnnonce(id, user.id);
    }
    createEvenement(dto, user) {
        return this.svc.createEvenement({ ...dto, auteurId: user.id });
    }
    findEvenements(dateDebut, dateFin, type) {
        return this.svc.findEvenements(dateDebut, dateFin, type);
    }
    findEvenementsAvenir(limit = 10) {
        return this.svc.findEvenementsAvenir(limit);
    }
    updateEvenement(id, dto) {
        return this.svc.updateEvenement(id, dto);
    }
    createCampagne(dto, user) {
        return this.svc.createCampagne({ ...dto, auteurId: user.id });
    }
    findCampagnes(statut) {
        return this.svc.findCampagnes(statut);
    }
    activerCampagne(id) {
        return this.svc.activerCampagne(id);
    }
    envoyerCampagne(id) {
        return this.svc.envoyerCampagne(id);
    }
    envoyerNotificationCiblee(dto) {
        return this.svc.envoyerNotificationCiblee(dto);
    }
    getStatsNotifications(dateDebut, dateFin) {
        return this.svc.getStatsNotifications(dateDebut, dateFin);
    }
    createAlerte(dto, user) {
        return this.svc.createAlerte({ ...dto, auteurId: user.id });
    }
    findAlertesActives() {
        return this.svc.findAlertesActives();
    }
    desactiverAlerte(id) {
        return this.svc.desactiverAlerte(id);
    }
    publierResultats(dto) {
        return this.svc.publierResultats(dto);
    }
    verifierResultats(sessionId) {
        return this.svc.verifierResultats(sessionId);
    }
    publierSurReseaux(dto) {
        return this.svc.publierSurReseaux(dto);
    }
    getStatsReseaux() {
        return this.svc.getStatsReseaux();
    }
    envoyerMessage(dto, user) {
        return this.svc.envoyerMessage({ ...dto, expediteurId: user.id });
    }
    getMessagesRecus(user, nonLus) {
        return this.svc.getMessagesRecus(user.id, nonLus);
    }
    getMessagesEnvoyes(user) {
        return this.svc.getMessagesEnvoyes(user.id);
    }
    marquerLu(id) {
        return this.svc.marquerMessageLu(id);
    }
    createSujetForum(dto, user) {
        return this.svc.createSujetForum({ ...dto, auteurId: user.id });
    }
    findSujetsForum(categorie) {
        return this.svc.findSujetsForum(categorie);
    }
    repondreForum(sujetId, dto, user) {
        return this.svc.repondreForum(sujetId, { ...dto, auteurId: user.id });
    }
    modererSujet(id, dto) {
        return this.svc.modererSujet(id, dto);
    }
    genererDossierPresse(dto) {
        return this.svc.genererDossierPresse(dto);
    }
    getStatsPromotion() {
        return this.svc.getStatsPromotion();
    }
    getDashboard() {
        return this.svc.getDashboard();
    }
};
exports.CommunicationController = CommunicationController;
__decorate([
    (0, common_1.Post)('annonces'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'secretaire', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une annonce/actualité' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Annonce créée' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "createAnnonce", null);
__decorate([
    (0, common_1.Get)('annonces'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des annonces publiques' }),
    __param(0, (0, common_1.Query)('cible')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "findAnnonces", null);
__decorate([
    (0, common_1.Get)('annonces/admin'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Toutes les annonces (admin)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "findAllAnnonces", null);
__decorate([
    (0, common_1.Get)('annonces/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Détail d\'une annonce' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "findAnnonceById", null);
__decorate([
    (0, common_1.Patch)('annonces/:id/publier'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Publier une annonce' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "publierAnnonce", null);
__decorate([
    (0, common_1.Patch)('annonces/:id/depublier'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Dépublier une annonce' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "depublierAnnonce", null);
__decorate([
    (0, common_1.Delete)('annonces/:id'),
    (0, roles_decorator_1.Roles)('communication', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une annonce' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "deleteAnnonce", null);
__decorate([
    (0, common_1.Post)('annonces/:id/dupliquer'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Dupliquer une annonce' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "dupliquerAnnonce", null);
__decorate([
    (0, common_1.Post)('evenements'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'secretaire', 'pastoral'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un événement (conférence, messe, cérémonie)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "createEvenement", null);
__decorate([
    (0, common_1.Get)('evenements'),
    (0, swagger_1.ApiOperation)({ summary: 'Calendrier événementiel' }),
    __param(0, (0, common_1.Query)('dateDebut')),
    __param(1, (0, common_1.Query)('dateFin')),
    __param(2, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "findEvenements", null);
__decorate([
    (0, common_1.Get)('evenements/avenir'),
    (0, swagger_1.ApiOperation)({ summary: 'Événements à venir' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "findEvenementsAvenir", null);
__decorate([
    (0, common_1.Patch)('evenements/:id'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un événement' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "updateEvenement", null);
__decorate([
    (0, common_1.Post)('campagnes'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'secretaire', 'scolarite'),
    (0, swagger_1.ApiOperation)({ summary: 'Lancer une campagne d\'inscription' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "createCampagne", null);
__decorate([
    (0, common_1.Get)('campagnes'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'secretaire', 'scolarite'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des campagnes' }),
    __param(0, (0, common_1.Query)('statut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "findCampagnes", null);
__decorate([
    (0, common_1.Patch)('campagnes/:id/activer'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'scolarite'),
    (0, swagger_1.ApiOperation)({ summary: 'Activer une campagne' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "activerCampagne", null);
__decorate([
    (0, common_1.Post)('campagnes/:id/envoyer'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'scolarite'),
    (0, swagger_1.ApiOperation)({ summary: 'Envoyer la campagne ciblée' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "envoyerCampagne", null);
__decorate([
    (0, common_1.Post)('notifications/envoyer'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'secretaire', 'surveillant_general'),
    (0, swagger_1.ApiOperation)({ summary: 'Envoi ciblé d\'informations (par filière, année, niveau)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "envoyerNotificationCiblee", null);
__decorate([
    (0, common_1.Get)('notifications/stats'),
    (0, roles_decorator_1.Roles)('communication', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Stats des notifications envoyées' }),
    __param(0, (0, common_1.Query)('dateDebut')),
    __param(1, (0, common_1.Query)('dateFin')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "getStatsNotifications", null);
__decorate([
    (0, common_1.Post)('alertes'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'president', 'surveillant_general', 'pastoral'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une alerte institutionnelle (fermeture, grève, pastoral)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "createAlerte", null);
__decorate([
    (0, common_1.Get)('alertes/actives'),
    (0, swagger_1.ApiOperation)({ summary: 'Alertes actuellement actives' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "findAlertesActives", null);
__decorate([
    (0, common_1.Patch)('alertes/:id/desactiver'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Désactiver une alerte' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "desactiverAlerte", null);
__decorate([
    (0, common_1.Post)('resultats/publier'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'secretaire', 'scolarite'),
    (0, swagger_1.ApiOperation)({ summary: 'Publier les résultats d\'examens (avec masquage partiel)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "publierResultats", null);
__decorate([
    (0, common_1.Get)('resultats/verification'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'scolarite'),
    (0, swagger_1.ApiOperation)({ summary: 'Vérifier les résultats avant publication' }),
    __param(0, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "verifierResultats", null);
__decorate([
    (0, common_1.Post)('social/publier'),
    (0, roles_decorator_1.Roles)('communication', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Publier sur réseaux sociaux' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "publierSurReseaux", null);
__decorate([
    (0, common_1.Get)('social/stats'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques des réseaux sociaux' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "getStatsReseaux", null);
__decorate([
    (0, common_1.Post)('messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Envoyer un message interne' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "envoyerMessage", null);
__decorate([
    (0, common_1.Get)('messages/recus'),
    (0, swagger_1.ApiOperation)({ summary: 'Messages reçus' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('nonLus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Boolean]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "getMessagesRecus", null);
__decorate([
    (0, common_1.Get)('messages/envoyes'),
    (0, swagger_1.ApiOperation)({ summary: 'Messages envoyés' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "getMessagesEnvoyes", null);
__decorate([
    (0, common_1.Patch)('messages/:id/lu'),
    (0, swagger_1.ApiOperation)({ summary: 'Marquer comme lu' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "marquerLu", null);
__decorate([
    (0, common_1.Post)('forums/sujets'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'professeur', 'etudiant'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un sujet de forum' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "createSujetForum", null);
__decorate([
    (0, common_1.Get)('forums/sujets'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des sujets de forum' }),
    __param(0, (0, common_1.Query)('categorie')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "findSujetsForum", null);
__decorate([
    (0, common_1.Post)('forums/sujets/:id/repondre'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'professeur', 'etudiant', 'parent'),
    (0, swagger_1.ApiOperation)({ summary: 'Répondre à un sujet' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "repondreForum", null);
__decorate([
    (0, common_1.Post)('forums/sujets/:id/moderer'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'moderateur'),
    (0, swagger_1.ApiOperation)({ summary: 'Modérer un sujet (masquer/supprimer)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "modererSujet", null);
__decorate([
    (0, common_1.Post)('promotions/dossiers-presse'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Générer dossier de presse' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "genererDossierPresse", null);
__decorate([
    (0, common_1.Get)('promotions/statistiques'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Stats pour dossiers de presse' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "getStatsPromotion", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)('communication', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Dashboard activité communication' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CommunicationController.prototype, "getDashboard", null);
exports.CommunicationController = CommunicationController = __decorate([
    (0, swagger_1.ApiTags)('Communication - Actualités, événements, campagnes'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('communication'),
    __metadata("design:paramtypes", [communication_service_1.CommunicationService])
], CommunicationController);
//# sourceMappingURL=communication.controller.js.map