import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Patch
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NiveauxEtudeService } from './niveaux-etude.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Admin - Niveaux d\'études')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/:tid/niveaux-etude')
export class NiveauxEtudeController {
  constructor(private readonly service: NiveauxEtudeService) {}

  @Get()
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Liste tous les niveaux d\'études' })
  findAll() {
    return this.service.findAll();
  }

  @Get('actifs')
  @Roles('admin', 'president', 'secretaire', 'responsable_pedagogique')
  @ApiOperation({ summary: 'Liste les niveaux actifs' })
  findActifs() {
    return this.service.findActifs();
  }

  @Get(':id')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Détails d\'un niveau' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Créer un nouveau niveau' })
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Modifier un niveau' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Supprimer un niveau' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch(':id/toggle-actif')
  @Roles('admin', 'president')
  @ApiOperation({ summary: 'Activer/Désactiver un niveau' })
  toggleActif(@Param('id') id: string) {
    return this.service.toggleActif(id);
  }
}

// Made with Bob
