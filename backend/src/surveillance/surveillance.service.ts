import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { 
  SurveillantGeneral, 
  AppelNumerique, 
  IncidentDisciplinaire, 
  OrganisationExamen,
  RapportSurveillance 
} from './surveillance.entities';
import { CreateSurveillantDto } from './dto/create-surveillant.dto';
import { UpdateSurveillantDto } from './dto/update-surveillant.dto';

@Injectable()
export class SurveillanceService {
  constructor(
    @InjectRepository(SurveillantGeneral, 'tenant') private surveillantRepo: Repository<SurveillantGeneral>,
    @InjectRepository(AppelNumerique, 'tenant') private appelRepo: Repository<AppelNumerique>,
    @InjectRepository(IncidentDisciplinaire, 'tenant') private incidentRepo: Repository<IncidentDisciplinaire>,
    @InjectRepository(OrganisationExamen, 'tenant') private organisationRepo: Repository<OrganisationExamen>,
    @InjectRepository(RapportSurveillance, 'tenant') private rapportRepo: Repository<RapportSurveillance>,
    @InjectDataSource('tenant') private dataSource: DataSource,
  ) {}

  // ========== SURVEILLANTS GENERAUX ==========

  async createSurveillant(createDto: CreateSurveillantDto): Promise<SurveillantGeneral> {
    const surveillant = this.surveillantRepo.create(createDto);
    return this.surveillantRepo.save(surveillant);
  }

