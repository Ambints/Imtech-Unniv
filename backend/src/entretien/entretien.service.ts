import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { 
  ResponsableLogistique, 
  ServiceEntretien, 
  PlanningNettoyage, 
  StockProduitsMenage,
  MaintenancePreventive,
  RapportEntretien 
} from './entretien.entities';
import { CreateResponsableDto } from './dto/create-responsable.dto';
import { UpdateResponsableDto } from './dto/update-responsable.dto';

@Injectable()
export class EntretienService {
  constructor(
    @InjectRepository(ResponsableLogistique, 'tenant') private responsableRepo: Repository<ResponsableLogistique>,
    @InjectRepository(ServiceEntretien, 'tenant') private serviceRepo: Repository<ServiceEntretien>,
    @InjectRepository(PlanningNettoyage, 'tenant') private planningRepo: Repository<PlanningNettoyage>,
    @InjectRepository(StockProduitsMenage, 'tenant') private stockRepo: Repository<StockProduitsMenage>,
    @InjectRepository(MaintenancePreventive, 'tenant') private maintenanceRepo: Repository<MaintenancePreventive>,
    @InjectRepository(RapportEntretien, 'tenant') private rapportRepo: Repository<RapportEntretien>,
    @InjectDataSource('tenant') private dataSource: DataSource,
  ) {}

  // ========== RESPONSABLES LOGISTIQUE ==========

  async createResponsable(createDto: CreateResponsableDto): Promise<ResponsableLogistique> {
    const responsable = this.responsableRepo.create(createDto);
    return this.responsableRepo.save(responsable);
  }

