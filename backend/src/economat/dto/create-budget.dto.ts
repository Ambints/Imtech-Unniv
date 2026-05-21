import { IsUUID, IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateBudgetDto {
  @IsUUID()
  @IsOptional()
  annee_academique_id?: string;

  @IsUUID()
  @IsOptional()
  departement_id?: string;

  @IsString()
  categorie: string;

  @IsNumber()
  @Min(0)
  montant_prevu: number;

  @IsString()
  @IsOptional()
  description?: string;
}

// Made with Bob
