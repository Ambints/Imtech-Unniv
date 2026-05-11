import { IsUUID, IsDateString, IsOptional, IsString, IsBoolean, IsNumber, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO pour récupérer l'emploi du temps
 */
export class GetEmploiDuTempsDto {
  @IsUUID()
  parcoursId: string;

  @IsDateString()
  dateDebut: string;

  @IsDateString()
  dateFin: string;
}

/**
 * DTO pour créer une séance
 */
export class CreateSeanceDto {
  @IsUUID()
  anneeAcademiqueId: string;

  @IsUUID()
  affectationId: string;

  @IsUUID()
  salleId: string;

  @IsDateString()
  dateSeance: string;

  @IsString()
  heureDebut: string;

  @IsString()
  heureFin: string;

  @IsOptional()
  @IsString()
  typeSeance?: string;
}

/**
 * DTO pour les inscriptions
 */
export class GetInscriptionsDto {
  @IsUUID()
  parcoursId: string;

  @IsOptional()
  @IsUUID()
  anneeAcademiqueId?: string;
}

/**
 * DTO pour les absences
 */
export class GetAbsencesDto {
  @IsOptional()
  @IsUUID()
  enseignantId?: string;

  @IsOptional()
  @IsString()
  statut?: string;
}

/**
 * DTO pour les notes dérogatoires
 */
export class GetNotesDerogatoiresDto {
  @IsOptional()
  @IsString()
  statut?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  soumisAScolarite?: boolean;
}

/**
 * DTO pour les demandes
 */
export class GetDemandesDto {
  @IsOptional()
  @IsString()
  statut?: string;
}

/**
 * DTO pour les PV à transmettre
 */
export class GetPVsATransmettreDto {
  @IsUUID()
  parcoursId: string;

  @IsOptional()
  @IsUUID()
  anneeAcademiqueId?: string;
}

/**
 * DTO pour les PV transmis
 */
export class GetPVsTransmisDto {
  @IsOptional()
  @IsUUID()
  parcoursId?: string;

  @IsOptional()
  @IsUUID()
  anneeAcademiqueId?: string;
}

/**
 * DTO pour récupérer les PV
 */
export class GetPVsDto {
  @IsOptional()
  @IsUUID()
  parcoursId?: string;

  @IsOptional()
  @IsUUID()
  anneeAcademiqueId?: string;

  @IsOptional()
  @IsString()
  statut?: string;
}

/**
 * DTO pour le dashboard
 */
export class GetDashboardDto {
  @IsUUID()
  parcoursId: string;
}

// Made with Bob

export class GetSallesDisponiblesDto {
  @IsDateString()
  dateSeance: string;

  @IsString()
  heureDebut: string;

  @IsString()
  heureFin: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capaciteMinimale?: number;
}

export class GetAbsencesAJustifierDto {
  @IsUUID()
  parcoursId: string;
}
