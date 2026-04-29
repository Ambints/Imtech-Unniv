import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionExpirationService } from './subscription-expiration.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly subscriptionService: SubscriptionExpirationService,
  ) {}

  @Get('stats')
  async getSubscriptionStats() {
    return this.subscriptionService.getSubscriptionStats();
  }
}
