import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DepensesService } from './depenses.service';

@Controller('economat/depenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepensesController {
  constructor(private readonly depensesService: DepensesService) {}

  @Get()
  @Roles('economat', 'admin', 'president')
  async getAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('statut') statut?: string,
    @Query('categorie') categorie?: string,
    @Query('fournisseur') fournisseur?: string,
    @Query('search') search?: string,
  ) {
    return this.depensesService.getAll({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      statut,
      categorie,
      fournisseur,
      search,
    });
  }

  @Get('stats')
  @Roles('economat', 'admin', 'president')
  async getStats() {
    return this.depensesService.getStats();
  }

  @Get(':id')
  @Roles('economat', 'admin', 'president')
  async getById(@Param('id') id: string) {
    return this.depensesService.getById(id);
  }

  @Post()
  @Roles('economat', 'admin')
  async create(@Body() body: any, @Request() req: any) {
    return this.depensesService.create({
      ...body,
      demande_par: req.user.userId,
    });
  }

  @Patch(':id/approve')
  @Roles('economat', 'admin')
  async approve(
    @Param('id') id: string,
    @Body() body: { statut: 'approuve' | 'rejete'; motif_decision?: string },
    @Request() req: any,
  ) {
    return this.depensesService.approve(id, {
      ...body,
      approuve_par: req.user.userId,
    });
  }

  @Patch(':id/mark-paid')
  @Roles('economat', 'admin')
  async markAsPaid(@Param('id') id: string) {
    return this.depensesService.markAsPaid(id);
  }
}

// Made with Bob
