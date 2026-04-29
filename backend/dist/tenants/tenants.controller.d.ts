import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';
export declare class TenantsController {
    private readonly svc;
    constructor(svc: TenantsService);
    create(dto: CreateTenantDto): Promise<import("./tenant.entity").Tenant>;
    findAll(): Promise<import("./tenant.entity").Tenant[]>;
    findOne(id: string): Promise<import("./tenant.entity").Tenant>;
    findBySlug(slug: string): Promise<import("./tenant.entity").Tenant>;
    update(id: string, dto: UpdateTenantDto): Promise<import("./tenant.entity").Tenant>;
    remove(id: string): Promise<void>;
    dashboard(id: string): Promise<any>;
    getFullConfig(id: string): Promise<import("./tenant.entity").Tenant>;
    getSubscriptions(): Promise<{
        subscriptions: any[];
        stats: any;
    }>;
    updateSubscription(id: string, dto: {
        plan: string;
        status: string;
        startDate?: string;
        endDate?: string;
        monthlyPrice?: number;
        maxUsers?: number;
    }): Promise<import("./tenant.entity").Tenant>;
    removeSubscription(id: string): Promise<{
        message: string;
    }>;
}
