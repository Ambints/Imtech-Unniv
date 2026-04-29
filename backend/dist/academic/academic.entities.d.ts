export declare class Parcours {
    id: string;
    departementId: string;
    code: string;
    nom: string;
    niveau: string;
    dureeAnnees: number;
    responsableId: string;
    description: string;
    actif: boolean;
    anneeOuverture: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class UniteEnseignement {
    id: string;
    parcoursId: string;
    code: string;
    intitule: string;
    creditsEcts: number;
    coefficient: number;
    volumeCm: number;
    volumeTd: number;
    volumeTp: number;
    semestre: number;
    anneeNiveau: number;
    typeUe: string;
    actif: boolean;
    createdAt: Date;
}
export declare class ElementConstitutif {
    id: string;
    ueId: string;
    code: string;
    intitule: string;
    coefficient: number;
    actif: boolean;
    createdAt: Date;
}
export declare class Departement {
    id: string;
    code: string;
    nom: string;
    description: string;
    responsableId: string;
    actif: boolean;
    createdAt: Date;
}
export declare class AnneeAcademique {
    id: string;
    libelle: string;
    dateDebut: Date;
    dateFin: Date;
    active: boolean;
    createdAt: Date;
}
export declare class CalendrierAcademique {
    id: string;
    anneeAcademiqueId: string;
    evenement: string;
    typeEvenement: string;
    dateDebut: Date;
    dateFin: Date;
    parcoursId: string;
    description: string;
    createdAt: Date;
}
export declare class Etudiant {
    id: string;
    utilisateurId: string;
    matricule: string;
    nom: string;
    prenom: string;
    dateNaissance: Date;
    lieuNaissance: string;
    sexe: string;
    nationalite: string;
    adresse: string;
    telephone: string;
    email: string;
    nomParent: string;
    telephoneParent: string;
    emailParent: string;
    religion: string;
    situationFamiliale: string;
    photoUrl: string;
    dossierMedicalUrl: string;
    actif: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Inscription {
    id: string;
    etudiantId: string;
    parcoursId: string;
    anneeAcademiqueId: string;
    anneeNiveau: number;
    typeInscription: string;
    statut: string;
    numeroCarte: string;
    dateInscription: Date;
    bourse: boolean;
    typeBourse: string;
    montantBourse: number;
    observations: string;
    valideePar: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Enseignant {
    id: string;
    utilisateurId: string;
    matricule: string;
    nom: string;
    prenom: string;
    titre: string;
    grade: string;
    specialite: string;
    typeContrat: string;
    departementId: string;
    email: string;
    telephone: string;
    actif: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class AffectationCours {
    id: string;
    enseignantId: string;
    ueId: string;
    ecId: string;
    anneeAcademiqueId: string;
    typeSeance: string;
    volumePrevu: number;
    volumeRealise: number;
    validePar: string;
    createdAt: Date;
}
export declare class Salle {
    id: string;
    batimentId: string;
    nom: string;
    code: string;
    capacite: number;
    typeSalle: string;
    equipements: any;
    disponible: boolean;
    etage: number;
    createdAt: Date;
}
export declare class Batiment {
    id: string;
    nom: string;
    code: string;
    adresse: string;
    actif: boolean;
}
export declare class EmploiDuTemps {
    id: string;
    anneeAcademiqueId: string;
    affectationId: string;
    salleId: string;
    dateSeance: Date;
    heureDebut: string;
    heureFin: string;
    typeSeance: string;
    statut: string;
    motifAnnulation: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class Presence {
    id: string;
    etudiantId: string;
    seanceId: string;
    statut: string;
    heureArrivee: string;
    justifie: boolean;
    justificatifUrl: string;
    motif: string;
    modePointage: string;
    saisiPar: string;
    validePar: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class SessionExamen {
    id: string;
    anneeAcademiqueId: string;
    libelle: string;
    typeSession: string;
    semestre: number;
    dateDebut: Date;
    dateFin: Date;
    statut: string;
    createdAt: Date;
}
export declare class Note {
    id: string;
    etudiantId: string;
    ecId: string;
    ueId: string;
    sessionId: string;
    valeur: number;
    typeEvaluation: string;
    absenceJustifiee: boolean;
    mention: string;
    verrouille: boolean;
    hashIntegrite: string;
    saisiPar: string;
    validePar: string;
    dateSaisie: Date;
    dateVerrouillage: Date;
    observations: string;
    createdAt: Date;
    updatedAt: Date;
}
