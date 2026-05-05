export declare class SujetExamen {
    id: string;
    sessionId: string;
    ecId: string;
    titre: string;
    description: string;
    dureeMinutes: number;
    coefficient: number;
    fichierSujetUrl: string;
    fichierCorrectionUrl: string;
    deposePar: string;
    dateDepot: Date;
    validePar: string;
    dateValidation: Date;
    statut: 'en_preparation' | 'soumis' | 'valide' | 'refuse' | 'archive';
    relecteurs: string[];
    historique: any;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Deliberation {
    id: string;
    sessionId: string;
    ueId: string;
    dateDeliberation: Date;
    presidentJury: string;
    membresJury: string[];
    moyenneGenerale: number;
    tauxReussite: number;
    pvSigneUrl: string;
    statut: 'en_cours' | 'verrouille' | 'publie' | 'archive';
    verrouillePar: string;
    dateVerrouillage: Date;
    observations: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Jury {
    id: string;
    deliberationId: string;
    enseignantId: string;
    role: 'president' | 'membre' | 'secretaire' | 'invite';
    dateConvocation: Date;
    present: boolean;
    signatureUrl: string;
    createdAt: Date;
}
export declare class PVNote {
    id: string;
    deliberationId: string;
    etudiantId: string;
    moyenneUe: number;
    moyenneGenerale: number;
    creditsAcquis: number;
    mention: 'passable' | 'assez_bien' | 'bien' | 'tres_bien' | 'excellent';
    decision: 'passe' | 'redouble' | 'exclu' | 'ajourne';
    appreciation: string;
    valide: boolean;
    createdAt: Date;
}
