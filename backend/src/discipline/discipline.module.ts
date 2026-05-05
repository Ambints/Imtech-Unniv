import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisciplineController } from './discipline.controller';
import { DisciplineService } from './discipline.service';
import { Incident, Sanction, Avertissement } from './discipline.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Incident, Sanction, Avertissement])],
  controllers: [DisciplineController],
  providers: [DisciplineService],
  exports: [DisciplineService],
})
export class DisciplineModule {}
