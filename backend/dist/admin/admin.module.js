"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const admin_controller_1 = require("./admin.controller");
const admin_service_1 = require("./admin.service");
const niveaux_etude_controller_1 = require("./niveaux-etude.controller");
const niveaux_etude_service_1 = require("./niveaux-etude.service");
const tenant_entity_1 = require("../tenants/tenant.entity");
const tenants_module_1 = require("../tenants/tenants.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant], 'default'),
            tenants_module_1.TenantsModule,
        ],
        controllers: [admin_controller_1.AdminController, niveaux_etude_controller_1.NiveauxEtudeController],
        providers: [admin_service_1.AdminService, niveaux_etude_service_1.NiveauxEtudeService],
        exports: [admin_service_1.AdminService, niveaux_etude_service_1.NiveauxEtudeService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map