import { SubscriptionExpirationService } from './subscription-expiration.service';
export declare class SubscriptionsController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionExpirationService);
    getSubscriptionStats(): Promise<{
        active: number;
        expired: number;
        suspended: number;
        expiringSoon: number;
    }>;
}
