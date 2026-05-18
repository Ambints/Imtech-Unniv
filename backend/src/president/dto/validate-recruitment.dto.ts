import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DecisionRecrutement {
  APPROUVE = 'approuve',
  REJETE = 'rejete',
  EN_ATTENTE = 'en_attente'
}

export class ValidateRecruitmentDto {
  @ApiProperty({
    description: 'Décision du président sur le recrutement',
    enum: DecisionRecrutement,
    example: DecisionRecrutement.APPROUVE
  })
  @IsEnum(DecisionRecrutement)
  @IsNotEmpty()
  decision: DecisionRecrutement;

  @ApiProperty({
    description: 'Commentaire du président sur la décision',
    example: 'Recrutement approuvé sous réserve de la validation du budget'
  })
  @IsString()
  @IsNotEmpty()
  commentaire: string;

  @ApiPropertyOptional({
    description: 'Conditions spéciales imposées par le président',
    example: 'Période d\'essai de 6 mois'
  })
  @IsOptional()
  @IsString()
  conditionsSpeciales?: string;
}

// Made with Bob
