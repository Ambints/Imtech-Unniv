import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisciplineController } from './discipline.controller';
import { DisciplineService } from './discipline.service';
import { SurveillanceController } from './surveillance.controller';
import { SurveillanceService } from './surveillance.service';
import { EncadrementController } from './encadrement.controller';
import { EncadrementService } from './encadrement.service';
import { NotificationsGateway } from './notifications.gateway';
import { Incident, Sanction, Avertissement } from './discipline.entities';
import {
  PointageQR,
  PresenceSurveillance,
  AlerteDiscipline,
  ConfigurationExamen,
} from './surveillance.entities';
import {
  SuiviMoral,
  AutorisationSortie,
  RapportConduite,
  ConseilDiscipline,
} from './encadrement.entities';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Discipline entities
      Incident,
      Sanction,
      Avertissement,
      // Surveillance entities
      PointageQR,
      PresenceSurveillance,
      AlerteDiscipline,
      ConfigurationExamen,
      // Encadrement entities
      SuiviMoral,
      AutorisationSortie,
      RapportConduite,
      ConseilDiscipline,
    ], 'tenant'),
    TenantsModule,
  ],
  controllers: [
    DisciplineController,
    SurveillanceController,
    EncadrementController,
  ],
  providers: [
    DisciplineService,
    SurveillanceService,
    EncadrementService,
    NotificationsGateway,
  ],
  exports: [
    DisciplineService,
    SurveillanceService,
    EncadrementService,
    NotificationsGateway,
  ],
})
export class DisciplineModule {}

// Made with Bob
