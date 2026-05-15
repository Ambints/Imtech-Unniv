import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EntretienService } from './entretien.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { UpdateResponsableDto } from './dto/update-responsable.dto';

@ApiTags('Entretien - Logistique et Maintenance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('entretien')
export class EntretienController {
  constructor(private readonly svc: EntretienService) {}

  // ========== RESPONSABLES LOGISTIQUE ==========

  @Get('responsables')
  @Roles('super_admin', 'admin', 'responsable_logistique')
  @ApiOperation({ summary: 'Lister tous les responsables logistique' })
  @ApiResponse({ status: 200, description: 'Liste des responsables' })
  findAllResponsables() {
    return this.svc.findAllResponsables();
  }

  @Get('responsables/:id')
  @Roles('super_admin', 'admin', 'responsable_logistique')
  @ApiOperation({ summary: 'Détails d\'un responsable logistique' })
  @ApiResponse({ status: 200, description: 'Détails du responsable' })
  findOneResponsable(@Param('id') id: string) {
    return this.svc.findOneResponsable(id);
  }

  @Post('responsables')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Créer un nouveau responsable logistique' })
  @ApiResponse({ status: 201, description: 'Responsable créé' })
  createResponsable(@Body() createDto: CreateResponsableDto) {
    return this.svc.createResponsable(createDto);
  }

  @Patch('responsables/:id')
  @Roles('super_admin', 'admin', 'responsable_logistique')
  @ApiOperation({ summary: 'Mettre à jour un responsable logistique' })
  @ApiResponse({ status: 200, description: 'Responsable mis à jour' })
  updateResponsable(@Param('id') id: string, @Body() updateDto: UpdateResponsableDto) {
    return this.svc.updateResponsable(id, updateDto);
  }

  @Delete('responsables/:id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Supprimer un responsable logistique' })
  @ApiResponse({ status: 200, description: 'Responsable supprimé' })
  removeResponsable(@Param('id') id: string) {
    return this.svc.removeResponsable(id);
  }

  // ========== SERVICES ENTRETIEN ==========

  @Get('services')
  @Roles('super_admin', 'admin', 'responsable_logistique')
  @ApiOperation({ summary: 'Lister tous les services d\'entretien' })
  @ApiResponse({ status: 200, description: 'Liste des services' })
  findAllServices() {
    return this.svc.findAllServices();
  }

  @Get('services/:id')
  @Roles('super_admin', 'admin', 'responsable_logistique')
  @ApiOperation({ summary: 'Détails d\'un service d\'entretien' })
  @ApiResponse({ status: 200, description: 'Détails du service' })
  findOneService(@Param('id') id: string) {
    return this.svc.findOneService(id);
  }

  @Post('services')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Créer un nouveau service d\'entretien' })
  @ApiResponse({ status: 201, description: 'Service créé' })
  createService(@Body() createDto: any, @CurrentUser() user: any) {
    return this.svc.createService({ ...createDto, responsable_id: user.id });
  }

  @Patch('services/:id')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Mettre à jour un service d\'entretien' })
  @ApiResponse({ status: 200, description: 'Service mis à jour' })
  updateService(@Param('id') id: string, @Body() updateDto: any) {
    return this.svc.updateService(id, updateDto);
  }

  @Delete('services/:id')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Supprimer un service d\'entretien' })
  @ApiResponse({ status: 200, description: 'Service supprimé' })
  removeService(@Param('id') id: string) {
    return this.svc.removeService(id);
  }

  // ========== PLANNINGS NETTOYAGE ==========

  @Get('plannings')
  @Roles('super_admin', 'admin', 'responsable_logistique')
  @ApiOperation({ summary: 'Lister tous les plannings de nettoyage' })
  @ApiResponse({ status: 200, description: 'Liste des plannings' })
  findAllPlannings() {
    return this.svc.findAllPlannings();
  }

  @Get('plannings/:id')
  @Roles('super_admin', 'admin', 'responsable_logistique')
  @ApiOperation({ summary: 'Détails d\'un planning de nettoyage' })
  @ApiResponse({ status: 200, description: 'Détails du planning' })
  findOnePlanning(@Param('id') id: string) {
    return this.svc.findOnePlanning(id);
  }

  @Post('plannings')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Créer un nouveau planning de nettoyage' })
  @ApiResponse({ status: 201, description: 'Planning créé' })
  createPlanning(@Body() createDto: any, @CurrentUser() user: any) {
    return this.svc.createPlanning({ ...createDto, responsable_id: user.id });
  }

  @Patch('plannings/:id')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Mettre à jour un planning de nettoyage' })
  @ApiResponse({ status: 200, description: 'Planning mis à jour' })
  updatePlanning(@Param('id') id: string, @Body() updateDto: any) {
    return this.svc.updatePlanning(id, updateDto);
  }

  @Delete('plannings/:id')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Supprimer un planning de nettoyage' })
  @ApiResponse({ status: 200, description: 'Planning supprimé' })
  removePlanning(@Param('id') id: string) {
    return this.svc.removePlanning(id);
  }

  // ========== STOCKS PRODUITS MENAGE ==========

  @Get('stocks')
  @Roles('super_admin', 'admin', 'responsable_logistique')
  @ApiOperation({ summary: 'Lister tous les stocks de produits de ménage' })
  @ApiResponse({ status: 200, description: 'Liste des stocks' })
  findAllStocks() {
    return this.svc.findAllStocks();
  }

  @Get('stocks/:id')
  @Roles('super_admin', 'admin', 'responsable_logistique')
  @ApiOperation({ summary: 'Détails d\'un stock de produits' })
  @ApiResponse({ status: 200, description: 'Détails du stock' })
  findOneStock(@Param('id') id: string) {
    return this.svc.findOneStock(id);
  }

  @Post('stocks')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Créer un nouveau stock de produits' })
  @ApiResponse({ status: 201, description: 'Stock créé' })
  createStock(@Body() createDto: any, @CurrentUser() user: any) {
    return this.svc.createStock({ ...createDto, responsable_id: user.id });
  }

  @Patch('stocks/:id')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Mettre à jour un stock de produits' })
  @ApiResponse({ status: 200, description: 'Stock mis à jour' })
  updateStock(@Param('id') id: string, @Body() updateDto: any) {
    return this.svc.updateStock(id, updateDto);
  }

  @Delete('stocks/:id')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Supprimer un stock de produits' })
  @ApiResponse({ status: 200, description: 'Stock supprimé' })
  removeStock(@Param('id') id: string) {
    return this.svc.removeStock(id);
  }

  // ========== MAINTENANCES PREVENTIVES ==========

  @Get('maintenances')
  @Roles('super_admin', 'admin', 'responsable_logistique')
  @ApiOperation({ summary: 'Lister toutes les maintenances préventives' })
  @ApiResponse({ status: 200, description: 'Liste des maintenances' })
  findAllMaintenances() {
    return this.svc.findAllMaintenances();
  }

  @Get('maintenances/:id')
  @Roles('super_admin', 'admin', 'responsable_logistique')
  @ApiOperation({ summary: 'Détails d\'une maintenance préventive' })
  @ApiResponse({ status: 200, description: 'Détails de la maintenance' })
  findOneMaintenance(@Param('id') id: string) {
    return this.svc.findOneMaintenance(id);
  }

  @Post('maintenances')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Planifier une nouvelle maintenance préventive' })
  @ApiResponse({ status: 201, description: 'Maintenance créée' })
  createMaintenance(@Body() createDto: any, @CurrentUser() user: any) {
    return this.svc.createMaintenance({ ...createDto, responsable_id: user.id });
  }

  @Patch('maintenances/:id')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Mettre à jour une maintenance préventive' })
  @ApiResponse({ status: 200, description: 'Maintenance mise à jour' })
  updateMaintenance(@Param('id') id: string, @Body() updateDto: any) {
    return this.svc.updateMaintenance(id, updateDto);
  }

  @Delete('maintenances/:id')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Supprimer une maintenance préventive' })
  @ApiResponse({ status: 200, description: 'Maintenance supprimée' })
  removeMaintenance(@Param('id') id: string) {
    return this.svc.removeMaintenance(id);
  }

  // ========== RAPPORTS ENTRETIEN ==========

  @Get('rapports')
  @Roles('super_admin', 'admin', 'responsable_logistique')
  @ApiOperation({ summary: 'Lister tous les rapports d\'entretien' })
  @ApiResponse({ status: 200, description: 'Liste des rapports' })
  findAllRapports() {
    return this.svc.findAllRapports();
  }

  @Get('rapports/:id')
  @Roles('super_admin', 'admin', 'responsable_logistique')
  @ApiOperation({ summary: 'Détails d\'un rapport d\'entretien' })
  @ApiResponse({ status: 200, description: 'Détails du rapport' })
  findOneRapport(@Param('id') id: string) {
    return this.svc.findOneRapport(id);
  }

  @Post('rapports')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Créer un nouveau rapport d\'entretien' })
  @ApiResponse({ status: 201, description: 'Rapport créé' })
  createRapport(@Body() createDto: any, @CurrentUser() user: any) {
    return this.svc.createRapport({ ...createDto, responsable_id: user.id });
  }

  @Patch('rapports/:id')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Mettre à jour un rapport d\'entretien' })
  @ApiResponse({ status: 200, description: 'Rapport mis à jour' })
  updateRapport(@Param('id') id: string, @Body() updateDto: any) {
    return this.svc.updateRapport(id, updateDto);
  }

  @Delete('rapports/:id')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Supprimer un rapport d\'entretien' })
  @ApiResponse({ status: 200, description: 'Rapport supprimé' })
  removeRapport(@Param('id') id: string) {
    return this.svc.removeRapport(id);
  }

  // ========== DASHBOARD ==========

  @Get('dashboard')
  @Roles('responsable_logistique')
  @ApiOperation({ summary: 'Tableau de bord du responsable logistique' })
  @ApiResponse({ status: 200, description: 'Statistiques du responsable logistique' })
  getDashboard(@CurrentUser() user: any) {
    return this.svc.getDashboard();
  }
}
