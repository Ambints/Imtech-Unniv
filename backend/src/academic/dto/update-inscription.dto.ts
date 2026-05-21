import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateInscriptionDto {
  @IsString()
  @IsOptional()
  etudiantId?: string;

  @IsString()
  @IsOptional()
  parcoursId?: string;

  @IsString()
  @IsOptional()
  anneeAcademiqueId?: string;

  @IsNumber()
  @IsOptional()
  semestre?: number;

  @IsNumber()
  @IsOptional()
  niveau?: number;

  @IsString()
  @IsOptional()
  statut?: 'en_cours' | 'valide' | 'ajourne';
}
