import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { ReleveNote, Attestation, Diplome } from './documents.entities';

@Module({
  imports: [TypeOrmModule.forFeature([ReleveNote, Attestation, Diplome])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
