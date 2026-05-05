"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const tenants_module_1 = require("./tenants/tenants.module");
const admin_module_1 = require("./admin/admin.module");
const academic_module_1 = require("./academic/academic.module");
const finance_module_1 = require("./finance/finance.module");
const logistics_module_1 = require("./logistics/logistics.module");
const communication_module_1 = require("./communication/communication.module");
const discipline_module_1 = require("./discipline/discipline.module");
const examens_module_1 = require("./examens/examens.module");
const documents_module_1 = require("./documents/documents.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const portail_module_1 = require("./portail/portail.module");
const rh_module_1 = require("./rh/rh.module");
const economat_module_1 = require("./economat/economat.module");
const caissier_module_1 = require("./caissier/caissier.module");
const tenant_entity_1 = require("./tenants/tenant.entity");
const user_entity_1 = require("./users/user.entity");
const super_admin_entity_1 = require("./users/super-admin.entity");
const academic_entities_1 = require("./academic/academic.entities");
const finance_entities_1 = require("./finance/finance.entities");
const logistics_entities_1 = require("./logistics/logistics.entities");
const communication_entities_1 = require("./communication/communication.entities");
const discipline_entities_1 = require("./discipline/discipline.entities");
const examens_entities_1 = require("./examens/examens.entities");
const documents_entities_1 = require("./documents/documents.entities");
const plan_entity_1 = require("./tenants/plan.entity");
const plans_module_1 = require("./plans/plans.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRoot({
                name: 'default',
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                username: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'password',
                database: process.env.DB_NAME || 'imtech_university',
                schema: 'public',
                entities: [tenant_entity_1.Tenant, super_admin_entity_1.SuperAdmin, plan_entity_1.Plan],
                synchronize: false,
                logging: false,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                name: 'tenant',
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432'),
                username: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'password',
                database: process.env.DB_NAME || 'imtech_university',
                schema: 'univ_demo',
                entities: [
                    user_entity_1.User,
                    academic_entities_1.Parcours, academic_entities_1.UniteEnseignement, academic_entities_1.ElementConstitutif, academic_entities_1.Departement,
                    academic_entities_1.AnneeAcademique, academic_entities_1.CalendrierAcademique, academic_entities_1.Etudiant, academic_entities_1.Inscription,
                    academic_entities_1.Enseignant, academic_entities_1.AffectationCours, academic_entities_1.Salle, academic_entities_1.Batiment, academic_entities_1.EmploiDuTemps,
                    academic_entities_1.Presence, academic_entities_1.SessionExamen, academic_entities_1.Note,
                    finance_entities_1.GrilleTarifaire, finance_entities_1.Echeancier, finance_entities_1.Paiement, finance_entities_1.Budget, finance_entities_1.Depense,
                    finance_entities_1.ContratPersonnel, finance_entities_1.CongePersonnel, finance_entities_1.FichePaie,
                    logistics_entities_1.TicketMaintenance, logistics_entities_1.ReservationSalle, logistics_entities_1.Stock, logistics_entities_1.MouvementStock,
                    logistics_entities_1.PlanningEntretien, logistics_entities_1.RapportEntretien,
                    communication_entities_1.Annonce, communication_entities_1.Notification, communication_entities_1.Message,
                    discipline_entities_1.Incident, discipline_entities_1.Sanction, discipline_entities_1.Avertissement,
                    examens_entities_1.SujetExamen, examens_entities_1.Deliberation, examens_entities_1.Jury, examens_entities_1.PVNote,
                    documents_entities_1.ReleveNote, documents_entities_1.Attestation, documents_entities_1.Diplome,
                ],
                synchronize: false,
                logging: false,
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            tenants_module_1.TenantsModule,
            admin_module_1.AdminModule,
            academic_module_1.AcademicModule,
            finance_module_1.FinanceModule,
            logistics_module_1.LogisticsModule,
            communication_module_1.CommunicationModule,
            plans_module_1.PlansModule,
            subscriptions_module_1.SubscriptionsModule,
            discipline_module_1.DisciplineModule,
            examens_module_1.ExamensModule,
            documents_module_1.DocumentsModule,
            dashboard_module_1.DashboardModule,
            portail_module_1.PortailModule,
            rh_module_1.RHModule,
            caissier_module_1.CaissierModule,
            economat_module_1.EconomatModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map