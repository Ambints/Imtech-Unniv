import { IsString, IsEnum, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateCourseDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  code?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  intitule?: string;

  @IsString()
  @IsOptional()
  parcoursId?: string;

  @IsEnum(['obligatoire', 'optionnelle'])
  @IsOptional()
  typeUe?: 'obligatoire' | 'optionnelle';

  @IsNumber()
  @IsOptional()
  creditsEcts?: number;

  @IsNumber()
  @IsOptional()
  coefficient?: number;

  @IsNumber()
  @IsOptional()
  volumeCm?: number;

  @IsNumber()
  @IsOptional()
  volumeTd?: number;

  @IsNumber()
  @IsOptional()
  volumeTp?: number;

  @IsNumber()
  @IsOptional()
  semestre?: number;

  @IsNumber()
  @IsOptional()
  anneeNiveau?: number;

  @IsString()
  @IsOptional()
  description?: string;
}
