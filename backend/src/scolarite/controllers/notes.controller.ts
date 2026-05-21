import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { NotesService } from '../services/notes.service';
import { CreateNoteDto } from '../dto/create-note.dto';
import { UpdateNoteDto } from '../dto/update-note.dto';
import { SaisieNotesMassiveDto } from '../dto/saisie-notes-massive.dto';

@Controller('scolarite/:tenantId/notes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @Roles('admin', 'scolarite', 'enseignant')
  create(@Body() createNoteDto: CreateNoteDto) {
    return this.notesService.create(createNoteDto, createNoteDto.userId);
  }

  @Post('saisie-massive')
  @Roles('admin', 'scolarite', 'enseignant')
  @HttpCode(HttpStatus.OK)
  async saisieMassive(@Body() saisieDto: SaisieNotesMassiveDto) {
    return await this.notesService.saisieMassive(saisieDto, saisieDto.userId);
  }

  @Get('grille-saisie')
  @Roles('admin', 'scolarite', 'enseignant')
  async getGrilleSaisie(
    @Query('parcoursId') parcoursId: string,
    @Query('semestre') semestre: number,
    @Query('anneeNiveau') anneeNiveau: number,
    @Query('ecId') ecId?: string,
  ) {
    return await this.notesService.getGrilleSaisie(
      parcoursId,
      semestre,
      anneeNiveau,
      ecId,
    );
  }

  @Get('export/:parcoursId/semestre/:semestre/niveau/:anneeNiveau')
  @Roles('admin', 'scolarite', 'enseignant')
  async exporterNotes(
    @Param('parcoursId') parcoursId: string,
    @Param('semestre') semestre: number,
    @Param('anneeNiveau') anneeNiveau: number,
    @Query('format') format: 'excel' | 'csv' = 'excel',
    @Res() res: Response,
  ) {
    try {
      const buffer = await this.notesService.exporterNotes({
        parcoursId,
        semestre,
        anneeNiveau,
        format,
      });

      const contentType = format === 'excel' 
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : 'text/csv';

      const filename = `notes-${parcoursId}-S${semestre}-N${anneeNiveau}.${format}`;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Erreur lors de l\'exportation des notes',
        error: (error as any).message,
      });
    }
  }

  @Get('etudiant/:etudiantId/semestre/:semestre/niveau/:anneeNiveau')
  @Roles('admin', 'scolarite', 'enseignant', 'etudiant')
  async getNotesEtudiantSemestre(
    @Param('etudiantId', ParseUUIDPipe) etudiantId: string,
    @Param('semestre') semestre: number,
    @Param('anneeNiveau') anneeNiveau: number,
    @Query('format') format?: string,
  ) {
    return await this.notesService.getNotesEtudiantSemestre(
      etudiantId,
      semestre,
      anneeNiveau,
    );
  }

  @Get('ec/:ecId/statistiques')
  @Roles('admin', 'scolarite', 'enseignant')
  async getStatistiquesNotesEC(
    @Param('ecId', ParseUUIDPipe) ecId: string,
    @Query('sessionId') sessionId?: string,
  ) {
    return await this.notesService.getStatistiquesNotesEC(ecId, sessionId);
  }

  @Get('verification-modification')
  @Roles('admin', 'scolarite', 'enseignant')
  async verifierModificationPossible(
    @Query('etudiantId') etudiantId: string,
    @Query('sessionId') sessionId: string,
  ) {
    // Cette méthode utilise le service de délibération pour vérifier
    // si les notes peuvent être modifiées
    return {
      message: 'Vérification à implémenter avec DeliberationService',
      etudiantId,
      sessionId,
    };
  }

  @Get(':id')
  @Roles('admin', 'scolarite', 'enseignant')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    // TODO: Implémenter la méthode findOne dans NotesService
    return { message: 'Méthode findOne à implémenter', id };
  }

  @Patch(':id')
  @Roles('admin', 'scolarite', 'enseignant')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    return this.notesService.update(id, updateNoteDto, updateNoteDto.userId);
  }

  @Delete(':id')
  @Roles('admin', 'scolarite')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('userId') userId: string,
  ) {
    return this.notesService.remove(id, userId);
  }

  @Post('import')
  @Roles('admin', 'scolarite')
  @HttpCode(HttpStatus.OK)
  async importerNotes(
    @Body() body: {
      fichier: string; // Base64 ou URL
      parcoursId: string;
      semestre: number;
      anneeNiveau: number;
      userId: string;
    },
  ) {
    // TODO: Implémenter l'importation depuis un fichier Excel/CSV
    return {
      message: 'Importation à implémenter',
      ...body,
    };
  }

  @Get('releve/:etudiantId/pdf')
  @Roles('admin', 'scolarite', 'etudiant')
  async genererReleveNotesPDF(
    @Param('etudiantId', ParseUUIDPipe) etudiantId: string,
    @Res() res: Response,
    @Query('semestre') semestre?: number,
    @Query('inscriptionId') inscriptionId?: string,
  ) {
    try {
      // TODO: Utiliser le PDFService pour générer le relevé
      // const pdfBuffer = await this.pdfService.genererReleveNotes(etudiantId, inscriptionId, semestre);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="releve-notes-${etudiantId}.pdf"`);
      // res.send(pdfBuffer);
      
      // Pour l'instant, retourner un message
      res.json({
        message: 'Génération PDF à implémenter',
        etudiantId,
        inscriptionId,
        semestre,
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Erreur lors de la génération du relevé de notes',
        error: (error as any).message,
      });
    }
  }
}
