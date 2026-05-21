import { DisciplineService } from './discipline.service';
export declare class DisciplineController {
    private readonly svc;
    constructor(svc: DisciplineService);
    createIncident(dto: any): Promise<any>;
    findAllIncidents(filters: any): Promise<any[]>;
    findIncidentById(id: string): Promise<any>;
    updateIncident(id: string, dto: any): Promise<any>;
    validerIncident(id: string, validePar: string): Promise<any>;
    deleteIncident(id: string): Promise<void>;
    getIncidentsByStudent(etudiantId: string): Promise<any>;
    getIncidentsByPeriod(dateDebut: string, dateFin: string): Promise<any[]>;
    getIncidentsByType(): Promise<any[]>;
    getStats(): Promise<any>;
}
