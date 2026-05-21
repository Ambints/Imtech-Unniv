import { Repository, DataSource } from 'typeorm';
import { GrilleTarifaire, Echeancier, Paiement, Budget, Depense, ContratPersonnel, FichePaie } from './finance.entities';
export declare class FinanceService {
    private grilleRepo;
    private echeancierRepo;
    private paiementRepo;
    private budgetRepo;
    private depenseRepo;
    private contratRepo;
    private fichePaieRepo;
    private dataSource;
    constructor(grilleRepo: Repository<GrilleTarifaire>, echeancierRepo: Repository<Echeancier>, paiementRepo: Repository<Paiement>, budgetRepo: Repository<Budget>, depenseRepo: Repository<Depense>, contratRepo: Repository<ContratPersonnel>, fichePaieRepo: Repository<FichePaie>, dataSource: DataSource);
    enregistrerPaiement(tid: string, dto: any, caissierId: string): Promise<{
        paiement: Paiement;
        etudiantNom: string;
        recu: {
            numeroRecu: string;
            date: Date;
            montant: any;
            mode: any;
            matricule: any;
            statut: string;
            message: string;
        };
    }>;
    getPaiementsEtudiant(tid: string, inscriptionId: string): Promise<Paiement[]>;
    getTousPaiements(tid: string, date?: string): Promise<any>;
    getCaisseJournaliere(tid: string): Promise<{
        date: Date;
        total: any;
        nombrePaiements: any;
        paiements: any;
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
    getEcheanciers(tid: string, inscriptionId?: string): Promise<any>;
    getInscriptionsActives(tid: string): Promise<any>;
    creerFichePaie(dto: any): Promise<FichePaie[]>;
    getFichesPaie(contratId?: string): Promise<FichePaie[]>;
    getGrilleTarifaire(tid: string): Promise<any>;
    creerFraisInscription(tid: string, dto: any): Promise<any>;
    updateFraisInscription(tid: string, id: string, dto: any): Promise<any>;
    deleteFraisInscription(tid: string, id: string): Promise<any>;
    toggleActifFrais(tid: string, id: string): Promise<any>;
    getPaiementsInscriptionEnAttente(tid: string): Promise<any>;
    getTousPaiementsInscription(tid: string, statut?: string): Promise<any>;
    validerPaiementInscription(tid: string, paiementId: string, caissierId: string, noteValidation?: string): Promise<any>;
    rejeterPaiementInscription(tid: string, paiementId: string, caissierId: string, motifRejet: string): Promise<any>;
    getStatistiquesPaiementsInscription(tid: string): Promise<any>;
}
