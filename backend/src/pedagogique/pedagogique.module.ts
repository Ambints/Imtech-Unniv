import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedagogiqueController } from './pedagogique.controller';
import { PedagogiqueService } from './pedagogique.service';
import { RPSecureController } from './rp-secure.controller';
import { RPSecureService } from './rp-secure.service';
import { RPEnhancedController } from './rp-enhanced.controller';
import { RPEnhancedService } from './rp-enhanced.service';
import { SecretaireController } from './secretaire.controller';
import { SecretaireService } from './secretaire.service';
import { TenantsModule } from '../tenants/tenants.module';
import { RolesGuard } from '../auth/roles.guard';
import {
  ReferentielCompetences,
  SujetExamen,
  ProcesVerbal,
  StageMemoire,
  StatistiqueParcours,
  ContenuCours,
  Soutenance
} from './pedagogique.entities';
import {
  AbsenceEnseignant,
  Rattrapage,
  Convocation,
  NoteDerogatoire,
  DemandeEtudiant
} from './secretaire.entities';
import { SecretaireParcours } from './secretaire-parcours.entity';
import { ParcoursAccessGuard } from './guards/parcours-access.guard';
import {
  Parcours,
  UniteEnseignement,
  ElementConstitutif,
  Enseignant,
  AffectationCours,
  Note,
  Inscription,
  Presence,
  SessionExamen,
  AnneeAcademique,
  Etudiant,
  EmploiDuTemps
} from '../academic/academic.entities';
import { Salle } from '../academic/entities/salle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Pedagogique entities
      ReferentielCompetences,
      SujetExamen,
      ProcesVerbal,
      StageMemoire,
      StatistiqueParcours,
      ContenuCours,
      Soutenance,
      // Secretaire entities
      AbsenceEnseignant,
      Rattrapage,
      Convocation,
      NoteDerogatoire,
      DemandeEtudiant,
      SecretaireParcours,
      // Academic entities (needed for relationships)
      Parcours,
      UniteEnseignement,
      ElementConstitutif,
      Enseignant,
      AffectationCours,
      Note,
      Inscription,
      Presence,
      SessionExamen,
      AnneeAcademique,
      Etudiant,
      Salle,
      EmploiDuTemps
    ], 'tenant'),
    TenantsModule,
  ],
  controllers: [PedagogiqueController, RPSecureController, RPEnhancedController, SecretaireController],
  providers: [PedagogiqueService, RPSecureService, RPEnhancedService, SecretaireService, RolesGuard, ParcoursAccessGuard],
  exports: [PedagogiqueService, RPSecureService, RPEnhancedService, SecretaireService],
})
export class PedagogiqueModule {}

// Made with Bob
