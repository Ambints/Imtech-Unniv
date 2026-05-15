import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntretienController } from './entretien.controller';
import { EntretienService } from './entretien.service';
import { 
  ResponsableLogistique, 
  ServiceEntretien, 
  PlanningNettoyage, 
  StockProduitsMenage,
  MaintenancePreventive,
  RapportEntretien 
} from './entretien.entities';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResponsableLogistique, 
      ServiceEntretien, 
      PlanningNettoyage, 
      StockProduitsMenage,
      MaintenancePreventive,
      RapportEntretien
    ], 'tenant')
  ],
  controllers: [EntretienController],
  providers: [EntretienService],
  exports: [EntretienService],
})
export class EntretienModule {}
