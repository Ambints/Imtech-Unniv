import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SurveillanceService } from './surveillance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateSurveillantDto } from './dto/create-surveillant.dto';
import { UpdateSurveillantDto } from './dto/update-surveillant.dto';

@ApiTags('Surveillance - Surveillants Généraux')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('surveillance')
export class SurveillanceController {
  constructor(private readonly svc: SurveillanceService) {}

  // ========== SURVEILLANTS GENERAUX ==========

  @Get('surveillants')
  @Roles('super_admin', 'admin', 'surveillant_general')
  @ApiOperation({ summary: 'Lister tous les surveillants généraux' })
  @ApiResponse({ status: 200, description: 'Liste des surveillants' })
  findAllSurveillants() {
    return this.svc.findAllSurveillants();
  }

  @Get('surveillants/:id')
  @Roles('super_admin', 'admin', 'surveillant_general')
  @ApiOperation({ summary: 'Détails d\'un surveillant' })
  @ApiResponse({ status: 200, description: 'Détails du surveillant' })
  findOneSurveillant(@Param('id') id: string) {
    return this.svc.findOneSurveillant(id);
  }

  @Post('surveillants')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Créer un nouveau surveillant général' })
  @ApiResponse({ status: 201, description: 'Surveillant créé' })
  createSurveillant(@Body() createDto: CreateSurveillantDto) {
    return this.svc.createSurveillant(createDto);
  }

  @Patch('surveillants/:id')
  @Roles('super_admin', 'admin', 'surveillant_general')
  @ApiOperation({ summary: 'Mettre à jour un surveillant' })
  @ApiResponse({ status: 200, description: 'Surveillant mis à jour' })
  updateSurveillant(@Param('id') id: string, @Body() updateDto: UpdateSurveillantDto) {
    return this.svc.updateSurveillant(id, updateDto);
  }

  @Delete('surveillants/:id')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Supprimer un surveillant' })
  @ApiResponse({ status: 200, description: 'Surveillant supprimé' })
  removeSurveillant(@Param('id') id: string) {
    return this.svc.removeSurveillant(id);
  }

  // ========== APPELS NUMERIQUES ==========

  @Get('appels')
  @Roles('super_admin', 'admin', 'surveillant_general')
  @ApiOperation({ summary: 'Lister tous les appels numériques' })
  @ApiResponse({ status: 200, description: 'Liste des appels' })
  findAllAppels() {
    return this.svc.findAllAppels();
  }

  @Get('appels/:id')
  @Roles('super_admin', 'admin', 'surveillant_general')
  @ApiOperation({ summary: 'Détails d\'un appel' })
  @ApiResponse({ status: 200, description: 'Détails de l\'appel' })
  findOneAppel(@Param('id') id: string) {
    return this.svc.findOneAppel(id);
  }

  @Post('appels')
  @Roles('surveillant_general')
  @ApiOperation({ summary: 'Créer un nouvel appel numérique' })
  @ApiResponse({ status: 201, description: 'Appel créé' })
  createAppel(@Body() createDto: any, @CurrentUser() user: any) {
    return this.svc.createAppel({ ...createDto, surveillant_id: user.id });
  }

  @Patch('appels/:id')
  @Roles('surveillant_general')
  @ApiOperation({ summary: 'Mettre à jour un appel' })
  @ApiResponse({ status: 200, description: 'Appel mis à jour' })
  updateAppel(@Param('id') id: string, @Body() updateDto: any) {
    return this.svc.updateAppel(id, updateDto);
  }

  @Delete('appels/:id')
  @Roles('surveillant_general')
  @ApiOperation({ summary: 'Supprimer un appel' })
  @ApiResponse({ status: 200, description: 'Appel supprimé' })
  removeAppel(@Param('id') id: string) {
    return this.svc.removeAppel(id);
  }

  // ========== INCIDENTS DISCIPLINAIRES ==========

  @Get('incidents')
  @Roles('super_admin', 'admin', 'surveillant_general')
  @ApiOperation({ summary: 'Lister tous les incidents disciplinaires' })
  @ApiResponse({ status: 200, description: 'Liste des incidents' })
  findAllIncidents() {
    return this.svc.findAllIncidents();
  }

  @Get('incidents/:id')
  @Roles('super_admin', 'admin', 'surveillant_general')
  @ApiOperation({ summary: 'Détails d\'un incident' })
  @ApiResponse({ status: 200, description: 'Détails de l\'incident' })
  findOneIncident(@Param('id') id: string) {
    return this.svc.findOneIncident(id);
  }

  @Post('incidents')
  @Roles('surveillant_general')
  @ApiOperation({ summary: 'Signaler un incident disciplinaire' })
  @ApiResponse({ status: 201, description: 'Incident créé' })
  createIncident(@Body() createDto: any, @CurrentUser() user: any) {
    return this.svc.createIncident({ ...createDto, surveillant_id: user.id });
  }

