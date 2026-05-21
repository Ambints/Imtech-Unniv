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
const scolarite_controller_1 = require("./scolarite.controller");
const scolarite_service_1 = require("./scolarite.service");
const tenants_module_1 = require("../tenants/tenants.module");
const salle_controller_1 = require("./controllers/salle.controller");
const seance_controller_1 = require("./controllers/seance.controller");
const course_controller_1 = require("./controllers/course.controller");
const student_controller_1 = require("./controllers/student.controller");
const inscription_controller_1 = require("./controllers/inscription.controller");
const salle_service_1 = require("./services/salle.service");
const seance_service_1 = require("./services/seance.service");
const emploi_du_temps_service_1 = require("./services/emploi-du-temps.service");
const course_service_1 = require("./services/course.service");
const student_service_1 = require("./services/student.service");
const inscription_service_1 = require("./services/inscription.service");
const academic_entities_1 = require("./academic.entities");
const salle_entity_1 = require("./entities/salle.entity");
const seance_entity_1 = require("./entities/seance.entity");
const emploi_du_temps_entity_1 = require("./entities/emploi-du-temps.entity");
const scolarite_entities_1 = require("./scolarite.entities");
let AcademicModule = class AcademicModule {
};
exports.AcademicModule = AcademicModule;
exports.AcademicModule = AcademicModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                academic_entities_1.Parcours, academic_entities_1.UniteEnseignement, academic_entities_1.ElementConstitutif, academic_entities_1.Departement,
                academic_entities_1.AnneeAcademique, academic_entities_1.CalendrierAcademique, academic_entities_1.Etudiant, academic_entities_1.Inscription,
                academic_entities_1.Enseignant, academic_entities_1.AffectationCours, salle_entity_1.Salle, seance_entity_1.Seance, academic_entities_1.Batiment, emploi_du_temps_entity_1.EmploiDuTemps,
                academic_entities_1.Presence, academic_entities_1.SessionExamen, academic_entities_1.Note,
                scolarite_entities_1.VerrouillageNotes, scolarite_entities_1.ResultatAcademique, scolarite_entities_1.ReleveNote,
                scolarite_entities_1.DiplomeDocument, scolarite_entities_1.EquivalenceCredit,
            ], 'tenant'),
            tenants_module_1.TenantsModule,
        ],
        controllers: [
            academic_controller_1.AcademicController,
            scolarite_controller_1.ScolariteController,
            salle_controller_1.SalleController,
            seance_controller_1.SeanceController,
            course_controller_1.CourseController,
            student_controller_1.StudentController,
            inscription_controller_1.InscriptionController,
        ],
        providers: [
            academic_service_1.AcademicService,
            scolarite_service_1.ScolariteService,
            salle_service_1.SalleService,
            seance_service_1.SeanceService,
            emploi_du_temps_service_1.EmploiDuTempsService,
            course_service_1.CourseService,
            student_service_1.StudentService,
            inscription_service_1.InscriptionService,
        ],
        exports: [
            academic_service_1.AcademicService,
            scolarite_service_1.ScolariteService,
            salle_service_1.SalleService,
            seance_service_1.SeanceService,
            emploi_du_temps_service_1.EmploiDuTempsService,
            course_service_1.CourseService,
            student_service_1.StudentService,
            inscription_service_1.InscriptionService,
        ],
    })
], AcademicModule);
//# sourceMappingURL=academic.module.js.map