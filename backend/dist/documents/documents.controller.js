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
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const documents_service_1 = require("./documents.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let DocumentsController = class DocumentsController {
    constructor(svc) {
        this.svc = svc;
    }
    createReleve(dto) {
        return this.svc.genererReleve(dto);
    }
    findReleves(etudiantId) {
        return this.svc.findRelevesByEtudiant(etudiantId);
    }
    validerReleve(id, validePar) {
        return this.svc.validerReleve(id, validePar);
    }
    signerReleve(id, signePar) {
        return this.svc.signerReleve(id, signePar);
    }
    demanderAttestation(dto) {
        return this.svc.demanderAttestation(dto);
    }
    findAttestations(etudiantId) {
        return this.svc.findAttestationsByEtudiant(etudiantId);
    }
    validerAttestation(id, validePar) {
        return this.svc.validerAttestation(id, validePar);
    }
    signerAttestation(id, signePar) {
        return this.svc.signerAttestation(id, signePar);
    }
    delivrerAttestation(id) {
        return this.svc.delivrerAttestation(id);
    }
    createDiplome(dto) {
        return this.svc.genererDiplome(dto);
    }
    findDiplomes(etudiantId) {
        return this.svc.findDiplomesByEtudiant(etudiantId);
    }
    signerDiplomeNumerique(id, signatureUrl) {
        return this.svc.signerDiplomeNumeriquement(id, signatureUrl);
    }
    delivrerDiplome(id) {
        return this.svc.delivrerDiplome(id);
    }
    getStats() {
        return this.svc.getStatsDocuments();
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)('releves'),
    (0, roles_decorator_1.Roles)('secretaire', 'admin', 'scolarite'),
    (0, swagger_1.ApiOperation)({ summary: 'Générer un relevé de notes' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "createReleve", null);
__decorate([
    (0, common_1.Get)('etudiants/:etudiantId/releves'),
    (0, roles_decorator_1.Roles)('secretaire', 'admin', 'scolarite', 'etudiant', 'parent'),
    (0, swagger_1.ApiOperation)({ summary: 'Relevés d\'un étudiant' }),
    __param(0, (0, common_1.Param)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findReleves", null);
__decorate([
    (0, common_1.Patch)('releves/:id/valider'),
    (0, roles_decorator_1.Roles)('secretaire', 'admin', 'responsable_pedagogique'),
    (0, swagger_1.ApiOperation)({ summary: 'Valider un relevé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('validePar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "validerReleve", null);
__decorate([
    (0, common_1.Patch)('releves/:id/signer'),
    (0, roles_decorator_1.Roles)('admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Signer un relevé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('signePar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "signerReleve", null);
__decorate([
    (0, common_1.Post)('attestations'),
    (0, roles_decorator_1.Roles)('etudiant', 'secretaire', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Demander une attestation' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "demanderAttestation", null);
__decorate([
    (0, common_1.Get)('etudiants/:etudiantId/attestations'),
    (0, roles_decorator_1.Roles)('etudiant', 'parent', 'secretaire', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Attestations d\'un étudiant' }),
    __param(0, (0, common_1.Param)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findAttestations", null);
__decorate([
    (0, common_1.Patch)('attestations/:id/valider'),
    (0, roles_decorator_1.Roles)('secretaire', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Valider une attestation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('validePar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "validerAttestation", null);
__decorate([
    (0, common_1.Patch)('attestations/:id/signer'),
    (0, roles_decorator_1.Roles)('admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Signer une attestation' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('signePar')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "signerAttestation", null);
__decorate([
    (0, common_1.Patch)('attestations/:id/delivrer'),
    (0, roles_decorator_1.Roles)('secretaire', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Marquer comme délivrée' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "delivrerAttestation", null);
__decorate([
    (0, common_1.Post)('diplomes'),
    (0, roles_decorator_1.Roles)('admin', 'secretaire', 'scolarite'),
    (0, swagger_1.ApiOperation)({ summary: 'Générer un diplôme' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "createDiplome", null);
__decorate([
    (0, common_1.Get)('etudiants/:etudiantId/diplomes'),
    (0, roles_decorator_1.Roles)('etudiant', 'parent', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Diplômes d\'un étudiant' }),
    __param(0, (0, common_1.Param)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findDiplomes", null);
__decorate([
    (0, common_1.Patch)('diplomes/:id/signer-numerique'),
    (0, roles_decorator_1.Roles)('admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Signer numériquement le diplôme' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('signatureUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "signerDiplomeNumerique", null);
__decorate([
    (0, common_1.Patch)('diplomes/:id/delivrer'),
    (0, roles_decorator_1.Roles)('admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Délivrer le diplôme' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "delivrerDiplome", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('admin', 'president', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques documents' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "getStats", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, swagger_1.ApiTags)('Documents - Relevés, Attestations, Diplômes'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map