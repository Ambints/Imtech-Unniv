import { EconomatService } from './economat.service';
export declare class EconomatController {
    private readonly svc;
    constructor(svc: EconomatService);
    createBudget(dto: any): Promise<import("../finance/finance.entities").Budget>;
    findBudgets(filters: any): Promise<import("../finance/finance.entities").Budget[]>;
    getBudgetByAnnee(anneeAcademiqueId: string): Promise<any>;
    allouerBudget(id: string, montant: number): Promise<import("../finance/finance.entities").Budget>;
    getExecutionBudget(id: string): Promise<any>;
    createDemandeAchat(dto: any): Promise<any>;
    findDemandesAchat(filters: any): Promise<any[]>;
    validerDemandeAchat(id: string, validePar: string): Promise<any>;
    rejeterDemandeAchat(id: string, dto: {
        validePar: string;
        motif: string;
    }): Promise<any>;
    createDepense(dto: any): Promise<import("../finance/finance.entities").Depense>;
    findDepenses(filters: any): Promise<import("../finance/finance.entities").Depense[]>;
    approuverDepense(id: string, dto: {
        approuvePar: string;
    }): Promise<import("../finance/finance.entities").Depense>;
    getDepensesParCategorie(anneeAcademiqueId?: string): Promise<any>;
    getStockAlertes(): Promise<import("../logistics/logistics.entities").Stock[]>;
    getValeurStock(): Promise<any>;
    getStatsRecouvrement(anneeAcademiqueId?: string): Promise<any>;
    getImpayes(filters: any): Promise<any[]>;
    getCreances(jours?: number): Promise<any>;
    getRapportMensuel(mois: number, annee: number): Promise<any>;
    getBilanFinancier(anneeAcademiqueId?: string): Promise<any>;
    getPrevisionTresorerie(mois?: number): Promise<any[]>;
}
