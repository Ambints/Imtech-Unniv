import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateInscriptionDto {
  @IsString()
  @IsNotEmpty()
  etudiantId: string;

  @IsString()
  @IsNotEmpty()
  parcoursId: string;

  @IsString()
  @IsNotEmpty()
  anneeAcademiqueId: string;

  @IsNumber()
  semestre: number;

  @IsNumber()
  niveau: number;
}
