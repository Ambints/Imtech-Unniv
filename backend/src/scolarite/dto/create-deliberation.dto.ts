import { IsUUID, IsInt, IsDateString, IsOptional, IsArray, IsString } from 'class-validator';

export class CreateDeliberationDto {
  @IsUUID()
  sessionExamenId: string;

  @IsUUID()
  parcoursId: string;

  @IsInt()
  semestre: number;

  @IsInt()
  anneeNiveau: number;

  @IsDateString()
  dateDeliberation: string;

  @IsUUID()
  userId: string;

  @IsArray()
  @IsUUID(4, { each: true })
  @IsOptional()
  membresJury?: string[];

  @IsString()
  @IsOptional()
  observationsGenerales?: string;

  @IsString()
  @IsOptional()
  rapportDeliberation?: string;
}
