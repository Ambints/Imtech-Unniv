import 'reflect-metadata';
import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { AdminModule } from './admin/admin.module';
import { AcademicModule } from './academic/academic.module';
import { FinanceModule } from './finance/finance.module';
import { LogisticsModule } from './logistics/logistics.module';
import { CommunicationModule } from './communication/communication.module';
import { DisciplineModule } from './discipline/discipline.module';
import { ExamensModule } from './examens/examens.module';
import { DocumentsModule } from './documents/documents.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PortailModule } from './portail/portail.module';
import { RHModule } from './rh/rh.module';
import { EconomatModule } from './economat/economat.module';
import { CaissierModule } from './caissier/caissier.module';
import { PedagogiqueModule } from './pedagogique/pedagogique.module';
import { MessagerieModule } from './messagerie/messagerie.module';
import { ImtechCacheModule } from './cache/cache.module';
import { Tenant } from './tenants/tenant.entity';
import { User } from './users/user.entity';
import { SuperAdmin } from './users/super-admin.entity';
import {
  Parcours, UniteEnseignement, ElementConstitutif, Departement,
  AnneeAcademique, CalendrierAcademique, Etudiant, Inscription,
  Enseignant, AffectationCours, Salle, Batiment, EmploiDuTemps,
  Presence, SessionExamen, Note
} from './academic/academic.entities';
import {
  GrilleTarifaire, Echeancier, Paiement, Budget, Depense,
  ContratPersonnel, CongePersonnel, FichePaie
} from './finance/finance.entities';
import {
  TicketMaintenance, ReservationSalle, Stock, MouvementStock,
  PlanningEntretien, RapportEntretien
} from './logistics/logistics.entities';
import { Annonce, Notification, Message } from './communication/communication.entities';
import { Incident, Sanction, Avertissement } from './discipline/discipline.entities';
import {
  PointageQR,
  PresenceSurveillance,
  AlerteDiscipline,
  ConfigurationExamen,
} from './discipline/surveillance.entities';
import {
  SuiviMoral,
  AutorisationSortie,
  RapportConduite,
  ConseilDiscipline,
} from './discipline/encadrement.entities';
import { SujetExamen as ExamenSujet, Deliberation as ExamenDeliberation, Jury, PVNote } from './examens/examens.entities';
import { ReleveNote, Attestation, Diplome as DocumentDiplome } from './documents/documents.entities';
import {
  Deliberation as ScolariteDeliberation,
  ResultatSemestre,
  ResultatUE,
  Diplome as ScolariteDiplome,
  SuplementDiplome,
  TransfertEtudiant,
  ArchiveScolarite,
  VerrouillageNotes,
} from './scolarite/entities';
import { Etudiant as ScolariteEtudiant } from './scolarite/entities/etudiant.entity';
import { SessionExamen as ScolariteSessionExamen } from './scolarite/entities/session-examen.entity';
import { Utilisateur } from './scolarite/entities/utilisateur.entity';
import { Note as ScolariteNote } from './scolarite/entities/note.entity';
import { Parcours as ScolariteParcours } from './scolarite/entities/parcours.entity';
import { AnneeAcademique as ScolariteAnneeAcademique } from './scolarite/entities/annee-academique.entity';
import { UniteEnseignement as ScolariteUniteEnseignement } from './scolarite/entities/unite-enseignement.entity';
import { ElementConstitutif as ScolariteElementConstitutif } from './scolarite/entities/element-constitutif.entity';
import { Inscription as ScolariteInscription } from './scolarite/entities/inscription.entity';
import {
  ReferentielCompetences,
  SujetExamen,
  ProcesVerbal,
  StageMemoire,
  StatistiqueParcours,
  ContenuCours,
  Soutenance
} from './pedagogique/pedagogique.entities';
import {
  AbsenceEnseignant,
  Rattrapage,
  Convocation,
  NoteDerogatoire,
  DemandeEtudiant
} from './pedagogique/secretaire.entities';
import { SecretaireParcours } from './pedagogique/secretaire-parcours.entity';
import { Plan } from './tenants/plan.entity';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ScolariteModule } from './scolarite/scolarite.module';
import { PresidentModule } from './president/president.module';
import { TenantMiddleware } from './tenants/tenant.middleware';
import { TenantSchemaInterceptor } from './tenants/tenant-schema.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Default connection for public schema (plans, tenants, super_admins)
    TypeOrmModule.forRoot({
      name: 'default',
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'imtech_university',
      schema: 'public',
      entities: [Tenant, SuperAdmin, Plan],
      synchronize: false,
      logging: false,
    }),
    // Tenant connection for tenant-specific schemas
    TypeOrmModule.forRoot({
      name: 'tenant',
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'imtech_university',
      // Don't set a default schema - it will be set dynamically per request
      entities: [
        User,
        Parcours, UniteEnseignement, ElementConstitutif, Departement,
        AnneeAcademique, CalendrierAcademique, Etudiant, Inscription,
        Enseignant, AffectationCours, Salle, Batiment, EmploiDuTemps,
        Presence, SessionExamen, Note,
        GrilleTarifaire, Echeancier, Paiement, Budget, Depense,
        ContratPersonnel, CongePersonnel, FichePaie,
        TicketMaintenance, ReservationSalle, Stock, MouvementStock,
        PlanningEntretien, RapportEntretien,
        Annonce, Notification, Message,
        Incident, Sanction, Avertissement,
        PointageQR, PresenceSurveillance, AlerteDiscipline, ConfigurationExamen,
        SuiviMoral, AutorisationSortie, RapportConduite, ConseilDiscipline,
        ExamenSujet, ExamenDeliberation, Jury, PVNote,
        ReleveNote, Attestation, DocumentDiplome,
        ReferentielCompetences, SujetExamen, ProcesVerbal,
        StageMemoire, StatistiqueParcours, ContenuCours, Soutenance,
        AbsenceEnseignant, Rattrapage, Convocation, NoteDerogatoire,
        DemandeEtudiant, SecretaireParcours,
        ScolariteDeliberation, ResultatSemestre, ResultatUE, ScolariteDiplome,
        SuplementDiplome, TransfertEtudiant, ArchiveScolarite, VerrouillageNotes,
        ScolariteEtudiant, ScolariteSessionExamen, Utilisateur, ScolariteNote,
        ScolariteParcours, ScolariteAnneeAcademique, ScolariteUniteEnseignement,
        ScolariteElementConstitutif, ScolariteInscription,
      ],
      synchronize: false,
      logging: false,
    }),
    AuthModule,
    UsersModule,
    TenantsModule,
    AdminModule,
    AcademicModule,
    FinanceModule,
    LogisticsModule,
    CommunicationModule,
    PlansModule,
    SubscriptionsModule,
    DisciplineModule,
    ExamensModule,
    DocumentsModule,
    DashboardModule,
    PortailModule,
    RHModule,
    CaissierModule,
    EconomatModule,
    PedagogiqueModule,
    ScolariteModule,
    MessagerieModule,
    PresidentModule,
    ImtechCacheModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantSchemaInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}