import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PortailParentService } from './parent.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Portail Parent - Suivi enfant')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('parent')
@Controller('portail/parent')
export class PortailParentController {
  constructor(private readonly svc: PortailParentService) {}

  @Get('enfants')
  @ApiOperation({ summary: 'Liste des enfants liés au parent' })
  getEnfants(@CurrentUser() user: any) {
    return this.svc.getEnfants(user.id);
  }

  @Get('enfants/:etudiantId/bulletin')
  @ApiOperation({ summary: 'Bulletin de notes de l\'enfant' })
  getBulletin(
    @CurrentUser() user: any,
    @Param('etudiantId') etudiantId: string,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.svc.getBulletin(user.id, etudiantId, sessionId);
  }

  @Get('enfants/:etudiantId/absences')
  @ApiOperation({ summary: 'Absences et retards de l\'enfant' })
  getAbsences(@CurrentUser() user: any, @Param('etudiantId') etudiantId: string) {
    return this.svc.getAbsences(user.id, etudiantId);
  }

  @Get('enfants/:etudiantId/paiements')
  @ApiOperation({ summary: 'Historique des paiements' })
  getPaiements(@CurrentUser() user: any, @Param('etudiantId') etudiantId: string) {
    return this.svc.getPaiements(user.id, etudiantId);
  }

  @Get('enfants/:etudiantId/solde')
  @ApiOperation({ summary: 'Solde des frais de scolarité' })
  getSolde(@CurrentUser() user: any, @Param('etudiantId') etudiantId: string) {
    return this.svc.getSolde(user.id, etudiantId);
  }

  @Get('enfants/:etudiantId/emploi-du-temps')
  @ApiOperation({ summary: 'Emploi du temps de l\'enfant' })
  getEmploiDuTemps(
    @CurrentUser() user: any,
    @Param('etudiantId') etudiantId: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return this.svc.getEmploiDuTemps(user.id, etudiantId, dateDebut, dateFin);
  }

  @Post('autoriser-sortie')
  @ApiOperation({ summary: 'Autoriser une sortie anticipée' })
  autoriserSortie(@CurrentUser() user: any, @Body() dto: any) {
    return this.svc.autoriserSortie(user.id, dto);
  }

  @Post('justifier-absence')
  @ApiOperation({ summary: 'Justifier une absence en ligne' })
  justifierAbsence(@CurrentUser() user: any, @Body() dto: any) {
    return this.svc.justifierAbsenceParent(user.id, dto);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Notifications pour le parent' })
  getNotifications(@CurrentUser() user: any) {
    return this.svc.getNotifications(user.id);
  }
}
