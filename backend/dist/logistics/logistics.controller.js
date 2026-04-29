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
exports.LogisticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const logistics_service_1 = require("./logistics.service");
let LogisticsController = class LogisticsController {
    constructor(svc) {
        this.svc = svc;
    }
    createTicket(tid, dto) { return this.svc.createTicket(tid, dto); }
    getTickets(tid, status) {
        return this.svc.getTickets(tid, status);
    }
    updateTicket(id, dto) { return this.svc.updateTicket(id, dto); }
    createPlanning(tid, dto) { return this.svc.createPlanning(tid, dto); }
    getPlanning(tid) { return this.svc.getPlanning(tid); }
    createStock(tid, dto) { return this.svc.createStock(tid, dto); }
    getStocks(tid) { return this.svc.getStocks(tid); }
    getAlertes(tid) { return this.svc.getStocksEnAlerte(tid); }
    updateStock(id, body) { return this.svc.updateStock(id, body.quantite); }
    reserver(tid, dto) { return this.svc.reserver(tid, dto); }
    getReservations(tid, sid) {
        return this.svc.getReservations(tid, sid);
    }
    approuver(id, body) {
        return this.svc.approuverReservation(id, body.approvedBy);
    }
};
exports.LogisticsController = LogisticsController;
__decorate([
    (0, common_1.Post)(':tid/tickets'),
    (0, swagger_1.ApiOperation)({ summary: 'Creer ticket de maintenance (Prof / Secretaire)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "createTicket", null);
__decorate([
    (0, common_1.Get)(':tid/tickets'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des tickets (filtre par status)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "getTickets", null);
__decorate([
    (0, common_1.Patch)(':tid/tickets/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre a jour ticket (Responsable Logistique)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "updateTicket", null);
__decorate([
    (0, common_1.Post)(':tid/planning-nettoyage'),
    (0, swagger_1.ApiOperation)({ summary: 'Creer planning de nettoyage (Service Entretien)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "createPlanning", null);
__decorate([
    (0, common_1.Get)(':tid/planning-nettoyage'),
    (0, swagger_1.ApiOperation)({ summary: 'Planning de nettoyage' }),
    __param(0, (0, common_1.Param)('tid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "getPlanning", null);
__decorate([
    (0, common_1.Post)(':tid/stocks'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter un article en stock' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "createStock", null);
__decorate([
    (0, common_1.Get)(':tid/stocks'),
    (0, swagger_1.ApiOperation)({ summary: 'Inventaire complet des stocks' }),
    __param(0, (0, common_1.Param)('tid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "getStocks", null);
__decorate([
    (0, common_1.Get)(':tid/stocks/alertes'),
    (0, swagger_1.ApiOperation)({ summary: 'Articles sous seuil d alerte' }),
    __param(0, (0, common_1.Param)('tid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "getAlertes", null);
__decorate([
    (0, common_1.Patch)(':tid/stocks/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre a jour quantite en stock' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "updateStock", null);
__decorate([
    (0, common_1.Post)(':tid/reservations'),
    (0, swagger_1.ApiOperation)({ summary: 'Reserver une salle (Prof / Secretaire)' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "reserver", null);
__decorate([
    (0, common_1.Get)(':tid/reservations'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des reservations' }),
    __param(0, (0, common_1.Param)('tid')),
    __param(1, (0, common_1.Query)('salleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "getReservations", null);
__decorate([
    (0, common_1.Patch)(':tid/reservations/:id/approuver'),
    (0, swagger_1.ApiOperation)({ summary: 'Approuver une reservation de salle' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "approuver", null);
exports.LogisticsController = LogisticsController = __decorate([
    (0, swagger_1.ApiTags)('Logistics'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('logistics'),
    __metadata("design:paramtypes", [logistics_service_1.LogisticsService])
], LogisticsController);
//# sourceMappingURL=logistics.controller.js.map