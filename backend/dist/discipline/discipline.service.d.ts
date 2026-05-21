import { DataSource } from 'typeorm';
export declare class DisciplineService {
    private dataSource;
    private request;
    private readonly logger;
    private tenantSchema;
    constructor(dataSource: DataSource, request: any);
    private query;
    createIncident(data: any): Promise<any>;
    findAllIncidents(filters?: {
        etudiantId?: string;
        statut?: string;
        typeIncident?: string;
    }): Promise<any[]>;
    findIncidentById(id: string): Promise<any>;
    validerIncident(id: string, validePar: string): Promise<any>;
    updateIncident(id: string, data: any): Promise<any>;
    deleteIncident(id: string): Promise<void>;
    getIncidentsByStudent(etudiantId: string): Promise<any>;
    getDisciplineStats(): Promise<any>;
    getIncidentsByPeriod(dateDebut: string, dateFin: string): Promise<any[]>;
    getIncidentsByType(): Promise<any[]>;
}
