import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FinanceService } from './finance.service';

@ApiTags('Finance')
@ApiBearerAuth('JWT-auth')
@Controller('finance')
export class FinanceController {
  constructor(private readonly svc: FinanceService) {}

  @Post(':tid/paiements')
  @ApiOperation({ summary: 'Enregistrer paiement + generer recu (Caissier)' })
  payer(@Param('tid') tid: string, @Body() dto: any) {
    return this.svc.enregistrerPaiement(tid, dto, 'caissier');
  }

  @Get(':tid/paiements')
  @ApiOperation({ summary: 'Tous les paiements (filtre par date)' })
  getTousPaiements(@Param('tid') tid: string, @Query('date') date?: string) {
    return this.svc.getTousPaiements(tid, date);
  }

  @Get(':tid/paiements/:etudiantId')
  @ApiOperation({ summary: 'Paiements d un etudiant' })
  getPaiements(@Param('tid') tid: string, @Param('etudiantId') eid: string) {
    return this.svc.getPaiementsEtudiant(tid, eid);
  }

  @Get(':tid/caisse')
  @ApiOperation({ summary: 'Etat caisse journaliere (Caissier)' })
  getCaisse(@Param('tid') tid: string) { return this.svc.getCaisseJournaliere(tid); }

  @Post(':tid/caisse/cloturer')
  @ApiOperation({ summary: 'Cloturer la caisse du jour' })
  cloturer(@Param('tid') tid: string, @Body() body: any) {
    return this.svc.cloturerCaisse(tid, body.userId);
  }

  @Post(':tid/budgets')
  @ApiOperation({ summary: 'Creer un budget (Economat)' })
  creerBudget(@Param('tid') tid: string, @Body() dto: any) { return this.svc.creerBudget(tid, dto); }

  @Get(':tid/budgets')
  @ApiOperation({ summary: 'Liste des budgets' })
  getBudgets(@Param('tid') tid: string, @Query('annee') annee?: string) {
    return this.svc.getBudgets(tid, annee);
  }

  @Post(':tid/depenses')
  @ApiOperation({ summary: 'Ajouter une depense' })
  ajouterDepense(@Param('tid') tid: string, @Body() dto: any) {
    return this.svc.ajouterDepense(tid, dto, 'user');
  }

  @Get(':tid/depenses')
  @ApiOperation({ summary: 'Liste des depenses' })
  getDepenses(@Param('tid') tid: string, @Query('annee') annee?: string) {
    return this.svc.getDepenses(tid, annee);
  }

  @Patch(':tid/depenses/:id')
  @ApiOperation({ summary: 'Modifier une depense' })
  updateDepense(@Param('tid') tid: string, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateDepense(tid, id, dto);
  }

  @Delete(':tid/depenses/:id')
  @ApiOperation({ summary: 'Supprimer une depense' })
  deleteDepense(@Param('tid') tid: string, @Param('id') id: string) {
    return this.svc.deleteDepense(tid, id);
  }

  @Patch(':tid/budgets/:id')
  @ApiOperation({ summary: 'Modifier un budget' })
  updateBudget(@Param('tid') tid: string, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateBudget(tid, id, dto);
  }

  @Get(':tid/rapport')
  @ApiOperation({ summary: 'Rapport financier annuel (President / Economat)' })
  rapport(@Param('tid') tid: string, @Query('annee') annee: string) {
    return this.svc.getRapportFinancier(tid, annee);
  }

  @Post(':tid/contrats')
  @ApiOperation({ summary: 'Creer contrat RH' })
  creerContrat(@Param('tid') tid: string, @Body() dto: any) { return this.svc.creerContrat(tid, dto); }

  @Get(':tid/contrats')
  @ApiOperation({ summary: 'Contrats RH' })
  getContrats(@Param('tid') tid: string, @Query('personnelId') pid?: string) {
    return this.svc.getContrats(tid, pid);
  }

  @Patch(':tid/contrats/:id')
  @ApiOperation({ summary: 'Modifier un contrat' })
  updateContrat(@Param('tid') tid: string, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateContrat(tid, id, dto);
  }

  @Post(':tid/echeanciers')
  @ApiOperation({ summary: 'Creer un echeancier de paiement' })
  creerEcheancier(@Param('tid') tid: string, @Body() dto: any) { return this.svc.creerEcheancier(tid, dto); }

  @Get(':tid/echeanciers')
  @ApiOperation({ summary: 'Echeanciers' })
  getEcheanciers(@Param('tid') tid: string, @Query('etudiantId') eid?: string) {
    return this.svc.getEcheanciers(tid, eid);
  }
}