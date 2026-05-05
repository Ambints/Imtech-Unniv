"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ExamensService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamensService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const examens_entities_1 = require("./examens.entities");
let ExamensService = ExamensService_1 = class ExamensService {
    constructor(sujetRepo, deliberationRepo, juryRepo, pvNoteRepo) {
        this.sujetRepo = sujetRepo;
        this.deliberationRepo = deliberationRepo;
        this.juryRepo = juryRepo;
        this.pvNoteRepo = pvNoteRepo;
        this.logger = new common_1.Logger(ExamensService_1.name);
    }
    async createSujet(data) {
        const sujet = this.sujetRepo.create({ ...data, statut: 'soumis' });
        return this.sujetRepo.save(sujet);
    }
    async findSujets(filters) {
        const query = this.sujetRepo.createQueryBuilder('s');
        if (filters?.sessionId)
            query.andWhere('s.sessionId = :sessionId', { sessionId: filters.sessionId });
        if (filters?.ecId)
            query.andWhere('s.ecId = :ecId', { ecId: filters.ecId });
        if (filters?.statut)
            query.andWhere('s.statut = :statut', { statut: filters.statut });
        return query.orderBy('s.dateDepot', 'DESC').getMany();
    }
    async validerSujet(id, validePar) {
        await this.sujetRepo.update(id, {
            statut: 'valide',
            validePar,
            dateValidation: new Date(),
            historique: () => `COALESCE(historique, '[]'::jsonb) || '[{"action": "validation", "date": "${new Date().toISOString()}"}]'::jsonb`
        });
        return this.sujetRepo.findOne({ where: { id } });
    }
    async refuserSujet(id, motif) {
        await this.sujetRepo.update(id, {
            statut: 'refuse',
            historique: () => `COALESCE(historique, '[]'::jsonb) || '[{"action": "refus", "motif": "${motif}", "date": "${new Date().toISOString()}"}]'::jsonb`
        });
        return this.sujetRepo.findOne({ where: { id } });
    }
    async createDeliberation(data) {
        const deliberation = this.deliberationRepo.create(data);
        return this.deliberationRepo.save(deliberation);
    }
    async findDeliberations(sessionId) {
        return this.deliberationRepo.find({
            where: { sessionId },
            order: { dateDeliberation: 'DESC' },
        });
    }
    async verrouillerDeliberation(id, verrouillePar) {
        await this.deliberationRepo.update(id, {
            statut: 'verrouille',
            verrouillePar,
            dateVerrouillage: new Date(),
        });
        return this.deliberationRepo.findOne({ where: { id } });
    }
    async publierDeliberation(id) {
        await this.deliberationRepo.update(id, { statut: 'publie' });
        return this.deliberationRepo.findOne({ where: { id } });
    }
    async ajouterMembreJury(data) {
        const membre = this.juryRepo.create(data);
        return this.juryRepo.save(membre);
    }
    async getJuryByDeliberation(deliberationId) {
        return this.juryRepo.find({ where: { deliberationId } });
    }
    async createPVNote(data) {
        const pv = this.pvNoteRepo.create(data);
        return this.pvNoteRepo.save(pv);
    }
    async getPVByDeliberation(deliberationId) {
        return this.pvNoteRepo.find({
            where: { deliberationId },
            order: { moyenneGenerale: 'DESC' },
        });
    }
    async calculerStatsDeliberation(deliberationId) {
        const pvs = await this.pvNoteRepo.find({ where: { deliberationId } });
        const total = pvs.length;
        const reussites = pvs.filter(p => p.decision === 'passe').length;
        const moyenneGenerale = pvs.reduce((acc, p) => acc + Number(p.moyenneGenerale), 0) / total;
        return {
            totalEtudiants: total,
            passes: reussites,
            redoublants: pvs.filter(p => p.decision === 'redouble').length,
            exclus: pvs.filter(p => p.decision === 'exclu').length,
            tauxReussite: (reussites / total) * 100,
            moyenneGeneraleClasse: moyenneGenerale.toFixed(2),
        };
    }
};
exports.ExamensService = ExamensService;
exports.ExamensService = ExamensService = ExamensService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(examens_entities_1.SujetExamen)),
    __param(1, (0, typeorm_1.InjectRepository)(examens_entities_1.Deliberation)),
    __param(2, (0, typeorm_1.InjectRepository)(examens_entities_1.Jury)),
    __param(3, (0, typeorm_1.InjectRepository)(examens_entities_1.PVNote)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ExamensService);
//# sourceMappingURL=examens.service.js.map