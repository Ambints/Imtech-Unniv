import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PresidentDashboardService } from './president.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Dashboard Président - KPI et Indicateurs')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('president', 'admin')
@Controller('dashboard/president')
export class PresidentDashboardController {
  constructor(private readonly svc: PresidentDashboardService) {}

  @Get('kpi')
  @ApiOperation({ summary: 'KPI globaux de l\'université' })
  @ApiResponse({ status: 200, description: 'Indicateurs clés de performance' })
  getKPI(@Query('anneeAcademiqueId') anneeAcademiqueId?: string) {
    return this.svc.getKPI(anneeAcademiqueId);
  }

  @Get('stats-etudiants')
  @ApiOperation({ summary: 'Statistiques étudiants' })
  getStatsEtudiants(@Query('anneeAcademiqueId') anneeAcademiqueId?: string) {
    return this.svc.getStatsEtudiants(anneeAcademiqueId);
  }

  @Get('stats-financieres')
  @ApiOperation({ summary: 'Statistiques financières' })
  getStatsFinancieres(@Query('anneeAcademiqueId') anneeAcademiqueId?: string) {
    return this.svc.getStatsFinancieres(anneeAcademiqueId);
  }

  @Get('stats-academiques')
  @ApiOperation({ summary: 'Statistiques académiques (taux de réussite)' })
  getStatsAcademiques(@Query('sessionId') sessionId?: string) {
    return this.svc.getStatsAcademiques(sessionId);
  }

  @Get('activite-recente')
  @ApiOperation({ summary: 'Activité récente de l\'université' })
  getActiviteRecente() {
    return this.svc.getActiviteRecente();
  }

  @Get('alertes')
  @ApiOperation({ summary: 'Alertes nécessitant attention du Président' })
  getAlertes() {
    return this.svc.getAlertes();
  }

  @Get('repartition-par-parcours')
  @ApiOperation({ summary: 'Répartition des étudiants par parcours' })
  getRepartitionParcours(@Query('anneeAcademiqueId') anneeAcademiqueId?: string) {
    return this.svc.getRepartitionParParcours(anneeAcademiqueId);
  }
}
