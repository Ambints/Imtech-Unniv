import { IsString, IsEnum, IsNumber, IsArray, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateSalleDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  code?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  nom?: string;

  @IsEnum(['cm', 'td', 'tp', 'am phi', 'laboratoire'])
  @IsOptional()
  type?: 'cm' | 'td' | 'tp' | 'am phi' | 'laboratoire';

  @IsNumber()
  @IsOptional()
  capacite?: number;

  @IsArray()
  @IsOptional()
  equipements?: string[];

  @IsString()
  @IsOptional()
  etage?: string;

  @IsBoolean()
  @IsOptional()
  disponible?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  photo?: string;
}
