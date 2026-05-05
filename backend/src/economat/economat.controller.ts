import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EconomatService } from './economat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Économat - Direction Financière')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('economat')
export class EconomatController {
  constructor(private readonly svc: EconomatService) {}

  // ========== BUDGET ==========
  @Post('budgets')
  @Roles('economat', 'admin', 'president')
  @ApiOperation({ summary: 'Élaborer le budget annuel par département' })
  createBudget(@Body() dto: any) {
    return this.svc.createBudget(dto);
  }

  @Get('budgets')
  @Roles('economat', 'admin', 'president', 'secretaire')
  @ApiOperation({ summary: 'Liste des budgets' })
  findBudgets(@Query() filters: any) {
    return this.svc.findBudgets(filters);
  }

  @Get('budgets/annee/:anneeAcademiqueId')
  @Roles('economat', 'admin', 'president', 'secretaire')
  @ApiOperation({ summary: 'Budget complet d\'une année académique' })
  getBudgetByAnnee(@Param('anneeAcademiqueId') anneeAcademiqueId: string) {
    return this.svc.getBudgetByAnnee(anneeAcademiqueId);
  }

  @Patch('budgets/:id/allouer')
  @Roles('economat', 'admin', 'president')
  @ApiOperation({ summary: 'Modifier l\'allocation budgétaire' })
  allouerBudget(@Param('id') id: string, @Body('montant') montant: number) {
    return this.svc.allouerBudget(id, montant);
  }

  @Get('budgets/:id/execution')
  @Roles('economat', 'admin', 'president')
  @ApiOperation({ summary: 'Suivi d\'exécution du budget' })
  getExecutionBudget(@Param('id') id: string) {
    return this.svc.getExecutionBudget(id);
  }

  // ========== DEMANDES D'ACHAT ==========
  @Post('demandes-achat')
  @Roles('secretaire', 'responsable_pedagogique', 'admin')
  @ApiOperation({ summary: 'Soumettre une demande d\'achat' })
  createDemandeAchat(@Body() dto: any) {
    return this.svc.createDemandeAchat(dto);
  }

  @Get('demandes-achat')
  @Roles('economat', 'admin', 'secretaire', 'president')
  @ApiOperation({ summary: 'Liste des demandes d\'achat' })
  findDemandesAchat(@Query() filters: any) {
    return this.svc.findDemandesAchat(filters);
  }

  @Patch('demandes-achat/:id/valider')
  @Roles('economat', 'admin')
  @ApiOperation({ summary: 'Valider une demande d\'achat' })
  validerDemandeAchat(@Param('id') id: string, @Body('validePar') validePar: string) {
    return this.svc.validerDemandeAchat(id, validePar);
  }

  @Patch('demandes-achat/:id/rejeter')
  @Roles('economat', 'admin', 'president')
  @ApiOperation({ summary: 'Rejeter une demande d\'achat' })
  rejeterDemandeAchat(@Param('id') id: string, @Body() dto: { validePar: string; motif: string }) {
    return this.svc.rejeterDemandeAchat(id, dto);
  }

  // ========== DÉPENSES ==========
  @Post('depenses')
  @Roles('economat', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Enregistrer une dépense' })
  createDepense(@Body() dto: any) {
    return this.svc.createDepense(dto);
  }

  @Get('depenses')
  @Roles('economat', 'admin', 'president', 'secretaire')
  @ApiOperation({ summary: 'Liste des dépenses' })
  findDepenses(@Query() filters: any) {
    return this.svc.findDepenses(filters);
  }

  @Patch('depenses/:id/approuver')
  @Roles('economat', 'admin', 'president')
  @ApiOperation({ summary: 'Approuver une dépense' })
  approuverDepense(@Param('id') id: string, @Body() dto: { approuvePar: string }) {
    return this.svc.approuverDepense(id, dto.approuvePar);
  }

  @Get('depenses/categories')
  @Roles('economat', 'admin', 'president')
  @ApiOperation({ summary: 'Répartition des dépenses par catégorie' })
  getDepensesParCategorie(@Query('anneeAcademiqueId') anneeAcademiqueId?: string) {
    return this.svc.getDepensesParCategorie(anneeAcademiqueId);
  }

  // ========== STOCK ==========
  @Get('stock/alertes')
  @Roles('economat', 'admin', 'logistique')
  @ApiOperation({ summary: 'Alertes de stock bas' })
  getStockAlertes() {
    return this.svc.getStockAlertes();
  }

  @Get('stock/valeur')
  @Roles('economat', 'admin', 'president')
  @ApiOperation({ summary: 'Valeur totale du stock' })
  getValeurStock() {
    return this.svc.getValeurStock();
  }

  // ========== RECOUVREMENT ==========
  @Get('recouvrement/stats')
  @Roles('economat', 'admin', 'president', 'secretaire')
  @ApiOperation({ summary: 'Statistiques de recouvrement des frais' })
  getStatsRecouvrement(@Query('anneeAcademiqueId') anneeAcademiqueId?: string) {
    return this.svc.getStatsRecouvrement(anneeAcademiqueId);
  }

  @Get('recouvrement/impayes')
  @Roles('economat', 'admin', 'president', 'secretaire')
  @ApiOperation({ summary: 'Liste des impayés' })
  getImpayes(@Query() filters: any) {
    return this.svc.getImpayes(filters);
  }

  @Get('recouvrement/creances')
  @Roles('economat', 'admin', 'president')
  @ApiOperation({ summary: 'Âge des créances' })
  getCreances(@Query('jours') jours: number = 30) {
    return this.svc.getCreancesAging(jours);
  }

  // ========== AUDIT ET REPORTING ==========
  @Get('audit/rapport-mensuel')
  @Roles('economat', 'admin', 'president')
  @ApiOperation({ summary: 'Rapport financier mensuel pour le Président' })
  getRapportMensuel(@Query('mois') mois: number, @Query('annee') annee: number) {
    return this.svc.getRapportMensuel(mois, annee);
  }

  @Get('audit/bilan')
  @Roles('economat', 'admin', 'president')
  @ApiOperation({ summary: 'Bilan financier' })
  getBilanFinancier(@Query('anneeAcademiqueId') anneeAcademiqueId?: string) {
    return this.svc.getBilanFinancier(anneeAcademiqueId);
  }

  @Get('tresorerie')
  @Roles('economat', 'admin', 'president')
  @ApiOperation({ summary: 'Prévision de trésorerie' })
  getPrevisionTresorerie(@Query('mois') mois: number = 6) {
    return this.svc.getPrevisionTresorerie(mois);
  }
}
