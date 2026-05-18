import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MessagerieService } from './messagerie.service';

@Controller('messagerie/enseignant')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('enseignant')
export class MessagerieController {
  constructor(private readonly messagerieService: MessagerieService) {}

  @Get('tous-etudiants')
  async getTousEtudiants() {
    return this.messagerieService.getTousEtudiants();
  }

  @Get('mes-classes')
  async getMesClasses(@Request() req) {
    const enseignantId = req.user.userId;
    return this.messagerieService.getMesClasses(enseignantId);
  }

  @Get('parcours-disponibles')
  async getParcoursDisponibles() {
    return this.messagerieService.getParcoursDisponibles();
  }

  @Get('niveaux-disponibles')
  async getNiveauxDisponibles() {
    return this.messagerieService.getNiveauxDisponibles();
  }

  @Get('stats-filtres')
  async getStatsFiltres(
    @Query('parcours_id') parcoursId?: string,
    @Query('niveau_id') niveauId?: string
  ) {
    return this.messagerieService.getStatsFiltres(parcoursId, niveauId);
  }

  @Post('envoyer-message-direct')
  async envoyerMessageDirect(@Request() req, @Body() body: {
    etudiant_id: string;
    sujet: string;
    message: string;
  }) {
    const enseignantId = req.user.userId;
    return this.messagerieService.envoyerMessageDirect(
      enseignantId,
      body.etudiant_id,
      body.sujet,
      body.message
    );
  }

  @Post('envoyer-message-classe')
  async envoyerMessageClasse(@Request() req, @Body() body: {
    classe_id: string;
    sujet: string;
    message: string;
  }) {
    const enseignantId = req.user.userId;
    return this.messagerieService.envoyerMessageClasse(
      enseignantId,
      body.classe_id,
      body.sujet,
      body.message
    );
  }

  @Post('envoyer-message-parcours')
  async envoyerMessageParcours(@Request() req, @Body() body: {
    parcours_id: string | null;
    niveau_id: string | null;
    sujet: string;
    message: string;
  }) {
    const enseignantId = req.user.userId;
    return this.messagerieService.envoyerMessageParcours(
      enseignantId,
      body.parcours_id,
      body.niveau_id,
      body.sujet,
      body.message
    );
  }

  @Get('historique-messages')
  async getHistoriqueMessages(@Request() req) {
    const enseignantId = req.user.userId;
    return this.messagerieService.getHistoriqueMessages(enseignantId);
  }
}

// Made with Bob
