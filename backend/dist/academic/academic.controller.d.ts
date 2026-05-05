import { AcademicService } from './academic.service';
export declare class AcademicController {
    private readonly svc;
    constructor(svc: AcademicService);
    getDepartements(tid: string): Promise<import("./academic.entities").Departement[]>;
    createDepartement(tid: string, dto: any): Promise<import("./academic.entities").Departement[]>;
    updateDepartement(tid: string, id: string, dto: any): Promise<any>;
    deleteDepartement(tid: string, id: string): Promise<{
        message: string;
    }>;
    createParcours(tid: string, dto: any): Promise<import("./academic.entities").Parcours[]>;
    getParcours(tid: string): Promise<import("./academic.entities").Parcours[]>;
    updateParcours(tid: string, id: string, dto: any): Promise<any>;
    deleteParcours(tid: string, id: string): Promise<{
        message: string;
    }>;
    createUE(tid: string, dto: any): Promise<import("./academic.entities").UniteEnseignement[]>;
    getUE(tid: string, pid: string): Promise<import("./academic.entities").UniteEnseignement[]>;
    updateUE(tid: string, id: string, dto: any): Promise<any>;
    deleteUE(tid: string, id: string): Promise<{
        message: string;
    }>;
    getEtudiants(tid: string, pid?: string): Promise<import("./academic.entities").Etudiant[]>;
    createEtudiant(tid: string, dto: any): Promise<import("./academic.entities").Etudiant[]>;
    updateEtudiant(tid: string, id: string, dto: any): Promise<any>;
    deleteEtudiant(tid: string, id: string): Promise<{
        message: string;
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
}
