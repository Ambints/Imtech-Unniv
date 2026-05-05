import { PortailEtudiantService } from './etudiant.service';
export declare class PortailEtudiantController {
    private readonly svc;
    constructor(svc: PortailEtudiantService);
    getProfil(user: any): Promise<any>;
    getEmploiDuTemps(user: any, dateDebut?: string, dateFin?: string): Promise<any>;
    getNotes(user: any, sessionId?: string): Promise<any>;
    getMoyennes(user: any): Promise<any>;
    getPaiements(user: any): Promise<any>;
    getSolde(user: any): Promise<any>;
    getAbsences(user: any): Promise<any>;
    justifierAbsence(user: any, dto: any): Promise<any>;
    getDocuments(user: any): Promise<any>;
    getCoursEnLigne(user: any): Promise<any>;
    getInscriptionExamens(user: any): Promise<any>;
    inscrireExamen(user: any, dto: {
        sessionId: string;
    }): Promise<any>;
}
