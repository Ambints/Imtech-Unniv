import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { AcademicModule } from './academic/academic.module';
import { FinanceModule } from './finance/finance.module';
import { LogisticsModule } from './logistics/logistics.module';
import { CommunicationModule } from './communication/communication.module';
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
import { Plan } from './tenants/plan.entity';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

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
      schema: 'univ_demo',
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
      ],
      synchronize: false,
      logging: false,
    }),
    AuthModule,
    UsersModule,
    TenantsModule,
    AcademicModule,
    FinanceModule,
    LogisticsModule,
    CommunicationModule,
    PlansModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}