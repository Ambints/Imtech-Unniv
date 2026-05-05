"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortailModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const etudiant_controller_1 = require("./etudiant.controller");
const etudiant_service_1 = require("./etudiant.service");
const parent_controller_1 = require("./parent.controller");
const parent_service_1 = require("./parent.service");
const professeur_controller_1 = require("./professeur.controller");
const professeur_service_1 = require("./professeur.service");
const portail_permissions_controller_1 = require("./portail-permissions.controller");
const tenant_entity_1 = require("../tenants/tenant.entity");
let PortailModule = class PortailModule {
};
exports.PortailModule = PortailModule;
exports.PortailModule = PortailModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant])],
        controllers: [
            etudiant_controller_1.PortailEtudiantController,
            parent_controller_1.PortailParentController,
            professeur_controller_1.PortailProfesseurController,
            portail_permissions_controller_1.PortailPermissionsController
        ],
        providers: [etudiant_service_1.PortailEtudiantService, parent_service_1.PortailParentService, professeur_service_1.PortailProfesseurService],
        exports: [etudiant_service_1.PortailEtudiantService, parent_service_1.PortailParentService, professeur_service_1.PortailProfesseurService],
    })
], PortailModule);
//# sourceMappingURL=portail.module.js.map