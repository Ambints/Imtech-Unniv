import { PortailParentService } from './parent.service';
export declare class PortailParentController {
    private readonly svc;
    constructor(svc: PortailParentService);
    getEnfants(user: any): Promise<any>;
    getBulletin(user: any, etudiantId: string, sessionId?: string): Promise<any>;
    getAbsences(user: any, etudiantId: string): Promise<any>;
    getPaiements(user: any, etudiantId: string): Promise<any>;
    getSolde(user: any, etudiantId: string): Promise<any>;
    getEmploiDuTemps(user: any, etudiantId: string, dateDebut?: string, dateFin?: string): Promise<any>;
    autoriserSortie(user: any, dto: any): Promise<any>;
    justifierAbsence(user: any, dto: any): Promise<any>;
    getNotifications(user: any): Promise<any>;
}
