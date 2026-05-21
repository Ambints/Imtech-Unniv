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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { InscriptionService } from '../services/inscription.service';
import { CreateInscriptionDto } from '../dto/create-inscription.dto';
import { UpdateInscriptionDto } from '../dto/update-inscription.dto';

@ApiTags('Inscriptions')
@Controller('academic/:tid/inscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InscriptionController {
  constructor(private readonly inscriptionService: InscriptionService) {}

  @Post()
  @Roles('admin', 'scolarite', 'secretaire')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une nouvelle inscription' })
  @ApiResponse({ status: 201, description: 'Inscription créée avec succès' })
  async create(
    @Param('tid') tid: string,
    @Body() createInscriptionDto: CreateInscriptionDto,
  ) {
    try {
      const inscription = await this.inscriptionService.create(createInscriptionDto);
      return {
        success: true,
        message: 'Inscription créée avec succès',
        data: inscription,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: null,
      };
    }
  }

  @Post('bulk')
  @Roles('admin', 'scolarite', 'secretaire')
  @ApiOperation({ summary: 'Créer plusieurs inscriptions' })
  async bulkCreate(
    @Param('tid') tid: string,
    @Body() body: { inscriptions: CreateInscriptionDto[] },
  ) {
    try {
      const results = await this.inscriptionService.bulkCreate(body.inscriptions);
      return {
        success: true,
        message: 'Inscriptions créées en masse',
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: null,
      };
    }
  }

  @Get()
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer toutes les inscriptions' })
  @ApiResponse({ status: 200, description: 'Liste des inscriptions récupérée avec succès' })
  async findAll(@Param('tid') tid: string) {
    try {
      const inscriptions = await this.inscriptionService.findAll(tid);
      return {
        success: true,
        message: 'Inscriptions récupérées avec succès',
        data: inscriptions,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('search')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Rechercher des inscriptions' })
  @ApiQuery({ name: 'q', description: 'Terme de recherche' })
  async search(
    @Param('tid') tid: string,
    @Query('q') query: string,
  ) {
    try {
      const inscriptions = await this.inscriptionService.search(tid, query);
      return {
        success: true,
        message: 'Recherche effectuée avec succès',
        data: inscriptions,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('etudiant/:etudiantId')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les inscriptions par étudiant' })
  @ApiParam({ name: 'etudiantId', description: 'ID de l\'étudiant' })
  async getInscriptionsByEtudiant(
    @Param('tid') tid: string,
    @Param('etudiantId') etudiantId: string,
  ) {
    try {
      const inscriptions = await this.inscriptionService.getInscriptionsByEtudiant(tid, etudiantId);
      return {
        success: true,
        message: 'Inscriptions récupérées avec succès',
        data: inscriptions,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('parcours/:parcoursId')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les inscriptions par parcours' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  async getInscriptionsByParcours(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
  ) {
    try {
      const inscriptions = await this.inscriptionService.getInscriptionsByParcours(tid, parcoursId);
      return {
        success: true,
        message: 'Inscriptions récupérées avec succès',
        data: inscriptions,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('annee/:anneeAcademique')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les inscriptions par année académique' })
  @ApiParam({ name: 'anneeAcademique', description: 'Année académique' })
  async getInscriptionsByAnneeAcademique(
    @Param('tid') tid: string,
    @Param('anneeAcademique') anneeAcademique: string,
  ) {
    try {
      const inscriptions = await this.inscriptionService.getInscriptionsByAnneeAcademique(tid, anneeAcademique);
      return {
        success: true,
        message: 'Inscriptions récupérées avec succès',
        data: inscriptions,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('semestre/:semestre')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les inscriptions par semestre' })
  @ApiParam({ name: 'semestre', description: 'Numéro du semestre' })
  async getInscriptionsBySemestre(
    @Param('tid') tid: string,
    @Param('semestre') semestre: number,
  ) {
    try {
      const inscriptions = await this.inscriptionService.getInscriptionsBySemestre(tid, semestre);
      return {
        success: true,
        message: 'Inscriptions récupérées avec succès',
        data: inscriptions,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('statut/:statut')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les inscriptions par statut' })
  @ApiParam({ name: 'statut', description: 'Statut de l\'inscription' })
  async getInscriptionsByStatut(
    @Param('tid') tid: string,
    @Param('statut') statut: string,
  ) {
    try {
      const inscriptions = await this.inscriptionService.getInscriptionsByStatut(tid, statut);
      return {
        success: true,
        message: 'Inscriptions récupérées avec succès',
        data: inscriptions,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('range')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les inscriptions par plage de dates' })
  @ApiQuery({ name: 'dateDebut', description: 'Date de début (ISO string)' })
  @ApiQuery({ name: 'dateFin', description: 'Date de fin (ISO string)' })
  async getInscriptionsByDateRange(
    @Param('tid') tid: string,
    @Query('dateDebut') dateDebut: string,
    @Query('dateFin') dateFin: string,
  ) {
    try {
      const inscriptions = await this.inscriptionService.getInscriptionsByDateRange(
        tid,
        new Date(dateDebut),
        new Date(dateFin),
      );
      return {
        success: true,
        message: 'Inscriptions récupérées avec succès',
        data: inscriptions,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('statistics')
  @Roles('admin', 'scolarite')
  @ApiOperation({ summary: 'Récupérer les statistiques des inscriptions' })
  async getStatistics(@Param('tid') tid: string) {
    try {
      const stats = await this.inscriptionService.getStatistics(tid);
      return {
        success: true,
        message: 'Statistiques récupérées avec succès',
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: null,
      };
    }
  }

  @Get('export')
  @Roles('admin', 'scolarite')
  @ApiOperation({ summary: 'Exporter les inscriptions' })
  @ApiQuery({ name: 'format', description: 'Format d\'export (csv, excel, pdf)' })
  async exportInscriptions(
    @Param('tid') tid: string,
    @Query('format') format: 'csv' | 'excel' | 'pdf' = 'csv',
  ) {
    try {
      const exportData = await this.inscriptionService.exportInscriptions(tid, format);
      return {
        success: true,
        message: 'Export préparé avec succès',
        data: exportData,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: null,
      };
    }
  }

  @Get(':id')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer une inscription par son ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'inscription' })
  async findOne(@Param('tid') tid: string, @Param('id') id: string) {
    try {
      const inscription = await this.inscriptionService.findOne(id);
      return {
        success: true,
        message: 'Inscription récupérée avec succès',
        data: inscription,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: null,
      };
    }
  }

  @Patch(':id')
  @Roles('admin', 'scolarite', 'secretaire')
  @ApiOperation({ summary: 'Mettre à jour une inscription' })
  @ApiParam({ name: 'id', description: 'ID de l\'inscription' })
  async update(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() updateInscriptionDto: UpdateInscriptionDto,
  ) {
    try {
      const inscription = await this.inscriptionService.update(id, updateInscriptionDto);
      return {
        success: true,
        message: 'Inscription mise à jour avec succès',
        data: inscription,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: null,
      };
    }
  }

  @Patch(':id/status')
  @Roles('admin', 'scolarite')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une inscription' })
  @ApiParam({ name: 'id', description: 'ID de l\'inscription' })
  async updateInscriptionStatus(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() body: { statut: string },
  ) {
    try {
      const inscription = await this.inscriptionService.updateInscriptionStatus(id, body.statut);
      return {
        success: true,
        message: 'Statut mis à jour avec succès',
        data: inscription,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: null,
      };
    }
  }

  @Delete(':id')
  @Roles('admin', 'scolarite')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer une inscription' })
  @ApiParam({ name: 'id', description: 'ID de l\'inscription' })
  async remove(@Param('tid') tid: string, @Param('id') id: string) {
    try {
      await this.inscriptionService.remove(id);
      return {
        success: true,
        message: 'Inscription supprimée avec succès',
        data: null,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: null,
      };
    }
  }
}
