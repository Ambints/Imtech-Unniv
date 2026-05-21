import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ActionParcours {
  OUVRIR = 'ouvrir',
  FERMER = 'fermer',
  SUSPENDRE = 'suspendre'
}

export class ValidateParcoursDto {
  @ApiProperty({
    description: 'Action a effectuer sur le parcours',
    enum: ActionParcours,
    example: ActionParcours.OUVRIR
  })
  @IsEnum(ActionParcours)
  @IsNotEmpty()
  action: ActionParcours;

  @ApiProperty({
    description: 'Motif de la decision',
    example: 'Ouverture du parcours suite a la demande du conseil universitaire'
  })
  @IsString()
  @IsNotEmpty()
  motif: string;

  @ApiPropertyOptional({
    description: 'Date d\'effet de la decision',
    example: '2024-09-01'
  })
  @IsOptional()
  @IsDateString()
  dateEffet?: string;

  @ApiPropertyOptional({
    description: 'Conditions particulieres',
    example: 'Effectif minimum de 20 etudiants requis'
  })
  @IsOptional()
  @IsString()
  conditions?: string;
}

// Made with Bob
