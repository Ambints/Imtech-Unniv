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
    console.log('[UsersController] Create user request:', {
      requestingUserRole: req.user?.role,
      requestingUserTenantId: req.user?.tenantId,
      dtoTenantId: dto.tenantId,
      dtoRole: dto.role
    });
    
    // Cas 1: Création d'un super_admin
    if (dto.role === 'super_admin') {
      if (req.user?.role !== 'super_admin') {
        throw new BadRequestException('Seul un super_admin peut créer un autre super_admin');
      }
      console.log('[UsersController] Creating super_admin');
      return this.svc.create(dto);
    }
    
    // Cas 2: Admin créant un utilisateur dans son université
    if (req.user?.role === 'admin') {
      if (!req.user.tenantId) {
        throw new BadRequestException('Votre compte n\'est pas associé à une université. Contactez le super admin.');
      }
      dto.tenantId = req.user.tenantId;
      console.log('[UsersController] Admin creating user in tenant:', dto.tenantId);
    }
    
    // Cas 3: Super admin créant un utilisateur pour une université
    if (req.user?.role === 'super_admin' && !dto.tenantId) {
      throw new BadRequestException('TenantId requis pour créer un utilisateur d\'université');
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