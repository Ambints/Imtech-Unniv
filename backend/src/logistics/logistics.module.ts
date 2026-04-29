import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogisticsController } from './logistics.controller';
import { LogisticsService } from './logistics.service';
import {
  TicketMaintenance, ReservationSalle, Stock, MouvementStock,
  PlanningEntretien, RapportEntretien
} from './logistics.entities';

@Module({
  imports: [TypeOrmModule.forFeature([
    TicketMaintenance, ReservationSalle, Stock, MouvementStock,
    PlanningEntretien, RapportEntretien
  ])],
  controllers: [LogisticsController],
  providers: [LogisticsService],
  exports: [LogisticsService],
})
export class LogisticsModule {}