  async findAllResponsables(): Promise<ResponsableLogistique[]> {
    return this.responsableRepo.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOneResponsable(id: string): Promise<ResponsableLogistique> {
    const responsable = await this.responsableRepo.findOne({ where: { id } });
    if (!responsable) {
      throw new NotFoundException('Responsable non trouvé');
    }
    return responsable;
  }

  async updateResponsable(id: string, updateDto: UpdateResponsableDto): Promise<ResponsableLogistique> {
    const responsable = await this.findOneResponsable(id);
    Object.assign(responsable, updateDto);
    return this.responsableRepo.save(responsable);
  }

  async removeResponsable(id: string): Promise<void> {
    const responsable = await this.findOneResponsable(id);
    await this.responsableRepo.remove(responsable);
  }

  // ========== SERVICES ENTRETIEN ==========

  async createService(createDto: any): Promise<ServiceEntretien> {
    const service = this.serviceRepo.create(createDto) as unknown as ServiceEntretien;
    return this.serviceRepo.save(service);
  }

  async findAllServices(): Promise<ServiceEntretien[]> {
    return this.serviceRepo.find({
      relations: ['responsable'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOneService(id: string): Promise<ServiceEntretien> {
    const service = await this.serviceRepo.findOne({ 
      where: { id },
      relations: ['responsable']
    });
    if (!service) {
      throw new NotFoundException('Service non trouvé');
    }
    return service;
  }

  async updateService(id: string, updateDto: any): Promise<ServiceEntretien> {
    const service = await this.findOneService(id);
    Object.assign(service, updateDto);
    return this.serviceRepo.save(service);
  }

  async removeService(id: string): Promise<void> {
    const service = await this.findOneService(id);
    await this.serviceRepo.remove(service);
  }

  // ========== PLANNINGS NETTOYAGE ==========

  async createPlanning(createDto: any): Promise<PlanningNettoyage> {
    const planning = this.planningRepo.create(createDto) as unknown as PlanningNettoyage;
    return this.planningRepo.save(planning);
  }

  async findAllPlannings(): Promise<PlanningNettoyage[]> {
    return this.planningRepo.find({
      relations: ['responsable', 'service', 'stocks'],
      order: { date_nettoyage: 'DESC' }
    });
  }

  async findOnePlanning(id: string): Promise<PlanningNettoyage> {
    const planning = await this.planningRepo.findOne({ 
      where: { id },
      relations: ['responsable', 'service', 'stocks']
    });
    if (!planning) {
      throw new NotFoundException('Planning non trouvé');
    }
    return planning;
  }

  async updatePlanning(id: string, updateDto: any): Promise<PlanningNettoyage> {
    const planning = await this.findOnePlanning(id);
    Object.assign(planning, updateDto);
    return this.planningRepo.save(planning);
  }

  async removePlanning(id: string): Promise<void> {
    const planning = await this.findOnePlanning(id);
    await this.planningRepo.remove(planning);
  }

  // ========== STOCKS PRODUITS MENAGE ==========

  async createStock(createDto: any): Promise<StockProduitsMenage> {
    const stock = this.stockRepo.create(createDto) as unknown as StockProduitsMenage;
    return this.stockRepo.save(stock);
  }

  async findAllStocks(): Promise<StockProduitsMenage[]> {
    return this.stockRepo.find({
      relations: ['plannings'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOneStock(id: string): Promise<StockProduitsMenage> {
    const stock = await this.stockRepo.findOne({ 
      where: { id },
      relations: ['plannings']
    });
    if (!stock) {
      throw new NotFoundException('Stock non trouvé');
    }
    return stock;
  }

  async updateStock(id: string, updateDto: any): Promise<StockProduitsMenage> {
    const stock = await this.findOneStock(id);
    Object.assign(stock, updateDto);
    return this.stockRepo.save(stock);
  }

  async removeStock(id: string): Promise<void> {
    const stock = await this.findOneStock(id);
    await this.stockRepo.remove(stock);
  }

  // ========== MAINTENANCES PREVENTIVES ==========

  async createMaintenance(createDto: any): Promise<MaintenancePreventive> {
    const maintenance = this.maintenanceRepo.create(createDto) as unknown as MaintenancePreventive;
    return this.maintenanceRepo.save(maintenance);
  }

  async findAllMaintenances(): Promise<MaintenancePreventive[]> {
    return this.maintenanceRepo.find({
      relations: ['responsable', 'service'],
      order: { date_maintenance: 'DESC' }
    });
  }

  async findOneMaintenance(id: string): Promise<MaintenancePreventive> {
    const maintenance = await this.maintenanceRepo.findOne({ 
      where: { id },
      relations: ['responsable', 'service']
    });
    if (!maintenance) {
      throw new NotFoundException('Maintenance non trouvée');
    }
    return maintenance;
  }

  async updateMaintenance(id: string, updateDto: any): Promise<MaintenancePreventive> {
    const maintenance = await this.findOneMaintenance(id);
    Object.assign(maintenance, updateDto);
    return this.maintenanceRepo.save(maintenance);
  }

  async removeMaintenance(id: string): Promise<void> {
    const maintenance = await this.findOneMaintenance(id);
    await this.maintenanceRepo.remove(maintenance);
  }

  // ========== RAPPORTS ENTRETIEN ==========

  async createRapport(createDto: any): Promise<RapportEntretien> {
    const rapport = this.rapportRepo.create(createDto) as unknown as RapportEntretien;
    return this.rapportRepo.save(rapport);
  }

  async findAllRapports(): Promise<RapportEntretien[]> {
    return this.rapportRepo.find({
      relations: ['responsable'],
      order: { date_rapport: 'DESC' }
    });
  }

  async findOneRapport(id: string): Promise<RapportEntretien> {
    const rapport = await this.rapportRepo.findOne({ 
      where: { id },
      relations: ['responsable']
    });
    if (!rapport) {
      throw new NotFoundException('Rapport non trouvé');
    }
    return rapport;
  }

  async updateRapport(id: string, updateDto: any): Promise<RapportEntretien> {
    const rapport = await this.findOneRapport(id);
    Object.assign(rapport, updateDto);
    return this.rapportRepo.save(rapport);
  }

  async removeRapport(id: string): Promise<void> {
    const rapport = await this.findOneRapport(id);
    await this.rapportRepo.remove(rapport);
  }

  // ========== DASHBOARD ENTRETIEN ==========

  async getDashboard(): Promise<any> {
    const [
      totalResponsables,
      responsablesActifs,
      totalServices,
      servicesActifs,
      totalPlannings,
      planningsAujourdHui,
      totalStocks,
      stocksEnRupture,
      totalMaintenances,
      maintenancesEnCours,
      totalRapports,
      rapportsEnAttente
    ] = await Promise.all([
      this.responsableRepo.count(),
      this.responsableRepo.count({ where: { statut: 'actif' } }),
      this.serviceRepo.count(),
      this.serviceRepo.count({ where: { statut: 'actif' } }),
      this.planningRepo.count(),
      this.planningRepo.count({ 
        where: { 
          date_nettoyage: new Date(),
          statut: 'en_cours'
        } 
      }),
      this.stockRepo.count(),
      this.stockRepo.count({ where: { statut: 'en_rupture' } }),
      this.maintenanceRepo.count(),
      this.maintenanceRepo.count({ where: { statut: 'en_cours' } }),
      this.rapportRepo.count(),
      this.rapportRepo.count({ where: { statut: 'soumis' } })
    ]);

    return {
      responsables: {
        total: totalResponsables,
        actifs: responsablesActifs,
        taux_activite: totalResponsables > 0 ? (responsablesActifs / totalResponsables * 100).toFixed(1) : 0
      },
      services: {
        total: totalServices,
        actifs: servicesActifs,
        taux_activite: totalServices > 0 ? (servicesActifs / totalServices * 100).toFixed(1) : 0
      },
      plannings: {
        total: totalPlannings,
        aujourd_hui: planningsAujourdHui,
        taux_journalier: totalPlannings > 0 ? (planningsAujourdHui / totalPlannings * 100).toFixed(1) : 0
      },
      stocks: {
        total: totalStocks,
        en_rupture: stocksEnRupture,
        taux_rupture: totalStocks > 0 ? (stocksEnRupture / totalStocks * 100).toFixed(1) : 0
      },
      maintenances: {
        total: totalMaintenances,
        en_cours: maintenancesEnCours,
        taux_completion: totalMaintenances > 0 ? ((totalMaintenances - maintenancesEnCours) / totalMaintenances * 100).toFixed(1) : 0
      },
      rapports: {
        total: totalRapports,
        en_attente: rapportsEnAttente,
        taux_soumission: totalRapports > 0 ? (rapportsEnAttente / totalRapports * 100).toFixed(1) : 0
      }
    };
  }
}
