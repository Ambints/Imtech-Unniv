import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { LogistiqueService } from './logistique.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TenantSchemaInterceptor } from '../tenants/tenant-schema.interceptor';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateStockDto } from './dto/create-stock.dto';
import { MouvementStockDto } from './dto/mouvement-stock.dto';
import { CreatePlanningEntretienDto } from './dto/create-planning-entretien.dto';
import { CreateRapportEntretienDto } from './dto/create-rapport-entretien.dto';
import { CreateBatimentDto } from './dto/create-batiment.dto';
import { CreateSalleDto } from './dto/create-salle.dto';
import { UpdateSalleDto } from './dto/update-salle.dto';
import { TraiterDemandeRessourceDto } from './dto/traiter-demande-ressource.dto';

@Controller('logistique')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('logistique', 'responsable_logistique')
@UseInterceptors(TenantSchemaInterceptor)
export class LogistiqueController {
  constructor(private readonly logistiqueService: LogistiqueService) {}

  // ==================== DASHBOARD ====================
  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    return this.logistiqueService.getDashboard(req.tenantSchema);
  }

  // ==================== BÂTIMENTS ====================
  @Get('batiments')
  async getBatiments(@Req() req: any) {
    return this.logistiqueService.getBatiments(req.tenantSchema);
  }

  @Post('batiments')
  async createBatiment(@Req() req: any, @Body() dto: CreateBatimentDto) {
    return this.logistiqueService.createBatiment(req.tenantSchema, dto);
  }

  // ==================== SALLES ====================
  @Get('salles')
  async getSalles(
    @Req() req: any,
    @Query('type_salle') type_salle?: string,
    @Query('disponible') disponible?: string,
    @Query('batiment_id') batiment_id?: string,
  ) {
    const filters: any = {};
    if (type_salle) filters.type_salle = type_salle;
    if (disponible !== undefined) filters.disponible = disponible === 'true';
    if (batiment_id) filters.batiment_id = batiment_id;

    return this.logistiqueService.getSalles(req.tenantSchema, filters);
  }

  @Get('salles/:id')
  async getSalle(@Req() req: any, @Param('id') id: string) {
    return this.logistiqueService.getSalle(req.tenantSchema, id);
  }

  @Post('salles')
  async createSalle(@Req() req: any, @Body() dto: CreateSalleDto) {
    return this.logistiqueService.createSalle(req.tenantSchema, dto);
  }

  @Put('salles/:id')
  async updateSalle(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSalleDto,
  ) {
    return this.logistiqueService.updateSalle(req.tenantSchema, id, dto);
  }

  @Put('salles/:id/disponibilite')
  async toggleDisponibilite(
    @Req() req: any,
    @Param('id') id: string,
    @Body('disponible') disponible: boolean,
  ) {
    return this.logistiqueService.toggleDisponibilite(req.tenantSchema, id, disponible);
  }

  // ==================== STOCK ====================
  @Get('stock')
  async getStock(
    @Req() req: any,
    @Query('categorie') categorie?: string,
    @Query('en_alerte') en_alerte?: string,
  ) {
    const filters: any = {};
    if (categorie) filters.categorie = categorie;
    if (en_alerte === 'true') filters.en_alerte = true;

    return this.logistiqueService.getStock(req.tenantSchema, filters);
  }

  @Get('stock/alertes')
  async getAlertes(@Req() req: any) {
    return this.logistiqueService.getAlertes(req.tenantSchema);
  }

  @Post('stock')
  async createArticle(@Req() req: any, @Body() dto: CreateStockDto) {
    return this.logistiqueService.createArticle(req.tenantSchema, dto);
  }

  @Get('stock/:id/mouvements')
  async getMouvements(
    @Req() req: any,
    @Param('id') id: string,
    @Query('page') page?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    return this.logistiqueService.getMouvements(req.tenantSchema, id, pageNum);
  }

  @Post('stock/:id/mouvement')
  async enregistrerMouvement(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: MouvementStockDto,
  ) {
    return this.logistiqueService.enregistrerMouvement(
      req.tenantSchema,
      id,
      dto,
      req.user.id,
    );
  }

  // ==================== TICKETS ====================
  @Get('tickets')
  async getTickets(
    @Req() req: any,
    @Query('statut') statut?: string,
    @Query('priorite') priorite?: string,
    @Query('batiment_id') batiment_id?: string,
  ) {
    const filters: any = {};
    if (statut) filters.statut = statut;
    if (priorite) filters.priorite = priorite;
    if (batiment_id) filters.batiment_id = batiment_id;

    return this.logistiqueService.getTickets(req.tenantSchema, filters);
  }

  @Get('tickets/stats')
  async getTicketStats(@Req() req: any) {
    return this.logistiqueService.getTicketStats(req.tenantSchema);
  }

  @Post('tickets')
  async createTicket(@Req() req: any, @Body() dto: CreateTicketDto) {
    return this.logistiqueService.createTicket(req.tenantSchema, dto, req.user.id);
  }

  @Put('tickets/:id')
  async updateTicket(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.logistiqueService.updateTicket(req.tenantSchema, id, dto);
  }

  // ==================== PLANNING ENTRETIEN ====================
  @Get('planning-entretien')
  async getPlanning(@Req() req: any) {
    return this.logistiqueService.getPlanning(req.tenantSchema);
  }

  @Post('planning-entretien')
  async createPlanning(@Req() req: any, @Body() dto: CreatePlanningEntretienDto) {
    return this.logistiqueService.createPlanning(req.tenantSchema, dto);
  }

  @Put('planning-entretien/:id/toggle')
  async togglePlanning(@Req() req: any, @Param('id') id: string) {
    return this.logistiqueService.togglePlanning(req.tenantSchema, id);
  }

  // ==================== RAPPORTS ENTRETIEN ====================
  @Get('rapports-entretien')
  async getRapports(
    @Req() req: any,
    @Query('date_debut') date_debut?: string,
    @Query('date_fin') date_fin?: string,
    @Query('statut') statut?: string,
  ) {
    const filters: any = {};
    if (date_debut) filters.date_debut = date_debut;
    if (date_fin) filters.date_fin = date_fin;
    if (statut) filters.statut = statut;

    return this.logistiqueService.getRapports(req.tenantSchema, filters);
  }

  @Post('rapports-entretien')
  async createRapport(@Req() req: any, @Body() dto: CreateRapportEntretienDto) {
    return this.logistiqueService.createRapport(req.tenantSchema, dto);
  }

  // ==================== RÉSERVATIONS ====================
  @Get('reservations')
  async getReservations(@Req() req: any) {
    return this.logistiqueService.getReservations(req.tenantSchema);
  }

  @Get('reservations/calendrier')
  async getCalendrier(
    @Req() req: any,
    @Query('dateDebut') dateDebut: string,
    @Query('dateFin') dateFin: string,
  ) {
    return this.logistiqueService.getCalendrier(req.tenantSchema, dateDebut, dateFin);
  }

  @Put('reservations/:id/approuver')
  async approuverReservation(@Req() req: any, @Param('id') id: string) {
    return this.logistiqueService.approuverReservation(req.tenantSchema, id, req.user.id);
  }

  @Put('reservations/:id/refuser')
  async refuserReservation(@Req() req: any, @Param('id') id: string) {
    return this.logistiqueService.refuserReservation(req.tenantSchema, id);
  }

  @Delete('reservations/:id')
  async annulerReservation(@Req() req: any, @Param('id') id: string) {
    return this.logistiqueService.annulerReservation(req.tenantSchema, id);
  }

  // ==================== INVENTAIRE ====================
  @Get('inventaire/salles-par-type')
  async getInventaireSalles(@Req() req: any) {
    return this.logistiqueService.getInventaireSalles(req.tenantSchema);
  }

  @Get('inventaire/stocks-par-categorie')
  async getInventaireStocks(@Req() req: any) {
    return this.logistiqueService.getInventaireStocks(req.tenantSchema);
  }

  // ==================== DEMANDES RESSOURCE ====================
  @Get('demandes-ressource')
  async getDemandesRessource(@Req() req: any) {
    return this.logistiqueService.getDemandesRessource(req.tenantSchema);
  }

  @Put('demandes-ressource/:id/traiter')
  async traiterDemande(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: TraiterDemandeRessourceDto,
  ) {
    return this.logistiqueService.traiterDemande(req.tenantSchema, id, dto, req.user.id);
  }
}

// Made with Bob
