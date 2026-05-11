import { IsString, IsEnum, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  intitule: string;

  @IsString()
  @IsNotEmpty()
  parcoursId: string;

  @IsEnum(['obligatoire', 'optionnelle'])
  typeUe: 'obligatoire' | 'optionnelle';

  @IsNumber()
  creditsEcts: number;

  @IsNumber()
  coefficient: number;

  @IsNumber()
  volumeCm: number;

  @IsNumber()
  volumeTd: number;

  @IsNumber()
  volumeTp: number;

  @IsNumber()
  semestre: number;

  @IsNumber()
  anneeNiveau: number;

  @IsString()
  @IsOptional()
  description?: string;
}
