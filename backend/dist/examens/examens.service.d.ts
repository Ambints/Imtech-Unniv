import { Repository } from 'typeorm';
import { SujetExamen, Deliberation, Jury, PVNote } from './examens.entities';
export declare class ExamensService {
    private sujetRepo;
    private deliberationRepo;
    private juryRepo;
    private pvNoteRepo;
    private readonly logger;
    constructor(sujetRepo: Repository<SujetExamen>, deliberationRepo: Repository<Deliberation>, juryRepo: Repository<Jury>, pvNoteRepo: Repository<PVNote>);
    createSujet(data: Partial<SujetExamen>): Promise<SujetExamen>;
    findSujets(filters?: {
        sessionId?: string;
        ecId?: string;
        statut?: string;
    }): Promise<SujetExamen[]>;
    validerSujet(id: string, validePar: string): Promise<SujetExamen>;
    refuserSujet(id: string, motif: string): Promise<SujetExamen>;
    createDeliberation(data: Partial<Deliberation>): Promise<Deliberation>;
    findDeliberations(sessionId: string): Promise<Deliberation[]>;
    verrouillerDeliberation(id: string, verrouillePar: string): Promise<Deliberation>;
    publierDeliberation(id: string): Promise<Deliberation>;
    ajouterMembreJury(data: Partial<Jury>): Promise<Jury>;
    getJuryByDeliberation(deliberationId: string): Promise<Jury[]>;
    createPVNote(data: Partial<PVNote>): Promise<PVNote>;
    getPVByDeliberation(deliberationId: string): Promise<PVNote[]>;
    calculerStatsDeliberation(deliberationId: string): Promise<any>;
}
