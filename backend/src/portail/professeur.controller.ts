import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PortailProfesseurService } from './professeur.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Portail Professeur - Espace enseignant')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('professeur', 'responsable_pedagogique', 'admin')
@Controller('portail/professeur')
export class PortailProfesseurController {
  constructor(private readonly svc: PortailProfesseurService) {}

  // ========== PROFIL & MES COURS ==========
  @Get('profil')
  @ApiOperation({ summary: 'Profil de l\'enseignant' })
  getProfil(@CurrentUser() user: any) {
    return this.svc.getProfil(user.id);
  }

  @Get('mes-cours')
  @ApiOperation({ summary: 'Liste des cours assignés' })
  getMesCours(
    @CurrentUser() user: any,
    @Query('anneeAcademiqueId') anneeAcademiqueId?: string,
  ) {
    return this.svc.getMesCours(user.id, anneeAcademiqueId);
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
  getSupportsCours(@CurrentUser() user: any, @Query('ecId') ecId?: string) {
    return this.svc.getSupportsCours(user.id, ecId);
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
    return this.svc.genererQRProfesseur(user.id);
  }

  // ========== NOTES ==========
  @Get('sessions-evaluation')
  @ApiOperation({ summary: 'Sessions d\'évaluation disponibles' })
  getSessionsEvaluation(@CurrentUser() user: any) {
    return this.svc.getSessionsEvaluation(user.id);
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
  getMesDemandesRessources(@CurrentUser() user: any) {
    return this.svc.getMesDemandesRessources(user.id);
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
  getMesStats(@CurrentUser() user: any, @Query('anneeAcademiqueId') anneeAcademiqueId?: string) {
    return this.svc.getMesStats(user.id, anneeAcademiqueId);
  }

  @Get('mes-stats/taux-reussite/:affectationId')
  @ApiOperation({ summary: 'Taux de réussite par EC' })
  getTauxReussiteEC(@Param('affectationId') affectationId: string) {
    return this.svc.getTauxReussiteEC(affectationId);
  }
}
