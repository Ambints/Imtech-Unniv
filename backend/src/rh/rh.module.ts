import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RHController } from './rh.controller';
import { RHService } from './rh.service';
import { ContratPersonnel, CongePersonnel, FichePaie } from '../finance/finance.entities';

@Module({
  imports: [TypeOrmModule.forFeature([ContratPersonnel, CongePersonnel, FichePaie])],
  controllers: [RHController],
  providers: [RHService],
  exports: [RHService],
})
export class RHModule {}
