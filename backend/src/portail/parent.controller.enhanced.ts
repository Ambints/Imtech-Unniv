import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Body, 
  Param, 
  Query,
  UseGuards, 
  Req,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PortailParentServiceEnhanced } from './parent.service.enhanced';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  AutorisationSortieDto,
  JustifierAbsenceDto,
  EnvoyerMessageDto,
  RepondreMessageDto,
  SoumettrePreuvePaiementDto,
  MarquerNotificationLueDto,
  GetBulletinQueryDto,
  GetAbsencesQueryDto,
  GetEmploiDuTempsQueryDto,
  GetMessagesQueryDto
} from './dto/parent.dto';

@ApiTags('Portail Parent - Gestion Complète')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('parent')
@Controller('api/v1/portail/parent')
export class PortailParentControllerEnhanced {
  constructor(private readonly service: PortailParentServiceEnhanced) {}

  private getSchemaName(req: any): string {
    return req.tenantSchema || 'tenant_ispm';
  }

  // ==================== GESTION DES ENFANTS ====================

  @Get('enfants')
  @ApiOperation({ 
    summary: 'Liste des enfants liés au parent',
    description: 'Récupère tous les étudiants liés au parent via email_parent ou telephone_parent'
  })
  @ApiResponse({ status: 200, description: 'Liste des enfants récupérée avec succès' })
  async getEnfants(@CurrentUser() user: any, @Req() req: any) {
    const schemaName = this.getSchemaName(req);
    return this.service.getEnfants(user.id, schemaName);
  }

  @Get('enfants/:etudiantId/dashboard')
  @ApiOperation({ 
    summary: 'Tableau de bord de l\'enfant',
    description: 'Vue d\'ensemble: absences, paiements, notes récentes, prochaine échéance'
  })
  @ApiResponse({ status: 200, description: 'Tableau de bord récupéré avec succès' })
  async getDashboard(
    @CurrentUser() user: any,
    @Param('etudiantId') etudiantId: string,
    @Req() req: any
  ) {
    const schemaName = this.getSchemaName(req);
    return this.service.getDashboard(user.id, etudiantId, schemaName);
  }

  // ==================== SUIVI ACADÉMIQUE ====================

