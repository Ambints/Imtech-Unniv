import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from '../tenants/tenant.entity';
import { SubscriptionExpirationService } from './subscription-expiration.service';
import { SubscriptionsController } from './subscriptions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant], 'default'),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionExpirationService],
  exports: [SubscriptionExpirationService],
})
export class SubscriptionsModule {}
