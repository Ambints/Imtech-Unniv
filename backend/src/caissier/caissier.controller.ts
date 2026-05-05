import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CaissierService } from './caissier.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Caissier - Encaissements et échéanciers')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('caissier')
export class CaissierController {
  constructor(private readonly svc: CaissierService) {}

  // ========== ENCAISSEMENTS ==========
  @Post('paiements')
  @Roles('caissier', 'economat', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Enregistrer un paiement (espèces, chèque, virement, CB)' })
  @ApiResponse({ status: 201, description: 'Paiement enregistré avec reçu' })
  createPaiement(@Body() dto: any, @CurrentUser() user: any) {
    return this.svc.createPaiement({ ...dto, caissierId: user.id });
  }

  @Get('paiements')
  @Roles('caissier', 'economat', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Liste des paiements du jour' })
  findPaiements(@Query('date') date: string, @Query('mode') mode?: string) {
    return this.svc.findPaiements(date, mode);
  }

  @Get('paiements/etudiant/:etudiantId')
  @Roles('caissier', 'economat', 'admin', 'secretaire', 'etudiant', 'parent')
  @ApiOperation({ summary: 'Historique des paiements d\'un étudiant' })
  findPaiementsByEtudiant(@Param('etudiantId') etudiantId: string) {
    return this.svc.findPaiementsByEtudiant(etudiantId);
  }

  @Post('paiements/:id/annuler')
  @Roles('caissier', 'economat', 'admin')
  @ApiOperation({ summary: 'Annuler un paiement (erreur de saisie)' })
  annulerPaiement(@Param('id') id: string, @Body('motif') motif: string, @CurrentUser() user: any) {
    return this.svc.annulerPaiement(id, motif, user.id);
  }

  @Get('paiements/:id/recu')
  @Roles('caissier', 'economat', 'admin', 'secretaire', 'etudiant', 'parent')
  @ApiOperation({ summary: 'Générer le reçu fiscal PDF' })
  genererRecu(@Param('id') id: string) {
    return this.svc.genererRecu(id);
  }

  // ========== ÉCHÉANCIERS ==========
  @Post('echeanciers')
  @Roles('caissier', 'economat', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Créer un échéancier de paiement échelonné' })
  createEcheancier(@Body() dto: any) {
    return this.svc.createEcheancier(dto);
  }

  @Get('echeanciers')
  @Roles('caissier', 'economat', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Liste des échéances' })
  findEcheances(
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('statut') statut?: string,
  ) {
    return this.svc.findEcheances(dateDebut, dateFin, statut);
  }

  @Get('echeanciers/etudiant/:etudiantId')
  @Roles('caissier', 'economat', 'admin', 'secretaire', 'etudiant', 'parent')
  @ApiOperation({ summary: 'Échéancier d\'un étudiant' })
  findEcheancesByEtudiant(@Param('etudiantId') etudiantId: string) {
    return this.svc.findEcheancesByEtudiant(etudiantId);
  }

  @Patch('echeanciers/:id/modifier')
  @Roles('caissier', 'economat', 'admin')
  @ApiOperation({ summary: 'Modifier une échéance (report)' })
  modifierEcheance(@Param('id') id: string, @Body() dto: { nouvelleDate: string; motif: string }) {
    return this.svc.modifierEcheance(id, dto);
  }

  // ========== RELANCES ET IMPAYÉS ==========
  @Get('impayes')
  @Roles('caissier', 'economat', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Liste des impayés avec relance' })
  findImpayes(@Query('jours') jours: number = 30) {
    return this.svc.findImpayes(jours);
  }

  @Post('relances')
  @Roles('caissier', 'economat', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Générer une relance pour impayé' })
  createRelance(@Body() dto: any) {
    return this.svc.createRelance(dto);
  }

  @Post('relances/:id/envoyer')
  @Roles('caissier', 'economat', 'admin')
  @ApiOperation({ summary: 'Envoyer la relance (email/SMS)' })
  envoyerRelance(@Param('id') id: string) {
    return this.svc.envoyerRelance(id);
  }

  @Post('impayes/:inscriptionId/bloquer-notes')
  @Roles('caissier', 'economat', 'admin')
  @ApiOperation({ summary: 'Bloquer la consultation des notes pour impayé' })
  bloquerNotes(@Param('inscriptionId') inscriptionId: string) {
    return this.svc.bloquerNotes(inscriptionId);
  }

  @Post('impayes/:inscriptionId/debloquer-notes')
  @Roles('caissier', 'economat', 'admin')
  @ApiOperation({ summary: 'Débloquer les notes après paiement' })
  debloquerNotes(@Param('inscriptionId') inscriptionId: string) {
    return this.svc.debloquerNotes(inscriptionId);
  }

  // ========== CLOTURE DE CAISSE ==========
  @Get('cloture/journaliere')
  @Roles('caissier', 'economat', 'admin')
  @ApiOperation({ summary: 'Clôture de caisse du jour' })
  getClotureJournaliere(@Query('date') date: string) {
    return this.svc.getClotureJournaliere(date);
  }

  @Post('cloture/journaliere')
  @Roles('caissier', 'economat', 'admin')
  @ApiOperation({ summary: 'Valider la clôture de caisse' })
  validerCloture(@Body('date') date: string, @CurrentUser() user: any) {
    return this.svc.validerCloture(date, user.id);
  }

  @Get('rapprochement-bancaire')
  @Roles('caissier', 'economat', 'admin')
  @ApiOperation({ summary: 'Rapprochement bancaire quotidien' })
  getRapprochementBancaire(@Query('date') date: string) {
    return this.svc.getRapprochementBancaire(date);
  }

  // ========== STATISTIQUES ==========
  @Get('stats/journalieres')
  @Roles('caissier', 'economat', 'admin', 'president')
  @ApiOperation({ summary: 'Statistiques journalières' })
  getStatsJournalieres(@Query('date') date: string) {
    return this.svc.getStatsJournalieres(date);
  }

  @Get('stats/mensuelles')
  @Roles('caissier', 'economat', 'admin', 'president')
  @ApiOperation({ summary: 'Statistiques mensuelles' })
  getStatsMensuelles(@Query('mois') mois: number, @Query('annee') annee: number) {
    return this.svc.getStatsMensuelles(mois, annee);
  }
}
