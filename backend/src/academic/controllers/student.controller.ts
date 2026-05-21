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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { StudentService } from '../services/student.service';
import { CreateStudentDto } from '../dto/create-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';

@ApiTags('Étudiants')
@Controller('academic/:tid/etudiants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @Roles('admin', 'scolarite', 'secretaire')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Créer un nouvel étudiant' })
  @ApiResponse({ status: 201, description: 'Étudiant créé avec succès' })
  async create(
    @Param('tid') tid: string,
    @Body() createStudentDto: CreateStudentDto,
  ) {
    try {
      const student = await this.studentService.create(createStudentDto);
      return {
        success: true,
        message: 'Étudiant créé avec succès',
        data: student,
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
  @ApiOperation({ summary: 'Récupérer tous les étudiants' })
  @ApiResponse({ status: 200, description: 'Liste des étudiants récupérée avec succès' })
  async findAll(@Param('tid') tid: string) {
    try {
      const students = await this.studentService.findAll(tid);
      return {
        success: true,
        message: 'Étudiants récupérés avec succès',
        data: students,
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
  @ApiOperation({ summary: 'Rechercher des étudiants' })
  @ApiQuery({ name: 'q', description: 'Terme de recherche' })
  async search(
    @Param('tid') tid: string,
    @Query('q') query: string,
  ) {
    try {
      const students = await this.studentService.search(tid, query);
      return {
        success: true,
        message: 'Recherche effectuée avec succès',
        data: students,
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
  @ApiOperation({ summary: 'Récupérer les étudiants par parcours' })
  @ApiParam({ name: 'parcoursId', description: 'ID du parcours' })
  async getStudentsByParcours(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
  ) {
    try {
      const students = await this.studentService.getStudentsByParcours(tid, parcoursId);
      return {
        success: true,
        message: 'Étudiants récupérés avec succès',
        data: students,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('status/:statut')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les étudiants par statut' })
  @ApiParam({ name: 'statut', description: 'Statut de l\'étudiant' })
  async getStudentsByStatus(
    @Param('tid') tid: string,
    @Param('statut') statut: string,
  ) {
    try {
      const students = await this.studentService.getStudentsByStatus(tid, statut);
      return {
        success: true,
        message: 'Étudiants récupérés avec succès',
        data: students,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('actifs')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les étudiants actifs' })
  async getActiveStudents(@Param('tid') tid: string) {
    try {
      const students = await this.studentService.getActiveStudents(tid);
      return {
        success: true,
        message: 'Étudiants actifs récupérés avec succès',
        data: students,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as any).message,
        data: [],
      };
    }
  }

  @Get('diplomes')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer les étudiants diplômés' })
  async getGraduatedStudents(@Param('tid') tid: string) {
    try {
      const students = await this.studentService.getGraduatedStudents(tid);
      return {
        success: true,
        message: 'Étudiants diplômés récupérés avec succès',
        data: students,
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
  @ApiOperation({ summary: 'Récupérer les statistiques des étudiants' })
  async getStatistics(@Param('tid') tid: string) {
    try {
      const stats = await this.studentService.getStatistics(tid);
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
  @ApiOperation({ summary: 'Exporter les étudiants' })
  @ApiQuery({ name: 'format', description: 'Format d\'export (csv, excel, pdf)' })
  async exportStudents(
    @Param('tid') tid: string,
    @Query('format') format: 'csv' | 'excel' | 'pdf' = 'csv',
  ) {
    try {
      const exportData = await this.studentService.exportStudents(tid, format);
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

  @Post('import')
  @Roles('admin', 'scolarite')
  @ApiOperation({ summary: 'Importer des étudiants' })
  async importStudents(
    @Param('tid') tid: string,
    @Body() body: { students: any[] },
  ) {
    try {
      const results = await this.studentService.importStudents(tid, body.students);
      return {
        success: true,
        message: 'Import terminé',
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

  @Get(':id')
  @Roles('admin', 'scolarite', 'secretaire', 'enseignant')
  @ApiOperation({ summary: 'Récupérer un étudiant par son ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'étudiant' })
  async findOne(@Param('tid') tid: string, @Param('id') id: string) {
    try {
      const student = await this.studentService.findOne(id);
      return {
        success: true,
        message: 'Étudiant récupéré avec succès',
        data: student,
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
  @ApiOperation({ summary: 'Mettre à jour un étudiant' })
  @ApiParam({ name: 'id', description: 'ID de l\'étudiant' })
  async update(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    try {
      const student = await this.studentService.update(id, updateStudentDto);
      return {
        success: true,
        message: 'Étudiant mis à jour avec succès',
        data: student,
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
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un étudiant' })
  @ApiParam({ name: 'id', description: 'ID de l\'étudiant' })
  async updateStudentStatus(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() body: { statut: string },
  ) {
    try {
      const student = await this.studentService.updateStudentStatus(id, body.statut);
      return {
        success: true,
        message: 'Statut mis à jour avec succès',
        data: student,
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
  @ApiOperation({ summary: 'Supprimer un étudiant' })
  @ApiParam({ name: 'id', description: 'ID de l\'étudiant' })
  async remove(@Param('tid') tid: string, @Param('id') id: string) {
    try {
      await this.studentService.remove(id);
      return {
        success: true,
        message: 'Étudiant supprimé avec succès',
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
