import { IsIn, IsNumber, Min, IsOptional, IsString } from 'class-validator';

export class MouvementStockEntretienDto {
  @IsIn(['entree', 'sortie', 'ajustement'])
  type_mouvement: string;

  @IsNumber()
  @Min(0.01)
  quantite: number;

  @IsOptional()
  @IsString()
  motif?: string;

  @IsOptional()
  @IsString()
  reference_doc?: string;
}

// Made with Bob
