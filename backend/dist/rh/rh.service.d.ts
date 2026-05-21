import { DataSource } from 'typeorm';
export declare class RHService {
    private dataSource;
    private request;
    private readonly logger;
    private tenantSchema;
    constructor(dataSource: DataSource, request: any);
    private query;
    private toCamelCase;
    getUtilisateurs(): Promise<any[]>;
    getDepartements(): Promise<any[]>;
    createContrat(data: any): Promise<any>;
    findContrats(filters?: {
        typeContrat?: string;
        actif?: boolean;
        departementId?: string;
    }): Promise<any[]>;
    renouvelerContrat(id: string, data: {
        nouvelleDateFin: Date;
        nouveauSalaire?: number;
    }): Promise<any>;
    resilierContrat(id: string, motif: string): Promise<any>;
    createHeuresComplementaires(data: any): Promise<any>;
    findHeuresComplementaires(filters?: {
        enseignantId?: string;
        statut?: string;
        mois?: number;
        annee?: number;
    }): Promise<any[]>;
    validerHeuresComplementaires(id: string, validePar: string): Promise<any>;
    getVolumeHoraireEnseignant(enseignantId: string, annee?: number): Promise<any>;
    demanderConge(data: any): Promise<any>;
    findConges(filters?: {
        utilisateurId?: string;
        statut?: string;
        typeConge?: string;
    }): Promise<any[]>;
    approuverConge(id: string, data: {
        approuvePar: string;
        commentaire?: string;
    }): Promise<any>;
    refuserConge(id: string, data: {
        approuvePar: string;
        motif: string;
    }): Promise<any>;
    getSoldeConges(utilisateurId: string): Promise<any>;
    genererFichePaie(data: any): Promise<any>;
    findFichesPaie(filters?: {
        contratId?: string;
        annee?: number;
        mois?: number;
    }): Promise<any[]>;
    validerFichePaie(id: string): Promise<any>;
    genererFichesPaieMasse(annee: number, mois: number): Promise<any>;
    createEvaluation(data: any): Promise<any>;
    findEvaluations(filters?: {
        utilisateurId?: string;
        annee?: number;
        statut?: string;
    }): Promise<any[]>;
    submitAutoEvaluation(id: string, data: any): Promise<any>;
    finaliserEvaluation(id: string, data: any): Promise<any>;
    createDeclarationSociale(data: any): Promise<any>;
    findDeclarationsSociales(filters?: {
        type?: string;
        organisme?: string;
        statut?: string;
    }): Promise<any[]>;
    exportDeclarationSociale(id: string): Promise<any>;
    createRecrutement(data: any): Promise<any>;
    findRecrutements(filters?: {
        statut?: string;
        departementId?: string;
    }): Promise<any[]>;
    getStatsRH(): Promise<any>;
    getStatsHeuresComplementaires(annee: number, mois: number): Promise<any>;
}
