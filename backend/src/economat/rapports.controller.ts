import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RapportsService } from './rapports.service';

@Controller('economat/rapports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RapportsController {
  constructor(private readonly rapportsService: RapportsService) {}

  @Get('mensuel')
  @Roles('economat', 'admin', 'president')
  async getRapportMensuel(
    @Query('mois') mois: string,
    @Query('annee') annee: string,
  ) {
    if (!mois || !annee) {
      throw new BadRequestException('Mois et année requis');
    }

    const moisNum = parseInt(mois);
    const anneeNum = parseInt(annee);

    if (moisNum < 1 || moisNum > 12) {
      throw new BadRequestException('Mois invalide (1-12)');
    }

    return this.rapportsService.getRapportMensuel(moisNum, anneeNum);
  }

  @Get('annuel')
  @Roles('economat', 'admin', 'president')
  async getRapportAnnuel(@Query('annee') annee: string) {
    if (!annee) {
      throw new BadRequestException('Année requise');
    }

    const anneeNum = parseInt(annee);
    return this.rapportsService.getRapportAnnuel(anneeNum);
  }
}

// Made with Bob
