import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { SuperAdmin } from './super-admin.entity';
import { Tenant } from '../tenants/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User], 'tenant'),
    TypeOrmModule.forFeature([SuperAdmin, Tenant], 'default'),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}