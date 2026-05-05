import { CaissierService } from './caissier.service';
export declare class CaissierController {
    private readonly svc;
    constructor(svc: CaissierService);
    createPaiement(dto: any, user: any): Promise<any>;
    findPaiements(date: string, mode?: string): Promise<import("../finance/finance.entities").Paiement[]>;
    findPaiementsByEtudiant(etudiantId: string): Promise<any[]>;
    annulerPaiement(id: string, motif: string, user: any): Promise<import("../finance/finance.entities").Paiement>;
    genererRecu(id: string): Promise<any>;
    createEcheancier(dto: any): Promise<any>;
    findEcheances(dateDebut?: string, dateFin?: string, statut?: string): Promise<any[]>;
    findEcheancesByEtudiant(etudiantId: string): Promise<any[]>;
    modifierEcheance(id: string, dto: {
        nouvelleDate: string;
        motif: string;
    }): Promise<import("../finance/finance.entities").Echeancier>;
    findImpayes(jours?: number): Promise<any[]>;
    createRelance(dto: any): Promise<any>;
    envoyerRelance(id: string): Promise<any>;
    bloquerNotes(inscriptionId: string): Promise<any>;
    debloquerNotes(inscriptionId: string): Promise<any>;
    getClotureJournaliere(date: string): Promise<any>;
    validerCloture(date: string, user: any): Promise<any>;
    getRapprochementBancaire(date: string): Promise<any>;
    getStatsJournalieres(date: string): Promise<any>;
    getStatsMensuelles(mois: number, annee: number): Promise<any>;
}
