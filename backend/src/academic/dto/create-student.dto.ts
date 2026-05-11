import { IsString, IsEnum, IsOptional, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  matricule: string;

  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  @IsString()
  @IsNotEmpty()
  dateNaissance: string;

  @IsString()
  @IsOptional()
  lieuNaissance?: string;

  @IsEnum(['M', 'F'])
  sexe: 'M' | 'F';

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsString()
  @IsOptional()
  adresse?: string;

  @IsString()
  @IsOptional()
  nationalite?: string;

  @IsEnum(['aucune', 'demi', 'entiere'])
  @IsOptional()
  typeBourse?: 'aucune' | 'demi' | 'entiere';

  @IsEnum(['celibataire', 'marie', 'divorce', 'veuf'])
  @IsOptional()
  situationFamiliale?: 'celibataire' | 'marie' | 'divorce' | 'veuf';

  @IsString()
  @IsOptional()
  parcoursId?: string;
}
