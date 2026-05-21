import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSurveillantDto {
  @ApiProperty({ description: 'Nom du surveillant' })
  @IsString()
  nom: string;

  @ApiProperty({ description: 'Prénom du surveillant' })
  @IsString()
  prenom: string;

  @ApiProperty({ description: 'Email du surveillant' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Téléphone du surveillant' })
  @IsString()
  telephone: string;

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
