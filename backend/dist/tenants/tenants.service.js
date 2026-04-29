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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("./tenant.entity");
const tenant_creation_service_1 = require("./tenant-creation.service");
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    return String(error);
}
let TenantsService = class TenantsService {
    constructor(repo, tenantCreationService) {
        this.repo = repo;
        this.tenantCreationService = tenantCreationService;
    }
    async create(dto) {
        const existing = await this.repo.findOne({ where: { slug: dto.slug } });
        if (existing) {
            throw new common_1.BadRequestException('Une université avec ce slug existe déjà');
        }
        const schemaName = 'tenant_' + dto.slug.replace(/-/g, '_');
        if (schemaName.length > 63) {
            throw new common_1.BadRequestException('Le slug est trop long (max 63 caractères pour le schéma)');
        }
        try {
            await this.tenantCreationService.createTenantSchema(schemaName);
            const tenant = this.repo.create({
                ...dto,
                schemaName,
                actif: true,
            });
            const savedTenant = await this.repo.save(tenant);
            const adminEmail = `admin@${dto.slug}.edu`;
            await this.tenantCreationService.seedTenantData(schemaName, adminEmail, 'Admin@1234');
            return savedTenant;
        }
        catch (error) {
            try {
                await this.tenantCreationService.dropTenantSchema(schemaName);
            }
            catch (cleanupError) {
            }
            throw error;
        }
    }
    async findAll() {
        return this.repo.find({
            order: { createdAt: 'DESC' },
            select: ['id', 'nom', 'slug', 'slogan', 'logoUrl', 'couleurPrincipale',
                'couleurSecondaire', 'actif', 'createdAt', 'pays', 'typeEtablissement']
        });
    }
    async findOne(id) {
        const t = await this.repo.findOne({ where: { id } });
        if (!t)
            throw new common_1.NotFoundException('Université introuvable');
        return t;
    }
    async findBySlug(slug) {
        const t = await this.repo.findOne({ where: { slug } });
        if (!t)
            throw new common_1.NotFoundException('Université introuvable');
        return t;
    }
    async update(id, dto) {
        const t = await this.findOne(id);
        if (dto.slug && dto.slug !== t.slug) {
            throw new common_1.BadRequestException('Le slug ne peut pas être modifié (lié au schéma de base de données)');
        }
        return this.repo.save({ ...t, ...dto });
    }
    async remove(id) {
        const tenant = await this.findOne(id);
        try {
            await this.tenantCreationService.dropTenantSchema(tenant.schemaName);
        }
        catch (error) {
            console.warn(`Impossible de supprimer le schéma ${tenant.schemaName}: ${getErrorMessage(error)}`);
        }
        await this.repo.delete(id);
    }
    async getDashboard(id) {
        const tenant = await this.findOne(id);
        return {
            tenantId: id,
            tenant: {
                nom: tenant.nom,
                slug: tenant.slug,
                schemaName: tenant.schemaName,
                couleurPrincipale: tenant.couleurPrincipale,
                couleurSecondaire: tenant.couleurSecondaire,
                couleurAccent: tenant.couleurAccent,
                couleurTexte: tenant.couleurTexte,
            },
            kpis: {
                totalStudents: 0,
                activeStudents: 0,
                totalRevenue: 0,
                pendingPayments: 0,
                successRate: 0,
                attendanceRate: 0,
                totalCourses: 0,
                totalTeachers: 0,
            },
            recentActivities: [],
            whiteLabel: {
                logoUrl: tenant.logoUrl,
                slogan: tenant.slogan,
                enteteDocument: tenant.enteteDocument,
            }
        };
    }
    async getFullConfig(id) {
        return this.findOne(id);
    }
    async getSubscriptions() {
        const tenants = await this.repo.find({
            order: { createdAt: 'DESC' },
            select: ['id', 'nom', 'slug', 'actif', 'createdAt', 'planAbonnement',
                'statutAbonnement', 'dateDebutAbonnement', 'dateFinAbonnement',
                'prixMensuel', 'maxUtilisateurs']
        });
        const toISODate = (date) => {
            if (!date)
                return new Date().toISOString();
            if (date instanceof Date)
                return date.toISOString();
            if (typeof date === 'string')
                return new Date(date).toISOString();
            return new Date().toISOString();
        };
        const subscriptions = tenants.map(tenant => ({
            id: tenant.id,
            tenantId: tenant.slug,
            tenantName: tenant.nom,
            plan: tenant.planAbonnement || 'basic',
            status: tenant.statutAbonnement || 'active',
            startDate: toISODate(tenant.dateDebutAbonnement),
            endDate: toISODate(tenant.dateFinAbonnement) || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            monthlyPrice: Number(tenant.prixMensuel) || 50000,
            maxUsers: tenant.maxUtilisateurs || 100,
            currentUsers: 0,
            features: this.getPlanFeatures(tenant.planAbonnement || 'basic'),
        }));
        const now = new Date();
        const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
        const expiringSoon = subscriptions.filter(s => {
            const endDate = new Date(s.endDate);
            const daysUntilExpiry = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
        }).length;
        const suspended = subscriptions.filter(s => s.status === 'suspended').length;
        const totalRevenue = subscriptions
            .filter(s => s.status === 'active')
            .reduce((sum, s) => sum + s.monthlyPrice, 0);
        const stats = {
            totalRevenue,
            activeSubscriptions,
            expiringSoon,
            suspended,
        };
        return { subscriptions, stats };
    }
    getPlanFeatures(plan) {
        const features = {
            basic: ['LMS', 'Support Email'],
            standard: ['LMS', 'Finance', 'Support Email'],
            premium: ['LMS', 'Finance', 'RH', 'Logistique', 'Support 24/7'],
            enterprise: ['Toutes fonctionnalités', 'Support dédié', 'API personnalisée'],
        };
        return features[plan] || features.basic;
    }
    async updateSubscription(id, dto) {
        const tenant = await this.findOne(id);
        tenant.planAbonnement = dto.plan;
        tenant.statutAbonnement = dto.status;
        tenant.prixMensuel = dto.monthlyPrice ?? 50000;
        tenant.maxUtilisateurs = dto.maxUsers ?? 100;
        if (dto.startDate) {
            tenant.dateDebutAbonnement = new Date(dto.startDate);
        }
        if (dto.endDate) {
            tenant.dateFinAbonnement = new Date(dto.endDate);
        }
        else if (!tenant.dateFinAbonnement) {
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);
            tenant.dateFinAbonnement = endDate;
        }
        return this.repo.save(tenant);
    }
    async removeSubscription(id) {
        const tenant = await this.findOne(id);
        tenant.statutAbonnement = 'expired';
        tenant.dateFinAbonnement = new Date();
        await this.repo.save(tenant);
        return { message: `Abonnement de l'université ${tenant.nom} résilié avec succès` };
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenant_creation_service_1.TenantCreationService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map