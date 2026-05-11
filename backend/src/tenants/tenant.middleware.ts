import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectConnection('tenant') private readonly tenantConnection: Connection,
    @InjectConnection('default') private readonly defaultConnection: Connection,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip tenant resolution for auth routes - login uses public schema or searches all tenants
    const fullPath = req.originalUrl || req.url;
    if (fullPath.includes('/auth/') || fullPath.includes('/login')) {
      console.log(`[TenantMiddleware] Skipping tenant resolution for auth route: ${fullPath}`);
      (req as any).tenantSchema = 'public';
      (req as any).tenantId = null;
      return next();
    }

    // Extract tenantId from header or URL
    let tenantId = (req.headers['x-tenant-id'] as string) || '';
    
    if (!tenantId) {
      const pathParts = fullPath.split('/');
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const foundId = pathParts.find(part => uuidPattern.test(part));
      if (foundId) {
        tenantId = foundId;
        console.log(`[TenantMiddleware] Extracted tenant ID from URL: ${tenantId}`);
      }
    }
    
    if (this.tenantConnection.isConnected && tenantId) {
      try {
        // Look up tenant schema from public.tenant table
        const tenantResult = await this.defaultConnection.query(
          'SELECT schema_name FROM public.tenant WHERE id = $1 AND actif = true',
          [tenantId]
        );
        
        let schemaName: string;
        if (tenantResult && tenantResult.length > 0) {
          schemaName = tenantResult[0].schema_name;
          console.log(`[TenantMiddleware] Found schema "${schemaName}" for tenant ${tenantId}`);
        } else {
          // Fallback to default schema if tenant not found
          schemaName = process.env.DEFAULT_TENANT_SCHEMA || 'univ_demo';
          console.warn(`[TenantMiddleware] Tenant ${tenantId} not found, using default schema: ${schemaName}`);
        }

        // Set schema for this request's connection
        await this.tenantConnection.query(`SET search_path TO "${schemaName}", public`);
        
        (req as any).tenantSchema = schemaName;
        (req as any).tenantId = tenantId;
        
        console.log(`[TenantMiddleware] Schema set to: ${schemaName} for tenant: ${tenantId}`);
      } catch (error) {
        console.error(`[TenantMiddleware] Failed to set schema for tenant ${tenantId}:`, error instanceof Error ? error.message : String(error));
      }
    } else {
      console.warn(`[TenantMiddleware] No tenant ID provided. URL: ${fullPath}`);
    }
    
    next();
  }
}
