import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { EconomatService } from './economat.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CreateDepenseDto } from './dto/create-depense.dto';
import { ApproveDepenseDto, ValidatePresidentDto, MarkAsPaidDto } from './dto/approve-depense.dto';
import { BudgetFiltersDto, DepenseFiltersDto, RecouvrementFiltersDto, RapportFiltersDto } from './dto/filters.dto';

@Controller('economat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EconomatController {
  constructor(private readonly economatService: EconomatService) {}

  // ==================== ANNÉES ACADÉMIQUES ====================

  @Get('annee-academique')
  @Roles('economat', 'admin', 'president')
  async getAnneesAcademiques() {
    return this.economatService.getAnneesAcademiques();
  }

  // ==================== BUDGET ====================

  @Post('budget')
  @Roles('economat', 'admin')
  async createBudget(@Body(ValidationPipe) dto: CreateBudgetDto) {
    return this.economatService.createBudget(dto);
  }

  @Get('budget')
  @Roles('economat', 'admin', 'president')
  async getBudgets(@Query(ValidationPipe) filters: BudgetFiltersDto) {
    return this.economatService.getBudgets(filters);
  }

  @Get('budget/stats')
  @Roles('economat', 'admin', 'president')
  async getBudgetStats(@Query('annee_academique_id') anneeAcademiqueId?: string) {
    return this.economatService.getBudgetStats(anneeAcademiqueId);
  }

  @Get('budget/by-departement')
  @Roles('economat', 'admin', 'president')
  async getBudgetByDepartement(@Query('annee_academique_id') anneeAcademiqueId?: string) {
    return this.economatService.getBudgetByDepartement(anneeAcademiqueId);
  }

  @Get('budget/:id')
  @Roles('economat', 'admin', 'president')
  async getBudgetById(@Param('id') id: string) {
    return this.economatService.getBudgetById(id);
  }

  @Put('budget/:id')
  @Roles('economat', 'admin')
  async updateBudget(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateBudgetDto,
  ) {
    return this.economatService.updateBudget(id, dto);
  }

  // ==================== DEPENSES ====================
  // DÉSACTIVÉ - Utiliser DepensesController à la place

  // @Post('depenses')
  // @Roles('economat', 'admin')
  // async createDepense(@Body(ValidationPipe) dto: CreateDepenseDto) {
  //   return this.economatService.createDepense(dto);
  // }

  // @Get('depenses')
  // @Roles('economat', 'admin', 'president')
  // async getDepenses(@Query(ValidationPipe) filters: DepenseFiltersDto) {
  //   return this.economatService.getDepenses(filters);
  // }

  // @Get('depenses/stats')
  // @Roles('economat', 'admin', 'president')
  // async getDepenseStats(@Query('annee_academique_id') anneeAcademiqueId?: string) {
  //   return this.economatService.getDepenseStats(anneeAcademiqueId);
  // }

  // @Get('depenses/by-fournisseur')
  // @Roles('economat', 'admin', 'president')
  // async getDepensesByFournisseur(@Query('annee_academique_id') anneeAcademiqueId?: string) {
  //   return this.economatService.getDepensesByFournisseur(anneeAcademiqueId);
  // }

  // @Get('depenses/by-categorie')
  // @Roles('economat', 'admin', 'president')
  // async getDepensesByCategorie(@Query('annee_academique_id') anneeAcademiqueId?: string) {
  //   return this.economatService.getDepensesByCategorie(anneeAcademiqueId);
  // }

  // @Get('depenses/:id')
  // @Roles('economat', 'admin', 'president')
  // async getDepenseById(@Param('id') id: string) {
  //   return this.economatService.getDepenseById(id);
  // }

  // @Patch('depenses/:id/approve')
  // @Roles('economat', 'admin')
  // async approveDepense(
  //   @Param('id') id: string,
  //   @Body(ValidationPipe) dto: ApproveDepenseDto,
  // ) {
  //   return this.economatService.approveDepense(id, dto);
  // }

  // @Patch('depenses/:id/validate-president')
  // @Roles('president', 'admin')
  // async validateByPresident(
  //   @Param('id') id: string,
  //   @Body(ValidationPipe) dto: ValidatePresidentDto,
  // ) {
  //   return this.economatService.validateByPresident(id, dto);
  // }

  // @Patch('depenses/:id/mark-paid')
  // @Roles('economat', 'admin')
  // async markAsPaid(
  //   @Param('id') id: string,
  //   @Body(ValidationPipe) dto: MarkAsPaidDto,
  // ) {
  //   return this.economatService.markAsPaid(id, dto);
  // }

  // ==================== FOURNISSEURS ====================

  @Get('fournisseurs')
  @Roles('economat', 'admin', 'president')
  async getFournisseurs(@Query('search') search?: string) {
    return this.economatService.getFournisseurs(search);
  }

  @Get('fournisseurs/:fournisseur/transactions')
  @Roles('economat', 'admin', 'president')
  async getFournisseurTransactions(@Param('fournisseur') fournisseur: string) {
    return this.economatService.getFournisseurTransactions(fournisseur);
  }

  // ==================== RECOUVREMENT ====================

  @Get('recouvrement/stats')
  @Roles('economat', 'admin', 'president')
  async getRecouvrementStats(@Query('annee_academique_id') anneeAcademiqueId?: string) {
    return this.economatService.getRecouvrementStats(anneeAcademiqueId);
  }

  @Get('recouvrement/impayes')
  @Roles('economat', 'admin', 'president')
  async getInscriptionsImpayees(@Query(ValidationPipe) filters: RecouvrementFiltersDto) {
    return this.economatService.getInscriptionsImpayees(filters);
  }

  @Get('recouvrement/by-parcours')
  @Roles('economat', 'admin', 'president')
  async getRecouvrementByParcours(@Query('annee_academique_id') anneeAcademiqueId?: string) {
    return this.economatService.getRecouvrementByParcours(anneeAcademiqueId);
  }

  // ==================== RAPPORTS ====================

  @Get('rapports/journalier')
  @Roles('economat', 'admin', 'president')
  async getRapportJournalier(@Query('date') date: string) {
    return this.economatService.getRapportJournalier(date);
  }

  @Get('rapports/mensuel')
  @Roles('economat', 'admin', 'president')
  async getRapportMensuel(
    @Query('mois') mois: string,
    @Query('annee') annee: number,
  ) {
    return this.economatService.getRapportMensuel(mois, annee);
  }

  @Get('rapports/annuel')
  @Roles('economat', 'admin', 'president')
  async getRapportAnnuel(@Query('annee_academique_id') anneeAcademiqueId: string) {
    return this.economatService.getRapportAnnuel(anneeAcademiqueId);
  }

  @Get('rapports/bilan')
  @Roles('economat', 'admin', 'president')
  async getBilanFinancier(@Query('annee_academique_id') anneeAcademiqueId: string) {
    return this.economatService.getBilanFinancier(anneeAcademiqueId);
  }

  // ==================== SUBVENTIONS ====================

  @Get('subventions')
  @Roles('economat', 'admin', 'president')
  async getSubventions(@Query('annee_academique_id') anneeAcademiqueId?: string) {
    return this.economatService.getSubventions(anneeAcademiqueId);
  }

  @Get('subventions/:id/utilisation')
  @Roles('economat', 'admin', 'president')
  async getSubventionUtilisation(@Param('id') id: string) {
    return this.economatService.getSubventionUtilisation(id);
  }
}

// Made with Bob
