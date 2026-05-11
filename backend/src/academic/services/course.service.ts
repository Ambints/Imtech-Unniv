import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { UniteEnseignement } from '../../scolarite/entities/unite-enseignement.entity';
import { CreateCourseDto } from '../dto/create-course.dto';
import { UpdateCourseDto } from '../dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(UniteEnseignement, 'tenant')
    private courseRepository: Repository<UniteEnseignement>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<UniteEnseignement> {
    // Vérifier si le code existe déjà
    const existingCourse = await this.courseRepository.findOne({
      where: { code: createCourseDto.code },
    });

    if (existingCourse) {
      throw new BadRequestException('Ce code de cours existe déjà');
    }

    const course = this.courseRepository.create(createCourseDto);
    return await this.courseRepository.save(course);
  }

  async findAll(tenantId: string): Promise<UniteEnseignement[]> {
    return await this.courseRepository.find({
      relations: ['parcours', 'elementsConstitutifs'],
      order: { code: 'ASC' },
    });
  }

  async search(tenantId: string, query: string): Promise<UniteEnseignement[]> {
    return await this.courseRepository.find({
      where: [
        { code: Like(`%${query}%`) },
        { intitule: Like(`%${query}%`) },
      ],
      relations: ['parcours', 'elementsConstitutifs'],
      order: { code: 'ASC' },
    });
  }

  async findOne(id: string): Promise<UniteEnseignement> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['parcours', 'elementsConstitutifs'],
    });

    if (!course) {
      throw new NotFoundException('Cours non trouvé');
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<UniteEnseignement> {
    const course = await this.findOne(id);

    // Si le code est modifié, vérifier qu'il n'existe pas déjà
    if (updateCourseDto.code && updateCourseDto.code !== course.code) {
      const existingCourse = await this.courseRepository.findOne({
        where: { code: updateCourseDto.code },
      });

      if (existingCourse) {
        throw new BadRequestException('Ce code de cours existe déjà');
      }
    }

    Object.assign(course, updateCourseDto);
    return await this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);

    // Vérifier si le cours est utilisé dans des inscriptions ou notes
    // Ajouter les vérifications nécessaires selon les relations

    await this.courseRepository.remove(course);
  }

  async getCoursesByParcours(tenantId: string, parcoursId: string): Promise<UniteEnseignement[]> {
    return await this.courseRepository.find({
      where: { parcoursId },
      relations: ['parcours', 'elementsConstitutifs'],
      order: { semestre: 'ASC', code: 'ASC' },
    });
  }

  async getCoursesBySemestre(tenantId: string, semestre: number): Promise<UniteEnseignement[]> {
    return await this.courseRepository.find({
      where: { semestre },
      relations: ['parcours', 'elementsConstitutifs'],
      order: { parcours: { nom: 'ASC' }, code: 'ASC' },
    });
  }

  async getCoursesByNiveau(tenantId: string, niveau: number): Promise<UniteEnseignement[]> {
    return await this.courseRepository.find({
      where: { anneeNiveau: niveau },
      relations: ['parcours', 'elementsConstitutifs'],
      order: { semestre: 'ASC', code: 'ASC' },
    });
  }

  async getStatistics(tenantId: string): Promise<any> {
    const total = await this.courseRepository.count();
    
    const statsByType = await this.courseRepository
      .createQueryBuilder('course')
      .select('course.typeUe', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('course.typeUe')
      .getRawMany();

    const statsBySemestre = await this.courseRepository
      .createQueryBuilder('course')
      .select('course.semestre', 'semestre')
      .addSelect('COUNT(*)', 'count')
      .groupBy('course.semestre')
      .getRawMany();

    const totalCredits = await this.courseRepository
      .createQueryBuilder('course')
      .select('SUM(course.creditsEcts)', 'total')
      .getRawOne();

    return {
      total,
      totalCredits: parseInt(totalCredits.total) || 0,
      parType: statsByType,
      parSemestre: statsBySemestre,
    };
  }
}
