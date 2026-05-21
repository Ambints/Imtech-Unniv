import { IsOptional, IsUUID, IsString, IsDateString, IsIn, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BudgetFiltersDto {
  @IsUUID()
  @IsOptional()
  annee_academique_id?: string;

  @IsUUID()
  @IsOptional()
  departement_id?: string;

  @IsString()
  @IsOptional()
  categorie?: string;

  @IsString()
  @IsOptional()
  search?: string;
}

export class DepenseFiltersDto {
  @IsUUID()
  @IsOptional()
  annee_academique_id?: string;

  @IsIn(['en_attente', 'approuve', 'paye', 'rejete'])
  @IsOptional()
  statut?: string;

  @IsString()
  @IsOptional()
  categorie?: string;

  @IsString()
  @IsOptional()
  fournisseur?: string;

  @IsDateString()
  @IsOptional()
  date_debut?: string;

  @IsDateString()
  @IsOptional()
  date_fin?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}

export class RecouvrementFiltersDto {
  @IsUUID()
  @IsOptional()
  annee_academique_id?: string;

  @IsUUID()
  @IsOptional()
  parcours_id?: string;

  @IsString()
  @IsOptional()
  niveau?: string;

  @IsString()
  @IsOptional()
  search?: string;
}

export class RapportFiltersDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsDateString()
  @IsOptional()
  date_debut?: string;

  @IsDateString()
  @IsOptional()
  date_fin?: string;

  @IsUUID()
  @IsOptional()
  annee_academique_id?: string;

  @IsIn(['journalier', 'mensuel', 'annuel'])
  @IsOptional()
  type?: string;
}

// Made with Bob
