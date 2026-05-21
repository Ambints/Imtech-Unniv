import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Injectable()
export class TenantSchemaInterceptor implements NestInterceptor {
  constructor(
    @InjectConnection('tenant') private readonly tenantConnection: Connection,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const tenantSchema = (request as any).tenantSchema;

    if (tenantSchema && this.tenantConnection.isConnected) {
      try {
        // Set schema for this request's database operations
        await this.tenantConnection.query(
          `SET search_path TO "${tenantSchema}", public`,
        );
      } catch (error) {
        console.error(
          `[TenantSchemaInterceptor] Failed to set schema ${tenantSchema}:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    return next.handle();
  }
}

// Made with Bob
