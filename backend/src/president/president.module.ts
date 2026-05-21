import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PresidentController } from './president.controller';
import { PresidentServiceSimple } from './president.service.simple';

@Module({
  imports: [
    // Le service utilise directement DataSource, pas besoin d'importer des entités
    TypeOrmModule.forFeature([], 'tenant'),
  ],
  controllers: [PresidentController],
  providers: [PresidentServiceSimple],
  exports: [PresidentServiceSimple],
})
export class PresidentModule {}

// Made with Bob
