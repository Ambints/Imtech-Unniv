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
import { EncadrementService } from './encadrement.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../common/enums/roles.enum';
import {
  CreateSuiviMoralDto,
  UpdateSuiviMoralDto,
  CreateAutorisationSortieDto,
  ValiderAutorisationDto,
  CalculerAssiduitDto,
} from './surveillance.dto';

@Controller('encadrement')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EncadrementController {
  constructor(private readonly encadrementService: EncadrementService) {}

  // ==================== SUIVI MORAL ====================

  @Post(':tid/suivi-moral')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async creerSuiviMoral(
    @Param('tid') tid: string,
    @Body() dto: CreateSuiviMoralDto,
    @Request() req,
  ) {
    return this.encadrementService.creerSuiviMoral(tid, dto, req.user.userId);
  }

  @Put(':tid/suivi-moral/:id')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async updateSuiviMoral(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() dto: UpdateSuiviMoralDto,
  ) {
    return this.encadrementService.updateSuiviMoral(tid, id, dto);
  }

  @Get(':tid/suivi-moral/etudiant/:etudiantId')
  @Roles(
    UserRole.SURVEILLANT_GENERAL,
    UserRole.ADMIN,
    UserRole.SCOLARITE,
    UserRole.RESP_PEDAGOGIQUE,
  )
  async getSuivisMoraux(
    @Param('tid') tid: string,
    @Param('etudiantId') etudiantId: string,
  ) {
    return this.encadrementService.getSuivisMoraux(tid, etudiantId);
  }

  @Put(':tid/suivi-moral/:id/cloturer')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async cloturerSuiviMoral(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body('observations') observations: string,
  ) {
    return this.encadrementService.cloturerSuiviMoral(tid, id, observations);
  }

  // ==================== AUTORISATIONS DE SORTIE ====================

  @Post(':tid/autorisations-sortie')
  @Roles(
    UserRole.SURVEILLANT_GENERAL,
    UserRole.ADMIN,
    UserRole.ETUDIANT,
    UserRole.PARENT,
  )
  async creerAutorisationSortie(
    @Param('tid') tid: string,
    @Body() dto: CreateAutorisationSortieDto,
    @Request() req,
  ) {
    return this.encadrementService.creerAutorisationSortie(
      tid,
      dto,
      req.user.userId,
    );
  }

  @Put(':tid/autorisations-sortie/:id/valider')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async validerAutorisationSortie(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() dto: ValiderAutorisationDto,
    @Request() req,
  ) {
    return this.encadrementService.validerAutorisationSortie(
      tid,
      id,
      dto,
      req.user.userId,
    );
  }

  @Put(':tid/autorisations-sortie/:id/sortie')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async enregistrerSortie(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body('heureSortie') heureSortie: string,
  ) {
    return this.encadrementService.enregistrerSortie(tid, id, heureSortie);
  }

  @Put(':tid/autorisations-sortie/:id/retour')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async enregistrerRetour(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body('heureRetour') heureRetour: string,
  ) {
    return this.encadrementService.enregistrerRetour(tid, id, heureRetour);
  }

  @Get(':tid/autorisations-sortie/en-attente')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async getAutorisationsEnAttente(@Param('tid') tid: string) {
    return this.encadrementService.getAutorisationsEnAttente(tid);
  }

  @Get(':tid/autorisations-sortie/etudiant/:etudiantId')
  @Roles(
    UserRole.SURVEILLANT_GENERAL,
    UserRole.ADMIN,
    UserRole.ETUDIANT,
    UserRole.PARENT,
  )
  async getAutorisationsEtudiant(
    @Param('tid') tid: string,
    @Param('etudiantId') etudiantId: string,
  ) {
    return this.encadrementService.getAutorisationsEtudiant(tid, etudiantId);
  }

  // ==================== ASSIDUITÉ ====================

  @Post(':tid/assiduite/calculer')
  @Roles(
    UserRole.SURVEILLANT_GENERAL,
    UserRole.ADMIN,
    UserRole.SCOLARITE,
    UserRole.RESP_PEDAGOGIQUE,
  )
  async calculerAssiduite(
    @Param('tid') tid: string,
    @Body() dto: CalculerAssiduitDto,
  ) {
    return this.encadrementService.calculerAssiduite(tid, dto);
  }

  // ==================== RAPPORT DE CONDUITE ====================

  @Post(':tid/rapport-conduite/generer')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN)
  async genererRapportConduite(
    @Param('tid') tid: string,
    @Body()
    dto: {
      etudiantId: string;
      periodeDebut: Date;
      periodeFin: Date;
    },
    @Request() req,
  ) {
    return this.encadrementService.genererRapportConduite(
      tid,
      dto.etudiantId,
      dto.periodeDebut,
      dto.periodeFin,
      req.user.userId,
    );
  }

  @Put(':tid/rapport-conduite/:id/valider')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN, UserRole.SCOLARITE)
  async validerRapportConduite(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.encadrementService.validerRapportConduite(
      tid,
      id,
      req.user.userId,
    );
  }

  @Put(':tid/rapport-conduite/:id/transmettre')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN, UserRole.SCOLARITE)
  async transmettreRapportParents(
    @Param('tid') tid: string,
    @Param('id') id: string,
  ) {
    return this.encadrementService.transmettreRapportParents(tid, id);
  }

  // ==================== CONSEIL DE DISCIPLINE ====================

  @Post(':tid/conseil-discipline/convoquer')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN, UserRole.PRESIDENT)
  async convoquerConseilDiscipline(
    @Param('tid') tid: string,
    @Body()
    dto: {
      etudiantId: string;
      dateConseil: Date;
      motif: string;
      incidentsLies: string[];
    },
  ) {
    return this.encadrementService.convoquerConseilDiscipline(
      tid,
      dto.etudiantId,
      dto.dateConseil,
      dto.motif,
      dto.incidentsLies,
    );
  }

  @Put(':tid/conseil-discipline/:id/decision')
  @Roles(UserRole.SURVEILLANT_GENERAL, UserRole.ADMIN, UserRole.PRESIDENT)
  async enregistrerDecisionConseil(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body()
    dto: {
      decision: string;
      deliberation: string;
      justification: string;
      membresPresents: any[];
    },
  ) {
    return this.encadrementService.enregistrerDecisionConseil(
      tid,
      id,
      dto.decision,
      dto.deliberation,
      dto.justification,
      dto.membresPresents,
    );
  }
}

// Made with Bob