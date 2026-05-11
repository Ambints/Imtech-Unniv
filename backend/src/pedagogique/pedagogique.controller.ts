import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PedagogiqueService } from './pedagogique.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Pedagogique - Responsable Pédagogique')
@ApiBearerAuth('JWT-auth')
@Controller('pedagogique')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PedagogiqueController {
  constructor(private readonly svc: PedagogiqueService) {}

  // ==================== DASHBOARD ====================
  @Get(':tid/dashboard')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN, UserRole.PRESIDENT)
  @ApiOperation({ summary: 'Dashboard du Responsable Pédagogique' })
  getDashboard(@Param('tid') tid: string, @CurrentUser() user: any) {
    return this.svc.getDashboardData(tid, user.id);
  }

  // ==================== RÉFÉRENTIEL DE COMPÉTENCES ====================
  @Post(':tid/referentiels')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer un référentiel de compétences' })
  createReferentiel(@Param('tid') tid: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.svc.createReferentiel(tid, dto, user.id);
  }

  @Get(':tid/referentiels')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN, UserRole.PROFESSEUR)
  @ApiOperation({ summary: 'Liste des référentiels de compétences' })
  getReferentiels(@Param('tid') tid: string, @Query('parcoursId') parcoursId?: string) {
    return this.svc.getReferentiels(tid, parcoursId);
  }

  @Patch(':tid/referentiels/:id')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier un référentiel' })
  updateReferentiel(@Param('tid') tid: string, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateReferentiel(tid, id, dto);
  }

  @Post(':tid/referentiels/:id/valider')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Valider un référentiel de compétences' })
  validerReferentiel(@Param('tid') tid: string, @Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.validerReferentiel(tid, id, user.id);
  }

  // ==================== MAQUETTES DE FORMATION ====================
  @Post(':tid/maquettes')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer une maquette de formation (UE, EC, crédits ECTS)' })
  createMaquette(@Param('tid') tid: string, @Body() dto: any) {
    return this.svc.createMaquette(tid, dto);
  }

  @Get(':tid/maquettes')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN, UserRole.PROFESSEUR, UserRole.SCOLARITE)
  @ApiOperation({ summary: 'Liste des maquettes de formation' })
  getMaquettes(@Param('tid') tid: string) {
    return this.svc.getMaquettes(tid);
  }

  @Post(':tid/maquettes/:parcoursId/valider')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Valider une maquette de formation' })
  validerMaquette(@Param('tid') tid: string, @Param('parcoursId') parcoursId: string, @CurrentUser() user: any) {
    return this.svc.validerMaquette(tid, parcoursId, user.id);
  }

  // ==================== AFFECTATION DES ENSEIGNANTS ====================
  @Post(':tid/affectations')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN, UserRole.SECRETAIRE_PARCOURS)
  @ApiOperation({ summary: 'Affecter un enseignant à un cours' })
  affecterEnseignant(@Param('tid') tid: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.svc.affecterEnseignant(tid, dto, user.id);
  }

  @Get(':tid/affectations')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN, UserRole.PROFESSEUR, UserRole.SECRETAIRE_PARCOURS)
  @ApiOperation({ summary: 'Liste des affectations d\'enseignants' })
  getAffectations(@Param('tid') tid: string, @Query('anneeAcademiqueId') anneeId?: string) {
    return this.svc.getAffectations(tid, anneeId);
  }

  @Patch(':tid/affectations/:id')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier une affectation' })
  updateAffectation(@Param('tid') tid: string, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateAffectation(tid, id, dto);
  }

  @Delete(':tid/affectations/:id')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Supprimer une affectation' })
  deleteAffectation(@Param('tid') tid: string, @Param('id') id: string) {
    return this.svc.deleteAffectation(tid, id);
  }

  // ==================== CONTENUS DE COURS ====================
  @Post(':tid/contenus')
  @Roles(UserRole.PROFESSEUR, UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer/soumettre un contenu de cours' })
  createContenuCours(@Param('tid') tid: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.svc.createContenuCours(tid, dto, user.id);
  }

  @Get(':tid/contenus')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN, UserRole.PROFESSEUR)
  @ApiOperation({ summary: 'Liste des contenus de cours' })
  getContenusCours(@Param('tid') tid: string, @Query('ueId') ueId?: string) {
    return this.svc.getContenusCours(tid, ueId);
  }

  @Post(':tid/contenus/:id/valider')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Valider un contenu de cours' })
  validerContenuCours(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() body: { commentaires?: string },
    @CurrentUser() user: any
  ) {
    return this.svc.validerContenuCours(tid, id, user.id, body.commentaires);
  }

  @Post(':tid/contenus/:id/rejeter')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Rejeter un contenu de cours' })
  rejeterContenuCours(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() body: { commentaires: string }
  ) {
    return this.svc.rejeterContenuCours(tid, id, body.commentaires);
  }

  // ==================== SUJETS D'EXAMENS ====================
  @Post(':tid/sujets')
  @Roles(UserRole.PROFESSEUR, UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Soumettre un sujet d\'examen' })
  createSujetExamen(@Param('tid') tid: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.svc.createSujetExamen(tid, dto, user.id);
  }

  @Get(':tid/sujets')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN, UserRole.PROFESSEUR)
  @ApiOperation({ summary: 'Liste des sujets d\'examen' })
  getSujetsExamen(
    @Param('tid') tid: string,
    @Query('sessionId') sessionId?: string,
    @Query('statut') statut?: string
  ) {
    return this.svc.getSujetsExamen(tid, sessionId, statut);
  }

  @Post(':tid/sujets/:id/relire')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Relire un sujet d\'examen (workflow de relecture)' })
  relireSujetExamen(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() body: { commentaires?: string },
    @CurrentUser() user: any
  ) {
    return this.svc.relireSujetExamen(tid, id, user.id, body.commentaires);
  }

  @Post(':tid/sujets/:id/valider')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Valider un sujet d\'examen' })
  validerSujetExamen(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() body: { commentaires?: string },
    @CurrentUser() user: any
  ) {
    return this.svc.validerSujetExamen(tid, id, user.id, body.commentaires);
  }

  @Post(':tid/sujets/:id/rejeter')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Rejeter un sujet d\'examen' })
  rejeterSujetExamen(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() body: { motifRejet: string }
  ) {
    return this.svc.rejeterSujetExamen(tid, id, body.motifRejet);
  }

  // ==================== PROCÈS-VERBAUX DE DÉLIBÉRATION ====================
  @Post(':tid/proces-verbaux')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer un procès-verbal de délibération' })
  createProcesVerbal(@Param('tid') tid: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.svc.createProcesVerbal(tid, dto, user.id);
  }

  @Get(':tid/proces-verbaux')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN, UserRole.SCOLARITE)
  @ApiOperation({ summary: 'Liste des procès-verbaux' })
  getProcesVerbaux(
    @Param('tid') tid: string,
    @Query('parcoursId') parcoursId?: string,
    @Query('sessionId') sessionId?: string
  ) {
    return this.svc.getProcesVerbaux(tid, parcoursId, sessionId);
  }

  @Post(':tid/proces-verbaux/:id/valider')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Valider un procès-verbal (avec proposition de notes finales)' })
  validerProcesVerbal(@Param('tid') tid: string, @Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.validerProcesVerbal(tid, id, user.id);
  }

  // ==================== STAGES ET MÉMOIRES ====================
  @Post(':tid/stages-memoires')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN, UserRole.SCOLARITE)
  @ApiOperation({ summary: 'Créer un suivi de stage/mémoire' })
  createStageMemoire(@Param('tid') tid: string, @Body() dto: any) {
    return this.svc.createStageMemoire(tid, dto);
  }

  @Get(':tid/stages-memoires')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN, UserRole.PROFESSEUR, UserRole.ETUDIANT)
  @ApiOperation({ summary: 'Liste des stages et mémoires' })
  getStagesMemoires(
    @Param('tid') tid: string,
    @Query('parcoursId') parcoursId?: string,
    @Query('etudiantId') etudiantId?: string
  ) {
    return this.svc.getStagesMemoires(tid, parcoursId, etudiantId);
  }

  @Patch(':tid/stages-memoires/:id')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN, UserRole.PROFESSEUR)
  @ApiOperation({ summary: 'Mettre à jour un stage/mémoire' })
  updateStageMemoire(@Param('tid') tid: string, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateStageMemoire(tid, id, dto);
  }

  @Post(':tid/stages-memoires/:id/valider')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Valider une fiche de suivi de stage/mémoire' })
  validerStageMemoire(@Param('tid') tid: string, @Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.validerStageMemoire(tid, id, user.id);
  }

  // ==================== SOUTENANCES ====================
  @Post(':tid/soutenances')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Organiser une soutenance' })
  createSoutenance(@Param('tid') tid: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.svc.createSoutenance(tid, dto, user.id);
  }

  @Get(':tid/soutenances')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN, UserRole.PROFESSEUR, UserRole.ETUDIANT)
  @ApiOperation({ summary: 'Liste des soutenances' })
  getSoutenances(@Param('tid') tid: string, @Query('date') date?: string) {
    return this.svc.getSoutenances(tid, date);
  }

  @Patch(':tid/soutenances/:id')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Modifier une soutenance' })
  updateSoutenance(@Param('tid') tid: string, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateSoutenance(tid, id, dto);
  }

  // ==================== STATISTIQUES ET PERFORMANCES ====================
  @Post(':tid/statistiques/calculer')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Calculer les statistiques d\'un parcours' })
  calculerStatistiques(
    @Param('tid') tid: string,
    @Body() body: { parcoursId: string; anneeAcademiqueId: string }
  ) {
    return this.svc.calculerStatistiques(tid, body.parcoursId, body.anneeAcademiqueId);
  }

  @Get(':tid/statistiques')
  @Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN, UserRole.PRESIDENT)
  @ApiOperation({ summary: 'Statistiques et performances par parcours (taux de réussite, assiduité)' })
  getStatistiques(@Param('tid') tid: string, @Query('parcoursId') parcoursId?: string) {
    return this.svc.getStatistiques(tid, parcoursId);
  }
}

// Made with Bob
