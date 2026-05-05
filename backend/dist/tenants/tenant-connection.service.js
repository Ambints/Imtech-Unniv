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
exports.TenantConnectionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let TenantConnectionService = class TenantConnectionService {
    constructor(tenantConnection, defaultConnection) {
        this.tenantConnection = tenantConnection;
        this.defaultConnection = defaultConnection;
        this.schemaCache = new Map();
    }
    async setTenantSchema(tenantId) {
        if (!tenantId || !this.tenantConnection.isConnected)
            return;
        let schemaName = this.schemaCache.get(tenantId);
        if (!schemaName) {
            try {
                const result = await this.defaultConnection.query(`SELECT id, nom FROM tenant WHERE id = $1`, [tenantId]);
                if (result && result.length > 0) {
                    const tenantName = result[0].nom || tenantId;
                    schemaName = `tenant_${tenantName.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
                }
                else {
                    schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
                }
                this.schemaCache.set(tenantId, schemaName);
            }
            catch (error) {
                console.error(`[TenantConnection] Failed to lookup tenant ${tenantId}:`, error);
                schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
            }
        }
        try {
            await this.tenantConnection.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
            await this.tenantConnection.query(`SET search_path TO "${schemaName}", public`);
            console.log(`[TenantConnection] Schema switched to: ${schemaName}`);
        }
        catch (error) {
            console.error(`[TenantConnection] Failed to switch to schema ${schemaName}:`, error);
            const fallbackSchema = `tenant_${tenantId.replace(/-/g, '_')}`;
            await this.tenantConnection.query(`CREATE SCHEMA IF NOT EXISTS "${fallbackSchema}"`);
            await this.tenantConnection.query(`SET search_path TO "${fallbackSchema}", public`);
            console.log(`[TenantConnection] Fallback schema: ${fallbackSchema}`);
        }
    }
    clearCache() {
        this.schemaCache.clear();
    }
    getConnection() {
        return this.tenantConnection;
    }
};
exports.TenantConnectionService = TenantConnectionService;
exports.TenantConnectionService = TenantConnectionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectConnection)('tenant')),
    __param(1, (0, typeorm_1.InjectConnection)('default')),
    __metadata("design:paramtypes", [typeorm_2.Connection,
        typeorm_2.Connection])
], TenantConnectionService);
//# sourceMappingURL=tenant-connection.service.js.map