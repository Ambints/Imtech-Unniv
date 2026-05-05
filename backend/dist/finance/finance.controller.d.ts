import { FinanceService } from './finance.service';
export declare class FinanceController {
    private readonly svc;
    constructor(svc: FinanceService);
    payer(tid: string, dto: any): Promise<{
        paiement: import("./finance.entities").Paiement[];
        recu: {
            numeroRecu: string;
            date: Date;
            montant: any;
            mode: any;
            statut: string;
            message: string;
        };
    }>;
    getTousPaiements(tid: string, date?: string): Promise<import("./finance.entities").Paiement[]>;
    getPaiements(tid: string, eid: string): Promise<import("./finance.entities").Paiement[]>;
    getCaisse(tid: string): Promise<{
        date: Date;
        total: number;
        nombrePaiements: number;
        paiements: import("./finance.entities").Paiement[];
    }>;
    cloturer(tid: string, body: any): Promise<{
        message: string;
        date: Date;
        totalCloture: number;
        nombreTransactions: number;
        cloturePar: string;
    }>;
    creerBudget(tid: string, dto: any): Promise<import("./finance.entities").Budget[]>;
    getBudgets(tid: string, annee?: string): Promise<import("./finance.entities").Budget[]>;
    ajouterDepense(tid: string, dto: any): Promise<import("./finance.entities").Depense[]>;
    getDepenses(tid: string, annee?: string): Promise<import("./finance.entities").Depense[]>;
    updateDepense(tid: string, id: string, dto: any): Promise<any>;
    deleteDepense(tid: string, id: string): Promise<{
        message: string;
    }>;
    updateBudget(tid: string, id: string, dto: any): Promise<any>;
    rapport(tid: string, annee: string): Promise<{
        anneeAcademiqueId: string;
        totalRecettes: number;
        totalBudget: number;
        totalDepenses: number;
        solde: number;
        nbPaiements: number;
    }>;
    creerContrat(tid: string, dto: any): Promise<import("./finance.entities").ContratPersonnel[]>;
    getContrats(tid: string, pid?: string): Promise<import("./finance.entities").ContratPersonnel[]>;
    updateContrat(tid: string, id: string, dto: any): Promise<any>;
    creerEcheancier(tid: string, dto: any): Promise<import("./finance.entities").Echeancier[]>;
    getEcheanciers(tid: string, eid?: string): Promise<import("./finance.entities").Echeancier[]>;
}
