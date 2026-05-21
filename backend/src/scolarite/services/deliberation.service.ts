import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Note } from '../entities/note.entity';
import { Deliberation } from '../entities/deliberation.entity';
import { ResultatSemestre } from '../entities/resultat-semestre.entity';
import { VerrouillageNotes } from '../entities/verrouillage-notes.entity';
import { Inscription } from '../entities/inscription.entity';
import { UpdateDeliberationDto } from '../dto/update-deliberation.dto';
import { CreateDeliberationDto } from '../dto/create-deliberation.dto';
import { CalculMoyenneService } from './calcul-moyenne.service';

@Injectable()
export class DeliberationService {
  constructor(
    @InjectRepository(Deliberation, 'tenant')
    private readonly deliberationRepository: Repository<Deliberation>,
    @InjectRepository(ResultatSemestre, 'tenant')
    private readonly resultatSemestreRepository: Repository<ResultatSemestre>,
    @InjectRepository(VerrouillageNotes, 'tenant')
    private readonly verrouillageNotesRepository: Repository<VerrouillageNotes>,
    @InjectRepository(Note, 'tenant')
    private readonly noteRepository: Repository<Note>,
    private readonly calculMoyenneService: CalculMoyenneService,
    private readonly dataSource: DataSource,
    @InjectRepository(Inscription, 'tenant')
    private readonly inscriptionRepository: Repository<Inscription>,
  ) {}

  /**
   * Crée une nouvelle délibération
   */
  async create(createDeliberationDto: CreateDeliberationDto, userId: string): Promise<Deliberation> {
    const deliberation = this.deliberationRepository.create({
      ...createDeliberationDto,
      presidentJury: { id: userId },
    });

    return await this.deliberationRepository.save(deliberation);
  }

  /**
   * Lance le processus de délibération pour une promotion
   */
  async lancerDeliberation(
    deliberationId: string,
    userId: string,
  ): Promise<{ deliberation: Deliberation; resultats: ResultatSemestre[]; statistiques: any }> {
    const deliberation = await this.deliberationRepository.findOne({
      where: { id: deliberationId },
      relations: ['sessionExamen', 'parcours', 'presidentJury'],
    });

    if (!deliberation) {
      throw new NotFoundException('Délibération non trouvée');
    }

    if (deliberation.statut !== 'planifiee') {
      throw new BadRequestException('Cette délibération est déjà en cours ou terminée');
    }

    // Mettre à jour le statut
    deliberation.statut = 'en_cours';
    await this.deliberationRepository.save(deliberation);

    // Lancer le calcul des résultats dans une transaction
    const result = await this.dataSource.transaction(async (manager) => {
      // Récupérer tous les étudiants concernés
      const inscriptions = await this.inscriptionRepository.find({
        where: {
          parcours: { id: deliberation.parcours.id },
          statut: 'actif',
        },
        relations: ['etudiant', 'anneeAcademique'],
      });

      const resultats: ResultatSemestre[] = [];

      // Calculer les résultats pour chaque étudiant
      for (const inscription of inscriptions) {
        try {
          const resultat = await this.calculMoyenneService.mettreAJourResultatsSemestre(
            inscription.etudiant.id,
            inscription.id,
            deliberation.semestre,
            deliberation.anneeNiveau,
          );

          resultat.deliberation = deliberation;
          const savedResultat = await manager.save(ResultatSemestre, resultat);
          resultats.push(savedResultat);

        } catch (error) {
          console.error(`Erreur calcul pour étudiant ${inscription.etudiant.id}:`, error);
        }
      }

      // Calculer les statistiques
      const statistiques = await this.calculMoyenneService.calculerStatistiquesPromotion(
        deliberation.parcours.id,
        deliberation.semestre,
        deliberation.anneeNiveau,
      );

      return { resultats, statistiques };
    });

    return {
      deliberation,
      ...result,
    };
  }

