import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ScolariteService } from '../services/scolarite.service';

@Controller('scolarite/:tenantId')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScolariteController {
  constructor(private readonly scolariteService: ScolariteService) {}

  // Dashboard endpoints removed - causing 500 errors due to missing Parcours entity in tenant schema
  // Use the notes, deliberation, and diplome controllers instead

  @Get('attestations')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  async getAttestations(@Param('tenantId') tenantId: string) {
    // TODO: Implement attestations service
    return [];
  }

  @Get('transferts')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  async getTransferts(@Param('tenantId') tenantId: string) {
    // TODO: Implement transferts service
    return [];
  }
}
