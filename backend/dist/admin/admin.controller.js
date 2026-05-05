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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getActivityLogs(req, limit) {
        if (!req.user?.tenantId) {
            throw new common_1.BadRequestException('Vous devez être associé à une université');
        }
        const limitNum = limit ? parseInt(limit) : 50;
        return this.adminService.getActivityLogs(req.user.tenantId, limitNum);
    }
    async getDetailedStats(req) {
        if (!req.user?.tenantId) {
            throw new common_1.BadRequestException('Vous devez être associé à une université');
        }
        return this.adminService.getDetailedStats(req.user.tenantId);
    }
    async bulkUpdateUserStatus(req, dto) {
        if (!req.user?.tenantId) {
            throw new common_1.BadRequestException('Vous devez être associé à une université');
        }
        return this.adminService.bulkUpdateUserStatus(req.user.tenantId, dto.userIds, dto.active);
    }
    async exportUsers(req, role) {
        if (!req.user?.tenantId) {
            throw new common_1.BadRequestException('Vous devez être associé à une université');
        }
        return this.adminService.exportUsers(req.user.tenantId, role);
    }
    async getSystemHealth(req) {
        if (!req.user?.tenantId) {
            throw new common_1.BadRequestException('Vous devez être associé à une université');
        }
        return this.adminService.getSystemHealth(req.user.tenantId);
    }
    async createBackup(req) {
        if (!req.user?.tenantId) {
            throw new common_1.BadRequestException('Vous devez être associé à une université');
        }
        return this.adminService.createBackup(req.user.tenantId);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('activity-logs'),
    (0, roles_decorator_1.Roles)('admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les logs d\'activité des utilisateurs' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des activités' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getActivityLogs", null);
__decorate([
    (0, common_1.Get)('detailed-stats'),
    (0, roles_decorator_1.Roles)('admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Statistiques détaillées pour rapports' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Statistiques détaillées' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDetailedStats", null);
__decorate([
    (0, common_1.Post)('users/bulk-update-status'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Activer/Désactiver plusieurs utilisateurs en masse' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateurs mis à jour' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkUpdateUserStatus", null);
__decorate([
    (0, common_1.Get)('users/export'),
    (0, roles_decorator_1.Roles)('admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Exporter les utilisateurs (CSV)' }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des utilisateurs pour export' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportUsers", null);
__decorate([
    (0, common_1.Get)('system/health'),
    (0, roles_decorator_1.Roles)('admin', 'president'),
    (0, swagger_1.ApiOperation)({ summary: 'Santé du système et statistiques' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Informations système' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemHealth", null);
__decorate([
    (0, common_1.Post)('system/backup'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Créer une sauvegarde de la base de données' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sauvegarde créée' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createBackup", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Gestion Avancée'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map