  /**
   * Valide et termine une délibération
   */
  async validerDeliberation(
    deliberationId: string,
    userId: string,
    observations?: string,
  ): Promise<Deliberation> {
    const deliberation = await this.deliberationRepository.findOne({
      where: { id: deliberationId },
      relations: ['sessionExamen', 'parcours'],
    });

    if (!deliberation) {
      throw new NotFoundException('Délibération non trouvée');
    }

    if (deliberation.statut !== 'en_cours') {
      throw new BadRequestException('Seule une délibération en cours peut être validée');
    }

    // Vérifier que tous les résultats sont calculés
    const resultatsCount = await this.resultatSemestreRepository.count({
      where: { deliberation: { id: deliberationId } },
    });

    if (resultatsCount === 0) {
      throw new BadRequestException('Aucun résultat trouvé pour cette délibération');
    }

    // Mettre à jour la délibération
    deliberation.statut = 'terminee';
    deliberation.valideePar = { id: userId } as any;
    deliberation.dateValidation = new Date();
    if (observations) {
      deliberation.observationsGenerales = observations;
    }

    const savedDeliberation = await this.deliberationRepository.save(deliberation);

    // Verrouiller les notes après validation
    await this.verrouillerNotesDeliberation(deliberationId, userId);

    return savedDeliberation;
  }

  /**
   * Verrouille les notes après délibération
   */
  private async verrouillerNotesDeliberation(deliberationId: string, userId: string): Promise<void> {
    const deliberation = await this.deliberationRepository.findOne({
      where: { id: deliberationId },
      relations: ['sessionExamen'],
    });

    if (!deliberation) return;

    // Récupérer tous les résultats de cette délibération
    const resultats = await this.resultatSemestreRepository.find({
      where: { deliberation: { id: deliberationId } },
      relations: ['etudiant'],
    });

    // Créer les verrouillages
    for (const resultat of resultats) {
      const verrouillage = this.verrouillageNotesRepository.create({
        deliberation: { id: deliberationId },
        etudiant: resultat.etudiant,
        sessionExamen: deliberation.sessionExamen,
        statut: 'verrouille',
        dateVerrouillage: new Date(),
        verrouillePar: { id: userId } as any,
        historiqueModifs: [{
          date: new Date(),
          utilisateur: userId,
          action: 'verrouillage',
          motif: 'Verrouillage automatique après délibération',
        }],
      });

      await this.verrouillageNotesRepository.save(verrouillage);
    }
  }

  /**
   * Autorise une modification exceptionnelle de notes
   */
  async autoriserModificationNotes(
    deliberationId: string,
    etudiantId: string,
    motif: string,
    dureeJours: number,
    userId: string,
  ): Promise<VerrouillageNotes> {
    const verrouillage = await this.verrouillageNotesRepository.findOne({
      where: {
        deliberation: { id: deliberationId },
        etudiant: { id: etudiantId },
      },
      relations: ['deliberation', 'etudiant', 'sessionExamen'],
    });

    if (!verrouillage) {
      throw new NotFoundException('Verrouillage non trouvé');
    }

    if (verrouillage.statut !== 'verrouille') {
      throw new BadRequestException('Les notes ne sont pas verrouillées');
    }

    // Mettre à jour l'autorisation
    verrouillage.statut = 'modification_autorisee';
    verrouillage.autorisationModif = true;
    verrouillage.motifAutorisation = motif;
    verrouillage.autorisePar = { id: userId } as any;
    verrouillage.dateAutorisation = new Date();
    verrouillage.dateFinAutorisation = new Date();
    verrouillage.dateFinAutorisation.setDate(verrouillage.dateFinAutorisation.getDate() + dureeJours);

    // Ajouter à l'historique
    verrouillage.historiqueModifs.push({
      date: new Date(),
      utilisateur: userId,
      action: 'autorisation_modification',
      motif: motif,
    });

    return await this.verrouillageNotesRepository.save(verrouillage);
  }

