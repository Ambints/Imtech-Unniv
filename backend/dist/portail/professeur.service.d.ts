import { DataSource } from 'typeorm';
export declare class PortailProfesseurService {
    private dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    getProfil(utilisateurId: string): Promise<any>;
    getMesCours(utilisateurId: string, anneeAcademiqueId?: string): Promise<any[]>;
    getEtudiantsParCours(affectationId: string): Promise<any[]>;
    uploadSupportCours(data: any, utilisateurId: string): Promise<any>;
    getSupportsCours(utilisateurId: string, ecId?: string): Promise<any[]>;
    partagerSupport(supportId: string, parcoursIds: string[]): Promise<any>;
    getSeancesAujourdhui(utilisateurId: string): Promise<any[]>;
    getPresencesSeance(seanceId: string): Promise<any[]>;
    pointerPresences(seanceId: string, presences: {
        etudiantId: string;
        statut: 'present' | 'absent' | 'retard';
    }[], pointePar: string): Promise<any>;
    pointerPresenceQR(seanceId: string, qrData: string, pointePar: string): Promise<any>;
    genererQRProfesseur(utilisateurId: string): Promise<any>;
    getSessionsEvaluation(utilisateurId: string): Promise<any[]>;
    getInterfaceSaisieNotes(sessionId: string, affectationId: string): Promise<any>;
    saisirNotes(notes: {
        etudiantId: string;
        valeur: number;
        appreciation?: string;
    }[], sessionId: string, ecId: string, saisiPar: string): Promise<any>;
    modifierNote(noteId: string, dto: {
        valeur?: number;
        appreciation?: string;
    }, modifiePar: string): Promise<any>;
    getApercuNotes(sessionId: string, affectationId: string): Promise<any>;
    deposerSujetExamen(data: any): Promise<any>;
    deposerCorrection(id: string, fichierCorrectionUrl: string, deposePar: string): Promise<any>;
    getMesSujets(utilisateurId: string): Promise<any[]>;
    envoyerMessageGroupe(dto: any, expediteurId: string): Promise<any>;
    envoyerMessageIndividuel(dto: any, expediteurId: string): Promise<any>;
    getStagesSupervises(utilisateurId: string): Promise<any[]>;
    remplirFicheSuivi(stageId: string, dto: any, auteurId: string): Promise<any>;
    evaluerSoutenance(soutenanceId: string, dto: any, evaluateurId: string): Promise<any>;
    demanderRessources(dto: any, demandeurId: string): Promise<any>;
    getMesDemandesRessources(utilisateurId: string): Promise<any[]>;
    getSallesDisponibles(date: string, heureDebut: string, heureFin: string, type?: string): Promise<any[]>;
    getMesStats(utilisateurId: string, anneeAcademiqueId?: string): Promise<any>;
    getTauxReussiteEC(affectationId: string): Promise<any>;
}
