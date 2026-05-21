import { IsString, IsNotEmpty, IsIn, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateStockEntretienDto {
  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsNotEmpty()
  libelle: string;

  @IsIn(['bureau', 'nettoyage', 'informatique', 'pedagogique', 'energie', 'autre'])
  categorie: string;

  @IsString()
  @IsNotEmpty()
  unite: string;

  @IsNumber()
  @Min(0)
  quantite_stock: number;

  @IsNumber()
  @Min(0)
  seuil_alerte: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prix_unitaire?: number;

  @IsOptional()
  @IsString()
  fournisseur?: string;

  @IsOptional()
  @IsString()
  emplacement?: string;
}

// Made with Bob
