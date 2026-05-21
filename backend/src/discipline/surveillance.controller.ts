import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SurveillanceService } from './surveillance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';

@Controller('surveillance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SurveillanceController {
  constructor(private readonly surveillanceService: SurveillanceService) {}

  // ==================== POINTAGE QR CODE ====================

  @Post(':tid/qr/generer')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async genererQR(
    @Param('tid') tid: string,
    @Body() dto: { seanceId: string; etudiantId: string },
    @Request() req,
  ) {
    return this.surveillanceService.genererQRCode(tid, dto, req.user.userId);
  }

  @Post(':tid/qr/scanner')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async scannerQR(
    @Param('tid') tid: string,
    @Body() dto: { codeQr: string; localisation?: string },
    @Request() req,
  ) {
    return this.surveillanceService.scannerQRCode(tid, dto, req.user.userId);
  }

  @Post(':tid/pointage/manuel')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async pointageManuel(
    @Param('tid') tid: string,
    @Body() dto: { etudiantId: string; seanceId: string; statut: string; heureArrivee?: string; observations?: string },
    @Request() req,
  ) {
    return this.surveillanceService.pointageManuel(tid, dto as any, req.user.userId);
  }

  @Get(':tid/presences/:seanceId')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN, UserRole.SCOLARITE)
  async getPresencesSeance(
    @Param('tid') tid: string,
    @Param('seanceId') seanceId: string,
  ) {
    return this.surveillanceService.getPresencesSeance(tid, seanceId);
  }

  // ==================== VALIDATION DES JUSTIFICATIONS ====================

  @Get(':tid/absences-a-justifier')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async getAbsencesAJustifier(
    @Param('tid') tid: string,
    @Query('parcoursId') parcoursId?: string,
  ) {
    return this.surveillanceService.getAbsencesAJustifier(tid, parcoursId);
  }

  @Post(':tid/valider-justification')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async validerJustification(
    @Param('tid') tid: string,
    @Body() dto: { presenceId: string; accepte: boolean; motifRefus?: string },
    @Request() req,
  ) {
    return this.surveillanceService.validerJustification(tid, dto, req.user.userId);
  }

  // ==================== ALERTES ====================

  @Post(':tid/alertes/verifier')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async verifierAlertes(
    @Param('tid') tid: string,
    @Body('etudiantId') etudiantId: string,
    @Request() req,
  ) {
    return this.surveillanceService.verifierAlertes(tid, etudiantId, req.user.userId);
  }

  @Post(':tid/alertes')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async creerAlerte(
    @Param('tid') tid: string,
    @Body() dto: { etudiantId: string; type: string; message: string },
    @Request() req,
  ) {
    return this.surveillanceService.creerAlerte(tid, dto.etudiantId, dto.type, dto.message, req.user.userId);
  }

  @Get(':tid/alertes')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN, UserRole.SCOLARITE, UserRole.SECRETAIRE_PARCOURS)
  async getAlertes(
    @Param('tid') tid: string,
    @Query('statut') statut?: string,
    @Query('destinataireRole') destinataireRole?: string,
  ) {
    return this.surveillanceService.getAlertes(tid, statut, destinataireRole);
  }

  @Put(':tid/alertes/:id/traiter')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN, UserRole.SCOLARITE, UserRole.SECRETAIRE_PARCOURS)
  async traiterAlerte(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.surveillanceService.traiterAlerte(tid, id, req.user.userId);
  }

  // ==================== SANCTIONS ====================

  @Post(':tid/sanctions')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async creerSanction(
    @Param('tid') tid: string,
    @Body() dto: { etudiantId: string; incidentId?: string; type: string; dateDebut: Date; dateFin?: Date; motif: string },
    @Request() req,
  ) {
    return this.surveillanceService.creerSanction(tid, dto as any, req.user.userId);
  }

  @Get(':tid/sanctions')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN, UserRole.SCOLARITE)
  async getSanctions(
    @Param('tid') tid: string,
    @Query('etudiantId') etudiantId?: string,
  ) {
    return this.surveillanceService.getSanctions(tid, etudiantId);
  }

  // ==================== EXAMENS ====================

  @Post(':tid/examens/config')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async configurerSalleExamen(
    @Param('tid') tid: string,
    @Body() dto: { sessionExamenId: string; salleId: string; placesTotal: number; planPlaces?: any[] },
    @Request() req,
  ) {
    return this.surveillanceService.configurerSalleExamen(tid, dto, req.user.userId);
  }

  @Post(':tid/examens/:configId/place')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async attribuerPlace(
    @Param('tid') tid: string,
    @Param('configId') configId: string,
    @Body() dto: { etudiantId: string; place: string; rangee: string },
  ) {
    return this.surveillanceService.attribuerPlace(tid, configId, dto.etudiantId, dto.place, dto.rangee);
  }

  @Post(':tid/examens/:configId/incident')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async signalerIncidentExamen(
    @Param('tid') tid: string,
    @Param('configId') configId: string,
    @Body('rapport') rapport: string,
    @Request() req,
  ) {
    return this.surveillanceService.signalerIncidentExamen(tid, configId, rapport, req.user.userId);
  }

  // ==================== ABSENCES & RETARDS ====================

  @Get(':tid/absences')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN, UserRole.SCOLARITE)
  async getAbsences(
    @Param('tid') tid: string,
    @Query('date') date?: string,
    @Query('type') type?: string,
  ) {
    return this.surveillanceService.getAbsences(tid, date, type);
  }

  @Patch(':tid/absences/:id/justifier')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async justifierAbsence(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.surveillanceService.justifierAbsence(tid, id, req.user.userId);
  }

  // ==================== EXAMENS ====================

  @Get(':tid/examens')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async getExamens(
    @Param('tid') tid: string,
    @Query('date') date?: string,
  ) {
    return this.surveillanceService.getExamens(tid, date);
  }

  // ==================== DASHBOARD ====================

  @Get(':tid/dashboard')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async getDashboard(@Param('tid') tid: string) {
    return this.surveillanceService.getDashboardSurveillance(tid);
  }
}

// Made with Bob
