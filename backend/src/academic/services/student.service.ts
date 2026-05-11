import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual } from 'typeorm';
import { Etudiant } from '../../scolarite/entities/etudiant.entity';
import { Inscription } from '../../scolarite/entities/inscription.entity';
import { CreateStudentDto } from '../dto/create-student.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Etudiant, 'tenant')
    private studentRepository: Repository<Etudiant>,
    @InjectRepository(Inscription, 'tenant')
    private inscriptionRepository: Repository<Inscription>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Etudiant> {
    // Vérifier si le matricule existe déjà
    const existingStudent = await this.studentRepository.findOne({
      where: { matricule: createStudentDto.matricule },
    });

    if (existingStudent) {
      throw new BadRequestException('Ce matricule existe déjà');
    }

    // Vérifier si l'email existe déjà
    const existingEmail = await this.studentRepository.findOne({
      where: { email: createStudentDto.email },
    });

    if (existingEmail) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    const student = this.studentRepository.create(createStudentDto);
    return await this.studentRepository.save(student);
  }

  async findAll(tenantId: string): Promise<Etudiant[]> {
    return await this.studentRepository.find({
      relations: ['parcours', 'inscriptions'],
      order: { nom: 'ASC', prenoms: 'ASC' },
    });
  }

  async search(tenantId: string, query: string): Promise<Etudiant[]> {
    return await this.studentRepository.find({
      where: [
        { matricule: Like(`%${query}%`) },
        { nom: Like(`%${query}%`) },
        { prenoms: Like(`%${query}%`) },
        { email: Like(`%${query}%`) },
      ],
      relations: ['parcours', 'inscriptions'],
      order: { nom: 'ASC', prenoms: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Etudiant> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['parcours', 'inscriptions'],
    });

    if (!student) {
      throw new NotFoundException('Étudiant non trouvé');
    }

    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Etudiant> {
    const student = await this.findOne(id);

    // Si le matricule est modifié, vérifier qu'il n'existe pas déjà
    if (updateStudentDto.matricule && updateStudentDto.matricule !== student.matricule) {
      const existingStudent = await this.studentRepository.findOne({
        where: { matricule: updateStudentDto.matricule },
      });

      if (existingStudent) {
        throw new BadRequestException('Ce matricule existe déjà');
      }
    }

    // Si l'email est modifié, vérifier qu'il n'existe pas déjà
    if (updateStudentDto.email && updateStudentDto.email !== student.email) {
      const existingEmail = await this.studentRepository.findOne({
        where: { email: updateStudentDto.email },
      });

      if (existingEmail) {
        throw new BadRequestException('Cet email est déjà utilisé');
      }
    }

    Object.assign(student, updateStudentDto);
    return await this.studentRepository.save(student);
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);

    // Vérifier si l'étudiant a des inscriptions
    const inscriptionCount = await this.inscriptionRepository.count({
      where: { etudiantId: id },
    });

    if (inscriptionCount > 0) {
      throw new BadRequestException('Impossible de supprimer cet étudiant car il a des inscriptions');
    }

    await this.studentRepository.remove(student);
  }

  async getStudentsByParcours(tenantId: string, parcoursId: string): Promise<Etudiant[]> {
    return await this.studentRepository.find({
      where: { parcoursId },
      relations: ['parcours', 'inscriptions'],
      order: { nom: 'ASC', prenoms: 'ASC' },
    });
  }

  async getStudentsByStatus(tenantId: string, statut: string): Promise<Etudiant[]> {
    // Note: La DB utilise 'actif' (boolean), pas 'statut' (string)
    const actif = statut === 'actif';
    return await this.studentRepository.find({
      where: { actif },
      relations: ['parcours', 'inscriptions'],
      order: { nom: 'ASC', prenoms: 'ASC' },
    });
  }

  async getActiveStudents(tenantId: string): Promise<Etudiant[]> {
    return await this.studentRepository.find({
      where: { actif: true },
      relations: ['parcours', 'inscriptions'],
      order: { nom: 'ASC', prenoms: 'ASC' },
    });
  }

  async getGraduatedStudents(tenantId: string): Promise<Etudiant[]> {
    // Les diplômés ne sont pas marqués dans la table etudiant
    // On pourrait les chercher via la table diplome
    return await this.studentRepository.find({
      where: { actif: false },
      relations: ['parcours', 'inscriptions', 'diplomes'],
      order: { nom: 'ASC', prenoms: 'ASC' },
    });
  }

  async updateStudentStatus(id: string, statut: string): Promise<Etudiant> {
    const student = await this.findOne(id);
    student.actif = statut === 'actif';
    return await this.studentRepository.save(student);
  }

  async getStatistics(tenantId: string): Promise<any> {
    const total = await this.studentRepository.count();
    
    const statsByStatus = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.statut', 'statut')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.statut')
      .getRawMany();

    const statsByBourse = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.typeBourse', 'typeBourse')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.typeBourse')
      .getRawMany();

    const statsBySexe = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.sexe', 'sexe')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.sexe')
      .getRawMany();

    const thisYear = new Date().getFullYear();
    const newStudentsThisYear = await this.studentRepository.count({
      where: {
        dateInscription: MoreThanOrEqual(new Date(thisYear, 0, 1)),
      },
    });

    return {
      total,
      nouveauxCetteAnnee: newStudentsThisYear,
      parStatut: statsByStatus,
      parBourse: statsByBourse,
      parSexe: statsBySexe,
    };
  }

  async exportStudents(tenantId: string, format: 'csv' | 'excel' | 'pdf'): Promise<any> {
    const students = await this.findAll(tenantId);
    
    // Formatage des données pour l'export
    const exportData = students.map(student => ({
      matricule: student.matricule,
      nom: student.nom,
      prenoms: student.prenoms,
      dateNaissance: student.dateNaissance,
      lieuNaissance: student.lieuNaissance,
      sexe: student.sexe,
      email: student.email,
      telephone: student.telephone,
      adresse: student.adresse,
      nationalite: student.nationalite,
      typeBourse: student.typeBourse,
      situationFamiliale: student.situationFamiliale,
      statut: student.statut, // Getter basé sur actif
      parcours: student.parcours?.nom || '',
    }));

    return {
      data: exportData,
      format,
      filename: `etudiants_${new Date().toISOString().split('T')[0]}.${format}`,
    };
  }

  async importStudents(tenantId: string, studentsData: any[]): Promise<any> {
    const results = {
      success: 0,
      errors: [],
    };

    for (const studentData of studentsData) {
      try {
        await this.create(studentData);
        results.success++;
      } catch (error) {
        results.errors.push({
          matricule: studentData.matricule,
          error: (error as any).message,
        });
      }
    }

    return results;
  }
}
