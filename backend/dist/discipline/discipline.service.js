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
var DisciplineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisciplineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const discipline_entities_1 = require("./discipline.entities");
let DisciplineService = DisciplineService_1 = class DisciplineService {
    constructor(incidentRepo, sanctionRepo, avertissementRepo) {
        this.incidentRepo = incidentRepo;
        this.sanctionRepo = sanctionRepo;
        this.avertissementRepo = avertissementRepo;
        this.logger = new common_1.Logger(DisciplineService_1.name);
    }
    async createIncident(data) {
        const incident = this.incidentRepo.create(data);
        return this.incidentRepo.save(incident);
    }
    async findAllIncidents(filters) {
        const query = this.incidentRepo.createQueryBuilder('i');
        if (filters?.etudiantId)
            query.andWhere('i.etudiantId = :etudiantId', { etudiantId: filters.etudiantId });
        if (filters?.statut)
            query.andWhere('i.statut = :statut', { statut: filters.statut });
        if (filters?.gravite)
            query.andWhere('i.gravite = :gravite', { gravite: filters.gravite });
        return query.orderBy('i.dateIncident', 'DESC').getMany();
    }
    async findIncidentById(id) {
        const incident = await this.incidentRepo.findOne({ where: { id } });
        if (!incident)
            throw new common_1.NotFoundException('Incident non trouvé');
        return incident;
    }
    async validerIncident(id, validePar) {
        await this.incidentRepo.update(id, { statut: 'valide', validePar, dateValidation: new Date() });
        return this.findIncidentById(id);
    }
    async createSanction(data) {
        const sanction = this.sanctionRepo.create(data);
        return this.sanctionRepo.save(sanction);
    }
    async findAllSanctions(filters) {
        const query = this.sanctionRepo.createQueryBuilder('s');
        if (filters?.etudiantId)
            query.andWhere('s.etudiantId = :etudiantId', { etudiantId: filters.etudiantId });
        if (filters?.statut)
            query.andWhere('s.statut = :statut', { statut: filters.statut });
        return query.orderBy('s.dateDebut', 'DESC').getMany();
    }
    async findActiveSanctionsByStudent(etudiantId) {
        return this.sanctionRepo.find({
            where: { etudiantId, statut: 'en_cours' },
            order: { dateDebut: 'DESC' },
        });
    }
    async createAvertissement(data) {
        const count = await this.avertissementRepo.count({
            where: { etudiantId: data.etudiantId, statut: 'actif' },
        });
        const avertissement = this.avertissementRepo.create({ ...data, niveau: count + 1 });
        return this.avertissementRepo.save(avertissement);
    }
    async findAvertissementsByStudent(etudiantId) {
        return this.avertissementRepo.find({
            where: { etudiantId },
            order: { niveau: 'ASC' },
        });
    }
    async getDisciplineStats() {
        const [totalIncidents, incidentsEnAttente, sanctionsEnCours, avertissementsActifs] = await Promise.all([
            this.incidentRepo.count(),
            this.incidentRepo.count({ where: { statut: 'en_attente' } }),
            this.sanctionRepo.count({ where: { statut: 'en_cours' } }),
            this.avertissementRepo.count({ where: { statut: 'actif' } }),
        ]);
        return {
            totalIncidents,
            incidentsEnAttente,
            sanctionsEnCours,
            avertissementsActifs,
        };
    }
};
exports.DisciplineService = DisciplineService;
exports.DisciplineService = DisciplineService = DisciplineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(discipline_entities_1.Incident)),
    __param(1, (0, typeorm_1.InjectRepository)(discipline_entities_1.Sanction)),
    __param(2, (0, typeorm_1.InjectRepository)(discipline_entities_1.Avertissement)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DisciplineService);
//# sourceMappingURL=discipline.service.js.map