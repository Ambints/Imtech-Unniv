import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExamensService } from './examens.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Examens - Sujets et Délibérations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('examens')
export class ExamensController {
  constructor(private readonly svc: ExamensService) {}

  // ========== SUJETS ==========
  @Post('sujets')
  @Roles('professeur', 'responsable_pedagogique')
  @ApiOperation({ summary: 'Déposer un sujet d\'examen' })
  createSujet(@Body() dto: any) {
    return this.svc.createSujet(dto);
  }

  @Get('sujets')
  @Roles('professeur', 'responsable_pedagogique', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Liste des sujets' })
  findSujets(@Query() filters: any) {
    return this.svc.findSujets(filters);
  }

  @Patch('sujets/:id/valider')
  @Roles('responsable_pedagogique', 'admin')
  @ApiOperation({ summary: 'Valider un sujet d\'examen' })
  validerSujet(@Param('id') id: string, @Body('validePar') validePar: string) {
    return this.svc.validerSujet(id, validePar);
  }

  @Patch('sujets/:id/refuser')
  @Roles('responsable_pedagogique', 'admin')
  @ApiOperation({ summary: 'Refuser un sujet' })
  refuserSujet(@Param('id') id: string, @Body('motif') motif: string) {
    return this.svc.refuserSujet(id, motif);
  }

  // ========== DÉLIBÉRATIONS ==========
  @Post('deliberations')
  @Roles('admin', 'secretaire', 'responsable_pedagogique')
  @ApiOperation({ summary: 'Créer une délibération' })
  createDeliberation(@Body() dto: any) {
    return this.svc.createDeliberation(dto);
  }

  @Get('sessions/:sessionId/deliberations')
  @Roles('admin', 'secretaire', 'responsable_pedagogique', 'president')
  @ApiOperation({ summary: 'Délibérations d\'une session' })
  findDeliberations(@Param('sessionId') sessionId: string) {
    return this.svc.findDeliberations(sessionId);
  }

  @Patch('deliberations/:id/verrouiller')
  @Roles('responsable_pedagogique', 'admin', 'president')
  @ApiOperation({ summary: 'Verrouiller une délibération' })
  verrouillerDeliberation(@Param('id') id: string, @Body('verrouillePar') verrouillePar: string) {
    return this.svc.verrouillerDeliberation(id, verrouillePar);
  }

  @Patch('deliberations/:id/publier')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Publier les résultats' })
  publierDeliberation(@Param('id') id: string) {
    return this.svc.publierDeliberation(id);
  }

  // ========== JURY ==========
  @Post('deliberations/:id/jury')
  @Roles('admin', 'secretaire')
  @ApiOperation({ summary: 'Ajouter un membre au jury' })
  ajouterJury(@Param('id') deliberationId: string, @Body() dto: any) {
    return this.svc.ajouterMembreJury({ ...dto, deliberationId });
  }

  @Get('deliberations/:id/jury')
  @Roles('admin', 'secretaire', 'responsable_pedagogique')
  @ApiOperation({ summary: 'Liste des membres du jury' })
  getJury(@Param('id') deliberationId: string) {
    return this.svc.getJuryByDeliberation(deliberationId);
  }

  // ========== PV ==========
  @Post('pv-notes')
  @Roles('admin', 'secretaire', 'responsable_pedagogique')
  @ApiOperation({ summary: 'Créer une entrée PV' })
  createPV(@Body() dto: any) {
    return this.svc.createPVNote(dto);
  }

  @Get('deliberations/:id/pv')
  @Roles('admin', 'secretaire', 'responsable_pedagogique', 'president')
  @ApiOperation({ summary: 'PV de délibération' })
  getPV(@Param('id') deliberationId: string) {
    return this.svc.getPVByDeliberation(deliberationId);
  }

  @Get('deliberations/:id/stats')
  @Roles('admin', 'secretaire', 'responsable_pedagogique', 'president')
  @ApiOperation({ summary: 'Statistiques de la délibération' })
  getStatsDeliberation(@Param('id') deliberationId: string) {
    return this.svc.calculerStatsDeliberation(deliberationId);
  }
}
