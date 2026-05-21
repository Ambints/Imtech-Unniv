import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CaissierController } from './caissier.controller';
import { CaissierService } from './caissier.service';
import { Paiement, Echeancier } from '../finance/finance.entities';
import { FraisInscription } from './frais-inscription.entity';
import { ClotureCaisse } from './cloture-caisse.entity';
import { 
  Parcours, AnneeAcademique, Inscription, Etudiant, Utilisateur 
} from '../scolarite/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Paiement, 
      Echeancier, 
      FraisInscription, 
      ClotureCaisse,
      Parcours,
      AnneeAcademique,
      Inscription,
      Etudiant,
      Utilisateur
    ], 'tenant')
  ],
  controllers: [CaissierController],
  providers: [CaissierService],
  exports: [CaissierService],
})
export class CaissierModule {}
