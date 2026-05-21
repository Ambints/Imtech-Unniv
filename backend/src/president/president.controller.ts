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
  ParseIntPipe,
  ParseUUIDPipe,
  BadRequestException,
  Inject
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PresidentServiceSimple } from './president.service.simple';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { ValidateRecruitmentDto } from './dto/validate-recruitment.dto';
import { ValidateInvestmentDto } from './dto/validate-investment.dto';
import { SignDiplomaDto, SignDiplomasInBulkDto } from './dto/sign-diploma.dto';
import { SignConventionDto } from './dto/sign-convention.dto';
import { ArbitrateDisciplineDto } from './dto/arbitrate-discipline.dto';
import { ValidateParcoursDto } from './dto/validate-parcours.dto';
import { ValidateCalendarDto } from './dto/validate-calendar.dto';
import { DelegateSignatureDto } from './dto/delegate-signature.dto';

@ApiTags('President - Module Strategique')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('president')
@Controller('president')
export class PresidentController {
  constructor(
    private readonly presidentService: PresidentServiceSimple
  ) {}

  // ========== DASHBOARD KPI ==========

  @Get('dashboard/kpi')
  @ApiOperation({
    summary: 'Dashboard KPI du president',
    description: 'Retourne tous les indicateurs strategiques en temps reel'
  })
  @ApiQuery({ name: 'anneeId', required: false, type: String, description: 'UUID de l\'annee academique (optionnel, utilise l\'annee active par defaut)' })
  @ApiResponse({ status: 200, description: 'KPI recuperes avec succes' })
  async getKpiDashboard(
    @Req() req: any,
    @Query('anneeId') anneeId?: string
  ) {
    console.log('[PresidentController.getKpiDashboard] tenantSchema:', req.tenantSchema, '| anneeId:', anneeId, '| type:', typeof anneeId);
    
    // Si anneeId n'est pas fourni ou n'est pas un UUID valide, utiliser l'année active
    let validAnneeId = anneeId;
    if (!anneeId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(anneeId)) {
      console.log('[PresidentController.getKpiDashboard] anneeId invalide ou manquant, recherche de l\'annee active...');
      // Le service gérera la récupération de l'année active
      validAnneeId = null;
    }
    
    return this.presidentService.getKpiDashboard(req.tenantSchema, validAnneeId);
  }

  @Get('directions/summary')
  @ApiOperation({
    summary: 'Resume des directions',
    description: 'Vue consolidee de tous les poles (academique, scolarite, finances, RH, logistique)'
  })
  @ApiQuery({ name: 'anneeId', required: false, type: String, description: 'UUID de l\'annee academique (optionnel)' })
  @ApiResponse({ status: 200, description: 'Resume recupere avec succes' })
  async getDirectionsSummary(
    @Req() req: any,
    @Query('anneeId') anneeId?: string
  ) {
    // Valider l'UUID si fourni
    let validAnneeId = anneeId;
    if (!anneeId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(anneeId)) {
      validAnneeId = null;
    }
    return this.presidentService.getDirectionsSummary(req.tenantSchema, validAnneeId);
  }

