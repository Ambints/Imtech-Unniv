import { IsOptional, IsNumber, IsString, IsBoolean } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsNumber()
  valeur?: number;

  @IsOptional()
  @IsBoolean()
  absenceJustifiee?: boolean;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  userId?: string;
}
