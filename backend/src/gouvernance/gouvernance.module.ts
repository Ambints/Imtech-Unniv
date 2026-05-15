import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GouvernanceController } from './gouvernance.controller';
import { GouvernanceService } from './gouvernance.service';
import { 
  President, 
  DecisionPresidentielle, 
  ValidationRecrutement, 
  Arbitrage,
  ConseilUniversitaire 
} from './gouvernance.entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      President, 
      DecisionPresidentielle, 
      ValidationRecrutement, 
      Arbitrage,
      ConseilUniversitaire
    ], 'tenant')
  ],
  controllers: [GouvernanceController],
  providers: [GouvernanceService],
  exports: [GouvernanceService],
})
export class GouvernanceModule {}
