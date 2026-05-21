import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignDiplomaDto {
  @ApiProperty({
    description: 'Code PIN ou hash de la clé privée du président pour la signature',
    example: '123456'
  })
  @IsString()
  @IsNotEmpty()
  codeSignature: string;

  @ApiPropertyOptional({
    description: 'Mention spéciale ajoutée par le président',
    example: 'Félicitations du jury'
  })
  @IsOptional()
  @IsString()
  mentionSpeciale?: string;
}

export class SignDiplomasInBulkDto {
  @ApiProperty({
    description: 'Liste des IDs des diplomes a signer',
    example: [1, 2, 3, 4, 5],
    type: [Number]
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  ids: number[];

  @ApiProperty({
    description: 'Code PIN ou hash de la clé privée du président pour la signature',
    example: '123456'
  })
  @IsString()
  @IsNotEmpty()
  codeSignature: string;

  @ApiPropertyOptional({
    description: 'Mention spéciale commune pour tous les diplômes',
    example: 'Promotion 2024-2025'
  })
  @IsOptional()
  @IsString()
  mentionSpeciale?: string;
}

// Made with Bob
