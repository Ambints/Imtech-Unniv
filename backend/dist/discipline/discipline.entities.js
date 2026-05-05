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
exports.Avertissement = exports.Sanction = exports.Incident = void 0;
const typeorm_1 = require("typeorm");
let Incident = class Incident {
};
exports.Incident = Incident;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Incident.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'etudiant_id' }),
    __metadata("design:type", String)
], Incident.prototype, "etudiantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_incident', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], Incident.prototype, "dateIncident", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Incident.prototype, "lieu", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Incident.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'temoins', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Incident.prototype, "temoins", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'gravite', default: 'mineure' }),
    __metadata("design:type", String)
], Incident.prototype, "gravite", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'en_attente' }),
    __metadata("design:type", String)
], Incident.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'declare_par' }),
    __metadata("design:type", String)
], Incident.prototype, "declarePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'valide_par', nullable: true }),
    __metadata("design:type", String)
], Incident.prototype, "validePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_validation', nullable: true }),
    __metadata("design:type", Date)
], Incident.prototype, "dateValidation", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Incident.prototype, "observations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Incident.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Incident.prototype, "updatedAt", void 0);
exports.Incident = Incident = __decorate([
    (0, typeorm_1.Entity)('incident')
], Incident);
let Sanction = class Sanction {
};
exports.Sanction = Sanction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Sanction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'etudiant_id' }),
    __metadata("design:type", String)
], Sanction.prototype, "etudiantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'incident_id', nullable: true }),
    __metadata("design:type", String)
], Sanction.prototype, "incidentId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Sanction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_debut' }),
    __metadata("design:type", Date)
], Sanction.prototype, "dateDebut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_fin', nullable: true }),
    __metadata("design:type", Date)
], Sanction.prototype, "dateFin", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Sanction.prototype, "motif", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'decide_par' }),
    __metadata("design:type", String)
], Sanction.prototype, "decidePar", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'en_cours' }),
    __metadata("design:type", String)
], Sanction.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_notification', nullable: true }),
    __metadata("design:type", Date)
], Sanction.prototype, "dateNotification", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_notifie', default: false }),
    __metadata("design:type", Boolean)
], Sanction.prototype, "parentNotifie", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Sanction.prototype, "observations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Sanction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Sanction.prototype, "updatedAt", void 0);
exports.Sanction = Sanction = __decorate([
    (0, typeorm_1.Entity)('sanction')
], Sanction);
let Avertissement = class Avertissement {
};
exports.Avertissement = Avertissement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Avertissement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'etudiant_id' }),
    __metadata("design:type", String)
], Avertissement.prototype, "etudiantId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Avertissement.prototype, "niveau", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Avertissement.prototype, "motif", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'emis_par' }),
    __metadata("design:type", String)
], Avertissement.prototype, "emisPar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_emission', default: () => 'CURRENT_DATE' }),
    __metadata("design:type", Date)
], Avertissement.prototype, "dateEmission", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_lecture', nullable: true }),
    __metadata("design:type", Date)
], Avertissement.prototype, "dateLecture", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'elu_conseil', default: false }),
    __metadata("design:type", Boolean)
], Avertissement.prototype, "eluConseil", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_conseil', nullable: true }),
    __metadata("design:type", Date)
], Avertissement.prototype, "dateConseil", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'actif' }),
    __metadata("design:type", String)
], Avertissement.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Avertissement.prototype, "observations", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Avertissement.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Avertissement.prototype, "updatedAt", void 0);
exports.Avertissement = Avertissement = __decorate([
    (0, typeorm_1.Entity)('avertissement')
], Avertissement);
//# sourceMappingURL=discipline.entities.js.map