  @Patch('incidents/:id')
  @Roles('surveillant_general')
  @ApiOperation({ summary: 'Mettre à jour un incident' })
  @ApiResponse({ status: 200, description: 'Incident mis à jour' })
  updateIncident(@Param('id') id: string, @Body() updateDto: any) {
    return this.svc.updateIncident(id, updateDto);
  }

  @Delete('incidents/:id')
  @Roles('surveillant_general')
  @ApiOperation({ summary: 'Supprimer un incident' })
  @ApiResponse({ status: 200, description: 'Incident supprimé' })
  removeIncident(@Param('id') id: string) {
    return this.svc.removeIncident(id);
  }

  // ========== ORGANISATIONS EXAMENS ==========

  @Get('examens')
  @Roles('super_admin', 'admin', 'surveillant_general')
  @ApiOperation({ summary: 'Lister toutes les organisations d\'examens' })
  @ApiResponse({ status: 200, description: 'Liste des organisations' })
  findAllOrganisations() {
    return this.svc.findAllOrganisations();
  }

  @Get('examens/:id')
  @Roles('super_admin', 'admin', 'surveillant_general')
  @ApiOperation({ summary: 'Détails d\'une organisation d\'examen' })
  @ApiResponse({ status: 200, description: 'Détails de l\'organisation' })
  findOneOrganisation(@Param('id') id: string) {
    return this.svc.findOneOrganisation(id);
  }

  @Post('examens')
  @Roles('surveillant_general')
  @ApiOperation({ summary: 'Organiser un examen' })
  @ApiResponse({ status: 201, description: 'Examen organisé' })
  createOrganisation(@Body() createDto: any, @CurrentUser() user: any) {
    return this.svc.createOrganisation({ ...createDto, surveillant_id: user.id });
  }

  @Patch('examens/:id')
  @Roles('surveillant_general')
  @ApiOperation({ summary: 'Mettre à jour une organisation' })
  @ApiResponse({ status: 200, description: 'Organisation mise à jour' })
  updateOrganisation(@Param('id') id: string, @Body() updateDto: any) {
    return this.svc.updateOrganisation(id, updateDto);
  }

  @Delete('examens/:id')
  @Roles('surveillant_general')
  @ApiOperation({ summary: 'Supprimer une organisation' })
  @ApiResponse({ status: 200, description: 'Organisation supprimée' })
  removeOrganisation(@Param('id') id: string) {
    return this.svc.removeOrganisation(id);
  }

  // ========== RAPPORTS SURVEILLANCE ==========

  @Get('rapports')
  @Roles('super_admin', 'admin', 'surveillant_general')
  @ApiOperation({ summary: 'Lister tous les rapports de surveillance' })
  @ApiResponse({ status: 200, description: 'Liste des rapports' })
  findAllRapports() {
    return this.svc.findAllRapports();
  }

  @Get('rapports/:id')
  @Roles('super_admin', 'admin', 'surveillant_general')
  @ApiOperation({ summary: 'Détails d\'un rapport' })
  @ApiResponse({ status: 200, description: 'Détails du rapport' })
  findOneRapport(@Param('id') id: string) {
    return this.svc.findOneRapport(id);
  }

  @Post('rapports')
  @Roles('surveillant_general')
  @ApiOperation({ summary: 'Créer un rapport de surveillance' })
  @ApiResponse({ status: 201, description: 'Rapport créé' })
  createRapport(@Body() createDto: any, @CurrentUser() user: any) {
    return this.svc.createRapport({ ...createDto, surveillant_id: user.id });
  }

  @Patch('rapports/:id')
  @Roles('surveillant_general')
  @ApiOperation({ summary: 'Mettre à jour un rapport' })
  @ApiResponse({ status: 200, description: 'Rapport mis à jour' })
  updateRapport(@Param('id') id: string, @Body() updateDto: any) {
    return this.svc.updateRapport(id, updateDto);
  }

  @Delete('rapports/:id')
  @Roles('surveillant_general')
  @ApiOperation({ summary: 'Supprimer un rapport' })
  @ApiResponse({ status: 200, description: 'Rapport supprimé' })
  removeRapport(@Param('id') id: string) {
    return this.svc.removeRapport(id);
  }

  // ========== DASHBOARD ==========

  @Get('dashboard')
  @Roles('surveillant_general')
  @ApiOperation({ summary: 'Tableau de bord du surveillant' })
  @ApiResponse({ status: 200, description: 'Statistiques du surveillant' })
  getDashboard(@CurrentUser() user: any) {
    return this.svc.getDashboard();
  }
}
