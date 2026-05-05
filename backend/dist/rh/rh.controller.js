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
exports.RHController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rh_service_1 = require("./rh.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let RHController = class RHController {
    constructor(svc) {
        this.svc = svc;
    }
    createContrat(dto) {
        return this.svc.createContrat(dto);
    }
    findContrats(filters) {
        return this.svc.findContrats(filters);
    }
    renouvelerContrat(id, dto) {
        return this.svc.renouvelerContrat(id, dto);
    }
    resilierContrat(id, motif) {
        return this.svc.resilierContrat(id, motif);
    }
    createHeuresComp(dto) {
        return this.svc.createHeuresComplementaires(dto);
    }
    findHeuresComp(filters) {
        return this.svc.findHeuresComplementaires(filters);
    }
    validerHeuresComp(id, validePar) {
        return this.svc.validerHeuresComplementaires(id, validePar);
    }
    getVolumeHoraire(enseignantId, annee) {
        return this.svc.getVolumeHoraireEnseignant(enseignantId, annee);
    }
    demanderConge(dto) {
        return this.svc.demanderConge(dto);
    }
    findConges(filters) {
        return this.svc.findConges(filters);
    }
    approuverConge(id, dto) {
        return this.svc.approuverConge(id, dto);
    }
    refuserConge(id, dto) {
        return this.svc.refuserConge(id, dto);
    }
    getSoldeConges(utilisateurId) {
        return this.svc.getSoldeConges(utilisateurId);
    }
    createFichePaie(dto) {
        return this.svc.genererFichePaie(dto);
    }
    findFichesPaie(filters) {
        return this.svc.findFichesPaie(filters);
    }
    validerFichePaie(id) {
        return this.svc.validerFichePaie(id);
    }
    genererFichesPaieMasse(annee, mois) {
        return this.svc.genererFichesPaieMasse(annee, mois);
    }
    createEvaluation(dto) {
        return this.svc.createEvaluation(dto);
    }
    findEvaluations(filters) {
        return this.svc.findEvaluations(filters);
    }
    submitAutoEvaluation(id, dto) {
        return this.svc.submitAutoEvaluation(id, dto);
    }
    finaliserEvaluation(id, dto) {
        return this.svc.finaliserEvaluation(id, dto);
    }
    createDeclarationSociale(dto) {
        return this.svc.createDeclarationSociale(dto);
    }
    findDeclarationsSociales(filters) {
        return this.svc.findDeclarationsSociales(filters);
    }
    exportDeclaration(id) {
        return this.svc.exportDeclarationSociale(id);
    }
    createRecrutement(dto) {
        return this.svc.createRecrutement(dto);
    }
    findRecrutements(filters) {
        return this.svc.findRecrutements(filters);
    }
    getStatsRH() {
        return this.svc.getStatsRH();
    }
    getStatsHeuresComp(annee, mois) {
        return this.svc.getStatsHeuresComplementaires(annee, mois);
    }
};
exports.RHController = RHController;
__decorate([
    (0, common_1.Post)('contrats'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer un contrat personnel' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "createContrat", null);
__decorate([
    (0, common_1.Get)('contrats'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des contrats avec filtres' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "findContrats", null);
__decorate([
    (0, common_1.Patch)('contrats/:id/renouveler'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Renouveler un contrat' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "renouvelerContrat", null);
__decorate([
    (0, common_1.Patch)('contrats/:id/resilier'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Résilier un contrat' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('motif')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "resilierContrat", null);
__decorate([
    (0, common_1.Post)('heures-complementaires'),
    (0, roles_decorator_1.Roles)('secretaire', 'responsable_rh', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Saisir des heures complémentaires' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "createHeuresComp", null);
__decorate([
    (0, common_1.Get)('heures-complementaires'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des heures complémentaires' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "findHeuresComp", null);
__decorate([
    (0, common_1.Patch)('heures-complementaires/:id/valider'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Valider des heures complémentaires' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('validePar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "validerHeuresComp", null);
__decorate([
    (0, common_1.Get)('enseignants/:id/volume-horaire'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'responsable_pedagogique'),
    (0, swagger_1.ApiOperation)({ summary: 'Volume horaire effectué par un enseignant' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('annee')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "getVolumeHoraire", null);
__decorate([
    (0, common_1.Post)('conges'),
    (0, roles_decorator_1.Roles)('utilisateur', 'responsable_rh', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Demander un congé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "demanderConge", null);
__decorate([
    (0, common_1.Get)('conges'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des demandes de congé' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "findConges", null);
__decorate([
    (0, common_1.Patch)('conges/:id/approuver'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Approuver une demande de congé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "approuverConge", null);
__decorate([
    (0, common_1.Patch)('conges/:id/refuser'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Refuser une demande de congé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "refuserConge", null);
__decorate([
    (0, common_1.Get)('soldes-conges/:utilisateurId'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'secretaire', 'utilisateur'),
    (0, swagger_1.ApiOperation)({ summary: 'Solde de congés d\'un utilisateur' }),
    __param(0, (0, common_1.Param)('utilisateurId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "getSoldeConges", null);
__decorate([
    (0, common_1.Post)('fiches-paie'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Générer une fiche de paie' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "createFichePaie", null);
__decorate([
    (0, common_1.Get)('fiches-paie'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des fiches de paie' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "findFichesPaie", null);
__decorate([
    (0, common_1.Post)('fiches-paie/:id/valider'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Valider et envoyer la fiche de paie' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "validerFichePaie", null);
__decorate([
    (0, common_1.Get)('fiches-paie/masse'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Génération de masse des fiches de paie' }),
    __param(0, (0, common_1.Query)('annee')),
    __param(1, (0, common_1.Query)('mois')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "genererFichesPaieMasse", null);
__decorate([
    (0, common_1.Post)('evaluations'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'superieur'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une évaluation annuelle' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "createEvaluation", null);
__decorate([
    (0, common_1.Get)('evaluations'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des évaluations' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "findEvaluations", null);
__decorate([
    (0, common_1.Post)('evaluations/:id/auto-evaluation'),
    (0, roles_decorator_1.Roles)('utilisateur'),
    (0, swagger_1.ApiOperation)({ summary: 'Soumettre l\'auto-évaluation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "submitAutoEvaluation", null);
__decorate([
    (0, common_1.Patch)('evaluations/:id/finaliser'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'superieur'),
    (0, swagger_1.ApiOperation)({ summary: 'Finaliser l\'évaluation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "finaliserEvaluation", null);
__decorate([
    (0, common_1.Post)('declarations-sociales'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'comptable'),
    (0, swagger_1.ApiOperation)({ summary: 'Générer déclaration URSSAF/MSA' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "createDeclarationSociale", null);
__decorate([
    (0, common_1.Get)('declarations-sociales'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'comptable'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des déclarations sociales' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "findDeclarationsSociales", null);
__decorate([
    (0, common_1.Get)('declarations-sociales/:id/export'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'comptable'),
    (0, swagger_1.ApiOperation)({ summary: 'Export pour URSSAF/MSA' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "exportDeclaration", null);
__decorate([
    (0, common_1.Post)('recrutements'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Lancer un processus de recrutement' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "createRecrutement", null);
__decorate([
    (0, common_1.Get)('recrutements'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des recrutements en cours' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "findRecrutements", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques RH (effectifs, masse salariale)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RHController.prototype, "getStatsRH", null);
__decorate([
    (0, common_1.Get)('stats/heures-complementaires'),
    (0, roles_decorator_1.Roles)('responsable_rh', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Stats heures complémentaires' }),
    __param(0, (0, common_1.Query)('annee')),
    __param(1, (0, common_1.Query)('mois')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], RHController.prototype, "getStatsHeuresComp", null);
exports.RHController = RHController = __decorate([
    (0, swagger_1.ApiTags)('RH - Ressources Humaines (Responsable RH)'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('rh'),
    __metadata("design:paramtypes", [rh_service_1.RHService])
], RHController);
//# sourceMappingURL=rh.controller.js.map