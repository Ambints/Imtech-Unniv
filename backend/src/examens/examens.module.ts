import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamensController } from './examens.controller';
import { ExamensService } from './examens.service';
import { SujetExamen, Deliberation, Jury, PVNote } from './examens.entities';

@Module({
  imports: [TypeOrmModule.forFeature([SujetExamen, Deliberation, Jury, PVNote])],
  controllers: [ExamensController],
  providers: [ExamensService],
  exports: [ExamensService],
})
export class ExamensModule {}
