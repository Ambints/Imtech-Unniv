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
exports.Diplome = exports.Attestation = exports.ReleveNote = void 0;
const typeorm_1 = require("typeorm");
let ReleveNote = class ReleveNote {
};
exports.ReleveNote = ReleveNote;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ReleveNote.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'etudiant_id' }),
    __metadata("design:type", String)
], ReleveNote.prototype, "etudiantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annee_academique_id' }),
    __metadata("design:type", String)
], ReleveNote.prototype, "anneeAcademiqueId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ReleveNote.prototype, "semestre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moyenne_generale', type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], ReleveNote.prototype, "moyenneGenerale", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credits_valides', default: 0 }),
    __metadata("design:type", Number)
], ReleveNote.prototype, "creditsValides", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credits_total', default: 0 }),
    __metadata("design:type", Number)
], ReleveNote.prototype, "creditsTotal", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ReleveNote.prototype, "mention", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_releve', unique: true }),
    __metadata("design:type", String)
], ReleveNote.prototype, "numeroReleve", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fichier_url', nullable: true }),
    __metadata("design:type", String)
], ReleveNote.prototype, "fichierUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'brouillon' }),
    __metadata("design:type", String)
], ReleveNote.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'genere_par', nullable: true }),
    __metadata("design:type", String)
], ReleveNote.prototype, "generePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_generation', default: () => 'NOW()' }),
    __metadata("design:type", Date)
], ReleveNote.prototype, "dateGeneration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valide_par', nullable: true }),
    __metadata("design:type", String)
], ReleveNote.prototype, "validePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_validation', nullable: true }),
    __metadata("design:type", Date)
], ReleveNote.prototype, "dateValidation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signe_par', nullable: true }),
    __metadata("design:type", String)
], ReleveNote.prototype, "signePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_signature', nullable: true }),
    __metadata("design:type", Date)
], ReleveNote.prototype, "dateSignature", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ReleveNote.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ReleveNote.prototype, "updatedAt", void 0);
exports.ReleveNote = ReleveNote = __decorate([
    (0, typeorm_1.Entity)('releve_note')
], ReleveNote);
let Attestation = class Attestation {
};
exports.Attestation = Attestation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Attestation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'etudiant_id' }),
    __metadata("design:type", String)
], Attestation.prototype, "etudiantId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Attestation.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annee_academique_id', nullable: true }),
    __metadata("design:type", String)
], Attestation.prototype, "anneeAcademiqueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_attestation', unique: true }),
    __metadata("design:type", String)
], Attestation.prototype, "numeroAttestation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Attestation.prototype, "contenu", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fichier_url', nullable: true }),
    __metadata("design:type", String)
], Attestation.prototype, "fichierUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'en_preparation' }),
    __metadata("design:type", String)
], Attestation.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'demande_par' }),
    __metadata("design:type", String)
], Attestation.prototype, "demandePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_demande', default: () => 'NOW()' }),
    __metadata("design:type", Date)
], Attestation.prototype, "dateDemande", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valide_par', nullable: true }),
    __metadata("design:type", String)
], Attestation.prototype, "validePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_validation', nullable: true }),
    __metadata("design:type", Date)
], Attestation.prototype, "dateValidation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signe_par', nullable: true }),
    __metadata("design:type", String)
], Attestation.prototype, "signePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_signature', nullable: true }),
    __metadata("design:type", Date)
], Attestation.prototype, "dateSignature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_delivrance', nullable: true }),
    __metadata("design:type", Date)
], Attestation.prototype, "dateDelivrance", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Attestation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Attestation.prototype, "updatedAt", void 0);
exports.Attestation = Attestation = __decorate([
    (0, typeorm_1.Entity)('attestation')
], Attestation);
let Diplome = class Diplome {
};
exports.Diplome = Diplome;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Diplome.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'etudiant_id' }),
    __metadata("design:type", String)
], Diplome.prototype, "etudiantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parcours_id' }),
    __metadata("design:type", String)
], Diplome.prototype, "parcoursId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annee_academique_id' }),
    __metadata("design:type", String)
], Diplome.prototype, "anneeAcademiqueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_diplome' }),
    __metadata("design:type", String)
], Diplome.prototype, "typeDiplome", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mention_obtenue' }),
    __metadata("design:type", String)
], Diplome.prototype, "mentionObtenue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_diplome', unique: true }),
    __metadata("design:type", String)
], Diplome.prototype, "numeroDiplome", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_livret', unique: true, nullable: true }),
    __metadata("design:type", String)
], Diplome.prototype, "numeroLivret", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moyenne_generale', type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], Diplome.prototype, "moyenneGenerale", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_obtention' }),
    __metadata("design:type", Date)
], Diplome.prototype, "dateObtention", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fichier_diplome_url', nullable: true }),
    __metadata("design:type", String)
], Diplome.prototype, "fichierDiplomeUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fichier_supplement_url', nullable: true }),
    __metadata("design:type", String)
], Diplome.prototype, "fichierSupplementUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'en_preparation' }),
    __metadata("design:type", String)
], Diplome.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'genere_par', nullable: true }),
    __metadata("design:type", String)
], Diplome.prototype, "generePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valide_par', nullable: true }),
    __metadata("design:type", String)
], Diplome.prototype, "validePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_validation', nullable: true }),
    __metadata("design:type", Date)
], Diplome.prototype, "dateValidation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signe_numeriquement', default: false }),
    __metadata("design:type", Boolean)
], Diplome.prototype, "signeNumeriquement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signature_president_url', nullable: true }),
    __metadata("design:type", String)
], Diplome.prototype, "signaturePresidentUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_signature', nullable: true }),
    __metadata("design:type", Date)
], Diplome.prototype, "dateSignature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_delivrance', nullable: true }),
    __metadata("design:type", Date)
], Diplome.prototype, "dateDelivrance", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Diplome.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Diplome.prototype, "updatedAt", void 0);
exports.Diplome = Diplome = __decorate([
    (0, typeorm_1.Entity)('diplome')
], Diplome);
//# sourceMappingURL=documents.entities.js.map