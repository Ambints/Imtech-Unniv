import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScolariteController } from './controllers/scolarite.controller';
import { DeliberationController } from './controllers/deliberation.controller';
import { DiplomeController } from './controllers/diplome.controller';
import { NotesController } from './controllers/notes.controller';
import { ScolariteService } from './services/scolarite.service';
import { DeliberationService } from './services/deliberation.service';
import { DiplomeService } from './services/diplome.service';
import { NotesService } from './services/notes.service';
import { CalculMoyenneService } from './services/calcul-moyenne.service';
import { PdfService } from './services/pdf.service';
import { ArchiveService } from './services/archive.service';

// Entités
import { Deliberation } from './entities/deliberation.entity';
import { ResultatSemestre } from './entities/resultat-semestre.entity';
import { ResultatUE } from './entities/resultat-ue.entity';
import { Diplome } from './entities/diplome.entity';
import { SuplementDiplome } from './entities/suplement-diplome.entity';
import { TransfertEtudiant } from './entities/transfert-etudiant.entity';
import { ArchiveScolarite } from './entities/archive-scolarite.entity';
import { VerrouillageNotes } from './entities/verrouillage-notes.entity';
import { Inscription } from './entities/inscription.entity';
import { Etudiant } from './entities/etudiant.entity';
import { SessionExamen } from './entities/session-examen.entity';
import { Utilisateur } from './entities/utilisateur.entity';
import { Note } from './entities/note.entity';
import { Parcours } from './entities/parcours.entity';
import { AnneeAcademique } from './entities/annee-academique.entity';
import { UniteEnseignement } from './entities/unite-enseignement.entity';
import { ElementConstitutif } from './entities/element-constitutif.entity';

// Modules externes
import { UsersModule } from '../users/users.module';
import { AcademicModule } from '../academic/academic.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Deliberation,
      ResultatSemestre,
      ResultatUE,
      Diplome,
      SuplementDiplome,
      TransfertEtudiant,
      ArchiveScolarite,
      VerrouillageNotes,
      Inscription,
      Etudiant,
      SessionExamen,
      Utilisateur,
      Note,
      Parcours,
      AnneeAcademique,
      UniteEnseignement,
      ElementConstitutif,
    ], 'tenant'),
    UsersModule,
    AcademicModule,
  ],
  controllers: [
    ScolariteController,
    DeliberationController,
    DiplomeController,
    NotesController,
  ],
  providers: [
    ScolariteService,
    DeliberationService,
    DiplomeService,
    NotesService,
    CalculMoyenneService,
    PdfService,
    ArchiveService,
  ],
  exports: [
    ScolariteService,
    DeliberationService,
    DiplomeService,
    NotesService,
    CalculMoyenneService,
    PdfService,
    ArchiveService,
  ],
})
export class ScolariteModule {}
