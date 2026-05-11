import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Admin - Gestion Avancée')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('activity-logs')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Récupérer les logs d\'activité des utilisateurs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Liste des activités' })
  async getActivityLogs(@Request() req, @Query('limit') limit?: string) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Vous devez être associé à une université');
    }
    const limitNum = limit ? parseInt(limit) : 50;
    return this.adminService.getActivityLogs(req.user.tenantId, limitNum);
  }

  @Get('detailed-stats')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Statistiques détaillées pour rapports' })
  @ApiResponse({ status: 200, description: 'Statistiques détaillées' })
  async getDetailedStats(@Request() req) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Vous devez être associé à une université');
    }
    return this.adminService.getDetailedStats(req.user.tenantId);
  }

  @Post('users/bulk-update-status')
  @Roles('admin')
  @ApiOperation({ summary: 'Activer/Désactiver plusieurs utilisateurs en masse' })
  @ApiResponse({ status: 200, description: 'Utilisateurs mis à jour' })
  async bulkUpdateUserStatus(
    @Request() req,
    @Body() dto: { userIds: string[]; active: boolean }
  ) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Vous devez être associé à une université');
    }
    return this.adminService.bulkUpdateUserStatus(req.user.tenantId, dto.userIds, dto.active);
  }

  @Get('users/export')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Exporter les utilisateurs (CSV)' })
  @ApiQuery({ name: 'role', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs pour export' })
  async exportUsers(@Request() req, @Query('role') role?: string) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Vous devez être associé à une université');
    }
    return this.adminService.exportUsers(req.user.tenantId, role);
  }

  @Get('system/health')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Santé du système et statistiques' })
  @ApiResponse({ status: 200, description: 'Informations système' })
  async getSystemHealth(@Request() req) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Vous devez être associé à une université');
    }
    return this.adminService.getSystemHealth(req.user.tenantId);
  }

  @Post('system/backup')
  @Roles('admin')
  @ApiOperation({ summary: 'Créer une sauvegarde de la base de données' })
  @ApiResponse({ status: 200, description: 'Sauvegarde créée' })
  async createBackup(@Request() req) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Vous devez être associé à une université');
    }
    return this.adminService.createBackup(req.user.tenantId);
  }

  // ==================== GESTION DES SÉCRÉTAIRES PAR PARCOURS ====================

  @Post('secretaires-parcours/:parcoursId')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Définir un secrétaire pour un parcours' })
  @ApiResponse({ status: 200, description: 'Secrétaire défini avec succès' })
  async defineSecretaireParcours(
    @Request() req,
    @Param('parcoursId') parcoursId: string,
    @Body('secretaireId') secretaireId: string,
  ) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Vous devez être associé à une université');
    }
    return this.adminService.defineSecretaireParcours(req.user.tenantId, parcoursId, secretaireId);
  }

  @Get('secretaires-parcours')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Récupérer les secrétaires par parcours' })
  @ApiResponse({ status: 200, description: 'Liste des secrétaires par parcours' })
  async getSecretairesParcours(@Request() req) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Vous devez être associé à une université');
    }
    return this.adminService.getSecretairesParcours(req.user.tenantId);
  }

  @Get('secretaires-disponibles')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Récupérer les utilisateurs disponibles pour être secrétaires' })
  @ApiResponse({ status: 200, description: 'Liste des secrétaires disponibles' })
  async getSecretairesDisponibles(@Request() req) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Vous devez être associé à une université');
    }
    return this.adminService.getSecretairesDisponibles(req.user.tenantId);
  }

  @Delete('secretaires-parcours/:parcoursId')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Supprimer un secrétaire d\'un parcours' })
  @ApiResponse({ status: 200, description: 'Secrétaire supprimé avec succès' })
  async removeSecretaireParcours(@Request() req, @Param('parcoursId') parcoursId: string) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Vous devez être associé à une université');
    }
    return this.adminService.removeSecretaireParcours(req.user.tenantId, parcoursId);
  }
}

// Made with Bob
