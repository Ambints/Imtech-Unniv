import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateReservationSalleDto {
  @IsUUID()
  salle_id: string;

  @IsString()
  @IsNotEmpty()
  titre: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  date_reservation: string;

  @IsString()
  @IsNotEmpty()
  heure_debut: string; // HH:MM

  @IsString()
  @IsNotEmpty()
  heure_fin: string; // HH:MM

  @IsUUID()
  demande_par: string;
}

// Made with Bob
