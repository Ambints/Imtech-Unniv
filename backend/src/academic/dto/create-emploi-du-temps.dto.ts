import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateEmploiDuTempsDto {
  @IsString()
  @IsNotEmpty()
  titre: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  anneeAcademique: string;

  @IsNumber()
  semestre: number;

  @IsString()
  @IsNotEmpty()
  parcoursId: string;

  @IsOptional()
  publie?: boolean;
}
