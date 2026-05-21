import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { 
  President, 
  DecisionPresidentielle, 
  ValidationRecrutement, 
  Arbitrage,
  ConseilUniversitaire 
} from './gouvernance.entities';
import { CreatePresidentDto } from './dto/create-president.dto';
import { UpdatePresidentDto } from './dto/update-president.dto';

@Injectable()
export class GouvernanceService {
  constructor(
    @InjectRepository(President, 'tenant') private presidentRepo: Repository<President>,
    @InjectRepository(DecisionPresidentielle, 'tenant') private decisionRepo: Repository<DecisionPresidentielle>,
    @InjectRepository(ValidationRecrutement, 'tenant') private validationRepo: Repository<ValidationRecrutement>,
    @InjectRepository(Arbitrage, 'tenant') private arbitrageRepo: Repository<Arbitrage>,
    @InjectRepository(ConseilUniversitaire, 'tenant') private conseilRepo: Repository<ConseilUniversitaire>,
    @InjectDataSource('tenant') private dataSource: DataSource,
  ) {}

  // ========== PRESIDENT ==========

  async createPresident(createDto: CreatePresidentDto): Promise<President> {
    const president = this.presidentRepo.create(createDto);
    return this.presidentRepo.save(president);
  }

  async findAllPresidents(): Promise<President[]> {
    return this.presidentRepo.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findOnePresident(id: string): Promise<President> {
    const president = await this.presidentRepo.findOne({ where: { id } });
    if (!president) {
      throw new NotFoundException('Président non trouvé');
    }
    return president;
  }

  async updatePresident(id: string, updateDto: UpdatePresidentDto): Promise<President> {
    const president = await this.findOnePresident(id);
    Object.assign(president, updateDto);
    return this.presidentRepo.save(president);
  }

  async removePresident(id: string): Promise<void> {
    const president = await this.findOnePresident(id);
    await this.presidentRepo.remove(president);
  }

  // ========== DECISIONS PRESIDENTIELLES ==========

  async createDecision(createDto: any): Promise<DecisionPresidentielle> {
    const decision = this.decisionRepo.create(createDto) as unknown as DecisionPresidentielle;
    return this.decisionRepo.save(decision);
  }

  async findAllDecisions(): Promise<DecisionPresidentielle[]> {
    return this.decisionRepo.find({
      relations: ['president'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOneDecision(id: string): Promise<DecisionPresidentielle> {
    const decision = await this.decisionRepo.findOne({ 
      where: { id },
      relations: ['president']
    });
    if (!decision) {
      throw new NotFoundException('Décision non trouvée');
    }
    return decision;
  }

  async updateDecision(id: string, updateDto: any): Promise<DecisionPresidentielle> {
    const decision = await this.findOneDecision(id);
    Object.assign(decision, updateDto);
    return this.decisionRepo.save(decision);
  }

  async removeDecision(id: string): Promise<void> {
    const decision = await this.findOneDecision(id);
    await this.decisionRepo.remove(decision);
  }

  // ========== VALIDATIONS RECRUTEMENT ==========

  async createValidation(createDto: any): Promise<ValidationRecrutement> {
    const validation = this.validationRepo.create(createDto) as unknown as ValidationRecrutement;
    return this.validationRepo.save(validation);
  }

  async findAllValidations(): Promise<ValidationRecrutement[]> {
    return this.validationRepo.find({
      relations: ['president'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOneValidation(id: string): Promise<ValidationRecrutement> {
    const validation = await this.validationRepo.findOne({ 
      where: { id },
      relations: ['president']
    });
    if (!validation) {
      throw new NotFoundException('Validation non trouvée');
    }
    return validation;
  }

  async updateValidation(id: string, updateDto: any): Promise<ValidationRecrutement> {
    const validation = await this.findOneValidation(id);
    Object.assign(validation, updateDto);
    return this.validationRepo.save(validation);
  }

  async removeValidation(id: string): Promise<void> {
    const validation = await this.findOneValidation(id);
    await this.validationRepo.remove(validation);
  }

  // ========== ARBITRAGES ==========

  async createArbitrage(createDto: any): Promise<Arbitrage> {
    const arbitrage = this.arbitrageRepo.create(createDto) as unknown as Arbitrage;
    return this.arbitrageRepo.save(arbitrage);
  }

  async findAllArbitrages(): Promise<Arbitrage[]> {
    return this.arbitrageRepo.find({
      relations: ['president', 'decision'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOneArbitrage(id: string): Promise<Arbitrage> {
    const arbitrage = await this.arbitrageRepo.findOne({ 
      where: { id },
      relations: ['president', 'decision']
    });
    if (!arbitrage) {
      throw new NotFoundException('Arbitrage non trouvé');
    }
    return arbitrage;
  }

  async updateArbitrage(id: string, updateDto: any): Promise<Arbitrage> {
    const arbitrage = await this.findOneArbitrage(id);
    Object.assign(arbitrage, updateDto);
    return this.arbitrageRepo.save(arbitrage);
  }

  async removeArbitrage(id: string): Promise<void> {
    const arbitrage = await this.findOneArbitrage(id);
    await this.arbitrageRepo.remove(arbitrage);
  }

  // ========== CONSEILS UNIVERSITAIRES ==========

  async createConseil(createDto: any): Promise<ConseilUniversitaire> {
    const conseil = this.conseilRepo.create(createDto) as unknown as ConseilUniversitaire;
    return this.conseilRepo.save(conseil);
  }

  async findAllConseils(): Promise<ConseilUniversitaire[]> {
    return this.conseilRepo.find({
      relations: ['president'],
      order: { date_conseil: 'DESC' }
    });
  }

  async findOneConseil(id: string): Promise<ConseilUniversitaire> {
    const conseil = await this.conseilRepo.findOne({ 
      where: { id },
      relations: ['president']
    });
    if (!conseil) {
      throw new NotFoundException('Conseil non trouvé');
    }
    return conseil;
  }

  async updateConseil(id: string, updateDto: any): Promise<ConseilUniversitaire> {
    const conseil = await this.findOneConseil(id);
    Object.assign(conseil, updateDto);
    return this.conseilRepo.save(conseil);
  }

  async removeConseil(id: string): Promise<void> {
    const conseil = await this.findOneConseil(id);
    await this.conseilRepo.remove(conseil);
  }

  // ========== DASHBOARD PRESIDENT ==========

  async getDashboard(): Promise<any> {
    const [
      totalDecisions,
      decisionsEnAttente,
      totalValidations,
      validationsEnAttente,
      totalArbitrages,
      arbitragesOuverts,
      totalConseils,
      prochainsConseils
    ] = await Promise.all([
      this.decisionRepo.count(),
      this.decisionRepo.count({ where: { statut: 'en_attente' } }),
      this.validationRepo.count(),
      this.validationRepo.count({ where: { statut: 'en_attente' } }),
      this.arbitrageRepo.count(),
      this.arbitrageRepo.count({ where: { statut: 'ouvert' } }),
      this.conseilRepo.count(),
      this.conseilRepo.count({ 
        where: { 
          statut: 'planifie',
          date_conseil: new Date() 
        } 
      })
    ]);

    return {
      decisions: {
        total: totalDecisions,
        en_attente: decisionsEnAttente,
        taux_en_attente: totalDecisions > 0 ? (decisionsEnAttente / totalDecisions * 100).toFixed(1) : 0
      },
      validations: {
        total: totalValidations,
        en_attente: validationsEnAttente,
        taux_en_attente: totalValidations > 0 ? (validationsEnAttente / totalValidations * 100).toFixed(1) : 0
      },
      arbitrages: {
        total: totalArbitrages,
        ouverts: arbitragesOuverts,
        taux_ouverts: totalArbitrages > 0 ? (arbitragesOuverts / totalArbitrages * 100).toFixed(1) : 0
      },
      conseils: {
        total: totalConseils,
        prochains: prochainsConseils
      }
    };
  }
}
