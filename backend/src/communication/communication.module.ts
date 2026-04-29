import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Annonce, Notification, Message } from './communication.entities';

@Module({
  imports: [TypeOrmModule.forFeature([Annonce, Notification, Message])],
  exports: [TypeOrmModule],
})
export class CommunicationModule {}
