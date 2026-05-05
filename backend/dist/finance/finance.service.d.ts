import { Repository } from 'typeorm';
import { GrilleTarifaire, Echeancier, Paiement, Budget, Depense, ContratPersonnel, FichePaie } from './finance.entities';
export declare class FinanceService {
    private grilleRepo;
    private echeancierRepo;
    private paiementRepo;
    private budgetRepo;
    private depenseRepo;
    private contratRepo;
    private fichePaieRepo;
    constructor(grilleRepo: Repository<GrilleTarifaire>, echeancierRepo: Repository<Echeancier>, paiementRepo: Repository<Paiement>, budgetRepo: Repository<Budget>, depenseRepo: Repository<Depense>, contratRepo: Repository<ContratPersonnel>, fichePaieRepo: Repository<FichePaie>);
    enregistrerPaiement(tid: string, dto: any, caissierId: string): Promise<{
        paiement: Paiement[];
        recu: {
            numeroRecu: string;
            date: Date;
            montant: any;
            mode: any;
            statut: string;
            message: string;
        };
    }>;
    getPaiementsEtudiant(tid: string, inscriptionId: string): Promise<Paiement[]>;
    getTousPaiements(tid: string, date?: string): Promise<Paiement[]>;
    getCaisseJournaliere(tid: string): Promise<{
        date: Date;
        total: number;
        nombrePaiements: number;
        paiements: Paiement[];
    }>;
    cloturerCaisse(tid: string, userId: string): Promise<{
        message: string;
        date: Date;
        totalCloture: number;
        nombreTransactions: number;
        cloturePar: string;
    }>;
    creerGrille(dto: any): Promise<GrilleTarifaire[]>;
    getGrilles(parcoursId?: string): Promise<GrilleTarifaire[]>;
    creerBudget(tid: string, dto: any): Promise<Budget[]>;
    getBudgets(tid: string, anneeAcademiqueId?: string): Promise<Budget[]>;
    ajouterDepense(tid: string, dto: any, demandePar: string): Promise<Depense[]>;
    getDepenses(tid: string, anneeAcademiqueId?: string): Promise<Depense[]>;
    updateBudget(tid: string, id: string, dto: any): Promise<any>;
    updateDepense(tid: string, id: string, dto: any): Promise<any>;
    deleteDepense(tid: string, id: string): Promise<{
        message: string;
    }>;
    updateContrat(tid: string, id: string, dto: any): Promise<any>;
    getRapportFinancier(tid: string, anneeAcademiqueId: string): Promise<{
        anneeAcademiqueId: string;
        totalRecettes: number;
        totalBudget: number;
        totalDepenses: number;
        solde: number;
        nbPaiements: number;
    }>;
    creerContrat(tid: string, dto: any): Promise<ContratPersonnel[]>;
    getContrats(tid: string, utilisateurId?: string): Promise<ContratPersonnel[]>;
    creerEcheancier(tid: string, dto: any): Promise<Echeancier[]>;
    getEcheanciers(tid: string, inscriptionId?: string): Promise<Echeancier[]>;
    creerFichePaie(dto: any): Promise<FichePaie[]>;
    getFichesPaie(contratId?: string): Promise<FichePaie[]>;
}
