import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
export declare class SubscriptionExpirationService implements OnModuleInit {
    private readonly tenantRepo;
    private readonly logger;
    private intervalId;
    constructor(tenantRepo: Repository<Tenant>);
    onModuleInit(): void;
    onModuleDestroy(): void;
    handleExpiredSubscriptions(): Promise<void>;
    private suspendTenant;
    getSubscriptionStats(): Promise<{
        active: number;
        expired: number;
        suspended: number;
        expiringSoon: number;
    }>;
}
