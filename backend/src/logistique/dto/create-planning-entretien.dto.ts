import { IsString, IsOptional, IsUUID, IsIn, IsInt, Min, Max } from 'class-validator';

export class CreatePlanningEntretienDto {
  @IsOptional()
  @IsUUID()
  salle_id?: string;

  @IsOptional()
  @IsUUID()
  batiment_id?: string;

  @IsOptional()
  @IsString()
  zone?: string;

  @IsIn(['quotidien', 'hebdomadaire', 'mensuel', 'apres_evenement', 'desinfection'])
  type_nettoyage: string;

  @IsOptional()
  @IsUUID()
  responsable_id?: string;

  @IsInt()
  @Min(1)
  @Max(7)
  jour_semaine: number;

  @IsOptional()
  @IsString()
  heure_debut?: string; // format HH:MM

  @IsOptional()
  @IsInt()
  @Min(15)
  duree_minutes?: number;
}

// Made with Bob
