import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GouvernanceService } from './gouvernance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreatePresidentDto } from './dto/create-president.dto';
import { UpdatePresidentDto } from './dto/update-president.dto';

@ApiTags('Gouvernance - Présidence')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gouvernance')
export class GouvernanceController {
  constructor(private readonly svc: GouvernanceService) {}

  // ========== PRESIDENT ==========

  @Get('presidents')
  @Roles('super_admin', 'president')
  @ApiOperation({ summary: 'Lister tous les présidents' })
  @ApiResponse({ status: 200, description: 'Liste des présidents' })
  findAllPresidents() {
    return this.svc.findAllPresidents();
  }

  @Get('presidents/:id')
  @Roles('super_admin', 'president')
  @ApiOperation({ summary: 'Détails d\'un président' })
  @ApiResponse({ status: 200, description: 'Détails du président' })
  findOnePresident(@Param('id') id: string) {
    return this.svc.findOnePresident(id);
  }

  @Post('presidents')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Créer un nouveau président' })
  @ApiResponse({ status: 201, description: 'Président créé' })
  createPresident(@Body() createDto: CreatePresidentDto) {
    return this.svc.createPresident(createDto);
  }

  @Patch('presidents/:id')
  @Roles('super_admin', 'president')
  @ApiOperation({ summary: 'Mettre à jour un président' })
  @ApiResponse({ status: 200, description: 'Président mis à jour' })
  updatePresident(@Param('id') id: string, @Body() updateDto: UpdatePresidentDto) {
    return this.svc.updatePresident(id, updateDto);
  }

