import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicController } from './academic.controller';
import { AcademicService } from './academic.service';
import { ScolariteController } from './scolarite.controller';
import { ScolariteService } from './scolarite.service';
import { TenantsModule } from '../tenants/tenants.module';

// New Controllers
import { SalleController } from './controllers/salle.controller';
import { SeanceController } from './controllers/seance.controller';
import { CourseController } from './controllers/course.controller';
import { StudentController } from './controllers/student.controller';
import { InscriptionController } from './controllers/inscription.controller';

// New Services
import { SalleService } from './services/salle.service';
import { SeanceService } from './services/seance.service';
import { EmploiDuTempsService } from './services/emploi-du-temps.service';
import { CourseService } from './services/course.service';
import { StudentService } from './services/student.service';
import { InscriptionService } from './services/inscription.service';

import {
  Parcours, UniteEnseignement, ElementConstitutif, Departement,
  AnneeAcademique, CalendrierAcademique, Etudiant, Inscription,
  Enseignant, AffectationCours, Batiment,
  Presence, SessionExamen, Note
} from './academic.entities';
import { Salle } from './entities/salle.entity';
import { Seance } from './entities/seance.entity';
import { EmploiDuTemps } from './entities/emploi-du-temps.entity';
import {
  VerrouillageNotes,
  ResultatAcademique,
  ReleveNote,
  DiplomeDocument,
  EquivalenceCredit,
} from './scolarite.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Parcours, UniteEnseignement, ElementConstitutif, Departement,
      AnneeAcademique, CalendrierAcademique, Etudiant, Inscription,
      Enseignant, AffectationCours, Salle, Seance, Batiment, EmploiDuTemps,
      Presence, SessionExamen, Note,
      VerrouillageNotes, ResultatAcademique, ReleveNote,
      DiplomeDocument, EquivalenceCredit,
    ], 'tenant'),
    TenantsModule,
  ],
  controllers: [
    AcademicController, 
    ScolariteController,
    SalleController,
    SeanceController,
    CourseController,
    StudentController,
    InscriptionController,
  ],
  providers: [
    AcademicService, 
    ScolariteService,
    SalleService,
    SeanceService,
    EmploiDuTempsService,
    CourseService,
    StudentService,
    InscriptionService,
  ],
  exports: [
    AcademicService, 
    ScolariteService,
    SalleService,
    SeanceService,
    EmploiDuTempsService,
    CourseService,
    StudentService,
    InscriptionService,
  ],
})
export class AcademicModule {}