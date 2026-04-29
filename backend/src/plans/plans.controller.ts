import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlanDto } from '../tenants/dto/create-plan.dto';
import { UpdatePlanDto } from '../tenants/dto/update-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Plans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Liste tous les plans d\'abonnement' })
  @ApiResponse({ status: 200, description: 'Liste des plans' })
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupère un plan par son ID' })
  @ApiResponse({ status: 200, description: 'Plan trouvé' })
  @ApiResponse({ status: 404, description: 'Plan non trouvé' })
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crée un nouveau plan d\'abonnement' })
  @ApiResponse({ status: 201, description: 'Plan créé' })
  create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Met à jour un plan d\'abonnement' })
  @ApiResponse({ status: 200, description: 'Plan mis à jour' })
  @ApiResponse({ status: 404, description: 'Plan non trouvé' })
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprime un plan d\'abonnement' })
  @ApiResponse({ status: 200, description: 'Plan supprimé' })
  @ApiResponse({ status: 404, description: 'Plan non trouvé' })
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}
