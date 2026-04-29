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
exports.FichePaie = exports.CongePersonnel = exports.ContratPersonnel = exports.Depense = exports.Budget = exports.Paiement = exports.Echeancier = exports.GrilleTarifaire = void 0;
const typeorm_1 = require("typeorm");
let GrilleTarifaire = class GrilleTarifaire {
};
exports.GrilleTarifaire = GrilleTarifaire;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GrilleTarifaire.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parcours_id' }),
    __metadata("design:type", String)
], GrilleTarifaire.prototype, "parcoursId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annee_academique_id' }),
    __metadata("design:type", String)
], GrilleTarifaire.prototype, "anneeAcademiqueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annee_niveau', nullable: true }),
    __metadata("design:type", Number)
], GrilleTarifaire.prototype, "anneeNiveau", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'montant_total', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], GrilleTarifaire.prototype, "montantTotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nb_tranches', default: 1 }),
    __metadata("design:type", Number)
], GrilleTarifaire.prototype, "nbTranches", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], GrilleTarifaire.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, name: 'actif' }),
    __metadata("design:type", Boolean)
], GrilleTarifaire.prototype, "actif", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], GrilleTarifaire.prototype, "createdAt", void 0);
exports.GrilleTarifaire = GrilleTarifaire = __decorate([
    (0, typeorm_1.Entity)('grille_tarifaire')
], GrilleTarifaire);
let Echeancier = class Echeancier {
};
exports.Echeancier = Echeancier;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Echeancier.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inscription_id' }),
    __metadata("design:type", String)
], Echeancier.prototype, "inscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'num_tranche' }),
    __metadata("design:type", Number)
], Echeancier.prototype, "numTranche", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'montant_du', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Echeancier.prototype, "montantDu", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_echeance' }),
    __metadata("design:type", Date)
], Echeancier.prototype, "dateEcheance", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'en_attente' }),
    __metadata("design:type", String)
], Echeancier.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Echeancier.prototype, "createdAt", void 0);
exports.Echeancier = Echeancier = __decorate([
    (0, typeorm_1.Entity)('echeancier')
], Echeancier);
let Paiement = class Paiement {
};
exports.Paiement = Paiement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Paiement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'inscription_id' }),
    __metadata("design:type", String)
], Paiement.prototype, "inscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'echeancier_id', nullable: true }),
    __metadata("design:type", String)
], Paiement.prototype, "echeancierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Paiement.prototype, "montant", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mode_paiement' }),
    __metadata("design:type", String)
], Paiement.prototype, "modePaiement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_paiement', default: () => 'NOW()' }),
    __metadata("design:type", Date)
], Paiement.prototype, "datePaiement", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Paiement.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_recu', unique: true }),
    __metadata("design:type", String)
], Paiement.prototype, "numeroRecu", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recu_url', nullable: true }),
    __metadata("design:type", String)
], Paiement.prototype, "recuUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'caissier_id' }),
    __metadata("design:type", String)
], Paiement.prototype, "caissierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'valide' }),
    __metadata("design:type", String)
], Paiement.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motif_annulation', nullable: true }),
    __metadata("design:type", String)
], Paiement.prototype, "motifAnnulation", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Paiement.prototype, "observations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Paiement.prototype, "createdAt", void 0);
exports.Paiement = Paiement = __decorate([
    (0, typeorm_1.Entity)('paiement')
], Paiement);
let Budget = class Budget {
};
exports.Budget = Budget;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Budget.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annee_academique_id' }),
    __metadata("design:type", String)
], Budget.prototype, "anneeAcademiqueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'departement_id', nullable: true }),
    __metadata("design:type", String)
], Budget.prototype, "departementId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Budget.prototype, "categorie", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'montant_prevu', type: 'decimal', precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], Budget.prototype, "montantPrevu", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'montant_realise', type: 'decimal', precision: 15, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Budget.prototype, "montantRealise", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Budget.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', nullable: true }),
    __metadata("design:type", String)
], Budget.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Budget.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Budget.prototype, "updatedAt", void 0);
exports.Budget = Budget = __decorate([
    (0, typeorm_1.Entity)('budget')
], Budget);
let Depense = class Depense {
};
exports.Depense = Depense;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Depense.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'budget_id', nullable: true }),
    __metadata("design:type", String)
], Depense.prototype, "budgetId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'annee_academique_id' }),
    __metadata("design:type", String)
], Depense.prototype, "anneeAcademiqueId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Depense.prototype, "libelle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], Depense.prototype, "montant", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Depense.prototype, "categorie", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_depense', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], Depense.prototype, "dateDepense", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Depense.prototype, "fournisseur", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_facture', nullable: true }),
    __metadata("design:type", String)
], Depense.prototype, "numeroFacture", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'facture_url', nullable: true }),
    __metadata("design:type", String)
], Depense.prototype, "factureUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'en_attente' }),
    __metadata("design:type", String)
], Depense.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'demande_par', nullable: true }),
    __metadata("design:type", String)
], Depense.prototype, "demandePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approuve_par', nullable: true }),
    __metadata("design:type", String)
], Depense.prototype, "approuvePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_approbation', nullable: true }),
    __metadata("design:type", Date)
], Depense.prototype, "dateApprobation", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Depense.prototype, "observations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Depense.prototype, "createdAt", void 0);
exports.Depense = Depense = __decorate([
    (0, typeorm_1.Entity)('depense')
], Depense);
let ContratPersonnel = class ContratPersonnel {
};
exports.ContratPersonnel = ContratPersonnel;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ContratPersonnel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'utilisateur_id' }),
    __metadata("design:type", String)
], ContratPersonnel.prototype, "utilisateurId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_contrat' }),
    __metadata("design:type", String)
], ContratPersonnel.prototype, "typeContrat", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ContratPersonnel.prototype, "poste", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'departement_id', nullable: true }),
    __metadata("design:type", String)
], ContratPersonnel.prototype, "departementId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_debut' }),
    __metadata("design:type", Date)
], ContratPersonnel.prototype, "dateDebut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_fin', nullable: true }),
    __metadata("design:type", Date)
], ContratPersonnel.prototype, "dateFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salaire_brut', nullable: true, type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], ContratPersonnel.prototype, "salaireBrut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salaire_net', nullable: true, type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], ContratPersonnel.prototype, "salaireNet", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'volume_horaire_hebdo', nullable: true }),
    __metadata("design:type", Number)
], ContratPersonnel.prototype, "volumeHoraireHebdo", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, name: 'actif' }),
    __metadata("design:type", Boolean)
], ContratPersonnel.prototype, "actif", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fichier_contrat_url', nullable: true }),
    __metadata("design:type", String)
], ContratPersonnel.prototype, "fichierContratUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ContratPersonnel.prototype, "observations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ContratPersonnel.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ContratPersonnel.prototype, "updatedAt", void 0);
exports.ContratPersonnel = ContratPersonnel = __decorate([
    (0, typeorm_1.Entity)('contrat_personnel')
], ContratPersonnel);
let CongePersonnel = class CongePersonnel {
};
exports.CongePersonnel = CongePersonnel;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CongePersonnel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'utilisateur_id' }),
    __metadata("design:type", String)
], CongePersonnel.prototype, "utilisateurId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_conge' }),
    __metadata("design:type", String)
], CongePersonnel.prototype, "typeConge", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_debut' }),
    __metadata("design:type", Date)
], CongePersonnel.prototype, "dateDebut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_fin' }),
    __metadata("design:type", Date)
], CongePersonnel.prototype, "dateFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CongePersonnel.prototype, "motif", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'demande' }),
    __metadata("design:type", String)
], CongePersonnel.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approuve_par', nullable: true }),
    __metadata("design:type", String)
], CongePersonnel.prototype, "approuvePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_approbation', nullable: true }),
    __metadata("design:type", Date)
], CongePersonnel.prototype, "dateApprobation", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CongePersonnel.prototype, "createdAt", void 0);
exports.CongePersonnel = CongePersonnel = __decorate([
    (0, typeorm_1.Entity)('conge_personnel')
], CongePersonnel);
let FichePaie = class FichePaie {
};
exports.FichePaie = FichePaie;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FichePaie.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contrat_id' }),
    __metadata("design:type", String)
], FichePaie.prototype, "contratId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], FichePaie.prototype, "annee", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], FichePaie.prototype, "mois", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salaire_brut', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], FichePaie.prototype, "salaireBrut", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], FichePaie.prototype, "cotisations", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], FichePaie.prototype, "primes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], FichePaie.prototype, "retenues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'net_a_payer', type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], FichePaie.prototype, "netAPayer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'heures_supp', type: 'decimal', precision: 6, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], FichePaie.prototype, "heuresSupp", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'montant_heures_supp', type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], FichePaie.prototype, "montantHeuresSupp", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'brouillon' }),
    __metadata("design:type", String)
], FichePaie.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fichier_url', nullable: true }),
    __metadata("design:type", String)
], FichePaie.prototype, "fichierUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FichePaie.prototype, "createdAt", void 0);
exports.FichePaie = FichePaie = __decorate([
    (0, typeorm_1.Entity)('fiche_paie')
], FichePaie);
//# sourceMappingURL=finance.entities.js.map