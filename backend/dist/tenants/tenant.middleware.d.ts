import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Connection } from 'typeorm';
export declare class TenantMiddleware implements NestMiddleware {
    private readonly tenantConnection;
    private readonly defaultConnection;
    private readonly whitelistRoutes;
    constructor(tenantConnection: Connection, defaultConnection: Connection);
    use(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
}
