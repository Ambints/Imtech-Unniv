import { Repository, DataSource } from 'typeorm';
import { Paiement, Echeancier } from '../finance/finance.entities';
export declare class CaissierService {
    private paiementRepo;
    private echeancierRepo;
    private dataSource;
    private readonly logger;
    constructor(paiementRepo: Repository<Paiement>, echeancierRepo: Repository<Echeancier>, dataSource: DataSource);
    createPaiement(data: any): Promise<any>;
    findPaiements(date?: string, mode?: string): Promise<Paiement[]>;
    findPaiementsByEtudiant(etudiantId: string): Promise<any[]>;
    annulerPaiement(id: string, motif: string, annulePar: string): Promise<Paiement>;
    genererRecu(id: string): Promise<any>;
    createEcheancier(data: any): Promise<any>;
    findEcheances(dateDebut?: string, dateFin?: string, statut?: string): Promise<any[]>;
    findEcheancesByEtudiant(etudiantId: string): Promise<any[]>;
    modifierEcheance(id: string, dto: {
        nouvelleDate: string;
        motif: string;
    }): Promise<Echeancier>;
    findImpayes(jours?: number): Promise<any[]>;
    createRelance(data: any): Promise<any>;
    envoyerRelance(id: string): Promise<any>;
    bloquerNotes(inscriptionId: string): Promise<any>;
    debloquerNotes(inscriptionId: string): Promise<any>;
    private verifierEtDebloquerNotes;
    getClotureJournaliere(date?: string): Promise<any>;
    validerCloture(date: string, validePar: string): Promise<any>;
    getRapprochementBancaire(date?: string): Promise<any>;
    getStatsJournalieres(date?: string): Promise<any>;
    getStatsMensuelles(mois: number, annee: number): Promise<any>;
    private genererNumeroRecu;
}
