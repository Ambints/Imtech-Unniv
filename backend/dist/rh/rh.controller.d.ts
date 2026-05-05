import { RHService } from './rh.service';
export declare class RHController {
    private readonly svc;
    constructor(svc: RHService);
    createContrat(dto: any): Promise<import("../finance/finance.entities").ContratPersonnel>;
    findContrats(filters: any): Promise<import("../finance/finance.entities").ContratPersonnel[]>;
    renouvelerContrat(id: string, dto: any): Promise<import("../finance/finance.entities").ContratPersonnel>;
    resilierContrat(id: string, motif: string): Promise<import("../finance/finance.entities").ContratPersonnel>;
    createHeuresComp(dto: any): Promise<any>;
    findHeuresComp(filters: any): Promise<any[]>;
    validerHeuresComp(id: string, validePar: string): Promise<any>;
    getVolumeHoraire(enseignantId: string, annee: number): Promise<any>;
    demanderConge(dto: any): Promise<import("../finance/finance.entities").CongePersonnel>;
    findConges(filters: any): Promise<import("../finance/finance.entities").CongePersonnel[]>;
    approuverConge(id: string, dto: {
        approuvePar: string;
        commentaire?: string;
    }): Promise<import("../finance/finance.entities").CongePersonnel>;
    refuserConge(id: string, dto: {
        approuvePar: string;
        motif: string;
    }): Promise<import("../finance/finance.entities").CongePersonnel>;
    getSoldeConges(utilisateurId: string): Promise<any>;
    createFichePaie(dto: any): Promise<import("../finance/finance.entities").FichePaie>;
    findFichesPaie(filters: any): Promise<import("../finance/finance.entities").FichePaie[]>;
    validerFichePaie(id: string): Promise<import("../finance/finance.entities").FichePaie>;
    genererFichesPaieMasse(annee: number, mois: number): Promise<any>;
    createEvaluation(dto: any): Promise<any>;
    findEvaluations(filters: any): Promise<any[]>;
    submitAutoEvaluation(id: string, dto: any): Promise<any>;
    finaliserEvaluation(id: string, dto: any): Promise<any>;
    createDeclarationSociale(dto: any): Promise<any>;
    findDeclarationsSociales(filters: any): Promise<any[]>;
    exportDeclaration(id: string): Promise<any>;
    createRecrutement(dto: any): Promise<any>;
    findRecrutements(filters: any): Promise<any[]>;
    getStatsRH(): Promise<any>;
    getStatsHeuresComp(annee: number, mois: number): Promise<any>;
}
