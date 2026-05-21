import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

interface WhitelistRoute {
  path: string;
  method?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  // Routes qui ne nécessitent PAS de tenant ID
  private readonly whitelistRoutes: WhitelistRoute[] = [
    { path: '/api/v1/auth/login', method: 'POST' },
    { path: '/api/v1/auth/register', method: 'POST' },
    { path: '/api/v1/auth/refresh', method: 'POST' },
    { path: '/api/v1/tenants' },                     // Toutes les routes /tenants/* pour SuperAdmin
    { path: '/api/v1/users' },                       // Toutes les routes /users/* pour SuperAdmin
    { path: '/api/v1/health' },                       // Health check
    { path: '/api/v1/docs' },                         // Documentation
  ];

  constructor(
    @InjectConnection('tenant') private readonly tenantConnection: Connection,
    @InjectConnection('default') private readonly defaultConnection: Connection,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const fullPath = (req.originalUrl || req.url).split('?')[0]; // Remove query params
    const method = req.method;

    // Vérifier si la route est dans la whitelist
    const isWhitelisted = this.whitelistRoutes.some(route => {
      const pathMatches = fullPath === route.path || fullPath.startsWith(route.path + '/');
      const methodMatches = !route.method || route.method === method;
      return pathMatches && methodMatches;
    });

    if (isWhitelisted) {
      console.log(`[TenantMiddleware] Whitelisted route: ${method} ${fullPath}`);
      (req as any).tenantSchema = 'public';
      (req as any).tenantId = null;
      (req as any).isSuperAdminRoute = true;
      return next();
    }

    // Extraire tenantId de plusieurs sources (par ordre de priorité)
    let tenantId = req.headers['x-tenant-id'] as string;
    
    if (!tenantId) {
      tenantId = req.headers['X-Tenant-ID'] as string;
    }
    
    if (!tenantId && req.query && req.query.tenantId) {
      tenantId = req.query.tenantId as string;
    }
    
    // Si toujours pas de tenantId, chercher dans l'URL (UUID pattern)
    if (!tenantId) {
      const pathParts = fullPath.split('/');
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const foundId = pathParts.find(part => uuidPattern.test(part));
      if (foundId) {
        tenantId = foundId;
        console.log(`[TenantMiddleware] Extracted tenant ID from URL: ${tenantId}`);
      }
    }

    // Si pas de tenantId trouvé, retourner une erreur 400
    if (!tenantId) {
      console.error(`[TenantMiddleware] Tenant ID required but not provided for: ${method} ${fullPath}`);
      return res.status(400).json({
        statusCode: 400,
        message: 'Tenant ID is required. Please provide X-Tenant-ID header or tenantId query parameter.',
        error: 'Bad Request',
      });
    }

    // Résoudre le schéma du tenant
    if (this.tenantConnection.isConnected) {
      try {
        // Look up tenant schema from public.tenant table
        const tenantResult = await this.defaultConnection.query(
          'SELECT schema_name FROM public.tenant WHERE id = $1 AND actif = true',
          [tenantId]
        );
        
        if (!tenantResult || tenantResult.length === 0) {
          console.error(`[TenantMiddleware] Tenant ${tenantId} not found or inactive`);
          return res.status(404).json({
            statusCode: 404,
            message: `Tenant ${tenantId} not found or inactive`,
            error: 'Not Found',
          });
        }

        const schemaName = tenantResult[0].schema_name;
        console.log(`[TenantMiddleware] Found schema "${schemaName}" for tenant ${tenantId}`);

        // Set schema for this request's connection
        await this.tenantConnection.query(`SET search_path TO "${schemaName}", public`);
        
        (req as any).tenantSchema = schemaName;
        (req as any).tenantId = tenantId;
        (req as any).isSuperAdminRoute = false;
        
        console.log(`[TenantMiddleware] Schema set to: ${schemaName} for tenant: ${tenantId}`);
      } catch (error) {
        console.error(`[TenantMiddleware] Failed to set schema for tenant ${tenantId}:`, error instanceof Error ? error.message : String(error));
        return res.status(500).json({
          statusCode: 500,
          message: 'Failed to resolve tenant schema',
          error: 'Internal Server Error',
        });
      }
    }
    
    next();
  }
}
