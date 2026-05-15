import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PortailEtudiantService } from './etudiant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Portail Étudiant - Espace personnel')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('portail/:tid')
export class PortailEtudiantController {
  constructor(private readonly svc: PortailEtudiantService) {}

  // Endpoint de recherche d'étudiants (accessible par surveillants, admin, etc.)
  @Get('etudiants/search')
  @Roles('surveillant', 'surveillant_general', 'admin', 'secretaire', 'responsable_pedagogique')
  @ApiOperation({ summary: 'Rechercher des étudiants par nom, prénom ou matricule' })
  async searchEtudiants(
    @Param('tid') tid: string,
    @Query('q') query: string
  ) {
    return this.svc.searchEtudiants(query);
  }

  // Routes pour les étudiants
  @Roles('etudiant')

  @Get('etudiant/profil')
  @ApiOperation({ summary: 'Profil de l\'étudiant connecté' })
  getProfil(@Param('tid') tid: string, @CurrentUser() user: any) {
    return this.svc.getProfil(user.id);
  }

  @Get('etudiant/emploi-du-temps')
  @ApiOperation({ summary: 'Emploi du temps de l\'étudiant' })
  getEmploiDuTemps(
    @Param('tid') tid: string,
    @CurrentUser() user: any,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
  ) {
    return this.svc.getEmploiDuTemps(user.id, dateDebut, dateFin);
  }

  @Get('etudiant/notes')
  @ApiOperation({ summary: 'Notes de l\'étudiant' })
  getNotes(@Param('tid') tid: string, @CurrentUser() user: any, @Query('sessionId') sessionId?: string) {
    return this.svc.getNotes(user.id, sessionId);
  }

  @Get('etudiant/moyennes')
  @ApiOperation({ summary: 'Moyennes par semestre/UE' })
  getMoyennes(@Param('tid') tid: string, @CurrentUser() user: any) {
    return this.svc.getMoyennes(user.id);
  }

  @Get('etudiant/paiements')
  @ApiOperation({ summary: 'Historique des paiements' })
  getPaiements(@Param('tid') tid: string, @CurrentUser() user: any) {
    return this.svc.getPaiements(user.id);
  }

  @Get('etudiant/solde')
  @ApiOperation({ summary: 'Solde des frais de scolarité' })
  getSolde(@Param('tid') tid: string, @CurrentUser() user: any) {
    return this.svc.getSolde(user.id);
  }

  @Get('etudiant/absences')
  @ApiOperation({ summary: 'Historique des absences' })
  getAbsences(@Param('tid') tid: string, @CurrentUser() user: any) {
    return this.svc.getAbsences(user.id);
  }

  @Post('etudiant/justifier-absence')
  @ApiOperation({ summary: 'Déposer un justificatif d\'absence' })
  justifierAbsence(@Param('tid') tid: string, @CurrentUser() user: any, @Body() dto: any) {
    return this.svc.justifierAbsence(user.id, dto);
  }

  @Get('etudiant/documents')
  @ApiOperation({ summary: 'Documents disponibles' })
  getDocuments(@Param('tid') tid: string, @CurrentUser() user: any) {
    return this.svc.getDocuments(user.id);
  }

  @Get('etudiant/cours-en-ligne')
  @ApiOperation({ summary: 'Supports de cours' })
  getCoursEnLigne(@Param('tid') tid: string, @CurrentUser() user: any) {
    return this.svc.getCoursEnLigne(user.id);
  }

  @Get('etudiant/inscription-examens')
  @ApiOperation({ summary: 'Inscriptions aux examens' })
  getInscriptionExamens(@Param('tid') tid: string, @CurrentUser() user: any) {
    return this.svc.getInscriptionsExamens(user.id);
  }

  @Post('etudiant/inscription-examens')
  @ApiOperation({ summary: 'S\'inscrire à une session d\'examen' })
  inscrireExamen(@Param('tid') tid: string, @CurrentUser() user: any, @Body() dto: { sessionId: string }) {
    return this.svc.inscrireExamen(user.id, dto.sessionId);
  }

