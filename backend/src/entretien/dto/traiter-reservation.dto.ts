import { IsIn, IsOptional, IsString } from 'class-validator';

export class TraiterReservationDto {
  @IsIn(['approuvee', 'refusee'])
  statut: string;

  @IsOptional()
  @IsString()
  motif_refus?: string;
}

// Made with Bob
