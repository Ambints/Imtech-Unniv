import { IsString, IsEnum, IsNumber, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class CreateSalleDto {
  @IsString()
  code: string;

  @IsString()
  nom: string;

  @IsEnum(['cm', 'td', 'tp', 'amphi', 'laboratoire'])
  type: 'cm' | 'td' | 'tp' | 'amphi' | 'laboratoire';

  @IsNumber()
  capacite: number;

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
