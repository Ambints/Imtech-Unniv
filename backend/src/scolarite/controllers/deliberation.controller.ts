import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { DeliberationService } from '../services/deliberation.service';
import { CreateDeliberationDto } from '../dto/create-deliberation.dto';
import { UpdateDeliberationDto } from '../dto/update-deliberation.dto';

@Controller('scolarite/:tenantId/deliberations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DeliberationController {
  constructor(private readonly deliberationService: DeliberationService) {}

  @Post()
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  create(@Body() createDeliberationDto: CreateDeliberationDto) {
    return this.deliberationService.create(createDeliberationDto, createDeliberationDto.userId);
  }

  @Post(':id/lancer')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  @HttpCode(HttpStatus.OK)
  async lancerDeliberation(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return await this.deliberationService.lancerDeliberation(id, userId);
  }

  @Post(':id/valider')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  @HttpCode(HttpStatus.OK)
  async validerDeliberation(
    @Param('id') id: string,
    @Body() body: { userId: string; observations?: string },
  ) {
    return await this.deliberationService.validerDeliberation(
      id,
      body.userId,
      body.observations,
    );
  }

  @Post(':id/autoriser-modification')
  @Roles('admin', 'scolarite')
  @HttpCode(HttpStatus.OK)
  async autoriserModificationNotes(
    @Param('id') id: string,
    @Body() body: {
      etudiantId: string;
      motif: string;
      dureeJours: number;
      userId: string;
    },
  ) {
    return await this.deliberationService.autoriserModificationNotes(
      id,
      body.etudiantId,
      body.motif,
      body.dureeJours,
      body.userId,
    );
  }

  @Get(':id/rapport')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  async genererRapportDeliberation(@Param('id') id: string) {
    return await this.deliberationService.genererRapportDeliberation(id);
  }

  @Get(':id/rapport/pdf')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  async exporterRapportPDF(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const rapport = await this.deliberationService.genererRapportDeliberation(id);
      
      // TODO: Générer le PDF avec le service PDF
      // const pdfBuffer = await this.pdfService.genererRapportDeliberationPDF(rapport);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="rapport-deliberation-${id}.pdf"`);
      // res.send(pdfBuffer);
      
      // Pour l'instant, retourner JSON
      res.json(rapport);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Erreur lors de la génération du PDF',
        error: (error as any).message,
      });
    }
  }

  @Get()
  @Roles('admin', 'scolarite', 'responsable_pedagogique', 'enseignant')
  findAll(@Query() filters: any) {
    return this.deliberationService.findAll(filters);
  }

  @Get(':id')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  findOne(@Param('id') id: string) {
    return this.deliberationService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  update(
    @Param('id') id: string,
    @Body() updateDeliberationDto: UpdateDeliberationDto,
  ) {
    return this.deliberationService.update(id, updateDeliberationDto);
  }

  @Delete(':id')
  @Roles('admin', 'scolarite')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.deliberationService.remove(id);
  }

  @Get(':id/statistiques')
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  async getStatistiquesDeliberation(@Param('id') id: string) {
    const deliberation = await this.deliberationService.findOne(id);
    
    // TODO: Implémenter les statistiques détaillées
    return {
      deliberationId: id,
      message: 'Statistiques à implémenter',
    };
  }
}
