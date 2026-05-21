import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseBoolPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SecretaireService } from './secretaire.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  GetDashboardDto,
  GetEmploiDuTempsDto,
  GetSallesDisponiblesDto,
  GetInscriptionsDto,
  GetAbsencesAJustifierDto,
  GetPVsATransmettreDto,
  GetPVsTransmisDto,
} from './secretaire.dto';

@Controller('secretaire')
@UseGuards(JwtAuthGuard)
export class SecretaireController {
  constructor(private readonly secretaireService: SecretaireService) {}

  // ==================== DASHBOARD ====================

  @Get(':tid/dashboard')
  async getDashboard(
    @Param('tid') tid: string,
    @Query('parcoursId') parcoursId: string,
    @Request() req,
  ) {
    return this.secretaireService.getDashboardData(tid, parcoursId, req.user.userId, req.user.role);
  }

  // ==================== EMPLOI DU TEMPS ====================

  @Get(':tid/emploi-du-temps')
  async getEmploiDuTemps(
    @Param('tid') tid: string,
    @Query('parcoursId') parcoursId: string,
    @Query('dateDebut') dateDebut: string,
    @Query('dateFin') dateFin: string,
    @Request() req,
  ) {
    return this.secretaireService.getEmploiDuTemps(
      tid,
      parcoursId,
      new Date(dateDebut),
      new Date(dateFin),
      req.user.userId,
      req.user.role,
    );
  }

  @Post(':tid/emploi-du-temps')
  async creerSeance(
    @Param('tid') tid: string,
    @Body() dto: any,
    @Request() req,
    @Query('ignorerConflits', ParseBoolPipe) ignorerConflits?: boolean,
  ) {
    return this.secretaireService.creerSeance(
      tid,
      dto,
      req.user.userId,
      ignorerConflits,
    );
  }

  @Put(':tid/emploi-du-temps/:id')
  async updateSeance(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() dto: any,
    @Request() req,
    @Query('ignorerConflits', ParseBoolPipe) ignorerConflits?: boolean,
  ) {
    return this.secretaireService.updateSeance(
      tid,
      id,
      dto,
      req.user.userId,
      req.user.role,
      ignorerConflits,
    );
  }

  @Delete(':tid/emploi-du-temps/:id')
  async annulerSeance(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body('motif') motif: string,
    @Request() req,
  ) {
    return this.secretaireService.annulerSeance(tid, id, motif, req.user.userId, req.user.role);
  }

  @Post(':tid/emploi-du-temps/verifier-conflits')
  async verifierConflits(
    @Param('tid') tid: string,
    @Body() dto: any,
    @Query('seanceId') seanceId?: string,
  ) {
    return this.secretaireService.verifierConflits(tid, dto, seanceId);
  }

  @Get(':tid/salles-disponibles')
  async getSallesDisponibles(
    @Param('tid') tid: string,
    @Query('dateSeance') dateSeance: string,
    @Query('heureDebut') heureDebut: string,
    @Query('heureFin') heureFin: string,
    @Query('capaciteMinimale') capaciteMinimale?: string,
  ) {
    return this.secretaireService.getSallesDisponibles(
      tid,
      new Date(dateSeance),
      heureDebut,
      heureFin,
      capaciteMinimale ? parseInt(capaciteMinimale, 10) : undefined,
    );
  }

  // ==================== INSCRIPTIONS ====================

  @Post(':tid/inscriptions')
  async inscrireEtudiant(
    @Param('tid') tid: string,
    @Body() dto: any,
    @Request() req,
  ) {
    return this.secretaireService.inscrireEtudiant(tid, dto, req.user.userId);
  }

  @Post(':tid/inscriptions/:id/reinscrire')
  async reinscrireEtudiant(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body('anneeAcademiqueId') anneeAcademiqueId: string,
    @Request() req,
  ) {
    return this.secretaireService.reinscrireEtudiant(tid, id, anneeAcademiqueId, req.user.userId);
  }

  @Get(':tid/inscriptions')
  async getInscriptions(
    @Param('tid') tid: string,
    @Query('parcoursId') parcoursId: string,
    @Request() req,
    @Query('anneeAcademiqueId') anneeAcademiqueId?: string,
  ) {
    return this.secretaireService.getInscriptions(tid, parcoursId, anneeAcademiqueId, req.user.userId, req.user.role);
  }

