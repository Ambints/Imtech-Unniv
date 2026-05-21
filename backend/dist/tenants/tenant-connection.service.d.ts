import { Connection, EntityManager } from 'typeorm';
export declare class TenantConnectionService {
    private readonly tenantConnection;
    private readonly defaultConnection;
    private schemaCache;
    private currentSchema;
    constructor(tenantConnection: Connection, defaultConnection: Connection);
    setTenantSchema(tenantId: string): Promise<void>;
    getCurrentSchema(): string | null;
    clearCache(): void;
    getConnection(): Connection;
    getManager(): Promise<EntityManager>;
}
