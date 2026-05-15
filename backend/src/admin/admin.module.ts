import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { NiveauxEtudeController } from './niveaux-etude.controller';
import { NiveauxEtudeService } from './niveaux-etude.service';
import { Tenant } from '../tenants/tenant.entity';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant], 'default'),
    TenantsModule,
  ],
  controllers: [AdminController, NiveauxEtudeController],
  providers: [AdminService, NiveauxEtudeService],
  exports: [AdminService, NiveauxEtudeService],
})
export class AdminModule {}

// Made with Bob
