import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import {
  GrilleTarifaire, Echeancier, Paiement, Budget, Depense,
  ContratPersonnel, CongePersonnel, FichePaie
} from './finance.entities';

@Module({
  imports: [TypeOrmModule.forFeature([
    GrilleTarifaire, Echeancier, Paiement, Budget, Depense,
    ContratPersonnel, CongePersonnel, FichePaie
  ])],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}