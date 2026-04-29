import { Repository } from 'typeorm';
import { Parcours, UniteEnseignement, Note, Inscription, Presence, Salle, EmploiDuTemps } from './academic.entities';
export declare class AcademicService {
    private parcoursRepo;
    private ueRepo;
    private noteRepo;
    private inscriptionRepo;
    private presenceRepo;
    private salleRepo;
    private edtRepo;
    constructor(parcoursRepo: Repository<Parcours>, ueRepo: Repository<UniteEnseignement>, noteRepo: Repository<Note>, inscriptionRepo: Repository<Inscription>, presenceRepo: Repository<Presence>, salleRepo: Repository<Salle>, edtRepo: Repository<EmploiDuTemps>);
    createParcours(tid: string, dto: any): Promise<Parcours[]>;
    getParcours(tid?: string): Promise<Parcours[]>;
    createUE(tid: string, dto: any): Promise<UniteEnseignement[]>;
    getUEByParcours(tid: string, parcoursId: string): Promise<UniteEnseignement[]>;
    saisirNote(tid: string, dto: any, saisiPar: string): Promise<any>;
    private calcMoyenne;
    private getMention;
    deliberer(tid: string, parcoursId: string, sessionId: string, annee?: string): Promise<{
        message: string;
        count: number;
    }>;
    getReleverNotes(tid: string, etudiantId: string, sessionId: string): Promise<Note[]>;
    inscrire(tid: string, dto: any): Promise<Inscription[]>;
    getInscriptions(tid: string, parcoursId?: string): Promise<Inscription[]>;
    saisirPresence(tid: string, dto: any): Promise<Presence[]>;
    getPresencesEtudiant(tid: string, etudiantId: string): Promise<Presence[]>;
    saisirAbsence(tid: string, dto: any): Promise<Presence[]>;
    getAbsencesEtudiant(tid: string, etudiantId: string): Promise<Presence[]>;
    getSalles(tid: string): Promise<Salle[]>;
    createSalle(tid: string, dto: any): Promise<Salle[]>;
    getEDT(tid?: string, parcoursId?: string): Promise<EmploiDuTemps[]>;
    createEDT(tid: string, dto: any): Promise<EmploiDuTemps[]>;
}
