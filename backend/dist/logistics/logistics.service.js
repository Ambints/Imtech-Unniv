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
exports.LogisticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const logistics_entities_1 = require("./logistics.entities");
let LogisticsService = class LogisticsService {
    constructor(ticketRepo, planningRepo, stockRepo, mouvementRepo, reservationRepo) {
        this.ticketRepo = ticketRepo;
        this.planningRepo = planningRepo;
        this.stockRepo = stockRepo;
        this.mouvementRepo = mouvementRepo;
        this.reservationRepo = reservationRepo;
    }
    createTicket(tid, dto) {
        return this.ticketRepo.save(this.ticketRepo.create(dto));
    }
    getTickets(tid, statut) {
        const where = {};
        if (statut)
            where.statut = statut;
        return this.ticketRepo.find({ where, order: { createdAt: 'DESC' } });
    }
    async updateTicket(id, dto) {
        await this.ticketRepo.update(id, dto);
        return this.ticketRepo.findOne({ where: { id } });
    }
    createPlanning(tid, dto) {
        return this.planningRepo.save(this.planningRepo.create(dto));
    }
    getPlanning(tid) {
        return this.planningRepo.find({ where: { actif: true } });
    }
    createStock(tid, dto) {
        return this.stockRepo.save(this.stockRepo.create(dto));
    }
    getStocks(tid) {
        return this.stockRepo.find();
    }
    async getStocksEnAlerte(tid) {
        const stocks = await this.stockRepo.find();
        return stocks.filter(s => Number(s.quantiteStock) <= Number(s.seuilAlerte));
    }
    async updateStock(id, quantiteStock) {
        await this.stockRepo.update(id, { quantiteStock, derniereMiseAJour: new Date() });
        return this.stockRepo.findOne({ where: { id } });
    }
    createMouvement(dto) {
        return this.mouvementRepo.save(this.mouvementRepo.create(dto));
    }
    getMouvements(stockId) {
        const where = {};
        if (stockId)
            where.stockId = stockId;
        return this.mouvementRepo.find({ where, order: { dateMouvement: 'DESC' } });
    }
    reserver(tid, dto) {
        return this.reservationRepo.save(this.reservationRepo.create(dto));
    }
    getReservations(tid, salleId) {
        const where = {};
        if (salleId)
            where.salleId = salleId;
        return this.reservationRepo.find({ where, order: { dateReservation: 'ASC' } });
    }
    async approuverReservation(id, approuvePar) {
        await this.reservationRepo.update(id, { statut: 'approuve', approuvePar });
        return this.reservationRepo.findOne({ where: { id } });
    }
};
exports.LogisticsService = LogisticsService;
exports.LogisticsService = LogisticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(logistics_entities_1.TicketMaintenance)),
    __param(1, (0, typeorm_1.InjectRepository)(logistics_entities_1.PlanningEntretien)),
    __param(2, (0, typeorm_1.InjectRepository)(logistics_entities_1.Stock)),
    __param(3, (0, typeorm_1.InjectRepository)(logistics_entities_1.MouvementStock)),
    __param(4, (0, typeorm_1.InjectRepository)(logistics_entities_1.ReservationSalle)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LogisticsService);
//# sourceMappingURL=logistics.service.js.map