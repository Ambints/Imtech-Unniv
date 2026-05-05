import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DisciplineService } from './discipline.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Discipline - Gestion des incidents et sanctions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('discipline')
export class DisciplineController {
  constructor(private readonly svc: DisciplineService) {}

  // ========== INCIDENTS ==========
  @Post('incidents')
  @Roles('surveillant', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Déclarer un incident disciplinaire' })
  @ApiResponse({ status: 201, description: 'Incident créé' })
  createIncident(@Body() dto: any) {
    return this.svc.createIncident(dto);
  }

  @Get('incidents')
  @Roles('surveillant', 'admin', 'secretaire', 'president')
  @ApiOperation({ summary: 'Liste des incidents avec filtres' })
  findAllIncidents(@Query() filters: any) {
    return this.svc.findAllIncidents(filters);
  }

  @Patch('incidents/:id/valider')
  @Roles('admin', 'surveillant_general', 'president')
  @ApiOperation({ summary: 'Valider un incident' })
  validerIncident(@Param('id') id: string, @Body('validePar') validePar: string) {
    return this.svc.validerIncident(id, validePar);
  }

  // ========== SANCTIONS ==========
  @Post('sanctions')
  @Roles('admin', 'surveillant_general', 'president')
  @ApiOperation({ summary: 'Créer une sanction' })
  createSanction(@Body() dto: any) {
    return this.svc.createSanction(dto);
  }

  @Get('sanctions')
  @Roles('admin', 'surveillant_general', 'secretaire')
  @ApiOperation({ summary: 'Liste des sanctions' })
  findAllSanctions(@Query() filters: any) {
    return this.svc.findAllSanctions(filters);
  }

  @Get('etudiants/:etudiantId/sanctions')
  @Roles('surveillant', 'admin', 'secretaire', 'parent')
  @ApiOperation({ summary: 'Sanctions actives d\'un étudiant' })
  findActiveSanctions(@Param('etudiantId') etudiantId: string) {
    return this.svc.findActiveSanctionsByStudent(etudiantId);
  }

  // ========== AVERTISSEMENTS ==========
  @Post('avertissements')
  @Roles('surveillant', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Émettre un avertissement' })
  createAvertissement(@Body() dto: any) {
    return this.svc.createAvertissement(dto);
  }

  @Get('etudiants/:etudiantId/avertissements')
  @Roles('surveillant', 'admin', 'secretaire', 'parent', 'etudiant')
  @ApiOperation({ summary: 'Avertissements d\'un étudiant' })
  findAvertissements(@Param('etudiantId') etudiantId: string) {
    return this.svc.findAvertissementsByStudent(etudiantId);
  }

  // ========== STATISTIQUES ==========
  @Get('stats')
  @Roles('admin', 'surveillant_general', 'president')
  @ApiOperation({ summary: 'Statistiques discipline' })
  getStats() {
    return this.svc.getDisciplineStats();
  }
}
