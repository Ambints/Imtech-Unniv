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
const email_service_1 = require("../email/email.service");
const cache_service_1 = require("../cache/cache.service");
const bcrypt = __importStar(require("bcryptjs"));
const crypto = __importStar(require("crypto"));
let UsersService = class UsersService {
    constructor(repo, superAdminRepo, tenantRepo, dataSource, emailService, cacheService) {
        this.repo = repo;
        this.superAdminRepo = superAdminRepo;
        this.tenantRepo = tenantRepo;
        this.dataSource = dataSource;
        this.emailService = emailService;
        this.cacheService = cacheService;
    }
    generateSecurePassword(length = 12) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        password += 'abcdefghijklmnopqrstuvwxyz'[crypto.randomInt(26)];
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[crypto.randomInt(26)];
        password += '0123456789'[crypto.randomInt(10)];
        password += '!@#$%^&*'[crypto.randomInt(8)];
        for (let i = 4; i < length; i++) {
            password += charset[crypto.randomInt(charset.length)];
        }
        return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
    }
    async create(dto) {
        const password = dto.password || this.generateSecurePassword();
        const hashedPassword = await bcrypt.hash(password, 12);
        await this.cacheService.invalidatePattern('users:*');
        if (dto.role === 'super_admin') {
            const existingSuperAdmin = await this.superAdminRepo.findOne({ where: { email: dto.email } });
            if (existingSuperAdmin)
                throw new common_1.ConflictException('Email deja utilise');
            const superAdmin = this.superAdminRepo.create({
                email: dto.email,
                password: hashedPassword,
                nom: dto.nom,
                prenom: dto.prenom,
                actif: dto.actif !== undefined ? dto.actif : true,
                passwordResetRequired: !dto.password,
                lastPasswordReset: !dto.password ? new Date() : null,
            });
            const savedSuperAdmin = await this.superAdminRepo.save(superAdmin);
            if (!dto.password) {
                try {
                    await this.emailService.sendCredentialsEmail(dto.email, dto.nom, dto.prenom, password, 'Super Administrateur', 'IMTECH University');
                    console.log(`Email d'identifiants envoyé au super admin ${dto.email}`);
                }
                catch (error) {
                    console.error('Erreur lors de l\'envoi d\'email au super admin:', error);
                }
            }
            return {
                ...savedSuperAdmin,
                plainPassword: !dto.password ? password : undefined,
                passwordResetRequired: !dto.password,
                emailSent: !dto.password
            };
        }
        if (dto.tenantId) {
            const tenant = await this.tenantRepo.findOne({ where: { id: dto.tenantId } });
            if (!tenant)
                throw new common_1.NotFoundException('Université non trouvée');
            const checkQuery = `SELECT id FROM "${tenant.schemaName}".utilisateur WHERE email = $1`;
            const existing = await this.dataSource.query(checkQuery, [dto.email]);
            if (existing.length > 0)
                throw new common_1.ConflictException('Email deja utilise dans cette université');
            const tableCheckQuery = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = $1 AND table_name = 'utilisateur'
      `;
            const tableExists = await this.dataSource.query(tableCheckQuery, [tenant.schemaName]);
            if (tableExists.length === 0) {
                throw new common_1.NotFoundException(`La table 'utilisateur' n'existe pas dans le schéma ${tenant.schemaName}`);
            }
            const insertQuery = `
        INSERT INTO "${tenant.schemaName}".utilisateur
        (email, password_hash, nom, prenom, telephone, role, actif, email_verifie, password_reset_required, last_password_reset)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, email, nom, prenom, telephone, role, actif, created_at, password_reset_required
      `;
            const result = await this.dataSource.query(insertQuery, [
                dto.email,
                hashedPassword,
                dto.nom,
                dto.prenom,
                dto.telephone || null,
                dto.role,
                dto.actif !== undefined ? dto.actif : true,
                true,
                !dto.password,
                !dto.password ? new Date() : null
            ]);
            const userId = result[0].id;
            if (dto.role === 'enseignant') {
                try {
                    const countQuery = `
            SELECT COUNT(*) as count
            FROM "${tenant.schemaName}".enseignant
          `;
                    const countResult = await this.dataSource.query(countQuery);
                    const nextNum = (parseInt(countResult[0]?.count || 0) + 1);
                    const matricule = `ENS${String(nextNum).padStart(5, '0')}`;
                    console.log(`Génération du matricule: ${matricule} (next_num: ${nextNum})`);
                    const insertEnseignantQuery = `
            INSERT INTO "${tenant.schemaName}".enseignant
            (utilisateur_id, matricule, nom, prenom, titre, grade, specialite, email, telephone, actif)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, matricule
          `;
                    const enseignantResult = await this.dataSource.query(insertEnseignantQuery, [
                        userId,
                        matricule,
                        dto.nom,
                        dto.prenom,
                        dto.titre || null,
                        dto.grade || null,
                        dto.specialite || null,
                        dto.email,
                        dto.telephone || null,
                        true
                    ]);
                    console.log(`Enregistrement enseignant créé avec matricule ${matricule} pour l'utilisateur ${dto.email}`);
                    result[0].enseignantId = enseignantResult[0].id;
                    result[0].matricule = enseignantResult[0].matricule;
                }
                catch (error) {
                    console.error('Erreur lors de la création de l\'enregistrement enseignant:', error);
                    console.error('Détails de l\'erreur:', error.stack);
                    await this.dataSource.query(`DELETE FROM "${tenant.schemaName}".utilisateur WHERE id = $1`, [userId]);
                    throw new common_1.ConflictException('Erreur lors de la création du profil enseignant: ' + error.message);
                }
            }
            if (!dto.password) {
                try {
                    await this.emailService.sendCredentialsEmail(dto.email, dto.nom, dto.prenom, password, dto.role, tenant.nom);
                    console.log(`Email d'identifiants envoyé à l'utilisateur ${dto.email} (${tenant.nom})`);
                }
                catch (error) {
                    console.error('Erreur lors de l\'envoi d\'email à l\'utilisateur:', error);
                }
            }
            return {
                ...result[0],
                tenantId: tenant.id,
                university: tenant.nom,
                plainPassword: !dto.password ? password : undefined,
                passwordResetRequired: !dto.password,
                emailSent: !dto.password
            };
        }
        throw new common_1.ConflictException('TenantId requis pour créer un utilisateur');
    }
    async findSuperAdminById(id) {
        return this.superAdminRepo.findOne({ where: { id } });
    }
    async updateSuperAdminPassword(id, hashedPassword) {
        await this.superAdminRepo.update(id, {
            password: hashedPassword,
            passwordResetRequired: false,
            lastPasswordReset: new Date()
        });
    }
    async findById(id) {
        return this.repo.findOne({ where: { id } });
    }
    async updateUserPassword(id, hashedPassword) {
        await this.repo.update(id, {
            password: hashedPassword,
            passwordResetRequired: false,
            lastPasswordReset: new Date()
        });
    }
    async findAll(tid, role, university, page = 1, limit = 50) {
        const cacheKey = cache_service_1.CacheService.generateUserCacheKey('findAll', {
            tid, role, university, page, limit
        });
        const cached = await this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const tenants = await this.tenantRepo.find({ where: { actif: true } });
        const allUsers = [];
        let totalCount = 0;
        for (const tenant of tenants) {
            if (tid && tenant.id !== tid)
                continue;
            if (university) {
                const matchById = tenant.id === university;
                const matchByName = tenant.nom.toLowerCase().indexOf(university.toLowerCase()) !== -1;
                if (!matchById && !matchByName)
                    continue;
            }
            const schemaName = tenant.schemaName;
            let query = `SELECT id, email, nom, prenom, telephone, role, actif, created_at, derniere_connexion FROM "${schemaName}".utilisateur`;
            const params = [];
            const conditions = [];
            if (role) {
                conditions.push(`role = $${params.length + 1}`);
                params.push(role);
            }
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }
            query += ' ORDER BY created_at DESC';
            const offset = (page - 1) * limit;
            query += ` LIMIT ${limit} OFFSET ${offset}`;
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
                    tenantId: tenant.id,
                    university: tenant.nom,
                })));
            }
            catch (err) {
                console.warn(`Failed to query schema ${tenant.schemaName}:`, err?.message || String(err));
            }
        }
        await this.cacheService.set(cacheKey, allUsers, 300);
        return allUsers;
    }
    async findOne(id) {
        const tenants = await this.tenantRepo.find({ where: { actif: true } });
        for (const tenant of tenants) {
            if (!tenant.schemaName)
                continue;
            try {
                const query = `
          SELECT id, email, password_hash, nom, prenom, telephone, photo_url, role, actif, 
                 token_reset, token_reset_expiry, created_at, updated_at
          FROM "${tenant.schemaName}".utilisateur
          WHERE id = $1
          LIMIT 1
        `;
                const result = await this.dataSource.query(query, [id]);
                if (result && result.length > 0) {
                    const user = result[0];
                    return {
                        id: user.id,
                        email: user.email,
                        password: user.password_hash,
                        nom: user.nom,
                        prenom: user.prenom,
                        telephone: user.telephone,
                        photoUrl: user.photo_url,
                        role: user.role,
                        actif: user.actif,
                        tokenReset: user.token_reset,
                        tokenResetExpiry: user.token_reset_expiry,
                        createdAt: user.created_at,
                        updatedAt: user.updated_at,
                        tenantId: tenant.id,
                    };
                }
            }
            catch (err) {
                console.warn(`[UsersService] Failed to findOne in schema ${tenant.schemaName}:`, err?.message);
            }
        }
        throw new common_1.NotFoundException('Utilisateur introuvable');
    }
    async findByEmail(email) {
        const tenants = await this.tenantRepo.find({ where: { actif: true } });
        for (const tenant of tenants) {
            if (!tenant.schemaName)
                continue;
            try {
                const query = `
          SELECT id, email, password_hash, nom, prenom, telephone, photo_url, role, actif, created_at, updated_at
          FROM "${tenant.schemaName}".utilisateur
          WHERE email = $1
          LIMIT 1
        `;
                const result = await this.dataSource.query(query, [email]);
                if (result && result.length > 0) {
                    const user = result[0];
                    console.log(`[UsersService] Found user in tenant ${tenant.nom} (${tenant.schemaName})`);
                    return {
                        id: user.id,
                        email: user.email,
                        password: user.password_hash,
                        nom: user.nom,
                        prenom: user.prenom,
                        telephone: user.telephone,
                        photoUrl: user.photo_url,
                        role: user.role,
                        actif: user.actif,
                        createdAt: user.created_at,
                        updatedAt: user.updated_at,
                        tenantId: tenant.id,
                        tenantSchema: tenant.schemaName,
                    };
                }
            }
            catch (err) {
                console.warn(`[UsersService] Failed to search in schema ${tenant.schemaName}:`, err?.message);
            }
        }
        return null;
    }
    async getTenantInfo(tenantId) {
        return this.tenantRepo.findOne({ where: { id: tenantId } });
    }
    async findSuperAdminByEmail(email) {
        return this.superAdminRepo.findOne({ where: { email } });
    }
    async updateSuperAdminLastLogin(id) {
        await this.superAdminRepo.update(id, { derniereConnexion: new Date() });
    }
    async update(id, dto) {
        console.log(`[UsersService] Updating user ${id} with data:`, { ...dto, password: dto.password ? '***' : undefined });
        await this.cacheService.invalidatePattern('users:*');
        const tenants = await this.tenantRepo.find({ where: { actif: true } });
        for (const tenant of tenants) {
            if (!tenant.schemaName || tenant.schemaName === 'univ_demo') {
                continue;
            }
            try {
                const checkQuery = `SELECT id FROM "${tenant.schemaName}".utilisateur WHERE id = $1`;
                const exists = await this.dataSource.query(checkQuery, [id]);
                if (exists.length > 0) {
                    console.log(`[UsersService] Found user in schema ${tenant.schemaName}`);
                    if (dto.email !== undefined) {
                        const emailCheckQuery = `SELECT id FROM "${tenant.schemaName}".utilisateur WHERE email = $1 AND id != $2`;
                        const emailExists = await this.dataSource.query(emailCheckQuery, [dto.email, id]);
                        if (emailExists.length > 0) {
                            throw new common_1.ConflictException(`L'email ${dto.email} est déjà utilisé par un autre utilisateur`);
                        }
                    }
                    const updates = [];
                    const values = [];
                    let paramIndex = 1;
                    if (dto.nom !== undefined) {
                        updates.push(`nom = $${paramIndex++}`);
                        values.push(dto.nom);
                    }
                    if (dto.prenom !== undefined) {
                        updates.push(`prenom = $${paramIndex++}`);
                        values.push(dto.prenom);
                    }
                    if (dto.email !== undefined) {
                        updates.push(`email = $${paramIndex++}`);
                        values.push(dto.email);
                    }
                    if (dto.telephone !== undefined) {
                        updates.push(`telephone = $${paramIndex++}`);
                        values.push(dto.telephone);
                    }
                    if (dto.role !== undefined) {
                        updates.push(`role = $${paramIndex++}`);
                        values.push(dto.role);
                    }
                    if (dto.actif !== undefined) {
                        updates.push(`actif = $${paramIndex++}`);
                        values.push(dto.actif);
                    }
                    if (dto.derniereConnexion !== undefined) {
                        updates.push(`derniere_connexion = $${paramIndex++}`);
                        values.push(dto.derniereConnexion);
                    }
                    if (dto.password) {
                        const hashedPassword = await bcrypt.hash(dto.password, 12);
                        updates.push(`password_hash = $${paramIndex++}`);
                        values.push(hashedPassword);
                        updates.push(`password_reset_required = false`);
                        updates.push(`last_password_reset = NOW()`);
                    }
                    updates.push(`updated_at = NOW()`);
                    if (updates.length > 1) {
                        values.push(id);
                        const updateQuery = `
              UPDATE "${tenant.schemaName}".utilisateur
              SET ${updates.join(', ')}
              WHERE id = $${paramIndex}
              RETURNING id, email, nom, prenom, telephone, role, actif, created_at, updated_at
            `;
                        console.log(`[UsersService] Executing update query with ${values.length} params`);
                        const result = await this.dataSource.query(updateQuery, values);
                        console.log(`[UsersService] Update successful`);
                        return {
                            ...result[0],
                            tenantId: tenant.id,
                            university: tenant.nom
                        };
                    }
                    const selectQuery = `SELECT id, email, nom, prenom, telephone, role, actif, created_at, updated_at FROM "${tenant.schemaName}".utilisateur WHERE id = $1`;
                    const result = await this.dataSource.query(selectQuery, [id]);
                    return {
                        ...result[0],
                        tenantId: tenant.id,
                        university: tenant.nom
                    };
                }
            }
            catch (err) {
                console.error(`[UsersService] Failed to update in schema ${tenant.schemaName}:`, err?.message || String(err));
                console.error(err);
                throw err;
            }
        }
        console.error(`[UsersService] User ${id} not found in any tenant schema`);
        throw new common_1.NotFoundException(`Utilisateur ${id} introuvable`);
    }
    async remove(id) {
        await this.cacheService.invalidatePattern('users:*');
        const tenants = await this.tenantRepo.find({ where: { actif: true } });
        for (const tenant of tenants) {
            if (!tenant.schemaName || tenant.schemaName === 'univ_demo') {
                continue;
            }
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
            if (!tenant.schemaName || tenant.schemaName === 'univ_demo') {
                continue;
            }
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
        console.warn('[UsersService] updateRefreshToken: tokenReset columns not available in schema');
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
        typeorm_2.DataSource,
        email_service_1.EmailService,
        cache_service_1.CacheService])
], UsersService);
//# sourceMappingURL=users.service.js.map