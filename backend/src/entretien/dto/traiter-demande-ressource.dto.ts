import { IsIn, IsOptional, IsString } from 'class-validator';

export class TraiterDemandeRessourceDto {
  @IsIn(['approuvee', 'rejetee'])
  statut: string;

  @IsOptional()
  @IsString()
  commentaire_rejet?: string;
}

// Made with Bob
