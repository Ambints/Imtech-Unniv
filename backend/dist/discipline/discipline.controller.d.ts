import { DisciplineService } from './discipline.service';
export declare class DisciplineController {
    private readonly svc;
    constructor(svc: DisciplineService);
    createIncident(tid: string, dto: any): Promise<any>;
    findAllIncidents(tid: string, filters: any): Promise<any[]>;
    findIncidentById(tid: string, id: string): Promise<any>;
    updateIncident(tid: string, id: string, dto: any): Promise<any>;
    validerIncident(tid: string, id: string, validePar: string): Promise<any>;
    deleteIncident(id: string): Promise<void>;
    getIncidentsByStudent(etudiantId: string): Promise<any>;
    getIncidentsByPeriod(dateDebut: string, dateFin: string): Promise<any[]>;
    getIncidentsByType(): Promise<any[]>;
    getStats(): Promise<any>;
}
