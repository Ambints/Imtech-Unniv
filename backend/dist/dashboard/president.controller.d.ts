import { PresidentDashboardService } from './president.service';
export declare class PresidentDashboardController {
    private readonly svc;
    constructor(svc: PresidentDashboardService);
    getKPI(anneeAcademiqueId?: string): Promise<any>;
    getStatsEtudiants(anneeAcademiqueId?: string): Promise<any>;
    getStatsFinancieres(anneeAcademiqueId?: string): Promise<any>;
    getStatsAcademiques(sessionId?: string): Promise<any>;
    getActiviteRecente(): Promise<any>;
    getAlertes(): Promise<any>;
    getRepartitionParcours(anneeAcademiqueId?: string): Promise<any>;
}
