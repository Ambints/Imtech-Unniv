import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt, IsIn, IsBoolean, Min } from 'class-validator';

export class CreateSalleDto {
  @IsUUID()
  batiment_id: string;

  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsInt()
  @Min(1)
  capacite: number;

  @IsIn(['cours', 'amphitheatre', 'laboratoire', 'salle_info', 'salle_reunion', 'bibliotheque'])
  type_salle: string;

  @IsOptional()
  equipements?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  disponible?: boolean = true;

  @IsInt()
  @IsOptional()
  etage?: number = 0;
}

// Made with Bob
