import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ScolariteService } from './scolarite.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';

@Controller('scolarite')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScolariteController {
  constructor(private readonly scolariteService: ScolariteService) {}

  // ==================== CALCUL DES MOYENNES ====================

  @Post(':tid/calculer-moyennes')
  @Roles(UserRole.SCOLARITE, UserRole.ADMIN, UserRole.RESP_PEDAGOGIQUE)
  async calculerMoyennes(
    @Param('tid') tid: string,
    @Body() dto: { sessionExamenId: string; parcoursId: string; anneeAcademiqueId?: string },
    @Request() req,
  ) {
    return this.scolariteService.calculerMoyennesSession(tid, dto, req.user.userId);
  }

  @Get(':tid/resultats')
  @Roles(UserRole.SCOLARITE, UserRole.ADMIN, UserRole.RESP_PEDAGOGIQUE, UserRole.ETUDIANT)
  async getResultats(
    @Param('tid') tid: string,
    @Query('sessionExamenId') sessionExamenId?: string,
    @Query('parcoursId') parcoursId?: string,
  ) {
    return this.scolariteService.getResultats(tid, sessionExamenId, parcoursId);
  }

  // ==================== VERROUILLAGE DES NOTES ====================

  @Post(':tid/verrouiller')
  @Roles(UserRole.SCOLARITE, UserRole.ADMIN)
  async verrouillerNotes(
    @Param('tid') tid: string,
    @Body() dto: { sessionExamenId: string; parcoursId: string; ueId?: string; dateDeliberation: Date },
    @Request() req,
  ) {
    return this.scolariteService.verrouillerNotes(tid, dto, req.user.userId);
  }

  @Post(':tid/deverrouiller')
  @Roles(UserRole.SCOLARITE, UserRole.ADMIN)
  async deverrouillerNotes(
    @Param('tid') tid: string,
    @Body() dto: { verrouillageId: string; motif: string; jetonAdmin?: string },
    @Request() req,
  ) {
    return this.scolariteService.deverrouillerNotes(tid, dto, req.user.userId);
  }

  @Get(':tid/verrouillage/status')
  @Roles(UserRole.SCOLARITE, UserRole.ADMIN, UserRole.RESP_PEDAGOGIQUE)
  async isNotesVerrouillees(
    @Param('tid') tid: string,
    @Query('sessionExamenId') sessionExamenId: string,
    @Query('parcoursId') parcoursId: string,
  ) {
    const verrouille = await this.scolariteService.isNotesVerrouillees(tid, sessionExamenId, parcoursId);
    return { verrouille };
  }

  // ==================== RELEVÉS DE NOTES ====================

  @Post(':tid/releves/generer')
  @Roles(UserRole.SCOLARITE, UserRole.ADMIN)
  async genererReleve(
    @Param('tid') tid: string,
    @Body() dto: { etudiantId: string; sessionExamenId: string; estSigneNumerique?: boolean },
    @Request() req,
  ) {
    return this.scolariteService.genererReleve(tid, dto, req.user.userId);
  }

  @Post(':tid/releves/:id/valider')
  @Roles(UserRole.SCOLARITE, UserRole.ADMIN)
  async validerReleve(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.scolariteService.validerReleve(tid, id, req.user.userId);
  }

  @Get(':tid/releves')
  @Roles(UserRole.SCOLARITE, UserRole.ADMIN, UserRole.ETUDIANT)
  async getReleves(
    @Param('tid') tid: string,
    @Query('etudiantId') etudiantId?: string,
    @Query('statut') statut?: string,
  ) {
    return this.scolariteService.getReleves(tid, etudiantId, statut);
  }

  // ==================== DIPLÔMES ====================

  @Post(':tid/diplomes/verifier')
  @Roles(UserRole.SCOLARITE, UserRole.ADMIN)
  async verifierConditionsDiplome(
    @Param('tid') tid: string,
    @Body() dto: { etudiantId: string; parcoursId: string },
  ) {
    return this.scolariteService.verifierConditionsDiplome(tid, dto.etudiantId, dto.parcoursId);
  }

  @Post(':tid/diplomes')
  @Roles(UserRole.SCOLARITE, UserRole.ADMIN)
  async creerDiplome(
    @Param('tid') tid: string,
    @Body() dto: { etudiantId: string; parcoursId: string; type: string },
    @Request() req,
  ) {
    return this.scolariteService.creerDiplome(tid, dto.etudiantId, dto.parcoursId, dto.type, req.user.userId);
  }

  // ==================== ÉQUIVALENCES ====================

  @Post(':tid/equivalences')
  @Roles(UserRole.SCOLARITE, UserRole.ADMIN)
  async creerEquivalence(
    @Param('tid') tid: string,
    @Body() dto: any,
    @Request() req,
  ) {
    return this.scolariteService.creerEquivalence(tid, dto, req.user.userId);
  }

  @Post(':tid/equivalences/:id/traiter')
  @Roles(UserRole.SCOLARITE, UserRole.ADMIN)
  async traiterEquivalence(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() dto: { accepte: boolean; creditsAttribues: any[] },
    @Request() req,
  ) {
    return this.scolariteService.traiterEquivalence(tid, id, dto.accepte, dto.creditsAttribues, req.user.userId);
  }

  // ==================== INTEGRATION ASSIDUITE ====================

  @Post(':tid/assiduite/mettre-a-jour')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async mettreAJourAssiduite(
    @Param('tid') tid: string,
    @Body() dto: { etudiantId: string; presenceId: string; estJustifiee: boolean },
  ) {
    return this.scolariteService.mettreAJourAssiduite(tid, dto.etudiantId, dto.presenceId, dto.estJustifiee);
  }

  // ==================== DASHBOARD ====================

  @Get(':tid/dashboard')
  @Roles(UserRole.SCOLARITE, UserRole.ADMIN)
  async getDashboard(@Param('tid') tid: string) {
    return this.scolariteService.getDashboardScolarite(tid);
  }
}

// Made with Bob
