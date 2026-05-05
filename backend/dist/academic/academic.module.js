"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const academic_controller_1 = require("./academic.controller");
const academic_service_1 = require("./academic.service");
const tenants_module_1 = require("../tenants/tenants.module");
const academic_entities_1 = require("./academic.entities");
let AcademicModule = class AcademicModule {
};
exports.AcademicModule = AcademicModule;
exports.AcademicModule = AcademicModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                academic_entities_1.Parcours, academic_entities_1.UniteEnseignement, academic_entities_1.ElementConstitutif, academic_entities_1.Departement,
                academic_entities_1.AnneeAcademique, academic_entities_1.CalendrierAcademique, academic_entities_1.Etudiant, academic_entities_1.Inscription,
                academic_entities_1.Enseignant, academic_entities_1.AffectationCours, academic_entities_1.Salle, academic_entities_1.Batiment, academic_entities_1.EmploiDuTemps,
                academic_entities_1.Presence, academic_entities_1.SessionExamen, academic_entities_1.Note
            ], 'tenant'),
            tenants_module_1.TenantsModule,
        ],
        controllers: [academic_controller_1.AcademicController],
        providers: [academic_service_1.AcademicService],
        exports: [academic_service_1.AcademicService],
    })
], AcademicModule);
//# sourceMappingURL=academic.module.js.map