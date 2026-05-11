import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { EmploiDuTemps } from '../entities/emploi-du-temps.entity';
import { Seance } from '../entities/seance.entity';
import { Parcours } from '../../scolarite/entities/parcours.entity';
import { CreateEmploiDuTempsDto } from '../dto/create-emploi-du-temps.dto';
import { UpdateEmploiDuTempsDto } from '../dto/update-emploi-du-temps.dto';

@Injectable()
export class EmploiDuTempsService {
  constructor(
    @InjectRepository(EmploiDuTemps, 'tenant')
    private emploiDuTempsRepository: Repository<EmploiDuTemps>,
    @InjectRepository(Seance, 'tenant')
    private seanceRepository: Repository<Seance>,
    @InjectRepository(Parcours, 'tenant')
    private parcoursRepository: Repository<Parcours>,
  ) {}

  async create(createEmploiDuTempsDto: CreateEmploiDuTempsDto): Promise<EmploiDuTemps> {
    // Vérifier si le parcours existe
    const parcours = await this.parcoursRepository.findOne({
      where: { id: createEmploiDuTempsDto.parcoursId },
    });

    if (!parcours) {
      throw new NotFoundException('Parcours non trouvé');
    }

    // Vérifier s'il existe déjà un EDT pour ce parcours, année académique et semestre
    const existingEDT = await this.emploiDuTempsRepository.findOne({
      where: {
        parcours: { id: createEmploiDuTempsDto.parcoursId },
        anneeAcademique: createEmploiDuTempsDto.anneeAcademique,
        semestre: createEmploiDuTempsDto.semestre,
      },
    });

    if (existingEDT) {
      throw new BadRequestException('Un emploi du temps existe déjà pour ce parcours, année académique et semestre');
    }

    const emploiDuTemps = this.emploiDuTempsRepository.create({
      titre: createEmploiDuTempsDto.titre,
      description: createEmploiDuTempsDto.description,
      anneeAcademique: createEmploiDuTempsDto.anneeAcademique,
      semestre: createEmploiDuTempsDto.semestre,
      parcours: { id: createEmploiDuTempsDto.parcoursId },
      publie: createEmploiDuTempsDto.publie || false
    });
    return await this.emploiDuTempsRepository.save(emploiDuTemps);
  }

  async findAll(tenantId: string): Promise<EmploiDuTemps[]> {
    return await this.emploiDuTempsRepository.find({
      relations: ['parcours', 'seances'],
      order: { createdAt: 'DESC' },
    });
  }

