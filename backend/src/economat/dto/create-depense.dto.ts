import { IsUUID, IsString, IsNumber, IsOptional, IsDateString, IsIn, Min } from 'class-validator';

export class CreateDepenseDto {
  @IsUUID()
  @IsOptional()
  budget_id?: string;

  @IsUUID()
  annee_academique_id: string;

  @IsString()
  libelle: string;

  @IsNumber()
  @Min(0.01)
  montant: number;

  @IsString()
  @IsOptional()
  categorie?: string;

  @IsDateString()
  @IsOptional()
  date_depense?: string;

  @IsString()
  @IsOptional()
  fournisseur?: string;

  @IsString()
  @IsOptional()
  numero_facture?: string;

  @IsString()
  @IsOptional()
  facture_url?: string;

  @IsString()
  @IsOptional()
  observations?: string;
}

// Made with Bob
