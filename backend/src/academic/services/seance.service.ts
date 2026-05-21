import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Seance } from '../entities/seance.entity';
import { CreateSeanceDto } from '../dto/create-seance.dto';
import { UpdateSeanceDto } from '../dto/update-seance.dto';

@Injectable()
export class SeanceService {
  constructor(
    @InjectRepository(Seance, 'tenant')
    private seanceRepository: Repository<Seance>,
  ) {}

  async create(createSeanceDto: CreateSeanceDto): Promise<Seance> {
    // Vérifier si le code existe déjà
    const existingSeance = await this.seanceRepository.findOne({
      where: { code: createSeanceDto.code },
    });

    if (existingSeance) {
      throw new BadRequestException('Ce code de séance existe déjà');
    }

    // Vérifier la cohérence des dates
    if (new Date(createSeanceDto.dateDebut) >= new Date(createSeanceDto.dateFin)) {
      throw new BadRequestException('La date de fin doit être postérieure à la date de début');
    }

    const seance = this.seanceRepository.create(createSeanceDto);
    return await this.seanceRepository.save(seance);
  }

  async findAll(tenantId: string): Promise<Seance[]> {
    return await this.seanceRepository.find({
      relations: ['salle', 'enseignant', 'ue', 'parcours'],
      order: { dateDebut: 'ASC' },
    });
  }