  async search(tenantId: string, query: string): Promise<EmploiDuTemps[]> {
    return await this.emploiDuTempsRepository.find({
      where: [
        { titre: Like(`%${query}%`) },
        { description: Like(`%${query}%`) },
        { anneeAcademique: Like(`%${query}%`) },
      ],
      relations: ['parcours', 'seances'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<EmploiDuTemps> {
    const emploiDuTemps = await this.emploiDuTempsRepository.findOne({
      where: { id },
      relations: ['parcours', 'seances'],
    });

    if (!emploiDuTemps) {
      throw new NotFoundException('Emploi du temps non trouvé');
    }

    return emploiDuTemps;
  }

  async update(id: string, updateEmploiDuTempsDto: UpdateEmploiDuTempsDto): Promise<EmploiDuTemps> {
    const emploiDuTemps = await this.findOne(id);

    Object.assign(emploiDuTemps, updateEmploiDuTempsDto);
    return await this.emploiDuTempsRepository.save(emploiDuTemps);
  }

  async remove(id: string): Promise<void> {
    const emploiDuTemps = await this.findOne(id);
    await this.emploiDuTempsRepository.remove(emploiDuTemps);
  }

  async getEmploiDuTempsByParcours(
    tenantId: string,
    parcoursId: string,
  ): Promise<EmploiDuTemps[]> {
    return await this.emploiDuTempsRepository.find({
      where: { parcours: { id: parcoursId } },
      relations: ['parcours', 'seances'],
      order: { anneeAcademique: 'DESC', semestre: 'ASC' },
    });
  }

  async getEmploiDuTempsByAnneeAcademique(
    tenantId: string,
    anneeAcademique: string,
  ): Promise<EmploiDuTemps[]> {
    return await this.emploiDuTempsRepository.find({
      where: { anneeAcademique },
      relations: ['parcours', 'seances'],
      order: { parcours: { id: 'ASC' }, semestre: 'ASC' },
    });
  }

  async getEmploiDuTempsBySemestre(tenantId: string, semestre: number): Promise<EmploiDuTemps[]> {
    return await this.emploiDuTempsRepository.find({
      where: { semestre },
      relations: ['parcours', 'seances'],
      order: { anneeAcademique: 'DESC', parcours: { id: 'ASC' } },
    });
  }

  async getPublishedEmploiDuTemps(tenantId: string): Promise<EmploiDuTemps[]> {
    return await this.emploiDuTempsRepository.find({
      where: { publie: true },
      relations: ['parcours', 'seances'],
      order: { createdAt: 'DESC' },
    });
  }

  async publishEmploiDuTemps(id: string): Promise<EmploiDuTemps> {
    const emploiDuTemps = await this.findOne(id);
    emploiDuTemps.publie = true;
    emploiDuTemps.datePublication = new Date();
    return await this.emploiDuTempsRepository.save(emploiDuTemps);
  }

  async unpublishEmploiDuTemps(id: string): Promise<EmploiDuTemps> {
    const emploiDuTemps = await this.findOne(id);
    emploiDuTemps.publie = false;
    emploiDuTemps.datePublication = null;
    return await this.emploiDuTempsRepository.save(emploiDuTemps);
  }

  async addSeanceToEmploiDuTemps(edtId: string, seanceId: string): Promise<EmploiDuTemps> {
    const emploiDuTemps = await this.findOne(edtId);
    const seance = await this.seanceRepository.findOne({ where: { id: seanceId } });

    if (!seance) {
      throw new NotFoundException('Séance non trouvée');
    }

    // Vérifier si la séance est déjà associée à cet EDT
    if (emploiDuTemps.seances && emploiDuTemps.seances.some(s => s.id === seanceId)) {
      throw new BadRequestException('Cette séance est déjà associée à cet emploi du temps');
    }

    if (!emploiDuTemps.seances) {
      emploiDuTemps.seances = [];
    }
    emploiDuTemps.seances.push(seance);

    return await this.emploiDuTempsRepository.save(emploiDuTemps);
  }

  async removeSeanceFromEmploiDuTemps(edtId: string, seanceId: string): Promise<EmploiDuTemps> {
    const emploiDuTemps = await this.findOne(edtId);

    if (!emploiDuTemps.seances) {
      return emploiDuTemps;
    }

    emploiDuTemps.seances = emploiDuTemps.seances.filter(s => s.id !== seanceId);
    return await this.emploiDuTempsRepository.save(emploiDuTemps);
  }

  async getStatistics(tenantId: string): Promise<any> {
    const total = await this.emploiDuTempsRepository.count();
    const published = await this.emploiDuTempsRepository.count({ where: { publie: true } });
    
    const statsByAnnee = await this.emploiDuTempsRepository
      .createQueryBuilder('edt')
      .select('edt.anneeAcademique', 'anneeAcademique')
      .addSelect('COUNT(*)', 'count')
      .groupBy('edt.anneeAcademique')
      .getRawMany();

    const statsBySemestre = await this.emploiDuTempsRepository
      .createQueryBuilder('edt')
      .select('edt.semestre', 'semestre')
      .addSelect('COUNT(*)', 'count')
      .groupBy('edt.semestre')
      .getRawMany();

    return {
      total,
      publies: published,
      nonPublies: total - published,
      parAnnee: statsByAnnee,
      parSemestre: statsBySemestre,
    };
  }

  async generateEmploiDuTempsPDF(id: string): Promise<any> {
    const emploiDuTemps = await this.findOne(id);
    
    // Logique de génération PDF à implémenter
    // Pour l'instant, retourner les données pour le PDF
    return {
      data: emploiDuTemps,
      filename: `emploi_du_temps_${emploiDuTemps.titre}_${new Date().toISOString().split('T')[0]}.pdf`,
    };
  }

  async exportEmploiDuTemps(id: string, format: 'pdf' | 'excel' | 'csv'): Promise<any> {
    const emploiDuTemps = await this.findOne(id);
    
    const exportData = {
      titre: emploiDuTemps.titre,
      description: emploiDuTemps.description,
      anneeAcademique: emploiDuTemps.anneeAcademique,
      semestre: emploiDuTemps.semestre,
      parcours: emploiDuTemps.parcours?.nom || '',
      publie: emploiDuTemps.publie,
      datePublication: emploiDuTemps.datePublication,
      seances: emploiDuTemps.seances?.map(seance => ({
        code: seance.code,
        intitule: seance.intitule,
        type: seance.type,
        dateDebut: seance.dateDebut,
        dateFin: seance.dateFin,
        salle: seance.salle?.nom || '',
        enseignant: seance.enseignant?.nom || '',
        ue: seance.ue?.intitule || '',
      })) || [],
    };

    return {
      data: exportData,
      format,
      filename: `emploi_du_temps_${emploiDuTemps.titre}_${new Date().toISOString().split('T')[0]}.${format}`,
    };
  }

  async duplicateEmploiDuTemps(id: string, newData: Partial<CreateEmploiDuTempsDto>): Promise<EmploiDuTemps> {
    const originalEDT = await this.findOne(id);
    
    const newEDT = this.emploiDuTempsRepository.create({
      titre: newData.titre || `${originalEDT.titre} (Copie)`,
      description: newData.description || originalEDT.description,
      anneeAcademique: newData.anneeAcademique || originalEDT.anneeAcademique,
      semestre: newData.semestre || originalEDT.semestre,
      parcours: { id: newData.parcoursId || originalEDT.parcours.id },
      publie: false, // Les copies ne sont pas publiées par défaut
    });

    return await this.emploiDuTempsRepository.save(newEDT);
  }
}
