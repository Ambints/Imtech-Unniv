import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TypePartenaire {
  EGLISE = 'eglise',
  DIOCESE = 'diocese',
  ETAT = 'etat',
  ENTREPRISE = 'entreprise',
  UNIVERSITE = 'universite'
}

export class SignConventionDto {
  @ApiProperty({
    description: 'Code PIN ou hash de la cle privee du president pour la signature',
    example: '123456'
  })
  @IsString()
  @IsNotEmpty()
  codeSignature: string;

  @ApiProperty({
    description: 'Nom du representant du partenaire',
    example: 'Monseigneur Jean DUPONT'
  })
  @IsString()
  @IsNotEmpty()
  representantPartenaire: string;

  @ApiProperty({
    description: 'Date d\'effet de la convention',
    example: '2024-09-01'
  })
  @IsDateString()
  @IsNotEmpty()
  dateEffet: string;

  @ApiPropertyOptional({
    description: 'Remarques du president sur la convention',
    example: 'Convention signee sous reserve de validation du conseil universitaire'
  })
  @IsOptional()
  @IsString()
  remarques?: string;
}

// Made with Bob
