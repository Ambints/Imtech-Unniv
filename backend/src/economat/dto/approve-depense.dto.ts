import { IsString, IsOptional, IsIn, IsUUID } from 'class-validator';

export class ApproveDepenseDto {
  @IsIn(['approuve', 'rejete'])
  statut: 'approuve' | 'rejete';

  @IsString()
  @IsOptional()
  motif_decision?: string;

  @IsString()
  @IsOptional()
  conditions_speciales?: string;
}

export class ValidatePresidentDto {
  @IsUUID()
  @IsOptional()
  valide_par_president?: string;

  @IsString()
  @IsOptional()
  motif_decision?: string;
}

export class MarkAsPaidDto {
  @IsString()
  @IsOptional()
  observations?: string;
}

// Made with Bob
