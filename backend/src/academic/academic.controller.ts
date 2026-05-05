import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AcademicService } from './academic.service';

@ApiTags('Academic')
@ApiBearerAuth('JWT-auth')
@Controller('academic')
export class AcademicController {
  constructor(private readonly svc: AcademicService) {}

  // Departements
  @Get(':tid/departements')
  @ApiOperation({ summary: 'Liste des departements' })
  getDepartements(@Param('tid') tid: string) { return this.svc.getDepartements(tid); }

  @Post(':tid/departements')
  @ApiOperation({ summary: 'Creer un departement' })
  createDepartement(@Param('tid') tid: string, @Body() dto: any) { return this.svc.createDepartement(tid, dto); }

  @Patch(':tid/departements/:id')
  @ApiOperation({ summary: 'Modifier un departement' })
  updateDepartement(@Param('tid') tid: string, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateDepartement(tid, id, dto);
  }

  @Delete(':tid/departements/:id')
  @ApiOperation({ summary: 'Supprimer un departement' })
  deleteDepartement(@Param('tid') tid: string, @Param('id') id: string) {
    return this.svc.deleteDepartement(tid, id);
  }

  // Parcours
  @Post(':tid/parcours')
  @ApiOperation({ summary: 'Creer un parcours (Responsable Pedagogique)' })
  createParcours(@Param('tid') tid: string, @Body() dto: any) { return this.svc.createParcours(tid, dto); }

  @Get(':tid/parcours')
  @ApiOperation({ summary: 'Lister les parcours' })
  getParcours(@Param('tid') tid: string) { return this.svc.getParcours(tid); }

  @Patch(':tid/parcours/:id')
  @ApiOperation({ summary: 'Modifier un parcours' })
  updateParcours(@Param('tid') tid: string, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateParcours(tid, id, dto);
  }

  @Delete(':tid/parcours/:id')
  @ApiOperation({ summary: 'Supprimer un parcours' })
  deleteParcours(@Param('tid') tid: string, @Param('id') id: string) {
    return this.svc.deleteParcours(tid, id);
  }

  // UE
  @Post(':tid/ue')
  @ApiOperation({ summary: 'Creer une UE (maquette LMD, credits ECTS)' })
  createUE(@Param('tid') tid: string, @Body() dto: any) { return this.svc.createUE(tid, dto); }

  @Get(':tid/ue')
  @ApiOperation({ summary: 'UE par parcours' })
  getUE(@Param('tid') tid: string, @Query('parcoursId') pid: string) { return this.svc.getUEByParcours(tid, pid); }

  @Patch(':tid/ue/:id')
  @ApiOperation({ summary: 'Modifier une UE' })
  updateUE(@Param('tid') tid: string, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateUE(tid, id, dto);
  }

  @Delete(':tid/ue/:id')
  @ApiOperation({ summary: 'Supprimer une UE' })
  deleteUE(@Param('tid') tid: string, @Param('id') id: string) {
    return this.svc.deleteUE(tid, id);
  }

  // Etudiants
  @Get(':tid/etudiants')
  @ApiOperation({ summary: 'Liste des etudiants' })
  getEtudiants(@Param('tid') tid: string, @Query('parcoursId') pid?: string) {
    return this.svc.getEtudiants(tid, pid);
  }

  @Post(':tid/etudiants')
  @ApiOperation({ summary: 'Creer un etudiant' })
  async createEtudiant(@Param('tid') tid: string, @Body() dto: any) {
    console.log('[DEBUG] createEtudiant called with tid:', tid, 'dto:', dto);
    try {
      const result = await this.svc.createEtudiant(tid, dto);
      console.log('[DEBUG] createEtudiant success:', result);
      return result;
    } catch (error) {
      console.error('[DEBUG] createEtudiant error:', error);
      throw error;
    }
  }

  @Patch(':tid/etudiants/:id')
  @ApiOperation({ summary: 'Modifier un etudiant' })
  updateEtudiant(@Param('tid') tid: string, @Param('id') id: string, @Body() dto: any) {
    return this.svc.updateEtudiant(tid, id, dto);
  }

  @Delete(':tid/etudiants/:id')
  @ApiOperation({ summary: 'Supprimer un etudiant' })
  deleteEtudiant(@Param('tid') tid: string, @Param('id') id: string) {
    return this.svc.deleteEtudiant(tid, id);
  }

  @Post(':tid/notes')
  @ApiOperation({ summary: 'Saisir une note - calcul automatique moyenne' })
  saisirNote(@Param('tid') tid: string, @Body() dto: any) { return this.svc.saisirNote(tid, dto, 'system'); }

  @Get(':tid/notes/:etudiantId')
  @ApiOperation({ summary: 'Releve de notes etudiant' })
  getNotes(@Param('tid') tid: string, @Param('etudiantId') eid: string, @Query('annee') annee: string) {
    return this.svc.getReleverNotes(tid, eid, annee);
  }

  @Post(':tid/deliberation')
  @ApiOperation({ summary: 'Deliberation: verrouille toutes les notes du semestre' })
  deliberer(@Param('tid') tid: string, @Body() body: any) {
    return this.svc.deliberer(tid, body.parcoursId, body.semestre, body.annee);
  }

  @Post(':tid/inscriptions')
  @ApiOperation({ summary: 'Inscrire un etudiant (Secretaire Parcours)' })
  inscrire(@Param('tid') tid: string, @Body() dto: any) { return this.svc.inscrire(tid, dto); }

  @Get(':tid/inscriptions')
  @ApiOperation({ summary: 'Liste des inscriptions' })
  getInscriptions(@Param('tid') tid: string, @Query('parcoursId') pid?: string) {
    return this.svc.getInscriptions(tid, pid);
  }

  @Post(':tid/absences')
  @ApiOperation({ summary: 'Saisir une absence (Surveillant General)' })
  saisirAbsence(@Param('tid') tid: string, @Body() dto: any) { return this.svc.saisirAbsence(tid, dto); }

  @Get(':tid/absences/:etudiantId')
  @ApiOperation({ summary: 'Absences etudiant' })
  getAbsences(@Param('tid') tid: string, @Param('etudiantId') eid: string) {
    return this.svc.getAbsencesEtudiant(tid, eid);
  }

  @Post(':tid/salles')
  @ApiOperation({ summary: 'Ajouter une salle' })
  createSalle(@Param('tid') tid: string, @Body() dto: any) { return this.svc.createSalle(tid, dto); }

  @Get(':tid/salles')
  @ApiOperation({ summary: 'Liste des salles' })
  getSalles(@Param('tid') tid: string) { return this.svc.getSalles(tid); }

  @Post(':tid/edt')
  @ApiOperation({ summary: 'Creer emploi du temps (Secretaire)' })
  createEDT(@Param('tid') tid: string, @Body() dto: any) { return this.svc.createEDT(tid, dto); }

  @Get(':tid/edt')
  @ApiOperation({ summary: 'Emploi du temps par parcours' })
  getEDT(@Param('tid') tid: string, @Query('parcoursId') pid: string) { return this.svc.getEDT(tid, pid); }
}