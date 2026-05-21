import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnseignantAffectationController } from './enseignant-affectation.controller';
import { EnseignantAffectationService } from './enseignant-affectation.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [EnseignantAffectationController],
  providers: [EnseignantAffectationService],
  exports: [EnseignantAffectationService],
})
export class EnseignantAffectationModule {}

// Made with Bob
