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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PVNote = exports.Jury = exports.Deliberation = exports.SujetExamen = void 0;
const typeorm_1 = require("typeorm");
let SujetExamen = class SujetExamen {
};
exports.SujetExamen = SujetExamen;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SujetExamen.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'session_id' }),
    __metadata("design:type", String)
], SujetExamen.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ec_id' }),
    __metadata("design:type", String)
], SujetExamen.prototype, "ecId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SujetExamen.prototype, "titre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SujetExamen.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duree_minutes' }),
    __metadata("design:type", Number)
], SujetExamen.prototype, "dureeMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'coefficient', type: 'decimal', precision: 4, scale: 2, default: 1 }),
    __metadata("design:type", Number)
], SujetExamen.prototype, "coefficient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fichier_sujet_url', nullable: true }),
    __metadata("design:type", String)
], SujetExamen.prototype, "fichierSujetUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fichier_correction_url', nullable: true }),
    __metadata("design:type", String)
], SujetExamen.prototype, "fichierCorrectionUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'depose_par' }),
    __metadata("design:type", String)
], SujetExamen.prototype, "deposePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_depot', default: () => 'NOW()' }),
    __metadata("design:type", Date)
], SujetExamen.prototype, "dateDepot", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valide_par', nullable: true }),
    __metadata("design:type", String)
], SujetExamen.prototype, "validePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_validation', nullable: true }),
    __metadata("design:type", Date)
], SujetExamen.prototype, "dateValidation", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'en_preparation' }),
    __metadata("design:type", String)
], SujetExamen.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'relecteurs', type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], SujetExamen.prototype, "relecteurs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], SujetExamen.prototype, "historique", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SujetExamen.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SujetExamen.prototype, "updatedAt", void 0);
exports.SujetExamen = SujetExamen = __decorate([
    (0, typeorm_1.Entity)('sujet_examen')
], SujetExamen);
let Deliberation = class Deliberation {
};
exports.Deliberation = Deliberation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Deliberation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'session_id' }),
    __metadata("design:type", String)
], Deliberation.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ue_id' }),
    __metadata("design:type", String)
], Deliberation.prototype, "ueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_deliberation' }),
    __metadata("design:type", Date)
], Deliberation.prototype, "dateDeliberation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'president_jury' }),
    __metadata("design:type", String)
], Deliberation.prototype, "presidentJury", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], Deliberation.prototype, "membresJury", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moyenne_generale', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Deliberation.prototype, "moyenneGenerale", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'taux_reussite', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Deliberation.prototype, "tauxReussite", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pv_signe_url', nullable: true }),
    __metadata("design:type", String)
], Deliberation.prototype, "pvSigneUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'en_cours' }),
    __metadata("design:type", String)
], Deliberation.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'verrouille_par', nullable: true }),
    __metadata("design:type", String)
], Deliberation.prototype, "verrouillePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_verrouillage', nullable: true }),
    __metadata("design:type", Date)
], Deliberation.prototype, "dateVerrouillage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Deliberation.prototype, "observations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Deliberation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Deliberation.prototype, "updatedAt", void 0);
exports.Deliberation = Deliberation = __decorate([
    (0, typeorm_1.Entity)('deliberation')
], Deliberation);
let Jury = class Jury {
};
exports.Jury = Jury;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Jury.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deliberation_id' }),
    __metadata("design:type", String)
], Jury.prototype, "deliberationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enseignant_id' }),
    __metadata("design:type", String)
], Jury.prototype, "enseignantId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Jury.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_convocation', nullable: true }),
    __metadata("design:type", Date)
], Jury.prototype, "dateConvocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'present', default: false }),
    __metadata("design:type", Boolean)
], Jury.prototype, "present", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signature_url', nullable: true }),
    __metadata("design:type", String)
], Jury.prototype, "signatureUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Jury.prototype, "createdAt", void 0);
exports.Jury = Jury = __decorate([
    (0, typeorm_1.Entity)('jury')
], Jury);
let PVNote = class PVNote {
};
exports.PVNote = PVNote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PVNote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deliberation_id' }),
    __metadata("design:type", String)
], PVNote.prototype, "deliberationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'etudiant_id' }),
    __metadata("design:type", String)
], PVNote.prototype, "etudiantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moyenne_ue', type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], PVNote.prototype, "moyenneUe", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moyenne_generale', type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], PVNote.prototype, "moyenneGenerale", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credits_acquis', default: 0 }),
    __metadata("design:type", Number)
], PVNote.prototype, "creditsAcquis", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mention' }),
    __metadata("design:type", String)
], PVNote.prototype, "mention", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'passe' }),
    __metadata("design:type", String)
], PVNote.prototype, "decision", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'appreciation', nullable: true }),
    __metadata("design:type", String)
], PVNote.prototype, "appreciation", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], PVNote.prototype, "valide", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PVNote.prototype, "createdAt", void 0);
exports.PVNote = PVNote = __decorate([
    (0, typeorm_1.Entity)('pv_note')
], PVNote);
//# sourceMappingURL=examens.entities.js.map