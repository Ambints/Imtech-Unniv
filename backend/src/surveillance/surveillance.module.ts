import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveillanceController } from './surveillance.controller';
import { SurveillanceService } from './surveillance.service';
import { 
  SurveillantGeneral, 
  AppelNumerique, 
  IncidentDisciplinaire, 
  OrganisationExamen,
  RapportSurveillance 
} from './surveillance.entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SurveillantGeneral, 
      AppelNumerique, 
      IncidentDisciplinaire, 
      OrganisationExamen,
      RapportSurveillance
    ], 'tenant')
  ],
  controllers: [SurveillanceController],
  providers: [SurveillanceService],
  exports: [SurveillanceService],
})
export class SurveillanceModule {}
