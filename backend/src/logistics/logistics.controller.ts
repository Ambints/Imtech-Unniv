import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LogisticsService } from './logistics.service';

@ApiTags('Logistics')
@ApiBearerAuth('JWT-auth')
@Controller('logistics')
export class LogisticsController {
  constructor(private readonly svc: LogisticsService) {}

  @Post(':tid/tickets')
  @ApiOperation({ summary: 'Creer ticket de maintenance (Prof / Secretaire)' })
  createTicket(@Param('tid') tid: string, @Body() dto: any) { return this.svc.createTicket(tid, dto); }

  @Get(':tid/tickets')
  @ApiOperation({ summary: 'Liste des tickets (filtre par status)' })
  getTickets(@Param('tid') tid: string, @Query('status') status?: string) {
    return this.svc.getTickets(tid, status);
  }

  @Patch(':tid/tickets/:id')
  @ApiOperation({ summary: 'Mettre a jour ticket (Responsable Logistique)' })
  updateTicket(@Param('id') id: string, @Body() dto: any) { return this.svc.updateTicket(id, dto); }

  @Post(':tid/planning-nettoyage')
  @ApiOperation({ summary: 'Creer planning de nettoyage (Service Entretien)' })
  createPlanning(@Param('tid') tid: string, @Body() dto: any) { return this.svc.createPlanning(tid, dto); }

  @Get(':tid/planning-nettoyage')
  @ApiOperation({ summary: 'Planning de nettoyage' })
  getPlanning(@Param('tid') tid: string) { return this.svc.getPlanning(tid); }

  @Post(':tid/stocks')
  @ApiOperation({ summary: 'Ajouter un article en stock' })
  createStock(@Param('tid') tid: string, @Body() dto: any) { return this.svc.createStock(tid, dto); }

  @Get(':tid/stocks')
  @ApiOperation({ summary: 'Inventaire complet des stocks' })
  getStocks(@Param('tid') tid: string) { return this.svc.getStocks(tid); }

  @Get(':tid/stocks/alertes')
  @ApiOperation({ summary: 'Articles sous seuil d alerte' })
  getAlertes(@Param('tid') tid: string) { return this.svc.getStocksEnAlerte(tid); }

  @Patch(':tid/stocks/:id')
  @ApiOperation({ summary: 'Mettre a jour quantite en stock' })
  updateStock(@Param('id') id: string, @Body() body: any) { return this.svc.updateStock(id, body.quantite); }

  @Post(':tid/reservations')
  @ApiOperation({ summary: 'Reserver une salle (Prof / Secretaire)' })
  reserver(@Param('tid') tid: string, @Body() dto: any) { return this.svc.reserver(tid, dto); }

  @Get(':tid/reservations')
  @ApiOperation({ summary: 'Liste des reservations' })
  getReservations(@Param('tid') tid: string, @Query('salleId') sid?: string) {
    return this.svc.getReservations(tid, sid);
  }

  @Patch(':tid/reservations/:id/approuver')
  @ApiOperation({ summary: 'Approuver une reservation de salle' })
  approuver(@Param('id') id: string, @Body() body: any) {
    return this.svc.approuverReservation(id, body.approvedBy);
  }
}