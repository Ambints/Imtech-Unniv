import { IsString, IsEmail, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResponsableDto {
  @ApiProperty({ description: 'Nom du responsable logistique' })
  @IsString()
  nom: string;

  @ApiProperty({ description: 'Prénom du responsable logistique' })
  @IsString()
  prenom: string;

  @ApiProperty({ description: 'Email du responsable logistique' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Téléphone du responsable logistique' })
  @IsString()
  telephone: string;

  @ApiPropertyOptional({ description: 'Type de contrat' })
  @IsOptional()
  @IsEnum(['permanent', 'contractuel'])
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
