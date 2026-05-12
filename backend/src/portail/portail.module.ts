import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortailEtudiantController } from './etudiant.controller';
import { PortailEtudiantService } from './etudiant.service';
import { PortailParentController } from './parent.controller';
import { PortailParentService } from './parent.service';
import { PortailProfesseurController } from './professeur.controller';
import { PortailProfesseurService } from './professeur.service';
import { PortailPermissionsController } from './portail-permissions.controller';
import { Tenant } from '../tenants/tenant.entity';

// Import entities for tenant connection
import { 
  Inscription, Etudiant, Parcours, AnneeAcademique, UniteEnseignement, 
  ElementConstitutif, SessionExamen, Note 
} from '../scolarite/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
    TypeOrmModule.forFeature([
      Inscription, Etudiant, Parcours, AnneeAcademique, UniteEnseignement,
      ElementConstitutif, SessionExamen, Note
    ], 'tenant')
  ],
  controllers: [
    PortailEtudiantController,
    PortailParentController,
    PortailProfesseurController,
    PortailPermissionsController
  ],
  providers: [PortailEtudiantService, PortailParentService, PortailProfesseurService],
  exports: [PortailEtudiantService, PortailParentService, PortailProfesseurService],
})
export class PortailModule {}