  // ==================== ABSENCES ENSEIGNANTS ====================

  @Post(':tid/absences-enseignants')
  async declarerAbsence(
    @Param('tid') tid: string,
    @Body() dto: any,
    @Request() req,
  ) {
    return this.secretaireService.declarerAbsence(tid, dto, req.user.userId);
  }

  @Put(':tid/absences-enseignants/:id/valider')
  async validerAbsence(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body('validee') validee: boolean,
    @Request() req,
  ) {
    return this.secretaireService.validerAbsence(tid, id, validee, req.user.userId);
  }

  @Get(':tid/absences-enseignants')
  async getAbsences(
    @Param('tid') tid: string,
    @Request() req,
    @Query('enseignantId') enseignantId?: string,
    @Query('statut') statut?: string,
  ) {
    return this.secretaireService.getAbsences(tid, enseignantId, statut, req.user.userId, req.user.role);
  }

  // ==================== RATTRAPAGES ====================

  @Post(':tid/rattrapages')
  async planifierRattrapage(
    @Param('tid') tid: string,
    @Body() dto: any,
    @Request() req,
  ) {
    return this.secretaireService.planifierRattrapage(tid, dto, req.user.userId);
  }

  @Get(':tid/rattrapages')
  async getRattrapages(
    @Param('tid') tid: string,
    @Query('absenceId') absenceId?: string,
  ) {
    return this.secretaireService.getRattrapages(tid, absenceId);
  }

  // ==================== PRÉSENCES ÉTUDIANTS ====================

  @Post(':tid/presences')
  async saisirPresence(
    @Param('tid') tid: string,
    @Body() dto: { etudiantId: string; seanceId: string; statut: string; justificatifUrl?: string },
    @Request() req,
  ) {
    return this.secretaireService.saisirPresence(
      tid,
      dto.etudiantId,
      dto.seanceId,
      dto.statut,
      req.user.userId,
      dto.justificatifUrl,
    );
  }

  @Put(':tid/presences/:id/justifier')
  async justifierAbsence(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() dto: { justificatifUrl: string; motif: string },
    @Request() req,
  ) {
    return this.secretaireService.justifierAbsence(
      tid,
      id,
      dto.justificatifUrl,
      dto.motif,
      req.user.userId,
    );
  }

  @Get(':tid/absences-a-justifier')
  async getAbsencesAJustifier(
    @Param('tid') tid: string,
    @Query('parcoursId') parcoursId: string,
  ) {
    return this.secretaireService.getAbsencesAJustifier(tid, parcoursId);
  }

  // ==================== NOTES DÉROGATOIRES ====================

  @Post(':tid/notes-derogatoires')
  async saisirNoteDerogatoire(
    @Param('tid') tid: string,
    @Body() dto: any,
    @Request() req,
  ) {
    return this.secretaireService.saisirNoteDerogatoire(tid, dto, req.user.userId);
  }

  @Post(':tid/notes-derogatoires/soumettre')
  async soumettreNotesScolarite(
    @Param('tid') tid: string,
    @Body('noteIds') noteIds: string[],
    @Request() req,
  ) {
    return this.secretaireService.soumettreNotesScolarite(tid, noteIds, req.user.userId);
  }

  @Get(':tid/notes-derogatoires')
  async getNotesDerogatoires(
    @Param('tid') tid: string,
    @Request() req,
    @Query('statut') statut?: string,
    @Query('soumisAScolarite') soumisAScolarite?: string,
  ) {
    return this.secretaireService.getNotesDerogatoires(
      tid,
      statut,
      soumisAScolarite !== undefined ? soumisAScolarite === 'true' : undefined,
      req.user.userId,
      req.user.role,
    );
  }

  // ==================== CONVOCATIONS ====================

  @Post(':tid/convocations/generer-examen')
  async genererConvocationsExamen(
    @Param('tid') tid: string,
    @Body('sessionExamenId') sessionExamenId: string,
    @Request() req,
  ) {
    return this.secretaireService.genererConvocationsExamen(tid, sessionExamenId, req.user.userId);
  }

  @Post(':tid/convocations')
  async creerConvocation(
    @Param('tid') tid: string,
    @Body() dto: any,
    @Request() req,
  ) {
    return this.secretaireService.creerConvocation(tid, dto, req.user.userId);
  }

