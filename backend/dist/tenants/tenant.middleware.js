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
    }
    async use(req, res, next) {
        const fullPath = req.originalUrl || req.url;
        if (fullPath.includes('/auth/') || fullPath.includes('/login')) {
            console.log(`[TenantMiddleware] Skipping tenant resolution for auth route: ${fullPath}`);
            req.tenantSchema = 'public';
            req.tenantId = null;
            return next();
        }
        let tenantId = req.headers['x-tenant-id'] || '';
        if (!tenantId) {
            const pathParts = fullPath.split('/');
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const foundId = pathParts.find(part => uuidPattern.test(part));
            if (foundId) {
                tenantId = foundId;
                console.log(`[TenantMiddleware] Extracted tenant ID from URL: ${tenantId}`);
            }
        }
        if (this.tenantConnection.isConnected && tenantId) {
            try {
                const tenantResult = await this.defaultConnection.query('SELECT schema_name FROM public.tenant WHERE id = $1 AND actif = true', [tenantId]);
                let schemaName;
                if (tenantResult && tenantResult.length > 0) {
                    schemaName = tenantResult[0].schema_name;
                    console.log(`[TenantMiddleware] Found schema "${schemaName}" for tenant ${tenantId}`);
                }
                else {
                    console.error(`[TenantMiddleware] Tenant ${tenantId} not found`);
                    throw new Error(`Tenant ${tenantId} not found`);
                }
                await this.tenantConnection.query(`SET search_path TO "${schemaName}", public`);
                req.tenantSchema = schemaName;
                req.tenantId = tenantId;
                console.log(`[TenantMiddleware] Schema set to: ${schemaName} for tenant: ${tenantId}`);
            }
            catch (error) {
                console.error(`[TenantMiddleware] Failed to set schema for tenant ${tenantId}:`, error instanceof Error ? error.message : String(error));
            }
        }
        else {
            console.warn(`[TenantMiddleware] No tenant ID provided. URL: ${fullPath}`);
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