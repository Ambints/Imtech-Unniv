import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
export declare class TenantMiddleware implements NestMiddleware {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}
