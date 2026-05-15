import { Controller, Get, Query, UseGuards, Param, Post, Body, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ScolariteService } from '../services/scolarite.service';

@Controller('scolarite/:tenantId')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScolariteController {
  constructor(private readonly scolariteService: ScolariteService) {}

  @Get('dashboard')
  @Roles('admin', 'scolarite', 'responsable_pedagogique', 'president')
  async getDashboard(@Param('tenantId') tenantId: string) {
    try {
      return await this.scolariteService.getDashboardStats();
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('attestations')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  async getAttestations(
    @Param('tenantId') tenantId: string,
    @Query('etudiantId') etudiantId?: string
  ) {
    try {
      return await this.scolariteService.getAttestations(etudiantId);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('transferts')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  async getTransferts(
    @Param('tenantId') tenantId: string,
    @Query('etudiantId') etudiantId?: string
  ) {
    try {
      return await this.scolariteService.getTransferts(etudiantId);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('transferts')
  @Roles('admin', 'scolarite')
  async createTransfert(
    @Param('tenantId') tenantId: string,
    @Body() body: { etudiantId: string; motif: string; universiteDestination: string }
  ) {
    try {
      return await this.scolariteService.createTransfert(
        body.etudiantId,
        body.motif,
        body.universiteDestination
      );
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('transferts/:transfertId/statut')
  @Roles('admin', 'scolarite')
  async updateTransfertStatut(
    @Param('tenantId') tenantId: string,
    @Param('transfertId') transfertId: string,
    @Body() body: { statut: string; commentaire?: string }
  ) {
    try {
      return await this.scolariteService.updateTransertStatut(
        transfertId,
        body.statut,
        body.commentaire
      );
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('deliberations')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  async getDeliberations(@Param('tenantId') tenantId: string) {
    try {
      return await this.scolariteService.getDeliberations();
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('diplomes')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  async getDiplomes(@Param('tenantId') tenantId: string) {
    try {
      return await this.scolariteService.getDiplomes();
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
