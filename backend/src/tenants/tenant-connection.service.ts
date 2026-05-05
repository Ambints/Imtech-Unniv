import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Tenant } from './tenant.entity';

@Injectable()
export class TenantConnectionService {
  private schemaCache: Map<string, string> = new Map();

  constructor(
    @InjectConnection('tenant') private readonly tenantConnection: Connection,
    @InjectConnection('default') private readonly defaultConnection: Connection,
  ) {}

  async setTenantSchema(tenantId: string): Promise<void> {
    if (!tenantId || !this.tenantConnection.isConnected) return;

    // Check cache first
    let schemaName = this.schemaCache.get(tenantId);

    if (!schemaName) {
      // Try to find tenant name from public schema using default connection
      try {
        const result = await this.defaultConnection.query(
          `SELECT id, nom FROM tenant WHERE id = $1`,
          [tenantId]
        );

        if (result && result.length > 0) {
          const tenantName = result[0].nom || tenantId;
          // Clean tenant name for schema: lowercase, remove special chars
          schemaName = `tenant_${tenantName.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
        } else {
          // Fallback to UUID format
          schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
        }

        this.schemaCache.set(tenantId, schemaName);
      } catch (error) {
        console.error(`[TenantConnection] Failed to lookup tenant ${tenantId}:`, error);
        schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
      }
    }

    try {
      // Ensure schema exists
      await this.tenantConnection.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
      await this.tenantConnection.query(`SET search_path TO "${schemaName}", public`);
      console.log(`[TenantConnection] Schema switched to: ${schemaName}`);
    } catch (error) {
      console.error(`[TenantConnection] Failed to switch to schema ${schemaName}:`, error);
      // Create and use schema based on tenant ID as fallback
      const fallbackSchema = `tenant_${tenantId.replace(/-/g, '_')}`;
      await this.tenantConnection.query(`CREATE SCHEMA IF NOT EXISTS "${fallbackSchema}"`);
      await this.tenantConnection.query(`SET search_path TO "${fallbackSchema}", public`);
      console.log(`[TenantConnection] Fallback schema: ${fallbackSchema}`);
    }
  }

  clearCache(): void {
    this.schemaCache.clear();
  }

  getConnection(): Connection {
    return this.tenantConnection;
  }
}
