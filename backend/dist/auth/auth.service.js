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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = class AuthService {
    constructor(users, jwt) {
        this.users = users;
        this.jwt = jwt;
    }
    async login(email, password) {
        const superAdmin = await this.users.findSuperAdminByEmail(email);
        if (superAdmin) {
            const valid = await bcrypt.compare(password, superAdmin.password);
            if (!valid)
                throw new common_1.UnauthorizedException('Identifiants invalides');
            if (!superAdmin.actif)
                throw new common_1.UnauthorizedException('Compte desactive');
            const payload = { sub: superAdmin.id, email: superAdmin.email, role: 'super_admin' };
            const accessToken = this.jwt.sign(payload, { expiresIn: '8h' });
            const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });
            await this.users.updateSuperAdminLastLogin(superAdmin.id);
            return {
                accessToken,
                refreshToken,
                user: {
                    id: superAdmin.id,
                    email: superAdmin.email,
                    firstName: superAdmin.prenom,
                    lastName: superAdmin.nom,
                    role: 'super_admin',
                    photoUrl: null,
                },
            };
        }
        const user = await this.users.findByEmail(email);
        if (!user)
            throw new common_1.UnauthorizedException('Identifiants invalides');
        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            throw new common_1.UnauthorizedException('Identifiants invalides');
        if (!user.actif)
            throw new common_1.UnauthorizedException('Compte desactive');
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwt.sign(payload, { expiresIn: '8h' });
        const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });
        await this.users.updateRefreshToken(user.id, refreshToken);
        await this.users.update(user.id, { derniereConnexion: new Date() });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.prenom,
                lastName: user.nom,
                role: user.role,
                photoUrl: user.photoUrl,
            },
        };
    }
    async refresh(userId, token) {
        const user = await this.users.findOne(userId);
        if (!user || user.tokenReset !== token)
            throw new common_1.UnauthorizedException('Token invalide');
        if (user.tokenResetExpiry && user.tokenResetExpiry < new Date())
            throw new common_1.UnauthorizedException('Token expire');
        const payload = { sub: user.id, email: user.email, role: user.role };
        return { accessToken: this.jwt.sign(payload, { expiresIn: '8h' }) };
    }
    async logout(userId) {
        await this.users.updateRefreshToken(userId, null);
        return { message: 'Deconnecte avec succes' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService, jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map