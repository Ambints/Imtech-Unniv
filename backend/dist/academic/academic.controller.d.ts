import { AcademicService } from './academic.service';
export declare class AcademicController {
    private readonly svc;
    constructor(svc: AcademicService);
    getDepartementsFromContext(): Promise<import("./academic.entities").Departement[]>;
    getDepartements(tid: string): Promise<import("./academic.entities").Departement[]>;
    createDepartement(tid: string, dto: any): Promise<import("./academic.entities").Departement[]>;
    updateDepartement(tid: string, id: string, dto: any): Promise<any>;
    deleteDepartement(tid: string, id: string): Promise<{
        message: string;
    }>;
    createParcours(tid: string, dto: any): Promise<import("./academic.entities").Parcours[]>;
    getParcours(tid: string, req: any): Promise<any[]>;
    updateParcours(tid: string, id: string, dto: any): Promise<any>;
    deleteParcours(tid: string, id: string): Promise<{
        message: string;
    }>;
    createUE(tid: string, dto: any): Promise<import("./academic.entities").UniteEnseignement[]>;
    getUE(tid: string, pid: string): Promise<import("./academic.entities").UniteEnseignement[]>;
    updateUE(tid: string, id: string, dto: any): Promise<any>;
    getSessionsExamen(tid: string): Promise<import("./academic.entities").SessionExamen[]>;
    getPresences(tid: string, statut?: string): Promise<import("./academic.entities").Presence[]>;
    deleteUE(tid: string, id: string): Promise<{
        message: string;
    }>;
    getEtudiants(tid: string, pid?: string): Promise<import("./academic.entities").Etudiant[]>;
    getStudents(tid: string, pid?: string): Promise<import("./academic.entities").Etudiant[]>;
    createEtudiant(tid: string, dto: any): Promise<{
        utilisateurId: any;
        compteCreé: boolean;
        message: string;
        id: string;
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
    } | {
        compteCreé: boolean;
        message: string;
        error: string;
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
    }>;
    updateEtudiant(tid: string, id: string, dto: any): Promise<any>;
    deleteEtudiant(tid: string, id: string): Promise<{
        message: string;
        student: {
            id: string;
            matricule: string;
            nom: string;
            prenom: string;
        };
        relatedRecords: {
            inscriptions: number;
            notes: number;
            presences: number;
        };
    }>;
    saisirNote(tid: string, dto: any): Promise<any>;
    getNotes(tid: string, eid: string, annee: string): Promise<import("./academic.entities").Note[]>;
    deliberer(tid: string, body: any): Promise<{
        message: string;
        count: number;
    }>;
    inscrire(tid: string, dto: any): Promise<import("./academic.entities").Inscription[]>;
    getInscriptions(tid: string, pid?: string): Promise<import("./academic.entities").Inscription[]>;
    saisirAbsence(tid: string, dto: any): Promise<import("./academic.entities").Presence[]>;
    getAbsences(tid: string, eid: string): Promise<import("./academic.entities").Presence[]>;
    createSalle(tid: string, dto: any): Promise<import("./academic.entities").Salle[]>;
    getSalles(tid: string): Promise<import("./academic.entities").Salle[]>;
    createEDT(tid: string, dto: any): Promise<import("./academic.entities").EmploiDuTemps[]>;
    getEDT(tid: string, pid: string): Promise<import("./academic.entities").EmploiDuTemps[]>;
    getAnneesAcademiques(tid: string): Promise<import("./academic.entities").AnneeAcademique[]>;
    getEnseignants(tid: string): Promise<any>;
    createAnneeAcademique(tid: string, dto: any): Promise<import("./academic.entities").AnneeAcademique[]>;
    updateAnneeAcademique(tid: string, id: string, dto: any): Promise<any>;
    activerAnneeAcademique(tid: string, id: string): Promise<{
        message: string;
        annee: {
            active: boolean;
            id: string;
            libelle: string;
            dateDebut: Date;
            dateFin: Date;
            createdAt: Date;
        };
    }>;
}
