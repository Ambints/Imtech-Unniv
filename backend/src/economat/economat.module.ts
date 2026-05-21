import { Module } from '@nestjs/common';
import { EconomatController } from './economat.controller';
import { EconomatService } from './economat.service';
import { DepensesController } from './depenses.controller';
import { DepensesService } from './depenses.service';
import { RapportsController } from './rapports.controller';
import { RapportsService } from './rapports.service';
import { TenantConnectionService } from '../tenants/tenant-connection.service';

@Module({
  controllers: [EconomatController, DepensesController, RapportsController],
  providers: [EconomatService, DepensesService, RapportsService, TenantConnectionService],
  exports: [EconomatService, DepensesService, RapportsService],
})
export class EconomatModule {}

// Made with Bob
