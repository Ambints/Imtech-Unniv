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

  // ==================== MES PARCOURS ====================

  @Get(':tid/mes-parcours')
  @ApiOperation({
    summary: 'Liste des parcours dont je suis responsable',
    description: 'Retourne uniquement les parcours assignés au RP connecté'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Liste des parcours récupérée avec succès' })
  @ApiResponse({ status: 403, description: 'Accès interdit' })
  getMesParcours(
    @Param('tid') tid: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getMesParcours(tid, user.id);
  }

  // ==================== GESTION DES MAQUETTES ====================

  @Post(':tid/maquettes')
  @ApiOperation({
    summary: 'Créer une maquette complète',
    description: 'Crée un parcours avec ses UE et EC associés'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
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
    @Param('tid') tid: string,
    @Body() dto: CreateMaquetteDto,
    @CurrentUser() user: any
  ) {
    return this.rpService.createMaquette(tid, user.id, dto);
  }

  @Get(':tid/maquettes')
  @ApiOperation({
    summary: 'Liste toutes les maquettes du RP',
    description: 'Retourne toutes les maquettes avec leurs UE et EC, agrégées avec les totaux de crédits et volumes horaires'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Liste des maquettes récupérée avec succès' })
  getAllMaquettes(
    @Param('tid') tid: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getAllMaquettes(tid, user.id);
  }

  @Get(':tid/maquettes/:parcoursId')
  @ApiOperation({
    summary: 'Détails d\'une maquette',
    description: 'Retourne une maquette spécifique avec toutes ses UE et EC'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiResponse({ status: 200, description: 'Maquette récupérée avec succès' })
  @ApiResponse({ status: 404, description: 'Maquette non trouvée' })
  getMaquetteById(
    @Param('tid') tid: string,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getMaquetteById(tid, user.id, parcoursId);
  }

  @Patch(':tid/maquettes/:parcoursId')
  @ApiOperation({
    summary: 'Mettre à jour une maquette',
    description: 'Met à jour les informations du parcours'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
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
    @Param('tid') tid: string,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Body() dto: any,
    @CurrentUser() user: any
  ) {
    return this.rpService.updateMaquette(tid, user.id, parcoursId, dto);
  }

  @Delete(':tid/maquettes/:parcoursId')
  @ApiOperation({
    summary: 'Supprimer une maquette',
    description: 'Désactive logiquement la maquette (pas de suppression physique)'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  deleteMaquette(
    @Param('tid') tid: string,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.deleteMaquette(tid, user.id, parcoursId);
  }

  @Post(':tid/maquettes/:parcoursId/valider')
  @ApiOperation({
    summary: 'Valider une maquette',
    description: 'Valide définitivement une maquette de formation'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  validerMaquette(
    @Param('tid') tid: string,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.validerMaquette(tid, user.id, parcoursId);
  }

  // ==================== GESTION DES UE ====================

  @Post(':tid/maquettes/:parcoursId/ues')
  @ApiOperation({
    summary: 'Ajouter une UE à une maquette',
    description: 'Crée une nouvelle unité d\'enseignement dans le parcours'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
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
    @Param('tid') tid: string,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Body() dto: CreateUEDto,
    @CurrentUser() user: any
  ) {
    return this.rpService.createUE(tid, user.id, parcoursId, dto);
  }

  @Patch(':tid/maquettes/:parcoursId/ues/:ueId')
  @ApiOperation({
    summary: 'Mettre à jour une UE',
    description: 'Met à jour les informations d\'une unité d\'enseignement'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiParam({ name: 'ueId', description: 'ID de l\'UE' })
  updateUE(
    @Param('tid') tid: string,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
    @Body() dto: any,
    @CurrentUser() user: any
  ) {
    return this.rpService.updateUE(tid, user.id, parcoursId, ueId, dto);
  }

  @Delete(':tid/maquettes/:parcoursId/ues/:ueId')
  @ApiOperation({
    summary: 'Supprimer une UE',
    description: 'Désactive logiquement l\'UE (pas de suppression physique)'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiParam({ name: 'ueId', description: 'ID de l\'UE' })
  deleteUE(
    @Param('tid') tid: string,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.deleteUE(tid, user.id, parcoursId, ueId);
  }

  // ==================== GESTION DES EC ====================

  @Post(':tid/maquettes/:parcoursId/ues/:ueId/ecs')
  @ApiOperation({
    summary: 'Ajouter un EC à une UE',
    description: 'Crée un nouvel élément constitutif dans l\'UE'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
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
    @Param('tid') tid: string,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
    @Body() dto: CreateECDto,
    @CurrentUser() user: any
  ) {
    return this.rpService.createEC(tid, user.id, parcoursId, ueId, dto);
  }

  @Patch(':tid/maquettes/:parcoursId/ues/:ueId/ecs/:ecId')
  @ApiOperation({
    summary: 'Mettre à jour un EC',
    description: 'Met à jour les informations d\'un élément constitutif'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiParam({ name: 'ueId', description: 'ID de l\'UE' })
  @ApiParam({ name: 'ecId', description: 'ID de l\'EC' })
  updateEC(
    @Param('tid') tid: string,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
    @Param('ecId', ParseUUIDPipe) ecId: string,
    @Body() dto: any,
    @CurrentUser() user: any
  ) {
    return this.rpService.updateEC(tid, user.id, parcoursId, ueId, ecId, dto);
  }

  @Delete(':tid/maquettes/:parcoursId/ues/:ueId/ecs/:ecId')
  @ApiOperation({
    summary: 'Supprimer un EC',
    description: 'Désactive logiquement l\'EC (pas de suppression physique)'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiParam({ name: 'ueId', description: 'ID de l\'UE' })
  @ApiParam({ name: 'ecId', description: 'ID de l\'EC' })
  deleteEC(
    @Param('tid') tid: string,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Param('ueId', ParseUUIDPipe) ueId: string,
    @Param('ecId', ParseUUIDPipe) ecId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.deleteEC(tid, user.id, parcoursId, ueId, ecId);
  }

  // ==================== GESTION DES AFFECTATIONS ====================

  @Post(':tid/affectations')
  @ApiOperation({
    summary: 'Créer une affectation',
    description: 'Affecte un enseignant à un cours (UE ou EC) pour une année académique'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
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
    @Param('tid') tid: string,
    @Body() dto: CreateAffectationDto,
    @CurrentUser() user: any
  ) {
    return this.rpService.createAffectation(tid, user.id, dto);
  }

  @Get(':tid/affectations')
  @ApiOperation({
    summary: 'Liste des affectations',
    description: 'Retourne toutes les affectations avec filtres optionnels'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiQuery({ name: 'anneeAcademiqueId', required: false, description: 'Filtrer par année académique' })
  @ApiQuery({ name: 'ueId', required: false, description: 'Filtrer par UE' })
  @ApiQuery({ name: 'ecId', required: false, description: 'Filtrer par EC' })
  @ApiQuery({ name: 'enseignantId', required: false, description: 'Filtrer par enseignant' })
  @ApiResponse({ status: 200, description: 'Liste des affectations récupérée avec succès' })
  getAffectations(
    @Param('tid') tid: string,
    @CurrentUser() user: any,
    @Query('anneeAcademiqueId') anneeAcademiqueId?: string,
    @Query('ueId') ueId?: string,
    @Query('ecId') ecId?: string,
    @Query('enseignantId') enseignantId?: string
  ) {
    return this.rpService.getAffectations(tid, user.id, {
      anneeAcademiqueId,
      ueId,
      ecId,
      enseignantId,
    });
  }

  @Get(':tid/parcours/:parcoursId/affectations')
  @ApiOperation({
    summary: 'Affectations par parcours',
    description: 'Retourne les affectations filtrées par parcours du RP'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiQuery({ name: 'anneeAcademiqueId', required: false, description: 'Filtrer par année académique' })
  getAffectationsByParcours(
    @Param('tid') tid: string,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Query('anneeAcademiqueId') anneeAcademiqueId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getAffectationsByParcours(tid, user.id, parcoursId, anneeAcademiqueId);
  }

  @Patch(':tid/affectations/:affectationId')
  @ApiOperation({
    summary: 'Mettre à jour une affectation',
    description: 'Met à jour les informations d\'une affectation existante'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
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
    @Param('tid') tid: string,
    @Param('affectationId', ParseUUIDPipe) affectationId: string,
    @Body() dto: UpdateAffectationDto,
    @CurrentUser() user: any
  ) {
    return this.rpService.updateAffectation(tid, user.id, affectationId, dto);
  }

  @Delete(':tid/affectations/:affectationId')
  @ApiOperation({
    summary: 'Supprimer une affectation',
    description: 'Supprime définitivement une affectation'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'affectationId', description: 'ID de l\'affectation' })
  deleteAffectation(
    @Param('tid') tid: string,
    @Param('affectationId', ParseUUIDPipe) affectationId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.deleteAffectation(tid, user.id, affectationId);
  }

  // ==================== SUIVI DES PERFORMANCES ====================

  @Get(':tid/parcours/:parcoursId/performance')
  @ApiOperation({
    summary: 'Statistiques de performance',
    description: 'Calcule et retourne les statistiques de performance du parcours'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
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
    @Param('tid') tid: string,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Query('anneeAcademiqueId') anneeAcademiqueId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.calculatePerformanceStats(tid, user.id, parcoursId, anneeAcademiqueId);
  }

  @Get(':tid/parcours/:parcoursId/dashboard-performance')
  @ApiOperation({
    summary: 'Dashboard de performance complet',
    description: 'Retourne le dashboard complet avec performance, affectations et statistiques enseignants'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiQuery({ name: 'anneeAcademiqueId', required: true, description: 'ID de l\'année académique' })
  getPerformanceDashboard(
    @Param('tid') tid: string,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Query('anneeAcademiqueId') anneeAcademiqueId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getPerformanceDashboard(tid, user.id, parcoursId, anneeAcademiqueId);
  }

  @Get(':tid/parcours/:parcoursId/assiduite')
  @ApiOperation({
    summary: 'Suivi d\'assiduité détaillé',
    description: 'Retourne le suivi d\'assiduité par étudiant avec alertes'
  })
  @ApiParam({ name: 'tid', description: 'Tenant ID' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  @ApiQuery({ name: 'anneeAcademiqueId', required: true, description: 'ID de l\'année académique' })
  getSuiviAssiduite(
    @Param('tid') tid: string,
    @Param('parcoursId', ParseUUIDPipe) parcoursId: string,
    @Query('anneeAcademiqueId') anneeAcademiqueId: string,
    @CurrentUser() user: any
  ) {
    return this.rpService.getSuiviAssiduiteDetaille(tid, user.id, parcoursId, anneeAcademiqueId);
  }
}
