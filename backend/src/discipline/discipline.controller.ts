import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DisciplineService } from './discipline.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Discipline - Gestion des incidents et sanctions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('discipline/:tid')
export class DisciplineController {
  constructor(private readonly svc: DisciplineService) {}

  // ========== INCIDENTS ==========
  @Post('incidents')
  @Roles('surveillant', 'admin', 'secretaire', 'surveillant_general')
  @ApiOperation({ summary: 'Déclarer un incident disciplinaire' })
  @ApiResponse({ status: 201, description: 'Incident créé' })
  createIncident(@Param('tid') tid: string, @Body() dto: any) {
    return this.svc.createIncident(dto);
  }

  @Get('incidents')
  @Roles('surveillant', 'admin', 'secretaire', 'president', 'surveillant_general')
  @ApiOperation({ summary: 'Liste des incidents avec filtres' })
  findAllIncidents(@Param('tid') tid: string, @Query() filters: any) {
    return this.svc.findAllIncidents(filters);
  }

  @Get('incidents/:id')
  @Roles('surveillant', 'admin', 'secretaire', 'president', 'surveillant_general')
  @ApiOperation({ summary: 'Détail d\'un incident' })
  findIncidentById(@Param('tid') tid: string, @Param('id') id: string) {
    return this.svc.findIncidentById(id);
  }

  @Patch('incidents/:id')
  @Roles('surveillant', 'admin', 'secretaire', 'surveillant_general')
  @ApiOperation({ summary: 'Modifier un incident' })
  updateIncident(@Param('tid') tid: string, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateIncident(id, dto);
  }

  @Patch('incidents/:id/valider')
  @Roles('admin', 'surveillant_general', 'president')
  @ApiOperation({ summary: 'Valider un incident' })
  validerIncident(@Param('tid') tid: string, @Param('id') id: string, @Body('validePar') validePar: string) {
    return this.svc.validerIncident(id, validePar);
  }

  @Delete('incidents/:id')
  @Roles('surveillant', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Supprimer un incident' })
  deleteIncident(@Param('id') id: string) {
    return this.svc.deleteIncident(id);
  }

  @Get('etudiants/:etudiantId/incidents')
  @Roles('surveillant', 'admin', 'secretaire', 'parent')
  @ApiOperation({ summary: 'Incidents d\'un étudiant' })
  getIncidentsByStudent(@Param('etudiantId') etudiantId: string) {
    return this.svc.getIncidentsByStudent(etudiantId);
  }

  // ========== RAPPORTS ==========
  @Get('rapports/periode')
  @Roles('admin', 'surveillant_general', 'president')
  @ApiOperation({ summary: 'Incidents par période' })
  getIncidentsByPeriod(@Query('dateDebut') dateDebut: string, @Query('dateFin') dateFin: string) {
    return this.svc.getIncidentsByPeriod(dateDebut, dateFin);
  }

  @Get('rapports/types')
  @Roles('admin', 'surveillant_general', 'president')
  @ApiOperation({ summary: 'Incidents par type' })
  getIncidentsByType() {
    return this.svc.getIncidentsByType();
  }

  // ========== STATISTIQUES ==========
  @Get('stats')
  @Roles('admin', 'surveillant_general', 'president')
  @ApiOperation({ summary: 'Statistiques discipline' })
  getStats() {
    return this.svc.getDisciplineStats();
  }
}
