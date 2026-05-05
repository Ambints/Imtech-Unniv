import { DataSource } from 'typeorm';
export declare class TenantCreationService {
    private dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    createTenantSchema(schemaName: string): Promise<void>;
    dropTenantSchema(schemaName: string): Promise<void>;
    seedTenantData(schemaName: string, adminEmail: string, adminPassword: string): Promise<void>;
    private parseSqlStatements;
}
