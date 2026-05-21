import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationPaiementController } from './configuration-paiement.controller';
import { ConfigurationPaiementService } from './configuration-paiement.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([], 'tenant'),
  ],
  controllers: [ConfigurationPaiementController],
  providers: [ConfigurationPaiementService],
  exports: [ConfigurationPaiementService],
})
export class ConfigurationModule {}

// Made with Bob
