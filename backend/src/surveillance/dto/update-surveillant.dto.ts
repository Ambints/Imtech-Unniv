import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSurveillantDto {
  @ApiPropertyOptional({ description: 'Nom du surveillant' })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiPropertyOptional({ description: 'Prénom du surveillant' })
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiPropertyOptional({ description: 'Email du surveillant' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Téléphone du surveillant' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ description: 'Type de contrat' })
  @IsOptional()
  @IsEnum(['permanent', 'vacataire', 'contractuel'])
  type_contrat?: string;

  @ApiPropertyOptional({ description: 'Statut actif' })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @ApiPropertyOptional({ description: 'Spécialité' })
  @IsOptional()
  @IsString()
  specialite?: string;
}
