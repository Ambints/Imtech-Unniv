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
import { SalleService } from '../services/salle.service';
import { CreateSalleDto } from '../dto/create-salle.dto';
import { UpdateSalleDto } from '../dto/update-salle.dto';

@ApiTags('Salles')
@Controller('academic/:tid/salles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalleController {
  constructor(private readonly salleService: SalleService) {}

  @Post()
  @Roles('admin', 'scolarite', 'secretaire')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer une nouvelle salle' })
  @ApiResponse({ status: 201, description: 'Salle créée avec succès' })
  @ApiResponse({ status: 400, description: 'Requête invalide' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async create(
    @Param('tid') tid: string,
    @Body() createSalleDto: CreateSalleDto,
  ) {
    try {
      const salle = await this.salleService.create(createSalleDto);
      return {
        success: true,
        message: 'Salle créée avec succès',
        data: salle,
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
  @ApiOperation({ summary: 'Récupérer toutes les salles' })
  @ApiResponse({ status: 200, description: 'Liste des salles récupérée avec succès' })
  async findAll(@Param('tid') tid: string) {
    try {
      const salles = await this.salleService.findAll(tid);
      return {
        success: true,
        message: 'Salles récupérées avec succès',
        data: salles,
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
  @ApiOperation({ summary: 'Rechercher des salles' })
  @ApiQuery({ name: 'q', description: 'Terme de recherche' })
  async search(
    @Param('tid') tid: string,
    @Query('q') query: string,
  ) {
    try {
      const salles = await this.salleService.search(tid, query);
      return {
        success: true,
        message: 'Recherche effectuée avec succès',
        data: salles,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('available')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les salles disponibles pour une période' })
  @ApiQuery({ name: 'dateDebut', description: 'Date de début (ISO string)' })
  @ApiQuery({ name: 'dateFin', description: 'Date de fin (ISO string)' })
  async getAvailableSalles(
    @Param('tid') tid: string,
    @Query('dateDebut') dateDebut: string,
    @Query('dateFin') dateFin: string,
  ) {
    try {
      const salles = await this.salleService.getAvailableSalles(
        tid,
        new Date(dateDebut),
        new Date(dateFin),
      );
      return {
        success: true,
        message: 'Salles disponibles récupérées avec succès',
        data: salles,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('type/:type')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les salles par type' })
  @ApiParam({ name: 'type', description: 'Type de salle' })
  async getSallesByType(
    @Param('tid') tid: string,
    @Param('type') type: string,
  ) {
    try {
      const salles = await this.salleService.getSallesByType(tid, type);
      return {
        success: true,
        message: 'Salles récupérées avec succès',
        data: salles,
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
  @ApiOperation({ summary: 'Récupérer les statistiques des salles' })
  async getStatistics(@Param('tid') tid: string) {
    try {
      const stats = await this.salleService.getStatistics(tid);
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
  @ApiOperation({ summary: 'Récupérer une salle par son ID' })
  @ApiParam({ name: 'id', description: 'ID de la salle' })
  async findOne(@Param('tid') tid: string, @Param('id') id: string) {
    try {
      const salle = await this.salleService.findOne(id);
      return {
        success: true,
        message: 'Salle récupérée avec succès',
        data: salle,
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
  @ApiOperation({ summary: 'Mettre à jour une salle' })
  @ApiParam({ name: 'id', description: 'ID de la salle' })
  async update(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() updateSalleDto: UpdateSalleDto,
  ) {
    try {
      const salle = await this.salleService.update(id, updateSalleDto);
      return {
        success: true,
        message: 'Salle mise à jour avec succès',
        data: salle,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: null,
      };
    }
  }

  @Patch(':id/disponibilite')
  @Roles('admin', 'scolarite', 'secretaire')
  @ApiOperation({ summary: 'Mettre à jour la disponibilité d\'une salle' })
  @ApiParam({ name: 'id', description: 'ID de la salle' })
  async updateDisponibilite(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() body: { disponible: boolean },
  ) {
    try {
      const salle = await this.salleService.updateDisponibilite(id, body.disponible);
      return {
        success: true,
        message: 'Disponibilité mise à jour avec succès',
        data: salle,
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
  @ApiOperation({ summary: 'Supprimer une salle' })
  @ApiParam({ name: 'id', description: 'ID de la salle' })
  async remove(@Param('tid') tid: string, @Param('id') id: string) {
    try {
      await this.salleService.remove(id);
      return {
        success: true,
        message: 'Salle supprimée avec succès',
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
