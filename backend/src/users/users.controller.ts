import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly svc: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Creer un utilisateur' })
  async create(@Body() dto: any, @Request() req) {
    // Pour super_admin, tenantId peut être fourni dans le DTO
    // Pour admin, utiliser le tenantId de l'utilisateur connecté
    if (req.user?.role === 'admin' && !dto.tenantId) {
      dto.tenantId = req.user.tenantId;
    }
    
    if (!dto.tenantId && req.user?.role !== 'super_admin') {
      throw new BadRequestException('TenantId requis pour créer un utilisateur');
    }
    
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les utilisateurs' })
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'university', required: false })
  findAll(@Query('tenantId') tid?: string, @Query('role') role?: string, @Query('university') university?: string) {
    return this.svc.findAll(tid, role, university);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.svc.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un utilisateur' })
  update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.svc.remove(id); }
}