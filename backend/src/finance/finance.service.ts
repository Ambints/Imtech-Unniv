import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { GrilleTarifaire, Echeancier, Paiement, Budget, Depense, ContratPersonnel, CongePersonnel, FichePaie } from './finance.entities';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(GrilleTarifaire, 'tenant') private grilleRepo: Repository<GrilleTarifaire>,
    @InjectRepository(Echeancier, 'tenant') private echeancierRepo: Repository<Echeancier>,
    @InjectRepository(Paiement, 'tenant') private paiementRepo: Repository<Paiement>,
    @InjectRepository(Budget, 'tenant') private budgetRepo: Repository<Budget>,
    @InjectRepository(Depense, 'tenant') private depenseRepo: Repository<Depense>,
    @InjectRepository(ContratPersonnel, 'tenant') private contratRepo: Repository<ContratPersonnel>,
    @InjectRepository(FichePaie, 'tenant') private fichePaieRepo: Repository<FichePaie>,
    @InjectDataSource('tenant') private dataSource: DataSource,
  ) {}

  async enregistrerPaiement(tid: string, dto: any, caissierId: string) {
    // Si matricule est fourni au lieu de inscriptionId, rechercher l'inscription
    let inscriptionId = dto.inscriptionId;
    let etudiantNom = '';

    if (!inscriptionId && dto.matricule) {
      // Rechercher l'inscription par le matricule de l'étudiant
      const result = await this.dataSource.query(`
        SELECT i.id, e.nom, e.prenom
        FROM inscription i
        JOIN etudiant e ON e.id = i.etudiant_id
        WHERE e.matricule = $1
        ORDER BY i.date_inscription DESC
        LIMIT 1
      `, [dto.matricule]);

      if (result.length === 0) {
        throw new BadRequestException(`Aucune inscription trouvée pour le matricule: ${dto.matricule}`);
      }

      inscriptionId = result[0].id;
      etudiantNom = `${result[0].nom} ${result[0].prenom}`;
    }

    if (!inscriptionId) {
      throw new BadRequestException('Veuillez fournir soit inscriptionId soit matricule');
    }

    const reference = 'REC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();

    // Construire le paiement avec motif dans observations
    const paiementData = {
      inscriptionId,
      montant: dto.montant,
      modePaiement: dto.modePaiement,
      echeancierId: dto.echeancierId || null,
      reference,
      statut: 'valide',
      caissierId,
      numeroRecu: reference,
      observations: dto.motif || dto.observations || null, // motif va dans observations
    };

    const paiement = await this.paiementRepo.save(
      this.paiementRepo.create(paiementData)
    );

    return {
      paiement,
      etudiantNom,
      recu: {
        numeroRecu: reference,
        date: new Date(),
        montant: dto.montant,
        mode: dto.modePaiement,
        matricule: dto.matricule,
        statut: 'Paye',
        message: 'Recu de paiement - IMTECH UNIVERSITY',
      },
    };
  }

  getPaiementsEtudiant(tid: string, inscriptionId: string) {
    return this.paiementRepo.find({ where: { inscriptionId }, order: { createdAt: 'DESC' } });
  }

  async getTousPaiements(tid: string, date?: string) {
    const where: any = {};
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59);
      where.datePaiement = Between(start, end);
    }
    return this.paiementRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getCaisseJournaliere(tid: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const paiements = await this.paiementRepo.find({
      where: { datePaiement: Between(today, endOfDay), statut: 'valide' },
      order: { createdAt: 'DESC' }
    });
    const total = paiements.reduce((s, p) => s + Number(p.montant), 0);
    return { date: today, total, nombrePaiements: paiements.length, paiements };
  }

  async cloturerCaisse(tid: string, userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const paiements = await this.paiementRepo.find({
      where: { datePaiement: Between(today, endOfDay), statut: 'valide' }
    });
    const total = paiements.reduce((s, p) => s + Number(p.montant), 0);
    return { message: 'Caisse cloturee', date: today, totalCloture: total, nombreTransactions: paiements.length, cloturePar: userId };
  }

  creerGrille(dto: any) {
    return this.grilleRepo.save(this.grilleRepo.create(dto));
  }

  getGrilles(parcoursId?: string) {
    const where: any = {};
    if (parcoursId) where.parcoursId = parcoursId;
    return this.grilleRepo.find({ where });
  }

  creerBudget(tid: string, dto: any) {
    return this.budgetRepo.save(this.budgetRepo.create(dto));
  }

  getBudgets(tid: string, anneeAcademiqueId?: string) {
    const where: any = {};
    if (anneeAcademiqueId) where.anneeAcademiqueId = anneeAcademiqueId;
    return this.budgetRepo.find({ where });
  }

  async ajouterDepense(tid: string, dto: any, demandePar: string) {
    const depense = await this.depenseRepo.save(
      this.depenseRepo.create({ ...dto, demandePar, statut: 'en_attente' })
    );
    if (dto.budgetId) {
      const budget = await this.budgetRepo.findOne({ where: { id: dto.budgetId } });
      if (budget) {
        await this.budgetRepo.save({ ...budget, montantRealise: Number(budget.montantRealise) + Number(dto.montant) });
      }
    }
    return depense;
  }

  getDepenses(tid: string, anneeAcademiqueId?: string) {
    const where: any = {};
    if (anneeAcademiqueId) where.anneeAcademiqueId = anneeAcademiqueId;
    return this.depenseRepo.find({ where, order: { dateDepense: 'DESC' } });
  }

  async updateBudget(tid: string, id: string, dto: any) {
    const budget = await this.budgetRepo.findOne({ where: { id } });
    if (!budget) throw new NotFoundException('Budget non trouvé');
    return this.budgetRepo.save({ ...budget, ...dto });
  }

  async updateDepense(tid: string, id: string, dto: any) {
    const depense = await this.depenseRepo.findOne({ where: { id } });
    if (!depense) throw new NotFoundException('Dépense non trouvée');
    return this.depenseRepo.save({ ...depense, ...dto });
  }

  async deleteDepense(tid: string, id: string) {
    const depense = await this.depenseRepo.findOne({ where: { id } });
    if (!depense) throw new NotFoundException('Dépense non trouvée');
    await this.depenseRepo.delete(id);
    return { message: 'Dépense supprimée avec succès' };
  }

  async updateContrat(tid: string, id: string, dto: any) {
    const contrat = await this.contratRepo.findOne({ where: { id } });
    if (!contrat) throw new NotFoundException('Contrat non trouvé');
    return this.contratRepo.save({ ...contrat, ...dto });
  }

  async getRapportFinancier(tid: string, anneeAcademiqueId: string) {
    const paiements = await this.paiementRepo.find({ where: { datePaiement: Between(new Date(anneeAcademiqueId), new Date()) } });
    const budgets = await this.budgetRepo.find({ where: { anneeAcademiqueId } });
    const totalRecettes = paiements.reduce((s, p) => s + Number(p.montant), 0);
    const totalBudget = budgets.reduce((s, b) => s + Number(b.montantPrevu), 0);
    const totalDepenses = budgets.reduce((s, b) => s + Number(b.montantRealise), 0);
    return { anneeAcademiqueId, totalRecettes, totalBudget, totalDepenses, solde: totalRecettes - totalDepenses, nbPaiements: paiements.length };
  }

  // RH
  creerContrat(tid: string, dto: any) {
    return this.contratRepo.save(this.contratRepo.create(dto));
  }
  getContrats(tid: string, utilisateurId?: string) {
    const where: any = {};
    if (utilisateurId) where.utilisateurId = utilisateurId;
    return this.contratRepo.find({ where });
  }
  creerEcheancier(tid: string, dto: any) {
    return this.echeancierRepo.save(this.echeancierRepo.create(dto));
  }
  getEcheanciers(tid: string, inscriptionId?: string) {
    const where: any = {};
    if (inscriptionId) where.inscriptionId = inscriptionId;
    return this.echeancierRepo.find({ where });
  }
  creerFichePaie(dto: any) {
    return this.fichePaieRepo.save(this.fichePaieRepo.create(dto));
  }
  getFichesPaie(contratId?: string) {
    const where: any = {};
    if (contratId) where.contratId = contratId;
    return this.fichePaieRepo.find({ where });
  }
}