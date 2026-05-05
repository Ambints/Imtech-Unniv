import { Repository, DataSource } from 'typeorm';
import { Budget, Depense } from '../finance/finance.entities';
import { Stock } from '../logistics/logistics.entities';
export declare class EconomatService {
    private budgetRepo;
    private depenseRepo;
    private stockRepo;
    private dataSource;
    private readonly logger;
    constructor(budgetRepo: Repository<Budget>, depenseRepo: Repository<Depense>, stockRepo: Repository<Stock>, dataSource: DataSource);
    createBudget(data: Partial<Budget>): Promise<Budget>;
    findBudgets(filters?: {
        anneeAcademiqueId?: string;
        departementId?: string;
    }): Promise<Budget[]>;
    getBudgetByAnnee(anneeAcademiqueId: string): Promise<any>;
    allouerBudget(id: string, montant: number): Promise<Budget>;
    getExecutionBudget(id: string): Promise<any>;
    createDemandeAchat(data: any): Promise<any>;
    findDemandesAchat(filters?: {
        statut?: string;
        departementId?: string;
        priorite?: string;
    }): Promise<any[]>;
    validerDemandeAchat(id: string, validePar: string): Promise<any>;
    rejeterDemandeAchat(id: string, data: {
        validePar: string;
        motif: string;
    }): Promise<any>;
    createDepense(data: Partial<Depense>): Promise<Depense>;
    findDepenses(filters?: {
        statut?: string;
        budgetId?: string;
        anneeAcademiqueId?: string;
    }): Promise<Depense[]>;
    approuverDepense(id: string, approuvePar: string): Promise<Depense>;
    getDepensesParCategorie(anneeAcademiqueId?: string): Promise<any>;
    getStockAlertes(): Promise<Stock[]>;
    getValeurStock(): Promise<any>;
    getStatsRecouvrement(anneeAcademiqueId?: string): Promise<any>;
    getImpayes(filters?: {
        jours?: number;
        montantMin?: number;
    }): Promise<any[]>;
    getCreancesAging(jours?: number): Promise<any>;
    getRapportMensuel(mois: number, annee: number): Promise<any>;
    getBilanFinancier(anneeAcademiqueId?: string): Promise<any>;
    getPrevisionTresorerie(mois?: number): Promise<any[]>;
}
