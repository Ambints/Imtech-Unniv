import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TenantSchemaInterceptor } from '../tenants/tenant-schema.interceptor';
import { EntretienService } from './entretien.service';
import {
  CreatePlanningEntretienDto,
  UpdatePlanningEntretienDto,
  CreateRapportEntretienDto,
  UpdateRapportEntretienDto,
  CreateTicketMaintenanceDto,
  UpdateTicketMaintenanceDto,
  CreateStockEntretienDto,
  MouvementStockEntretienDto,
  TraiterReservationDto,
  TraiterDemandeRessourceDto,
} from './dto';

@Controller('entretien')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('logistique')
@UseInterceptors(TenantSchemaInterceptor)
export class EntretienController {
  constructor(private readonly entretienService: EntretienService) {}

  @Get('dashboard')
  getDashboard(@Req() req: any) {
    return this.entretienService.getDashboard(req.tenantSchema);
  }

  @Get('planning')
  getPlanning(@Req() req: any, @Query() filters: any) {
    return this.entretienService.getPlanning(req.tenantSchema, filters);
  }

  @Get('planning/hebdomadaire')
  getPlanningHebdomadaire(@Req() req: any) {
    return this.entretienService.getPlanningHebdomadaire(req.tenantSchema);
  }

  @Post('planning')
  createPlanning(@Req() req: any, @Body() dto: CreatePlanningEntretienDto) {
    return this.entretienService.createPlanning(req.tenantSchema, dto);
  }

  @Put('planning/:id')
  updatePlanning(@Req() req: any, @Param('id') id: string, @Body() dto: UpdatePlanningEntretienDto) {
    return this.entretienService.updatePlanning(req.tenantSchema, id, dto);
  }

  @Put('planning/:id/toggle')
  togglePlanning(@Req() req: any, @Param('id') id: string) {
    return this.entretienService.togglePlanning(req.tenantSchema, id);
  }

  @Get('rapports')
  getRapports(@Req() req: any, @Query() filters: any) {
    return this.entretienService.getRapports(req.tenantSchema, filters);
  }

  @Get('rapports/stats')
  getRapportsStats(@Req() req: any, @Query('jours') jours?: number) {
    return this.entretienService.getRapportsStats(req.tenantSchema, jours);
  }

  @Post('rapports')
  createRapport(@Req() req: any, @Body() dto: CreateRapportEntretienDto) {
    return this.entretienService.createRapport(req.tenantSchema, dto);
  }

  @Put('rapports/:id')
  updateRapport(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateRapportEntretienDto) {
    return this.entretienService.updateRapport(req.tenantSchema, id, dto);
  }

  @Get('tickets')
  getTickets(@Req() req: any, @Query() filters: any) {
    return this.entretienService.getTickets(req.tenantSchema, filters);
  }

  @Get('tickets/urgents')
  getTicketsUrgents(@Req() req: any) {
    return this.entretienService.getTicketsUrgents(req.tenantSchema);
  }

  @Get('tickets/stats')
  getTicketsStats(@Req() req: any, @Query('jours') jours?: number) {
    return this.entretienService.getTicketsStats(req.tenantSchema, jours);
  }

  @Post('tickets')
  createTicket(@Req() req: any, @Body() dto: CreateTicketMaintenanceDto) {
    return this.entretienService.createTicket(req.tenantSchema, dto, req.user.id);
  }

  @Put('tickets/:id')
  updateTicket(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateTicketMaintenanceDto) {
    return this.entretienService.updateTicket(req.tenantSchema, id, dto);
  }

  @Get('stock')
  getStock(@Req() req: any, @Query() filters: any) {
    return this.entretienService.getStock(req.tenantSchema, filters);
  }

  @Get('stock/alertes')
  getStockAlertes(@Req() req: any) {
    return this.entretienService.getStockAlertes(req.tenantSchema);
  }

  @Get('stock/energie')
  getStockEnergie(@Req() req: any) {
    return this.entretienService.getStockEnergie(req.tenantSchema);
  }

  @Post('stock')
  createStock(@Req() req: any, @Body() dto: CreateStockEntretienDto) {
    return this.entretienService.createStock(req.tenantSchema, dto);
  }

  @Put('stock/:id')
  updateStock(@Req() req: any, @Param('id') id: string, @Body() dto: Partial<CreateStockEntretienDto>) {
    return this.entretienService.updateStock(req.tenantSchema, id, dto);
  }

  @Get('stock/:id/mouvements')
  getMouvements(@Req() req: any, @Param('id') id: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.entretienService.getMouvements(req.tenantSchema, id, page, limit);
  }

  @Post('stock/:id/mouvement')
  enregistrerMouvement(@Req() req: any, @Param('id') id: string, @Body() dto: MouvementStockEntretienDto) {
    return this.entretienService.enregistrerMouvement(req.tenantSchema, id, dto, req.user.id);
  }

  @Get('reservations')
  getReservations(@Req() req: any, @Query() filters: any) {
    return this.entretienService.getReservations(req.tenantSchema, filters);
  }

  @Get('reservations/calendrier')
  getCalendrier(@Req() req: any, @Query('dateDebut') dateDebut: string, @Query('dateFin') dateFin: string) {
    return this.entretienService.getCalendrier(req.tenantSchema, dateDebut, dateFin);
  }

  @Put('reservations/:id/approuver')
  approuverReservation(@Req() req: any, @Param('id') id: string) {
    return this.entretienService.approuverReservation(req.tenantSchema, id, req.user.id);
  }

  @Put('reservations/:id/refuser')
  refuserReservation(@Req() req: any, @Param('id') id: string, @Body() dto: TraiterReservationDto) {
    return this.entretienService.refuserReservation(req.tenantSchema, id, dto);
  }

  @Delete('reservations/:id')
  annulerReservation(@Req() req: any, @Param('id') id: string) {
    return this.entretienService.annulerReservation(req.tenantSchema, id);
  }

  @Get('demandes-ressource')
  getDemandesRessource(@Req() req: any, @Query() filters: any) {
    return this.entretienService.getDemandesRessource(req.tenantSchema, filters);
  }

  @Put('demandes-ressource/:id/traiter')
  traiterDemandeRessource(@Req() req: any, @Param('id') id: string, @Body() dto: TraiterDemandeRessourceDto) {
    return this.entretienService.traiterDemandeRessource(req.tenantSchema, id, dto, req.user.id);
  }

  @Get('inventaire/batiments')
  getInventaireBatiments(@Req() req: any) {
    return this.entretienService.getInventaireBatiments(req.tenantSchema);
  }

  @Get('inventaire/salles-par-type')
  getInventaireSallesParType(@Req() req: any) {
    return this.entretienService.getInventaireSallesParType(req.tenantSchema);
  }

  @Get('inventaire/stocks-par-categorie')
  getInventaireStocksParCategorie(@Req() req: any) {
    return this.entretienService.getInventaireStocksParCategorie(req.tenantSchema);
  }
}

// Made with Bob
