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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let TenantMiddleware = class TenantMiddleware {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async use(req, res, next) {
        const tenantId = req.headers['x-tenant-id'] || req.params.tid || 'default';
        if (tenantId && this.dataSource.isInitialized) {
            const schemaName = `tenant_${tenantId.toString().replace(/-/g, '_')}`;
            try {
                await this.dataSource.query(`SET search_path TO ${schemaName}, public`);
                console.log(`[Tenant] Schema set to: ${schemaName}`);
            }
            catch (error) {
                console.error(`[Tenant] Failed to set schema ${schemaName}:`, error);
                await this.dataSource.query(`SET search_path TO univ_demo, public`);
            }
        }
        next();
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map