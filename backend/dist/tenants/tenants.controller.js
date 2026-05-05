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
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenants_service_1 = require("./tenants.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let TenantsController = class TenantsController {
    constructor(svc) {
        this.svc = svc;
    }
    getMyTenantConfig(req) {
        if (!req.user?.tenantId) {
            throw new common_1.BadRequestException('Vous devez être associé à une université pour accéder à cette ressource');
        }
        return this.svc.getMyTenantConfig(req.user.tenantId);
    }
    updateMyTenantConfig(req, dto) {
        if (!req.user?.tenantId) {
            throw new common_1.BadRequestException('Vous devez être associé à une université pour accéder à cette ressource');
        }
        return this.svc.updateMyTenantConfig(req.user.tenantId, dto);
    }
    getMyTenantStats(req) {
        if (!req.user?.tenantId) {
            throw new common_1.BadRequestException('Vous devez être associé à une université pour accéder à cette ressource');
        }
        return this.svc.getMyTenantStats(req.user.tenantId);
    }
    create(dto) {
        return this.svc.create(dto);
    }
    findAll() {
        return this.svc.findAll();
    }
    findOne(id) {
        return this.svc.findOne(id);
    }
    findBySlug(slug) {
        return this.svc.findBySlug(slug);
    }
    update(id, dto) {
        return this.svc.update(id, dto);
    }
    remove(id) {
        return this.svc.remove(id);
    }
    dashboard(id) {
        return this.svc.getDashboard(id);
    }
    getFullConfig(id) {
        return this.svc.getFullConfig(id);
    }
    getSubscriptions() {
        return this.svc.getSubscriptions();
    }
    updateSubscription(id, dto) {
        return this.svc.updateSubscription(id, dto);
    }
    removeSubscription(id) {
        return this.svc.removeSubscription(id);
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Get)('my-tenant/config'),
    (0, roles_decorator_1.Roles)('admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Configuration du tenant de l\'utilisateur connecté' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration du tenant' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Tenant ID manquant - utilisateur non associé à une université' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "getMyTenantConfig", null);
__decorate([
    (0, common_1.Patch)('my-tenant/config'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour la configuration du tenant (admin uniquement)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration mise à jour' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Tenant ID manquant - utilisateur non associé à une université' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UpdateTenantDto]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "updateMyTenantConfig", null);
__decorate([
    (0, common_1.Get)('my-tenant/stats'),
    (0, roles_decorator_1.Roles)('admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques du tenant de l\'utilisateur connecté' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques du tenant' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Tenant ID manquant - utilisateur non associé à une université' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "getMyTenantStats", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une nouvelle université (avec schéma PostgreSQL)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Université créée avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides ou slug déjà utilisé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTenantDto]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)('super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Lister toutes les universités' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des universités' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)('super_admin'),
    (0, swagger_1.ApiOperation)({ summary: "Détails d'une université" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Détails de l\'université' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Université non trouvée' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('by-slug/:slug'),
    (0, roles_decorator_1.Roles)('super_admin'),
    (0, swagger_1.ApiOperation)({ summary: "Trouver une université par son slug" }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "findBySlug", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Modifier une université (White Label, configuration)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Université mise à jour' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateTenantDto]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer une université (et son schéma PostgreSQL)' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Université supprimée' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/dashboard'),
    (0, roles_decorator_1.Roles)('super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Tableau de bord Super Admin d\'une université' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)(':id/config'),
    (0, roles_decorator_1.Roles)('super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Configuration complète (White Label) d\'une université' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "getFullConfig", null);
__decorate([
    (0, common_1.Get)('subscriptions/all'),
    (0, roles_decorator_1.Roles)('super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Liste des abonnements avec statistiques' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des abonnements' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "getSubscriptions", null);
__decorate([
    (0, common_1.Post)(':id/subscription'),
    (0, roles_decorator_1.Roles)('super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer ou modifier l\'abonnement d\'une université' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Abonnement mis à jour' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Université non trouvée' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "updateSubscription", null);
__decorate([
    (0, common_1.Delete)(':id/subscription'),
    (0, roles_decorator_1.Roles)('super_admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Supprimer/Résilier l\'abonnement d\'une université' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Abonnement résilié' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Université non trouvée' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TenantsController.prototype, "removeSubscription", null);
exports.TenantsController = TenantsController = __decorate([
    (0, swagger_1.ApiTags)('Super Admin - Gestion des Universités'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map