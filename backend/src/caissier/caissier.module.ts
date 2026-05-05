import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaissierController } from './caissier.controller';
import { CaissierService } from './caissier.service';
import { Paiement, Echeancier } from '../finance/finance.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Paiement, Echeancier])],
  controllers: [CaissierController],
  providers: [CaissierService],
  exports: [CaissierService],
})
export class CaissierModule {}
