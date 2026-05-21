import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Décisions possibles pour l'arbitrage disciplinaire
 * Basé sur le schéma BD.sql - table conseil_discipline
 */
export enum DecisionDiscipline {
  AVERTISSEMENT = 'avertissement',
  SUSPENSION_TEMPORAIRE = 'suspension_temporaire',
  EXCLUSION_DEFINITIVE = 'exclusion_definitive',
  CLASSEMENT_SANS_SUITE = 'classement_sans_suite'
}

export class ArbitrateDisciplineDto {
  @ApiProperty({
    description: 'Décision finale du président sur le conseil de discipline',
    enum: DecisionDiscipline,
    example: DecisionDiscipline.AVERTISSEMENT
  })
  @IsEnum(DecisionDiscipline)
  @IsNotEmpty()
  decision: DecisionDiscipline;

  @ApiProperty({
    description: 'Motivation détaillée de la décision présidentielle',
    example: 'Compte tenu de la gravité des faits et des antécédents de l\'étudiant, un avertissement est prononcé.'
  })
  @IsString()
  @IsNotEmpty()
  motivationDecision: string;

  @ApiPropertyOptional({
    description: 'Durée de la suspension en jours (requis si decision = suspension_temporaire)',
    example: 15,
    minimum: 1,
    maximum: 365
  })
  @IsOptional()
  @IsNumber()
  dureeSuspensionJours?: number;

  @ApiPropertyOptional({
    description: 'Indique si les parents doivent être notifiés de la décision',
    example: true,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  notifierParents?: boolean;
}

// Made with Bob
