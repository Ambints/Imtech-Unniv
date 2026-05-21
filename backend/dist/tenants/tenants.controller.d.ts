import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto';
export declare class TenantsController {
    private readonly svc;
    constructor(svc: TenantsService);
    getMyTenantConfig(req: any): Promise<import("./tenant.entity").Tenant>;
    updateMyTenantConfig(req: any, dto: UpdateTenantDto): Promise<import("./tenant.entity").Tenant>;
    getMyTenantStats(req: any): Promise<any>;
    create(dto: CreateTenantDto): Promise<import("./tenant.entity").Tenant>;
    findAll(): Promise<import("./tenant.entity").Tenant[]>;
    getPlans(): Promise<import("./plan.entity").Plan[]>;
    getPlan(id: string): Promise<import("./plan.entity").Plan>;
    createPlan(dto: any): Promise<import("./plan.entity").Plan>;
    updatePlan(id: string, dto: any): Promise<import("./plan.entity").Plan>;
    deletePlan(id: string): Promise<void>;
    findBySlug(slug: string): Promise<import("./tenant.entity").Tenant>;
    getSubscriptions(): Promise<{
        subscriptions: any[];
        stats: any;
    }>;
    checkTenantTable(): Promise<{
        tenantCount: number;
        tenants: import("./tenant.entity").Tenant[];
        schemas: any[];
        message: string;
        error?: undefined;
    } | {
        error: string;
        tenantCount: number;
        tenants: any[];
        schemas: any[];
        message?: undefined;
    }>;
    findOne(id: string): Promise<import("./tenant.entity").Tenant>;
    update(id: string, dto: UpdateTenantDto): Promise<import("./tenant.entity").Tenant>;
    remove(id: string): Promise<void>;
    dashboard(id: string): Promise<any>;
    getFullConfig(id: string): Promise<import("./tenant.entity").Tenant>;
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
