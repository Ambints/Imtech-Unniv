"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaissierModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const caissier_controller_1 = require("./caissier.controller");
const caissier_service_1 = require("./caissier.service");
const finance_entities_1 = require("../finance/finance.entities");
const frais_inscription_entity_1 = require("./frais-inscription.entity");
const cloture_caisse_entity_1 = require("./cloture-caisse.entity");
const entities_1 = require("../scolarite/entities");
let CaissierModule = class CaissierModule {
};
exports.CaissierModule = CaissierModule;
exports.CaissierModule = CaissierModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                finance_entities_1.Paiement,
                finance_entities_1.Echeancier,
                frais_inscription_entity_1.FraisInscription,
                cloture_caisse_entity_1.ClotureCaisse,
                entities_1.Parcours,
                entities_1.AnneeAcademique,
                entities_1.Inscription,
                entities_1.Etudiant,
                entities_1.Utilisateur
            ], 'tenant')
        ],
        controllers: [caissier_controller_1.CaissierController],
        providers: [caissier_service_1.CaissierService],
        exports: [caissier_service_1.CaissierService],
    })
], CaissierModule);
//# sourceMappingURL=caissier.module.js.map