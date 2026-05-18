import { IsString, IsNotEmpty, IsOptional, IsUUID, IsIn } from 'class-validator';

export class CreateTicketDto {
  @IsOptional()
  @IsUUID()
  batiment_id?: string;

  @IsOptional()
  @IsUUID()
  salle_id?: string;

  @IsString()
  @IsNotEmpty()
  titre: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsIn(['preventive', 'curative', 'urgence'])
  type_maintenance: string;

  @IsOptional()
  @IsIn(['basse', 'normale', 'haute', 'urgente'])
  priorite?: string = 'normale';

  @IsOptional()
  @IsUUID()
  assigne_a?: string;
}

// Made with Bob
