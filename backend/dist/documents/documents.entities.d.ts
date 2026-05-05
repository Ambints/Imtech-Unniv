export declare class ReleveNote {
    id: string;
    etudiantId: string;
    anneeAcademiqueId: string;
    semestre: number;
    moyenneGenerale: number;
    creditsValides: number;
    creditsTotal: number;
    mention: 'passable' | 'assez_bien' | 'bien' | 'tres_bien' | 'excellent' | 'ajourne';
    numeroReleve: string;
    fichierUrl: string;
    statut: 'brouillon' | 'valide' | 'signe' | 'delivre' | 'archive';
    generePar: string;
    dateGeneration: Date;
    validePar: string;
    dateValidation: Date;
    signePar: string;
    dateSignature: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Attestation {
    id: string;
    etudiantId: string;
    type: 'scolarite' | 'reussite' | 'inscription' | 'stage' | 'bourse' | 'paiement' | 'comportement';
    anneeAcademiqueId: string;
    numeroAttestation: string;
    contenu: string;
    fichierUrl: string;
    statut: 'en_preparation' | 'valide' | 'signe' | 'delivre';
    demandePar: string;
    dateDemande: Date;
    validePar: string;
    dateValidation: Date;
    signePar: string;
    dateSignature: Date;
    dateDelivrance: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Diplome {
    id: string;
    etudiantId: string;
    parcoursId: string;
    anneeAcademiqueId: string;
    typeDiplome: 'licence' | 'master' | 'doctorat' | 'certificat' | 'attestation';
    mentionObtenue: 'passable' | 'assez_bien' | 'bien' | 'tres_bien' | 'excellent';
    numeroDiplome: string;
    numeroLivret: string;
    moyenneGenerale: number;
    dateObtention: Date;
    fichierDiplomeUrl: string;
    fichierSupplementUrl: string;
    statut: 'en_preparation' | 'valide' | 'signe' | 'delivre' | 'archive';
    generePar: string;
    validePar: string;
    dateValidation: Date;
    signeNumeriquement: boolean;
    signaturePresidentUrl: string;
    dateSignature: Date;
    dateDelivrance: Date;
    createdAt: Date;
    updatedAt: Date;
}
