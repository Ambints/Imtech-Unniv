import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TenantConnectionService } from '../tenants/tenant-connection.service';
import {
  SuiviMoral,
  AutorisationSortie,
  RapportConduite,
  ConseilDiscipline,
} from './encadrement.entities';
import { PresenceSurveillance } from './surveillance.entities';
import { Sanction } from './discipline.entities';
import {
  CreateSuiviMoralDto,
  UpdateSuiviMoralDto,
  CreateAutorisationSortieDto,
  ValiderAutorisationDto,
  CalculerAssiduitDto,
} from './surveillance.dto';

@Injectable()
export class EncadrementService {
  private readonly logger = new Logger(EncadrementService.name);

  constructor(
    @InjectRepository(SuiviMoral, 'tenant')
    private suiviMoralRepo: Repository<SuiviMoral>,
    @InjectRepository(AutorisationSortie, 'tenant')
    private autorisationRepo: Repository<AutorisationSortie>,
    @InjectRepository(RapportConduite, 'tenant')
    private rapportConduiteRepo: Repository<RapportConduite>,
    @InjectRepository(ConseilDiscipline, 'tenant')
    private conseilDisciplineRepo: Repository<ConseilDiscipline>,
    @InjectRepository(PresenceSurveillance, 'tenant')
    private presenceRepo: Repository<PresenceSurveillance>,
    @InjectRepository(Sanction, 'tenant')
    private sanctionRepo: Repository<Sanction>,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  // ==================== SUIVI MORAL ====================

  /**
   * Crée un suivi moral pour un étudiant
   */
  async creerSuiviMoral(
    tid: string,
    dto: CreateSuiviMoralDto,
    userId: string,
  ): Promise<SuiviMoral> {
    await this.tenantConnection.setTenantSchema(tid);

    const suivi = this.suiviMoralRepo.create({
      ...dto,
      suiviPar: userId,
      statut: 'en_cours',
    });

    return this.suiviMoralRepo.save(suivi);
  }

  /**
   * Met à jour un suivi moral
   */
  async updateSuiviMoral(
    tid: string,
    suiviId: string,
    dto: UpdateSuiviMoralDto,
  ): Promise<SuiviMoral> {
    await this.tenantConnection.setTenantSchema(tid);

    const suivi = await this.suiviMoralRepo.findOne({ where: { id: suiviId } });
    if (!suivi) throw new NotFoundException('Suivi moral non trouvé');

    Object.assign(suivi, dto);
    return this.suiviMoralRepo.save(suivi);
  }

  /**
   * Récupère les suivis moraux d'un étudiant
   */
  async getSuivisMoraux(
    tid: string,
    etudiantId: string,
  ): Promise<SuiviMoral[]> {
    await this.tenantConnection.setTenantSchema(tid);

    return this.suiviMoralRepo.find({
      where: { etudiantId },
      order: { dateEntretien: 'DESC' },
    });
  }

  /**
   * Clôture un suivi moral
   */
  async cloturerSuiviMoral(
    tid: string,
    suiviId: string,
    observations: string,
  ): Promise<SuiviMoral> {
    await this.tenantConnection.setTenantSchema(tid);

    const suivi = await this.suiviMoralRepo.findOne({ where: { id: suiviId } });
    if (!suivi) throw new NotFoundException('Suivi moral non trouvé');

    suivi.statut = 'cloture';
    suivi.observations = observations;

    return this.suiviMoralRepo.save(suivi);
  }

  // ==================== AUTORISATIONS DE SORTIE ====================

  /**
   * Crée une demande d'autorisation de sortie
   */
  async creerAutorisationSortie(
    tid: string,
    dto: CreateAutorisationSortieDto,
    userId: string,
  ): Promise<AutorisationSortie> {
    await this.tenantConnection.setTenantSchema(tid);

    // Vérifier qu'il n'y a pas de chevauchement
    const chevauchement = await this.autorisationRepo.findOne({
      where: {
        etudiantId: dto.etudiantId,
        statut: 'approuvee',
        dateDebut: Between(dto.dateDebut, dto.dateFin),
      },
    });

    if (chevauchement) {
      throw new BadRequestException(
        'Une autorisation existe déjà pour cette période',
      );
    }

    const autorisation = this.autorisationRepo.create({
      ...dto,
      demandePar: userId,
      statut: 'en_attente',
    });

    return this.autorisationRepo.save(autorisation);
  }

  /**
   * Valide ou refuse une autorisation de sortie
   */
  async validerAutorisationSortie(
    tid: string,
    autorisationId: string,
    dto: ValiderAutorisationDto,
    userId: string,
  ): Promise<AutorisationSortie> {
    await this.tenantConnection.setTenantSchema(tid);

    const autorisation = await this.autorisationRepo.findOne({
      where: { id: autorisationId },
    });
    if (!autorisation)
      throw new NotFoundException('Autorisation non trouvée');

    if (autorisation.statut !== 'en_attente') {
      throw new BadRequestException('Cette autorisation a déjà été traitée');
    }

    autorisation.statut = dto.approuve ? 'approuvee' : 'refusee';
    autorisation.valideePar = userId;
    autorisation.dateValidation = new Date();
    autorisation.motifRefus = dto.motifRefus;
    autorisation.observations = dto.observations;

    return this.autorisationRepo.save(autorisation);
  }

  /**
   * Enregistre la sortie effective
   */
  async enregistrerSortie(
    tid: string,
    autorisationId: string,
    heureSortie: string,
  ): Promise<AutorisationSortie> {
    await this.tenantConnection.setTenantSchema(tid);

    const autorisation = await this.autorisationRepo.findOne({
      where: { id: autorisationId },
    });
    if (!autorisation)
      throw new NotFoundException('Autorisation non trouvée');

    if (autorisation.statut !== 'approuvee') {
      throw new BadRequestException("L'autorisation n'est pas approuvée");
    }

    autorisation.sortieEffective = true;
    autorisation.heureSortie = heureSortie;

    return this.autorisationRepo.save(autorisation);
  }

  /**
   * Enregistre le retour
   */
  async enregistrerRetour(
    tid: string,
    autorisationId: string,
    heureRetour: string,
  ): Promise<AutorisationSortie> {
    await this.tenantConnection.setTenantSchema(tid);

    const autorisation = await this.autorisationRepo.findOne({
      where: { id: autorisationId },
    });
    if (!autorisation)
      throw new NotFoundException('Autorisation non trouvée');

    autorisation.heureRetour = heureRetour;

    return this.autorisationRepo.save(autorisation);
  }

  /**
   * Récupère les autorisations en attente
   */
  async getAutorisationsEnAttente(tid: string): Promise<AutorisationSortie[]> {
    await this.tenantConnection.setTenantSchema(tid);

    return this.autorisationRepo.find({
      where: { statut: 'en_attente' },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Récupère les autorisations d'un étudiant
   */
  async getAutorisationsEtudiant(
    tid: string,
    etudiantId: string,
  ): Promise<AutorisationSortie[]> {
    await this.tenantConnection.setTenantSchema(tid);

    return this.autorisationRepo.find({
      where: { etudiantId },
      order: { dateDebut: 'DESC' },
    });
  }

  // ==================== CALCUL D'ASSIDUITÉ ====================

  /**
   * Calcule le taux d'assiduité d'un étudiant
   */
  async calculerAssiduite(
    tid: string,
    dto: CalculerAssiduitDto,
  ): Promise<{
    tauxAssiduite: number;
    totalSeances: number;
    presences: number;
    absences: number;
    absencesJustifiees: number;
    absencesNonJustifiees: number;
    retards: number;
  }> {
    await this.tenantConnection.setTenantSchema(tid);

    const where: any = { etudiantId: dto.etudiantId };

    if (dto.dateDebut && dto.dateFin) {
      where.datePointage = Between(dto.dateDebut, dto.dateFin);
    }

    const presences = await this.presenceRepo.find({ where });

    const totalSeances = presences.length;
    const presencesCount = presences.filter(
      (p) => p.statut === 'present',
    ).length;
    const absences = presences.filter((p) => p.statut === 'absent').length;
    const absencesJustifiees = presences.filter(
      (p) => p.statut === 'absent' && p.estJustifie,
    ).length;
    const absencesNonJustifiees = absences - absencesJustifiees;
    const retards = presences.filter((p) => p.statut === 'retard').length;

    // Calcul du taux : (présences + retards + absences justifiées) / total
    const tauxAssiduite =
      totalSeances > 0
        ? ((presencesCount + retards + absencesJustifiees) / totalSeances) *
          100
        : 0;

    return {
      tauxAssiduite: Math.round(tauxAssiduite * 100) / 100,
      totalSeances,
      presences: presencesCount,
      absences,
      absencesJustifiees,
      absencesNonJustifiees,
      retards,
    };
  }

  // ==================== RAPPORT DE CONDUITE ====================

  /**
   * Génère un rapport de conduite pour une période
   */
  async genererRapportConduite(
    tid: string,
    etudiantId: string,
    periodeDebut: Date,
    periodeFin: Date,
    userId: string,
  ): Promise<RapportConduite> {
    await this.tenantConnection.setTenantSchema(tid);

    // Calculer l'assiduité
    const assiduite = await this.calculerAssiduite(tid, {
      etudiantId,
      dateDebut: periodeDebut,
      dateFin: periodeFin,
    });

    // Compter les sanctions
    const sanctions = await this.sanctionRepo.count({
      where: {
        etudiantId,
        dateDebut: Between(periodeDebut, periodeFin),
      },
    });

    // Calculer les notes
    const noteAssiduite = (assiduite.tauxAssiduite / 100) * 20;
    const noteDiscipline = Math.max(0, 20 - sanctions * 2); // -2 points par sanction
    const noteComportement = (noteAssiduite + noteDiscipline) / 2;

    const rapport = this.rapportConduiteRepo.create({
      etudiantId,
      periode_debut: periodeDebut,
      periode_fin: periodeFin,
      noteComportement: Math.round(noteComportement * 10) / 10,
      noteAssiduite: Math.round(noteAssiduite * 10) / 10,
      noteDiscipline: Math.round(noteDiscipline * 10) / 10,
      nombreAbsences: assiduite.absencesNonJustifiees,
      nombreRetards: assiduite.retards,
      nombreSanctions: sanctions,
      appreciation_generale: this.genererAppreciation(
        noteComportement,
        assiduite,
        sanctions,
      ),
      redigePar: userId,
      statut: 'brouillon',
    });

    return this.rapportConduiteRepo.save(rapport);
  }

  /**
   * Génère une appréciation automatique
   */
  private genererAppreciation(
    noteComportement: number,
    assiduite: any,
    sanctions: number,
  ): string {
    if (noteComportement >= 16) {
      return 'Excellent comportement. Étudiant exemplaire, assidu et discipliné.';
    } else if (noteComportement >= 14) {
      return 'Très bon comportement. Étudiant sérieux et respectueux du règlement.';
    } else if (noteComportement >= 12) {
      return 'Bon comportement général. Quelques points à améliorer.';
    } else if (noteComportement >= 10) {
      return 'Comportement acceptable mais des efforts sont nécessaires.';
    } else {
      return 'Comportement insuffisant. Nécessite un suivi rapproché et des mesures correctives.';
    }
  }

  /**
   * Valide un rapport de conduite
   */
  async validerRapportConduite(
    tid: string,
    rapportId: string,
    userId: string,
  ): Promise<RapportConduite> {
    await this.tenantConnection.setTenantSchema(tid);

    const rapport = await this.rapportConduiteRepo.findOne({
      where: { id: rapportId },
    });
    if (!rapport) throw new NotFoundException('Rapport non trouvé');

    rapport.statut = 'valide';
    rapport.validePar = userId;

    return this.rapportConduiteRepo.save(rapport);
  }

  /**
   * Transmet un rapport aux parents
   */
  async transmettreRapportParents(
    tid: string,
    rapportId: string,
  ): Promise<RapportConduite> {
    await this.tenantConnection.setTenantSchema(tid);

    const rapport = await this.rapportConduiteRepo.findOne({
      where: { id: rapportId },
    });
    if (!rapport) throw new NotFoundException('Rapport non trouvé');

    if (rapport.statut !== 'valide') {
      throw new BadRequestException('Le rapport doit être validé avant transmission');
    }

    rapport.statut = 'transmis_parents';
    rapport.dateTransmission = new Date();

    return this.rapportConduiteRepo.save(rapport);
  }

  // ==================== CONSEIL DE DISCIPLINE ====================

  /**
   * Convoque un conseil de discipline
   */
  async convoquerConseilDiscipline(
    tid: string,
    etudiantId: string,
    dateConseil: Date,
    motif: string,
    incidentsLies: string[],
  ): Promise<ConseilDiscipline> {
    await this.tenantConnection.setTenantSchema(tid);

    const conseil = this.conseilDisciplineRepo.create({
      etudiantId,
      dateConseil,
      motif_convocation: motif,
      incidents_lies: incidentsLies,
      statut: 'convoque',
    });

    return this.conseilDisciplineRepo.save(conseil);
  }

  /**
   * Enregistre la décision du conseil
   */
  async enregistrerDecisionConseil(
    tid: string,
    conseilId: string,
    decision: string,
    deliberation: string,
    justification: string,
    membresPresents: any[],
  ): Promise<ConseilDiscipline> {
    await this.tenantConnection.setTenantSchema(tid);

    const conseil = await this.conseilDisciplineRepo.findOne({
      where: { id: conseilId },
    });
    if (!conseil) throw new NotFoundException('Conseil non trouvé');

    conseil.statut = 'tenu';
    conseil.decision = decision as any;
    conseil.deliberation = deliberation;
    conseil.justification_decision = justification;
    conseil.membres_presents = membresPresents;

    return this.conseilDisciplineRepo.save(conseil);
  }
}

// Made with Bob