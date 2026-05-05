import { Controller, Get, Patch, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';

@ApiTags('Admin - Gestion des Permissions Portails')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/portals')
export class PortailPermissionsController {
  constructor(
    @InjectRepository(Tenant) private tenantRepo: Repository<Tenant>,
    private dataSource: DataSource,
  ) {}

  @Get('permissions')
  @Roles('admin')
  @ApiOperation({ summary: 'Récupérer toutes les permissions des portails' })
  @ApiResponse({ status: 200, description: 'Liste des permissions par portail' })
  async getPermissions(@Request() req) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Tenant ID manquant');
    }

    const tenant = await this.tenantRepo.findOne({ where: { id: req.user.tenantId } });
    if (!tenant) {
      throw new BadRequestException('Tenant non trouvé');
    }

    const schemaName = tenant.schemaName;

    // Récupérer toutes les permissions groupées par type de portail
    const permissions = await this.dataSource.query(`
      SELECT 
        type_portail,
        permission_key,
        permission_label,
        actif,
        description
      FROM ${schemaName}.permissions_portail
      ORDER BY type_portail, permission_key
    `);

    // Grouper par type de portail
    const grouped = {
      etudiant: [],
      parent: [],
      professeur: []
    };

    permissions.forEach((perm: any) => {
      grouped[perm.type_portail].push({
        key: perm.permission_key,
        label: perm.permission_label,
        actif: perm.actif,
        description: perm.description
      });
    });

    return grouped;
  }

  @Get('permissions/:type')
  @Roles('admin')
  @ApiOperation({ summary: 'Récupérer les permissions d\'un portail spécifique' })
  @ApiResponse({ status: 200, description: 'Liste des permissions du portail' })
  async getPermissionsByType(@Request() req, @Param('type') type: string) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Tenant ID manquant');
    }

    if (!['etudiant', 'parent', 'professeur'].includes(type)) {
      throw new BadRequestException('Type de portail invalide');
    }

    const tenant = await this.tenantRepo.findOne({ where: { id: req.user.tenantId } });
    if (!tenant) {
      throw new BadRequestException('Tenant non trouvé');
    }

    const schemaName = tenant.schemaName;

    const permissions = await this.dataSource.query(`
      SELECT 
        permission_key,
        permission_label,
        actif,
        description
      FROM ${schemaName}.permissions_portail
      WHERE type_portail = $1
      ORDER BY permission_key
    `, [type]);

    return permissions.map((perm: any) => ({
      key: perm.permission_key,
      label: perm.permission_label,
      actif: perm.actif,
      description: perm.description
    }));
  }

  @Patch('permissions/:type/:key')
  @Roles('admin')
  @ApiOperation({ summary: 'Activer/Désactiver une permission' })
  @ApiResponse({ status: 200, description: 'Permission mise à jour' })
  async updatePermission(
    @Request() req,
    @Param('type') type: string,
    @Param('key') key: string,
    @Body() body: { actif: boolean }
  ) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Tenant ID manquant');
    }

    if (!['etudiant', 'parent', 'professeur'].includes(type)) {
      throw new BadRequestException('Type de portail invalide');
    }

    const tenant = await this.tenantRepo.findOne({ where: { id: req.user.tenantId } });
    if (!tenant) {
      throw new BadRequestException('Tenant non trouvé');
    }

    const schemaName = tenant.schemaName;

    await this.dataSource.query(`
      UPDATE ${schemaName}.permissions_portail
      SET actif = $1, updated_at = NOW()
      WHERE type_portail = $2 AND permission_key = $3
    `, [body.actif, type, key]);

    return {
      message: 'Permission mise à jour avec succès',
      type,
      key,
      actif: body.actif
    };
  }

  @Patch('permissions/:type/bulk')
  @Roles('admin')
  @ApiOperation({ summary: 'Mettre à jour plusieurs permissions en masse' })
  @ApiResponse({ status: 200, description: 'Permissions mises à jour' })
  async updatePermissionsBulk(
    @Request() req,
    @Param('type') type: string,
    @Body() body: { permissions: { [key: string]: boolean } }
  ) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Tenant ID manquant');
    }

    if (!['etudiant', 'parent', 'professeur'].includes(type)) {
      throw new BadRequestException('Type de portail invalide');
    }

    const tenant = await this.tenantRepo.findOne({ where: { id: req.user.tenantId } });
    if (!tenant) {
      throw new BadRequestException('Tenant non trouvé');
    }

    const schemaName = tenant.schemaName;

    // Mettre à jour chaque permission
    for (const [key, actif] of Object.entries(body.permissions)) {
      await this.dataSource.query(`
        UPDATE ${schemaName}.permissions_portail
        SET actif = $1, updated_at = NOW()
        WHERE type_portail = $2 AND permission_key = $3
      `, [actif, type, key]);
    }

    return {
      message: `${Object.keys(body.permissions).length} permission(s) mise(s) à jour`,
      type
    };
  }
}

// Made with Bob
