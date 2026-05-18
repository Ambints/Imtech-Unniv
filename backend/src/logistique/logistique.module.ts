import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogistiqueController } from './logistique.controller';
import { LogistiqueService } from './logistique.service';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [LogistiqueController],
  providers: [LogistiqueService],
  exports: [LogistiqueService],
})
export class LogistiqueModule {}

// Made with Bob