  async findAllSurveillants(): Promise<SurveillantGeneral[]> {
    return this.surveillantRepo.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOneSurveillant(id: string): Promise<SurveillantGeneral> {
    const surveillant = await this.surveillantRepo.findOne({ where: { id } });
    if (!surveillant) {
      throw new NotFoundException('Surveillant non trouvé');
    }
    return surveillant;
  }

  async updateSurveillant(id: string, updateDto: UpdateSurveillantDto): Promise<SurveillantGeneral> {
    const surveillant = await this.findOneSurveillant(id);
    Object.assign(surveillant, updateDto);
    return this.surveillantRepo.save(surveillant);
  }

  async removeSurveillant(id: string): Promise<void> {
    const surveillant = await this.findOneSurveillant(id);
    await this.surveillantRepo.remove(surveillant);
  }

  // ========== APPELS NUMERIQUES ==========

  async createAppel(createDto: any): Promise<AppelNumerique> {
    const appel = this.appelRepo.create(createDto) as unknown as AppelNumerique;
    return this.appelRepo.save(appel);
  }

  async findAllAppels(): Promise<AppelNumerique[]> {
    return this.appelRepo.find({
      relations: ['surveillant'],
      order: { date_appel: 'DESC' }
    });
  }

  async findOneAppel(id: string): Promise<AppelNumerique> {
    const appel = await this.appelRepo.findOne({ 
      where: { id },
      relations: ['surveillant']
    });
    if (!appel) {
      throw new NotFoundException('Appel non trouvé');
    }
    return appel;
  }

  async updateAppel(id: string, updateDto: any): Promise<AppelNumerique> {
    const appel = await this.findOneAppel(id);
    Object.assign(appel, updateDto);
    return this.appelRepo.save(appel);
  }

  async removeAppel(id: string): Promise<void> {
    const appel = await this.findOneAppel(id);
    await this.appelRepo.remove(appel);
  }

  // ========== INCIDENTS DISCIPLINAIRES ==========

  async createIncident(createDto: any): Promise<IncidentDisciplinaire> {
    const incident = this.incidentRepo.create(createDto) as unknown as IncidentDisciplinaire;
    return this.incidentRepo.save(incident);
  }

  async findAllIncidents(): Promise<IncidentDisciplinaire[]> {
    return this.incidentRepo.find({
      relations: ['surveillant'],
      order: { date_incident: 'DESC' }
    });
  }

  async findOneIncident(id: string): Promise<IncidentDisciplinaire> {
    const incident = await this.incidentRepo.findOne({ 
      where: { id },
      relations: ['surveillant']
    });
    if (!incident) {
      throw new NotFoundException('Incident non trouvé');
    }
    return incident;
  }

  async updateIncident(id: string, updateDto: any): Promise<IncidentDisciplinaire> {
    const incident = await this.findOneIncident(id);
    Object.assign(incident, updateDto);
    return this.incidentRepo.save(incident);
  }

  async removeIncident(id: string): Promise<void> {
    const incident = await this.findOneIncident(id);
    await this.incidentRepo.remove(incident);
  }

  // ========== ORGANISATIONS EXAMENS ==========

  async createOrganisation(createDto: any): Promise<OrganisationExamen> {
    const organisation = this.organisationRepo.create(createDto) as unknown as OrganisationExamen;
    return this.organisationRepo.save(organisation);
  }

  async findAllOrganisations(): Promise<OrganisationExamen[]> {
    return this.organisationRepo.find({
      relations: ['surveillant'],
      order: { date_examen: 'DESC' }
    });
  }

  async findOneOrganisation(id: string): Promise<OrganisationExamen> {
    const organisation = await this.organisationRepo.findOne({ 
      where: { id },
      relations: ['surveillant']
    });
    if (!organisation) {
      throw new NotFoundException('Organisation non trouvée');
    }
    return organisation;
  }

  async updateOrganisation(id: string, updateDto: any): Promise<OrganisationExamen> {
    const organisation = await this.findOneOrganisation(id);
    Object.assign(organisation, updateDto);
    return this.organisationRepo.save(organisation);
  }

  async removeOrganisation(id: string): Promise<void> {
    const organisation = await this.findOneOrganisation(id);
    await this.organisationRepo.remove(organisation);
  }

  // ========== RAPPORTS SURVEILLANCE ==========

  async createRapport(createDto: any): Promise<RapportSurveillance> {
    const rapport = this.rapportRepo.create(createDto) as unknown as RapportSurveillance;
    return this.rapportRepo.save(rapport);
  }

  async findAllRapports(): Promise<RapportSurveillance[]> {
    return this.rapportRepo.find({
      relations: ['surveillant'],
      order: { date_rapport: 'DESC' }
    });
  }

  async findOneRapport(id: string): Promise<RapportSurveillance> {
    const rapport = await this.rapportRepo.findOne({ 
      where: { id },
      relations: ['surveillant']
    });
    if (!rapport) {
      throw new NotFoundException('Rapport non trouvé');
    }
    return rapport;
  }

  async updateRapport(id: string, updateDto: any): Promise<RapportSurveillance> {
    const rapport = await this.findOneRapport(id);
    Object.assign(rapport, updateDto);
    return this.rapportRepo.save(rapport);
  }

  async removeRapport(id: string): Promise<void> {
    const rapport = await this.findOneRapport(id);
    await this.rapportRepo.remove(rapport);
  }

  // ========== DASHBOARD SURVEILLANT ==========

  async getDashboard(): Promise<any> {
    const [
      totalSurveillants,
      surveillantsActifs,
      totalAppels,
      appelsAujourdHui,
      totalIncidents,
      incidentsEnCours,
      totalOrganisations,
      examensAujourdHui,
      totalRapports,
      rapportsEnAttente
    ] = await Promise.all([
      this.surveillantRepo.count(),
      this.surveillantRepo.count({ where: { statut: 'actif' } }),
      this.appelRepo.count(),
      this.appelRepo.count({ 
        where: { 
          date_appel: new Date(),
          statut: 'termine'
        } 
      }),
      this.incidentRepo.count(),
      this.incidentRepo.count({ where: { statut: 'en_investigation' } }),
      this.organisationRepo.count(),
      this.organisationRepo.count({ 
        where: { 
          date_examen: new Date(),
          statut: 'en_cours'
        } 
      }),
      this.rapportRepo.count(),
      this.rapportRepo.count({ where: { statut: 'soumis' } })
    ]);

    return {
      surveillants: {
        total: totalSurveillants,
        actifs: surveillantsActifs,
        taux_activite: totalSurveillants > 0 ? (surveillantsActifs / totalSurveillants * 100).toFixed(1) : 0
      },
      appels: {
        total: totalAppels,
        aujourd_hui: appelsAujourdHui,
        taux_journalier: totalAppels > 0 ? (appelsAujourdHui / totalAppels * 100).toFixed(1) : 0
      },
      incidents: {
        total: totalIncidents,
        en_cours: incidentsEnCours,
        taux_resolution: totalIncidents > 0 ? ((totalIncidents - incidentsEnCours) / totalIncidents * 100).toFixed(1) : 0
      },
      examens: {
        total: totalOrganisations,
        aujourd_hui: examensAujourdHui,
        taux_journalier: totalOrganisations > 0 ? (examensAujourdHui / totalOrganisations * 100).toFixed(1) : 0
      },
      rapports: {
        total: totalRapports,
        en_attente: rapportsEnAttente,
        taux_soumission: totalRapports > 0 ? (rapportsEnAttente / totalRapports * 100).toFixed(1) : 0
      }
    };
  }
}
