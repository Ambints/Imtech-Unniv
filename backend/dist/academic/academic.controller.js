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
exports.AcademicController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const academic_service_1 = require("./academic.service");
let AcademicController = class AcademicController {
    constructor(svc) {
        this.svc = svc;
    }
    getDepartements(tid) { return this.svc.getDepartements(tid); }
    createDepartement(tid, dto) { return this.svc.createDepartement(tid, dto); }
    updateDepartement(tid, id, dto) {
        return this.svc.updateDepartement(tid, id, dto);
    }
    deleteDepartement(tid, id) {
        return this.svc.deleteDepartement(tid, id);
    }
    createParcours(tid, dto) { return this.svc.createParcours(tid, dto); }
    getParcours(tid) { return this.svc.getParcours(tid); }
    updateParcours(tid, id, dto) {
        return this.svc.updateParcours(tid, id, dto);
    }
    deleteParcours(tid, id) {
        return this.svc.deleteParcours(tid, id);
    }
    createUE(tid, dto) { return this.svc.createUE(tid, dto); }
    getUE(tid, pid) { return this.svc.getUEByParcours(tid, pid); }
    updateUE(tid, id, dto) {
        return this.svc.updateUE(tid, id, dto);
    }
    deleteUE(tid, id) {
        return this.svc.deleteUE(tid, id);
    }
    getEtudiants(tid, pid) {
        return this.svc.getEtudiants(tid, pid);
    }
    async createEtudiant(tid, dto) {
        console.log('[DEBUG] createEtudiant called with tid:', tid, 'dto:', dto);
        try {
            const result = await this.svc.createEtudiant(tid, dto);
            console.log('[DEBUG] createEtudiant success:', result);
            return result;
        }
        catch (error) {
            console.error('[DEBUG] createEtudiant error:', error);
            throw error;
        }
    }
    updateEtudiant(tid, id, dto) {
        return this.svc.updateEtudiant(tid, id, dto);
    }
    deleteEtudiant(tid, id) {
        return this.svc.deleteEtudiant(tid, id);
    }
    saisirNote(tid, dto) { return this.svc.saisirNote(tid, dto, 'system'); }
    getNotes(tid, eid, annee) {
        return this.svc.getReleverNotes(tid, eid, annee);
    }
    deliberer(tid, body) {
        return this.svc.deliberer(tid, body.parcoursId, body.semestre, body.annee);
    }
    inscrire(tid, dto) { return this.svc.inscrire(tid, dto); }
    getInscriptions(tid, pid) {
        return this.svc.getInscriptions(tid, pid);
    }
    saisirAbsence(tid, dto) { return this.svc.saisirAbsence(tid, dto); }
    getAbsences(tid, eid) {
        return this.svc.getAbsencesEtudiant(tid, eid);
    }
    createSalle(tid, dto) { return this.svc.createSalle(tid, dto); }
    getSalles(tid) { return this.svc.getSalles(tid); }
    createEDT(tid, dto) { return this.svc.createEDT(tid, dto); }
    getEDT(tid, pid) { return this.svc.getEDT(tid, pid); }
};
exports.AcademicController = AcademicController;
__decorate([
    (0, common_1.Get)(':tid/departements'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des departements' }),
    __param(0, (0, common_1.Param)('tid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getDepartements", null);
__decorate([
    (0, common_1.Post)(':tid/departements'),
    (0, swagger_1.ApiOperation)({ summary: 'Creer un departement' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "createDepartement", null);
__decorate([
    (0, common_1.Patch)(':tid/departements/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un departement' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "updateDepartement", null);
__decorate([
    (0, common_1.Delete)(':tid/departements/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un departement' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "deleteDepartement", null);
__decorate([
    (0, common_1.Post)(':tid/parcours'),
    (0, swagger_1.ApiOperation)({ summary: 'Creer un parcours (Responsable Pedagogique)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "createParcours", null);
__decorate([
    (0, common_1.Get)(':tid/parcours'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les parcours' }),
    __param(0, (0, common_1.Param)('tid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getParcours", null);
__decorate([
    (0, common_1.Patch)(':tid/parcours/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un parcours' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "updateParcours", null);
__decorate([
    (0, common_1.Delete)(':tid/parcours/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un parcours' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "deleteParcours", null);
__decorate([
    (0, common_1.Post)(':tid/ue'),
    (0, swagger_1.ApiOperation)({ summary: 'Creer une UE (maquette LMD, credits ECTS)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "createUE", null);
__decorate([
    (0, common_1.Get)(':tid/ue'),
    (0, swagger_1.ApiOperation)({ summary: 'UE par parcours' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Query)('parcoursId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getUE", null);
__decorate([
    (0, common_1.Patch)(':tid/ue/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une UE' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "updateUE", null);
__decorate([
    (0, common_1.Delete)(':tid/ue/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une UE' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "deleteUE", null);
__decorate([
    (0, common_1.Get)(':tid/etudiants'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des etudiants' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Query)('parcoursId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getEtudiants", null);
__decorate([
    (0, common_1.Post)(':tid/etudiants'),
    (0, swagger_1.ApiOperation)({ summary: 'Creer un etudiant' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "createEtudiant", null);
__decorate([
    (0, common_1.Patch)(':tid/etudiants/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier un etudiant' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "updateEtudiant", null);
__decorate([
    (0, common_1.Delete)(':tid/etudiants/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer un etudiant' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "deleteEtudiant", null);
__decorate([
    (0, common_1.Post)(':tid/notes'),
    (0, swagger_1.ApiOperation)({ summary: 'Saisir une note - calcul automatique moyenne' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "saisirNote", null);
__decorate([
    (0, common_1.Get)(':tid/notes/:etudiantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Releve de notes etudiant' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('etudiantId')),
    __param(2, (0, common_1.Query)('annee')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getNotes", null);
__decorate([
    (0, common_1.Post)(':tid/deliberation'),
    (0, swagger_1.ApiOperation)({ summary: 'Deliberation: verrouille toutes les notes du semestre' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "deliberer", null);
__decorate([
    (0, common_1.Post)(':tid/inscriptions'),
    (0, swagger_1.ApiOperation)({ summary: 'Inscrire un etudiant (Secretaire Parcours)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "inscrire", null);
__decorate([
    (0, common_1.Get)(':tid/inscriptions'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des inscriptions' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Query)('parcoursId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getInscriptions", null);
__decorate([
    (0, common_1.Post)(':tid/absences'),
    (0, swagger_1.ApiOperation)({ summary: 'Saisir une absence (Surveillant General)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "saisirAbsence", null);
__decorate([
    (0, common_1.Get)(':tid/absences/:etudiantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Absences etudiant' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('etudiantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getAbsences", null);
__decorate([
    (0, common_1.Post)(':tid/salles'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter une salle' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "createSalle", null);
__decorate([
    (0, common_1.Get)(':tid/salles'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des salles' }),
    __param(0, (0, common_1.Param)('tid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getSalles", null);
__decorate([
    (0, common_1.Post)(':tid/edt'),
    (0, swagger_1.ApiOperation)({ summary: 'Creer emploi du temps (Secretaire)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "createEDT", null);
__decorate([
    (0, common_1.Get)(':tid/edt'),
    (0, swagger_1.ApiOperation)({ summary: 'Emploi du temps par parcours' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Query)('parcoursId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getEDT", null);
exports.AcademicController = AcademicController = __decorate([
    (0, swagger_1.ApiTags)('Academic'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('academic'),
    __metadata("design:paramtypes", [academic_service_1.AcademicService])
], AcademicController);
//# sourceMappingURL=academic.controller.js.map