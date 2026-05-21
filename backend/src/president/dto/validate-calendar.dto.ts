import { IsString, IsOptional, IsArray, ValidateNested, IsDateString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ModificationEvenement {
  @IsNumber()
  evenementId: number;

  @IsDateString()
  nouvelleDateDebut: string;

  @IsDateString()
  nouvelleDateFin: string;

  @IsOptional()
  @IsString()
  motif?: string;
}

export class ValidateCalendarDto {
  @ApiPropertyOptional({
    description: 'Commentaire du president sur le calendrier',
    example: 'Calendrier valide avec quelques ajustements mineurs'
  })
  @IsOptional()
  @IsString()
  commentaire?: string;

  @ApiPropertyOptional({
    description: 'Liste des modifications proposees par le president',
    type: [ModificationEvenement]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModificationEvenement)
  modificationsProposees?: ModificationEvenement[];
}

// Made with Bob
