import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { Request } from 'express';

@ApiTags('Finance')
@ApiBearerAuth('JWT-auth')
@Controller('finance')
export class FinanceController {
  constructor(private readonly svc: FinanceService) {}

  private getTenantId(req: Request): string {
    return (req as any).tenantId || '';
  }

  @Post('paiements')
  @ApiOperation({ summary: 'Enregistrer paiement + generer recu (Caissier)' })
  payer(@Req() req: Request, @Body() dto: any) {
    return this.svc.enregistrerPaiement(this.getTenantId(req), dto, 'caissier');
  }

  @Get('paiements')
  @ApiOperation({ summary: 'Tous les paiements (filtre par date)' })
  getTousPaiements(@Req() req: Request, @Query('date') date?: string) {
    return this.svc.getTousPaiements(this.getTenantId(req), date);
  }

  @Get('paiements/:etudiantId')
  @ApiOperation({ summary: 'Paiements d un etudiant' })
  getPaiements(@Req() req: Request, @Param('etudiantId') eid: string) {
    return this.svc.getPaiementsEtudiant(this.getTenantId(req), eid);
  }

  @Get('caisse')
  @ApiOperation({ summary: 'Etat caisse journaliere (Caissier)' })
  getCaisse(@Req() req: Request) {
    return this.svc.getCaisseJournaliere(this.getTenantId(req));
  }

  @Post('caisse/cloturer')
  @ApiOperation({ summary: 'Cloturer la caisse du jour' })
  cloturer(@Req() req: Request, @Body() body: any) {
    return this.svc.cloturerCaisse(this.getTenantId(req), body.userId);
  }

  @Post('budgets')
  @ApiOperation({ summary: 'Creer un budget (Economat)' })
  creerBudget(@Req() req: Request, @Body() dto: any) {
    return this.svc.creerBudget(this.getTenantId(req), dto);
  }

  @Get('budgets')
  @ApiOperation({ summary: 'Liste des budgets' })
  getBudgets(@Req() req: Request, @Query('annee') annee?: string) {
    return this.svc.getBudgets(this.getTenantId(req), annee);
  }

  @Post('depenses')
  @ApiOperation({ summary: 'Ajouter une depense' })
  ajouterDepense(@Req() req: Request, @Body() dto: any) {
    return this.svc.ajouterDepense(this.getTenantId(req), dto, 'user');
  }

  @Get('depenses')
  @ApiOperation({ summary: 'Liste des depenses' })
  getDepenses(@Req() req: Request, @Query('annee') annee?: string) {
    return this.svc.getDepenses(this.getTenantId(req), annee);
  }

  @Patch('depenses/:id')
  @ApiOperation({ summary: 'Modifier une depense' })
  updateDepense(@Req() req: Request, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateDepense(this.getTenantId(req), id, dto);
  }

  @Delete('depenses/:id')
  @ApiOperation({ summary: 'Supprimer une depense' })
  deleteDepense(@Req() req: Request, @Param('id') id: string) {
    return this.svc.deleteDepense(this.getTenantId(req), id);
  }

  @Patch('budgets/:id')
  @ApiOperation({ summary: 'Modifier un budget' })
  updateBudget(@Req() req: Request, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateBudget(this.getTenantId(req), id, dto);
  }

  @Get('rapport')
  @ApiOperation({ summary: 'Rapport financier annuel (President / Economat)' })
  rapport(@Req() req: Request, @Query('annee') annee: string) {
    return this.svc.getRapportFinancier(this.getTenantId(req), annee);
  }

  @Post('contrats')
  @ApiOperation({ summary: 'Creer contrat RH' })
  creerContrat(@Req() req: Request, @Body() dto: any) {
    return this.svc.creerContrat(this.getTenantId(req), dto);
  }

  @Get('contrats')
  @ApiOperation({ summary: 'Contrats RH' })
  getContrats(@Req() req: Request, @Query('personnelId') pid?: string) {
    return this.svc.getContrats(this.getTenantId(req), pid);
  }

  @Patch('contrats/:id')
  @ApiOperation({ summary: 'Modifier un contrat' })
  updateContrat(@Req() req: Request, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateContrat(this.getTenantId(req), id, dto);
  }

