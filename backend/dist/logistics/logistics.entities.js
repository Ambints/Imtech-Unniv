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
exports.RapportEntretien = exports.PlanningEntretien = exports.MouvementStock = exports.Stock = exports.ReservationSalle = exports.TicketMaintenance = void 0;
const typeorm_1 = require("typeorm");
let TicketMaintenance = class TicketMaintenance {
};
exports.TicketMaintenance = TicketMaintenance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TicketMaintenance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batiment_id', nullable: true }),
    __metadata("design:type", String)
], TicketMaintenance.prototype, "batimentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salle_id', nullable: true }),
    __metadata("design:type", String)
], TicketMaintenance.prototype, "salleId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TicketMaintenance.prototype, "titre", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TicketMaintenance.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_maintenance', default: 'curative' }),
    __metadata("design:type", String)
], TicketMaintenance.prototype, "typeMaintenance", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'normale' }),
    __metadata("design:type", String)
], TicketMaintenance.prototype, "priorite", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'ouvert' }),
    __metadata("design:type", String)
], TicketMaintenance.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'signale_par' }),
    __metadata("design:type", String)
], TicketMaintenance.prototype, "signalePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigne_a', nullable: true }),
    __metadata("design:type", String)
], TicketMaintenance.prototype, "assigneA", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_signalement', default: () => 'NOW()' }),
    __metadata("design:type", Date)
], TicketMaintenance.prototype, "dateSignalement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_resolution', nullable: true }),
    __metadata("design:type", Date)
], TicketMaintenance.prototype, "dateResolution", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photos_url', type: 'jsonb', default: [] }),
    __metadata("design:type", Object)
], TicketMaintenance.prototype, "photosUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cout_reparation', nullable: true, type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], TicketMaintenance.prototype, "coutReparation", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TicketMaintenance.prototype, "observations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TicketMaintenance.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], TicketMaintenance.prototype, "updatedAt", void 0);
exports.TicketMaintenance = TicketMaintenance = __decorate([
    (0, typeorm_1.Entity)('ticket_maintenance')
], TicketMaintenance);
let ReservationSalle = class ReservationSalle {
};
exports.ReservationSalle = ReservationSalle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ReservationSalle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salle_id' }),
    __metadata("design:type", String)
], ReservationSalle.prototype, "salleId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ReservationSalle.prototype, "titre", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ReservationSalle.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_reservation' }),
    __metadata("design:type", Date)
], ReservationSalle.prototype, "dateReservation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'heure_debut', type: 'time' }),
    __metadata("design:type", String)
], ReservationSalle.prototype, "heureDebut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'heure_fin', type: 'time' }),
    __metadata("design:type", String)
], ReservationSalle.prototype, "heureFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'demande_par' }),
    __metadata("design:type", String)
], ReservationSalle.prototype, "demandePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approuve_par', nullable: true }),
    __metadata("design:type", String)
], ReservationSalle.prototype, "approuvePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'en_attente' }),
    __metadata("design:type", String)
], ReservationSalle.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ReservationSalle.prototype, "createdAt", void 0);
exports.ReservationSalle = ReservationSalle = __decorate([
    (0, typeorm_1.Entity)('reservation_salle')
], ReservationSalle);
let Stock = class Stock {
};
exports.Stock = Stock;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Stock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Stock.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Stock.prototype, "libelle", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Stock.prototype, "categorie", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Stock.prototype, "unite", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'quantite_stock', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Stock.prototype, "quantiteStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'seuil_alerte', type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Stock.prototype, "seuilAlerte", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prix_unitaire', nullable: true, type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Stock.prototype, "prixUnitaire", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Stock.prototype, "fournisseur", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Stock.prototype, "emplacement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'derniere_mise_a_jour', default: () => 'NOW()' }),
    __metadata("design:type", Date)
], Stock.prototype, "derniereMiseAJour", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Stock.prototype, "createdAt", void 0);
exports.Stock = Stock = __decorate([
    (0, typeorm_1.Entity)('stock')
], Stock);
let MouvementStock = class MouvementStock {
};
exports.MouvementStock = MouvementStock;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MouvementStock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stock_id' }),
    __metadata("design:type", String)
], MouvementStock.prototype, "stockId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_mouvement' }),
    __metadata("design:type", String)
], MouvementStock.prototype, "typeMouvement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], MouvementStock.prototype, "quantite", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MouvementStock.prototype, "motif", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_doc', nullable: true }),
    __metadata("design:type", String)
], MouvementStock.prototype, "referenceDoc", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'utilisateur_id', nullable: true }),
    __metadata("design:type", String)
], MouvementStock.prototype, "utilisateurId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_mouvement', default: () => 'NOW()' }),
    __metadata("design:type", Date)
], MouvementStock.prototype, "dateMouvement", void 0);
exports.MouvementStock = MouvementStock = __decorate([
    (0, typeorm_1.Entity)('mouvement_stock')
], MouvementStock);
let PlanningEntretien = class PlanningEntretien {
};
exports.PlanningEntretien = PlanningEntretien;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PlanningEntretien.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'salle_id', nullable: true }),
    __metadata("design:type", String)
], PlanningEntretien.prototype, "salleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batiment_id', nullable: true }),
    __metadata("design:type", String)
], PlanningEntretien.prototype, "batimentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PlanningEntretien.prototype, "zone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_nettoyage' }),
    __metadata("design:type", String)
], PlanningEntretien.prototype, "typeNettoyage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'responsable_id', nullable: true }),
    __metadata("design:type", String)
], PlanningEntretien.prototype, "responsableId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'jour_semaine', nullable: true }),
    __metadata("design:type", Number)
], PlanningEntretien.prototype, "jourSemaine", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'heure_debut', type: 'time', nullable: true }),
    __metadata("design:type", String)
], PlanningEntretien.prototype, "heureDebut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duree_minutes', nullable: true }),
    __metadata("design:type", Number)
], PlanningEntretien.prototype, "dureeMinutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, name: 'actif' }),
    __metadata("design:type", Boolean)
], PlanningEntretien.prototype, "actif", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PlanningEntretien.prototype, "createdAt", void 0);
exports.PlanningEntretien = PlanningEntretien = __decorate([
    (0, typeorm_1.Entity)('planning_entretien')
], PlanningEntretien);
let RapportEntretien = class RapportEntretien {
};
exports.RapportEntretien = RapportEntretien;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RapportEntretien.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'planning_id', nullable: true }),
    __metadata("design:type", String)
], RapportEntretien.prototype, "planningId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'realise_par' }),
    __metadata("design:type", String)
], RapportEntretien.prototype, "realisePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_realisation', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], RapportEntretien.prototype, "dateRealisation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'heure_debut', type: 'time', nullable: true }),
    __metadata("design:type", String)
], RapportEntretien.prototype, "heureDebut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'heure_fin', type: 'time', nullable: true }),
    __metadata("design:type", String)
], RapportEntretien.prototype, "heureFin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'realise' }),
    __metadata("design:type", String)
], RapportEntretien.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], RapportEntretien.prototype, "observations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RapportEntretien.prototype, "createdAt", void 0);
exports.RapportEntretien = RapportEntretien = __decorate([
    (0, typeorm_1.Entity)('rapport_entretien')
], RapportEntretien);
//# sourceMappingURL=logistics.entities.js.map