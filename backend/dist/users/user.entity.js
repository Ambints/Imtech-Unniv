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
exports.User = void 0;
const typeorm_1 = require("typeorm");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 254 }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], User.prototype, "nom", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], User.prototype, "prenom", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 30 }),
    __metadata("design:type", String)
], User.prototype, "telephone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'photo_url', nullable: true, length: 500 }),
    __metadata("design:type", String)
], User.prototype, "photoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true, nullable: true }),
    __metadata("design:type", Boolean)
], User.prototype, "actif", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'email_verifie', default: false, nullable: true }),
    __metadata("design:type", Boolean)
], User.prototype, "emailVerifie", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'derniere_connexion', nullable: true, type: 'timestamptz' }),
    __metadata("design:type", Date)
], User.prototype, "derniereConnexion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token_reset', nullable: true, type: 'text' }),
    __metadata("design:type", String)
], User.prototype, "tokenReset", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token_reset_expiry', nullable: true, type: 'timestamptz' }),
    __metadata("design:type", Date)
], User.prototype, "tokenResetExpiry", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tenant_id', nullable: true, type: 'uuid' }),
    __metadata("design:type", String)
], User.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_reset_required', default: false, nullable: true }),
    __metadata("design:type", Boolean)
], User.prototype, "passwordResetRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_password_reset', nullable: true, type: 'timestamptz' }),
    __metadata("design:type", Date)
], User.prototype, "lastPasswordReset", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('utilisateur')
], User);
//# sourceMappingURL=user.entity.js.map