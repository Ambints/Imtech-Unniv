import { IsUUID, IsArray, IsOptional } from 'class-validator';

export class SaisieNotesMassiveDto {
  @IsUUID()
  sessionId: string;

  @IsUUID()
  @IsOptional()
  ecId?: string;

  @IsArray()
  notes: Array<{
    etudiantId: string;
    valeur: number;
    absenceJustifiee?: boolean;
    observations?: string;
  }>;

  @IsUUID()
  userId: string;
}
