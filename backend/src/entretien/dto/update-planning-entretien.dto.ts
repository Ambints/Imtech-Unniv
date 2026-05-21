import { IsUUID, IsOptional, IsString, IsIn, IsInt, Min, Max, Matches, IsBoolean } from 'class-validator';

export class UpdatePlanningEntretienDto {
  @IsOptional()
  @IsUUID()
  salle_id?: string;

  @IsOptional()
  @IsUUID()
  batiment_id?: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsOptional()
  @IsIn(['quotidien', 'hebdomadaire', 'mensuel', 'apres_evenement', 'desinfection'])
  type_nettoyage?: string;

  @IsOptional()
  @IsUUID()
  responsable_id?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  jour_semaine?: number;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'heure_debut doit être au format HH:MM',
  })
  heure_debut?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  duree_minutes?: number;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}

// Made with Bob
