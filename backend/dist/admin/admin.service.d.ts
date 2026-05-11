import { Repository, DataSource } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { TenantConnectionService } from '../tenants/tenant-connection.service';
export declare class AdminService {
    private tenantRepo;
    private dataSource;
    private readonly tenantConnection;
    constructor(tenantRepo: Repository<Tenant>, dataSource: DataSource, tenantConnection: TenantConnectionService);
    getActivityLogs(tenantId: string, limit?: number): Promise<any[]>;
    getDetailedStats(tenantId: string): Promise<any>;
    bulkUpdateUserStatus(tenantId: string, userIds: string[], active: boolean): Promise<any>;
    exportUsers(tenantId: string, role?: string): Promise<any[]>;
    getSystemHealth(tenantId: string): Promise<any>;
    createBackup(tenantId: string): Promise<any>;
    defineSecretaireParcours(tenantId: string, parcoursId: string, secretaireId: string): Promise<any>;
    getSecretairesParcours(tenantId: string): Promise<any[]>;
    getSecretairesDisponibles(tenantId: string): Promise<any[]>;
    removeSecretaireParcours(tenantId: string, parcoursId: string): Promise<any>;
}
