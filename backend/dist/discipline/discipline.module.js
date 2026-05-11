"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisciplineModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const discipline_controller_1 = require("./discipline.controller");
const discipline_service_1 = require("./discipline.service");
const surveillance_controller_1 = require("./surveillance.controller");
const surveillance_service_1 = require("./surveillance.service");
const encadrement_controller_1 = require("./encadrement.controller");
const encadrement_service_1 = require("./encadrement.service");
const notifications_gateway_1 = require("./notifications.gateway");
const discipline_entities_1 = require("./discipline.entities");
const surveillance_entities_1 = require("./surveillance.entities");
const encadrement_entities_1 = require("./encadrement.entities");
const tenants_module_1 = require("../tenants/tenants.module");
let DisciplineModule = class DisciplineModule {
};
exports.DisciplineModule = DisciplineModule;
exports.DisciplineModule = DisciplineModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                discipline_entities_1.Incident,
                discipline_entities_1.Sanction,
                discipline_entities_1.Avertissement,
                surveillance_entities_1.PointageQR,
                surveillance_entities_1.PresenceSurveillance,
                surveillance_entities_1.AlerteDiscipline,
                surveillance_entities_1.ConfigurationExamen,
                encadrement_entities_1.SuiviMoral,
                encadrement_entities_1.AutorisationSortie,
                encadrement_entities_1.RapportConduite,
                encadrement_entities_1.ConseilDiscipline,
            ], 'tenant'),
            tenants_module_1.TenantsModule,
        ],
        controllers: [
            discipline_controller_1.DisciplineController,
            surveillance_controller_1.SurveillanceController,
            encadrement_controller_1.EncadrementController,
        ],
        providers: [
            discipline_service_1.DisciplineService,
            surveillance_service_1.SurveillanceService,
            encadrement_service_1.EncadrementService,
            notifications_gateway_1.NotificationsGateway,
        ],
        exports: [
            discipline_service_1.DisciplineService,
            surveillance_service_1.SurveillanceService,
            encadrement_service_1.EncadrementService,
            notifications_gateway_1.NotificationsGateway,
        ],
    })
], DisciplineModule);
//# sourceMappingURL=discipline.module.js.map