import { Repository, DataSource } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';
export declare class PortailPermissionsController {
    private tenantRepo;
    private dataSource;
    constructor(tenantRepo: Repository<Tenant>, dataSource: DataSource);
    getPermissions(req: any): Promise<{
        etudiant: any[];
        parent: any[];
        professeur: any[];
    }>;
    getPermissionsByType(req: any, type: string): Promise<any>;
    updatePermission(req: any, type: string, key: string, body: {
        actif: boolean;
    }): Promise<{
        message: string;
        type: string;
        key: string;
        actif: boolean;
    }>;
    updatePermissionsBulk(req: any, type: string, body: {
        permissions: {
            [key: string]: boolean;
        };
    }): Promise<{
        message: string;
        type: string;
    }>;
}
