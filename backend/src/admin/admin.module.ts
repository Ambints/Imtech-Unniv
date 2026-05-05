import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Tenant } from '../tenants/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant], 'default'),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

// Made with Bob
