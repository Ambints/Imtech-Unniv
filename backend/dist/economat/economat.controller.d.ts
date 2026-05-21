import { EconomatService } from './economat.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { BudgetFiltersDto, RecouvrementFiltersDto } from './dto/filters.dto';
export declare class EconomatController {
    private readonly economatService;
    constructor(economatService: EconomatService);
    getAnneesAcademiques(): Promise<any>;
    createBudget(dto: CreateBudgetDto): Promise<any>;
    getBudgets(filters: BudgetFiltersDto): Promise<import("./interfaces/budget.interface").BudgetWithDetails[]>;
    getBudgetStats(anneeAcademiqueId?: string): Promise<import("./interfaces/budget.interface").BudgetStats>;
    getBudgetByDepartement(anneeAcademiqueId?: string): Promise<import("./interfaces/budget.interface").BudgetByDepartement[]>;
    getBudgetById(id: string): Promise<import("./interfaces/budget.interface").BudgetWithDetails>;
    updateBudget(id: string, dto: UpdateBudgetDto): Promise<any>;
    getFournisseurs(search?: string): Promise<import("./interfaces/depense.interface").DepenseByFournisseur[]>;
    getFournisseurTransactions(fournisseur: string): Promise<import("./interfaces/depense.interface").DepenseWithDetails[]>;
    getRecouvrementStats(anneeAcademiqueId?: string): Promise<import("./interfaces/recouvrement.interface").RecouvrementStats>;
    getInscriptionsImpayees(filters: RecouvrementFiltersDto): Promise<import("./interfaces/recouvrement.interface").InscriptionImpayee[]>;
    getRecouvrementByParcours(anneeAcademiqueId?: string): Promise<import("./interfaces/recouvrement.interface").RecouvrementByParcours[]>;
    getRapportJournalier(date: string): Promise<import("./interfaces/rapport.interface").RapportJournalier>;
    getRapportMensuel(mois: string, annee: number): Promise<import("./interfaces/rapport.interface").RapportMensuel>;
    getRapportAnnuel(anneeAcademiqueId: string): Promise<import("./interfaces/rapport.interface").RapportAnnuel>;
    getBilanFinancier(anneeAcademiqueId: string): Promise<import("./interfaces/rapport.interface").BilanFinancier>;
    getSubventions(anneeAcademiqueId?: string): Promise<any[]>;
    getSubventionUtilisation(id: string): Promise<any[]>;
}
