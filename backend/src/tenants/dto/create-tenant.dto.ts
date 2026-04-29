import { IsString, IsOptional, IsEmail, IsUrl, Length, Matches, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ description: 'Nom de l\'université', example: 'Université Catholique Saint-Paul' })
  @IsString()
  @Length(2, 200)
  nom: string;

  @ApiProperty({ description: 'Slug unique pour le sous-domaine', example: 'saint-paul' })
  @IsString()
  @Length(2, 100)
  @Matches(/^[a-z0-9-]+$/, { message: 'Le slug doit contenir uniquement des minuscules, chiffres et tirets' })
  slug: string;

  @ApiPropertyOptional({ description: 'Slogan de l\'université', example: 'Science & Foi au service de l\'Homme' })
  @IsString()
  @IsOptional()
  @Length(0, 255)
  slogan?: string;

  @ApiPropertyOptional({ description: 'URL du logo', example: 'https://cdn.imtech.edu/logos/saint-paul.png' })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Couleur principale (hex)', example: '#1a7a4a' })
  @IsString()
  @Length(7, 7)
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Format hexadécimal requis (ex: #1a7a4a)' })
  @IsOptional()
  couleurPrincipale?: string;

  @ApiPropertyOptional({ description: 'Couleur secondaire (hex)', example: '#1565c0' })
  @IsString()
  @Length(7, 7)
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Format hexadécimal requis (ex: #1565c0)' })
  @IsOptional()
  couleurSecondaire?: string;

  @ApiPropertyOptional({ description: 'Couleur d\'accent (hex)', example: '#e65100' })
  @IsString()
  @Length(7, 7)
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Format hexadécimal requis (ex: #e65100)' })
  @IsOptional()
  couleurAccent?: string;

  @ApiPropertyOptional({ description: 'Couleur du texte (hex)', example: '#ffffff' })
  @IsString()
  @Length(7, 7)
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Format hexadécimal requis (ex: #ffffff)' })
  @IsOptional()
  couleurTexte?: string;

  @ApiPropertyOptional({ description: 'HTML de l\'en-tête des documents officiels' })
  @IsString()
  @IsOptional()
  enteteDocument?: string;

  @ApiPropertyOptional({ description: 'Adresse complète' })
  @IsString()
  @IsOptional()
  adresse?: string;

  @ApiPropertyOptional({ description: 'Pays', example: 'Madagascar' })
  @IsString()
  @IsOptional()
  @Length(0, 100)
  pays?: string;

  @ApiPropertyOptional({ description: 'Téléphone de contact', example: '+261 20 22 123 45' })
  @IsString()
  @IsOptional()
  @Length(0, 30)
  telephone?: string;

  @ApiPropertyOptional({ description: 'Email de contact', example: 'contact@saint-paul.edu' })
  @IsEmail()
  @IsOptional()
  emailContact?: string;

  @ApiPropertyOptional({ description: 'Site web', example: 'https://www.saint-paul.edu' })
  @IsUrl({}, { message: 'Format d\'URL invalide' })
  @IsOptional()
  siteWeb?: string;

  @ApiPropertyOptional({ description: 'Type d\'établissement', example: 'catholique' })
  @IsString()
  @IsOptional()
  @Length(0, 50)
  typeEtablissement?: string;

  // Subscription fields
  @ApiPropertyOptional({ description: 'Plan d\'abonnement', enum: ['basic', 'standard', 'premium', 'enterprise'], example: 'basic' })
  @IsString()
  @IsOptional()
  @IsEnum(['basic', 'standard', 'premium', 'enterprise'])
  planAbonnement?: string;

  @ApiPropertyOptional({ description: 'Statut de l\'abonnement', enum: ['active', 'expired', 'suspended'], example: 'active' })
  @IsString()
  @IsOptional()
  @IsEnum(['active', 'expired', 'suspended'])
  statutAbonnement?: string;

  @ApiPropertyOptional({ description: 'Date de début de l\'abonnement', example: '2024-01-01' })
  @IsDateString()
  @IsOptional()
  dateDebutAbonnement?: string;

  @ApiPropertyOptional({ description: 'Date de fin de l\'abonnement', example: '2024-12-31' })
  @IsDateString()
  @IsOptional()
  dateFinAbonnement?: string;

  @ApiPropertyOptional({ description: 'Prix mensuel (en Ariary)', example: 50000 })
  @IsNumber()
  @IsOptional()
  prixMensuel?: number;

  @ApiPropertyOptional({ description: 'Nombre maximum d\'utilisateurs', example: 100 })
  @IsNumber()
  @IsOptional()
  maxUtilisateurs?: number;
}