  /**
   * Vérifie si une note peut être modifiée
   */
  async peutModifierNote(
    etudiantId: string,
    sessionId: string,
  ): Promise<{ peutModifier: boolean; motif?: string }> {
    const verrouillage = await this.verrouillageNotesRepository.findOne({
      where: {
        etudiant: { id: etudiantId },
        sessionExamen: { id: sessionId },
      },
      relations: ['deliberation'],
    });

    if (!verrouillage || verrouillage.statut === 'deverrouille') {
      return { peutModifier: true };
    }

    if (verrouillage.statut === 'verrouille') {
      return { 
        peutModifier: false, 
        motif: 'Notes verrouillées après délibération' 
      };
    }

    if (verrouillage.statut === 'modification_autorisee') {
      if (verrouillage.dateFinAutorisation && verrouillage.dateFinAutorisation < new Date()) {
        return { 
          peutModifier: false, 
          motif: "Période d'autorisation expirée" 
        };
      }
      return { peutModifier: true };
    }

    return { peutModifier: false, motif: 'Statut de verrouillage inconnu' };
  }

  /**
   * Génère le rapport de délibération
   */
  async genererRapportDeliberation(deliberationId: string): Promise<any> {
    const deliberation = await this.deliberationRepository.findOne({
      where: { id: deliberationId },
      relations: ['sessionExamen', 'parcours', 'presidentJury', 'valideePar'],
    });

    if (!deliberation) {
      throw new NotFoundException('Délibération non trouvée');
    }

    const resultats = await this.resultatSemestreRepository.find({
      where: { deliberation: { id: deliberationId } },
      relations: ['etudiant', 'inscription'],
      order: { moyenneGenerale: 'DESC' },
    });

    const statistiques = await this.calculMoyenneService.calculerStatistiquesPromotion(
      deliberation.parcours.id,
      deliberation.semestre,
      deliberation.anneeNiveau,
    );

    return {
      deliberation,
      resultats,
      statistiques,
      dateGeneration: new Date(),
    };
  }

  /**
   * Récupère toutes les délibérations
   */
  async findAll(filters?: any): Promise<Deliberation[]> {
    const queryBuilder = this.deliberationRepository
      .createQueryBuilder('deliberation')
      .leftJoinAndSelect('deliberation.sessionExamen', 'sessionExamen')
      .leftJoinAndSelect('deliberation.parcours', 'parcours')
      .leftJoinAndSelect('deliberation.presidentJury', 'presidentJury')
      .leftJoinAndSelect('deliberation.valideePar', 'valideePar');

    if (filters?.statut) {
      queryBuilder.andWhere('deliberation.statut = :statut', { statut: filters.statut });
    }

    if (filters?.parcoursId) {
      queryBuilder.andWhere('parcours.id = :parcoursId', { parcoursId: filters.parcoursId });
    }

    if (filters?.anneeNiveau) {
      queryBuilder.andWhere('deliberation.anneeNiveau = :anneeNiveau', { anneeNiveau: filters.anneeNiveau });
    }

    return await queryBuilder
      .orderBy('deliberation.dateDeliberation', 'DESC')
      .getMany();
  }

  /**
   * Récupère une délibération par son ID
   */
  async findOne(id: string): Promise<Deliberation> {
    const deliberation = await this.deliberationRepository.findOne({
      where: { id },
      relations: [
        'sessionExamen',
        'parcours',
        'presidentJury',
        'valideePar',
        'resultatsSemestre',
        'resultatsSemestre.etudiant',
        'resultatsSemestre.inscription',
      ],
    });

    if (!deliberation) {
      throw new NotFoundException('Délibération non trouvée');
    }

    return deliberation;
  }

  /**
   * Met à jour une délibération
   */
  async update(id: string, updateDeliberationDto: UpdateDeliberationDto): Promise<Deliberation> {
    const deliberation = await this.findOne(id);

    if (deliberation.statut === 'terminee') {
      throw new BadRequestException('Une délibération terminée ne peut être modifiée');
    }

    Object.assign(deliberation, updateDeliberationDto);
    return await this.deliberationRepository.save(deliberation);
  }

  /**
   * Supprime une délibération
   */
  async remove(id: string): Promise<void> {
    const deliberation = await this.findOne(id);

    if (deliberation.statut === 'terminee') {
      throw new BadRequestException('Une délibération terminée ne peut être supprimée');
    }

    await this.deliberationRepository.remove(deliberation);
  }
}
