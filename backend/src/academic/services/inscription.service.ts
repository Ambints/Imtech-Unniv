import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Inscription } from '../../scolarite/entities/inscription.entity';
import { Etudiant } from '../../scolarite/entities/etudiant.entity';
import { Parcours } from '../../scolarite/entities/parcours.entity';
import { CreateInscriptionDto } from '../dto/create-inscription.dto';
import { UpdateInscriptionDto } from '../dto/update-inscription.dto';

@Injectable()
export class InscriptionService {
  constructor(
    @InjectRepository(Inscription, 'tenant')
    private inscriptionRepository: Repository<Inscription>,
    @InjectRepository(Etudiant, 'tenant')
    private etudiantRepository: Repository<Etudiant>,
    @InjectRepository(Parcours, 'tenant')
    private parcoursRepository: Repository<Parcours>,
  ) {}

  async create(createInscriptionDto: CreateInscriptionDto): Promise<Inscription> {
    // Vérifier si l'étudiant existe
    const etudiant = await this.etudiantRepository.findOne({
      where: { id: createInscriptionDto.etudiantId },
    });

    if (!etudiant) {
      throw new NotFoundException('Étudiant non trouvé');
    }

    // Vérifier si le parcours existe
    const parcours = await this.parcoursRepository.findOne({
      where: { id: createInscriptionDto.parcoursId },
    });

    if (!parcours) {
      throw new NotFoundException('Parcours non trouvé');
    }

    // Vérifier si l'étudiant est déjà inscrit pour la même année académique
    const existingInscription = await this.inscriptionRepository.findOne({
      where: {
        etudiant: { id: createInscriptionDto.etudiantId },
        anneeAcademique: { id: createInscriptionDto.anneeAcademiqueId },
      },
    });

    if (existingInscription) {
      throw new BadRequestException('L\'étudiant est déjà inscrit pour cette année académique et ce semestre');
    }

    // Vérifier si l'étudiant est actif
    // Note: etudiant.statut est un getter basé sur etudiant.actif (boolean)
    if (!etudiant.actif) {
      throw new BadRequestException('Seuls les étudiants actifs peuvent être inscrits');
    }

    const inscription = this.inscriptionRepository.create({
      ...createInscriptionDto,
      etudiant: { id: createInscriptionDto.etudiantId },
      parcours: { id: createInscriptionDto.parcoursId },
      anneeAcademique: { id: createInscriptionDto.anneeAcademiqueId },
    });
    return await this.inscriptionRepository.save(inscription);
  }

  async findAll(tenantId: string): Promise<Inscription[]> {
    return await this.inscriptionRepository.find({
      relations: ['etudiant', 'parcours'],
      order: { dateInscription: 'DESC' },
    });
  }

