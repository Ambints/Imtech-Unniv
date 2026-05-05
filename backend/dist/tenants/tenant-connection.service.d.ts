import { Connection } from 'typeorm';
export declare class TenantConnectionService {
    private readonly tenantConnection;
    private readonly defaultConnection;
    private schemaCache;
    constructor(tenantConnection: Connection, defaultConnection: Connection);
    setTenantSchema(tenantId: string): Promise<void>;
    clearCache(): void;
    getConnection(): Connection;
}