  async search(tenantId: string, query: string): Promise<Seance[]> {
    return await this.seanceRepository.find({
      where: [
        { code: Like(`%${query}%`) },
        { intitule: Like(`%${query}%`) },
      ],
      relations: ['salle', 'enseignant', 'ue', 'parcours'],
      order: { dateDebut: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Seance> {
    const seance = await this.seanceRepository.findOne({
      where: { id },
      relations: ['salle', 'enseignant', 'ue', 'parcours'],
    });

    if (!seance) {
      throw new NotFoundException('Séance non trouvée');
    }

    return seance;
  }

  async update(id: string, updateSeanceDto: UpdateSeanceDto): Promise<Seance> {
    const seance = await this.findOne(id);

    // Si le code est modifié, vérifier qu'il n'existe pas déjà
    if (updateSeanceDto.code && updateSeanceDto.code !== seance.code) {
      const existingSeance = await this.seanceRepository.findOne({
        where: { code: updateSeanceDto.code },
      });

      if (existingSeance) {
        throw new BadRequestException('Ce code de séance existe déjà');
      }
    }

    // Vérifier la cohérence des dates si elles sont modifiées
    if (updateSeanceDto.dateDebut && updateSeanceDto.dateFin) {
      if (new Date(updateSeanceDto.dateDebut) >= new Date(updateSeanceDto.dateFin)) {
        throw new BadRequestException('La date de fin doit être postérieure à la date de début');
      }
    }

    Object.assign(seance, updateSeanceDto);
    return await this.seanceRepository.save(seance);
  }

  async remove(id: string): Promise<void> {
    const seance = await this.findOne(id);
    await this.seanceRepository.remove(seance);
  }

  async getSeancesByDate(tenantId: string, date: Date): Promise<Seance[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.seanceRepository.find({
      where: {
        dateDebut: Between(startOfDay, endOfDay),
      },
      relations: ['salle', 'enseignant', 'ue', 'parcours'],
      order: { dateDebut: 'ASC' },
    });
  }

  async getSeancesBySalle(tenantId: string, salleId: string): Promise<Seance[]> {
    return await this.seanceRepository.find({
      where: { salle: { id: salleId } },
      relations: ['salle', 'enseignant', 'ue', 'parcours'],
      order: { dateDebut: 'ASC' },
    });
  }

  async getSeancesByEnseignant(tenantId: string, enseignantId: string): Promise<Seance[]> {
    return await this.seanceRepository.find({
      where: { enseignant: { id: enseignantId } },
      relations: ['salle', 'enseignant', 'ue', 'parcours'],
      order: { dateDebut: 'ASC' },
    });
  }

  async getSeancesByUE(tenantId: string, ueId: string): Promise<Seance[]> {
    return await this.seanceRepository.find({
      where: { ue: { id: ueId } },
      relations: ['salle', 'enseignant', 'ue', 'parcours'],
      order: { dateDebut: 'ASC' },
    });
  }

  async getSeancesByParcours(tenantId: string, parcoursId: string): Promise<Seance[]> {
    return await this.seanceRepository.find({
      where: { parcours: { id: parcoursId } },
      relations: ['salle', 'enseignant', 'ue', 'parcours'],
      order: { dateDebut: 'ASC' },
    });
  }

  async getSeancesByDateRange(
    tenantId: string,
    dateDebut: Date,
    dateFin: Date
  ): Promise<Seance[]> {
    return await this.seanceRepository.find({
      where: {
        dateDebut: Between(dateDebut, dateFin),
      },
      relations: ['salle', 'enseignant', 'ue', 'parcours'],
      order: { dateDebut: 'ASC' },
    });
  }

  async checkSalleDisponibilite(
    salleId: string,
    dateDebut: Date,
    dateFin: Date,
    excludeSeanceId?: string
  ): Promise<boolean> {
    const query = this.seanceRepository
      .createQueryBuilder('seance')
      .where('seance.salleId = :salleId', { salleId })
      .andWhere('seance.dateDebut < :dateFin AND seance.dateFin > :dateDebut', {
        dateDebut,
        dateFin,
      });

    if (excludeSeanceId) {
      query.andWhere('seance.id != :excludeSeanceId', { excludeSeanceId });
    }

    const conflictingSeances = await query.getMany();
    return conflictingSeances.length === 0;
  }

  async getSeancesConflicts(tenantId: string): Promise<Seance[]> {
    // Récupérer toutes les séances avec conflits
    const seances = await this.seanceRepository.find({
      relations: ['salle', 'enseignant', 'ue', 'parcours'],
    });

    const conflicts: Seance[] = [];

    for (const seance of seances) {
      // Vérifier les conflits de salle
      const salleConflict = await this.seanceRepository
        .createQueryBuilder('seance')
        .where('seance.salleId = :salleId', { salleId: seance.salle?.id })
        .andWhere('seance.dateDebut < :dateFin AND seance.dateFin > :dateDebut', {
          dateDebut: seance.dateDebut,
          dateFin: seance.dateFin,
        })
        .andWhere('seance.id != :id', { id: seance.id })
        .getOne();

      if (salleConflict) {
        conflicts.push(seance);
        continue;
      }

      // Vérifier les conflits d'enseignant
      if (seance.enseignant?.id) {
        const enseignantConflict = await this.seanceRepository
          .createQueryBuilder('seance')
          .where('seance.enseignantId = :enseignantId', { enseignantId: seance.enseignant?.id })
          .andWhere('seance.dateDebut < :dateFin AND seance.dateFin > :dateDebut', {
            dateDebut: seance.dateDebut,
            dateFin: seance.dateFin,
          })
          .andWhere('seance.id != :id', { id: seance.id })
          .getOne();

        if (enseignantConflict) {
          conflicts.push(seance);
        }
      }
    }

    return conflicts;
  }

  async getStatistics(tenantId: string): Promise<any> {
    const total = await this.seanceRepository.count();
    const actives = await this.seanceRepository.count({ where: { actif: true } });
    
    const statsByType = await this.seanceRepository
      .createQueryBuilder('seance')
      .select('seance.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('seance.type')
      .getRawMany();

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const thisWeek = await this.seanceRepository.count({
      where: {
        dateDebut: Between(startOfWeek, endOfWeek),
      },
    });

    return {
      total,
      actives,
      inactives: total - actives,
      cetteSemaine: thisWeek,
      parType: statsByType,
    };
  }
}
