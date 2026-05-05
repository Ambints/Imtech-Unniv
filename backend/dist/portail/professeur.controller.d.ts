import { PortailProfesseurService } from './professeur.service';
export declare class PortailProfesseurController {
    private readonly svc;
    constructor(svc: PortailProfesseurService);
    getProfil(user: any): Promise<any>;
    getMesCours(user: any, anneeAcademiqueId?: string): Promise<any[]>;
    getMesEtudiants(affectationId: string): Promise<any[]>;
    uploadSupportCours(dto: any, fichier: any, user: any): Promise<any>;
    getSupportsCours(user: any, ecId?: string): Promise<any[]>;
    partagerSupport(id: string, parcoursIds: string[]): Promise<any>;
    getSeancesAujourdhui(user: any): Promise<any[]>;
    getPresencesSeance(seanceId: string): Promise<any[]>;
    pointerPresences(seanceId: string, presences: {
        etudiantId: string;
        statut: 'present' | 'absent' | 'retard';
    }[], user: any): Promise<any>;
    pointerPresenceQR(seanceId: string, qrData: string, user: any): Promise<any>;
    getMonQR(user: any): Promise<any>;
    getSessionsEvaluation(user: any): Promise<any[]>;
    getInterfaceSaisieNotes(sessionId: string, affectationId: string): Promise<any>;
    saisirNotes(notes: {
        etudiantId: string;
        valeur: number;
        appreciation?: string;
    }[], sessionId: string, ecId: string, user: any): Promise<any>;
    modifierNote(noteId: string, dto: {
        valeur?: number;
        appreciation?: string;
    }, user: any): Promise<any>;
    getApercuNotes(sessionId: string, affectationId: string): Promise<any>;
    deposerSujetExamen(dto: any, fichierSujet: any, user: any): Promise<any>;
    deposerCorrection(id: string, fichierCorrection: any, user: any): Promise<any>;
    getMesSujets(user: any): Promise<any[]>;
    envoyerMessageGroupe(dto: {
        parcoursId?: string;
        niveau?: number;
        affectationId?: string;
        message: string;
        sujet?: string;
    }, user: any): Promise<any>;
    envoyerMessageIndividuel(dto: {
        etudiantId: string;
        message: string;
        sujet?: string;
    }, user: any): Promise<any>;
    getStagesSupervises(user: any): Promise<any[]>;
    remplirFicheSuivi(stageId: string, dto: any, user: any): Promise<any>;
    evaluerSoutenance(soutenanceId: string, dto: {
        note: number;
        appreciation: string;
    }, user: any): Promise<any>;
    demanderRessources(dto: any, user: any): Promise<any>;
    getMesDemandesRessources(user: any): Promise<any[]>;
    getSallesDisponibles(date: string, heureDebut: string, heureFin: string, type?: string): Promise<any[]>;
    getMesStats(user: any, anneeAcademiqueId?: string): Promise<any>;
    getTauxReussiteEC(affectationId: string): Promise<any>;
}