  @Get('etudiant/inscriptions')
  @ApiOperation({ summary: 'Liste des inscriptions de l\'étudiant' })
  getInscriptions(@Param('tid') tid: string, @CurrentUser() user: any) {
    return this.svc.getInscriptions(user.id);
  }

  @Get('etudiant/departements')
  @ApiOperation({ summary: 'Liste des départements/filières disponibles' })
  getDepartements(@Param('tid') tid: string) {
    return this.svc.getDepartements();
  }

  @Get('etudiant/parcours-disponibles')
  @ApiOperation({ summary: 'Parcours disponibles pour inscription' })
  getParcoursDisponibles(@Param('tid') tid: string, @CurrentUser() user: any) {
    return this.svc.getParcoursDisponibles(user.id);
  }

  @Get('etudiant/annees-academiques')
  @ApiOperation({ summary: 'Années académiques disponibles' })
  getAnneesAcademiques(@Param('tid') tid: string) {
    return this.svc.getAnneesAcademiques();
  }

  @Get('etudiant/niveaux-etude')
  @ApiOperation({ summary: 'Niveaux d\'études disponibles pour inscription' })
  getNiveauxEtude(@Param('tid') tid: string) {
    return this.svc.getNiveauxEtude();
  }

  @Post('etudiant/inscription')
  @ApiOperation({ summary: 'S\'inscrire à un parcours pour une année académique' })
  createInscription(
    @Param('tid') tid: string, 
    @CurrentUser() user: any, 
    @Body() dto: { 
      parcoursId: string; 
      anneeAcademiqueId: string; 
      anneeNiveau: number; 
      typeInscription?: string;
    }
  ) {
    return this.svc.createInscription(user.id, dto);
  }

  @Patch('etudiant/inscription/:id')
  @ApiOperation({ summary: 'Mettre à jour une inscription' })
  updateInscription(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: any
  ) {
    return this.svc.updateInscription(user.id, id, dto);
  }

  @Delete('etudiant/inscription/:id')
  @ApiOperation({ summary: 'Annuler une inscription' })
  cancelInscription(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    return this.svc.cancelInscription(user.id, id);
  }

  // ==================== ENDPOINTS DE PAIEMENT D'INSCRIPTION ====================

  @Get('etudiant/inscription/:id/montant')
  @ApiOperation({ summary: 'Obtenir le montant à payer pour une inscription' })
  getMontantInscription(
    @Param('tid') tid: string,
    @Param('id') inscriptionId: string,
    @CurrentUser() user: any
  ) {
    return this.svc.getMontantInscription(user.id, inscriptionId);
  }

  @Post('etudiant/paiement-inscription')
  @ApiOperation({ summary: 'Soumettre un paiement d\'inscription' })
  submitPaiement(
    @Param('tid') tid: string,
    @CurrentUser() user: any,
    @Body() dto: {
      inscriptionId: string;
      montant: number;
      methodePaiement: 'virement_bancaire' | 'mobile_money';
      referencePaiement: string;
      datePaiement?: Date;
      preuveUrl?: string;
    }
  ) {
    return this.svc.submitPaiement(user.id, dto);
  }

  @Get('etudiant/paiement-inscription/:inscriptionId/status')
  @ApiOperation({ summary: 'Vérifier le statut des paiements pour une inscription' })
  getPaiementStatus(
    @Param('tid') tid: string,
    @Param('inscriptionId') inscriptionId: string,
    @CurrentUser() user: any
  ) {
    return this.svc.getPaiementStatus(user.id, inscriptionId);
  }

  @Get('etudiant/paiements-inscription')
  @ApiOperation({ summary: 'Liste de tous les paiements d\'inscription de l\'étudiant' })
  getPaiementsInscription(
    @Param('tid') tid: string,
    @CurrentUser() user: any
  ) {
    return this.svc.getPaiementsInscription(user.id);
  }
}
