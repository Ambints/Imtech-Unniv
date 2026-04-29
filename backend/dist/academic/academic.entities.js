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
exports.Note = exports.SessionExamen = exports.Presence = exports.EmploiDuTemps = exports.Batiment = exports.Salle = exports.AffectationCours = exports.Enseignant = exports.Inscription = exports.Etudiant = exports.CalendrierAcademique = exports.AnneeAcademique = exports.Departement = exports.ElementConstitutif = exports.UniteEnseignement = exports.Parcours = void 0;
const typeorm_1 = require("typeorm");
let Parcours = class Parcours {
};
exports.Parcours = Parcours;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Parcours.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'departement_id' }),
    __metadata("design:type", String)
], Parcours.prototype, "departementId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Parcours.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Parcours.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Parcours.prototype, "niveau", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duree_annees', default: 3 }),
    __metadata("design:type", Number)
], Parcours.prototype, "dureeAnnees", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'responsable_id', nullable: true }),
    __metadata("design:type", String)
], Parcours.prototype, "responsableId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Parcours.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, name: 'actif' }),
    __metadata("design:type", Boolean)
], Parcours.prototype, "actif", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annee_ouverture', nullable: true }),
    __metadata("design:type", Number)
], Parcours.prototype, "anneeOuverture", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Parcours.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Parcours.prototype, "updatedAt", void 0);
exports.Parcours = Parcours = __decorate([
    (0, typeorm_1.Entity)('parcours')
], Parcours);
let UniteEnseignement = class UniteEnseignement {
};
exports.UniteEnseignement = UniteEnseignement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UniteEnseignement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parcours_id' }),
    __metadata("design:type", String)
], UniteEnseignement.prototype, "parcoursId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UniteEnseignement.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UniteEnseignement.prototype, "intitule", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credits_ects', default: 3 }),
    __metadata("design:type", Number)
], UniteEnseignement.prototype, "creditsEcts", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 4, scale: 2, default: 1.0 }),
    __metadata("design:type", Number)
], UniteEnseignement.prototype, "coefficient", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'volume_cm', default: 0 }),
    __metadata("design:type", Number)
], UniteEnseignement.prototype, "volumeCm", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'volume_td', default: 0 }),
    __metadata("design:type", Number)
], UniteEnseignement.prototype, "volumeTd", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'volume_tp', default: 0 }),
    __metadata("design:type", Number)
], UniteEnseignement.prototype, "volumeTp", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], UniteEnseignement.prototype, "semestre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annee_niveau' }),
    __metadata("design:type", Number)
], UniteEnseignement.prototype, "anneeNiveau", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_ue', default: 'obligatoire' }),
    __metadata("design:type", String)
], UniteEnseignement.prototype, "typeUe", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, name: 'actif' }),
    __metadata("design:type", Boolean)
], UniteEnseignement.prototype, "actif", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UniteEnseignement.prototype, "createdAt", void 0);
exports.UniteEnseignement = UniteEnseignement = __decorate([
    (0, typeorm_1.Entity)('unite_enseignement')
], UniteEnseignement);
let ElementConstitutif = class ElementConstitutif {
};
exports.ElementConstitutif = ElementConstitutif;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ElementConstitutif.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ue_id' }),
    __metadata("design:type", String)
], ElementConstitutif.prototype, "ueId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ElementConstitutif.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ElementConstitutif.prototype, "intitule", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 4, scale: 2, default: 1.0 }),
    __metadata("design:type", Number)
], ElementConstitutif.prototype, "coefficient", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, name: 'actif' }),
    __metadata("design:type", Boolean)
], ElementConstitutif.prototype, "actif", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ElementConstitutif.prototype, "createdAt", void 0);
exports.ElementConstitutif = ElementConstitutif = __decorate([
    (0, typeorm_1.Entity)('element_constitutif')
], ElementConstitutif);
let Departement = class Departement {
};
exports.Departement = Departement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Departement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Departement.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Departement.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Departement.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'responsable_id', nullable: true }),
    __metadata("design:type", String)
], Departement.prototype, "responsableId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, name: 'actif' }),
    __metadata("design:type", Boolean)
], Departement.prototype, "actif", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Departement.prototype, "createdAt", void 0);
exports.Departement = Departement = __decorate([
    (0, typeorm_1.Entity)('departement')
], Departement);
let AnneeAcademique = class AnneeAcademique {
};
exports.AnneeAcademique = AnneeAcademique;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AnneeAcademique.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AnneeAcademique.prototype, "libelle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_debut' }),
    __metadata("design:type", Date)
], AnneeAcademique.prototype, "dateDebut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_fin' }),
    __metadata("design:type", Date)
], AnneeAcademique.prototype, "dateFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false, name: 'active' }),
    __metadata("design:type", Boolean)
], AnneeAcademique.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AnneeAcademique.prototype, "createdAt", void 0);
exports.AnneeAcademique = AnneeAcademique = __decorate([
    (0, typeorm_1.Entity)('annee_academique')
], AnneeAcademique);
let CalendrierAcademique = class CalendrierAcademique {
};
exports.CalendrierAcademique = CalendrierAcademique;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CalendrierAcademique.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annee_academique_id' }),
    __metadata("design:type", String)
], CalendrierAcademique.prototype, "anneeAcademiqueId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CalendrierAcademique.prototype, "evenement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_evenement' }),
    __metadata("design:type", String)
], CalendrierAcademique.prototype, "typeEvenement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_debut' }),
    __metadata("design:type", Date)
], CalendrierAcademique.prototype, "dateDebut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_fin' }),
    __metadata("design:type", Date)
], CalendrierAcademique.prototype, "dateFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parcours_id', nullable: true }),
    __metadata("design:type", String)
], CalendrierAcademique.prototype, "parcoursId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CalendrierAcademique.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CalendrierAcademique.prototype, "createdAt", void 0);
exports.CalendrierAcademique = CalendrierAcademique = __decorate([
    (0, typeorm_1.Entity)('calendrier_academique')
], CalendrierAcademique);
let Etudiant = class Etudiant {
};
exports.Etudiant = Etudiant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Etudiant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'utilisateur_id', unique: true, nullable: true }),
    __metadata("design:type", String)
], Etudiant.prototype, "utilisateurId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Etudiant.prototype, "matricule", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Etudiant.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Etudiant.prototype, "prenom", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_naissance' }),
    __metadata("design:type", Date)
], Etudiant.prototype, "dateNaissance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lieu_naissance', nullable: true }),
    __metadata("design:type", String)
], Etudiant.prototype, "lieuNaissance", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Etudiant.prototype, "sexe", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Malagasy' }),
    __metadata("design:type", String)
], Etudiant.prototype, "nationalite", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Etudiant.prototype, "adresse", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Etudiant.prototype, "telephone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Etudiant.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nom_parent', nullable: true }),
    __metadata("design:type", String)
], Etudiant.prototype, "nomParent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'telephone_parent', nullable: true }),
    __metadata("design:type", String)
], Etudiant.prototype, "telephoneParent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_parent', nullable: true }),
    __metadata("design:type", String)
], Etudiant.prototype, "emailParent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Etudiant.prototype, "religion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'situation_familiale', nullable: true }),
    __metadata("design:type", String)
], Etudiant.prototype, "situationFamiliale", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photo_url', nullable: true }),
    __metadata("design:type", String)
], Etudiant.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'dossier_medical_url', nullable: true }),
    __metadata("design:type", String)
], Etudiant.prototype, "dossierMedicalUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, name: 'actif' }),
    __metadata("design:type", Boolean)
], Etudiant.prototype, "actif", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Etudiant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Etudiant.prototype, "updatedAt", void 0);
exports.Etudiant = Etudiant = __decorate([
    (0, typeorm_1.Entity)('etudiant')
], Etudiant);
let Inscription = class Inscription {
};
exports.Inscription = Inscription;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Inscription.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'etudiant_id' }),
    __metadata("design:type", String)
], Inscription.prototype, "etudiantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parcours_id' }),
    __metadata("design:type", String)
], Inscription.prototype, "parcoursId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annee_academique_id' }),
    __metadata("design:type", String)
], Inscription.prototype, "anneeAcademiqueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annee_niveau' }),
    __metadata("design:type", Number)
], Inscription.prototype, "anneeNiveau", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_inscription', default: 'premiere' }),
    __metadata("design:type", String)
], Inscription.prototype, "typeInscription", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'en_attente' }),
    __metadata("design:type", String)
], Inscription.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_carte', unique: true, nullable: true }),
    __metadata("design:type", String)
], Inscription.prototype, "numeroCarte", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_inscription', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], Inscription.prototype, "dateInscription", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Inscription.prototype, "bourse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_bourse', nullable: true }),
    __metadata("design:type", String)
], Inscription.prototype, "typeBourse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'montant_bourse', nullable: true, type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Inscription.prototype, "montantBourse", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Inscription.prototype, "observations", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'validee_par', nullable: true }),
    __metadata("design:type", String)
], Inscription.prototype, "valideePar", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Inscription.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Inscription.prototype, "updatedAt", void 0);
exports.Inscription = Inscription = __decorate([
    (0, typeorm_1.Entity)('inscription')
], Inscription);
let Enseignant = class Enseignant {
};
exports.Enseignant = Enseignant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Enseignant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'utilisateur_id', unique: true, nullable: true }),
    __metadata("design:type", String)
], Enseignant.prototype, "utilisateurId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Enseignant.prototype, "matricule", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Enseignant.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Enseignant.prototype, "prenom", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Enseignant.prototype, "titre", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Enseignant.prototype, "grade", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Enseignant.prototype, "specialite", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_contrat', default: 'permanent' }),
    __metadata("design:type", String)
], Enseignant.prototype, "typeContrat", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'departement_id', nullable: true }),
    __metadata("design:type", String)
], Enseignant.prototype, "departementId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Enseignant.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Enseignant.prototype, "telephone", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, name: 'actif' }),
    __metadata("design:type", Boolean)
], Enseignant.prototype, "actif", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Enseignant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Enseignant.prototype, "updatedAt", void 0);
exports.Enseignant = Enseignant = __decorate([
    (0, typeorm_1.Entity)('enseignant')
], Enseignant);
let AffectationCours = class AffectationCours {
};
exports.AffectationCours = AffectationCours;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AffectationCours.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enseignant_id' }),
    __metadata("design:type", String)
], AffectationCours.prototype, "enseignantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ue_id', nullable: true }),
    __metadata("design:type", String)
], AffectationCours.prototype, "ueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ec_id', nullable: true }),
    __metadata("design:type", String)
], AffectationCours.prototype, "ecId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annee_academique_id' }),
    __metadata("design:type", String)
], AffectationCours.prototype, "anneeAcademiqueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_seance', default: 'CM' }),
    __metadata("design:type", String)
], AffectationCours.prototype, "typeSeance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'volume_prevu', default: 0 }),
    __metadata("design:type", Number)
], AffectationCours.prototype, "volumePrevu", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'volume_realise', default: 0 }),
    __metadata("design:type", Number)
], AffectationCours.prototype, "volumeRealise", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valide_par', nullable: true }),
    __metadata("design:type", String)
], AffectationCours.prototype, "validePar", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AffectationCours.prototype, "createdAt", void 0);
exports.AffectationCours = AffectationCours = __decorate([
    (0, typeorm_1.Entity)('affectation_cours')
], AffectationCours);
let Salle = class Salle {
};
exports.Salle = Salle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Salle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batiment_id', nullable: true }),
    __metadata("design:type", String)
], Salle.prototype, "batimentId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Salle.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Salle.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Salle.prototype, "capacite", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_salle', default: 'cours' }),
    __metadata("design:type", String)
], Salle.prototype, "typeSalle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], Salle.prototype, "equipements", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, name: 'disponible' }),
    __metadata("design:type", Boolean)
], Salle.prototype, "disponible", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Salle.prototype, "etage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Salle.prototype, "createdAt", void 0);
exports.Salle = Salle = __decorate([
    (0, typeorm_1.Entity)('salle')
], Salle);
let Batiment = class Batiment {
};
exports.Batiment = Batiment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Batiment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Batiment.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Batiment.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Batiment.prototype, "adresse", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, name: 'actif' }),
    __metadata("design:type", Boolean)
], Batiment.prototype, "actif", void 0);
exports.Batiment = Batiment = __decorate([
    (0, typeorm_1.Entity)('batiment')
], Batiment);
let EmploiDuTemps = class EmploiDuTemps {
};
exports.EmploiDuTemps = EmploiDuTemps;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], EmploiDuTemps.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annee_academique_id' }),
    __metadata("design:type", String)
], EmploiDuTemps.prototype, "anneeAcademiqueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'affectation_id' }),
    __metadata("design:type", String)
], EmploiDuTemps.prototype, "affectationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salle_id', nullable: true }),
    __metadata("design:type", String)
], EmploiDuTemps.prototype, "salleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_seance' }),
    __metadata("design:type", Date)
], EmploiDuTemps.prototype, "dateSeance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'heure_debut', type: 'time' }),
    __metadata("design:type", String)
], EmploiDuTemps.prototype, "heureDebut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'heure_fin', type: 'time' }),
    __metadata("design:type", String)
], EmploiDuTemps.prototype, "heureFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_seance', default: 'CM' }),
    __metadata("design:type", String)
], EmploiDuTemps.prototype, "typeSeance", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'planifie' }),
    __metadata("design:type", String)
], EmploiDuTemps.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motif_annulation', nullable: true }),
    __metadata("design:type", String)
], EmploiDuTemps.prototype, "motifAnnulation", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], EmploiDuTemps.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], EmploiDuTemps.prototype, "updatedAt", void 0);
exports.EmploiDuTemps = EmploiDuTemps = __decorate([
    (0, typeorm_1.Entity)('emploi_du_temps')
], EmploiDuTemps);
let Presence = class Presence {
};
exports.Presence = Presence;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Presence.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'etudiant_id' }),
    __metadata("design:type", String)
], Presence.prototype, "etudiantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'seance_id' }),
    __metadata("design:type", String)
], Presence.prototype, "seanceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'absent' }),
    __metadata("design:type", String)
], Presence.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'heure_arrivee', nullable: true, type: 'time' }),
    __metadata("design:type", String)
], Presence.prototype, "heureArrivee", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Presence.prototype, "justifie", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'justificatif_url', nullable: true }),
    __metadata("design:type", String)
], Presence.prototype, "justificatifUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Presence.prototype, "motif", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mode_pointage', default: 'manuel' }),
    __metadata("design:type", String)
], Presence.prototype, "modePointage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'saisi_par', nullable: true }),
    __metadata("design:type", String)
], Presence.prototype, "saisiPar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valide_par', nullable: true }),
    __metadata("design:type", String)
], Presence.prototype, "validePar", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Presence.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Presence.prototype, "updatedAt", void 0);
exports.Presence = Presence = __decorate([
    (0, typeorm_1.Entity)('presence')
], Presence);
let SessionExamen = class SessionExamen {
};
exports.SessionExamen = SessionExamen;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SessionExamen.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annee_academique_id' }),
    __metadata("design:type", String)
], SessionExamen.prototype, "anneeAcademiqueId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], SessionExamen.prototype, "libelle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_session', default: 'normale' }),
    __metadata("design:type", String)
], SessionExamen.prototype, "typeSession", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], SessionExamen.prototype, "semestre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_debut', nullable: true }),
    __metadata("design:type", Date)
], SessionExamen.prototype, "dateDebut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_fin', nullable: true }),
    __metadata("design:type", Date)
], SessionExamen.prototype, "dateFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'planifie' }),
    __metadata("design:type", String)
], SessionExamen.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SessionExamen.prototype, "createdAt", void 0);
exports.SessionExamen = SessionExamen = __decorate([
    (0, typeorm_1.Entity)('session_examen')
], SessionExamen);
let Note = class Note {
};
exports.Note = Note;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Note.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'etudiant_id' }),
    __metadata("design:type", String)
], Note.prototype, "etudiantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ec_id', nullable: true }),
    __metadata("design:type", String)
], Note.prototype, "ecId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ue_id', nullable: true }),
    __metadata("design:type", String)
], Note.prototype, "ueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'session_id' }),
    __metadata("design:type", String)
], Note.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], Note.prototype, "valeur", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_evaluation', default: 'examen_final' }),
    __metadata("design:type", String)
], Note.prototype, "typeEvaluation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'absence_justifiee', default: false }),
    __metadata("design:type", Boolean)
], Note.prototype, "absenceJustifiee", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Note.prototype, "mention", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Note.prototype, "verrouille", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hash_integrite', nullable: true }),
    __metadata("design:type", String)
], Note.prototype, "hashIntegrite", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'saisi_par' }),
    __metadata("design:type", String)
], Note.prototype, "saisiPar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valide_par', nullable: true }),
    __metadata("design:type", String)
], Note.prototype, "validePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_saisie', default: () => 'NOW()' }),
    __metadata("design:type", Date)
], Note.prototype, "dateSaisie", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_verrouillage', nullable: true }),
    __metadata("design:type", Date)
], Note.prototype, "dateVerrouillage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Note.prototype, "observations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Note.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Note.prototype, "updatedAt", void 0);
exports.Note = Note = __decorate([
    (0, typeorm_1.Entity)('note')
], Note);
//# sourceMappingURL=academic.entities.js.map