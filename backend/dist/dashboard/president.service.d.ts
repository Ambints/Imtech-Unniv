import { DataSource } from 'typeorm';
export declare class PresidentDashboardService {
    private dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    getKPI(anneeAcademiqueId?: string): Promise<any>;
    getStatsEtudiants(anneeAcademiqueId?: string): Promise<any>;
    getStatsFinancieres(anneeAcademiqueId?: string): Promise<any>;
    getStatsAcademiques(sessionId?: string): Promise<any>;
    getActiviteRecente(): Promise<any>;
    getAlertes(): Promise<any>;
    getRepartitionParParcours(anneeAcademiqueId?: string): Promise<any>;
}
