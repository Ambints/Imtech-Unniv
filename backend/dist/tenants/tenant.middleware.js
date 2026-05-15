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
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let TenantMiddleware = class TenantMiddleware {
    constructor(tenantConnection, defaultConnection) {
        this.tenantConnection = tenantConnection;
        this.defaultConnection = defaultConnection;
        this.whitelistRoutes = [
            { path: '/api/v1/auth/login', method: 'POST' },
            { path: '/api/v1/auth/register', method: 'POST' },
            { path: '/api/v1/auth/refresh', method: 'POST' },
            { path: '/api/v1/tenants', method: 'GET' },
            { path: '/api/v1/tenants', method: 'POST' },
            { path: '/api/v1/users', method: 'GET' },
            { path: '/api/v1/health' },
            { path: '/api/v1/docs' },
        ];
    }
    async use(req, res, next) {
        const fullPath = (req.originalUrl || req.url).split('?')[0];
        const method = req.method;
        const isWhitelisted = this.whitelistRoutes.some(route => {
            const pathMatches = fullPath === route.path || fullPath.startsWith(route.path + '/');
            const methodMatches = !route.method || route.method === method;
            return pathMatches && methodMatches;
        });
        if (isWhitelisted) {
            console.log(`[TenantMiddleware] Whitelisted route: ${method} ${fullPath}`);
            req.tenantSchema = 'public';
            req.tenantId = null;
            req.isSuperAdminRoute = true;
            return next();
        }
        let tenantId = req.headers['x-tenant-id'];
        if (!tenantId) {
            tenantId = req.headers['X-Tenant-ID'];
        }
        if (!tenantId && req.query && req.query.tenantId) {
            tenantId = req.query.tenantId;
        }
        if (!tenantId) {
            const pathParts = fullPath.split('/');
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const foundId = pathParts.find(part => uuidPattern.test(part));
            if (foundId) {
                tenantId = foundId;
                console.log(`[TenantMiddleware] Extracted tenant ID from URL: ${tenantId}`);
            }
        }
        if (!tenantId) {
            console.error(`[TenantMiddleware] Tenant ID required but not provided for: ${method} ${fullPath}`);
            return res.status(400).json({
                statusCode: 400,
                message: 'Tenant ID is required. Please provide X-Tenant-ID header or tenantId query parameter.',
                error: 'Bad Request',
            });
        }
        if (this.tenantConnection.isConnected) {
            try {
                const tenantResult = await this.defaultConnection.query('SELECT schema_name FROM public.tenant WHERE id = $1 AND actif = true', [tenantId]);
                if (!tenantResult || tenantResult.length === 0) {
                    console.error(`[TenantMiddleware] Tenant ${tenantId} not found or inactive`);
                    return res.status(404).json({
                        statusCode: 404,
                        message: `Tenant ${tenantId} not found or inactive`,
                        error: 'Not Found',
                    });
                }
                const schemaName = tenantResult[0].schema_name;
                console.log(`[TenantMiddleware] Found schema "${schemaName}" for tenant ${tenantId}`);
                await this.tenantConnection.query(`SET search_path TO "${schemaName}", public`);
                req.tenantSchema = schemaName;
                req.tenantId = tenantId;
                req.isSuperAdminRoute = false;
                console.log(`[TenantMiddleware] Schema set to: ${schemaName} for tenant: ${tenantId}`);
            }
            catch (error) {
                console.error(`[TenantMiddleware] Failed to set schema for tenant ${tenantId}:`, error instanceof Error ? error.message : String(error));
                return res.status(500).json({
                    statusCode: 500,
                    message: 'Failed to resolve tenant schema',
                    error: 'Internal Server Error',
                });
            }
        }
        next();
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectConnection)('tenant')),
    __param(1, (0, typeorm_1.InjectConnection)('default')),
    __metadata("design:paramtypes", [typeorm_2.Connection,
        typeorm_2.Connection])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map