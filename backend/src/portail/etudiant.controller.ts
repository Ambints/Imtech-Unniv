import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PortailEtudiantService } from './etudiant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Portail Étudiant - Espace personnel')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('etudiant')
@Controller('portail/etudiant')
export class PortailEtudiantController {
  constructor(private readonly svc: PortailEtudiantService) {}

  @Get('profil')
  @ApiOperation({ summary: 'Profil de l\'étudiant connecté' })
  getProfil(@CurrentUser() user: any) {
    return this.svc.getProfil(user.id);
  }

  @Get('emploi-du-temps')
  @ApiOperation({ summary: 'Emploi du temps de l\'étudiant' })
  getEmploiDuTemps(
    @CurrentUser() user: any,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return this.svc.getEmploiDuTemps(user.id, dateDebut, dateFin);
  }

  @Get('notes')
  @ApiOperation({ summary: 'Notes de l\'étudiant' })
  getNotes(@CurrentUser() user: any, @Query('sessionId') sessionId?: string) {
    return this.svc.getNotes(user.id, sessionId);
  }

  @Get('moyennes')
  @ApiOperation({ summary: 'Moyennes par semestre/UE' })
  getMoyennes(@CurrentUser() user: any) {
    return this.svc.getMoyennes(user.id);
  }

  @Get('paiements')
  @ApiOperation({ summary: 'Historique des paiements' })
  getPaiements(@CurrentUser() user: any) {
    return this.svc.getPaiements(user.id);
  }

  @Get('solde')
  @ApiOperation({ summary: 'Solde des frais de scolarité' })
  getSolde(@CurrentUser() user: any) {
    return this.svc.getSolde(user.id);
  }

  @Get('absences')
  @ApiOperation({ summary: 'Historique des absences' })
  getAbsences(@CurrentUser() user: any) {
    return this.svc.getAbsences(user.id);
  }

  @Post('justifier-absence')
  @ApiOperation({ summary: 'Déposer un justificatif d\'absence' })
  justifierAbsence(@CurrentUser() user: any, @Body() dto: any) {
    return this.svc.justifierAbsence(user.id, dto);
  }

  @Get('documents')
  @ApiOperation({ summary: 'Documents disponibles' })
  getDocuments(@CurrentUser() user: any) {
    return this.svc.getDocuments(user.id);
  }

  @Get('cours-en-ligne')
  @ApiOperation({ summary: 'Supports de cours' })
  getCoursEnLigne(@CurrentUser() user: any) {
    return this.svc.getCoursEnLigne(user.id);
  }

  @Get('inscription-examens')
  @ApiOperation({ summary: 'Inscriptions aux examens' })
  getInscriptionExamens(@CurrentUser() user: any) {
    return this.svc.getInscriptionsExamens(user.id);
  }

  @Post('inscription-examens')
  @ApiOperation({ summary: 'S\'inscrire à une session d\'examen' })
  inscrireExamen(@CurrentUser() user: any, @Body() dto: { sessionId: string }) {
    return this.svc.inscrireExamen(user.id, dto.sessionId);
  }
}
