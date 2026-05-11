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
import { CourseService } from '../services/course.service';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';

@ApiTags('Cours')
@Controller('academic/:tid/courses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un nouveau cours' })
  @ApiResponse({ status: 201, description: 'Cours créé avec succès' })
  async create(
    @Param('tid') tid: string,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    try {
      const course = await this.courseService.create(createCourseDto);
      return {
        success: true,
        message: 'Cours créé avec succès',
        data: course,
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
  @Roles('admin', 'scolarite', 'responsable_pedagogique', 'enseignant')
  @ApiOperation({ summary: 'Récupérer tous les cours' })
  @ApiResponse({ status: 200, description: 'Liste des cours récupérée avec succès' })
  async findAll(@Param('tid') tid: string) {
    try {
      const courses = await this.courseService.findAll(tid);
      return {
        success: true,
        message: 'Cours récupérés avec succès',
        data: courses,
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
  @Roles('admin', 'scolarite', 'responsable_pedagogique', 'enseignant')
  @ApiOperation({ summary: 'Rechercher des cours' })
  @ApiQuery({ name: 'q', description: 'Terme de recherche' })
  async search(
    @Param('tid') tid: string,
    @Query('q') query: string,
  ) {
    try {
      const courses = await this.courseService.search(tid, query);
      return {
        success: true,
        message: 'Recherche effectuée avec succès',
        data: courses,
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
  @Roles('admin', 'scolarite', 'responsable_pedagogique', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les cours par parcours' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  async getCoursesByParcours(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
  ) {
    try {
      const courses = await this.courseService.getCoursesByParcours(tid, parcoursId);
      return {
        success: true,
        message: 'Cours récupérés avec succès',
        data: courses,
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
  @Roles('admin', 'scolarite', 'responsable_pedagogique', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les cours par semestre' })
  @ApiParam({ name: 'semestre', description: 'Numéro du semestre' })
  async getCoursesBySemestre(
    @Param('tid') tid: string,
    @Param('semestre') semestre: number,
  ) {
    try {
      const courses = await this.courseService.getCoursesBySemestre(tid, semestre);
      return {
        success: true,
        message: 'Cours récupérés avec succès',
        data: courses,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('niveau/:niveau')
  @Roles('admin', 'scolarite', 'responsable_pedagogique', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les cours par niveau' })
  @ApiParam({ name: 'niveau', description: 'Numéro du niveau' })
  async getCoursesByNiveau(
    @Param('tid') tid: string,
    @Param('niveau') niveau: number,
  ) {
    try {
      const courses = await this.courseService.getCoursesByNiveau(tid, niveau);
      return {
        success: true,
        message: 'Cours récupérés avec succès',
        data: courses,
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
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  @ApiOperation({ summary: 'Récupérer les statistiques des cours' })
  async getStatistics(@Param('tid') tid: string) {
    try {
      const stats = await this.courseService.getStatistics(tid);
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
  @Roles('admin', 'scolarite', 'responsable_pedagogique', 'enseignant')
  @ApiOperation({ summary: 'Récupérer un cours par son ID' })
  @ApiParam({ name: 'id', description: 'ID du cours' })
  async findOne(@Param('tid') tid: string, @Param('id') id: string) {
    try {
      const course = await this.courseService.findOne(id);
      return {
        success: true,
        message: 'Cours récupéré avec succès',
        data: course,
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
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  @ApiOperation({ summary: 'Mettre à jour un cours' })
  @ApiParam({ name: 'id', description: 'ID du cours' })
  async update(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    try {
      const course = await this.courseService.update(id, updateCourseDto);
      return {
        success: true,
        message: 'Cours mis à jour avec succès',
        data: course,
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
  @Roles('admin', 'scolarite', 'responsable_pedagogique')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Supprimer un cours' })
  @ApiParam({ name: 'id', description: 'ID du cours' })
  async remove(@Param('tid') tid: string, @Param('id') id: string) {
    try {
      await this.courseService.remove(id);
      return {
        success: true,
        message: 'Cours supprimé avec succès',
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