  @Post(':tid/convocations/envoyer')
  async envoyerConvocations(
    @Param('tid') tid: string,
    @Body('convocationIds') convocationIds: string[],
    @Request() req,
  ) {
    return this.secretaireService.envoyerConvocations(tid, convocationIds, req.user.userId);
  }

  @Get(':tid/convocations')
  async getConvocations(
    @Param('tid') tid: string,
    @Query('etudiantId') etudiantId?: string,
    @Query('statut') statut?: string,
  ) {
    return this.secretaireService.getConvocations(tid, etudiantId, statut);
  }

  // ==================== DOSSIERS ÉTUDIANTS ====================

  @Post(':tid/dossiers')
  async creerDossier(
    @Param('tid') tid: string,
    @Body() dto: { etudiantId: string; typeDocument: string; libelle: string; fichierUrl: string },
    @Request() req,
  ) {
    return this.secretaireService.creerDossier(
      tid,
      dto.etudiantId,
      dto.typeDocument,
      dto.libelle,
      dto.fichierUrl,
      req.user.userId,
    );
  }

  @Put(':tid/dossiers/:id/archiver')
  async archiverDossier(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.secretaireService.archiverDossier(tid, id, req.user.userId);
  }

  @Get(':tid/dossiers')
  async getDossiers(
    @Param('tid') tid: string,
    @Query('etudiantId') etudiantId?: string,
    @Query('estArchive') estArchive?: string,
  ) {
    return this.secretaireService.getDossiers(
      tid,
      etudiantId,
      estArchive !== undefined ? estArchive === 'true' : undefined,
    );
  }

  // ==================== DEMANDES ÉTUDIANTS ====================

  @Post(':tid/demandes')
  async soumettreDemande(
    @Param('tid') tid: string,
    @Body() dto: { etudiantId: string; typeDemande: string; description: string; pieceJointeUrl?: string },
    @Request() req,
  ) {
    return this.secretaireService.soumettreDemande(
      tid,
      dto.etudiantId,
      dto.typeDemande,
      dto.description,
      req.user.userId,
      dto.pieceJointeUrl,
    );
  }

  @Put(':tid/demandes/:id/traiter')
  async traiterDemande(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() dto: { acceptee: boolean; reponse: string },
    @Request() req,
  ) {
    return this.secretaireService.traiterDemande(
      tid,
      id,
      dto.acceptee,
      dto.reponse,
      req.user.userId,
    );
  }

  @Get(':tid/demandes')
  async getDemandes(
    @Param('tid') tid: string,
    @Request() req,
    @Query('statut') statut?: string,
  ) {
    return this.secretaireService.getDemandes(tid, statut, req.user.userId, req.user.role);
  }

  // ==================== GESTION DES PV DE JURY ====================

  @Get(':tid/pvs')
  async getPVs(
    @Param('tid') tid: string,
    @Request() req,
    @Query('parcoursId') parcoursId?: string,
    @Query('anneeAcademiqueId') anneeAcademiqueId?: string,
    @Query('statut') statut?: string,
  ) {
    return this.secretaireService.getPVs(tid, parcoursId, anneeAcademiqueId, statut, req.user.userId, req.user.role);
  }

  @Get(':tid/pvs/:id')
  async getPVById(
    @Param('tid') tid: string,
    @Param('id') id: string,
  ) {
    return this.secretaireService.getPVById(tid, id);
  }

  @Post(':tid/pvs')
  async createPV(
    @Param('tid') tid: string,
    @Body() createPvDto: any,
    @Request() req,
  ) {
    return this.secretaireService.createPV(tid, createPvDto, req.user.userId);
  }

  @Put(':tid/pvs/:id')
  async updatePV(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Body() updatePvDto: any,
    @Request() req,
  ) {
    return this.secretaireService.updatePV(tid, id, updatePvDto, req.user.userId);
  }

  @Post(':tid/pvs/:id/valider')
  async validerPV(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.secretaireService.validerPV(tid, id, req.user.userId);
  }

  @Delete(':tid/pvs/:id')
  async deletePV(
    @Param('tid') tid: string,
    @Param('id') id: string,
  ) {
    return this.secretaireService.deletePV(tid, id);
  }

