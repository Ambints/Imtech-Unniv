import { IsString, IsUUID, IsEnum, IsOptional, IsBoolean, IsNumber, IsDateString, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTOs pour la surveillance avec validation complète
 */

export class GenerateQRDto {
  @IsUUID()
  seanceId: string;

  @IsUUID()
  etudiantId: string;
}

export class ScanQRDto {
  @IsString()
  codeQr: string;

  @IsOptional()
  @IsString()
  localisation?: string;
}

export enum StatutPresence {
  PRESENT = 'present',
  ABSENT = 'absent',
  RETARD = 'retard',
  SORTIE_ANTICIPEE = 'sortie_anticipee',
}

export class PointageManuelDto {
  @IsUUID()
  etudiantId: string;

  @IsUUID()
  seanceId: string;

  @IsEnum(StatutPresence)
  statut: StatutPresence;

  @IsOptional()
  @IsString()
  heureArrivee?: string;

  @IsOptional()
  @IsString()
  heureDepart?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class ValidationJustificationDto {
  @IsUUID()
  presenceId: string;

  @IsBoolean()
  accepte: boolean;

  @IsOptional()
  @IsString()
  motifRefus?: string;
}

export class UploadJustificatifDto {
  @IsUUID()
  presenceId: string;

  @IsString()
  justificatifUrl: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export enum TypeSanction {
  AVERTISSEMENT = 'avertissement',
  BLAME = 'blame',
  EXCLUSION_TEMPORAIRE = 'exclusion_temporaire',
  EXCLUSION_DEFINITIVE = 'exclusion_definitive',
  TRAVAIL_COMMUNAUTAIRE = 'travail_communautaire',
}

export class CreateSanctionDto {
  @IsUUID()
  etudiantId: string;

  @IsOptional()
  @IsUUID()
  incidentId?: string;

  @IsEnum(TypeSanction)
  type: TypeSanction;

  @IsDateString()
  dateDebut: Date;

  @IsOptional()
  @IsDateString()
  dateFin?: Date;

  @IsString()
  motif: string;

  @IsOptional()
  @IsString()
  observations?: string;
}

export enum GraviteIncident {
  MINEURE = 'mineure',
  MOYENNE = 'moyenne',
  MAJEURE = 'majeure',
  CRITIQUE = 'critique',
}

export class CreateIncidentDto {
  @IsUUID()
  etudiantId: string;

  @IsDateString()
  dateIncident: Date;

  @IsString()
  lieu: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  temoins?: string;

  @IsEnum(GraviteIncident)
  gravite: GraviteIncident;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class CreateAvertissementDto {
  @IsUUID()
  etudiantId: string;

  @IsNumber()
  @Min(1)
  @Max(3)
  niveau: number;

  @IsString()
  motif: string;

  @IsOptional()
  @IsString()
  observations?: string;
}

export class ConfigurerSalleExamenDto {
  @IsUUID()
  sessionExamenId: string;

  @IsUUID()
  salleId: string;

  @IsNumber()
  @Min(1)
  placesTotal: number;

  @IsOptional()
  @IsArray()
  planPlaces?: any[];
}

export class AttribuerPlaceDto {
  @IsUUID()
  etudiantId: string;

  @IsString()
  place: string;

  @IsString()
  rangee: string;
}

export class SignalerIncidentExamenDto {
  @IsString()
  rapport: string;

  @IsOptional()
  @IsArray()
  etudiantsImpliques?: string[];
}

export enum TypeAlerte {
  ABSENCE_REPETEE = 'absence_repetee',
  RETARD_CUMULE = 'retard_cumule',
  SANCTION_GRAVE = 'sanction_grave',
  INCIDENT_CRITIQUE = 'incident_critique',
}

export class CreateAlerteDto {
  @IsUUID()
  etudiantId: string;

  @IsEnum(TypeAlerte)
  type: TypeAlerte;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  destinataireRole?: string;
}

/**
 * DTOs pour l'encadrement moral
 */
export class CreateSuiviMoralDto {
  @IsUUID()
  etudiantId: string;

  @IsDateString()
  dateEntretien: Date;

  @IsString()
  sujet: string;

  @IsString()
  observations: string;

  @IsOptional()
  @IsString()
  recommandations?: string;

  @IsOptional()
  @IsBoolean()
  parentInforme?: boolean;
}

export class UpdateSuiviMoralDto {
  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsString()
  recommandations?: string;

  @IsOptional()
  @IsBoolean()
  parentInforme?: boolean;

  @IsOptional()
  @IsString()
  suiviPar?: string;
}

/**
 * DTOs pour les autorisations de sortie
 */
export enum TypeAutorisation {
  SORTIE_ANTICIPEE = 'sortie_anticipee',
  ABSENCE_PREVUE = 'absence_prevue',
  SORTIE_EXCEPTIONNELLE = 'sortie_exceptionnelle',
}

export class CreateAutorisationSortieDto {
  @IsUUID()
  etudiantId: string;

  @IsEnum(TypeAutorisation)
  type: TypeAutorisation;

  @IsDateString()
  dateDebut: Date;

  @IsDateString()
  dateFin: Date;

  @IsString()
  motif: string;

  @IsOptional()
  @IsString()
  autorisationParentaleUrl?: string;

  @IsOptional()
  @IsBoolean()
  estMineur?: boolean;
}

export class ValiderAutorisationDto {
  @IsBoolean()
  approuve: boolean;

  @IsOptional()
  @IsString()
  motifRefus?: string;

  @IsOptional()
  @IsString()
  observations?: string;
}

/**
 * DTO pour le calcul d'assiduité
 */
export class CalculerAssiduitDto {
  @IsUUID()
  etudiantId: string;

  @IsOptional()
  @IsDateString()
  dateDebut?: Date;

  @IsOptional()
  @IsDateString()
  dateFin?: Date;

  @IsOptional()
  @IsUUID()
  parcoursId?: string;
}

// Made with Bob