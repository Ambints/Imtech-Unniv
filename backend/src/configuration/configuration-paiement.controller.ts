import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
  Patch
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ConfigurationPaiementService } from './configuration-paiement.service';

@ApiTags('Configuration - Moyens de Paiement')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('configuration/:tenantId/paiement')
export class ConfigurationPaiementController {
  constructor(private readonly configPaiementService: ConfigurationPaiementService) {}

  @Get()
  @Roles('admin', 'responsable_finance', 'finance', 'caissier')
  @ApiOperation({ summary: 'Liste toutes les configurations de paiement' })
  @ApiResponse({ status: 200, description: 'Liste des configurations récupérée avec succès' })
  async findAll(
    @Param('tenantId') tenantId: string,
    @Query('typePaiement') typePaiement?: string,
    @Query('actif') actif?: string
  ) {
    const filters: any = {};
    if (typePaiement) filters.typePaiement = typePaiement;
    if (actif !== undefined) filters.actif = actif === 'true';
    
    return this.configPaiementService.findAll(filters);
  }

  @Get('actifs')
  @ApiOperation({ summary: 'Liste des moyens de paiement actifs (public pour étudiants)' })
  @ApiResponse({ status: 200, description: 'Liste des moyens de paiement actifs' })
  async findActifs(@Param('tenantId') tenantId: string) {
    return this.configPaiementService.findActifs();
  }

  @Get(':id')
  @Roles('admin', 'responsable_finance', 'finance', 'caissier')
  @ApiOperation({ summary: 'Récupérer une configuration de paiement par ID' })
  @ApiResponse({ status: 200, description: 'Configuration récupérée avec succès' })
  @ApiResponse({ status: 404, description: 'Configuration non trouvée' })
  async findOne(
    @Param('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.configPaiementService.findOne(id);
  }

  @Post()
  @Roles('admin', 'responsable_finance')
  @ApiOperation({ summary: 'Créer une nouvelle configuration de paiement' })
  @ApiResponse({ status: 201, description: 'Configuration créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(
    @Param('tenantId') tenantId: string,
    @Body() createDto: {
      typePaiement: 'bank' | 'mobile_money' | 'cash';
      nomAffichage?: string;
      libelle?: string; // Support ancien format
      estActif?: boolean;
      actif?: boolean; // Support ancien format
      ordreAffichage?: number;
      nomBanque?: string;
      numeroCompte?: string;
      nomTitulaire?: string;
      titulaireCompte?: string; // Support ancien format
      nomService?: string;
      operateur?: string; // Support ancien format
      numeroTelephone?: string;
      instructionsSupplementaires?: string;
      instructions?: string; // Support ancien format
      nomBeneficiaire?: string; // Support ancien format
    },
    @Req() req: any
  ) {
    // Mapper les anciens noms vers les nouveaux
    const mappedDto = {
      tenantId,
      typePaiement: createDto.typePaiement,
      nomAffichage: createDto.nomAffichage || createDto.libelle,
      estActif: createDto.estActif !== undefined ? createDto.estActif : createDto.actif,
      ordreAffichage: createDto.ordreAffichage,
      nomBanque: createDto.nomBanque,
      numeroCompte: createDto.numeroCompte,
      nomTitulaire: createDto.nomTitulaire || createDto.titulaireCompte || createDto.nomBeneficiaire,
      nomService: createDto.nomService || createDto.operateur,
      numeroTelephone: createDto.numeroTelephone,
      instructionsSupplementaires: createDto.instructionsSupplementaires || createDto.instructions,
    };
    
    return this.configPaiementService.create(mappedDto, req.user?.userId);
  }

  @Put(':id')
  @Roles('admin', 'responsable_finance')
  @ApiOperation({ summary: 'Mettre à jour une configuration de paiement' })
  @ApiResponse({ status: 200, description: 'Configuration mise à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Configuration non trouvée' })
  async update(
    @Param('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: {
      typePaiement?: 'bank' | 'mobile_money' | 'cash';
      nomAffichage?: string;
      libelle?: string; // Support ancien format
      estActif?: boolean;
      actif?: boolean; // Support ancien format
      ordreAffichage?: number;
      nomBanque?: string;
      numeroCompte?: string;
      nomTitulaire?: string;
      titulaireCompte?: string; // Support ancien format
      nomService?: string;
      operateur?: string; // Support ancien format
      numeroTelephone?: string;
      instructionsSupplementaires?: string;
      instructions?: string; // Support ancien format
      nomBeneficiaire?: string; // Support ancien format
    },
    @Req() req: any
  ) {
    // Mapper les anciens noms vers les nouveaux
    const mappedDto = {
      typePaiement: updateDto.typePaiement,
      nomAffichage: updateDto.nomAffichage || updateDto.libelle,
      estActif: updateDto.estActif !== undefined ? updateDto.estActif : updateDto.actif,
      ordreAffichage: updateDto.ordreAffichage,
      nomBanque: updateDto.nomBanque,
      numeroCompte: updateDto.numeroCompte,
      nomTitulaire: updateDto.nomTitulaire || updateDto.titulaireCompte || updateDto.nomBeneficiaire,
      nomService: updateDto.nomService || updateDto.operateur,
      numeroTelephone: updateDto.numeroTelephone,
      instructionsSupplementaires: updateDto.instructionsSupplementaires || updateDto.instructions,
    };
    
    return this.configPaiementService.update(id, mappedDto, req.user?.userId);
  }

  @Delete(':id')
  @Roles('admin', 'responsable_finance')
  @ApiOperation({ summary: 'Supprimer une configuration de paiement' })
  @ApiResponse({ status: 200, description: 'Configuration supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Configuration non trouvée' })
  async delete(
    @Param('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    await this.configPaiementService.delete(id);
    return { message: 'Configuration de paiement supprimée avec succès' };
  }

  @Patch(':id/toggle')
  @Roles('admin', 'responsable_finance')
  @ApiOperation({ summary: 'Activer/Désactiver une configuration de paiement' })
  @ApiResponse({ status: 200, description: 'Statut modifié avec succès' })
  @ApiResponse({ status: 404, description: 'Configuration non trouvée' })
  async toggleActif(
    @Param('tenantId') tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { actif: boolean },
    @Req() req: any
  ) {
    return this.configPaiementService.toggleActif(id, body.actif, req.user?.userId);
  }
}

// Made with Bob
