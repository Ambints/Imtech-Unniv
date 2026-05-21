import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LogisticsService } from './logistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Logistics - Gestion logistique et maintenance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('logistics')
export class LogisticsController {
  constructor(private readonly svc: LogisticsService) {}

  // ========== TICKETS DE MAINTENANCE ==========
  @Post('tickets')
  @Roles('logistique', 'admin', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Créer ticket de maintenance' })
  createTicket(@Body() dto: any) {
    return this.svc.createTicket('', dto);
  }

  @Get('tickets')
  @Roles('logistique', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Liste des tickets (filtre par statut)' })
  getTickets(@Query('statut') statut?: string) {
    return this.svc.getTickets('', statut);
  }

  @Patch('tickets/:id')
  @Roles('logistique', 'admin')
  @ApiOperation({ summary: 'Mettre à jour ticket' })
  updateTicket(@Param('id') id: string, @Body() dto: any) {
    return this.svc.updateTicket(id, dto);
  }

  // ========== PLANNING ENTRETIEN ==========
  @Post('planning-entretien')
  @Roles('logistique', 'admin')
  @ApiOperation({ summary: 'Créer planning de nettoyage' })
  createPlanning(@Body() dto: any) {
    return this.svc.createPlanning('', dto);
  }

  @Get('planning-entretien')
  @Roles('logistique', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Planning de nettoyage' })
  getPlanning() {
    return this.svc.getPlanning();
  }

  // ========== STOCKS ==========
  @Post('stocks')
  @Roles('logistique', 'admin', 'economat')
  @ApiOperation({ summary: 'Ajouter un article en stock' })
  createStock(@Body() dto: any) {
    return this.svc.createStock('', dto);
  }

  @Get('stocks')
  @Roles('logistique', 'admin', 'economat', 'secretaire')
  @ApiOperation({ summary: 'Inventaire complet des stocks' })
  getStocks() {
    return this.svc.getStocks();
  }

  @Get('stocks/alertes')
  @Roles('logistique', 'admin', 'economat')
  @ApiOperation({ summary: 'Articles sous seuil d\'alerte' })
  getAlertes() {
    return this.svc.getStocksEnAlerte();
  }

  @Patch('stocks/:id')
  @Roles('logistique', 'admin', 'economat')
  @ApiOperation({ summary: 'Mettre à jour quantité en stock' })
  updateStock(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateStock(id, body.quantite);
  }

  @Post('mouvements')
  @Roles('logistique', 'admin', 'economat')
  @ApiOperation({ summary: 'Enregistrer mouvement de stock' })
  createMouvement(@Body() dto: any) {
    return this.svc.createMouvement(dto);
  }

  @Get('mouvements')
  @Roles('logistique', 'admin', 'economat')
  @ApiOperation({ summary: 'Historique des mouvements' })
  getMouvements(@Query('stockId') stockId?: string) {
    return this.svc.getMouvements(stockId);
  }

  // ========== RÉSERVATIONS DE SALLES ==========
  @Post('reservations')
  @Roles('logistique', 'admin', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Réserver une salle' })
  reserver(@Body() dto: any) {
    return this.svc.reserver('', dto);
  }

  @Get('reservations')
  @Roles('logistique', 'admin', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Liste des réservations' })
  getReservations(@Query('salleId') salleId?: string) {
    return this.svc.getReservations('', salleId);
  }

  @Patch('reservations/:id/approuver')
  @Roles('logistique', 'admin')
  @ApiOperation({ summary: 'Approuver une réservation de salle' })
  approuver(@Param('id') id: string, @Body() body: any) {
    return this.svc.approuverReservation(id, body.approuvePar);
  }

  @Patch('reservations/:id/refuser')
  @Roles('logistique', 'admin')
  @ApiOperation({ summary: 'Refuser une réservation de salle' })
  refuser(@Param('id') id: string, @Body() body: any) {
    return this.svc.refuserReservation(id, body.approuvePar);
  }

  // ========== STATISTIQUES ==========
  @Get('stats')
  @Roles('logistique', 'admin', 'president')
  @ApiOperation({ summary: 'Statistiques logistique' })
  getStats() {
    return this.svc.getStats();
  }
}

// Made with Bob
