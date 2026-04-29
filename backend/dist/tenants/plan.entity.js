"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plan = void 0;
const typeorm_1 = require("typeorm");
let Plan = class Plan {
};
exports.Plan = Plan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Plan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, name: 'nom' }),
    __metadata("design:type", String)
], Plan.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'description' }),
    __metadata("design:type", String)
], Plan.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, name: 'prix_mensuel' }),
    __metadata("design:type", Number)
], Plan.prototype, "monthlyPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, name: 'max_etudiants' }),
    __metadata("design:type", Number)
], Plan.prototype, "maxStudents", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, name: 'max_utilisateurs' }),
    __metadata("design:type", Number)
], Plan.prototype, "maxUsers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {}, name: 'fonctionnalites' }),
    __metadata("design:type", Object)
], Plan.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, name: 'actif' }),
    __metadata("design:type", Boolean)
], Plan.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz', name: 'created_at' }),
    __metadata("design:type", Date)
], Plan.prototype, "createdAt", void 0);
exports.Plan = Plan = __decorate([
    (0, typeorm_1.Entity)('plan_abonnement', { schema: 'public' })
], Plan);
//# sourceMappingURL=plan.entity.js.map