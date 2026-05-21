import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class UpdateBudgetDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  montant_prevu?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  montant_realise?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

// Made with Bob