  // ==================== TRANSMISSION PV À LA SCOLARITÉ CENTRALE ====================

  @Get(':tid/pvs-a-transmettre')
  async getPVsATransmettre(
    @Param('tid') tid: string,
    @Request() req,
    @Query('parcoursId') parcoursId: string,
    @Query('anneeAcademiqueId') anneeAcademiqueId?: string,
  ) {
    return this.secretaireService.getPVsATransmettre(tid, parcoursId, anneeAcademiqueId, req.user.userId, req.user.role);
  }

  @Post(':tid/pvs/:id/transmettre')
  async transmettrePV(
    @Param('tid') tid: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.secretaireService.transmettrePVAScolarite(tid, id, req.user.userId);
  }

  @Post(':tid/pvs/transmettre-batch')
  async transmettrePVsBatch(
    @Param('tid') tid: string,
    @Body('pvIds') pvIds: string[],
    @Request() req,
  ) {
    return this.secretaireService.transmettrePVsBatch(tid, pvIds, req.user.userId);
  }

  @Get(':tid/pvs-transmis')
  async getPVsTransmis(
    @Param('tid') tid: string,
    @Request() req,
    @Query('parcoursId') parcoursId?: string,
    @Query('anneeAcademiqueId') anneeAcademiqueId?: string,
  ) {
    return this.secretaireService.getPVsTransmis(tid, parcoursId, anneeAcademiqueId, req.user.userId, req.user.role);
  }

  // ==================== GESTION SECRÉTAIRE PAR PARCOURS ====================

  /**
   * Assigne un secrétaire à un parcours (Admin uniquement)
   */
  @Post(':tid/parcours/:parcoursId/assigner-secretaire')
  @UseGuards(RolesGuard)
  @Roles('admin', 'resp_pedagogique')
  async assignSecretaireToParcours(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
    @Body('secretaireId') secretaireId: string,
    @Request() req,
  ) {
    return this.secretaireService.assignSecretaireToParcours(
      tid,
      parcoursId,
      secretaireId,
      req.user.userId,
      req.user.role
    );
  }

  /**
   * Retire un secrétaire d'un parcours (Admin uniquement)
   */
  @Delete(':tid/parcours/:parcoursId/retirer-secretaire')
  @UseGuards(RolesGuard)
  @Roles('admin', 'resp_pedagogique')
  async removeSecretaireFromParcours(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
    @Body('secretaireId') secretaireId: string,
    @Request() req,
  ) {
    return this.secretaireService.removeSecretaireFromParcours(
      tid,
      parcoursId,
      secretaireId,
      req.user.userId,
      req.user.role
    );
  }

  /**
   * Récupère les parcours assignés au secrétaire connecté
   */
  @Get(':tid/mes-parcours')
  async getMyParcours(
    @Param('tid') tid: string,
    @Request() req,
  ) {
    return this.secretaireService.getParcoursBySecretaire(tid, req.user.userId);
  }

  /**
   * Récupère les parcours assignés à un secrétaire spécifique (Admin uniquement)
   */
  @Get(':tid/secretaires/:secretaireId/parcours')
  @UseGuards(RolesGuard)
  @Roles('admin', 'resp_pedagogique')
  async getParcoursBySecretaire(
    @Param('tid') tid: string,
    @Param('secretaireId') secretaireId: string,
  ) {
    return this.secretaireService.getParcoursBySecretaire(tid, secretaireId);
  }

  /**
   * Récupère le secrétaire assigné à un parcours
   */
  @Get(':tid/parcours/:parcoursId/secretaire')
  async getSecretaireByParcours(
    @Param('tid') tid: string,
    @Param('parcoursId') parcoursId: string,
  ) {
    return this.secretaireService.getSecretaireByParcours(tid, parcoursId);
  }

  /**
   * Récupère tous les parcours avec leurs secrétaires assignés (Admin uniquement)
   */
  @Get(':tid/parcours-secretaires')
  @UseGuards(RolesGuard)
  @Roles('admin', 'resp_pedagogique')
  async getAllParcoursWithSecretaires(
    @Param('tid') tid: string,
  ) {
    return this.secretaireService.getAllParcoursWithSecretaires(tid);
  }
}

// Made with Bob