  @Post(':tid/echeanciers')
  @ApiOperation({ summary: 'Creer un echeancier de paiement' })
  creerEcheancier(@Param('tid') tid: string, @Body() dto: any) {
    return this.svc.creerEcheancier(tid, dto);
  }

  @Get(':tid/echeanciers')
  @ApiOperation({ summary: 'Echeanciers' })
  getEcheanciers(@Param('tid') tid: string, @Query('inscriptionId') inscriptionId?: string) {
    return this.svc.getEcheanciers(tid, inscriptionId);
  }

  @Get(':tid/inscriptions-actives')
  @ApiOperation({ summary: 'Liste des inscriptions actives pour créer des échéanciers' })
  getInscriptionsActives(@Param('tid') tid: string) {
    return this.svc.getInscriptionsActives(tid);
  }

  // ==================== ENDPOINTS GRILLE TARIFAIRE ====================

  @Get(':tid/grille-tarifaire')
  @ApiOperation({ summary: 'Liste des frais d\'inscription par parcours et année' })
  getGrilleTarifaire(@Param('tid') tid: string) {
    return this.svc.getGrilleTarifaire(tid);
  }

  @Post(':tid/grille-tarifaire')
  @ApiOperation({ summary: 'Créer des frais d\'inscription' })
  creerFraisInscription(@Param('tid') tid: string, @Body() dto: any) {
    return this.svc.creerFraisInscription(tid, dto);
  }

  @Patch(':tid/grille-tarifaire/:id')
  @ApiOperation({ summary: 'Modifier des frais d\'inscription' })
  updateFraisInscription(@Param('tid') tid: string, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateFraisInscription(tid, id, dto);
  }

  @Delete(':tid/grille-tarifaire/:id')
  @ApiOperation({ summary: 'Supprimer des frais d\'inscription' })
  deleteFraisInscription(@Param('tid') tid: string, @Param('id') id: string) {
    return this.svc.deleteFraisInscription(tid, id);
  }

  @Patch(':tid/grille-tarifaire/:id/toggle-actif')
  @ApiOperation({ summary: 'Activer/Désactiver des frais d\'inscription' })
  toggleActifFrais(@Param('tid') tid: string, @Param('id') id: string) {
    return this.svc.toggleActifFrais(tid, id);
  }

  // ==================== ENDPOINTS VALIDATION PAIEMENTS INSCRIPTION ====================

  @Get('paiements-inscription/en-attente')
  @ApiOperation({ summary: 'Liste des paiements d\'inscription en attente de validation (Caissier)' })
  getPaiementsEnAttente(@Req() req: Request) {
    return this.svc.getPaiementsInscriptionEnAttente(this.getTenantId(req));
  }

  @Get('paiements-inscription')
  @ApiOperation({ summary: 'Tous les paiements d\'inscription (Caissier)' })
  getTousPaiementsInscription(@Req() req: Request, @Query('statut') statut?: string) {
    return this.svc.getTousPaiementsInscription(this.getTenantId(req), statut);
  }

  @Post('paiements-inscription/:id/valider')
  @ApiOperation({ summary: 'Valider un paiement d\'inscription (Caissier)' })
  validerPaiement(
    @Req() req: Request,
    @Param('id') paiementId: string,
    @Body() body: { caissierId: string; noteValidation?: string }
  ) {
    return this.svc.validerPaiementInscription(
      this.getTenantId(req),
      paiementId,
      body.caissierId,
      body.noteValidation
    );
  }

  @Post('paiements-inscription/:id/rejeter')
  @ApiOperation({ summary: 'Rejeter un paiement d\'inscription (Caissier)' })
  rejeterPaiement(
    @Req() req: Request,
    @Param('id') paiementId: string,
    @Body() body: { caissierId: string; motifRejet: string }
  ) {
    return this.svc.rejeterPaiementInscription(
      this.getTenantId(req),
      paiementId,
      body.caissierId,
      body.motifRejet
    );
  }

  @Get('paiements-inscription/statistiques')
  @ApiOperation({ summary: 'Statistiques des paiements d\'inscription (Caissier)' })
  getStatistiquesPaiements(@Req() req: Request) {
    return this.svc.getStatistiquesPaiementsInscription(this.getTenantId(req));
  }
}