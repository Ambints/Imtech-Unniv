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
exports.Message = exports.Notification = exports.Annonce = void 0;
const typeorm_1 = require("typeorm");
let Annonce = class Annonce {
};
exports.Annonce = Annonce;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Annonce.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Annonce.prototype, "titre", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Annonce.prototype, "contenu", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_annonce', default: 'information' }),
    __metadata("design:type", String)
], Annonce.prototype, "typeAnnonce", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'tous' }),
    __metadata("design:type", String)
], Annonce.prototype, "cible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parcours_id', nullable: true }),
    __metadata("design:type", String)
], Annonce.prototype, "parcoursId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Annonce.prototype, "publie", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_publication', nullable: true }),
    __metadata("design:type", Date)
], Annonce.prototype, "datePublication", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'date_expiration', nullable: true }),
    __metadata("design:type", Date)
], Annonce.prototype, "dateExpiration", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'auteur_id' }),
    __metadata("design:type", String)
], Annonce.prototype, "auteurId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photo_url', nullable: true }),
    __metadata("design:type", String)
], Annonce.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Annonce.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Annonce.prototype, "updatedAt", void 0);
exports.Annonce = Annonce = __decorate([
    (0, typeorm_1.Entity)('annonce')
], Annonce);
let Notification = class Notification {
};
exports.Notification = Notification;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Notification.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'utilisateur_id' }),
    __metadata("design:type", String)
], Notification.prototype, "utilisateurId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Notification.prototype, "titre", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Notification.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'type_notification', default: 'info' }),
    __metadata("design:type", String)
], Notification.prototype, "typeNotification", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Notification.prototype, "lue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lue_at', nullable: true }),
    __metadata("design:type", Date)
], Notification.prototype, "lueAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Notification.prototype, "lien", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Notification.prototype, "createdAt", void 0);
exports.Notification = Notification = __decorate([
    (0, typeorm_1.Entity)('notification')
], Notification);
let Message = class Message {
};
exports.Message = Message;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Message.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expediteur_id' }),
    __metadata("design:type", String)
], Message.prototype, "expediteurId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'destinataire_id' }),
    __metadata("design:type", String)
], Message.prototype, "destinataireId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Message.prototype, "sujet", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Message.prototype, "contenu", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Message.prototype, "lu", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lu_at', nullable: true }),
    __metadata("design:type", Date)
], Message.prototype, "luAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parent_id', nullable: true }),
    __metadata("design:type", String)
], Message.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Message.prototype, "createdAt", void 0);
exports.Message = Message = __decorate([
    (0, typeorm_1.Entity)('message')
], Message);
//# sourceMappingURL=communication.entities.js.map