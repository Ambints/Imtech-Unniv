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
import { SeanceService } from '../services/seance.service';
import { CreateSeanceDto } from '../dto/create-seance.dto';
import { UpdateSeanceDto } from '../dto/update-seance.dto';

@ApiTags('Séances')
@Controller('academic/:tid/seances')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SeanceController {
  constructor(private readonly seanceService: SeanceService) {}

  @Post()
  @Roles('admin', 'scolarite', 'secretaire')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une nouvelle séance' })
  @ApiResponse({ status: 201, description: 'Séance créée avec succès' })
  async create(
    @Param('tid') tid: string,
    @Body() createSeanceDto: CreateSeanceDto,
  ) {
    try {
      const seance = await this.seanceService.create(createSeanceDto);
      return {
        success: true,
        message: 'Séance créée avec succès',
        data: seance,
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
  @ApiOperation({ summary: 'Récupérer toutes les séances' })
  @ApiResponse({ status: 200, description: 'Liste des séances récupérée avec succès' })
  async findAll(@Param('tid') tid: string) {
    try {
      const seances = await this.seanceService.findAll(tid);
      return {
        success: true,
        message: 'Séances récupérées avec succès',
        data: seances,
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
  @ApiOperation({ summary: 'Rechercher des séances' })
  @ApiQuery({ name: 'q', description: 'Terme de recherche' })
  async search(
    @Param('tid') tid: string,
    @Query('q') query: string,
  ) {
    try {
      const seances = await this.seanceService.search(tid, query);
      return {
        success: true,
        message: 'Recherche effectuée avec succès',
        data: seances,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('date/:date')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les séances par date' })
  @ApiParam({ name: 'date', description: 'Date (YYYY-MM-DD)' })
  async getSeancesByDate(
    @Param('tid') tid: string,
    @Param('date') date: string,
  ) {
    try {
      const seances = await this.seanceService.getSeancesByDate(tid, new Date(date));
      return {
        success: true,
        message: 'Séances récupérées avec succès',
        data: seances,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('salle/:salleId')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les séances par salle' })
  @ApiParam({ name: 'salleId', description: 'ID de la salle' })
  async getSeancesBySalle(
    @Param('tid') tid: string,
    @Param('salleId') salleId: string,
  ) {
    try {
      const seances = await this.seanceService.getSeancesBySalle(tid, salleId);
      return {
        success: true,
        message: 'Séances récupérées avec succès',
        data: seances,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('enseignant/:enseignantId')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les séances par enseignant' })
  @ApiParam({ name: 'enseignantId', description: 'ID de l\'enseignant' })
  async getSeancesByEnseignant(
    @Param('tid') tid: string,
    @Param('enseignantId') enseignantId: string,
  ) {
    try {
      const seances = await this.seanceService.getSeancesByEnseignant(tid, enseignantId);
      return {
        success: true,
        message: 'Séances récupérées avec succès',
        data: seances,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('ue/:ueId')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les séances par UE' })
  @ApiParam({ name: 'ueId', description: 'ID de l\'UE' })
  async getSeancesByUE(
    @Param('tid') tid: string,
    @Param('ueId') ueId: string,
  ) {
    try {
      const seances = await this.seanceService.getSeancesByUE(tid, ueId);
      return {
        success: true,
        message: 'Séances récupérées avec succès',
        data: seances,
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
  @ApiOperation({ summary: 'Récupérer les séances par parcours' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  async getSeancesByParcours(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
  ) {
    try {
      const seances = await this.seanceService.getSeancesByParcours(tid, parcoursId);
      return {
        success: true,
        message: 'Séances récupérées avec succès',
        data: seances,
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
  @ApiOperation({ summary: 'Récupérer les séances par plage de dates' })
  @ApiQuery({ name: 'dateDebut', description: 'Date de début (ISO string)' })
  @ApiQuery({ name: 'dateFin', description: 'Date de fin (ISO string)' })
  async getSeancesByDateRange(
    @Param('tid') tid: string,
    @Query('dateDebut') dateDebut: string,
    @Query('dateFin') dateFin: string,
  ) {
    try {
      const seances = await this.seanceService.getSeancesByDateRange(
        tid,
        new Date(dateDebut),
        new Date(dateFin),
      );
      return {
        success: true,
        message: 'Séances récupérées avec succès',
        data: seances,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('conflicts')
  @Roles('admin', 'scolarite')
  @ApiOperation({ summary: 'Récupérer les séances avec conflits' })
  async getSeancesConflicts(@Param('tid') tid: string) {
    try {
      const conflicts = await this.seanceService.getSeancesConflicts(tid);
      return {
        success: true,
        message: 'Conflits récupérés avec succès',
        data: conflicts,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('check-disponibilite')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Vérifier la disponibilité d\'une salle' })
  @ApiQuery({ name: 'salleId', description: 'ID de la salle' })
  @ApiQuery({ name: 'dateDebut', description: 'Date de début (ISO string)' })
  @ApiQuery({ name: 'dateFin', description: 'Date de fin (ISO string)' })
  @ApiQuery({ name: 'excludeSeanceId', description: 'ID de la séance à exclure (optionnel)', required: false })
  async checkSalleDisponibilite(
    @Param('tid') tid: string,
    @Query('salleId') salleId: string,
    @Query('dateDebut') dateDebut: string,
    @Query('dateFin') dateFin: string,
    @Query('excludeSeanceId') excludeSeanceId?: string,
  ) {
    try {
      const disponible = await this.seanceService.checkSalleDisponibilite(
        salleId,
        new Date(dateDebut),
        new Date(dateFin),
        excludeSeanceId,
      );
      return {
        success: true,
        message: 'Disponibilité vérifiée avec succès',
        data: { disponible },
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: { disponible: false },
      };
    }
  }

  @Get('statistics')
  @Roles('admin', 'scolarite')
  @ApiOperation({ summary: 'Récupérer les statistiques des séances' })
  async getStatistics(@Param('tid') tid: string) {
    try {
      const stats = await this.seanceService.getStatistics(tid);
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

  @Get(':id')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer une séance par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la séance' })
  async findOne(@Param('tid') tid: string, @Param('id') id: string) {
    try {
      const seance = await this.seanceService.findOne(id);
      return {
        success: true,
        message: 'Séance récupérée avec succès',
        data: seance,
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
  @ApiOperation({ summary: 'Mettre à jour une séance' })
  @ApiParam({ name: 'id', description: 'ID de la séance' })
  async update(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() updateSeanceDto: UpdateSeanceDto,
  ) {
    try {
      const seance = await this.seanceService.update(id, updateSeanceDto);
      return {
        success: true,
        message: 'Séance mise à jour avec succès',
        data: seance,
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
  @ApiOperation({ summary: 'Supprimer une séance' })
  @ApiParam({ name: 'id', description: 'ID de la séance' })
  async remove(@Param('tid') tid: string, @Param('id') id: string) {
    try {
      await this.seanceService.remove(id);
      return {
        success: true,
        message: 'Séance supprimée avec succès',
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
