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
const typeorm_1 = require("@nestjs/typeorm");
const economat_controller_1 = require("./economat.controller");
const economat_service_1 = require("./economat.service");
const finance_entities_1 = require("../finance/finance.entities");
const logistics_entities_1 = require("../logistics/logistics.entities");
let EconomatModule = class EconomatModule {
};
exports.EconomatModule = EconomatModule;
exports.EconomatModule = EconomatModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([finance_entities_1.Budget, finance_entities_1.Depense, logistics_entities_1.Stock])],
        controllers: [economat_controller_1.EconomatController],
        providers: [economat_service_1.EconomatService],
        exports: [economat_service_1.EconomatService],
    })
], EconomatModule);
//# sourceMappingURL=economat.module.js.map