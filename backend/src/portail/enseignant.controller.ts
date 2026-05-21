import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, UploadedFile, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { PortailEnseignantService } from './enseignant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Portail Enseignant - Espace enseignant')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('enseignant', 'responsable_pedagogique', 'admin')
@Controller('portail/enseignant')
export class PortailEnseignantController {
  constructor(private readonly svc: PortailEnseignantService) {}

  private getTenantId(req: Request): string | null {
    // First, try to get the tenantId that was set by the TenantMiddleware
    const reqAny = req as any;
    if (reqAny.tenantId !== undefined) {
      return reqAny.tenantId;
    }

    // Fallback to our own extraction
    let tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      tenantId = req.headers['X-Tenant-ID'] as string;
    }

    if (!tenantId && req.query && req.query.tenantId) {
      tenantId = req.query.tenantId as string;
    }

    if (!tenantId) {
      const pathParts = req.path.split('/');
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const foundId = pathParts.find(part => uuidPattern.test(part));
      if (foundId) {
        tenantId = foundId;
      }
    }

    return tenantId || null;
  }

  // ========== PROFIL & MES COURS ==========
  @Get('profil')
  @ApiOperation({ summary: 'Profil de l\'enseignant' })
  getProfil(@CurrentUser() user: any) {
    return this.svc.getProfil(user.id);
  }

  @Get('mes-cours')
  @ApiOperation({ summary: 'Liste des cours assignés' })
  async getMesCours(
    @CurrentUser() user: any,
    @Query('anneeAcademiqueId') anneeAcademiqueId: string,
    @Req() req: Request,
  ) {
    const tenantId = this.getTenantId(req);
    console.log('[getMesCours] tenantId:', tenantId, 'userId:', user.id, 'anneeAcademiqueId:', anneeAcademiqueId);
    try {
      const result = await this.svc.getMesCours(tenantId, user.id, anneeAcademiqueId);
      console.log('[getMesCours] SUCCESS - returned', result?.length || 0, 'courses');
      return result;
    } catch (error) {
      console.error('[getMesCours] ERROR:', error instanceof Error ? error.message : String(error));
      console.error('[getMesCours] Stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  @Get('mes-etudiants/:affectationId')
  @ApiOperation({ summary: 'Liste des étudiants de mon cours' })
  getMesEtudiants(@Param('affectationId') affectationId: string) {
    return this.svc.getEtudiantsParCours(affectationId);
  }

  // ========== SUPPORTS DE COURS ==========
  @Post('supports-cours')
  @ApiOperation({ summary: 'Déposer un support de cours' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('fichier'))
  uploadSupportCours(
    @Body() dto: any,
    @UploadedFile() fichier: any,
    @CurrentUser() user: any,
  ) {
    return this.svc.uploadSupportCours({ ...dto, fichierUrl: fichier?.path }, user.id);
  }

  @Get('supports-cours')
  @ApiOperation({ summary: 'Mes supports de cours' })
  getSupportsCours(@CurrentUser() user: any, @Query('ecId') ecId: string, @Req() req: Request) {
    return this.svc.getSupportsCours(this.getTenantId(req), user.id, ecId);
  }

  @Post('supports-cours/:id/partager')
  @ApiOperation({ summary: 'Partager avec une classe/parcours' })
  partagerSupport(@Param('id') id: string, @Body('parcoursIds') parcoursIds: string[]) {
    return this.svc.partagerSupport(id, parcoursIds);
  }

  // ========== PRÉSENCES ==========
  @Get('seances/aujourdhui')
  @ApiOperation({ summary: 'Mes séances du jour' })
  getSeancesAujourdhui(@CurrentUser() user: any) {
    return this.svc.getSeancesAujourdhui(user.id);
  }

  @Get('seances/:seanceId/presences')
  @ApiOperation({ summary: 'Liste des présences pour une séance' })
  getPresencesSeance(@Param('seanceId') seanceId: string) {
    return this.svc.getPresencesSeance(seanceId);
  }

  @Post('seances/:seanceId/pointer')
  @ApiOperation({ summary: 'Pointer les présences' })
  pointerPresences(
    @Param('seanceId') seanceId: string,
    @Body() presences: { etudiantId: string; statut: 'present' | 'absent' | 'retard' }[],
    @CurrentUser() user: any,
  ) {
    return this.svc.pointerPresences(seanceId, presences, user.id);
  }

  @Post('seances/:seanceId/pointer-qr')
  @ApiOperation({ summary: 'Pointer via QR Code' })
  pointerPresenceQR(
    @Param('seanceId') seanceId: string,
    @Body('qrData') qrData: string,
    @CurrentUser() user: any,
  ) {
    return this.svc.pointerPresenceQR(seanceId, qrData, user.id);
  }

  @Get('mon-qr')
  @ApiOperation({ summary: 'Générer mon QR Code pour pointage' })
  getMonQR(@CurrentUser() user: any) {
    return this.svc.genererQREnseignant(user.id);
  }

  // ========== NOTES ==========
  @Get('sessions-evaluation')
  @ApiOperation({ summary: 'Sessions d\'évaluation disponibles' })
  async getSessionsEvaluation(@CurrentUser() user: any, @Req() req: Request) {
    const tenantId = this.getTenantId(req);
    console.log('[getSessionsEvaluation] tenantId:', tenantId, 'userId:', user.id);
    try {
      const result = await this.svc.getSessionsEvaluation(tenantId, user.id);
      console.log('[getSessionsEvaluation] SUCCESS - returned', result?.length || 0, 'sessions');
      return result;
    } catch (error) {
      console.error('[getSessionsEvaluation] ERROR:', error instanceof Error ? error.message : String(error));
      console.error('[getSessionsEvaluation] Stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  @Get('notes/saisie/:sessionId/:affectationId')
  @ApiOperation({ summary: 'Interface de saisie des notes' })
  getInterfaceSaisieNotes(
    @Param('sessionId') sessionId: string,
    @Param('affectationId') affectationId: string,
  ) {
    return this.svc.getInterfaceSaisieNotes(sessionId, affectationId);
  }

  @Post('notes')
  @ApiOperation({ summary: 'Saisir des notes' })
  saisirNotes(
    @Body() notes: { etudiantId: string; valeur: number; appreciation?: string }[],
    @Body('sessionId') sessionId: string,
    @Body('ecId') ecId: string,
    @CurrentUser() user: any,
  ) {
    return this.svc.saisirNotes(notes, sessionId, ecId, user.id);
  }

  @Patch('notes/:id/modifier')
  @ApiOperation({ summary: 'Modifier une note (avant verrouillage)' })
  modifierNote(
    @Param('id') noteId: string,
    @Body() dto: { valeur?: number; appreciation?: string },
    @CurrentUser() user: any,
  ) {
    return this.svc.modifierNote(noteId, dto, user.id);
  }

  @Get('notes/apercu/:sessionId/:affectationId')
  @ApiOperation({ summary: 'Aperçu des notes avant validation' })
  getApercuNotes(
    @Param('sessionId') sessionId: string,
    @Param('affectationId') affectationId: string,
  ) {
    return this.svc.getApercuNotes(sessionId, affectationId);
  }

  // ========== SUJETS D'EXAMEN ==========
  @Post('sujets-examens')
  @ApiOperation({ summary: 'Déposer un sujet d\'examen' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('fichierSujet'))
  deposerSujetExamen(
    @Body() dto: any,
    @UploadedFile() fichierSujet: any,
    @CurrentUser() user: any,
  ) {
    return this.svc.deposerSujetExamen({
      ...dto,
      fichierSujetUrl: fichierSujet?.path,
      deposePar: user.id,
    });
  }

  @Post('sujets-examens/:id/correction')
  @ApiOperation({ summary: 'Déposer la correction' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('fichierCorrection'))
  deposerCorrection(
    @Param('id') id: string,
    @UploadedFile() fichierCorrection: any,
    @CurrentUser() user: any,
  ) {
    return this.svc.deposerCorrection(id, fichierCorrection?.path, user.id);
  }

  @Get('mes-sujets')
  @ApiOperation({ summary: 'Mes sujets déposés' })
  getMesSujets(@CurrentUser() user: any) {
    return this.svc.getMesSujets(user.id);
  }

  // ========== MESSAGERIE AVEC ÉTUDIANTS ==========
  @Post('messages/envoyer-groupe')
  @ApiOperation({ summary: 'Envoyer message à un groupe d\'étudiants' })
  envoyerMessageGroupe(
    @Body() dto: { parcoursId?: string; niveau?: number; affectationId?: string; message: string; sujet?: string },
    @CurrentUser() user: any,
  ) {
    return this.svc.envoyerMessageGroupe(dto, user.id);
  }

  @Post('messages/envoyer-individuel')
  @ApiOperation({ summary: 'Envoyer message à un étudiant' })
  envoyerMessageIndividuel(
    @Body() dto: { etudiantId: string; message: string; sujet?: string },
    @CurrentUser() user: any,
  ) {
    return this.svc.envoyerMessageIndividuel(dto, user.id);
  }

  @Get('mes-messages')
  @ApiOperation({ summary: 'Mes messages reçus et envoyés' })
  getMesMessages(@CurrentUser() user: any, @Req() req: Request) {
    return this.svc.getMesMessages(this.getTenantId(req), user.id);
  }

  // ========== STAGES & MÉMOIRES ==========
  @Get('stages/supervises')
  @ApiOperation({ summary: 'Stages/mémoires que je supervise' })
  getStagesSupervises(@CurrentUser() user: any) {
    return this.svc.getStagesSupervises(user.id);
  }

  @Post('stages/:id/fiche-suivi')
  @ApiOperation({ summary: 'Remplir fiche de suivi de stage' })
  remplirFicheSuivi(@Param('id') stageId: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.svc.remplirFicheSuivi(stageId, dto, user.id);
  }

  @Post('soutenances/:id/evaluer')
  @ApiOperation({ summary: 'Évaluer une soutenance' })
  evaluerSoutenance(
    @Param('id') soutenanceId: string,
    @Body() dto: { note: number; appreciation: string },
    @CurrentUser() user: any,
  ) {
    return this.svc.evaluerSoutenance(soutenanceId, dto, user.id);
  }

  // ========== DEMANDES DE RESSOURCES ==========
  @Post('demandes-ressources')
  @ApiOperation({ summary: 'Demander des ressources (labo, salle, matériel)' })
  demanderRessources(@Body() dto: any, @CurrentUser() user: any) {
    return this.svc.demanderRessources(dto, user.id);
  }

  @Get('mes-demandes-ressources')
  @ApiOperation({ summary: 'Mes demandes de ressources' })
  getMesDemandesRessources(@CurrentUser() user: any, @Req() req: Request) {
    return this.svc.getMesDemandesRessources(this.getTenantId(req), user.id);
  }

  @Get('salles-disponibles')
  @ApiOperation({ summary: 'Vérifier disponibilité des salles' })
  getSallesDisponibles(
    @Query('date') date: string,
    @Query('heureDebut') heureDebut: string,
    @Query('heureFin') heureFin: string,
    @Query('type') type?: string,
  ) {
    return this.svc.getSallesDisponibles(date, heureDebut, heureFin, type);
  }

  // ========== MES STATISTIQUES ==========
  @Get('mes-stats')
  @ApiOperation({ summary: 'Statistiques de mes cours' })
  async getMesStats(
    @CurrentUser() user: any,
    @Query('anneeAcademiqueId') anneeAcademiqueId: string,
    @Req() req: Request,
  ) {
    const tenantId = this.getTenantId(req);
    console.log('[getMesStats] tenantId:', tenantId, 'userId:', user.id, 'anneeAcademiqueId:', anneeAcademiqueId);
    try {
      const result = await this.svc.getMesStats(tenantId, user.id, anneeAcademiqueId);
      console.log('[getMesStats] SUCCESS - returned stats');
      return result;
    } catch (error) {
      console.error('[getMesStats] ERROR:', error instanceof Error ? error.message : String(error));
      console.error('[getMesStats] Stack:', error instanceof Error ? error.stack : 'No stack trace');
      throw error;
    }
  }

  @Get('mes-stats/taux-reussite/:affectationId')
  @ApiOperation({ summary: 'Taux de réussite par EC' })
  getTauxReussiteEC(@Param('affectationId') affectationId: string) {
    return this.svc.getTauxReussiteEC(affectationId);
  }

  // ========== GÉNÉRATION DE COURS ==========
  @Post('cours/unite-enseignement')
  @ApiOperation({ summary: 'Créer une unité d\'enseignement' })
  creerUniteEnseignement(@Body() dto: any, @CurrentUser() user: any) {
    return this.svc.creerUniteEnseignement(dto, user.id);
  }

  @Patch('cours/unite-enseignement/:id')
  @ApiOperation({ summary: 'Modifier une unité d\'enseignement' })
  modifierUniteEnseignement(
    @Param('id') ueId: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.svc.modifierUniteEnseignement(ueId, dto, user.id);
  }

  @Get('cours/mes-unites-enseignement')
  @ApiOperation({ summary: 'Liste de mes unités d\'enseignement' })
  getMesUnitesEnseignement(@CurrentUser() user: any, @Req() req: Request) {
    return this.svc.getMesUnitesEnseignement(this.getTenantId(req), user.id);
  }

  @Post('cours/element-constitutif')
  @ApiOperation({ summary: 'Créer un élément constitutif' })
  creerElementConstitutif(@Body() dto: any, @CurrentUser() user: any) {
    return this.svc.creerElementConstitutif(dto, user.id);
  }

  @Patch('cours/element-constitutif/:id')
  @ApiOperation({ summary: 'Modifier un élément constitutif' })
  modifierElementConstitutif(
    @Param('id') ecId: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.svc.modifierElementConstitutif(ecId, dto, user.id);
  }

  @Delete('cours/element-constitutif/:id')
  @ApiOperation({ summary: 'Supprimer un élément constitutif' })
  supprimerElementConstitutif(@Param('id') ecId: string, @CurrentUser() user: any) {
    return this.svc.supprimerElementConstitutif(ecId, user.id);
  }

  @Get('cours/unite-enseignement/:ueId/elements')
  @ApiOperation({ summary: 'Liste des éléments constitutifs d\'une UE' })
  getElementsConstitutifs(@Param('ueId') ueId: string, @CurrentUser() user: any) {
    return this.svc.getElementsConstitutifs(ueId, user.id);
  }

  @Get('cours/unite-enseignement/:ueId/plan-cours')
  @ApiOperation({ summary: 'Générer le plan de cours d\'une UE' })
  genererPlanCours(@Param('ueId') ueId: string, @CurrentUser() user: any) {
    return this.svc.genererPlanCours(ueId, user.id);
  }

  @Post('cours/unite-enseignement/:ueId/dupliquer')
  @ApiOperation({ summary: 'Dupliquer une unité d\'enseignement' })
  dupliquerUniteEnseignement(
    @Param('ueId') ueId: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.svc.dupliquerUniteEnseignement(ueId, dto, user.id);
  }

  @Get('cours/parcours-disponibles')
  @ApiOperation({ summary: 'Liste des parcours disponibles pour créer des cours' })
  getParcoursDisponibles(@Req() req: Request) {
    return this.svc.getParcoursDisponibles(this.getTenantId(req));
  }
}
