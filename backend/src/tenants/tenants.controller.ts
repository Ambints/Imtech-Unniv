import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Super Admin - Gestion des Universités')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly svc: TenantsService) {}

  // ========== ENDPOINTS POUR ADMIN/PRESIDENT DU TENANT (doivent être AVANT les routes avec :id) ==========

  @Get('my-tenant/config')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Configuration du tenant de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Configuration du tenant' })
  @ApiResponse({ status: 400, description: 'Tenant ID manquant - utilisateur non associé à une université' })
  getMyTenantConfig(@Request() req) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Vous devez être associé à une université pour accéder à cette ressource');
    }
    return this.svc.getMyTenantConfig(req.user.tenantId);
  }

  @Patch('my-tenant/config')
  @Roles('admin')
  @ApiOperation({ summary: 'Mettre à jour la configuration du tenant (admin uniquement)' })
  @ApiResponse({ status: 200, description: 'Configuration mise à jour' })
  @ApiResponse({ status: 400, description: 'Tenant ID manquant - utilisateur non associé à une université' })
  updateMyTenantConfig(@Request() req, @Body() dto: UpdateTenantDto) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Vous devez être associé à une université pour accéder à cette ressource');
    }
    return this.svc.updateMyTenantConfig(req.user.tenantId, dto);
  }

  @Get('my-tenant/stats')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Statistiques du tenant de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Statistiques du tenant' })
  @ApiResponse({ status: 400, description: 'Tenant ID manquant - utilisateur non associé à une université' })
  getMyTenantStats(@Request() req) {
    if (!req.user?.tenantId) {
      throw new BadRequestException('Vous devez être associé à une université pour accéder à cette ressource');
    }
    return this.svc.getMyTenantStats(req.user.tenantId);
  }

  // ========== ENDPOINTS SUPER ADMIN ==========

  @Post()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Créer une nouvelle université (avec schéma PostgreSQL)' })
  @ApiResponse({ status: 201, description: 'Université créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou slug déjà utilisé' })
  create(@Body() dto: CreateTenantDto) {
    return this.svc.create(dto);
  }

  @Get()
  @Roles('super_admin')
  @ApiOperation({ summary: 'Lister toutes les universités' })
  @ApiResponse({ status: 200, description: 'Liste des universités' })
  findAll() {
    return this.svc.findAll();
  }

  @Get('plans')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Liste des plans d\'abonnement disponibles' })
  @ApiResponse({ status: 200, description: 'Liste des plans' })
  getPlans() {
    return this.svc.getAllPlans();
  }

  @Get('plans/:id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Détails d\'un plan d\'abonnement' })
  @ApiResponse({ status: 200, description: 'Détails du plan' })
  @ApiResponse({ status: 404, description: 'Plan non trouvé' })
  getPlan(@Param('id') id: string) {
    return this.svc.getPlanById(id);
  }

  @Post('plans')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Créer un nouveau plan d\'abonnement' })
  @ApiResponse({ status: 201, description: 'Plan créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  createPlan(@Body() dto: any) {
    return this.svc.createPlan(dto);
  }

  @Patch('plans/:id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Modifier un plan d\'abonnement' })
  @ApiResponse({ status: 200, description: 'Plan mis à jour' })
  @ApiResponse({ status: 404, description: 'Plan non trouvé' })
  updatePlan(@Param('id') id: string, @Body() dto: any) {
    return this.svc.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Supprimer un plan d\'abonnement' })
  @ApiResponse({ status: 200, description: 'Plan supprimé' })
  @ApiResponse({ status: 400, description: 'Plan utilisé par des tenants' })
  @ApiResponse({ status: 404, description: 'Plan non trouvé' })
  deletePlan(@Param('id') id: string) {
    return this.svc.deletePlan(id);
  }

  @Get('by-slug/:slug')
  @Roles('super_admin')
  @ApiOperation({ summary: "Trouver une université par son slug" })
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug);
  }

  @Get('subscriptions/all')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Liste des abonnements avec statistiques' })
  @ApiResponse({ status: 200, description: 'Liste des abonnements' })
  getSubscriptions() {
    return this.svc.getSubscriptions();
  }

  @Get('debug/check-table')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Vérifier le contenu de la table tenant (debug)' })
  @ApiResponse({ status: 200, description: 'Contenu de la table tenant' })
  async checkTenantTable() {
    console.log('🔍 Debug - Vérification de la table tenant...');
    try {
      const tenants = await this.svc.findAll();
      console.log(`📊 Debug - ${tenants.length} tenants trouvés`);
      
      // Vérifier si les schémas existent
      const schemas = [];
      for (const tenant of tenants) {
        if (tenant.schemaName) {
          schemas.push(tenant.schemaName);
        }
      }
      
      return {
        tenantCount: tenants.length,
        tenants: tenants,
        schemas: schemas,
        message: `Found ${tenants.length} tenants in database`
      };
    } catch (error) {
      console.log(`❌ Debug - Erreur: ${error}`);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        error: errorMessage,
        tenantCount: 0,
        tenants: [],
        schemas: []
      };
    }
  }

  @Get(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: "Détails d'une université" })
  @ApiResponse({ status: 200, description: 'Détails de l\'université' })
  @ApiResponse({ status: 404, description: 'Université non trouvée' })
  findOne(@Param('id') id: string) {
    console.log(`🔍 Controller - Recherche du tenant: ${id}`);
    try {
      const result = this.svc.findOne(id);
      console.log(`✅ Controller - Résultat trouvé pour: ${id}`);
      return result;
    } catch (error) {
      console.log(`❌ Controller - Erreur pour ${id}: ${error}`);
      throw error;
    }
  }

  @Patch(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Modifier une université (White Label, configuration)' })
  @ApiResponse({ status: 200, description: 'Université mise à jour' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Supprimer une université (et son schéma PostgreSQL)' })
  @ApiResponse({ status: 204, description: 'Université supprimée' })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Get(':id/dashboard')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Tableau de bord Super Admin d\'une université' })
  dashboard(@Param('id') id: string) {
    return this.svc.getDashboard(id);
  }

  @Get(':id/config')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Configuration complète (White Label) d\'une université' })
  getFullConfig(@Param('id') id: string) {
    return this.svc.getFullConfig(id);
  }


  @Post(':id/subscription')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Créer ou modifier l\'abonnement d\'une université' })
  @ApiResponse({ status: 200, description: 'Abonnement mis à jour' })
  @ApiResponse({ status: 404, description: 'Université non trouvée' })
  updateSubscription(
    @Param('id') id: string,
    @Body() dto: { plan: string; status: string; startDate?: string; endDate?: string; monthlyPrice?: number; maxUsers?: number }
  ) {
    return this.svc.updateSubscription(id, dto);
  }

  @Delete(':id/subscription')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Supprimer/Résilier l\'abonnement d\'une université' })
  @ApiResponse({ status: 200, description: 'Abonnement résilié' })
  @ApiResponse({ status: 404, description: 'Université non trouvée' })
  removeSubscription(@Param('id') id: string) {
    return this.svc.removeSubscription(id);
  }
}