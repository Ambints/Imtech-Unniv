import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntretienController } from './entretien.controller';
import { EntretienService } from './entretien.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [EntretienController],
  providers: [EntretienService],
  exports: [EntretienService],
})
export class EntretienModule {}

// Made with Bob
