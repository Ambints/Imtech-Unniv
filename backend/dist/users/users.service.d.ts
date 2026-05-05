import { Repository, DataSource } from 'typeorm';
import { User } from './user.entity';
import { SuperAdmin } from './super-admin.entity';
import { Tenant } from '../tenants/tenant.entity';
export declare class UsersService {
    private repo;
    private superAdminRepo;
    private tenantRepo;
    private dataSource;
    constructor(repo: Repository<User>, superAdminRepo: Repository<SuperAdmin>, tenantRepo: Repository<Tenant>, dataSource: DataSource);
    create(dto: any): Promise<any>;
    findAll(tid?: string, role?: string, university?: string): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByEmail(email: string): Promise<any>;
    findSuperAdminByEmail(email: string): Promise<SuperAdmin | null>;
    updateSuperAdminLastLogin(id: string): Promise<void>;
    update(id: string, dto: any): Promise<any>;
    remove(id: string): Promise<void>;
    updateRefreshToken(id: string, token: string | null): Promise<void>;
}
