import { IsString, IsOptional, IsInt, IsIn, IsBoolean, Min } from 'class-validator';

export class UpdateSalleDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacite?: number;

  @IsOptional()
  @IsIn(['cours', 'amphitheatre', 'laboratoire', 'salle_info', 'salle_reunion', 'bibliotheque'])
  type_salle?: string;

  @IsOptional()
  equipements?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  disponible?: boolean;

  @IsOptional()
  @IsInt()
  etage?: number;
}

// Made with Bob
