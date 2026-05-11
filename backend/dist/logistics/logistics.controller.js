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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let LogisticsController = class LogisticsController {
    constructor(svc) {
        this.svc = svc;
    }
    createTicket(dto) {
        return this.svc.createTicket('', dto);
    }
    getTickets(statut) {
        return this.svc.getTickets('', statut);
    }
    updateTicket(id, dto) {
        return this.svc.updateTicket(id, dto);
    }
    createPlanning(dto) {
        return this.svc.createPlanning('', dto);
    }
    getPlanning() {
        return this.svc.getPlanning();
    }
    createStock(dto) {
        return this.svc.createStock('', dto);
    }
    getStocks() {
        return this.svc.getStocks();
    }
    getAlertes() {
        return this.svc.getStocksEnAlerte();
    }
    updateStock(id, body) {
        return this.svc.updateStock(id, body.quantite);
    }
    createMouvement(dto) {
        return this.svc.createMouvement(dto);
    }
    getMouvements(stockId) {
        return this.svc.getMouvements(stockId);
    }
    reserver(dto) {
        return this.svc.reserver('', dto);
    }
    getReservations(salleId) {
        return this.svc.getReservations('', salleId);
    }
    approuver(id, body) {
        return this.svc.approuverReservation(id, body.approuvePar);
    }
    refuser(id, body) {
        return this.svc.refuserReservation(id, body.approuvePar);
    }
    getStats() {
        return this.svc.getStats();
    }
};
exports.LogisticsController = LogisticsController;
__decorate([
    (0, common_1.Post)('tickets'),
    (0, roles_decorator_1.Roles)('logistique', 'admin', 'secretaire', 'professeur'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer ticket de maintenance' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "createTicket", null);
__decorate([
    (0, common_1.Get)('tickets'),
    (0, roles_decorator_1.Roles)('logistique', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des tickets (filtre par statut)' }),
    __param(0, (0, common_1.Query)('statut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "getTickets", null);
__decorate([
    (0, common_1.Patch)('tickets/:id'),
    (0, roles_decorator_1.Roles)('logistique', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour ticket' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "updateTicket", null);
__decorate([
    (0, common_1.Post)('planning-entretien'),
    (0, roles_decorator_1.Roles)('logistique', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer planning de nettoyage' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "createPlanning", null);
__decorate([
    (0, common_1.Get)('planning-entretien'),
    (0, roles_decorator_1.Roles)('logistique', 'admin', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Planning de nettoyage' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "getPlanning", null);
__decorate([
    (0, common_1.Post)('stocks'),
    (0, roles_decorator_1.Roles)('logistique', 'admin', 'economat'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajouter un article en stock' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "createStock", null);
__decorate([
    (0, common_1.Get)('stocks'),
    (0, roles_decorator_1.Roles)('logistique', 'admin', 'economat', 'secretaire'),
    (0, swagger_1.ApiOperation)({ summary: 'Inventaire complet des stocks' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "getStocks", null);
__decorate([
    (0, common_1.Get)('stocks/alertes'),
    (0, roles_decorator_1.Roles)('logistique', 'admin', 'economat'),
    (0, swagger_1.ApiOperation)({ summary: 'Articles sous seuil d\'alerte' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "getAlertes", null);
__decorate([
    (0, common_1.Patch)('stocks/:id'),
    (0, roles_decorator_1.Roles)('logistique', 'admin', 'economat'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour quantité en stock' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "updateStock", null);
__decorate([
    (0, common_1.Post)('mouvements'),
    (0, roles_decorator_1.Roles)('logistique', 'admin', 'economat'),
    (0, swagger_1.ApiOperation)({ summary: 'Enregistrer mouvement de stock' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "createMouvement", null);
__decorate([
    (0, common_1.Get)('mouvements'),
    (0, roles_decorator_1.Roles)('logistique', 'admin', 'economat'),
    (0, swagger_1.ApiOperation)({ summary: 'Historique des mouvements' }),
    __param(0, (0, common_1.Query)('stockId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "getMouvements", null);
__decorate([
    (0, common_1.Post)('reservations'),
    (0, roles_decorator_1.Roles)('logistique', 'admin', 'secretaire', 'professeur'),
    (0, swagger_1.ApiOperation)({ summary: 'Réserver une salle' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "reserver", null);
__decorate([
    (0, common_1.Get)('reservations'),
    (0, roles_decorator_1.Roles)('logistique', 'admin', 'secretaire', 'professeur'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des réservations' }),
    __param(0, (0, common_1.Query)('salleId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "getReservations", null);
__decorate([
    (0, common_1.Patch)('reservations/:id/approuver'),
    (0, roles_decorator_1.Roles)('logistique', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Approuver une réservation de salle' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "approuver", null);
__decorate([
    (0, common_1.Patch)('reservations/:id/refuser'),
    (0, roles_decorator_1.Roles)('logistique', 'admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Refuser une réservation de salle' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "refuser", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, roles_decorator_1.Roles)('logistique', 'admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques logistique' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LogisticsController.prototype, "getStats", null);
exports.LogisticsController = LogisticsController = __decorate([
    (0, swagger_1.ApiTags)('Logistics - Gestion logistique et maintenance'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('logistics'),
    __metadata("design:paramtypes", [logistics_service_1.LogisticsService])
], LogisticsController);
//# sourceMappingURL=logistics.controller.js.map