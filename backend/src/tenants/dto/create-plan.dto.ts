import { IsString, IsNumber, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanDto {
  @ApiProperty({ example: 'Basic' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Plan de démarrage pour petites universités', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  monthlyPrice: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  maxUsers: number;

  @ApiProperty({ example: 500, required: false })
  @IsNumber()
  @IsOptional()
  maxStudents?: number;

  @ApiProperty({ example: ['LMS', 'Support Email'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;

}
