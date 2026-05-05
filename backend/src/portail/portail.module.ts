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

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
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
