import { IsUUID, IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateNoteDto {
  @IsUUID()
  etudiantId: string;

  @IsUUID()
  ecId: string;

  @IsUUID()
  sessionId: string;

  @IsNumber()
  @IsOptional()
  ueId?: string;

  @IsNumber()
  valeur: number;

  @IsString()
  @IsOptional()
  typeEvaluation?: string;

  @IsBoolean()
  @IsOptional()
  absenceJustifiee?: boolean;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsUUID()
  userId: string;
}
