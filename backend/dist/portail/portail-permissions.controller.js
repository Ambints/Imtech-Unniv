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
exports.PortailPermissionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../tenants/tenant.entity");
let PortailPermissionsController = class PortailPermissionsController {
    constructor(tenantRepo, dataSource) {
        this.tenantRepo = tenantRepo;
        this.dataSource = dataSource;
    }
    async getPermissions(req) {
        if (!req.user?.tenantId) {
            throw new common_1.BadRequestException('Tenant ID manquant');
        }
        const tenant = await this.tenantRepo.findOne({ where: { id: req.user.tenantId } });
        if (!tenant) {
            throw new common_1.BadRequestException('Tenant non trouvé');
        }
        const schemaName = tenant.schemaName;
        const permissions = await this.dataSource.query(`
      SELECT 
        type_portail,
        permission_key,
        permission_label,
        actif,
        description
      FROM ${schemaName}.permissions_portail
      ORDER BY type_portail, permission_key
    `);
        const grouped = {
            etudiant: [],
            parent: [],
            professeur: []
        };
        permissions.forEach((perm) => {
            grouped[perm.type_portail].push({
                key: perm.permission_key,
                label: perm.permission_label,
                actif: perm.actif,
                description: perm.description
            });
        });
        return grouped;
    }
    async getPermissionsByType(req, type) {
        if (!req.user?.tenantId) {
            throw new common_1.BadRequestException('Tenant ID manquant');
        }
        if (!['etudiant', 'parent', 'professeur'].includes(type)) {
            throw new common_1.BadRequestException('Type de portail invalide');
        }
        const tenant = await this.tenantRepo.findOne({ where: { id: req.user.tenantId } });
        if (!tenant) {
            throw new common_1.BadRequestException('Tenant non trouvé');
        }
        const schemaName = tenant.schemaName;
        const permissions = await this.dataSource.query(`
      SELECT 
        permission_key,
        permission_label,
        actif,
        description
      FROM ${schemaName}.permissions_portail
      WHERE type_portail = $1
      ORDER BY permission_key
    `, [type]);
        return permissions.map((perm) => ({
            key: perm.permission_key,
            label: perm.permission_label,
            actif: perm.actif,
            description: perm.description
        }));
    }
    async updatePermission(req, type, key, body) {
        if (!req.user?.tenantId) {
            throw new common_1.BadRequestException('Tenant ID manquant');
        }
        if (!['etudiant', 'parent', 'professeur'].includes(type)) {
            throw new common_1.BadRequestException('Type de portail invalide');
        }
        const tenant = await this.tenantRepo.findOne({ where: { id: req.user.tenantId } });
        if (!tenant) {
            throw new common_1.BadRequestException('Tenant non trouvé');
        }
        const schemaName = tenant.schemaName;
        await this.dataSource.query(`
      UPDATE ${schemaName}.permissions_portail
      SET actif = $1, updated_at = NOW()
      WHERE type_portail = $2 AND permission_key = $3
    `, [body.actif, type, key]);
        return {
            message: 'Permission mise à jour avec succès',
            type,
            key,
            actif: body.actif
        };
    }
    async updatePermissionsBulk(req, type, body) {
        if (!req.user?.tenantId) {
            throw new common_1.BadRequestException('Tenant ID manquant');
        }
        if (!['etudiant', 'parent', 'professeur'].includes(type)) {
            throw new common_1.BadRequestException('Type de portail invalide');
        }
        const tenant = await this.tenantRepo.findOne({ where: { id: req.user.tenantId } });
        if (!tenant) {
            throw new common_1.BadRequestException('Tenant non trouvé');
        }
        const schemaName = tenant.schemaName;
        for (const [key, actif] of Object.entries(body.permissions)) {
            await this.dataSource.query(`
        UPDATE ${schemaName}.permissions_portail
        SET actif = $1, updated_at = NOW()
        WHERE type_portail = $2 AND permission_key = $3
      `, [actif, type, key]);
        }
        return {
            message: `${Object.keys(body.permissions).length} permission(s) mise(s) à jour`,
            type
        };
    }
};
exports.PortailPermissionsController = PortailPermissionsController;
__decorate([
    (0, common_1.Get)('permissions'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer toutes les permissions des portails' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des permissions par portail' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PortailPermissionsController.prototype, "getPermissions", null);
__decorate([
    (0, common_1.Get)('permissions/:type'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Récupérer les permissions d\'un portail spécifique' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des permissions du portail' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PortailPermissionsController.prototype, "getPermissionsByType", null);
__decorate([
    (0, common_1.Patch)('permissions/:type/:key'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Activer/Désactiver une permission' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permission mise à jour' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Param)('key')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], PortailPermissionsController.prototype, "updatePermission", null);
__decorate([
    (0, common_1.Patch)('permissions/:type/bulk'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Mettre à jour plusieurs permissions en masse' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Permissions mises à jour' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('type')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PortailPermissionsController.prototype, "updatePermissionsBulk", null);
exports.PortailPermissionsController = PortailPermissionsController = __decorate([
    (0, swagger_1.ApiTags)('Admin - Gestion des Permissions Portails'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('admin/portals'),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], PortailPermissionsController);
//# sourceMappingURL=portail-permissions.controller.js.map