import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicController } from './academic.controller';
import { AcademicService } from './academic.service';
import { TenantsModule } from '../tenants/tenants.module';
import {
  Parcours, UniteEnseignement, ElementConstitutif, Departement,
  AnneeAcademique, CalendrierAcademique, Etudiant, Inscription,
  Enseignant, AffectationCours, Salle, Batiment, EmploiDuTemps,
  Presence, SessionExamen, Note
} from './academic.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Parcours, UniteEnseignement, ElementConstitutif, Departement,
      AnneeAcademique, CalendrierAcademique, Etudiant, Inscription,
      Enseignant, AffectationCours, Salle, Batiment, EmploiDuTemps,
      Presence, SessionExamen, Note
    ], 'tenant'),
    TenantsModule,
  ],
  controllers: [AcademicController],
  providers: [AcademicService],
  exports: [AcademicService],
})
export class AcademicModule {}