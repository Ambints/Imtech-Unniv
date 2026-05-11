import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';

export class CreateSeanceDto {
  @IsString()
  code: string;

  @IsString()
  intitule: string;

  @IsEnum(['cm', 'td', 'tp', 'examen', 'reunion'])
  type: 'cm' | 'td' | 'tp' | 'examen' | 'reunion';

  @IsDateString()
  dateDebut: string;

  @IsDateString()
  dateFin: string;

  @IsString()
  @IsOptional()
  salleId?: string;

  @IsString()
  @IsOptional()
  enseignantId?: string;

  @IsString()
  @IsOptional()
  ueId?: string;

  @IsString()
  @IsOptional()
  parcoursId?: string;

  @IsString()
  @IsOptional()
  emploiDuTempsId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
