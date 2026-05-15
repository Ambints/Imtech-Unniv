import { FinanceService } from './finance.service';
import { Request } from 'express';
export declare class FinanceController {
    private readonly svc;
    constructor(svc: FinanceService);
    private getTenantId;
    payer(req: Request, dto: any): Promise<{
        paiement: import("./finance.entities").Paiement;
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
    getTousPaiements(req: Request, date?: string): Promise<import("./finance.entities").Paiement[]>;
    getPaiements(req: Request, eid: string): Promise<import("./finance.entities").Paiement[]>;
    getCaisse(req: Request): Promise<{
        date: Date;
        total: number;
        nombrePaiements: number;
        paiements: import("./finance.entities").Paiement[];
    }>;
    cloturer(req: Request, body: any): Promise<{
        message: string;
        date: Date;
        totalCloture: number;
        nombreTransactions: number;
        cloturePar: string;
    }>;
    creerBudget(req: Request, dto: any): Promise<import("./finance.entities").Budget[]>;
    getBudgets(req: Request, annee?: string): Promise<import("./finance.entities").Budget[]>;
    ajouterDepense(req: Request, dto: any): Promise<import("./finance.entities").Depense[]>;
    getDepenses(req: Request, annee?: string): Promise<import("./finance.entities").Depense[]>;
    updateDepense(req: Request, id: string, dto: any): Promise<any>;
    deleteDepense(req: Request, id: string): Promise<{
        message: string;
    }>;
    updateBudget(req: Request, id: string, dto: any): Promise<any>;
    rapport(req: Request, annee: string): Promise<{
        anneeAcademiqueId: string;
        totalRecettes: number;
        totalBudget: number;
        totalDepenses: number;
        solde: number;
        nbPaiements: number;
    }>;
    creerContrat(req: Request, dto: any): Promise<import("./finance.entities").ContratPersonnel[]>;
    getContrats(req: Request, pid?: string): Promise<import("./finance.entities").ContratPersonnel[]>;
    updateContrat(req: Request, id: string, dto: any): Promise<any>;
    creerEcheancier(req: Request, dto: any): Promise<import("./finance.entities").Echeancier[]>;
    getEcheanciers(req: Request, eid?: string): Promise<import("./finance.entities").Echeancier[]>;
    getPaiementsEnAttente(req: Request): Promise<any>;
    getTousPaiementsInscription(req: Request, statut?: string): Promise<any>;
    validerPaiement(req: Request, paiementId: string, body: {
        caissierId: string;
        noteValidation?: string;
    }): Promise<any>;
    rejeterPaiement(req: Request, paiementId: string, body: {
        caissierId: string;
        motifRejet: string;
    }): Promise<any>;
    getStatistiquesPaiements(req: Request): Promise<any>;
}
