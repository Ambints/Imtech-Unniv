import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { SuperAdmin } from './super-admin.entity';
import { Tenant } from '../tenants/tenant.entity';
import { AuthModule } from '../auth/auth.module';
import { EmailModule } from '../email/email.module';
import { ImtechCacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User], 'tenant'),
    TypeOrmModule.forFeature([SuperAdmin, Tenant], 'default'),
    forwardRef(() => AuthModule),
    EmailModule,
    ImtechCacheModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}