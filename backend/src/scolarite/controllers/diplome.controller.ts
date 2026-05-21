import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { DiplomeService } from '../services/diplome.service';
import { CreateDiplomeDto } from '../dto/create-diplome.dto';

@Controller('scolarite/:tenantId/diplomes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiplomeController {
  constructor(private readonly diplomeService: DiplomeService) {}

  @Post('verification/:etudiantId/:inscriptionId')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  @HttpCode(HttpStatus.OK)
  async verifierConditionsObtention(
    @Param('etudiantId', ParseUUIDPipe) etudiantId: string,
    @Param('inscriptionId', ParseUUIDPipe) inscriptionId: string,
  ) {
    return await this.diplomeService.verifierConditionsObtention(
      etudiantId,
      inscriptionId,
    );
  }

  @Post('generer')
  @Roles('admin', 'scolarite')
  async genererDiplome(@Body() createDiplomeDto: CreateDiplomeDto) {
    return await this.diplomeService.genererDiplome(
      createDiplomeDto.etudiantId,
      createDiplomeDto.inscriptionId,
      createDiplomeDto,
      createDiplomeDto.userId,
    );
  }

  @Post(':id/generer-suplement')
  @Roles('admin', 'scolarite')
  @HttpCode(HttpStatus.OK)
  async genererSuplementDiplome(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { etudiantId: string; inscriptionId: string },
  ) {
    return await this.diplomeService.genererSuplementDiplome(
      id,
      body.etudiantId,
      body.inscriptionId,
    );
  }

  @Get(':id/pdf')
  @Roles('admin', 'scolarite', 'etudiant')
  async genererPdfDiplome(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer = await this.diplomeService.genererPdfDiplome(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="diplome-${id}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Erreur lors de la génération du PDF du diplôme',
        error: (error as any).message,
      });
    }
  }

  @Get(':id/suplement/pdf')
  @Roles('admin', 'scolarite', 'etudiant')
  async genererPdfSuplement(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer = await this.diplomeService.genererPdfSuplement(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="suplement-diplome-${id}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Erreur lors de la génération du PDF du supplément au diplôme',
        error: (error as any).message,
      });
    }
  }

  @Post('verification-authenticite')
  @HttpCode(HttpStatus.OK)
  async verifierAuthenticiteDiplome(@Body() body: {
    numeroDiplome: string;
    hashIntegrite: string;
  }) {
    return await this.diplomeService.verifierAuthenticiteDiplome(
      body.numeroDiplome,
      body.hashIntegrite,
    );
  }

  @Get('verification-qr/:numeroDiplome')
  async verificationParQR(@Param('numeroDiplome') numeroDiplome: string) {
    // Endpoint pour la vérification via QR code
    return {
      message: 'Veuillez fournir le hash d\'intégrité pour vérifier l\'authenticité',
      numeroDiplome,
      verificationEndpoint: '/scolarite/diplomes/verification-authenticite',
    };
  }

  @Get(':id/retirer')
  @Roles('admin', 'scolarite')
  @HttpCode(HttpStatus.OK)
  async marquerRetire(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userId') userId: string,
  ) {
    return await this.diplomeService.marquerRetire(id, userId);
  }

  @Get('etudiant/:etudiantId')
  @Roles('admin', 'scolarite', 'etudiant')
  async getDiplomesEtudiant(@Param('etudiantId', ParseUUIDPipe) etudiantId: string) {
    // TODO: Implémenter la méthode pour récupérer les diplômes d'un étudiant
    return {
      message: 'Méthode à implémenter',
      etudiantId,
    };
  }

  @Get('attestation-reussite/:etudiantId/:inscriptionId/pdf')
  @Roles('admin', 'scolarite', 'etudiant')
  async genererAttestationReussitePDF(
    @Param('etudiantId', ParseUUIDPipe) etudiantId: string,
    @Param('inscriptionId', ParseUUIDPipe) inscriptionId: string,
    @Res() res: Response,
  ) {
    try {
      // TODO: Utiliser le PDFService pour générer l'attestation
      // const pdfBuffer = await this.pdfService.genererAttestationReussite(etudiantId, inscriptionId);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="attestation-reussite-${etudiantId}.pdf"`);
      // res.send(pdfBuffer);
      
      // Pour l'instant, retourner un message
      res.json({
        message: 'Génération PDF à implémenter',
        etudiantId,
        inscriptionId,
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Erreur lors de la génération de l\'attestation de réussite',
        error: (error as any).message,
      });
    }
  }

  @Get('attestation-scolarite/:etudiantId/:inscriptionId/pdf')
  @Roles('admin', 'scolarite', 'etudiant')
  async genererAttestationScolaritePDF(
    @Param('etudiantId', ParseUUIDPipe) etudiantId: string,
    @Param('inscriptionId', ParseUUIDPipe) inscriptionId: string,
    @Res() res: Response,
  ) {
    try {
      // TODO: Utiliser le PDFService pour générer l'attestation
      // const pdfBuffer = await this.pdfService.genererAttestationScolarite(etudiantId, inscriptionId);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="attestation-scolarite-${etudiantId}.pdf"`);
      // res.send(pdfBuffer);
      
      // Pour l'instant, retourner un message
      res.json({
        message: 'Génération PDF à implémenter',
        etudiantId,
        inscriptionId,
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Erreur lors de la génération de l\'attestation de scolarité',
        error: (error as any).message,
      });
    }
  }

  @Get()
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  findAll(@Query() filters: any) {
    return this.diplomeService.findAll(filters);
  }

  @Get(':id')
  @Roles('admin', 'scolarite', 'etudiant')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.diplomeService.findOne(id);
  }

  @Get('statistiques/annee/:annee')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  async getStatistiquesDiplomesAnnee(@Param('annee') annee: number) {
    // TODO: Implémenter les statistiques de diplômes par année
    return {
      message: 'Statistiques à implémenter',
      annee,
    };
  }

  @Get('statistiques/parcours/:parcoursId')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  async getStatistiquesDiplomesParcours(@Param('parcoursId', ParseUUIDPipe) parcoursId: string) {
    // TODO: Implémenter les statistiques de diplômes par parcours
    return {
      message: 'Statistiques à implémenter',
      parcoursId,
    };
  }
}
