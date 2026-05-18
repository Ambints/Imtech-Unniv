import { IsOptional, IsString, IsIn, Matches } from 'class-validator';

export class UpdateRapportEntretienDto {
  @IsOptional()
  @IsIn(['realise', 'partiel', 'non_realise'])
  statut?: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'heure_debut doit être au format HH:MM',
  })
  heure_debut?: string;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'heure_fin doit être au format HH:MM',
  })
  heure_fin?: string;
}

// Made with Bob
