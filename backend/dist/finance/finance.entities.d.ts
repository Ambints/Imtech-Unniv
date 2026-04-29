export declare class GrilleTarifaire {
    id: string;
    parcoursId: string;
    anneeAcademiqueId: string;
    anneeNiveau: number;
    montantTotal: number;
    nbTranches: number;
    description: string;
    actif: boolean;
    createdAt: Date;
}
export declare class Echeancier {
    id: string;
    inscriptionId: string;
    numTranche: number;
    montantDu: number;
    dateEcheance: Date;
    statut: string;
    createdAt: Date;
}
export declare class Paiement {
    id: string;
    inscriptionId: string;
    echeancierId: string;
    montant: number;
    modePaiement: string;
    datePaiement: Date;
    reference: string;
    numeroRecu: string;
    recuUrl: string;
    caissierId: string;
    statut: string;
    motifAnnulation: string;
    observations: string;
    createdAt: Date;
}
export declare class Budget {
    id: string;
    anneeAcademiqueId: string;
    departementId: string;
    categorie: string;
    montantPrevu: number;
    montantRealise: number;
    description: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Depense {
    id: string;
    budgetId: string;
    anneeAcademiqueId: string;
    libelle: string;
    montant: number;
    categorie: string;
    dateDepense: Date;
    fournisseur: string;
    numeroFacture: string;
    factureUrl: string;
    statut: string;
    demandePar: string;
    approuvePar: string;
    dateApprobation: Date;
    observations: string;
    createdAt: Date;
}
export declare class ContratPersonnel {
    id: string;
    utilisateurId: string;
    typeContrat: string;
    poste: string;
    departementId: string;
    dateDebut: Date;
    dateFin: Date;
    salaireBrut: number;
    salaireNet: number;
    volumeHoraireHebdo: number;
    actif: boolean;
    fichierContratUrl: string;
    observations: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CongePersonnel {
    id: string;
    utilisateurId: string;
    typeConge: string;
    dateDebut: Date;
    dateFin: Date;
    motif: string;
    statut: string;
    approuvePar: string;
    dateApprobation: Date;
    createdAt: Date;
}
export declare class FichePaie {
    id: string;
    contratId: string;
    annee: number;
    mois: number;
    salaireBrut: number;
    cotisations: number;
    primes: number;
    retenues: number;
    netAPayer: number;
    heuresSupp: number;
    montantHeuresSupp: number;
    statut: string;
    fichierUrl: string;
    createdAt: Date;
}
