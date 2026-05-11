import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Note } from '../entities/note.entity';
import { UniteEnseignement } from '../entities/unite-enseignement.entity';
import { ElementConstitutif } from '../entities/element-constitutif.entity';
import { Etudiant } from '../entities/etudiant.entity';
import { Inscription } from '../entities/inscription.entity';
import { SessionExamen } from '../entities/session-examen.entity';
import { VerrouillageNotes } from '../entities/verrouillage-notes.entity';
import { CreateNoteDto } from '../dto/create-note.dto';
import { UpdateNoteDto } from '../dto/update-note.dto';
import { SaisieNotesMassiveDto } from '../dto/saisie-notes-massive.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note, 'tenant')
    private readonly noteRepository: Repository<Note>,
    @InjectRepository(UniteEnseignement, 'tenant')
    private readonly ueRepository: Repository<UniteEnseignement>,
    @InjectRepository(ElementConstitutif, 'tenant')
    private readonly ecRepository: Repository<ElementConstitutif>,
    @InjectRepository(Inscription, 'tenant')
    private readonly inscriptionRepository: Repository<Inscription>,
    @InjectRepository(SessionExamen, 'tenant')
    private readonly sessionRepository: Repository<SessionExamen>,
    @InjectRepository(VerrouillageNotes, 'tenant')
    private readonly verrouillageRepository: Repository<VerrouillageNotes>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crée une nouvelle note
   */
  async createNote(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    // Vérifier si la note existe déjà
    const existingNote = await this.noteRepository.findOne({
      where: {
        etudiant: { id: createNoteDto.etudiantId },
        ec: { id: createNoteDto.ecId },
        sessionExamen: { id: createNoteDto.sessionId },
      },
    });

    if (existingNote) {
      throw new BadRequestException('Une note existe déjà pour cet étudiant et cet EC');
    }

    // Vérifier si les notes ne sont pas verrouillées
    const peutModifier = await this.peutModifierNotes(createNoteDto.sessionId, userId);
    if (!peutModifier.autorise) {
      throw new ForbiddenException(peutModifier.motif || 'Modification non autorisée');
    }

    const note = this.noteRepository.create({
      etudiant: { id: createNoteDto.etudiantId },
      ec: { id: createNoteDto.ecId },
      sessionExamen: { id: createNoteDto.sessionId },
      valeur: createNoteDto.valeur,
      absenceJustifiee: createNoteDto.absenceJustifiee || false,
      observations: createNoteDto.observations,
      saisiPar: { id: userId } as any,
    });

    return await this.noteRepository.save(note);
  }

  /**
   * Met à jour une note existante
   */
  async updateNote(id: string, updateNoteDto: UpdateNoteDto, userId: string): Promise<Note> {
    const note = await this.noteRepository.findOne({
      where: { id },
      relations: ['sessionExamen'],
    });

    if (!note) {
      throw new NotFoundException('Note non trouvée');
    }

    // Vérifier si les notes ne sont pas verrouillées
    const peutModifier = await this.peutModifierNotes(note.sessionExamen.id, userId);
    if (!peutModifier.autorise) {
      throw new ForbiddenException(peutModifier.motif || 'Modification non autorisée');
    }

    // Mettre à jour les champs
    if (updateNoteDto.valeur !== undefined) {
      note.valeur = updateNoteDto.valeur;
    }
    if (updateNoteDto.absenceJustifiee !== undefined) {
      note.absenceJustifiee = updateNoteDto.absenceJustifiee;
    }
    if (updateNoteDto.observations !== undefined) {
      note.observations = updateNoteDto.observations;
    }

    // note.modifiePar = { id: userId } as any; // n'existe pas dans l'entité Note
    // note.dateModification = new Date(); // n'existe pas dans l'entité Note

    return await this.noteRepository.save(note);
  }

  /**
   * Saisie massive de notes
   */
  async saisieNotesMassive(saisieDto: SaisieNotesMassiveDto, userId: string): Promise<any> {
    const { sessionId, ecId, notes } = saisieDto;

    // Vérifier si les notes ne sont pas verrouillées
    const peutModifier = await this.peutModifierNotes(sessionId, userId);
    if (!peutModifier.autorise) {
      throw new ForbiddenException(peutModifier.motif || 'Modification non autorisée');
    }

    const ec = await this.ecRepository.findOne({
      where: { id: ecId },
      relations: ['uniteEnseignement'],
    });

    if (!ec) {
      throw new NotFoundException('EC non trouvé');
    }

    const result = {
      succes: 0,
      erreurs: [],
      total: notes.length,
    };

    // Utiliser une transaction pour la saisie massive
    await this.dataSource.transaction(async (manager) => {
      for (const noteData of notes) {
        try {
          // Vérifier si une note existe déjà
          const existingNote = await manager.findOne(Note, {
            where: {
              etudiant: { id: noteData.etudiantId },
              ec: { id: ecId },
              sessionExamen: { id: sessionId },
            },
          });

          if (existingNote) {
            // Mettre à jour la note existante
            existingNote.valeur = noteData.valeur;
            existingNote.observations = noteData.observations;
            await manager.save(Note, existingNote);
          } else {
            // Créer une nouvelle note
            const note = manager.create(Note, {
              etudiant: { id: noteData.etudiantId },
              ec: { id: ecId },
              ue: { id: ec.uniteEnseignement.id },
              sessionExamen: { id: sessionId },
              valeur: noteData.valeur,
              absenceJustifiee: noteData.absenceJustifiee || false,
              observations: noteData.observations,
              saisiPar: { id: userId } as any,
            });
            await manager.save(Note, note);
          }

          result.succes++;
        } catch (error: any) {
          result.erreurs.push({
            etudiantId: noteData.etudiantId,
            erreur: error.message || 'Erreur lors de la saisie',
          });
        }
      }
    });

    return result;
  }

  /**
   * Récupère les notes d'un étudiant
   */
  async getNotesEtudiant(etudiantId: string, semestre?: number, anneeNiveau?: number): Promise<any> {
    const inscriptions = await this.inscriptionRepository.find({
      where: {
        etudiant: { id: etudiantId },
        statut: 'actif',
      },
      relations: ['parcours'],
    });

    if (inscriptions.length === 0) {
      throw new NotFoundException('Aucune inscription trouvée pour cet étudiant');
    }

    const inscription = inscriptions[0];
    const whereCondition: any = {
      etudiant: { id: etudiantId },
    };

    if (semestre && anneeNiveau) {
      // Filtrer par semestre et année
      const ues = await this.ueRepository.find({
        where: { semestre, anneeNiveau },
        relations: ['elementsConstitutifs'],
      });
      
      const ecIds = ues.flatMap(ue => ue.elementsConstitutifs.map(ec => ec.id));
      whereCondition.ec = { id: In(ecIds) };
    }

    const notes = await this.noteRepository.find({
      where: whereCondition,
      relations: ['ec', 'ec.uniteEnseignement', 'sessionExamen'],
      order: { ec: { code: 'ASC' } },
    });

    // Grouper par UE
    const resultats = {};
    for (const note of notes) {
      const ueId = note.ec.uniteEnseignement.id;
      if (!resultats[ueId]) {
        resultats[ueId] = {
          ue: note.ec.uniteEnseignement,
          ecs: [],
          moyenneUE: 0,
          creditsAcquis: false,
        };
      }

      resultats[ueId].ecs.push({
        ec: note.ec,
        note: note,
        session: note.sessionExamen,
      });
    }

    return {
      inscription,
      semestre,
      anneeNiveau,
      ues: Object.values(resultats),
    };
  }

  /**
   * Récupère la grille de saisie pour une UE/EC
   */
  async getGrilleSaisie(
    parcoursId: string,
    semestre: number,
    anneeNiveau: number,
    ecId?: string,
  ): Promise<any> {
    // Récupérer les étudiants inscrits
    const inscriptions = await this.inscriptionRepository.find({
      where: {
        parcours: { id: parcoursId },
        statut: 'actif',
      },
      relations: ['etudiant'],
    });

    // Récupérer les ECs
    let ecs;
    if (ecId) {
      ecs = [await this.ecRepository.findOne({
        where: { id: ecId },
        relations: ['uniteEnseignement'],
      })];
    } else {
      const ues = await this.ueRepository.find({
        where: { semestre, anneeNiveau },
        relations: ['elementsConstitutifs'],
      });
      ecs = ues.flatMap(ue => ue.elementsConstitutifs.map(ec => ({ ...ec, ue })));
    }

    // Récupérer les notes existantes
    const etudiantIds = inscriptions.map(i => i.etudiant.id);
    const ecIds = ecs.map(ec => ec.id);

    const notesExistantes = await this.noteRepository.find({
      where: {
        etudiant: { id: In(etudiantIds) },
        ec: { id: In(ecIds) },
      },
      relations: ['sessionExamen'],
    });

    // Construire la grille
    return {
      semestre,
      anneeNiveau,
      etudiants: inscriptions.map(i => ({
        etudiant: i.etudiant,
        notes: ecs.map(ec => {
          const note = notesExistantes.find(n => 
            n.etudiant.id === i.etudiant.id && n.ec.id === ec.id
          );
          return {
            ec,
            note: note || null,
          };
        }),
      })),
      ecs,
      sessions: await this.sessionRepository.find({
        where: { statut: 'en_cours' },
      }),
    };
  }

  /**
   * Vérifie si un utilisateur peut modifier des notes
   */
  private async peutModifierNotes(sessionId: string, userId: string): Promise<{ autorise: boolean; motif?: string }> {
    // Vérifier si la session est verrouillée
    const verrouillage = await this.verrouillageRepository.findOne({
      where: {
        sessionExamen: { id: sessionId },
        statut: 'verrouille',
      },
    });

    if (verrouillage) {
      return {
        autorise: false,
        motif: 'Les notes pour cette session sont verrouillées',
      };
    }

    // TODO: Ajouter la logique de vérification des rôles
    return { autorise: true };
  }

  /**
   * Détermine la note finale à partir des différentes sessions
   */
  private determinerNoteFinale(notes: Note[]): Note | null {
    if (notes.length === 0) return null;

    // Priorité: session normale > rattrapage > deuxième chance
    const sessionNormale = notes.find(n => 
      n.sessionExamen.typeSession === 'normale'
    );
    
    if (sessionNormale && sessionNormale.valeur >= 10) {
      return sessionNormale;
    }

    const sessionRattrapage = notes.find(n => 
      n.sessionExamen.typeSession === 'rattrapage'
    );

    if (sessionRattrapage) {
      return sessionRattrapage;
    }

    const sessionDeuxiemeChance = notes.find(n => 
      n.sessionExamen.typeSession === 'deuxieme_chance'
    );

    return sessionDeuxiemeChance || notes[0];
  }

  /**
   * Calcule les statistiques des notes pour un EC
   */
  async getStatistiquesNotesEC(ecId: string, sessionId?: string): Promise<any> {
    const whereCondition: any = { ec: { id: ecId } };
    if (sessionId) {
      whereCondition.sessionExamen = { id: sessionId };
    }

    const notes = await this.noteRepository.find({
      where: whereCondition,
    });

    if (notes.length === 0) {
      return {
        effectif: 0,
        moyenne: 0,
        ecartType: 0,
        mediane: 0,
        min: 0,
        max: 0,
        distribution: {
          '0-5': 0,
          '5-10': 0,
          '10-15': 0,
          '15-20': 0,
        },
      };
    }

    const valeurs = notes.map(n => n.valeur).filter(v => v !== null);
    
    // Calcul des statistiques
    const moyenne = valeurs.reduce((a, b) => a + b, 0) / valeurs.length;
    const sortedValeurs = valeurs.sort((a, b) => a - b);
    const mediane = sortedValeurs.length % 2 === 0 
      ? (sortedValeurs[sortedValeurs.length / 2 - 1] + sortedValeurs[sortedValeurs.length / 2]) / 2
      : sortedValeurs[Math.floor(sortedValeurs.length / 2)];
    
    const variance = valeurs.reduce((sum, val) => sum + Math.pow(val - moyenne, 2), 0) / valeurs.length;
    const ecartType = Math.sqrt(variance);

    return {
      effectif: valeurs.length,
      moyenne: Math.round(moyenne * 100) / 100,
      ecartType: Math.round(ecartType * 100) / 100,
      mediane: Math.round(mediane * 100) / 100,
      min: Math.min(...valeurs),
      max: Math.max(...valeurs),
      distribution: {
        '0-5': valeurs.filter(v => v >= 0 && v < 5).length,
        '5-10': valeurs.filter(v => v >= 5 && v < 10).length,
        '10-15': valeurs.filter(v => v >= 10 && v < 15).length,
        '15-20': valeurs.filter(v => v >= 15 && v <= 20).length,
      },
    };
  }

  // Méthodes manquantes pour les contrôleurs
  async create(createNoteDto: any, userId: string): Promise<Note> {
    return this.createNote(createNoteDto, userId);
  }

  async update(id: string, updateNoteDto: any, userId: string): Promise<Note> {
    return this.updateNote(id, updateNoteDto, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const note = await this.noteRepository.findOne({ where: { id } });
    if (!note) {
      throw new NotFoundException('Note non trouvée');
    }
    await this.noteRepository.remove(note);
  }

  async saisieMassive(saisieDto: any, userId: string): Promise<any> {
    return this.saisieNotesMassive(saisieDto, userId);
  }

  async exporterNotes(params: any): Promise<Buffer> {
    // TODO: Implémenter l'export des notes
    throw new BadRequestException('Export des notes non implémenté');
  }

  async getNotesEtudiantSemestre(etudiantId: string, semestre: number, params: any): Promise<any> {
    return this.getNotesEtudiant(etudiantId, semestre);
  }
}
