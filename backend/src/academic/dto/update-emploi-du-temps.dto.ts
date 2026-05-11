import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateEmploiDuTempsDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  titre?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  anneeAcademique?: string;

  @IsNumber()
  @IsOptional()
  semestre?: number;

  @IsString()
  @IsOptional()
  parcoursId?: string;

  @IsOptional()
  publie?: boolean;

  @IsString()
  @IsOptional()
  remarques?: string;

  @IsString()
  @IsOptional()
  fichierPdf?: string;
}
