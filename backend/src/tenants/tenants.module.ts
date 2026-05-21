import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { TenantCreationService } from './tenant-creation.service';
import { TenantConnectionService } from './tenant-connection.service';
import { Tenant } from './tenant.entity';
import { Plan } from './plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, Plan])],
  controllers: [TenantsController],
  providers: [TenantsService, TenantCreationService, TenantConnectionService],
  exports: [TenantsService, TenantCreationService, TenantConnectionService],
})
export class TenantsModule {}