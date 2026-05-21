import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DecisionInvestissement {
  APPROUVE = 'approuve',
  REJETE = 'rejete',
  EN_ATTENTE = 'en_attente'
}

export class ValidateInvestmentDto {
  @ApiProperty({
    description: 'Décision du président sur l\'investissement',
    enum: DecisionInvestissement,
    example: DecisionInvestissement.APPROUVE
  })
  @IsEnum(DecisionInvestissement)
  @IsNotEmpty()
  decision: DecisionInvestissement;

  @ApiProperty({
    description: 'Motif de la décision',
    example: 'Investissement stratégique pour le développement de l\'université'
  })
  @IsString()
  @IsNotEmpty()
  motif: string;

  @ApiPropertyOptional({
    description: 'Montant ajusté par le président (si différent du montant initial)',
    example: 2000000
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  montantAjuste?: number;

  @ApiPropertyOptional({
    description: 'Conditions spéciales pour l\'investissement',
    example: 'Paiement échelonné sur 3 mois'
  })
  @IsOptional()
  @IsString()
  conditionsSpeciales?: string;
}

// Made with Bob
