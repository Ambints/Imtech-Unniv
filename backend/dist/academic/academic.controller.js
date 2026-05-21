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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AcademicController = class AcademicController {
    constructor(svc) {
        this.svc = svc;
    }
    getDepartementsFromContext() {
        return this.svc.getDepartementsFromContext();
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
    getParcours(tid, req) {
        return this.svc.getParcours(tid, req.user?.userId, req.user?.role);
    }
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
    getSessionsExamen(tid) {
        return this.svc.getSessionsExamen(tid);
    }
    getPresences(tid, statut) {
        return this.svc.getPresences(tid, statut);
    }
    deleteUE(tid, id) {
        return this.svc.deleteUE(tid, id);
    }
    getEtudiants(tid, pid) {
        return this.svc.getEtudiants(tid, pid);
    }
    getStudents(tid, pid) {
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
    async deleteEtudiant(tid, id) {
        console.log(`[Controller] deleteEtudiant called with tid: ${tid}, id: ${id}`);
        try {
            const result = await this.svc.deleteEtudiant(tid, id);
            console.log(`[Controller] deleteEtudiant success:`, result);
            return result;
        }
        catch (error) {
            console.error(`[Controller] deleteEtudiant error:`, error);
            throw error;
        }
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
    getAnneesAcademiques(tid) { return this.svc.getAnneesAcademiques(tid); }
    getEnseignants(tid) { return this.svc.getEnseignants(tid); }
    createAnneeAcademique(tid, dto) { return this.svc.createAnneeAcademique(tid, dto); }
    updateAnneeAcademique(tid, id, dto) {
        return this.svc.updateAnneeAcademique(tid, id, dto);
    }
    activerAnneeAcademique(tid, id) {
        return this.svc.activerAnneeAcademique(tid, id);
    }
    deleteAnneeAcademique(tid, id) {
        return this.svc.deleteAnneeAcademique(tid, id);
    }
};
exports.AcademicController = AcademicController;
__decorate([
    (0, common_1.Get)('departements'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des departements (tenant from context)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getDepartementsFromContext", null);
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
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les parcours (filtrés par rôle)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
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
    (0, common_1.Get)(':tid/sessions'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister les sessions d\'examens' }),
    __param(0, (0, common_1.Param)('tid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getSessionsExamen", null);
__decorate([
    (0, common_1.Get)(':tid/presences'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des presences' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Query)('statut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getPresences", null);
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
    (0, common_1.Get)(':tid/students'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des etudiants (alias)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Query)('parcoursId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getStudents", null);
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
    __metadata("design:returntype", Promise)
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
__decorate([
    (0, common_1.Get)(':tid/annees'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des années académiques' }),
    __param(0, (0, common_1.Param)('tid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getAnneesAcademiques", null);
__decorate([
    (0, common_1.Get)(':tid/enseignants'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des enseignants' }),
    __param(0, (0, common_1.Param)('tid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getEnseignants", null);
__decorate([
    (0, common_1.Post)(':tid/annees'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une année académique' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "createAnneeAcademique", null);
__decorate([
    (0, common_1.Patch)(':tid/annees/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une année académique' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "updateAnneeAcademique", null);
__decorate([
    (0, common_1.Post)(':tid/annees/:id/activer'),
    (0, swagger_1.ApiOperation)({ summary: 'Activer une année académique (désactive les autres)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "activerAnneeAcademique", null);
__decorate([
    (0, common_1.Delete)(':tid/annees/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une année académique' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "deleteAnneeAcademique", null);
exports.AcademicController = AcademicController = __decorate([
    (0, swagger_1.ApiTags)('Academic'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('academic'),
    __metadata("design:paramtypes", [academic_service_1.AcademicService])
], AcademicController);
//# sourceMappingURL=academic.controller.js.map