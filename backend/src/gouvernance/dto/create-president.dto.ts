import { IsString, IsEmail, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePresidentDto {
  @ApiProperty({ description: 'Nom du président' })
  @IsString()
  nom: string;

  @ApiProperty({ description: 'Prénom du président' })
  @IsString()
  prenom: string;

  @ApiProperty({ description: 'Email du président' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Téléphone du président' })
  @IsString()
  telephone: string;

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
