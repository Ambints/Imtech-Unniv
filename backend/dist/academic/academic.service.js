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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const academic_entities_1 = require("./academic.entities");
let AcademicService = class AcademicService {
    constructor(parcoursRepo, ueRepo, noteRepo, inscriptionRepo, presenceRepo, salleRepo, edtRepo) {
        this.parcoursRepo = parcoursRepo;
        this.ueRepo = ueRepo;
        this.noteRepo = noteRepo;
        this.inscriptionRepo = inscriptionRepo;
        this.presenceRepo = presenceRepo;
        this.salleRepo = salleRepo;
        this.edtRepo = edtRepo;
    }
    createParcours(tid, dto) {
        return this.parcoursRepo.save(this.parcoursRepo.create(dto));
    }
    getParcours(tid) {
        return this.parcoursRepo.find({ where: { actif: true } });
    }
    createUE(tid, dto) {
        return this.ueRepo.save(this.ueRepo.create(dto));
    }
    getUEByParcours(tid, parcoursId) {
        return this.ueRepo.find({ where: { parcoursId } });
    }
    async saisirNote(tid, dto, saisiPar) {
        const existing = await this.noteRepo.findOne({
            where: { etudiantId: dto.etudiantId, ueId: dto.ueId, sessionId: dto.sessionId }
        });
        if (existing?.verrouille)
            throw new common_1.BadRequestException('Note verrouillee apres deliberation');
        const valeur = dto.valeur;
        const mention = this.getMention(valeur);
        if (existing) {
            return this.noteRepo.save({ ...existing, ...dto, mention, saisiPar });
        }
        return this.noteRepo.save(this.noteRepo.create({ ...dto, mention, saisiPar }));
    }
    calcMoyenne(cc, exam) {
        if (!cc && !exam)
            return 0;
        if (!cc)
            return Number(exam);
        if (!exam)
            return Number(cc);
        return parseFloat((Number(cc) * 0.4 + Number(exam) * 0.6).toFixed(2));
    }
    getMention(note) {
        if (note >= 16)
            return 'Tres Bien';
        if (note >= 14)
            return 'Bien';
        if (note >= 12)
            return 'Assez Bien';
        if (note >= 10)
            return 'Passable';
        return 'Insuffisant';
    }
    async deliberer(tid, parcoursId, sessionId, annee) {
        const notes = await this.noteRepo.find({ where: { sessionId } });
        await this.noteRepo.save(notes.map(n => ({ ...n, verrouille: true, dateVerrouillage: new Date() })));
        return { message: 'Deliberation effectuee, notes verrouillee', count: notes.length };
    }
    getReleverNotes(tid, etudiantId, sessionId) {
        return this.noteRepo.find({ where: { etudiantId, sessionId } });
    }
    async inscrire(tid, dto) {
        const ex = await this.inscriptionRepo.findOne({
            where: { etudiantId: dto.etudiantId, parcoursId: dto.parcoursId, anneeAcademiqueId: dto.anneeAcademiqueId }
        });
        if (ex)
            throw new common_1.BadRequestException('Etudiant deja inscrit pour cette annee');
        return this.inscriptionRepo.save(this.inscriptionRepo.create(dto));
    }
    getInscriptions(tid, parcoursId) {
        const where = {};
        if (parcoursId)
            where.parcoursId = parcoursId;
        return this.inscriptionRepo.find({ where, order: { createdAt: 'DESC' } });
    }
    saisirPresence(tid, dto) {
        return this.presenceRepo.save(this.presenceRepo.create(dto));
    }
    getPresencesEtudiant(tid, etudiantId) {
        return this.presenceRepo.find({ where: { etudiantId } });
    }
    saisirAbsence(tid, dto) { return this.saisirPresence(tid, dto); }
    getAbsencesEtudiant(tid, etudiantId) { return this.getPresencesEtudiant(tid, etudiantId); }
    getSalles(tid) { return this.salleRepo.find(); }
    createSalle(tid, dto) {
        return this.salleRepo.save(this.salleRepo.create(dto));
    }
    getEDT(tid, parcoursId) {
        return this.edtRepo.find();
    }
    createEDT(tid, dto) {
        return this.edtRepo.save(this.edtRepo.create(dto));
    }
};
exports.AcademicService = AcademicService;
exports.AcademicService = AcademicService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(academic_entities_1.Parcours)),
    __param(1, (0, typeorm_1.InjectRepository)(academic_entities_1.UniteEnseignement)),
    __param(2, (0, typeorm_1.InjectRepository)(academic_entities_1.Note)),
    __param(3, (0, typeorm_1.InjectRepository)(academic_entities_1.Inscription)),
    __param(4, (0, typeorm_1.InjectRepository)(academic_entities_1.Presence)),
    __param(5, (0, typeorm_1.InjectRepository)(academic_entities_1.Salle)),
    __param(6, (0, typeorm_1.InjectRepository)(academic_entities_1.EmploiDuTemps)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AcademicService);
//# sourceMappingURL=academic.service.js.map