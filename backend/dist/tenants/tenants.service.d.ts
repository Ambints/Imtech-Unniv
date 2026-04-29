import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
import { TenantCreationService } from './tenant-creation.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';
export declare class TenantsService {
    private repo;
    private tenantCreationService;
    constructor(repo: Repository<Tenant>, tenantCreationService: TenantCreationService);
    create(dto: CreateTenantDto): Promise<Tenant>;
    findAll(): Promise<Tenant[]>;
    findOne(id: string): Promise<Tenant>;
    findBySlug(slug: string): Promise<Tenant>;
    update(id: string, dto: UpdateTenantDto): Promise<Tenant>;
    remove(id: string): Promise<void>;
    getDashboard(id: string): Promise<any>;
    getFullConfig(id: string): Promise<Tenant>;
    getSubscriptions(): Promise<{
        subscriptions: any[];
        stats: any;
    }>;
    private getPlanFeatures;
    updateSubscription(id: string, dto: {
        plan: string;
        status: string;
        startDate?: string;
        endDate?: string;
        monthlyPrice?: number;
        maxUsers?: number;
    }): Promise<Tenant>;
    removeSubscription(id: string): Promise<{
        message: string;
    }>;
}
