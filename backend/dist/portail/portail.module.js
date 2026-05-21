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
const parent_controller_enhanced_1 = require("./parent.controller.enhanced");
const parent_service_enhanced_1 = require("./parent.service.enhanced");
const enseignant_controller_1 = require("./enseignant.controller");
const enseignant_service_1 = require("./enseignant.service");
const portail_permissions_controller_1 = require("./portail-permissions.controller");
const test_enseignant_controller_1 = require("./test-enseignant.controller");
const tenant_entity_1 = require("../tenants/tenant.entity");
const tenant_connection_service_1 = require("../tenants/tenant-connection.service");
const entities_1 = require("../scolarite/entities");
let PortailModule = class PortailModule {
};
exports.PortailModule = PortailModule;
exports.PortailModule = PortailModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant]),
            typeorm_1.TypeOrmModule.forFeature([
                entities_1.Inscription, entities_1.Etudiant, entities_1.Parcours, entities_1.AnneeAcademique, entities_1.UniteEnseignement,
                entities_1.ElementConstitutif, entities_1.SessionExamen, entities_1.Note
            ], 'tenant')
        ],
        controllers: [
            etudiant_controller_1.PortailEtudiantController,
            parent_controller_1.PortailParentController,
            parent_controller_enhanced_1.PortailParentControllerEnhanced,
            enseignant_controller_1.PortailEnseignantController,
            portail_permissions_controller_1.PortailPermissionsController,
            test_enseignant_controller_1.TestEnseignantController
        ],
        providers: [
            tenant_connection_service_1.TenantConnectionService,
            etudiant_service_1.PortailEtudiantService,
            parent_service_1.PortailParentService,
            parent_service_enhanced_1.PortailParentServiceEnhanced,
            enseignant_service_1.PortailEnseignantService
        ],
        exports: [
            etudiant_service_1.PortailEtudiantService,
            parent_service_1.PortailParentService,
            parent_service_enhanced_1.PortailParentServiceEnhanced,
            enseignant_service_1.PortailEnseignantService
        ],
    })
], PortailModule);
//# sourceMappingURL=portail.module.js.map