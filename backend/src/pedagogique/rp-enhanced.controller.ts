import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { RPEnhancedService, CreateMaquetteDto, CreateUEDto, CreateECDto, CreateAffectationDto, UpdateAffectationDto } from './rp-enhanced.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';
import { CurrentUser } from '../auth/current-user.decorator';
import { Request } from 'express';

/**
 * Contrôleur amélioré et sécurisé pour le Responsable Pédagogique
 * Gestion complète des maquettes, affectations et suivi des performances
 */
@ApiTags('RP - Responsable Pédagogique (Module Complet)')
@ApiBearerAuth('JWT-auth')
@Controller('rp-enhanced')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.RESP_PEDAGOGIQUE, UserRole.ADMIN)
export class RPEnhancedController {
  constructor(private readonly rpService: RPEnhancedService) {}

  private getTenantId(req: Request): string {
    return (req as any).tenantId || '';
  }

  // ==================== MES PARCOURS ====================

  @Get('mes-parcours')
  @ApiOperation({
    summary: 'Liste des parcours dont je suis responsable',
    description: 'Retourne uniquement les parcours assignés au RP connecté'
  })
  @ApiResponse({ status: 200, description: 'Liste des parcours récupérée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  getMesParcours(
    @Req() req: Request,
    @CurrentUser() user: any
  ) {
    return this.rpService.getMesParcours(this.getTenantId(req), user.id);
  }

  @Get('parcours/:parcoursId/unites')
  @ApiOperation({
    summary: 'Liste des UE d\'un parcours',
    description: 'Retourne toutes les unités d\'enseignement d\'un parcours spécifique'
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiResponse({ status: 200, description: 'Liste des UE récupérée avec succès' })
  getUEsByParcours(
    @Req() req: Request,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string
  ) {
    return this.rpService.getUEsByParcours(this.getTenantId(req), parcoursId);
  }

  @Get('enseignants')
  @ApiOperation({
    summary: 'Liste des enseignants actifs',
    description: 'Retourne tous les enseignants actifs du tenant'
  })
  @ApiResponse({ status: 200, description: 'Liste des enseignants' })
  getEnseignants(@Req() req: Request) {
    return this.rpService.getEnseignants(this.getTenantId(req));
  }

  // ==================== GESTION DES MAQUETTES ====================

  @Post('maquettes')
  @ApiOperation({
    summary: 'Créer une maquette complète',
    description: 'Crée un parcours avec ses UE et EC associés'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        parcours: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'INFO-L3' },
            nom: { type: 'string', example: 'Licence Informatique' },
            niveau: { type: 'string', example: 'Licence' },
            dureeAnnees: { type: 'number', example: 3 },
            description: { type: 'string' },
            departementId: { type: 'string' },
          },
          required: ['code', 'nom', 'niveau', 'departementId']
        },
        unites: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: 'UE1-INFO' },
              intitule: { type: 'string', example: 'Programmation Avancée' },
              creditsEcts: { type: 'number', example: 6 },
              coefficient: { type: 'number', example: 3 },
              volumeCm: { type: 'number', example: 20 },
              volumeTd: { type: 'number', example: 15 },
              volumeTp: { type: 'number', example: 10 },
              semestre: { type: 'number', example: 1 },
              anneeNiveau: { type: 'number', example: 3 },
              typeUe: { type: 'string', example: 'obligatoire' },
              elementsConstitutifs: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    code: { type: 'string', example: 'EC1-INFO' },
                    intitule: { type: 'string', example: 'Java Avancé' },
                    coefficient: { type: 'number', example: 1.5 },
                  }
                }
              }
            },
            required: ['code', 'intitule', 'semestre', 'anneeNiveau']
          }
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Maquette créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  createMaquette(
    @Req() req: Request,
    @Body() dto: CreateMaquetteDto,
    @CurrentUser() user: any
  ) {
    return this.rpService.createMaquette(this.getTenantId(req), user.id, dto);
  }

  @Get('maquettes')
  @ApiOperation({
    summary: 'Liste toutes les maquettes du RP',
    description: 'Retourne toutes les maquettes avec leurs UE et EC, agrégées avec les totaux de crédits et volumes horaires'
  })
  @ApiResponse({ status: 200, description: 'Liste des maquettes récupérée avec succès' })
  getAllMaquettes(
    @Req() req: Request,
    @CurrentUser() user: any
  ) {
    return this.rpService.getAllMaquettes(this.getTenantId(req), user.id);
  }

  @Get('maquettes/:parcoursId')
  @ApiOperation({
    summary: 'Détails d\'une maquette',
    description: 'Retourne une maquette spécifique avec toutes ses UE et EC'
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiResponse({ status: 200, description: 'Maquette récupérée avec succès' })
  @ApiResponse({ status: 404, description: 'Maquette non trouvée' })
  getMaquetteById(
    @Req() req: Request,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getMaquetteById(this.getTenantId(req), user.id, parcoursId);
  }

  @Patch('maquettes/:parcoursId')
  @ApiOperation({
    summary: 'Mettre à jour une maquette',
    description: 'Met à jour les informations du parcours'
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        nom: { type: 'string' },
        niveau: { type: 'string' },
        dureeAnnees: { type: 'number' },
        description: { type: 'string' },
        actif: { type: 'boolean' },
      }
    }
  })
  updateMaquette(
    @Req() req: Request,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Body() dto: any,
    @CurrentUser() user: any
  ) {
    return this.rpService.updateMaquette(this.getTenantId(req), user.id, parcoursId, dto);
  }

  @Delete('maquettes/:parcoursId')
  @ApiOperation({
    summary: 'Supprimer une maquette',
    description: 'Désactive logiquement la maquette (pas de suppression physique)'
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  deleteMaquette(
    @Req() req: Request,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.deleteMaquette(this.getTenantId(req), user.id, parcoursId);
  }

  @Post('maquettes/:parcoursId/valider')
  @ApiOperation({
    summary: 'Valider une maquette',
    description: 'Valide définitivement une maquette de formation'
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  validerMaquette(
    @Req() req: Request,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.validerMaquette(this.getTenantId(req), user.id, parcoursId);
  }

  // ==================== GESTION DES UE ====================

  @Post('maquettes/:parcoursId/ues')
  @ApiOperation({
    summary: 'Ajouter une UE à une maquette',
    description: 'Crée une nouvelle unité d\'enseignement dans le parcours'
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'UE2-INFO' },
        intitule: { type: 'string', example: 'Base de données' },
        creditsEcts: { type: 'number', example: 6 },
        coefficient: { type: 'number', example: 3 },
        volumeCm: { type: 'number', example: 20 },
        volumeTd: { type: 'number', example: 15 },
        volumeTp: { type: 'number', example: 10 },
        semestre: { type: 'number', example: 1 },
        anneeNiveau: { type: 'number', example: 3 },
        typeUe: { type: 'string', example: 'obligatoire' },
        elementsConstitutifs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              intitule: { type: 'string' },
              coefficient: { type: 'number' },
            }
          }
        }
      },
      required: ['code', 'intitule', 'semestre', 'anneeNiveau']
    }
  })
  createUE(
    @Req() req: Request,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Body() dto: CreateUEDto,
    @CurrentUser() user: any
  ) {
    return this.rpService.createUE(this.getTenantId(req), user.id, parcoursId, dto);
  }

  @Patch('maquettes/:parcoursId/ues/:ueId')
  @ApiOperation({
    summary: 'Mettre à jour une UE',
    description: 'Met à jour les informations d\'une unité d\'enseignement'
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiParam({ name: 'ueId', description: 'ID de l\'UE' })
  updateUE(
    @Req() req: Request,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
    @Body() dto: any,
    @CurrentUser() user: any
  ) {
    return this.rpService.updateUE(this.getTenantId(req), user.id, parcoursId, ueId, dto);
  }

  @Delete('maquettes/:parcoursId/ues/:ueId')
  @ApiOperation({
    summary: 'Supprimer une UE',
    description: 'Désactive logiquement l\'UE (pas de suppression physique)'
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiParam({ name: 'ueId', description: 'ID de l\'UE' })
  deleteUE(
    @Req() req: Request,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.deleteUE(this.getTenantId(req), user.id, parcoursId, ueId);
  }

  // ==================== GESTION DES EC ====================

  @Post('maquettes/:parcoursId/ues/:ueId/ecs')
  @ApiOperation({
    summary: 'Ajouter un EC à une UE',
    description: 'Crée un nouvel élément constitutif dans l\'UE'
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiParam({ name: 'ueId', description: 'ID de l\'UE' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', example: 'EC1-BD' },
        intitule: { type: 'string', example: 'SQL Avancé' },
        coefficient: { type: 'number', example: 1.5 },
      },
      required: ['code', 'intitule']
    }
  })
  createEC(
    @Req() req: Request,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
    @Body() dto: CreateECDto,
    @CurrentUser() user: any
  ) {
    return this.rpService.createEC(this.getTenantId(req), user.id, parcoursId, ueId, dto);
  }

  @Patch('maquettes/:parcoursId/ues/:ueId/ecs/:ecId')
  @ApiOperation({
    summary: 'Mettre à jour un EC',
    description: 'Met à jour les informations d\'un élément constitutif'
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiParam({ name: 'ueId', description: 'ID de l\'UE' })
  @ApiParam({ name: 'ecId', description: 'ID de l\'EC' })
  updateEC(
    @Req() req: Request,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
    @Param('ecId', ParseUUIDPipe) ecId: string,
    @Body() dto: any,
    @CurrentUser() user: any
  ) {
    return this.rpService.updateEC(this.getTenantId(req), user.id, parcoursId, ueId, ecId, dto);
  }

  @Delete('maquettes/:parcoursId/ues/:ueId/ecs/:ecId')
  @ApiOperation({
    summary: 'Supprimer un EC',
    description: 'Désactive logiquement l\'EC (pas de suppression physique)'
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiParam({ name: 'ueId', description: 'ID de l\'UE' })
  @ApiParam({ name: 'ecId', description: 'ID de l\'EC' })
  deleteEC(
    @Req() req: Request,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
    @Param('ecId', ParseUUIDPipe) ecId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.deleteEC(this.getTenantId(req), user.id, parcoursId, ueId, ecId);
  }

  // ==================== GESTION DES AFFECTATIONS ====================

  // Endpoint POST pour créer une affectation enseignant-UE
  @Post('affectations')
  @ApiOperation({
    summary: 'Créer une affectation',
    description: 'Affecte un enseignant à un cours (UE ou EC) pour une année académique'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        enseignantId: { type: 'string', description: 'ID de l\'enseignant' },
        ueId: { type: 'string', description: 'ID de l\'UE (optionnel si ecId fourni)' },
        ecId: { type: 'string', description: 'ID de l\'EC (optionnel si ueId fourni)' },
        anneeAcademiqueId: { type: 'string', description: 'ID de l\'année académique' },
        typeSeance: { type: 'string', example: 'CM', enum: ['CM', 'TD', 'TP'] },
        volumePrevu: { type: 'number', example: 30, description: 'Volume horaire prévu en heures' },
      },
      required: ['enseignantId', 'anneeAcademiqueId']
    }
  })
  @ApiResponse({ status: 201, description: 'Affectation créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou affectation déjà existante' })
  createAffectation(
    @Req() req: Request,
    @Body() dto: CreateAffectationDto,
    @CurrentUser() user: any
  ) {
    return this.rpService.createAffectation(this.getTenantId(req), user.id, dto);
  }

  @Get('affectations')
  @ApiOperation({
    summary: 'Liste des affectations',
    description: 'Retourne toutes les affectations avec filtres optionnels'
  })
  @ApiQuery({ name: 'anneeAcademiqueId', required: false, description: 'Filtrer par année académique' })
  @ApiQuery({ name: 'ueId', required: false, description: 'Filtrer par UE' })
  @ApiQuery({ name: 'ecId', required: false, description: 'Filtrer par EC' })
  @ApiQuery({ name: 'enseignantId', required: false, description: 'Filtrer par enseignant' })
  @ApiResponse({ status: 200, description: 'Liste des affectations récupérée avec succès' })
  getAffectations(
    @Req() req: Request,
    @CurrentUser() user: any,
    @Query('anneeAcademiqueId') anneeAcademiqueId?: string,
    @Query('ueId') ueId?: string,
    @Query('ecId') ecId?: string,
    @Query('enseignantId') enseignantId?: string
  ) {
    return this.rpService.getAffectations(this.getTenantId(req), user.id, {
      anneeAcademiqueId,
      ueId,
      ecId,
      enseignantId,
    });
  }

  @Get('parcours/:parcoursId/affectations')
  @ApiOperation({
    summary: 'Affectations par parcours',
    description: 'Retourne les affectations filtrées par parcours du RP'
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiQuery({ name: 'anneeAcademiqueId', required: false, description: 'Filtrer par année académique' })
  getAffectationsByParcours(
    @Req() req: Request,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Query('anneeAcademiqueId') anneeAcademiqueId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getAffectationsByParcours(this.getTenantId(req), user.id, parcoursId, anneeAcademiqueId);
  }

  @Patch('affectations/:affectationId')
  @ApiOperation({
    summary: 'Mettre à jour une affectation',
    description: 'Met à jour les informations d\'une affectation existante'
  })
  @ApiParam({ name: 'affectationId', description: 'ID de l\'affectation' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        enseignantId: { type: 'string' },
        typeSeance: { type: 'string', enum: ['CM', 'TD', 'TP'] },
        volumePrevu: { type: 'number' },
        volumeRealise: { type: 'number' },
      }
    }
  })
  updateAffectation(
    @Req() req: Request,
    @Param('affectationId', ParseUUIDPipe) affectationId: string,
    @Body() dto: UpdateAffectationDto,
    @CurrentUser() user: any
  ) {
    return this.rpService.updateAffectation(this.getTenantId(req), user.id, affectationId, dto);
  }

  @Delete('affectations/:affectationId')
  @ApiOperation({
    summary: 'Supprimer une affectation',
    description: 'Supprime définitivement une affectation'
  })
  @ApiParam({ name: 'affectationId', description: 'ID de l\'affectation' })
  deleteAffectation(
    @Req() req: Request,
    @Param('affectationId', ParseUUIDPipe) affectationId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.deleteAffectation(this.getTenantId(req), user.id, affectationId);
  }

  // ==================== SUIVI DES PERFORMANCES ====================

  @Get('parcours/:parcoursId/performance')
  @ApiOperation({
    summary: 'Statistiques de performance',
    description: 'Calcule et retourne les statistiques de performance du parcours'
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiQuery({ name: 'anneeAcademiqueId', required: true, description: 'ID de l\'année académique' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques de performance',
    schema: {
      type: 'object',
      properties: {
        parcoursId: { type: 'string' },
        anneeAcademiqueId: { type: 'string' },
        nbInscrits: { type: 'number' },
        nbPresents: { type: 'number' },
        tauxAssiduite: { type: 'number' },
        tauxReussite: { type: 'number' },
        moyenneGenerale: { type: 'number' },
        statsParUE: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ueId: { type: 'string' },
              code: { type: 'string' },
              intitule: { type: 'string' },
              creditsECTS: { type: 'number' },
              moyenne: { type: 'number' },
              tauxReussite: { type: 'number' },
              nbEtudiants: { type: 'number' },
            }
          }
        }
      }
    }
  })
  getPerformanceStats(
    @Req() req: Request,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Query('anneeAcademiqueId') anneeAcademiqueId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.calculatePerformanceStats(this.getTenantId(req), user.id, parcoursId, anneeAcademiqueId);
  }

  @Get('parcours/:parcoursId/dashboard-performance')
  @ApiOperation({
    summary: 'Dashboard de performance complet',
    description: 'Retourne le dashboard complet avec performance, affectations et statistiques enseignants'
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiQuery({ name: 'anneeAcademiqueId', required: true, description: 'ID de l\'année académique' })
  getPerformanceDashboard(
    @Req() req: Request,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Query('anneeAcademiqueId') anneeAcademiqueId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getPerformanceDashboard(this.getTenantId(req), user.id, parcoursId, anneeAcademiqueId);
  }

  @Get('parcours/:parcoursId/assiduite')
  @ApiOperation({
    summary: 'Suivi d\'assiduité détaillé',
    description: 'Retourne le suivi d\'assiduité par étudiant avec alertes'
  })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiQuery({ name: 'anneeAcademiqueId', required: true, description: 'ID de l\'année académique' })
  getSuiviAssiduite(
    @Req() req: Request,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Query('anneeAcademiqueId') anneeAcademiqueId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getSuiviAssiduiteDetaille(this.getTenantId(req), user.id, parcoursId, anneeAcademiqueId);
  }
}
