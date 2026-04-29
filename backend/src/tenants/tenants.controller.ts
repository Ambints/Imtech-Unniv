import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Super Admin - Gestion des Universités')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly svc: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle université (avec schéma PostgreSQL)' })
  @ApiResponse({ status: 201, description: 'Université créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides ou slug déjà utilisé' })
  create(@Body() dto: CreateTenantDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les universités' })
  @ApiResponse({ status: 200, description: 'Liste des universités' })
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: "Détails d'une université" })
  @ApiResponse({ status: 200, description: 'Détails de l\'université' })
  @ApiResponse({ status: 404, description: 'Université non trouvée' })
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Get('by-slug/:slug')
  @ApiOperation({ summary: "Trouver une université par son slug" })
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une université (White Label, configuration)' })
  @ApiResponse({ status: 200, description: 'Université mise à jour' })
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une université (et son schéma PostgreSQL)' })
  @ApiResponse({ status: 204, description: 'Université supprimée' })
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Tableau de bord Super Admin d\'une université' })
  dashboard(@Param('id') id: string) {
    return this.svc.getDashboard(id);
  }

  @Get(':id/config')
  @ApiOperation({ summary: 'Configuration complète (White Label) d\'une université' })
  getFullConfig(@Param('id') id: string) {
    return this.svc.getFullConfig(id);
  }

  @Get('subscriptions/all')
  @ApiOperation({ summary: 'Liste des abonnements avec statistiques' })
  @ApiResponse({ status: 200, description: 'Liste des abonnements' })
  getSubscriptions() {
    return this.svc.getSubscriptions();
  }

  @Post(':id/subscription')
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
  @ApiOperation({ summary: 'Supprimer/Résilier l\'abonnement d\'une université' })
  @ApiResponse({ status: 200, description: 'Abonnement résilié' })
  @ApiResponse({ status: 404, description: 'Université non trouvée' })
  removeSubscription(@Param('id') id: string) {
    return this.svc.removeSubscription(id);
  }
}