import { IsOptional, IsString, IsUUID, IsDateString, IsArray } from 'class-validator';

export class UpdateDeliberationDto {
  @IsOptional()
  @IsUUID()
  sessionExamenId?: string;

  @IsOptional()
  @IsUUID()
  parcoursId?: string;

  @IsOptional()
  @IsString()
  observationsGenerales?: string;

  @IsOptional()
  @IsString()
  rapportDeliberation?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  membresJury?: string[];
}
