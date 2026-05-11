import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RPSecureService } from './rp-secure.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * Contrôleur sécurisé pour le Responsable Pédagogique
 * Toutes les routes nécessitent l'authentification et le rôle RP
 * Filtrage automatique par ParcoursID
 */
@ApiTags('RP - Responsable Pédagogique (Sécurisé)')
@ApiBearerAuth('JWT-auth')
@Controller('rp')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
export class RPSecureController {
  constructor(private readonly rpService: RPSecureService) {}

  // ==================== MES PARCOURS ====================

  @Get(':tid/mes-parcours')
  @ApiOperation({ 
    summary: 'Liste des parcours dont je suis responsable',
    description: 'Retourne uniquement les parcours assignés au RP connecté'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  getMesParcours(@Param('tid') tid: string, @CurrentUser() user: any) {
    return this.rpService.getMesParcours(tid, user.id);
  }

  // ==================== DASHBOARD RP ====================

  @Get(':tid/dashboard/:parcoursId')
  @ApiOperation({ 
    summary: 'Dashboard complet du RP pour un parcours',
    description: 'Statistiques, validations en attente, alertes assiduité'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiQuery({ name: 'anneeAcademiqueId', required: true })
  getDashboard(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
    @Query('anneeAcademiqueId') anneeAcademiqueId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getDashboardRP(tid, user.id, parcoursId, anneeAcademiqueId);
  }

  // ==================== VALIDATION SUJETS D'EXAMENS ====================

  @Get(':tid/parcours/:parcoursId/sujets')
  @ApiOperation({ 
    summary: 'Liste des sujets d\'examen du parcours',
    description: 'Filtrés par parcours du RP. Optionnel: filtrer par statut'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiQuery({ name: 'statut', required: false, enum: ['soumis', 'en_relecture', 'valide', 'rejete'] })
  getSujetsExamen(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
    @Query('statut') statut: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getSujetsExamenByParcours(tid, user.id, parcoursId, statut);
  }

  @Post(':tid/parcours/:parcoursId/sujets/:sujetId/valider')
  @ApiOperation({ 
    summary: 'Valider un sujet d\'examen',
    description: 'Seul le RP du parcours peut valider. Vérifie l\'appartenance du sujet au parcours'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiParam({ name: 'sujetId', description: 'ID du sujet' })
  validerSujet(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
    @Param('sujetId') sujetId: string,
    @Body() body: { commentaires?: string },
    @CurrentUser() user: any
  ) {
    return this.rpService.validerSujetExamen(
      tid,
      user.id,
      sujetId,
      parcoursId,
      body.commentaires
    );
  }

  @Post(':tid/parcours/:parcoursId/sujets/:sujetId/rejeter')
  @ApiOperation({ 
    summary: 'Rejeter un sujet d\'examen',
    description: 'Rejette avec motif. Vérifie l\'appartenance au parcours'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiParam({ name: 'sujetId', description: 'ID du sujet' })
  rejeterSujet(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
    @Param('sujetId') sujetId: string,
    @Body() body: { motifRejet: string },
    @CurrentUser() user: any
  ) {
    return this.rpService.rejeterSujetExamen(
      tid,
      user.id,
      sujetId,
      parcoursId,
      body.motifRejet
    );
  }

  // ==================== VALIDATION CONTENUS DE COURS ====================

  @Get(':tid/parcours/:parcoursId/contenus')
  @ApiOperation({ 
    summary: 'Liste des contenus de cours du parcours',
    description: 'Filtrés par parcours. Optionnel: filtrer par statut'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiQuery({ name: 'statut', required: false, enum: ['brouillon', 'soumis', 'valide', 'rejete'] })
  getContenusCours(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
    @Query('statut') statut: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getContenusCoursByParcours(tid, user.id, parcoursId, statut);
  }

  @Post(':tid/parcours/:parcoursId/contenus/:contenuId/valider')
  @ApiOperation({ 
    summary: 'Valider un contenu de cours',
    description: 'Validation sécurisée par parcours'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiParam({ name: 'contenuId', description: 'ID du contenu' })
  validerContenu(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
    @Param('contenuId') contenuId: string,
    @Body() body: { commentaires?: string },
    @CurrentUser() user: any
  ) {
    return this.rpService.validerContenuCours(
      tid,
      user.id,
      contenuId,
      parcoursId,
      body.commentaires
    );
  }

  // ==================== VALIDATION STAGES/MÉMOIRES ====================

  @Get(':tid/parcours/:parcoursId/stages-memoires')
  @ApiOperation({ 
    summary: 'Liste des stages et mémoires du parcours',
    description: 'Filtrés par parcours du RP'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiQuery({ name: 'statut', required: false, enum: ['en_cours', 'termine', 'valide', 'abandonne'] })
  getStagesMemoires(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
    @Query('statut') statut: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getStagesMemoiresByParcours(tid, user.id, parcoursId, statut);
  }

  @Post(':tid/parcours/:parcoursId/stages-memoires/:stageId/valider')
  @ApiOperation({ 
    summary: 'Valider un stage/mémoire',
    description: 'Validation sécurisée par parcours'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiParam({ name: 'stageId', description: 'ID du stage/mémoire' })
  validerStage(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
    @Param('stageId') stageId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.validerStageMemoire(tid, user.id, stageId, parcoursId);
  }

  // ==================== VALIDATION PROCÈS-VERBAUX ====================

  @Get(':tid/parcours/:parcoursId/proces-verbaux')
  @ApiOperation({ 
    summary: 'Liste des procès-verbaux du parcours',
    description: 'Filtrés par parcours du RP'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiQuery({ name: 'statut', required: false, enum: ['brouillon', 'valide', 'archive'] })
  getProcesVerbaux(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
    @Query('statut') statut: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getProcesVerbauxByParcours(tid, user.id, parcoursId, statut);
  }

  @Post(':tid/parcours/:parcoursId/proces-verbaux/:pvId/valider')
  @ApiOperation({ 
    summary: 'Valider un procès-verbal',
    description: 'Validation sécurisée par parcours'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiParam({ name: 'pvId', description: 'ID du PV' })
  validerPV(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
    @Param('pvId') pvId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.validerProcesVerbal(tid, user.id, pvId, parcoursId);
  }

  // ==================== STATISTIQUES & PERFORMANCE ====================

  @Get(':tid/parcours/:parcoursId/statistiques')
  @ApiOperation({ 
    summary: 'Statistiques de performance du parcours',
    description: 'Taux de réussite, moyennes par UE, statistiques détaillées'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiQuery({ name: 'anneeAcademiqueId', required: true })
  getStatistiques(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
    @Query('anneeAcademiqueId') anneeAcademiqueId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getStatistiquesPerformance(
      tid,
      user.id,
      parcoursId,
      anneeAcademiqueId
    );
  }

  // ==================== SUIVI ASSIDUITÉ ====================

  @Get(':tid/parcours/:parcoursId/assiduite')
  @ApiOperation({ 
    summary: 'Suivi de l\'assiduité des étudiants',
    description: 'Taux de présence, absences, retards, alertes automatiques'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiQuery({ name: 'anneeAcademiqueId', required: true })
  getSuiviAssiduite(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
    @Query('anneeAcademiqueId') anneeAcademiqueId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getSuiviAssiduite(
      tid,
      user.id,
      parcoursId,
      anneeAcademiqueId
    );
  }
}

// Made with Bob