"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EconomatModule = void 0;
const common_1 = require("@nestjs/common");
const economat_controller_1 = require("./economat.controller");
const economat_service_1 = require("./economat.service");
const depenses_controller_1 = require("./depenses.controller");
const depenses_service_1 = require("./depenses.service");
const rapports_controller_1 = require("./rapports.controller");
const rapports_service_1 = require("./rapports.service");
const tenant_connection_service_1 = require("../tenants/tenant-connection.service");
let EconomatModule = class EconomatModule {
};
exports.EconomatModule = EconomatModule;
exports.EconomatModule = EconomatModule = __decorate([
    (0, common_1.Module)({
        controllers: [economat_controller_1.EconomatController, depenses_controller_1.DepensesController, rapports_controller_1.RapportsController],
        providers: [economat_service_1.EconomatService, depenses_service_1.DepensesService, rapports_service_1.RapportsService, tenant_connection_service_1.TenantConnectionService],
        exports: [economat_service_1.EconomatService, depenses_service_1.DepensesService, rapports_service_1.RapportsService],
    })
], EconomatModule);
//# sourceMappingURL=economat.module.js.map