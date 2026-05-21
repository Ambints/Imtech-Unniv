import { IsOptional, IsIn, IsString } from 'class-validator';

export class UpdateReservationSalleDto {
  @IsOptional()
  @IsIn(['en_attente', 'approuvee', 'refusee', 'annulee'])
  statut?: string;

  @IsOptional()
  @IsString()
  commentaire_rejet?: string;
}

// Made with Bob
