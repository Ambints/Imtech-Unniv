import { Repository, DataSource } from 'typeorm';
import { ContratPersonnel, CongePersonnel, FichePaie } from '../finance/finance.entities';
export declare class RHService {
    private contratRepo;
    private congeRepo;
    private fichePaieRepo;
    private dataSource;
    private readonly logger;
    constructor(contratRepo: Repository<ContratPersonnel>, congeRepo: Repository<CongePersonnel>, fichePaieRepo: Repository<FichePaie>, dataSource: DataSource);
    createContrat(data: Partial<ContratPersonnel>): Promise<ContratPersonnel>;
    findContrats(filters?: {
        typeContrat?: string;
        actif?: boolean;
        departementId?: string;
    }): Promise<ContratPersonnel[]>;
    renouvelerContrat(id: string, data: {
        nouvelleDateFin: Date;
        nouveauSalaire?: number;
    }): Promise<ContratPersonnel>;
    resilierContrat(id: string, motif: string): Promise<ContratPersonnel>;
    createHeuresComplementaires(data: any): Promise<any>;
    findHeuresComplementaires(filters?: {
        enseignantId?: string;
        statut?: string;
        mois?: number;
        annee?: number;
    }): Promise<any[]>;
    validerHeuresComplementaires(id: string, validePar: string): Promise<any>;
    getVolumeHoraireEnseignant(enseignantId: string, annee?: number): Promise<any>;
    demanderConge(data: Partial<CongePersonnel>): Promise<CongePersonnel>;
    findConges(filters?: {
        utilisateurId?: string;
        statut?: string;
        typeConge?: string;
    }): Promise<CongePersonnel[]>;
    approuverConge(id: string, data: {
        approuvePar: string;
        commentaire?: string;
    }): Promise<CongePersonnel>;
    refuserConge(id: string, data: {
        approuvePar: string;
        motif: string;
    }): Promise<CongePersonnel>;
    getSoldeConges(utilisateurId: string): Promise<any>;
    genererFichePaie(data: Partial<FichePaie>): Promise<FichePaie>;
    findFichesPaie(filters?: {
        contratId?: string;
        annee?: number;
        mois?: number;
    }): Promise<FichePaie[]>;
    validerFichePaie(id: string): Promise<FichePaie>;
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
