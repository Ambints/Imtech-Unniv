import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RHService } from './rh.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('RH - Ressources Humaines (Responsable RH)')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rh')
export class RHController {
  constructor(private readonly svc: RHService) {}

  // ========== CONTRATS ==========
  @Post('contrats')
  @Roles('responsable_rh', 'admin', 'president')
  @ApiOperation({ summary: 'Créer un contrat personnel' })
  createContrat(@Body() dto: any) {
    return this.svc.createContrat(dto);
  }

  @Get('contrats')
  @Roles('responsable_rh', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Liste des contrats avec filtres' })
  findContrats(@Query() filters: any) {
    return this.svc.findContrats(filters);
  }

  @Patch('contrats/:id/renouveler')
  @Roles('responsable_rh', 'admin')
  @ApiOperation({ summary: 'Renouveler un contrat' })
  renouvelerContrat(@Param('id') id: string, @Body() dto: any) {
    return this.svc.renouvelerContrat(id, dto);
  }

  @Patch('contrats/:id/resilier')
  @Roles('responsable_rh', 'admin', 'president')
  @ApiOperation({ summary: 'Résilier un contrat' })
  resilierContrat(@Param('id') id: string, @Body('motif') motif: string) {
    return this.svc.resilierContrat(id, motif);
  }

  // ========== HEURES COMPLÉMENTAIRES ==========
  @Post('heures-complementaires')
  @Roles('secretaire', 'responsable_rh', 'admin')
  @ApiOperation({ summary: 'Saisir des heures complémentaires' })
  createHeuresComp(@Body() dto: any) {
    return this.svc.createHeuresComplementaires(dto);
  }

  @Get('heures-complementaires')
  @Roles('responsable_rh', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Liste des heures complémentaires' })
  findHeuresComp(@Query() filters: any) {
    return this.svc.findHeuresComplementaires(filters);
  }

  @Patch('heures-complementaires/:id/valider')
  @Roles('responsable_rh', 'admin')
  @ApiOperation({ summary: 'Valider des heures complémentaires' })
  validerHeuresComp(@Param('id') id: string, @Body('validePar') validePar: string) {
    return this.svc.validerHeuresComplementaires(id, validePar);
  }

  @Get('enseignants/:id/volume-horaire')
  @Roles('responsable_rh', 'admin', 'responsable_pedagogique')
  @ApiOperation({ summary: 'Volume horaire effectué par un enseignant' })
  getVolumeHoraire(@Param('id') enseignantId: string, @Query('annee') annee: number) {
    return this.svc.getVolumeHoraireEnseignant(enseignantId, annee);
  }

  // ========== CONGÉS ==========
  @Post('conges')
  @Roles('utilisateur', 'responsable_rh', 'admin')
  @ApiOperation({ summary: 'Demander un congé' })
  demanderConge(@Body() dto: any) {
    return this.svc.demanderConge(dto);
  }

  @Get('conges')
  @Roles('responsable_rh', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Liste des demandes de congé' })
  findConges(@Query() filters: any) {
    return this.svc.findConges(filters);
  }

  @Patch('conges/:id/approuver')
  @Roles('responsable_rh', 'admin', 'president')
  @ApiOperation({ summary: 'Approuver une demande de congé' })
  approuverConge(@Param('id') id: string, @Body() dto: { approuvePar: string; commentaire?: string }) {
    return this.svc.approuverConge(id, dto);
  }

  @Patch('conges/:id/refuser')
  @Roles('responsable_rh', 'admin', 'president')
  @ApiOperation({ summary: 'Refuser une demande de congé' })
  refuserConge(@Param('id') id: string, @Body() dto: { approuvePar: string; motif: string }) {
    return this.svc.refuserConge(id, dto);
  }

  @Get('soldes-conges/:utilisateurId')
  @Roles('responsable_rh', 'admin', 'secretaire', 'utilisateur')
  @ApiOperation({ summary: 'Solde de congés d\'un utilisateur' })
  getSoldeConges(@Param('utilisateurId') utilisateurId: string) {
    return this.svc.getSoldeConges(utilisateurId);
  }

  // ========== FICHES DE PAIE ==========
  @Post('fiches-paie')
  @Roles('responsable_rh', 'admin')
  @ApiOperation({ summary: 'Générer une fiche de paie' })
  createFichePaie(@Body() dto: any) {
    return this.svc.genererFichePaie(dto);
  }

  @Get('fiches-paie')
  @Roles('responsable_rh', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Liste des fiches de paie' })
  findFichesPaie(@Query() filters: any) {
    return this.svc.findFichesPaie(filters);
  }

  @Post('fiches-paie/:id/valider')
  @Roles('responsable_rh', 'admin')
  @ApiOperation({ summary: 'Valider et envoyer la fiche de paie' })
  validerFichePaie(@Param('id') id: string) {
    return this.svc.validerFichePaie(id);
  }

  @Get('fiches-paie/masse')
  @Roles('responsable_rh', 'admin')
  @ApiOperation({ summary: 'Génération de masse des fiches de paie' })
  genererFichesPaieMasse(@Query('annee') annee: number, @Query('mois') mois: number) {
    return this.svc.genererFichesPaieMasse(annee, mois);
  }

  // ========== ÉVALUATIONS ==========
  @Post('evaluations')
  @Roles('responsable_rh', 'admin', 'superieur')
  @ApiOperation({ summary: 'Créer une évaluation annuelle' })
  createEvaluation(@Body() dto: any) {
    return this.svc.createEvaluation(dto);
  }

  @Get('evaluations')
  @Roles('responsable_rh', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Liste des évaluations' })
  findEvaluations(@Query() filters: any) {
    return this.svc.findEvaluations(filters);
  }

  @Post('evaluations/:id/auto-evaluation')
  @Roles('utilisateur')
  @ApiOperation({ summary: 'Soumettre l\'auto-évaluation' })
  submitAutoEvaluation(@Param('id') id: string, @Body() dto: any) {
    return this.svc.submitAutoEvaluation(id, dto);
  }

  @Patch('evaluations/:id/finaliser')
  @Roles('responsable_rh', 'admin', 'superieur')
  @ApiOperation({ summary: 'Finaliser l\'évaluation' })
  finaliserEvaluation(@Param('id') id: string, @Body() dto: any) {
    return this.svc.finaliserEvaluation(id, dto);
  }

  // ========== DÉCLARATIONS SOCIALES ==========
  @Post('declarations-sociales')
  @Roles('responsable_rh', 'admin', 'comptable')
  @ApiOperation({ summary: 'Générer déclaration URSSAF/MSA' })
  createDeclarationSociale(@Body() dto: any) {
    return this.svc.createDeclarationSociale(dto);
  }

  @Get('declarations-sociales')
  @Roles('responsable_rh', 'admin', 'comptable')
  @ApiOperation({ summary: 'Liste des déclarations sociales' })
  findDeclarationsSociales(@Query() filters: any) {
    return this.svc.findDeclarationsSociales(filters);
  }

  @Get('declarations-sociales/:id/export')
  @Roles('responsable_rh', 'admin', 'comptable')
  @ApiOperation({ summary: 'Export pour URSSAF/MSA' })
  exportDeclaration(@Param('id') id: string) {
    return this.svc.exportDeclarationSociale(id);
  }

  // ========== RECRUTEMENT ==========
  @Post('recrutements')
  @Roles('responsable_rh', 'admin', 'president')
  @ApiOperation({ summary: 'Lancer un processus de recrutement' })
  createRecrutement(@Body() dto: any) {
    return this.svc.createRecrutement(dto);
  }

  @Get('recrutements')
  @Roles('responsable_rh', 'admin', 'secretaire')
  @ApiOperation({ summary: 'Liste des recrutements en cours' })
  findRecrutements(@Query() filters: any) {
    return this.svc.findRecrutements(filters);
  }

  // ========== STATISTIQUES RH ==========
  @Get('stats')
  @Roles('responsable_rh', 'admin', 'president')
  @ApiOperation({ summary: 'Statistiques RH (effectifs, masse salariale)' })
  getStatsRH() {
    return this.svc.getStatsRH();
  }

  @Get('stats/heures-complementaires')
  @Roles('responsable_rh', 'admin', 'president')
  @ApiOperation({ summary: 'Stats heures complémentaires' })
  getStatsHeuresComp(@Query('annee') annee: number, @Query('mois') mois: number) {
    return this.svc.getStatsHeuresComplementaires(annee, mois);
  }
}
