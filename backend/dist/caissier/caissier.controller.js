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
exports.CaissierController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const caissier_service_1 = require("./caissier.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const current_user_decorator_1 = require("../auth/current-user.decorator");
let CaissierController = class CaissierController {
    constructor(svc) {
        this.svc = svc;
    }
    createPaiement(dto, user) {
        return this.svc.createPaiement({ ...dto, caissierId: user.id });
    }
    findPaiements(date, mode) {
        return this.svc.findPaiements(date, mode);
    }
    findPaiementsByEtudiant(etudiantId) {
        return this.svc.findPaiementsByEtudiant(etudiantId);
    }
    annulerPaiement(id, motif, user) {
        return this.svc.annulerPaiement(id, motif, user.id);
    }
    genererRecu(id) {
        return this.svc.genererRecu(id);
    }
    createEcheancier(dto) {
        return this.svc.createEcheancier(dto);
    }
    findEcheances(dateDebut, dateFin, statut) {
        return this.svc.findEcheances(dateDebut, dateFin, statut);
    }
    findEcheancesByEtudiant(etudiantId) {
        return this.svc.findEcheancesByEtudiant(etudiantId);
    }
    modifierEcheance(id, dto) {
        return this.svc.modifierEcheance(id, dto);
    }
    findImpayes(jours = 30) {
        return this.svc.findImpayes(jours);
    }
    createRelance(dto) {
        return this.svc.createRelance(dto);
    }
    envoyerRelance(id) {
        return this.svc.envoyerRelance(id);
    }
    bloquerNotes(inscriptionId) {
        return this.svc.bloquerNotes(inscriptionId);
    }
    debloquerNotes(inscriptionId) {
        return this.svc.debloquerNotes(inscriptionId);
    }
    getClotureJournaliere(date) {
        return this.svc.getClotureJournaliere(date);
    }
    validerCloture(date, user) {
        return this.svc.validerCloture(date, user.id);
    }
    getRapprochementBancaire(date) {
        return this.svc.getRapprochementBancaire(date);
    }
    getStatsJournalieres(date) {
        return this.svc.getStatsJournalieres(date);
    }
    getStatsMensuelles(mois, annee) {
        return this.svc.getStatsMensuelles(mois, annee);
    }
};
exports.CaissierController = CaissierController;
__decorate([
    (0, common_1.Post)('paiements'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer un paiement (espèces, chèque, virement, CB)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Paiement enregistré avec reçu' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "createPaiement", null);
__decorate([
    (0, common_1.Get)('paiements'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des paiements du jour' }),
    __param(0, (0, common_1.Query)('date')),
    __param(1, (0, common_1.Query)('mode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "findPaiements", null);
__decorate([
    (0, common_1.Get)('paiements/etudiant/:etudiantId'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin', 'secretaire', 'etudiant', 'parent'),
    (0, swagger_1.ApiOperation)({ summary: 'Historique des paiements d\'un étudiant' }),
    __param(0, (0, common_1.Param)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "findPaiementsByEtudiant", null);
__decorate([
    (0, common_1.Post)('paiements/:id/annuler'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Annuler un paiement (erreur de saisie)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('motif')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "annulerPaiement", null);
__decorate([
    (0, common_1.Get)('paiements/:id/recu'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin', 'secretaire', 'etudiant', 'parent'),
    (0, swagger_1.ApiOperation)({ summary: 'Générer le reçu fiscal PDF' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "genererRecu", null);
__decorate([
    (0, common_1.Post)('echeanciers'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un échéancier de paiement échelonné' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "createEcheancier", null);
__decorate([
    (0, common_1.Get)('echeanciers'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des échéances' }),
    __param(0, (0, common_1.Query)('dateDebut')),
    __param(1, (0, common_1.Query)('dateFin')),
    __param(2, (0, common_1.Query)('statut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "findEcheances", null);
__decorate([
    (0, common_1.Get)('echeanciers/etudiant/:etudiantId'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin', 'secretaire', 'etudiant', 'parent'),
    (0, swagger_1.ApiOperation)({ summary: 'Échéancier d\'un étudiant' }),
    __param(0, (0, common_1.Param)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "findEcheancesByEtudiant", null);
__decorate([
    (0, common_1.Patch)('echeanciers/:id/modifier'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une échéance (report)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "modifierEcheance", null);
__decorate([
    (0, common_1.Get)('impayes'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des impayés avec relance' }),
    __param(0, (0, common_1.Query)('jours')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "findImpayes", null);
__decorate([
    (0, common_1.Post)('relances'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Générer une relance pour impayé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "createRelance", null);
__decorate([
    (0, common_1.Post)('relances/:id/envoyer'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Envoyer la relance (email/SMS)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "envoyerRelance", null);
__decorate([
    (0, common_1.Post)('impayes/:inscriptionId/bloquer-notes'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Bloquer la consultation des notes pour impayé' }),
    __param(0, (0, common_1.Param)('inscriptionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "bloquerNotes", null);
__decorate([
    (0, common_1.Post)('impayes/:inscriptionId/debloquer-notes'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Débloquer les notes après paiement' }),
    __param(0, (0, common_1.Param)('inscriptionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "debloquerNotes", null);
__decorate([
    (0, common_1.Get)('cloture/journaliere'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Clôture de caisse du jour' }),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "getClotureJournaliere", null);
__decorate([
    (0, common_1.Post)('cloture/journaliere'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Valider la clôture de caisse' }),
    __param(0, (0, common_1.Body)('date')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "validerCloture", null);
__decorate([
    (0, common_1.Get)('rapprochement-bancaire'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Rapprochement bancaire quotidien' }),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "getRapprochementBancaire", null);
__decorate([
    (0, common_1.Get)('stats/journalieres'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques journalières' }),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "getStatsJournalieres", null);
__decorate([
    (0, common_1.Get)('stats/mensuelles'),
    (0, roles_decorator_1.Roles)('caissier', 'economat', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques mensuelles' }),
    __param(0, (0, common_1.Query)('mois')),
    __param(1, (0, common_1.Query)('annee')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], CaissierController.prototype, "getStatsMensuelles", null);
exports.CaissierController = CaissierController = __decorate([
    (0, swagger_1.ApiTags)('Caissier - Encaissements et échéanciers'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('caissier'),
    __metadata("design:paramtypes", [caissier_service_1.CaissierService])
], CaissierController);
//# sourceMappingURL=caissier.controller.js.map