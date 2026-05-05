import { DataSource } from 'typeorm';
export declare class PortailParentService {
    private dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    private verifierLienParentEnfant;
    getEnfants(parentUserId: string): Promise<any>;
    getBulletin(parentUserId: string, etudiantId: string, sessionId?: string): Promise<any>;
    getAbsences(parentUserId: string, etudiantId: string): Promise<any>;
    getPaiements(parentUserId: string, etudiantId: string): Promise<any>;
    getSolde(parentUserId: string, etudiantId: string): Promise<any>;
    getEmploiDuTemps(parentUserId: string, etudiantId: string, dateDebut?: string, dateFin?: string): Promise<any>;
    autoriserSortie(parentUserId: string, dto: any): Promise<any>;
    justifierAbsenceParent(parentUserId: string, dto: any): Promise<any>;
    getNotifications(parentUserId: string): Promise<any>;
}
