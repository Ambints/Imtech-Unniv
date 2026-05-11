import { IsString, IsEnum, IsOptional, IsNotEmpty, IsEmail } from 'class-validator';

export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  matricule?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  nom?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  prenom?: string;

  @IsString()
  @IsOptional()
  dateNaissance?: string;

  @IsString()
  @IsOptional()
  lieuNaissance?: string;

  @IsEnum(['M', 'F'])
  @IsOptional()
  sexe?: 'M' | 'F';

  @IsEmail()
  @IsOptional()
  email?: string;

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

  @IsEnum(['actif', 'suspendu', 'diplome', 'abandon'])
  @IsOptional()
  statut?: 'actif' | 'suspendu' | 'diplome' | 'abandon';

  @IsString()
  @IsOptional()
  parcoursId?: string;
}
