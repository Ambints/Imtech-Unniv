import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly dataSource: DataSource) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] || req.params.tid || 'default';
    
    if (tenantId && this.dataSource.isInitialized) {
      const schemaName = `tenant_${tenantId.toString().replace(/-/g, '_')}`;
      try {
        await this.dataSource.query(`SET search_path TO ${schemaName}, public`);
        console.log(`[Tenant] Schema set to: ${schemaName}`);
      } catch (error) {
        console.error(`[Tenant] Failed to set schema ${schemaName}:`, error);
        // Fallback to default schema
        await this.dataSource.query(`SET search_path TO univ_demo, public`);
      }
    }
    
    next();
  }
}
