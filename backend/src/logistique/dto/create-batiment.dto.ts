import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateBatimentDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsBoolean()
  @IsOptional()
  actif?: boolean = true;
}

// Made with Bob
