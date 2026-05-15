import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortailEtudiantController } from './etudiant.controller';
import { PortailEtudiantService } from './etudiant.service';
import { PortailParentController } from './parent.controller';
import { PortailParentService } from './parent.service';
import { PortailEnseignantController } from './enseignant.controller';
import { PortailEnseignantService } from './enseignant.service';
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
    PortailEnseignantController,
    PortailPermissionsController
  ],
  providers: [PortailEtudiantService, PortailParentService, PortailEnseignantService],
  exports: [PortailEtudiantService, PortailParentService, PortailEnseignantService],
})
export class PortailModule {}