  @Delete('presidents/:id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Supprimer un président' })
  @ApiResponse({ status: 200, description: 'Président supprimé' })
  removePresident(@Param('id') id: string) {
    return this.svc.removePresident(id);
  }

  // ========== DECISIONS PRESIDENTIELLES ==========

  @Get('decisions')
  @Roles('super_admin', 'president')
  @ApiOperation({ summary: 'Lister toutes les décisions présidentielles' })
  @ApiResponse({ status: 200, description: 'Liste des décisions' })
  findAllDecisions() {
    return this.svc.findAllDecisions();
  }

  @Get('decisions/:id')
  @Roles('super_admin', 'president')
  @ApiOperation({ summary: 'Détails d\'une décision' })
  @ApiResponse({ status: 200, description: 'Détails de la décision' })
  findOneDecision(@Param('id') id: string) {
    return this.svc.findOneDecision(id);
  }

  @Post('decisions')
  @Roles('president')
  @ApiOperation({ summary: 'Créer une nouvelle décision présidentielle' })
  @ApiResponse({ status: 201, description: 'Décision créée' })
  createDecision(@Body() createDto: any, @CurrentUser() user: any) {
    return this.svc.createDecision({ ...createDto, president_id: user.id });
  }

  @Patch('decisions/:id')
  @Roles('president')
  @ApiOperation({ summary: 'Mettre à jour une décision' })
  @ApiResponse({ status: 200, description: 'Décision mise à jour' })
  updateDecision(@Param('id') id: string, @Body() updateDto: any) {
    return this.svc.updateDecision(id, updateDto);
  }

  @Delete('decisions/:id')
  @Roles('president')
  @ApiOperation({ summary: 'Supprimer une décision' })
  @ApiResponse({ status: 200, description: 'Décision supprimée' })
  removeDecision(@Param('id') id: string) {
    return this.svc.removeDecision(id);
  }

  // ========== VALIDATIONS RECRUTEMENT ==========

  @Get('validations')
  @Roles('super_admin', 'president')
  @ApiOperation({ summary: 'Lister toutes les validations de recrutement' })
  @ApiResponse({ status: 200, description: 'Liste des validations' })
  findAllValidations() {
    return this.svc.findAllValidations();
  }

  @Get('validations/:id')
  @Roles('super_admin', 'president')
  @ApiOperation({ summary: 'Détails d\'une validation' })
  @ApiResponse({ status: 200, description: 'Détails de la validation' })
  findOneValidation(@Param('id') id: string) {
    return this.svc.findOneValidation(id);
  }

  @Post('validations')
  @Roles('president')
  @ApiOperation({ summary: 'Valider un recrutement' })
  @ApiResponse({ status: 201, description: 'Validation créée' })
  createValidation(@Body() createDto: any, @CurrentUser() user: any) {
    return this.svc.createValidation({ ...createDto, president_id: user.id });
  }

  @Patch('validations/:id')
  @Roles('president')
  @ApiOperation({ summary: 'Mettre à jour une validation' })
  @ApiResponse({ status: 200, description: 'Validation mise à jour' })
  updateValidation(@Param('id') id: string, @Body() updateDto: any) {
    return this.svc.updateValidation(id, updateDto);
  }

  @Delete('validations/:id')
  @Roles('president')
  @ApiOperation({ summary: 'Supprimer une validation' })
  @ApiResponse({ status: 200, description: 'Validation supprimée' })
  removeValidation(@Param('id') id: string) {
    return this.svc.removeValidation(id);
  }

  // ========== ARBITRAGES ==========

  @Get('arbitrages')
  @Roles('super_admin', 'president')
  @ApiOperation({ summary: 'Lister tous les arbitrages' })
  @ApiResponse({ status: 200, description: 'Liste des arbitrages' })
  findAllArbitrages() {
    return this.svc.findAllArbitrages();
  }

  @Get('arbitrages/:id')
  @Roles('super_admin', 'president')
  @ApiOperation({ summary: 'Détails d\'un arbitrage' })
  @ApiResponse({ status: 200, description: 'Détails de l\'arbitrage' })
  findOneArbitrage(@Param('id') id: string) {
    return this.svc.findOneArbitrage(id);
  }

  @Post('arbitrages')
  @Roles('president')
  @ApiOperation({ summary: 'Créer un nouvel arbitrage' })
  @ApiResponse({ status: 201, description: 'Arbitrage créé' })
  createArbitrage(@Body() createDto: any, @CurrentUser() user: any) {
    return this.svc.createArbitrage({ ...createDto, president_id: user.id });
  }

  @Patch('arbitrages/:id')
  @Roles('president')
  @ApiOperation({ summary: 'Mettre à jour un arbitrage' })
  @ApiResponse({ status: 200, description: 'Arbitrage mis à jour' })
  updateArbitrage(@Param('id') id: string, @Body() updateDto: any) {
    return this.svc.updateArbitrage(id, updateDto);
  }

  @Delete('arbitrages/:id')
  @Roles('president')
  @ApiOperation({ summary: 'Supprimer un arbitrage' })
  @ApiResponse({ status: 200, description: 'Arbitrage supprimé' })
  removeArbitrage(@Param('id') id: string) {
    return this.svc.removeArbitrage(id);
  }

  // ========== CONSEILS UNIVERSITAIRES ==========

  @Get('conseils')
  @Roles('super_admin', 'president')
  @ApiOperation({ summary: 'Lister tous les conseils universitaires' })
  @ApiResponse({ status: 200, description: 'Liste des conseils' })
  findAllConseils() {
    return this.svc.findAllConseils();
  }

  @Get('conseils/:id')
  @Roles('super_admin', 'president')
  @ApiOperation({ summary: 'Détails d\'un conseil' })
  @ApiResponse({ status: 200, description: 'Détails du conseil' })
  findOneConseil(@Param('id') id: string) {
    return this.svc.findOneConseil(id);
  }

  @Post('conseils')
  @Roles('president')
  @ApiOperation({ summary: 'Créer un nouveau conseil universitaire' })
  @ApiResponse({ status: 201, description: 'Conseil créé' })
  createConseil(@Body() createDto: any, @CurrentUser() user: any) {
    return this.svc.createConseil({ ...createDto, president_id: user.id });
  }

  @Patch('conseils/:id')
  @Roles('president')
  @ApiOperation({ summary: 'Mettre à jour un conseil' })
  @ApiResponse({ status: 200, description: 'Conseil mis à jour' })
  updateConseil(@Param('id') id: string, @Body() updateDto: any) {
    return this.svc.updateConseil(id, updateDto);
  }

  @Delete('conseils/:id')
  @Roles('president')
  @ApiOperation({ summary: 'Supprimer un conseil' })
  @ApiResponse({ status: 200, description: 'Conseil supprimé' })
  removeConseil(@Param('id') id: string) {
    return this.svc.removeConseil(id);
  }

  // ========== DASHBOARD ==========

  @Get('dashboard')
  @Roles('president')
  @ApiOperation({ summary: 'Tableau de bord du président' })
  @ApiResponse({ status: 200, description: 'Statistiques du président' })
  getDashboard(@CurrentUser() user: any) {
    return this.svc.getDashboard();
  }
}
