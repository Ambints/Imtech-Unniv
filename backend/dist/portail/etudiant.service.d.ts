import { DataSource } from 'typeorm';
export declare class PortailEtudiantService {
    private dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    getProfil(utilisateurId: string): Promise<any>;
    getEmploiDuTemps(utilisateurId: string, dateDebut?: string, dateFin?: string): Promise<any>;
    getNotes(utilisateurId: string, sessionId?: string): Promise<any>;
    getMoyennes(utilisateurId: string): Promise<any>;
    getPaiements(utilisateurId: string): Promise<any>;
    getSolde(utilisateurId: string): Promise<any>;
    getAbsences(utilisateurId: string): Promise<any>;
    justifierAbsence(utilisateurId: string, dto: any): Promise<any>;
    getDocuments(utilisateurId: string): Promise<any>;
    getCoursEnLigne(utilisateurId: string): Promise<any>;
    getInscriptionsExamens(utilisateurId: string): Promise<any>;
    inscrireExamen(utilisateurId: string, sessionId: string): Promise<any>;
}
