import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortailEtudiantController } from './etudiant.controller';
import { PortailEtudiantService } from './etudiant.service';
import { PortailParentController } from './parent.controller';
import { PortailParentService } from './parent.service';
import { PortailParentControllerEnhanced } from './parent.controller.enhanced';
import { PortailParentServiceEnhanced } from './parent.service.enhanced';
import { PortailEnseignantController } from './enseignant.controller';
import { PortailEnseignantService } from './enseignant.service';
import { PortailPermissionsController } from './portail-permissions.controller';
import { TestEnseignantController } from './test-enseignant.controller';
import { Tenant } from '../tenants/tenant.entity';
import { TenantConnectionService } from '../tenants/tenant-connection.service';

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
    PortailParentControllerEnhanced, // Nouveau controller amélioré
    PortailEnseignantController,
    PortailPermissionsController,
    TestEnseignantController
  ],
  providers: [
    TenantConnectionService,
    PortailEtudiantService,
    PortailParentService,
    PortailParentServiceEnhanced, // Nouveau service amélioré
    PortailEnseignantService
  ],
  exports: [
    PortailEtudiantService,
    PortailParentService,
    PortailParentServiceEnhanced, // Export du nouveau service
    PortailEnseignantService
  ],
})
export class PortailModule {}
