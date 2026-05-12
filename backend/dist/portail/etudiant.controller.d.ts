import { PortailEtudiantService } from './etudiant.service';
export declare class PortailEtudiantController {
    private readonly svc;
    constructor(svc: PortailEtudiantService);
    searchEtudiants(tid: string, query: string): Promise<any[]>;
    getProfil(tid: string, user: any): Promise<any>;
    getEmploiDuTemps(tid: string, user: any, dateDebut?: string, dateFin?: string): Promise<any>;
    getNotes(tid: string, user: any, sessionId?: string): Promise<any>;
    getMoyennes(tid: string, user: any): Promise<any>;
    getPaiements(tid: string, user: any): Promise<any>;
    getSolde(tid: string, user: any): Promise<any>;
    getAbsences(tid: string, user: any): Promise<any>;
    justifierAbsence(tid: string, user: any, dto: any): Promise<any>;
    getDocuments(tid: string, user: any): Promise<any>;
    getCoursEnLigne(tid: string, user: any): Promise<any>;
    getInscriptionExamens(tid: string, user: any): Promise<any>;
    inscrireExamen(tid: string, user: any, dto: {
        sessionId: string;
    }): Promise<any>;
    getInscriptions(tid: string, user: any): Promise<any>;
    getParcoursDisponibles(tid: string, user: any): Promise<any>;
    getAnneesAcademiques(tid: string): Promise<any>;
    createInscription(tid: string, user: any, dto: {
        parcoursId: string;
        anneeAcademiqueId: string;
        anneeNiveau: number;
        typeInscription?: string;
    }): Promise<any>;
    updateInscription(tid: string, id: string, user: any, dto: any): Promise<any>;
    cancelInscription(tid: string, id: string, user: any): Promise<any>;
}
