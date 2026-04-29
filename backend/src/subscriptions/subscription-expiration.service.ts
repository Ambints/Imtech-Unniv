import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';

@Injectable()
export class SubscriptionExpirationService implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionExpirationService.name);
  private intervalId: NodeJS.Timeout;

  constructor(
    @InjectRepository(Tenant, 'default')
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  onModuleInit() {
    // Run immediately on startup, then every 24 hours
    this.handleExpiredSubscriptions();
    this.intervalId = setInterval(() => {
      this.handleExpiredSubscriptions();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
    
    this.logger.log('Subscription expiration checker initialized (runs every 24h)');
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  /**
   * Checks and suspends expired subscriptions
   */
  async handleExpiredSubscriptions(): Promise<void> {
    this.logger.log('Checking for expired subscriptions...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Find tenants with expired subscriptions that are still active
      const expiredTenants = await this.tenantRepo.find({
        where: {
          statutAbonnement: 'active',
          dateFinAbonnement: LessThan(today),
        },
      });

      if (expiredTenants.length === 0) {
        this.logger.log('No expired subscriptions found.');
        return;
      }

      this.logger.log(`Found ${expiredTenants.length} expired subscription(s). Suspending...`);

      // Suspend each expired tenant
      for (const tenant of expiredTenants) {
        await this.suspendTenant(tenant);
      }

      this.logger.log(`Successfully suspended ${expiredTenants.length} tenant(s).`);
    } catch (error) {
      this.logger.error('Error processing expired subscriptions:', error instanceof Error ? error.stack : String(error));
    }
  }

  /**
   * Suspend a tenant and update abonnement status
   */
  private async suspendTenant(tenant: Tenant): Promise<void> {
    // Update tenant status
    tenant.actif = false;
    tenant.statutAbonnement = 'suspended';
    await this.tenantRepo.save(tenant);

    // Update abonnement table status
    await this.tenantRepo.query(
      `UPDATE public.abonnement 
       SET statut = 'expire', 
           updated_at = NOW() 
       WHERE tenant_id = $1 
         AND statut IN ('actif', 'essai')`,
      [tenant.id]
    );

    this.logger.warn(
      `Tenant "${tenant.nom}" (${tenant.slug}) suspended - Subscription expired on ${tenant.dateFinAbonnement.toISOString().split('T')[0]}`
    );
  }

  /**
   * Manual trigger for testing - runs every minute when enabled
   * Uncomment for testing, then comment out again
   */
  // @Cron(CronExpression.EVERY_MINUTE)
  // async manualCheck(): Promise<void> {
  //   this.logger.debug('Manual check triggered');
  //   await this.handleExpiredSubscriptions();
  // }

  /**
   * Get statistics about subscription statuses
   */
  async getSubscriptionStats(): Promise<{
    active: number;
    expired: number;
    suspended: number;
    expiringSoon: number;
  }> {
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
      this.tenantRepo.query(
        `SELECT COUNT(*) FROM public.tenant 
         WHERE statut_abonnement = 'active' 
         AND date_fin_abonnement >= $1 
         AND date_fin_abonnement < $2`,
        [today, sevenDaysFromNow]
      ).then(res => parseInt(res[0].count)),
    ]);

    return { active, expired, suspended, expiringSoon };
  }
}