  async search(tenantId: string, query: string): Promise<Inscription[]> {
    return await this.inscriptionRepository.find({
      where: [
        { anneeAcademique: Like(`%${query}%`) },
      ],
      relations: ['etudiant', 'parcours'],
      order: { dateInscription: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Inscription> {
    const inscription = await this.inscriptionRepository.findOne({
      where: { id },
      relations: ['etudiant', 'parcours'],
    });

    if (!inscription) {
      throw new NotFoundException('Inscription non trouvée');
    }

    return inscription;
  }

  async update(id: string, updateInscriptionDto: UpdateInscriptionDto): Promise<Inscription> {
    const inscription = await this.findOne(id);

    Object.assign(inscription, updateInscriptionDto);
    return await this.inscriptionRepository.save(inscription);
  }

  async remove(id: string): Promise<void> {
    const inscription = await this.findOne(id);
    await this.inscriptionRepository.remove(inscription);
  }

  async getInscriptionsByEtudiant(tenantId: string, etudiantId: string): Promise<Inscription[]> {
    return await this.inscriptionRepository.find({
      where: { etudiant: { id: etudiantId } },
      relations: ['etudiant', 'parcours'],
      order: { dateInscription: 'DESC' },
    });
  }

  async getInscriptionsByParcours(tenantId: string, parcoursId: string): Promise<Inscription[]> {
    return await this.inscriptionRepository.find({
      where: { parcours: { id: parcoursId } },
      relations: ['etudiant', 'parcours'],
      order: { dateInscription: 'DESC' },
    });
  }

  async getInscriptionsByAnneeAcademique(
    tenantId: string,
    anneeAcademiqueId: string,
  ): Promise<Inscription[]> {
    return await this.inscriptionRepository.find({
      where: { anneeAcademique: { id: anneeAcademiqueId } },
      relations: ['etudiant', 'parcours'],
      order: { dateInscription: 'DESC' },
    });
  }

  async getInscriptionsBySemestre(tenantId: string, semestre: number): Promise<Inscription[]> {
    // Note: semestre n'existe pas dans l'entité Inscription, cette méthode devra être adaptée
    // selon la structure réelle de l'entité
    return await this.inscriptionRepository.find({
      where: { parcours: { niveau: semestre.toString() } },
      relations: ['etudiant', 'parcours'],
      order: { dateInscription: 'DESC' },
    });
  }

  async getInscriptionsByStatut(tenantId: string, statut: string): Promise<Inscription[]> {
    return await this.inscriptionRepository.find({
      where: { statut: statut as any },
      relations: ['etudiant', 'parcours'],
      order: { dateInscription: 'DESC' },
    });
  }

  async updateInscriptionStatus(id: string, statut: string): Promise<Inscription> {
    const inscription = await this.findOne(id);
    inscription.statut = statut as any;
    return await this.inscriptionRepository.save(inscription);
  }

  async getStatistics(tenantId: string): Promise<any> {
    const total = await this.inscriptionRepository.count();
    
    const statsByStatut = await this.inscriptionRepository
      .createQueryBuilder('inscription')
      .select('inscription.statut', 'statut')
      .addSelect('COUNT(*)', 'count')
      .groupBy('inscription.statut')
      .getRawMany();

    const statsBySemestre = await this.inscriptionRepository
      .createQueryBuilder('inscription')
      .select('inscription.semestre', 'semestre')
      .addSelect('COUNT(*)', 'count')
      .groupBy('inscription.semestre')
      .getRawMany();

    const statsByAnnee = await this.inscriptionRepository
      .createQueryBuilder('inscription')
      .select('inscription.anneeAcademique', 'anneeAcademique')
      .addSelect('COUNT(*)', 'count')
      .groupBy('inscription.anneeAcademique')
      .getRawMany();

    const thisYear = new Date().getFullYear().toString();
    const newInscriptionsThisYear = await this.inscriptionRepository.count({
      where: { anneeAcademique: { id: thisYear } },
    });

    return {
      total,
      nouvellesCetteAnnee: newInscriptionsThisYear,
      parStatut: statsByStatut,
      parSemestre: statsBySemestre,
      parAnnee: statsByAnnee,
    };
  }

  async bulkCreate(createInscriptionDtos: CreateInscriptionDto[]): Promise<any> {
    const results = {
      success: 0,
      errors: [],
    };

    for (const inscriptionDto of createInscriptionDtos) {
      try {
        await this.create(inscriptionDto);
        results.success++;
      } catch (error) {
        results.errors.push({
          etudiantId: inscriptionDto.etudiantId,
          error: (error as any).message,
        });
      }
    }

    return results;
  }

  async getInscriptionsByDateRange(
    tenantId: string,
    dateDebut: Date,
    dateFin: Date,
  ): Promise<Inscription[]> {
    return await this.inscriptionRepository.find({
      where: {
        dateInscription: Between(dateDebut, dateFin),
      },
      relations: ['etudiant', 'parcours'],
      order: { dateInscription: 'DESC' },
    });
  }

  async exportInscriptions(tenantId: string, format: 'csv' | 'excel' | 'pdf'): Promise<any> {
    const inscriptions = await this.findAll(tenantId);
    
    // Formatage des données pour l'export
    const exportData = inscriptions.map(inscription => ({
      id: inscription.id,
      matricule: inscription.etudiant?.matricule || '',
      nomEtudiant: `${inscription.etudiant?.nom || ''} ${inscription.etudiant?.prenoms || ''}`,
      email: inscription.etudiant?.email || '',
      parcours: inscription.parcours?.nom || '',
      anneeAcademique: inscription.anneeAcademique?.id || '',
      // Note: semestre et niveau n'existent pas dans l'entité Inscription
      // Ces propriétés devront être adaptées selon la structure réelle
      statut: inscription.statut,
      dateInscription: inscription.dateInscription,
    }));

    return {
      data: exportData,
      format,
      filename: `inscriptions_${new Date().toISOString().split('T')[0]}.${format}`,
    };
  }
}
