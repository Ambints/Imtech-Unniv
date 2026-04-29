export declare class TicketMaintenance {
    id: string;
    batimentId: string;
    salleId: string;
    titre: string;
    description: string;
    typeMaintenance: string;
    priorite: string;
    statut: string;
    signalePar: string;
    assigneA: string;
    dateSignalement: Date;
    dateResolution: Date;
    photosUrl: any;
    coutReparation: number;
    observations: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class ReservationSalle {
    id: string;
    salleId: string;
    titre: string;
    description: string;
    dateReservation: Date;
    heureDebut: string;
    heureFin: string;
    demandePar: string;
    approuvePar: string;
    statut: string;
    createdAt: Date;
}
export declare class Stock {
    id: string;
    reference: string;
    libelle: string;
    categorie: string;
    unite: string;
    quantiteStock: number;
    seuilAlerte: number;
    prixUnitaire: number;
    fournisseur: string;
    emplacement: string;
    derniereMiseAJour: Date;
    createdAt: Date;
}
export declare class MouvementStock {
    id: string;
    stockId: string;
    typeMouvement: string;
    quantite: number;
    motif: string;
    referenceDoc: string;
    utilisateurId: string;
    dateMouvement: Date;
}
export declare class PlanningEntretien {
    id: string;
    salleId: string;
    batimentId: string;
    zone: string;
    typeNettoyage: string;
    responsableId: string;
    jourSemaine: number;
    heureDebut: string;
    dureeMinutes: number;
    actif: boolean;
    createdAt: Date;
}
export declare class RapportEntretien {
    id: string;
    planningId: string;
    realisePar: string;
    dateRealisation: Date;
    heureDebut: string;
    heureFin: string;
    statut: string;
    observations: string;
    createdAt: Date;
}
