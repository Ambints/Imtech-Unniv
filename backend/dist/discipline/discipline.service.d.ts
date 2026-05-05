import { Repository } from 'typeorm';
import { Incident, Sanction, Avertissement } from './discipline.entities';
export declare class DisciplineService {
    private incidentRepo;
    private sanctionRepo;
    private avertissementRepo;
    private readonly logger;
    constructor(incidentRepo: Repository<Incident>, sanctionRepo: Repository<Sanction>, avertissementRepo: Repository<Avertissement>);
    createIncident(data: Partial<Incident>): Promise<Incident>;
    findAllIncidents(filters?: {
        etudiantId?: string;
        statut?: string;
        gravite?: string;
    }): Promise<Incident[]>;
    findIncidentById(id: string): Promise<Incident>;
    validerIncident(id: string, validePar: string): Promise<Incident>;
    createSanction(data: Partial<Sanction>): Promise<Sanction>;
    findAllSanctions(filters?: {
        etudiantId?: string;
        statut?: string;
    }): Promise<Sanction[]>;
    findActiveSanctionsByStudent(etudiantId: string): Promise<Sanction[]>;
    createAvertissement(data: Partial<Avertissement>): Promise<Avertissement>;
    findAvertissementsByStudent(etudiantId: string): Promise<Avertissement[]>;
    getDisciplineStats(): Promise<any>;
}
