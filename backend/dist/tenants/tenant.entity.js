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
exports.Tenant = void 0;
const typeorm_1 = require("typeorm");
let Tenant = class Tenant {
};
exports.Tenant = Tenant;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Tenant.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, name: 'schema_name' }),
    __metadata("design:type", String)
], Tenant.prototype, "schemaName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], Tenant.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 100 }),
    __metadata("design:type", String)
], Tenant.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 255 }),
    __metadata("design:type", String)
], Tenant.prototype, "slogan", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'logo_url', nullable: true, length: 500 }),
    __metadata("design:type", String)
], Tenant.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'couleur_principale', default: '#1a7a4a', length: 7 }),
    __metadata("design:type", String)
], Tenant.prototype, "couleurPrincipale", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'couleur_secondaire', default: '#1565c0', length: 7 }),
    __metadata("design:type", String)
], Tenant.prototype, "couleurSecondaire", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'couleur_accent', default: '#e65100', length: 7 }),
    __metadata("design:type", String)
], Tenant.prototype, "couleurAccent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'couleur_texte', default: '#ffffff', length: 7 }),
    __metadata("design:type", String)
], Tenant.prototype, "couleurTexte", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'entete_document', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Tenant.prototype, "enteteDocument", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Tenant.prototype, "adresse", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Madagascar', length: 100 }),
    __metadata("design:type", String)
], Tenant.prototype, "pays", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 30 }),
    __metadata("design:type", String)
], Tenant.prototype, "telephone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_contact', nullable: true, length: 200 }),
    __metadata("design:type", String)
], Tenant.prototype, "emailContact", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'site_web', nullable: true, length: 300 }),
    __metadata("design:type", String)
], Tenant.prototype, "siteWeb", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_etablissement', default: 'catholique', length: 50 }),
    __metadata("design:type", String)
], Tenant.prototype, "typeEtablissement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actif', default: true }),
    __metadata("design:type", Boolean)
], Tenant.prototype, "actif", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'plan_abonnement', default: 'basic', length: 20 }),
    __metadata("design:type", String)
], Tenant.prototype, "planAbonnement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'statut_abonnement', default: 'active', length: 20 }),
    __metadata("design:type", String)
], Tenant.prototype, "statutAbonnement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_debut_abonnement', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Tenant.prototype, "dateDebutAbonnement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_fin_abonnement', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Tenant.prototype, "dateFinAbonnement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'prix_mensuel', type: 'decimal', precision: 10, scale: 2, default: 50000 }),
    __metadata("design:type", Number)
], Tenant.prototype, "prixMensuel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'max_utilisateurs', type: 'int', default: 100 }),
    __metadata("design:type", Number)
], Tenant.prototype, "maxUtilisateurs", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Tenant.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Tenant.prototype, "updatedAt", void 0);
exports.Tenant = Tenant = __decorate([
    (0, typeorm_1.Entity)({ name: 'tenant', schema: 'public' })
], Tenant);
//# sourceMappingURL=tenant.entity.js.map