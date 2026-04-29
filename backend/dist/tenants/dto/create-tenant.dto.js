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
exports.CreateTenantDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateTenantDto {
}
exports.CreateTenantDto = CreateTenantDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nom de l\'université', example: 'Université Catholique Saint-Paul' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 200),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "nom", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Slug unique pour le sous-domaine', example: 'saint-paul' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 100),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, { message: 'Le slug doit contenir uniquement des minuscules, chiffres et tirets' }),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Slogan de l\'université', example: 'Science & Foi au service de l\'Homme' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 255),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "slogan", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL du logo', example: 'https://cdn.imtech.edu/logos/saint-paul.png' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "logoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Couleur principale (hex)', example: '#1a7a4a' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(7, 7),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, { message: 'Format hexadécimal requis (ex: #1a7a4a)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "couleurPrincipale", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Couleur secondaire (hex)', example: '#1565c0' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(7, 7),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, { message: 'Format hexadécimal requis (ex: #1565c0)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "couleurSecondaire", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Couleur d\'accent (hex)', example: '#e65100' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(7, 7),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, { message: 'Format hexadécimal requis (ex: #e65100)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "couleurAccent", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Couleur du texte (hex)', example: '#ffffff' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(7, 7),
    (0, class_validator_1.Matches)(/^#[0-9A-Fa-f]{6}$/, { message: 'Format hexadécimal requis (ex: #ffffff)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "couleurTexte", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'HTML de l\'en-tête des documents officiels' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "enteteDocument", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Adresse complète' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "adresse", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pays', example: 'Madagascar' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 100),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "pays", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Téléphone de contact', example: '+261 20 22 123 45' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 30),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "telephone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Email de contact', example: 'contact@saint-paul.edu' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "emailContact", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Site web', example: 'https://www.saint-paul.edu' }),
    (0, class_validator_1.IsUrl)({}, { message: 'Format d\'URL invalide' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "siteWeb", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Type d\'établissement', example: 'catholique' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Length)(0, 50),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "typeEtablissement", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Plan d\'abonnement', enum: ['basic', 'standard', 'premium', 'enterprise'], example: 'basic' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['basic', 'standard', 'premium', 'enterprise']),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "planAbonnement", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Statut de l\'abonnement', enum: ['active', 'expired', 'suspended'], example: 'active' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['active', 'expired', 'suspended']),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "statutAbonnement", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date de début de l\'abonnement', example: '2024-01-01' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "dateDebutAbonnement", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Date de fin de l\'abonnement', example: '2024-12-31' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTenantDto.prototype, "dateFinAbonnement", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Prix mensuel (en Ariary)', example: 50000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTenantDto.prototype, "prixMensuel", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nombre maximum d\'utilisateurs', example: 100 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateTenantDto.prototype, "maxUtilisateurs", void 0);
//# sourceMappingURL=create-tenant.dto.js.map