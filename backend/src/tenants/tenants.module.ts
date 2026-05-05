import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { TenantCreationService } from './tenant-creation.service';
import { TenantConnectionService } from './tenant-connection.service';
import { Tenant } from './tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant])],
  controllers: [TenantsController],
  providers: [TenantsService, TenantCreationService, TenantConnectionService],
  exports: [TenantsService, TenantCreationService, TenantConnectionService],
})
export class TenantsModule {}