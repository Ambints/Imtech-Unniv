import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EconomatController } from './economat.controller';
import { EconomatService } from './economat.service';
import { Budget, Depense } from '../finance/finance.entities';
import { Stock } from '../logistics/logistics.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Budget, Depense, Stock])],
  controllers: [EconomatController],
  providers: [EconomatService],
  exports: [EconomatService],
})
export class EconomatModule {}