  @Get('enfants/:etudiantId/bulletin')
  @ApiOperation({ 
    summary: 'Bulletin de notes périodique',
    description: 'Notes détaillées par UE/EC avec moyennes et mention'
  })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Filtrer par session d\'examen' })
  @ApiQuery({ name: 'anneeAcademiqueId', required: false, description: 'Filtrer par année académique' })
  @ApiQuery({ name: 'semestre', required: false, type: Number, description: 'Filtrer par semestre (1 ou 2)' })
  @ApiResponse({ status: 200, description: 'Bulletin récupéré avec succès' })
  async getBulletin(
    @CurrentUser() user: any,
    @Param('etudiantId') etudiantId: string,
    @Query() query: GetBulletinQueryDto,
    @Req() req: any
  ) {
    const schemaName = this.getSchemaName(req);
    return this.service.getBulletin(user.id, etudiantId, schemaName, query);
  }

  @Get('enfants/:etudiantId/emploi-du-temps')
  @ApiOperation({ 
    summary: 'Emploi du temps de l\'enfant',
    description: 'Planning des cours avec salles et enseignants'
  })
  @ApiQuery({ name: 'dateDebut', required: false, description: 'Date de début (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateFin', required: false, description: 'Date de fin (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Emploi du temps récupéré avec succès' })
  async getEmploiDuTemps(
    @CurrentUser() user: any,
    @Param('etudiantId') etudiantId: string,
    @Query() query: GetEmploiDuTempsQueryDto,
    @Req() req: any
  ) {
    const schemaName = this.getSchemaName(req);
    return this.service.getEmploiDuTemps(user.id, etudiantId, schemaName, query);
  }

  // ==================== SUIVI DES ABSENCES ====================

  @Get('enfants/:etudiantId/absences')
  @ApiOperation({ 
    summary: 'Absences et retards de l\'enfant',
    description: 'Liste détaillée avec statistiques et évolution mensuelle'
  })
  @ApiQuery({ name: 'dateDebut', required: false, description: 'Date de début (YYYY-MM-DD)' })
  @ApiQuery({ name: 'dateFin', required: false, description: 'Date de fin (YYYY-MM-DD)' })
  @ApiQuery({ name: 'statut', required: false, enum: ['absent', 'retard', 'tous'], description: 'Filtrer par statut' })
  @ApiResponse({ status: 200, description: 'Absences récupérées avec succès' })
  async getAbsences(
    @CurrentUser() user: any,
    @Param('etudiantId') etudiantId: string,
    @Query() query: GetAbsencesQueryDto,
    @Req() req: any
  ) {
    const schemaName = this.getSchemaName(req);
    return this.service.getAbsences(user.id, etudiantId, schemaName, query);
  }

  @Post('enfants/:etudiantId/absences/justifier')
  @ApiOperation({ 
    summary: 'Justifier une absence',
    description: 'Permet au parent de justifier une absence avec un motif et un justificatif'
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Absence justifiée avec succès' })
  async justifierAbsence(
    @CurrentUser() user: any,
    @Param('etudiantId') etudiantId: string,
    @Body() dto: JustifierAbsenceDto,
    @Req() req: any
  ) {
    const schemaName = this.getSchemaName(req);
    dto.etudiantId = etudiantId; // Assurer la cohérence
    return this.service.justifierAbsence(user.id, dto, schemaName);
  }

  // ==================== SUIVI FINANCIER ====================

  @Get('enfants/:etudiantId/finances')
  @ApiOperation({ 
    summary: 'Situation financière complète',
    description: 'Montants dus, payés, échéancier, historique des paiements'
  })
  @ApiResponse({ status: 200, description: 'Situation financière récupérée avec succès' })
  async getFinances(
    @CurrentUser() user: any,
    @Param('etudiantId') etudiantId: string,
    @Req() req: any
  ) {
    const schemaName = this.getSchemaName(req);
    return this.service.getFinances(user.id, etudiantId, schemaName);
  }

  @Post('enfants/:etudiantId/paiement')
  @ApiOperation({ 
    summary: 'Soumettre une preuve de paiement',
    description: 'Le parent soumet une preuve de paiement pour validation par le caissier'
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Preuve de paiement soumise avec succès' })
  async soumettrePreuvePaiement(
    @CurrentUser() user: any,
    @Param('etudiantId') etudiantId: string,
    @Body() dto: SoumettrePreuvePaiementDto,
    @Req() req: any
  ) {
    const schemaName = this.getSchemaName(req);
    dto.etudiantId = etudiantId; // Assurer la cohérence
    return this.service.soumettrePreuvePaiement(user.id, dto, schemaName);
  }

  // ==================== AUTORISATIONS ====================

  @Post('autorisations/sortie')
  @ApiOperation({ 
    summary: 'Autoriser une sortie ou absence',
    description: 'Créer une autorisation de sortie anticipée ou d\'absence prévisionnelle'
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Autorisation créée avec succès' })
  async autoriserSortie(
    @CurrentUser() user: any,
    @Body() dto: AutorisationSortieDto,
    @Req() req: any
  ) {
    const schemaName = this.getSchemaName(req);
    return this.service.autoriserSortie(user.id, dto, schemaName);
  }

  // ==================== MESSAGERIE ====================

  @Get('messages')
  @ApiOperation({ 
    summary: 'Liste des messages',
    description: 'Conversations avec le personnel de l\'établissement'
  })
  @ApiQuery({ name: 'etudiantId', required: false, description: 'Filtrer par étudiant' })
  @ApiQuery({ name: 'nonLus', required: false, type: Boolean, description: 'Afficher uniquement les non lus' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Nombre de messages à récupérer' })
  @ApiResponse({ status: 200, description: 'Messages récupérés avec succès' })
  async getMessages(
    @CurrentUser() user: any,
    @Query() query: GetMessagesQueryDto,
    @Req() req: any
  ) {
    const schemaName = this.getSchemaName(req);
    return this.service.getMessages(user.id, schemaName, query);
  }

  @Post('messages')
  @ApiOperation({ 
    summary: 'Envoyer un message',
    description: 'Envoyer un message au surveillant général, secrétariat, etc.'
  })
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Message envoyé avec succès' })
  async envoyerMessage(
    @CurrentUser() user: any,
    @Body() dto: EnvoyerMessageDto,
    @Req() req: any
  ) {
    const schemaName = this.getSchemaName(req);
    return this.service.envoyerMessage(user.id, dto, schemaName);
  }

  // ==================== NOTIFICATIONS ====================

  @Get('notifications')
  @ApiOperation({ 
    summary: 'Notifications du parent',
    description: 'Notifications liées aux enfants (absences, paiements, notes, etc.)'
  })
  @ApiResponse({ status: 200, description: 'Notifications récupérées avec succès' })
  async getNotifications(@CurrentUser() user: any, @Req() req: any) {
    const schemaName = this.getSchemaName(req);
    return this.service.getNotifications(user.id, schemaName);
  }

  @Put('notifications/:notificationId/lire')
  @ApiOperation({ 
    summary: 'Marquer une notification comme lue',
    description: 'Met à jour le statut de lecture d\'une notification'
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Notification marquée comme lue' })
  async marquerNotificationLue(
    @CurrentUser() user: any,
    @Param('notificationId') notificationId: string,
    @Req() req: any
  ) {
    const schemaName = this.getSchemaName(req);
    return this.service.marquerNotificationLue(user.id, notificationId, schemaName);
  }

  // ==================== ANNONCES ====================

  @Get('annonces')
  @ApiOperation({ 
    summary: 'Annonces de l\'établissement',
    description: 'Annonces publiques destinées aux parents'
  })
  @ApiResponse({ status: 200, description: 'Annonces récupérées avec succès' })
  async getAnnonces(@CurrentUser() user: any, @Req() req: any) {
    const schemaName = this.getSchemaName(req);
    return this.service.getAnnonces(user.id, schemaName);
  }
}

// Made with Bob
