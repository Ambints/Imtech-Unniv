import { Repository, DataSource } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
export declare class AdminService {
    private tenantRepo;
    private dataSource;
    constructor(tenantRepo: Repository<Tenant>, dataSource: DataSource);
    getActivityLogs(tenantId: string, limit?: number): Promise<any[]>;
    getDetailedStats(tenantId: string): Promise<any>;
    bulkUpdateUserStatus(tenantId: string, userIds: string[], active: boolean): Promise<any>;
    exportUsers(tenantId: string, role?: string): Promise<any[]>;
    getSystemHealth(tenantId: string): Promise<any>;
    createBackup(tenantId: string): Promise<any>;
}
