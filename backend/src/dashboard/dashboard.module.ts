import { Module } from '@nestjs/common';
import { PresidentDashboardController } from './president.controller';
import { PresidentDashboardService } from './president.service';

@Module({
  controllers: [PresidentDashboardController],
  providers: [PresidentDashboardService],
  exports: [PresidentDashboardService],
})
export class DashboardModule {}
