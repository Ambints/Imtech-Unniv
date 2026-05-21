import { Module } from '@nestjs/common';
import { RHController } from './rh.controller';
import { RHService } from './rh.service';

@Module({
  imports: [],
  controllers: [RHController],
  providers: [RHService],
  exports: [RHService],
})
export class RHModule {}
