import { IsUUID, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateDiplomeDto {
  @IsUUID()
  etudiantId: string;

  @IsUUID()
  inscriptionId: string;

  @IsOptional()
  @IsDateString()
  dateObtention?: string;

  @IsOptional()
  @IsString()
  lieuObtention?: string;

  @IsUUID()
  userId: string;
}
