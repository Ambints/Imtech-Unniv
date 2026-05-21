import { IsOptional, IsIn, IsUUID, IsNumber, Min, IsString } from 'class-validator';

export class UpdateTicketMaintenanceDto {
  @IsOptional()
  @IsIn(['ouvert', 'en_cours', 'resolu', 'ferme', 'annule'])
  statut?: string;

  @IsOptional()
  @IsIn(['basse', 'normale', 'haute', 'urgente'])
  priorite?: string;

  @IsOptional()
  @IsUUID()
  assigne_a?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cout_reparation?: number;

  @IsOptional()
  @IsString()
  observations?: string;
}

// Made with Bob
