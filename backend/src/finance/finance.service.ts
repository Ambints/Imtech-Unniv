import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { GrilleTarifaire, Echeancier, Paiement, Budget, Depense, ContratPersonnel, CongePersonnel, FichePaie } from './finance.entities';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(GrilleTarifaire) private grilleRepo: Repository<GrilleTarifaire>,
    @InjectRepository(Echeancier) private echeancierRepo: Repository<Echeancier>,
    @InjectRepository(Paiement) private paiementRepo: Repository<Paiement>,
    @InjectRepository(Budget) private budgetRepo: Repository<Budget>,
    @InjectRepository(Depense) private depenseRepo: Repository<Depense>,
    @InjectRepository(ContratPersonnel) private contratRepo: Repository<ContratPersonnel>,
    @InjectRepository(FichePaie) private fichePaieRepo: Repository<FichePaie>,
  ) {}

  async enregistrerPaiement(tid: string, dto: any, caissierId: string) {
    const reference = 'REC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    const paiement = await this.paiementRepo.save(
      this.paiementRepo.create({ ...dto, reference, statut: 'valide', caissierId, numeroRecu: reference })
    );
    return {
      paiement,
      recu: {
        numeroRecu: reference,
        date: new Date(),
        montant: dto.montant,
        mode: dto.modePaiement,
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