import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommunicationService } from './communication.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Communication - Actualités, événements, campagnes')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('communication')
export class CommunicationController {
  constructor(private readonly svc: CommunicationService) {}

  // ========== ANNONCES & ACTUALITÉS ==========
  @Post('annonces')
  @Roles('communication', 'admin', 'secretaire', 'president')
  @ApiOperation({ summary: 'Créer une annonce/actualité' })
  @ApiResponse({ status: 201, description: 'Annonce créée' })
  createAnnonce(@Body() dto: any, @CurrentUser() user: any) {
    return this.svc.createAnnonce({ ...dto, auteurId: user.id });
  }

  @Get('annonces')
  @ApiOperation({ summary: 'Liste des annonces publiques' })
  findAnnonces(@Query('cible') cible?: string, @Query('type') type?: string) {
    return this.svc.findAnnoncesPubliees(cible, type);
  }

  @Get('annonces/admin')
  @Roles('communication', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Toutes les annonces (admin)' })
  findAllAnnonces(@Query() filters: any) {
    return this.svc.findAllAnnonces(filters);
  }

  @Get('annonces/:id')
  @ApiOperation({ summary: 'Détail d\'une annonce' })
  findAnnonceById(@Param('id') id: string) {
    return this.svc.findAnnonceById(id);
  }

  @Patch('annonces/:id/publier')
  @Roles('communication', 'admin', 'president')
  @ApiOperation({ summary: 'Publier une annonce' })
  publierAnnonce(@Param('id') id: string) {
    return this.svc.publierAnnonce(id);
  }

  @Patch('annonces/:id/depublier')
  @Roles('communication', 'admin', 'president')
  @ApiOperation({ summary: 'Dépublier une annonce' })
  depublierAnnonce(@Param('id') id: string) {
    return this.svc.depublierAnnonce(id);
  }

  @Delete('annonces/:id')
  @Roles('communication', 'admin')
  @ApiOperation({ summary: 'Supprimer une annonce' })
  deleteAnnonce(@Param('id') id: string) {
    return this.svc.deleteAnnonce(id);
  }

  @Post('annonces/:id/dupliquer')
  @Roles('communication', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Dupliquer une annonce' })
  dupliquerAnnonce(@Param('id') id: string, @CurrentUser() user: any) {
    return this.svc.dupliquerAnnonce(id, user.id);
  }

  // ========== CALENDRIER ÉVÉNEMENTIEL ==========
  @Post('evenements')
  @Roles('communication', 'admin', 'secretaire', 'pastoral')
  @ApiOperation({ summary: 'Créer un événement (conférence, messe, cérémonie)' })
  createEvenement(@Body() dto: any, @CurrentUser() user: any) {
    return this.svc.createEvenement({ ...dto, auteurId: user.id });
  }

  @Get('evenements')
  @ApiOperation({ summary: 'Calendrier événementiel' })
  findEvenements(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('type') type?: string,
  ) {
    return this.svc.findEvenements(dateDebut, dateFin, type);
  }

  @Get('evenements/avenir')
  @ApiOperation({ summary: 'Événements à venir' })
  findEvenementsAvenir(@Query('limit') limit: number = 10) {
    return this.svc.findEvenementsAvenir(limit);
  }

  @Patch('evenements/:id')
  @Roles('communication', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Modifier un événement' })
  updateEvenement(@Param('id') id: string, @Body() dto: any) {
    return this.svc.updateEvenement(id, dto);
  }

  // ========== CAMPAGNES D'INSCRIPTION ==========
  @Post('campagnes')
  @Roles('communication', 'admin', 'secretaire', 'scolarite')
  @ApiOperation({ summary: 'Lancer une campagne d\'inscription' })
  createCampagne(@Body() dto: any, @CurrentUser() user: any) {
    return this.svc.createCampagne({ ...dto, auteurId: user.id });
  }

  @Get('campagnes')
  @Roles('communication', 'admin', 'secretaire', 'scolarite')
  @ApiOperation({ summary: 'Liste des campagnes' })
  findCampagnes(@Query('statut') statut?: string) {
    return this.svc.findCampagnes(statut);
  }

  @Patch('campagnes/:id/activer')
  @Roles('communication', 'admin', 'scolarite')
  @ApiOperation({ summary: 'Activer une campagne' })
  activerCampagne(@Param('id') id: string) {
    return this.svc.activerCampagne(id);
  }

  @Post('campagnes/:id/envoyer')
  @Roles('communication', 'admin', 'scolarite')
  @ApiOperation({ summary: 'Envoyer la campagne ciblée' })
  envoyerCampagne(@Param('id') id: string) {
    return this.svc.envoyerCampagne(id);
  }

  // ========== NOTIFICATIONS CIBLÉES ==========
  @Post('notifications/envoyer')
  @Roles('communication', 'admin', 'secretaire', 'surveillant_general')
  @ApiOperation({ summary: 'Envoi ciblé d\'informations (par filière, année, niveau)' })
  envoyerNotificationCiblee(@Body() dto: any) {
    return this.svc.envoyerNotificationCiblee(dto);
  }

  @Get('notifications/stats')
  @Roles('communication', 'admin')
  @ApiOperation({ summary: 'Stats des notifications envoyées' })
  getStatsNotifications(@Query('dateDebut') dateDebut?: string, @Query('dateFin') dateFin?: string) {
    return this.svc.getStatsNotifications(dateDebut, dateFin);
  }

  // ========== ALERTES INSTITUTIONNELLES ==========
  @Post('alertes')
  @Roles('communication', 'admin', 'president', 'surveillant_general', 'pastoral')
  @ApiOperation({ summary: 'Créer une alerte institutionnelle (fermeture, grève, pastoral)' })
  createAlerte(@Body() dto: any, @CurrentUser() user: any) {
    return this.svc.createAlerte({ ...dto, auteurId: user.id });
  }

  @Get('alertes/actives')
  @ApiOperation({ summary: 'Alertes actuellement actives' })
  findAlertesActives() {
    return this.svc.findAlertesActives();
  }

  @Patch('alertes/:id/desactiver')
  @Roles('communication', 'admin', 'president')
  @ApiOperation({ summary: 'Désactiver une alerte' })
  desactiverAlerte(@Param('id') id: string) {
    return this.svc.desactiverAlerte(id);
  }

  // ========== PUBLICATION DES RÉSULTATS ==========
  @Post('resultats/publier')
  @Roles('communication', 'admin', 'secretaire', 'scolarite')
  @ApiOperation({ summary: 'Publier les résultats d\'examens (avec masquage partiel)' })
  publierResultats(@Body() dto: any) {
    return this.svc.publierResultats(dto);
  }

  @Get('resultats/verification')
  @Roles('communication', 'admin', 'scolarite')
  @ApiOperation({ summary: 'Vérifier les résultats avant publication' })
  verifierResultats(@Query('sessionId') sessionId: string) {
    return this.svc.verifierResultats(sessionId);
  }

  // ========== RÉSEAUX SOCIAUX & SITE WEB ==========
  @Post('social/publier')
  @Roles('communication', 'admin')
  @ApiOperation({ summary: 'Publier sur réseaux sociaux' })
  publierSurReseaux(@Body() dto: any) {
    return this.svc.publierSurReseaux(dto);
  }

  @Get('social/stats')
  @Roles('communication', 'admin', 'president')
  @ApiOperation({ summary: 'Statistiques des réseaux sociaux' })
  getStatsReseaux() {
    return this.svc.getStatsReseaux();
  }

  // ========== MESSAGERIE INTERNE ==========
  @Post('messages')
  @ApiOperation({ summary: 'Envoyer un message interne' })
  envoyerMessage(@Body() dto: any, @CurrentUser() user: any) {
    return this.svc.envoyerMessage({ ...dto, expediteurId: user.id });
  }

  @Get('messages/recus')
  @ApiOperation({ summary: 'Messages reçus' })
  getMessagesRecus(@CurrentUser() user: any, @Query('nonLus') nonLus?: boolean) {
    return this.svc.getMessagesRecus(user.id, nonLus);
  }

  @Get('messages/envoyes')
  @ApiOperation({ summary: 'Messages envoyés' })
  getMessagesEnvoyes(@CurrentUser() user: any) {
    return this.svc.getMessagesEnvoyes(user.id);
  }

  @Patch('messages/:id/lu')
  @ApiOperation({ summary: 'Marquer comme lu' })
  marquerLu(@Param('id') id: string) {
    return this.svc.marquerMessageLu(id);
  }

  // ========== FORUMS & ESPACES COMMUNAUTAIRES ==========
  @Post('forums/sujets')
  @Roles('communication', 'admin', 'professeur', 'etudiant')
  @ApiOperation({ summary: 'Créer un sujet de forum' })
  createSujetForum(@Body() dto: any, @CurrentUser() user: any) {
    return this.svc.createSujetForum({ ...dto, auteurId: user.id });
  }

  @Get('forums/sujets')
  @ApiOperation({ summary: 'Liste des sujets de forum' })
  findSujetsForum(@Query('categorie') categorie?: string) {
    return this.svc.findSujetsForum(categorie);
  }

  @Post('forums/sujets/:id/repondre')
  @Roles('communication', 'admin', 'professeur', 'etudiant', 'parent')
  @ApiOperation({ summary: 'Répondre à un sujet' })
  repondreForum(@Param('id') sujetId: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.svc.repondreForum(sujetId, { ...dto, auteurId: user.id });
  }

  @Post('forums/sujets/:id/moderer')
  @Roles('communication', 'admin', 'moderateur')
  @ApiOperation({ summary: 'Modérer un sujet (masquer/supprimer)' })
  modererSujet(@Param('id') id: string, @Body() dto: { action: 'masquer' | 'supprimer'; motif: string }) {
    return this.svc.modererSujet(id, dto);
  }

  // ========== PROMOTION & RELATIONS PUBLIQUES ==========
  @Post('promotions/dossiers-presse')
  @Roles('communication', 'admin', 'president')
  @ApiOperation({ summary: 'Générer dossier de presse' })
  genererDossierPresse(@Body() dto: any) {
    return this.svc.genererDossierPresse(dto);
  }

  @Get('promotions/statistiques')
  @Roles('communication', 'admin', 'president')
  @ApiOperation({ summary: 'Stats pour dossiers de presse' })
  getStatsPromotion() {
    return this.svc.getStatsPromotion();
  }

  // ========== DASHBOARD COMMUNICATION ==========
  @Get('dashboard')
  @Roles('communication', 'admin', 'president')
  @ApiOperation({ summary: 'Dashboard activité communication' })
  getDashboard() {
    return this.svc.getDashboard();
  }
}
