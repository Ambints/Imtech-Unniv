import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EnseignantAffectationService } from './enseignant-affectation.service';

@Controller('enseignant-affectation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnseignantAffectationController {
  constructor(
    private readonly affectationService: EnseignantAffectationService,
  ) {}

  /**
   * Vérifier si un enseignant a un contrat actif
   * GET /enseignant-affectation/check-contract/:enseignantId
   */
  @Get('check-contract/:enseignantId')
  @Roles('admin', 'responsable_pedagogique', 'secretaire_parcours')
  async checkContract(@Param('enseignantId') enseignantId: string) {
    return await this.affectationService.checkEnseignantHasActiveContract(enseignantId);
  }

  /**
   * Récupérer les enseignants sans affectation
   * GET /enseignant-affectation/sans-affectation
   */
  @Get('sans-affectation')
  @Roles('admin', 'responsable_pedagogique', 'secretaire_parcours', 'president')
  async getEnseignantsSansAffectation() {
    const enseignants = await this.affectationService.getEnseignantsSansAffectation();
    return {
      success: true,
      count: enseignants.length,
      data: enseignants,
      message: enseignants.length === 0
        ? 'Tous les enseignants actifs sont affectés'
        : `${enseignants.length} enseignant(s) sans affectation trouvé(s)`,
    };
  }

  /**
   * Récupérer les statistiques d'affectation
   * GET /enseignant-affectation/statistiques
   * GET /enseignant-affectation/statistiques/:enseignantId
   */
  @Get('statistiques/:enseignantId?')
  @Roles('admin', 'responsable_pedagogique', 'secretaire_parcours', 'president', 'enseignant')
  async getStatistiques(
    @Param('enseignantId') enseignantId?: string,
    @Request() req?: any,
  ) {
    // Si l'utilisateur est enseignant et n'a pas fourni d'ID, utiliser son propre ID
    if (!enseignantId && req.user.role === 'enseignant') {
      // Récupérer l'ID enseignant depuis l'utilisateur connecté
      const id = await this.affectationService.getEnseignantIdByUserId(req.user.id);
      if (id) {
        enseignantId = id.toString();
      }
    }

    const stats = await this.affectationService.getStatistiquesAffectation(enseignantId);
    return {
      success: true,
      count: stats.length,
      data: stats,
    };
  }

  /**
   * Récupérer les affectations UE avec détails
   * GET /enseignant-affectation/affectations-ue
   */
  @Get('affectations-ue')
  @Roles('admin', 'responsable_pedagogique', 'secretaire_parcours', 'president')
  async getAffectationsUE(
    @Query('enseignantId') enseignantId?: string,
    @Query('parcours') parcours?: string,
    @Query('anneeAcademique') anneeAcademique?: string,
  ) {
    const affectations = await this.affectationService.getAffectationsUEDetails({
      enseignantId,
      parcours,
      anneeAcademique,
    });

    return {
      success: true,
      count: affectations.length,
      data: affectations,
    };
  }

  /**
   * Vérifier si une UE est déjà affectée
   * GET /enseignant-affectation/check-ue/:ueId/:anneeAcademiqueId
   */
  @Get('check-ue/:ueId/:anneeAcademiqueId')
  @Roles('admin', 'responsable_pedagogique', 'secretaire_parcours')
  async checkUEAffectation(
    @Param('ueId') ueId: string,
    @Param('anneeAcademiqueId') anneeAcademiqueId: string,
    @Query('excludeAffectationId') excludeAffectationId?: string,
  ) {
    return await this.affectationService.checkUEAlreadyAffected(
      ueId,
      anneeAcademiqueId,
      excludeAffectationId,
    );
  }

  /**
   * Valider une affectation avant création/modification
   * POST /enseignant-affectation/validate
   */
  @Post('validate')
  @Roles('admin', 'responsable_pedagogique', 'secretaire_parcours')
  async validateAffectation(
    @Body()
    data: {
      enseignantId: string;
      ueId?: string;
      ecId?: string;
      anneeAcademiqueId: string;
      affectationId?: string;
    },
  ) {
    const validation = await this.affectationService.validateAffectation(data);

    return {
      success: validation.isValid,
      ...validation,
      message: validation.isValid
        ? 'L\'affectation peut être créée'
        : 'L\'affectation ne peut pas être créée',
    };
  }

  /**
   * Obtenir le statut d'affectation pour le portail enseignant
   * GET /enseignant-affectation/mon-statut
   */
  @Get('mon-statut')
  @Roles('enseignant')
  async getMonStatut(@Request() req: any) {
    // Récupérer l'ID enseignant depuis l'utilisateur connecté
    const enseignantId = await this.affectationService.getEnseignantIdByUserId(req.user.id);

    if (!enseignantId) {
      return {
        success: false,
        message: 'Profil enseignant non trouvé',
        hasAffectation: false,
        hasActiveContract: false,
      };
    }
    const status = await this.affectationService.getEnseignantAffectationStatus(enseignantId.toString());

    return {
      success: true,
      ...status,
    };
  }

  /**
   * Obtenir le statut d'affectation d'un enseignant spécifique
   * GET /enseignant-affectation/statut/:enseignantId
   */
  @Get('statut/:enseignantId')
  @Roles('admin', 'responsable_pedagogique', 'secretaire_parcours', 'president')
  async getStatut(@Param('enseignantId') enseignantId: string) {
    const status = await this.affectationService.getEnseignantAffectationStatus(enseignantId);

    return {
      success: true,
      ...status,
    };
  }

  /**
   * Tableau de bord des affectations (pour admin/responsables)
   * GET /enseignant-affectation/dashboard
   */
  @Get('dashboard')
  @Roles('admin', 'responsable_pedagogique', 'president')
  async getDashboard() {
    const [
      enseignantsSansAffectation,
      toutesLesStats,
      affectationsUE,
    ] = await Promise.all([
      this.affectationService.getEnseignantsSansAffectation(),
      this.affectationService.getStatistiquesAffectation(),
      this.affectationService.getAffectationsUEDetails({}),
    ]);

    // Calculer des statistiques globales
    const totalEnseignants = toutesLesStats.length;
    const enseignantsAffectes = toutesLesStats.filter(
      (s) => s.statut_affectation === 'Affecté',
    ).length;
    const enseignantsSansContrat = toutesLesStats.filter(
      (s) => !s.a_contrat_actif,
    ).length;
    const totalUEAffectees = affectationsUE.length;
    const volumeHoraireTotal = toutesLesStats.reduce(
      (sum, s) => sum + parseFloat(s.volume_horaire_total || 0),
      0,
    );

    return {
      success: true,
      summary: {
        totalEnseignants,
        enseignantsAffectes,
        enseignantsSansAffectation: enseignantsSansAffectation.length,
        enseignantsSansContrat,
        totalUEAffectees,
        volumeHoraireTotal: Math.round(volumeHoraireTotal),
        tauxAffectation: totalEnseignants > 0
          ? Math.round((enseignantsAffectes / totalEnseignants) * 100)
          : 0,
      },
      enseignantsSansAffectation: enseignantsSansAffectation.slice(0, 10), // Top 10
      statistiques: toutesLesStats.slice(0, 20), // Top 20
    };
  }
}

// Made with Bob
