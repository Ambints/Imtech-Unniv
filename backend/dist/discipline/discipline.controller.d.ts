import { DisciplineService } from './discipline.service';
export declare class DisciplineController {
    private readonly svc;
    constructor(svc: DisciplineService);
    createIncident(dto: any): Promise<import("./discipline.entities").Incident>;
    findAllIncidents(filters: any): Promise<import("./discipline.entities").Incident[]>;
    validerIncident(id: string, validePar: string): Promise<import("./discipline.entities").Incident>;
    createSanction(dto: any): Promise<import("./discipline.entities").Sanction>;
    findAllSanctions(filters: any): Promise<import("./discipline.entities").Sanction[]>;
    findActiveSanctions(etudiantId: string): Promise<import("./discipline.entities").Sanction[]>;
    createAvertissement(dto: any): Promise<import("./discipline.entities").Avertissement>;
    findAvertissements(etudiantId: string): Promise<import("./discipline.entities").Avertissement[]>;
    getStats(): Promise<any>;
}
