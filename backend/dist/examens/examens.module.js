"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamensModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const examens_controller_1 = require("./examens.controller");
const examens_service_1 = require("./examens.service");
const examens_entities_1 = require("./examens.entities");
let ExamensModule = class ExamensModule {
};
exports.ExamensModule = ExamensModule;
exports.ExamensModule = ExamensModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([examens_entities_1.SujetExamen, examens_entities_1.Deliberation, examens_entities_1.Jury, examens_entities_1.PVNote])],
        controllers: [examens_controller_1.ExamensController],
        providers: [examens_service_1.ExamensService],
        exports: [examens_service_1.ExamensService],
    })
], ExamensModule);
//# sourceMappingURL=examens.module.js.map