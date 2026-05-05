import { ExamensService } from './examens.service';
export declare class ExamensController {
    private readonly svc;
    constructor(svc: ExamensService);
    createSujet(dto: any): Promise<import("./examens.entities").SujetExamen>;
    findSujets(filters: any): Promise<import("./examens.entities").SujetExamen[]>;
    validerSujet(id: string, validePar: string): Promise<import("./examens.entities").SujetExamen>;
    refuserSujet(id: string, motif: string): Promise<import("./examens.entities").SujetExamen>;
    createDeliberation(dto: any): Promise<import("./examens.entities").Deliberation>;
    findDeliberations(sessionId: string): Promise<import("./examens.entities").Deliberation[]>;
    verrouillerDeliberation(id: string, verrouillePar: string): Promise<import("./examens.entities").Deliberation>;
    publierDeliberation(id: string): Promise<import("./examens.entities").Deliberation>;
    ajouterJury(deliberationId: string, dto: any): Promise<import("./examens.entities").Jury>;
    getJury(deliberationId: string): Promise<import("./examens.entities").Jury[]>;
    createPV(dto: any): Promise<import("./examens.entities").PVNote>;
    getPV(deliberationId: string): Promise<import("./examens.entities").PVNote[]>;
    getStatsDeliberation(deliberationId: string): Promise<any>;
}
