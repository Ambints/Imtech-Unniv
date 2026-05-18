import { IsArray, IsString, IsDateString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DelegateSignatureDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur delegataire (secretariat general)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsUUID()
  @IsNotEmpty()
  delegataireId: string;

  @ApiProperty({
    description: 'Types d\'actes pour lesquels la delegation est accordee',
    example: ['attestation_scolarite', 'convocation', 'certificat_inscription'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  typesActes: string[];

  @ApiProperty({
    description: 'Date de debut de la delegation',
    example: '2024-09-01'
  })
  @IsDateString()
  @IsNotEmpty()
  dateDebut: string;

  @ApiProperty({
    description: 'Date de fin de la delegation',
    example: '2024-12-31'
  })
  @IsDateString()
  @IsNotEmpty()
  dateFin: string;

  @ApiPropertyOptional({
    description: 'Conditions particulieres de la delegation',
    example: 'Delegation limitee aux actes de moins de 100 000 Ar'
  })
  @IsOptional()
  @IsString()
  conditions?: string;
}

// Made with Bob
