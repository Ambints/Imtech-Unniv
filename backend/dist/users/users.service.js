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
const tenant_entity_1 = require("../tenants/tenant.entity");
const bcrypt = __importStar(require("bcryptjs"));
let UsersService = class UsersService {
    constructor(repo, superAdminRepo, tenantRepo, dataSource) {
        this.repo = repo;
        this.superAdminRepo = superAdminRepo;
        this.tenantRepo = tenantRepo;
        this.dataSource = dataSource;
    }
    async create(dto) {
        const password = await bcrypt.hash(dto.password || 'Imtech@2024!', 12);
        if (dto.role === 'super_admin') {
            const existingSuperAdmin = await this.superAdminRepo.findOne({ where: { email: dto.email } });
            if (existingSuperAdmin)
                throw new common_1.ConflictException('Email deja utilise');
            const superAdmin = this.superAdminRepo.create({
                email: dto.email,
                password: password,
                nom: dto.nom,
                prenom: dto.prenom,
                actif: dto.actif !== undefined ? dto.actif : true,
            });
            return this.superAdminRepo.save(superAdmin);
        }
        if (dto.tenantId) {
            const tenant = await this.tenantRepo.findOne({ where: { id: dto.tenantId } });
            if (!tenant)
                throw new common_1.NotFoundException('Université non trouvée');
            const checkQuery = `SELECT id FROM "${tenant.schemaName}".utilisateur WHERE email = $1`;
            const existing = await this.dataSource.query(checkQuery, [dto.email]);
            if (existing.length > 0)
                throw new common_1.ConflictException('Email deja utilise dans cette université');
            const insertQuery = `
        INSERT INTO "${tenant.schemaName}".utilisateur
        (email, password_hash, nom, prenom, telephone, role, actif, email_verifie)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, email, nom, prenom, telephone, role, actif, created_at
      `;
            const result = await this.dataSource.query(insertQuery, [
                dto.email,
                password,
                dto.nom,
                dto.prenom,
                dto.telephone || null,
                dto.role,
                dto.actif !== undefined ? dto.actif : true,
                true
            ]);
            return {
                ...result[0],
                tenantId: tenant.id,
                university: tenant.nom
            };
        }
        throw new common_1.ConflictException('TenantId requis pour créer un utilisateur');
    }
    async findAll(tid, role, university) {
        const tenants = await this.tenantRepo.find({ where: { actif: true } });
        const allUsers = [];
        for (const tenant of tenants) {
            if (tid && tenant.id !== tid)
                continue;
            if (university && tenant.id !== university && tenant.slug !== university)
                continue;
            const query = role
                ? `SELECT id, prenom, nom, email, role, actif, created_at, telephone, photo_url, $1::uuid as tenant_id, $2 as university
           FROM "${tenant.schemaName}".utilisateur
           WHERE role = $3`
                : `SELECT id, prenom, nom, email, role, actif, created_at, telephone, photo_url, $1::uuid as tenant_id, $2 as university
           FROM "${tenant.schemaName}".utilisateur`;
            const params = role ? [tenant.id, tenant.nom, role] : [tenant.id, tenant.nom];
            try {
                const users = await this.dataSource.query(query, params);
                allUsers.push(...users.map((u) => ({
                    id: u.id,
                    prenom: u.prenom,
                    nom: u.nom,
                    email: u.email,
                    role: u.role,
                    actif: u.actif,
                    createdAt: u.created_at,
                    telephone: u.telephone,
                    photoUrl: u.photo_url,
                    tenantId: u.tenant_id,
                    university: u.university,
                })));
            }
            catch (err) {
                console.warn(`Failed to query schema ${tenant.schemaName}:`, err?.message || String(err));
            }
        }
        return allUsers;
    }
    async findOne(id) {
        const u = await this.repo.findOne({ where: { id } });
        if (!u)
            throw new common_1.NotFoundException('Utilisateur introuvable');
        return u;
    }
    async findByEmail(email) {
        const tenants = await this.tenantRepo.find({ where: { actif: true } });
        for (const tenant of tenants) {
            try {
                const query = `
          SELECT id, email, password_hash as password, nom, prenom, telephone,
                 photo_url, role, actif, email_verifie, derniere_connexion,
                 token_reset, token_reset_expiry, created_at, updated_at
          FROM "${tenant.schemaName}".utilisateur
          WHERE email = $1
        `;
                const result = await this.dataSource.query(query, [email]);
                if (result.length > 0) {
                    const user = result[0];
                    return {
                        id: user.id,
                        email: user.email,
                        password: user.password,
                        nom: user.nom,
                        prenom: user.prenom,
                        telephone: user.telephone,
                        photoUrl: user.photo_url,
                        role: user.role,
                        actif: user.actif,
                        emailVerifie: user.email_verifie,
                        derniereConnexion: user.derniere_connexion,
                        tokenReset: user.token_reset,
                        tokenResetExpiry: user.token_reset_expiry,
                        createdAt: user.created_at,
                        updatedAt: user.updated_at,
                        tenantId: tenant.id,
                    };
                }
            }
            catch (err) {
                console.warn(`Failed to query schema ${tenant.schemaName}:`, err?.message || String(err));
            }
        }
        return null;
    }
    async findSuperAdminByEmail(email) {
        return this.superAdminRepo.findOne({ where: { email } });
    }
    async updateSuperAdminLastLogin(id) {
        await this.superAdminRepo.update(id, { derniereConnexion: new Date() });
    }
    async update(id, dto) {
        const tenants = await this.tenantRepo.find({ where: { actif: true } });
        for (const tenant of tenants) {
            try {
                const checkQuery = `SELECT id FROM "${tenant.schemaName}".utilisateur WHERE id = $1`;
                const exists = await this.dataSource.query(checkQuery, [id]);
                if (exists.length > 0) {
                    const updates = [];
                    const values = [];
                    let paramIndex = 1;
                    if (dto.nom) {
                        updates.push(`nom = $${paramIndex++}`);
                        values.push(dto.nom);
                    }
                    if (dto.prenom) {
                        updates.push(`prenom = $${paramIndex++}`);
                        values.push(dto.prenom);
                    }
                    if (dto.email) {
                        updates.push(`email = $${paramIndex++}`);
                        values.push(dto.email);
                    }
                    if (dto.telephone !== undefined) {
                        updates.push(`telephone = $${paramIndex++}`);
                        values.push(dto.telephone);
                    }
                    if (dto.role) {
                        updates.push(`role = $${paramIndex++}`);
                        values.push(dto.role);
                    }
                    if (dto.actif !== undefined) {
                        updates.push(`actif = $${paramIndex++}`);
                        values.push(dto.actif);
                    }
                    if (dto.derniereConnexion) {
                        updates.push(`derniere_connexion = $${paramIndex++}`);
                        values.push(dto.derniereConnexion);
                    }
                    if (dto.password) {
                        const hashedPassword = await bcrypt.hash(dto.password, 12);
                        updates.push(`password_hash = $${paramIndex++}`);
                        values.push(hashedPassword);
                    }
                    updates.push(`updated_at = NOW()`);
                    if (updates.length > 0) {
                        values.push(id);
                        const updateQuery = `
              UPDATE "${tenant.schemaName}".utilisateur
              SET ${updates.join(', ')}
              WHERE id = $${paramIndex}
              RETURNING id, email, nom, prenom, telephone, role, actif, created_at, updated_at
            `;
                        const result = await this.dataSource.query(updateQuery, values);
                        return {
                            ...result[0],
                            tenantId: tenant.id,
                            university: tenant.nom
                        };
                    }
                    return exists[0];
                }
            }
            catch (err) {
                console.warn(`Failed to update in schema ${tenant.schemaName}:`, err?.message || String(err));
            }
        }
        const u = await this.findOne(id);
        if (dto.password)
            dto.password = await bcrypt.hash(dto.password, 12);
        return this.repo.save({ ...u, ...dto });
    }
    async remove(id) {
        const tenants = await this.tenantRepo.find({ where: { actif: true } });
        for (const tenant of tenants) {
            try {
                const checkQuery = `SELECT id FROM "${tenant.schemaName}".utilisateur WHERE id = $1`;
                const exists = await this.dataSource.query(checkQuery, [id]);
                if (exists.length > 0) {
                    const deleteQuery = `DELETE FROM "${tenant.schemaName}".utilisateur WHERE id = $1`;
                    await this.dataSource.query(deleteQuery, [id]);
                    return;
                }
            }
            catch (err) {
                console.warn(`Failed to delete in schema ${tenant.schemaName}:`, err?.message || String(err));
            }
        }
        await this.repo.delete(id);
    }
    async updateRefreshToken(id, token) {
        const tenants = await this.tenantRepo.find({ where: { actif: true } });
        for (const tenant of tenants) {
            try {
                const checkQuery = `SELECT id FROM "${tenant.schemaName}".utilisateur WHERE id = $1`;
                const exists = await this.dataSource.query(checkQuery, [id]);
                if (exists.length > 0) {
                    const updateQuery = `
            UPDATE "${tenant.schemaName}".utilisateur
            SET token_reset = $1, token_reset_expiry = $2
            WHERE id = $3
          `;
                    const expiry = token ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;
                    await this.dataSource.query(updateQuery, [token, expiry, id]);
                    return;
                }
            }
            catch (err) {
                console.warn(`Failed to update token in schema ${tenant.schemaName}:`, err?.message || String(err));
            }
        }
        await this.repo.update(id, {
            tokenReset: token,
            tokenResetExpiry: token ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User, 'tenant')),
    __param(1, (0, typeorm_1.InjectRepository)(super_admin_entity_1.SuperAdmin, 'default')),
    __param(2, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant, 'default')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], UsersService);
//# sourceMappingURL=users.service.js.map