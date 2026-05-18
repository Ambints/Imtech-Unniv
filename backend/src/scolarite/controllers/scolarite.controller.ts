import { Controller, Get, Put, Query, UseGuards, Param, Post, Body, BadRequestException, Req, Res, Response } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ScolariteService } from '../services/scolarite.service';
import { Response as ExpressResponse } from 'express';

@Controller('scolarite/:tenantId')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScolariteController {
  constructor(private readonly scolariteService: ScolariteService) {}

  @Get('dashboard')
  @Roles('admin', 'scolarite', 'responsable_pedagogique', 'president')
  async getDashboard(@Req() req: any, @Param('tenantId') tenantId: string) {
    try {
      return await this.scolariteService.getDashboardStats(req.tenantSchema);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('attestations')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  async getAttestations(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Query('etudiantId') etudiantId?: string
  ) {
    try {
      return await this.scolariteService.getAttestations(req.tenantSchema, etudiantId);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('attestations')
  @Roles('admin', 'scolarite')
  async creerAttestation(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Body() body: {
      etudiantId: string;
      inscriptionId?: string;
      typeAttestation: string;
      anneeAcademiqueId?: string;
      motif?: string;
      observations?: string;
    }
  ) {
    try {
      return await this.scolariteService.creerAttestation(req.tenantSchema, body);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Put('attestations/:attestationId/statut')
  @Roles('admin', 'scolarite')
  async updateAttestationStatut(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('attestationId') attestationId: string,
    @Body() body: { statut: string }
  ) {
    try {
      return await this.scolariteService.updateAttestationStatut(
        req.tenantSchema,
        attestationId,
        body.statut,
        req.user?.userId
      );
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('attestations/:attestationId/pdf')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  async genererPDFAttestation(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('attestationId') attestationId: string,
    @Res() res: ExpressResponse
  ) {
    try {
      const pdfBuffer = await this.scolariteService.genererPDFAttestation(
        req.tenantSchema,
        attestationId
      );
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=attestation-${attestationId}.pdf`,
        'Content-Length': pdfBuffer.length
      });
      
      res.send(pdfBuffer);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Put('attestations/:attestationId/valider')
  @Roles('admin', 'scolarite')
  async validerAttestation(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('attestationId') attestationId: string
  ) {
    try {
      return await this.scolariteService.validerAttestation(
        req.tenantSchema,
        attestationId,
        req.user?.userId
      );
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Put('attestations/:attestationId/rejeter')
  @Roles('admin', 'scolarite')
  async rejeterAttestation(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('attestationId') attestationId: string,
    @Body() body: { motifRejet: string }
  ) {
    try {
      return await this.scolariteService.rejeterAttestation(
        req.tenantSchema,
        attestationId,
        body.motifRejet,
        req.user?.userId
      );
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('transferts')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  async getTransferts(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Query('etudiantId') etudiantId?: string
  ) {
    try {
      return await this.scolariteService.getTransferts(req.tenantSchema, etudiantId);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('transferts')
  @Roles('admin', 'scolarite')
  async createTransfert(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Body() body: { etudiantId: string; motif: string; universiteDestination: string }
  ) {
    try {
      return await this.scolariteService.createTransfert(
        req.tenantSchema,
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
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Param('transfertId') transfertId: string,
    @Body() body: { statut: string; commentaire?: string }
  ) {
    try {
      return await this.scolariteService.updateTransertStatut(
        req.tenantSchema,
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
  async getDeliberations(@Req() req: any, @Param('tenantId') tenantId: string) {
    try {
      return await this.scolariteService.getDeliberations(req.tenantSchema);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('diplomes/eligibles')
  @Roles('admin', 'scolarite')
  async getEtudiantsEligibles(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Query('anneeAcademiqueId') anneeAcademiqueId?: string,
    @Query('parcoursId') parcoursId?: string
  ) {
    try {
      return await this.scolariteService.getEtudiantsEligiblesDiplome(
        req.tenantSchema,
        anneeAcademiqueId,
        parcoursId
      );
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('diplomes/generer')
  @Roles('admin', 'scolarite')
  async genererDiplomes(
    @Req() req: any,
    @Param('tenantId') tenantId: string,
    @Body() body: { anneeAcademiqueId?: string; parcoursId?: string }
  ) {
    try {
      return await this.scolariteService.genererDiplomes(
        req.tenantSchema,
        body.anneeAcademiqueId,
        body.parcoursId
      );
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('diplomes')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  async getDiplomes(@Req() req: any, @Param('tenantId') tenantId: string) {
    try {
      return await this.scolariteService.getDiplomes(req.tenantSchema);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}