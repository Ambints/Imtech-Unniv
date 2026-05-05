import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident, Sanction, Avertissement } from './discipline.entities';

@Injectable()
export class DisciplineService {
  private readonly logger = new Logger(DisciplineService.name);

  constructor(
    @InjectRepository(Incident) private incidentRepo: Repository<Incident>,
    @InjectRepository(Sanction) private sanctionRepo: Repository<Sanction>,
    @InjectRepository(Avertissement) private avertissementRepo: Repository<Avertissement>,
  ) {}

  // ========== INCIDENTS ==========
  async createIncident(data: Partial<Incident>): Promise<Incident> {
    const incident = this.incidentRepo.create(data);
    return this.incidentRepo.save(incident);
  }

  async findAllIncidents(filters?: { etudiantId?: string; statut?: string; gravite?: string }): Promise<Incident[]> {
    const query = this.incidentRepo.createQueryBuilder('i');
    if (filters?.etudiantId) query.andWhere('i.etudiantId = :etudiantId', { etudiantId: filters.etudiantId });
    if (filters?.statut) query.andWhere('i.statut = :statut', { statut: filters.statut });
    if (filters?.gravite) query.andWhere('i.gravite = :gravite', { gravite: filters.gravite });
    return query.orderBy('i.dateIncident', 'DESC').getMany();
  }

  async findIncidentById(id: string): Promise<Incident> {
    const incident = await this.incidentRepo.findOne({ where: { id } });
    if (!incident) throw new NotFoundException('Incident non trouvé');
    return incident;
  }

  async validerIncident(id: string, validePar: string): Promise<Incident> {
    await this.incidentRepo.update(id, { statut: 'valide', validePar, dateValidation: new Date() });
    return this.findIncidentById(id);
  }

  // ========== SANCTIONS ==========
  async createSanction(data: Partial<Sanction>): Promise<Sanction> {
    const sanction = this.sanctionRepo.create(data);
    return this.sanctionRepo.save(sanction);
  }

  async findAllSanctions(filters?: { etudiantId?: string; statut?: string }): Promise<Sanction[]> {
    const query = this.sanctionRepo.createQueryBuilder('s');
    if (filters?.etudiantId) query.andWhere('s.etudiantId = :etudiantId', { etudiantId: filters.etudiantId });
    if (filters?.statut) query.andWhere('s.statut = :statut', { statut: filters.statut });
    return query.orderBy('s.dateDebut', 'DESC').getMany();
  }

  async findActiveSanctionsByStudent(etudiantId: string): Promise<Sanction[]> {
    return this.sanctionRepo.find({
      where: { etudiantId, statut: 'en_cours' },
      order: { dateDebut: 'DESC' },
    });
  }

  // ========== AVERTISSEMENTS ==========
  async createAvertissement(data: Partial<Avertissement>): Promise<Avertissement> {
    const count = await this.avertissementRepo.count({
      where: { etudiantId: data.etudiantId, statut: 'actif' },
    });
    const avertissement = this.avertissementRepo.create({ ...data, niveau: count + 1 });
    return this.avertissementRepo.save(avertissement);
  }

  async findAvertissementsByStudent(etudiantId: string): Promise<Avertissement[]> {
    return this.avertissementRepo.find({
      where: { etudiantId },
      order: { niveau: 'ASC' },
    });
  }

  // ========== DASHBOARD ==========
  async getDisciplineStats(): Promise<any> {
    const [totalIncidents, incidentsEnAttente, sanctionsEnCours, avertissementsActifs] = await Promise.all([
      this.incidentRepo.count(),
      this.incidentRepo.count({ where: { statut: 'en_attente' } }),
      this.sanctionRepo.count({ where: { statut: 'en_cours' } }),
      this.avertissementRepo.count({ where: { statut: 'actif' } }),
    ]);

    return {
      totalIncidents,
      incidentsEnAttente,
      sanctionsEnCours,
      avertissementsActifs,
    };
  }
}
