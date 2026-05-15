import { IsString, IsEmail, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePresidentDto {
  @ApiPropertyOptional({ description: 'Nom du président' })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiPropertyOptional({ description: 'Prénom du président' })
  @IsOptional()
  @IsString()
  prenom?: string;

  @ApiPropertyOptional({ description: 'Email du président' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Téléphone du président' })
  @IsOptional()
  @IsString()
  telephone?: string;

  @ApiPropertyOptional({ description: 'Signature numérique' })
  @IsOptional()
  @IsString()
  signature_numerique?: string;

  @ApiPropertyOptional({ description: 'Statut actif' })
  @IsOptional()
  @IsBoolean()
  actif?: boolean;

  @ApiPropertyOptional({ description: 'Date de début de mandat' })
  @IsOptional()
  @IsDate()
  date_debut_mandat?: Date;

  @ApiPropertyOptional({ description: 'Date de fin de mandat' })
  @IsOptional()
  @IsDate()
  date_fin_mandat?: Date;
}
