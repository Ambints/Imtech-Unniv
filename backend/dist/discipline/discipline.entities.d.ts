export declare class Incident {
    id: string;
    etudiantId: string;
    dateIncident: Date;
    lieu: string;
    description: string;
    temoins: string;
    gravite: 'mineure' | 'moyenne' | 'majeure' | 'critique';
    statut: 'en_attente' | 'valide' | 'rejette' | 'cloture';
    declarePar: string;
    validePar: string;
    dateValidation: Date;
    observations: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Sanction {
    id: string;
    etudiantId: string;
    incidentId: string;
    type: 'avertissement' | 'blame' | 'exclusion_temporaire' | 'exclusion_definitive' | 'travail_communautaire';
    dateDebut: Date;
    dateFin: Date;
    motif: string;
    decidePar: string;
    statut: 'en_cours' | 'executee' | 'annulee' | 'appelee';
    dateNotification: Date;
    parentNotifie: boolean;
    observations: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Avertissement {
    id: string;
    etudiantId: string;
    niveau: number;
    motif: string;
    emisPar: string;
    dateEmission: Date;
    dateLecture: Date;
    eluConseil: boolean;
    dateConseil: Date;
    statut: 'actif' | 'retire' | 'acquitte';
    observations: string;
    createdAt: Date;
    updatedAt: Date;
}
