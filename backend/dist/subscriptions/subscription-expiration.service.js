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
var SubscriptionExpirationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionExpirationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../tenants/tenant.entity");
let SubscriptionExpirationService = SubscriptionExpirationService_1 = class SubscriptionExpirationService {
    constructor(tenantRepo) {
        this.tenantRepo = tenantRepo;
        this.logger = new common_1.Logger(SubscriptionExpirationService_1.name);
    }
    onModuleInit() {
        this.handleExpiredSubscriptions();
        this.intervalId = setInterval(() => {
            this.handleExpiredSubscriptions();
        }, 24 * 60 * 60 * 1000);
        this.logger.log('Subscription expiration checker initialized (runs every 24h)');
    }
    onModuleDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
    async handleExpiredSubscriptions() {
        this.logger.log('Checking for expired subscriptions...');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        try {
            const expiredTenants = await this.tenantRepo.find({
                where: {
                    statutAbonnement: 'active',
                    dateFinAbonnement: (0, typeorm_2.LessThan)(today),
                },
            });
            if (expiredTenants.length === 0) {
                this.logger.log('No expired subscriptions found.');
                return;
            }
            this.logger.log(`Found ${expiredTenants.length} expired subscription(s). Suspending...`);
            for (const tenant of expiredTenants) {
                await this.suspendTenant(tenant);
            }
            this.logger.log(`Successfully suspended ${expiredTenants.length} tenant(s).`);
        }
        catch (error) {
            this.logger.error('Error processing expired subscriptions:', error instanceof Error ? error.stack : String(error));
        }
    }
    async suspendTenant(tenant) {
        tenant.actif = false;
        tenant.statutAbonnement = 'suspended';
        await this.tenantRepo.save(tenant);
        await this.tenantRepo.query(`UPDATE public.abonnement 
       SET statut = 'expire', 
           updated_at = NOW() 
       WHERE tenant_id = $1 
         AND statut IN ('actif', 'essai')`, [tenant.id]);
        this.logger.warn(`Tenant "${tenant.nom}" (${tenant.slug}) suspended - Subscription expired on ${tenant.dateFinAbonnement.toISOString().split('T')[0]}`);
    }
    async getSubscriptionStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        const [active, expired, suspended, expiringSoon] = await Promise.all([
            this.tenantRepo.count({ where: { statutAbonnement: 'active', actif: true } }),
            this.tenantRepo.count({
                where: {
                    statutAbonnement: 'suspended',
                }
            }),
            this.tenantRepo.count({ where: { statutAbonnement: 'expired' } }),
            this.tenantRepo.query(`SELECT COUNT(*) FROM public.tenant 
         WHERE statut_abonnement = 'active' 
         AND date_fin_abonnement >= $1 
         AND date_fin_abonnement < $2`, [today, sevenDaysFromNow]).then(res => parseInt(res[0].count)),
        ]);
        return { active, expired, suspended, expiringSoon };
    }
};
exports.SubscriptionExpirationService = SubscriptionExpirationService;
exports.SubscriptionExpirationService = SubscriptionExpirationService = SubscriptionExpirationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant, 'default')),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SubscriptionExpirationService);
//# sourceMappingURL=subscription-expiration.service.js.map