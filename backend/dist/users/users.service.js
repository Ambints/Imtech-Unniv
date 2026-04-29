"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const super_admin_entity_1 = require("./super-admin.entity");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    constructor(repo, superAdminRepo) {
        this.repo = repo;
        this.superAdminRepo = superAdminRepo;
    }
    async create(dto) {
        const exists = await this.repo.findOne({ where: { email: dto.email } });
        if (exists)
            throw new common_1.ConflictException('Email deja utilise');
        const password = await bcrypt.hash(dto.password || 'Imtech@2024!', 12);
        return this.repo.save(this.repo.create({ ...dto, password }));
    }
    async findAll(tid, role) {
        const where = {};
        if (role)
            where.role = role;
        return this.repo.find({ where, select: ['id', 'prenom', 'nom', 'email', 'role', 'actif', 'createdAt', 'telephone', 'photoUrl'] });
    }
    async findOne(id) {
        const u = await this.repo.findOne({ where: { id } });
        if (!u)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        return u;
    }
    async findByEmail(email) {
        return this.repo.findOne({ where: { email } });
    }
    async findSuperAdminByEmail(email) {
        return this.superAdminRepo.findOne({ where: { email } });
    }
    async updateSuperAdminLastLogin(id) {
        await this.superAdminRepo.update(id, { derniereConnexion: new Date() });
    }
    async update(id, dto) {
        const u = await this.findOne(id);
        if (dto.password)
            dto.password = await bcrypt.hash(dto.password, 12);
        return this.repo.save({ ...u, ...dto });
    }
    async remove(id) {
        await this.repo.delete(id);
    }
    async updateRefreshToken(id, token) {
        await this.repo.update(id, { tokenReset: token, tokenResetExpiry: token ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(super_admin_entity_1.SuperAdmin)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map