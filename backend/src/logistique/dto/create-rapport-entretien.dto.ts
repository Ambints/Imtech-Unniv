import { IsString, IsOptional, IsUUID, IsIn, IsDateString } from 'class-validator';

export class CreateRapportEntretienDto {
  @IsOptional()
  @IsUUID()
  planning_id?: string;

  @IsUUID()
  realise_par: string;

  @IsDateString()
  date_realisation: string;

  @IsOptional()
  @IsString()
  heure_debut?: string; // HH:MM

  @IsOptional()
  @IsString()
  heure_fin?: string; // HH:MM

  @IsIn(['realise', 'partiel', 'non_realise'])
  statut: string;

  @IsOptional()
  @IsString()
  observations?: string;
}

// Made with Bob
