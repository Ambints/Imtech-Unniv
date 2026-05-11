import { IsString, IsEnum, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';

export class UpdateSeanceDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  code?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  intitule?: string;

  @IsEnum(['cm', 'td', 'tp', 'examen', 'reunion'])
  @IsOptional()
  type?: 'cm' | 'td' | 'tp' | 'examen' | 'reunion';

  @IsDateString()
  @IsOptional()
  dateDebut?: string;

  @IsDateString()
  @IsOptional()
  dateFin?: string;

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

  @IsOptional()
  actif?: boolean;
}