  @Get('audit-trail')
  @ApiOperation({ 
    summary: 'Historique des actions du president',
    description: 'Retourne les dernieres actions effectuees par le president'
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Historique recupere avec succes' })
  async getAuditTrail(
    @Req() req: any,
    @Query('limit') limit?: number
  ) {
    return this.presidentService.getAuditTrail(req.tenantSchema, limit || 10);
  }

  // ========== RECRUTEMENTS ==========

  @Get('recrutements/en-attente')
  @ApiOperation({ 
    summary: 'Liste des recrutements en attente de validation',
    description: 'Retourne tous les recrutements soumis par les RH necessitant l\'approbation du president'
  })
  @ApiResponse({ status: 200, description: 'Liste recuperee avec succes' })
  async getRecrutementsEnAttente(@Req() req: any) {
    return this.presidentService.getRecrutementsEnAttente(req.tenantSchema);
  }

  @Post('recrutements/:id/valider')
  @ApiOperation({
    summary: 'Valider un recrutement',
    description: 'Approuve ou rejette un recrutement avec commentaire'
  })
  @ApiResponse({ status: 200, description: 'Recrutement traite avec succes' })
  @ApiResponse({ status: 404, description: 'Recrutement non trouve' })
  @ApiResponse({ status: 409, description: 'Recrutement deja traite' })
  async validerRecrutement(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ValidateRecruitmentDto,
    @CurrentUser() user: any
  ) {
    return this.presidentService.validerRecrutement(
      req.tenantSchema,
      id,
      dto,
      user.id
    );
  }

  @Post('recrutements/:id/rejeter')
  @ApiOperation({
    summary: 'Rejeter un recrutement',
    description: 'Rejette un recrutement avec commentaire explicatif'
  })
  @ApiResponse({ status: 200, description: 'Recrutement rejete avec succes' })
  async rejeterRecrutement(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ValidateRecruitmentDto,
    @CurrentUser() user: any
  ) {
    // Force la décision à "rejete"
    dto.decision = 'rejete' as any;
    return this.presidentService.validerRecrutement(
      req.tenantSchema,
      id,
      dto,
      user.id
    );
  }

  // ========== INVESTISSEMENTS ==========

  @Get('investissements/en-attente')
  @ApiOperation({ 
    summary: 'Liste des investissements en attente',
    description: 'Retourne tous les gros investissements (>= 1M Ar) necessitant validation presidentielle'
  })
  @ApiResponse({ status: 200, description: 'Liste recuperee avec succes' })
  async getInvestissementsEnAttente(@Req() req: any) {
    return this.presidentService.getInvestissementsEnAttente(req.tenantSchema);
  }

  @Post('investissements/:id/valider')
  @ApiOperation({
    summary: 'Valider un investissement',
    description: 'Approuve ou rejette un investissement avec possibilite d\'ajuster le montant'
  })
  @ApiResponse({ status: 200, description: 'Investissement traite avec succes' })
  @ApiResponse({ status: 404, description: 'Investissement non trouve' })
  @ApiResponse({ status: 409, description: 'Investissement deja traite' })
  async validerInvestissement(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ValidateInvestmentDto,
    @CurrentUser() user: any
  ) {
    return this.presidentService.validerInvestissement(
      req.tenantSchema,
      id,
      dto,
      user.id
    );
  }

  // ========== DIPLOMES ==========

  @Get('diplomes/a-signer')
  @ApiOperation({ 
    summary: 'Liste des diplomes a signer',
    description: 'Retourne tous les diplomes prets pour la signature presidentielle'
  })
  @ApiResponse({ status: 200, description: 'Liste recuperee avec succes' })
  async getDiplomesASigner(@Req() req: any) {
    return this.presidentService.getDiplomesASigner(req.tenantSchema);
  }

  @Post('diplomes/:id/signer')
  @ApiOperation({
    summary: 'Signer un diplome',
    description: 'Signe numeriquement un diplome avec code de signature securise'
  })
  @ApiResponse({ status: 200, description: 'Diplome signe avec succes' })
  @ApiResponse({ status: 404, description: 'Diplome non trouve' })
  @ApiResponse({ status: 409, description: 'Diplome deja signe ou pas pret' })
  async signerDiplome(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SignDiplomaDto,
    @CurrentUser() user: any
  ) {
    return this.presidentService.signerDiplome(
      req.tenantSchema,
      id,
      dto,
      user.id
    );
  }

  @Post('diplomes/signer-en-masse')
  @ApiOperation({ 
    summary: 'Signer plusieurs diplomes en masse',
    description: 'Signe jusqu\'a 100 diplomes simultanement (optimisation pour les promotions)'
  })
  @ApiResponse({ status: 200, description: 'Diplomes signes avec succes' })
  @ApiResponse({ status: 400, description: 'Limite de 100 diplomes depassee' })
  async signerDiplomesEnMasse(
    @Req() req: any,
    @Body() dto: SignDiplomasInBulkDto,
    @CurrentUser() user: any
  ) {
    return this.presidentService.signerDiplomesEnMasse(
      req.tenantSchema,
      dto,
      user.id
    );
  }

  // ========== CONVENTIONS ==========

  @Get('conventions/en-attente')
  @ApiOperation({ 
    summary: 'Liste des conventions en attente de signature',
    description: 'Retourne toutes les conventions (Eglise, dioceses, Etat, entreprises) a signer'
  })
  @ApiResponse({ status: 200, description: 'Liste recuperee avec succes' })
  async getConventionsEnAttente(@Req() req: any) {
    return this.presidentService.getConventionsEnAttente(req.tenantSchema);
  }

  @Post('conventions/:id/signer')
  @ApiOperation({
    summary: 'Signer une convention',
    description: 'Signe une convention avec les informations du representant partenaire'
  })
  @ApiResponse({ status: 200, description: 'Convention signee avec succes' })
  async signerConvention(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SignConventionDto,
    @CurrentUser() user: any
  ) {
    return this.presidentService.signerConvention(
      req.tenantSchema,
      id,
      dto,
      user.id
    );
  }

  // ========== DISCIPLINE ==========

  @Get('discipline/conseils-en-attente')
  @ApiOperation({ 
    summary: 'Liste des conseils de discipline en attente',
    description: 'Retourne tous les conseils de discipline necessitant l\'arbitrage du president'
  })
  @ApiResponse({ status: 200, description: 'Liste recuperee avec succes' })
  async getConseilsDisciplineEnAttente(@Req() req: any) {
    return this.presidentService.getConseilsDisciplineEnAttente(req.tenantSchema);
  }

  @Post('discipline/:id/arbitrer')
  @ApiOperation({
    summary: 'Arbitrer un conseil de discipline',
    description: 'Prend une decision finale sur un conseil de discipline (avertissement, suspension, exclusion)'
  })
  @ApiResponse({ status: 200, description: 'Decision prise avec succes' })
  @ApiResponse({ status: 404, description: 'Conseil non trouve' })
  @ApiResponse({ status: 409, description: 'Conseil deja tranche' })
  async arbitrerDiscipline(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ArbitrateDisciplineDto,
    @CurrentUser() user: any
  ) {
    return this.presidentService.arbitrerDiscipline(
      req.tenantSchema,
      id,
      dto,
      user.id
    );
  }

  // ========== PARCOURS ==========

  @Get('parcours/liste')
  @ApiOperation({ 
    summary: 'Liste de tous les parcours',
    description: 'Retourne tous les parcours (licences, masters, doctorats) avec leur statut'
  })
  @ApiResponse({ status: 200, description: 'Liste recuperee avec succes' })
  async getParcoursList(@Req() req: any) {
    return this.presidentService.getParcoursList(req.tenantSchema);
  }

  @Post('parcours/:id/ouvrir')
  @ApiOperation({
    summary: 'Ouvrir un parcours',
    description: 'Autorise l\'ouverture d\'un nouveau parcours ou la reouverture d\'un parcours ferme'
  })
  @ApiResponse({ status: 200, description: 'Parcours ouvert avec succes' })
  async ouvrirParcours(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ValidateParcoursDto,
    @CurrentUser() user: any
  ) {
    return this.presidentService.ouvrirParcours(
      req.tenantSchema,
      id,
      dto,
      user.id
    );
  }

  @Post('parcours/:id/fermer')
  @ApiOperation({
    summary: 'Fermer un parcours',
    description: 'Ferme un parcours (impossible si des etudiants y sont encore inscrits)'
  })
  @ApiResponse({ status: 200, description: 'Parcours ferme avec succes' })
  @ApiResponse({ status: 409, description: 'Des etudiants sont encore inscrits' })
  async fermerParcours(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ValidateParcoursDto,
    @CurrentUser() user: any
  ) {
    return this.presidentService.fermerParcours(
      req.tenantSchema,
      id,
      dto,
      user.id
    );
  }

  // ========== CALENDRIER ACADEMIQUE ==========

  @Get('calendrier/en-attente')
  @ApiOperation({ 
    summary: 'Calendrier academique en attente de validation',
    description: 'Retourne tous les evenements du calendrier academique a valider'
  })
  @ApiResponse({ status: 200, description: 'Liste recuperee avec succes' })
  async getCalendrierEnAttente(@Req() req: any) {
    return this.presidentService.getCalendrierEnAttente(req.tenantSchema);
  }

  @Post('calendrier/:id/valider')
  @ApiOperation({
    summary: 'Valider le calendrier academique',
    description: 'Valide le calendrier avec possibilite de proposer des modifications'
  })
  @ApiResponse({ status: 200, description: 'Calendrier valide avec succes' })
  async validerCalendrier(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ValidateCalendarDto,
    @CurrentUser() user: any
  ) {
    return this.presidentService.validerCalendrier(
      req.tenantSchema,
      id,
      dto,
      user.id
    );
  }

  @Put('calendrier/:id/modifier')
  @ApiOperation({
    summary: 'Modifier un evenement du calendrier',
    description: 'Modifie directement un evenement du calendrier academique'
  })
  @ApiResponse({ status: 200, description: 'Evenement modifie avec succes' })
  async modifierCalendrier(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ValidateCalendarDto,
    @CurrentUser() user: any
  ) {
    // Utilise la même méthode que valider mais avec modifications
    return this.presidentService.validerCalendrier(
      req.tenantSchema,
      id,
      dto,
      user.id
    );
  }

  // ========== DELEGATIONS DE SIGNATURE ==========

  @Get('delegations')
  @ApiOperation({ 
    summary: 'Liste des delegations de signature',
    description: 'Retourne toutes les delegations actives, expirees et revoquees'
  })
  @ApiResponse({ status: 200, description: 'Liste recuperee avec succes' })
  async getDelegations(@Req() req: any) {
    return this.presidentService.getDelegations(req.tenantSchema);
  }

  @Post('delegations/creer')
  @ApiOperation({ 
    summary: 'Creer une delegation de signature',
    description: 'Delegue la signature de certains actes au secretariat general'
  })
  @ApiResponse({ status: 200, description: 'Delegation creee avec succes' })
  @ApiResponse({ status: 409, description: 'Une delegation active existe deja pour ces actes' })
  async creerDelegation(
    @Req() req: any,
    @Body() dto: DelegateSignatureDto,
    @CurrentUser() user: any
  ) {
    return this.presidentService.creerDelegation(
      req.tenantSchema,
      dto,
      user.id
    );
  }

  @Put('delegations/:id/revoquer')
  @ApiOperation({
    summary: 'Revoquer une delegation',
    description: 'Revoque une delegation de signature avant sa date d\'expiration'
  })
  @ApiResponse({ status: 200, description: 'Delegation revoquee avec succes' })
  async revoquerDelegation(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any
  ) {
    return this.presidentService.revoquerDelegation(
      req.tenantSchema,
      id,
      user.id
    );
  }
}

// Made with Bob
