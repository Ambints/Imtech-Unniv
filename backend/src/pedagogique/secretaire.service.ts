import { Injectable, BadRequestException, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, Between, Not, DataSource, In } from 'typeorm';
import { TenantConnectionService } from '../tenants/tenant-connection.service';
import {
  AbsenceEnseignant,
  Rattrapage,
  Convocation,
  NoteDerogatoire,
  DossierEtudiant,
  DemandeEtudiant
} from './secretaire.entities';
import { ProcesVerbal } from './pedagogique.entities';
import { SecretaireParcours } from './secretaire-parcours.entity';
import {
  EmploiDuTemps,
  Salle,
  Enseignant,
  AffectationCours,
  Inscription,
  Etudiant,
  Presence,
  UniteEnseignement,
  ElementConstitutif,
  AnneeAcademique,
  SessionExamen,
  Parcours
} from '../academic/academic.entities';

/**
 * DTOs pour le module Secrétaire
 */
export interface CreateSeanceDto {
  anneeAcademiqueId: string;
  affectationId: string;
  salleId: string;
  dateSeance: Date;
  heureDebut: string;
  heureFin: string;
  typeSeance?: string;
}

export interface CreateAbsenceDto {
  enseignantId: string;
  seanceId?: string;
  dateAbsence: Date;
  heureDebut?: string;
  heureFin?: string;
  motif: string;
  justification?: string;
  justificatifUrl?: string;
}

export interface CreateRattrapageDto {
  absenceId: string;
  salleId: string;
  dateRattrapage: Date;
  heureDebut: string;
  heureFin: string;
  remplaceurId?: string;
  observations?: string;
}

export interface CreateConvocationDto {
  etudiantId?: string;
  sessionExamenId?: string;
  soutenanceId?: string;
  type: string;
  libelle: string;
  message?: string;
  dateConvocation: Date;
  heureConvocation?: string;
  lieu?: string;
  salleId?: string;
}

export interface CreateNoteDerogatoireDto {
  etudiantId: string;
  ecId?: string;
  ueId?: string;
  sessionExamenId?: string;
  valeur: number;
  motifDerogation: string;
  typeDerogation?: string;
  observations?: string;
}

export interface CreateInscriptionDto {
  etudiantId: string;
  parcoursId: string;
  anneeAcademiqueId: string;
  anneeNiveau: number;
  typeInscription?: string;
  numeroCarte?: string;
  observations?: string;
}

export interface ConflitSalle {
  type: 'salle' | 'enseignant';
  message: string;
  seanceExistante: any;
}

@Injectable()
export class SecretaireService {
  constructor(
    @InjectRepository(AbsenceEnseignant, 'tenant') private absenceRepo: Repository<AbsenceEnseignant>,
    @InjectRepository(Rattrapage, 'tenant') private rattrapageRepo: Repository<Rattrapage>,
    @InjectRepository(NoteDerogatoire, 'tenant') private noteDerogatoireRepo: Repository<NoteDerogatoire>,
    @InjectRepository(DemandeEtudiant, 'tenant') private demandeRepo: Repository<DemandeEtudiant>,
    @InjectRepository(ProcesVerbal, 'tenant') private pvRepo: Repository<ProcesVerbal>,
    @InjectRepository(EmploiDuTemps, 'tenant') private emploiDuTempsRepo: Repository<EmploiDuTemps>,
    @InjectRepository(Salle, 'tenant') private salleRepo: Repository<Salle>,
    @InjectRepository(Enseignant, 'tenant') private enseignantRepo: Repository<Enseignant>,
    @InjectRepository(AffectationCours, 'tenant') private affectationRepo: Repository<AffectationCours>,
    @InjectRepository(Inscription, 'tenant') private inscriptionRepo: Repository<Inscription>,
    @InjectRepository(Etudiant, 'tenant') private etudiantRepo: Repository<Etudiant>,
    @InjectRepository(Presence, 'tenant') private presenceRepo: Repository<Presence>,
    @InjectRepository(UniteEnseignement, 'tenant') private ueRepo: Repository<UniteEnseignement>,
    @InjectRepository(ElementConstitutif, 'tenant') private ecRepo: Repository<ElementConstitutif>,
    @InjectRepository(SessionExamen, 'tenant') private sessionExamenRepo: Repository<SessionExamen>,
    @InjectRepository(AnneeAcademique, 'tenant') private anneeAcademiqueRepo: Repository<AnneeAcademique>,
    @InjectRepository(Convocation, 'tenant') private convocationRepo: Repository<Convocation>,
    @InjectRepository(Parcours, 'tenant') private parcoursRepo: Repository<Parcours>,
    @InjectRepository(SecretaireParcours, 'tenant') private secretaireParcoursRepo: Repository<SecretaireParcours>,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  // ==================== GESTION DE L'EMPLOI DU TEMPS ====================

  /**
   * Vérifie les conflits de salle et d'enseignant avant de créer une séance
   */
  async verifierConflits(tid: string, dto: CreateSeanceDto, seanceId?: string): Promise<ConflitSalle[]> {
    await this.tenantConnection.setTenantSchema(tid);
    const conflits: ConflitSalle[] = [];

    // Récupérer l'affectation pour obtenir l'enseignant_id
    const affectation = await this.affectationRepo.findOne({ where: { id: dto.affectationId } });
    if (!affectation) {
      throw new NotFoundException('Affectation non trouvée');
    }

    // Vérifier les conflits de salle
    const conflitSalleQuery = this.emploiDuTempsRepo.createQueryBuilder('edt')
      .where('edt.salle_id = :salleId', { salleId: dto.salleId })
      .andWhere('edt.date_seance = :dateSeance', { dateSeance: dto.dateSeance })
      .andWhere(
        `(edt.heure_debut < :heureFin AND edt.heure_fin > :heureDebut)`,
        { heureDebut: dto.heureDebut, heureFin: dto.heureFin }
      );

    if (seanceId) {
      conflitSalleQuery.andWhere('edt.id != :seanceId', { seanceId });
    }

    const conflitSalle = await conflitSalleQuery.getOne();

    if (conflitSalle) {
      conflits.push({
        type: 'salle',
        message: `La salle est déjà occupée de ${conflitSalle.heureDebut} à ${conflitSalle.heureFin}`,
        seanceExistante: conflitSalle,
      });
    }

    // Vérifier les conflits d'enseignant
    const conflitEnseignantQuery = this.emploiDuTempsRepo.createQueryBuilder('edt')
      .innerJoin(AffectationCours, 'aff', 'edt.affectation_id = aff.id')
      .where('aff.enseignant_id = :enseignantId', { enseignantId: affectation.enseignantId })
      .andWhere('edt.date_seance = :dateSeance', { dateSeance: dto.dateSeance })
      .andWhere(
        `(edt.heure_debut < :heureFin AND edt.heure_fin > :heureDebut)`,
        { heureDebut: dto.heureDebut, heureFin: dto.heureFin }
      );

    if (seanceId) {
      conflitEnseignantQuery.andWhere('edt.id != :seanceId', { seanceId });
    }

    const conflitEnseignant = await conflitEnseignantQuery.getOne();

    if (conflitEnseignant) {
      conflits.push({
        type: 'enseignant',
        message: `L'enseignant a déjà une séance programmée à ce créneau`,
        seanceExistante: conflitEnseignant,
      });
    }

    return conflits;
  }

  /**
   * Crée une nouvelle séance dans l'emploi du temps
   */
  async creerSeance(tid: string, dto: CreateSeanceDto, userId: string, ignorerConflits = false) {
    await this.tenantConnection.setTenantSchema(tid);

    // Vérifier les conflits
    if (!ignorerConflits) {
      const conflits = await this.verifierConflits(tid, dto);
      if (conflits.length > 0) {
        throw new ConflictException({
          message: 'Des conflits ont été détectés',
          conflits,
        });
      }
    }

    const seance = this.emploiDuTempsRepo.create({
      ...dto,
      statut: 'planifie',
      createdById: userId, // Tracking de l'ownership
    });

    return this.emploiDuTempsRepo.save(seance);
  }

  /**
   * Récupère l'emploi du temps par parcours et semaine
   */
  async getEmploiDuTemps(tid: string, parcoursId: string, dateDebut: Date, dateFin: Date, userId?: string, userRole?: string) {
    await this.tenantConnection.setTenantSchema(tid);

    // Vérifier l'accès au parcours pour les secrétaires
    if (userId && userRole && !this.isAdmin(userRole)) {
      const hasAccess = await this.canAccessParcoursViaTable(tid, userId, parcoursId);
      if (!hasAccess) {
        throw new ForbiddenException('Vous n\'avez pas accès à ce parcours');
      }
    }

    // Récupérer les UE du parcours
    const ues = await this.ueRepo.find({ where: { parcoursId } });
    const ueIds = ues.map(ue => ue.id);
    if (ueIds.length === 0) return [];

    // Récupérer les affectations liées à ces UE
    const affectations = await this.affectationRepo
      .createQueryBuilder('aff')
      .where('aff.ue_id IN (:...ueIds)', { ueIds })
      .getMany();
    
    const affectationIds = affectations.map(a => a.id);
    if (affectationIds.length === 0) return [];

    // Récupérer les séances dans la période
    const seances = await this.emploiDuTempsRepo
      .createQueryBuilder('edt')
      .where('edt.affectation_id IN (:...affectationIds)', { affectationIds })
      .andWhere('edt.date_seance BETWEEN :dateDebut AND :dateFin', { dateDebut, dateFin })
      .orderBy('edt.date_seance', 'ASC')
      .addOrderBy('edt.heure_debut', 'ASC')
      .getMany();

    // Enrichir avec les données et permissions
    const isAdmin = this.isAdmin(userRole);
    const seancesEnrichies = await Promise.all(
      seances.map(async (seance) => {
        const affectation = affectations.find(a => a.id === seance.affectationId);
        const ue = affectation ? ues.find(u => u.id === affectation.ueId) : null;
        const salle = seance.salleId ? await this.salleRepo.findOne({ where: { id: seance.salleId } }) : null;
        const enseignant = affectation
          ? await this.enseignantRepo.findOne({ where: { id: affectation.enseignantId } })
          : null;

        // Déterminer si l'utilisateur peut modifier cette séance
        const canEdit = isAdmin || (seance.createdById === userId);
        const canDelete = isAdmin || (seance.createdById === userId);

        return {
          ...seance,
          ue,
          salle,
          enseignant,
          affectation,
          canEdit,    // Permission de modification
          canDelete,  // Permission de suppression
        };
      })
    );

    return seancesEnrichies;
  }

  /**
   * Met à jour une séance existante
   * RÈGLE: Un SP peut uniquement modifier ses propres entrées d'EDT
   */
  async updateSeance(tid: string, seanceId: string, dto: Partial<CreateSeanceDto>, userId: string, userRole: string, ignorerConflits = false) {
    await this.tenantConnection.setTenantSchema(tid);

    const seance = await this.emploiDuTempsRepo.findOne({ where: { id: seanceId } });
    if (!seance) throw new NotFoundException('Séance non trouvée');

    // Vérifier l'ownership - un secrétaire ne peut modifier que ses propres entrées
    // Les admins peuvent tout modifier
    if (!this.isAdmin(userRole) && seance.createdById && seance.createdById !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier une entrée créée par un autre secrétaire');
    }

    // Vérifier les conflits si changement de créneau ou salle
    if ((dto.salleId || dto.dateSeance || dto.heureDebut || dto.heureFin) && !ignorerConflits) {
      const conflits = await this.verifierConflits(tid, {
        anneeAcademiqueId: dto.anneeAcademiqueId || seance.anneeAcademiqueId,
        affectationId: dto.affectationId || seance.affectationId,
        salleId: dto.salleId || seance.salleId,
        dateSeance: dto.dateSeance || seance.dateSeance,
        heureDebut: dto.heureDebut || seance.heureDebut,
        heureFin: dto.heureFin || seance.heureFin,
      }, seanceId);

      if (conflits.length > 0) {
        throw new ConflictException({
          message: 'Des conflits ont été détectés',
          conflits,
        });
      }
    }

    return this.emploiDuTempsRepo.save({ ...seance, ...dto });
  }

  /**
   * Annule une séance
   * RÈGLE: Un SP peut uniquement annuler ses propres entrées d'EDT
   */
  async annulerSeance(tid: string, seanceId: string, motif: string, userId: string, userRole: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const seance = await this.emploiDuTempsRepo.findOne({ where: { id: seanceId } });
    if (!seance) throw new NotFoundException('Séance non trouvée');

    // Vérifier l'ownership - un secrétaire ne peut annuler que ses propres entrées
    // Les admins peuvent tout annuler
    if (!this.isAdmin(userRole) && seance.createdById && seance.createdById !== userId) {
      throw new ForbiddenException('Vous ne pouvez pas annuler une entrée créée par un autre secrétaire');
    }

    return this.emploiDuTempsRepo.save({
      ...seance,
      statut: 'annule',
      motifAnnulation: motif,
    });
  }

  /**
   * Récupère les salles disponibles pour un créneau
   */
  async getSallesDisponibles(tid: string, dateSeance: Date, heureDebut: string, heureFin: string, capaciteMinimale?: number) {
    await this.tenantConnection.setTenantSchema(tid);

    // Récupérer toutes les salles actives
    const where: any = { disponible: true };
    if (capaciteMinimale) {
      where.capacite = { $gte: capaciteMinimale };
    }

    const salles = await this.salleRepo.find({ where });

    // Récupérer les salles occupées à ce créneau
    const sallesOccupees = await this.emploiDuTempsRepo.createQueryBuilder('edt')
      .select('edt.salle_id', 'salleId')
      .where('edt.date_seance = :dateSeance', { dateSeance })
      .andWhere('edt.statut != :statutAnnule', { statutAnnule: 'annule' })
      .andWhere(
        `(edt.heure_debut < :heureFin AND edt.heure_fin > :heureDebut)`,
        { heureDebut, heureFin }
      )
      .getRawMany();

    const sallesOccupeesIds = sallesOccupees.map(s => s.salleId);

    // Filtrer les salles disponibles
    return salles.filter(s => !sallesOccupeesIds.includes(s.id));
  }

  // ==================== GESTION DES INSCRIPTIONS ====================

  /**
   * Inscrit un étudiant dans un parcours
   */
  async inscrireEtudiant(tid: string, dto: CreateInscriptionDto, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    // Vérifier si l'étudiant existe
    const etudiant = await this.etudiantRepo.findOne({ where: { id: dto.etudiantId } });
    if (!etudiant) throw new NotFoundException('Étudiant non trouvé');

    // Vérifier si une inscription existe déjà pour cette année académique
    const existingInscription = await this.inscriptionRepo.findOne({
      where: {
        etudiantId: dto.etudiantId,
        anneeAcademiqueId: dto.anneeAcademiqueId,
      },
    });

    if (existingInscription) {
      throw new ConflictException('L\'étudiant est déjà inscrit pour cette année académique');
    }

    const inscription = this.inscriptionRepo.create({
      ...dto,
      typeInscription: dto.typeInscription || 'premiere',
      statut: 'en_attente',
      valideePar: userId,
      dateInscription: new Date(),
    });

    return this.inscriptionRepo.save(inscription);
  }

  /**
   * Réinscrit un étudiant (année suivante)
   */
  async reinscrireEtudiant(tid: string, inscriptionId: string, anneeAcademiqueId: string, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const oldInscription = await this.inscriptionRepo.findOne({ where: { id: inscriptionId } });
    if (!oldInscription) throw new NotFoundException('Inscription précédente non trouvée');

    // Vérifier si déjà réinscrit
    const existingReinscription = await this.inscriptionRepo.findOne({
      where: {
        etudiantId: oldInscription.etudiantId,
        anneeAcademiqueId,
      },
    });

    if (existingReinscription) {
      throw new ConflictException('Réinscription déjà effectuée pour cette année académique');
    }

    // Créer la nouvelle inscription
    const nouvelleInscription = this.inscriptionRepo.create({
      etudiantId: oldInscription.etudiantId,
      parcoursId: oldInscription.parcoursId,
      anneeAcademiqueId,
      anneeNiveau: oldInscription.anneeNiveau + 1,
      typeInscription: 'reinscription',
      statut: 'en_attente',
      valideePar: userId,
      dateInscription: new Date(),
    });

    return this.inscriptionRepo.save(nouvelleInscription);
  }

  /**
   * Récupère les inscriptions par parcours
   */
  async getInscriptions(tid: string, parcoursId: string, anneeAcademiqueId?: string, userId?: string, userRole?: string) {
    await this.tenantConnection.setTenantSchema(tid);

    // Vérifier l'accès au parcours pour les secrétaires
    if (userId && userRole && !this.isAdmin(userRole)) {
      const accessibleParcours = await this.getSecretaireParcoursIds(tid, userId);
      if (!accessibleParcours.includes(parcoursId)) {
        throw new BadRequestException('Vous n\'avez pas accès à ce parcours');
      }
    }

    const where: any = { parcoursId };
    if (anneeAcademiqueId) where.anneeAcademiqueId = anneeAcademiqueId;

    const inscriptions = await this.inscriptionRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });

    // Enrichir avec les données étudiants
    const inscriptionsEnrichies = await Promise.all(
      inscriptions.map(async (inscription) => {
        const etudiant = await this.etudiantRepo.findOne({
          where: { id: inscription.etudiantId },
        });
        return { ...inscription, etudiant };
      })
    );

    return inscriptionsEnrichies;
  }

  // ==================== GESTION DES ABSENCES ====================

  /**
   * Déclare une absence d'enseignant
   */
  async declarerAbsence(tid: string, dto: CreateAbsenceDto, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const absence = this.absenceRepo.create({
      ...dto,
      statut: 'declaree',
      estJustifiee: false,
      declareePar: userId,
    });

    // Si une séance est précisée, l'annuler
    // Note: Passage du rôle 'system' car c'est une annulation automatique suite à absence
    if (dto.seanceId) {
      await this.annulerSeance(tid, dto.seanceId, `Absence enseignant: ${dto.motif}`, userId, 'system');
    }

    return this.absenceRepo.save(absence);
  }

  /**
   * Valide ou refuse une absence
   */
  async validerAbsence(tid: string, absenceId: string, validee: boolean, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const absence = await this.absenceRepo.findOne({ where: { id: absenceId } });
    if (!absence) throw new NotFoundException('Absence non trouvée');

    return this.absenceRepo.save({
      ...absence,
      statut: validee ? 'validee' : 'refusee',
      valideePar: userId,
      dateValidation: new Date(),
      estJustifiee: validee,
    });
  }

  /**
   * Récupère les absences d'un enseignant ou toutes les absences
   */
  async getAbsences(tid: string, enseignantId?: string, statut?: string, userId?: string, userRole?: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const where: any = {};
    if (enseignantId) where.enseignantId = enseignantId;
    if (statut) where.statut = statut;

    const absences = await this.absenceRepo.find({
      where,
      order: { dateAbsence: 'DESC' },
    });

    // Filtrer par parcours pour les secrétaires
    let absencesFiltrees = absences;
    if (userId && userRole && !this.isAdmin(userRole)) {
      const accessibleParcoursIds = await this.getSecretaireParcoursIds(tid, userId);
      
      // Filtrer les absences liées aux affectations des parcours accessibles
      const ues = await this.ueRepo.find({ where: { parcoursId: In(accessibleParcoursIds) } });
      const ueIds = ues.map(ue => ue.id);
      
      if (ueIds.length > 0) {
        const affectations = await this.affectationRepo.find({ where: { ueId: In(ueIds) } });
        const enseignantIdsAccessibles = [...new Set(affectations.map(a => a.enseignantId))];
        absencesFiltrees = absences.filter(a => enseignantIdsAccessibles.includes(a.enseignantId));
      } else {
        absencesFiltrees = [];
      }
    }

    // Enrichir avec les données
    const absencesEnrichies = await Promise.all(
      absencesFiltrees.map(async (absence) => {
        const enseignant = await this.enseignantRepo.findOne({
          where: { id: absence.enseignantId },
        });
        return { ...absence, enseignant };
      })
    );

    return absencesEnrichies;
  }

  /**
   * Planifie un rattrapage pour une absence
   */
  async planifierRattrapage(tid: string, dto: CreateRattrapageDto, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    // Vérifier l'absence
    const absence = await this.absenceRepo.findOne({ where: { id: dto.absenceId } });
    if (!absence) throw new NotFoundException('Absence non trouvée');

    // Vérifier les conflits de salle
    const conflits = await this.emploiDuTempsRepo.createQueryBuilder('edt')
      .where('edt.salle_id = :salleId', { salleId: dto.salleId })
      .andWhere('edt.date_seance = :dateRattrapage', { dateRattrapage: dto.dateRattrapage })
      .andWhere(
        `(edt.heure_debut < :heureFin AND edt.heure_fin > :heureDebut)`,
        { heureDebut: dto.heureDebut, heureFin: dto.heureFin }
      )
      .getMany();

    if (conflits.length > 0) {
      throw new ConflictException('La salle est déjà occupée à ce créneau');
    }

    const rattrapage = this.rattrapageRepo.create({
      ...dto,
      statut: 'planifie',
      planifiePar: userId,
    });

    return this.rattrapageRepo.save(rattrapage);
  }

  /**
   * Récupère les rattrapages
   */
  async getRattrapages(tid: string, absenceId?: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const where: any = {};
    if (absenceId) where.absenceId = absenceId;

    const rattrapages = await this.rattrapageRepo.find({
      where,
      order: { dateRattrapage: 'ASC' },
    });

    // Enrichir
    const rattrapagesEnrichis = await Promise.all(
      rattrapages.map(async (r) => {
        const salle = r.salleId ? await this.salleRepo.findOne({ where: { id: r.salleId } }) : null;
        const remplaceur = r.remplaceurId
          ? await this.enseignantRepo.findOne({ where: { id: r.remplaceurId } })
          : null;
        return { ...r, salle, remplaceur };
      })
    );

    return rattrapagesEnrichis;
  }

  // ==================== GESTION DES PRÉSENCES ÉTUDIANTS ====================

  /**
   * Saisit une présence/absence manuellement
   */
  async saisirPresence(tid: string, etudiantId: string, seanceId: string, statut: string, userId: string, justificatifUrl?: string) {
    await this.tenantConnection.setTenantSchema(tid);

    // Vérifier si une présence existe déjà
    let presence = await this.presenceRepo.findOne({
      where: { etudiantId, seanceId },
    });

    if (presence) {
      // Mettre à jour
      presence.statut = statut;
      presence.saisiPar = userId;
      if (justificatifUrl) {
        presence.justificatifUrl = justificatifUrl;
        presence.justifie = true;
      }
      return this.presenceRepo.save(presence);
    }

    // Créer une nouvelle présence
    presence = this.presenceRepo.create({
      etudiantId,
      seanceId,
      statut,
      modePointage: 'manuel',
      saisiPar: userId,
      justificatifUrl,
      justifie: !!justificatifUrl,
    });

    return this.presenceRepo.save(presence);
  }

  /**
   * Justifie une absence étudiant
   */
  async justifierAbsence(tid: string, presenceId: string, justificatifUrl: string, motif: string, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const presence = await this.presenceRepo.findOne({ where: { id: presenceId } });
    if (!presence) throw new NotFoundException('Enregistrement de présence non trouvé');

    return this.presenceRepo.save({
      ...presence,
      justifie: true,
      justificatifUrl,
      motif,
      validePar: userId,
    });
  }

  /**
   * Récupère les absences à justifier (non justifiées)
   */
  async getAbsencesAJustifier(tid: string, parcoursId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    // Récupérer les inscriptions du parcours
    const inscriptions = await this.inscriptionRepo.find({ where: { parcoursId } });
    const etudiantIds = inscriptions.map(i => i.etudiantId);
    if (etudiantIds.length === 0) return [];

    // Récupérer les présences non justifiées
    const presences = await this.presenceRepo.find({
      where: {
        statut: 'absent',
        justifie: false,
      },
      order: { createdAt: 'DESC' },
    });
    
    // Filtrer manuellement par étudiants du parcours
    const presencesFiltrees = presences.filter(p => etudiantIds.includes(p.etudiantId));

    // Enrichir
    const presencesEnrichies = await Promise.all(
      presencesFiltrees.map(async (p) => {
        const etudiant = await this.etudiantRepo.findOne({ where: { id: p.etudiantId } });
        const seance = await this.emploiDuTempsRepo.findOne({ where: { id: p.seanceId } });
        return { ...p, etudiant, seance };
      })
    );

    return presencesEnrichies;
  }

  // ==================== NOTES DÉROGATOIRES ====================

  /**
   * Saisit une note dérogatoire (cas particuliers)
   */
  async saisirNoteDerogatoire(tid: string, dto: CreateNoteDerogatoireDto, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const note = this.noteDerogatoireRepo.create({
      ...dto,
      estDerogatoire: true,
      statut: 'proposee',
      saisiePar: userId,
      typeDerogation: dto.typeDerogation || 'cas_particulier',
    });

    return this.noteDerogatoireRepo.save(note);
  }

  /**
   * Soumet les notes dérogatoires à la scolarité centrale
   */
  async soumettreNotesScolarite(tid: string, noteIds: string[], userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const notes = await this.noteDerogatoireRepo.findByIds(noteIds);

    const updates = notes.map(note =>
      this.noteDerogatoireRepo.save({
        ...note,
        soumisAScolarite: true,
        statut: 'soumise',
      })
    );

    return Promise.all(updates);
  }

  /**
   * Récupère les notes dérogatoires
   */
  async getNotesDerogatoires(tid: string, statut?: string, soumisAScolarite?: boolean, userId?: string, userRole?: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const where: any = {};
    if (statut) where.statut = statut;
    if (soumisAScolarite !== undefined) where.soumisAScolarite = soumisAScolarite;

    const notes = await this.noteDerogatoireRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });

    // Filtrer par parcours pour les secrétaires
    let notesFiltrees = notes;
    if (userId && userRole && !this.isAdmin(userRole)) {
      const accessibleParcoursIds = await this.getSecretaireParcoursIds(tid, userId);
      
      // Récupérer les étudiants des parcours accessibles
      const inscriptions = await this.inscriptionRepo.find({
        where: { parcoursId: In(accessibleParcoursIds) }
      });
      const etudiantIdsAccessibles = inscriptions.map(i => i.etudiantId);
      
      notesFiltrees = notes.filter(n => etudiantIdsAccessibles.includes(n.etudiantId));
    }

    // Enrichir
    const notesEnrichies = await Promise.all(
      notesFiltrees.map(async (n) => {
        const etudiant = await this.etudiantRepo.findOne({ where: { id: n.etudiantId } });
        const ue = n.ueId ? await this.ueRepo.findOne({ where: { id: n.ueId } }) : null;
        const ec = n.ecId ? await this.ecRepo.findOne({ where: { id: n.ecId } }) : null;
        return { ...n, etudiant, ue, ec };
      })
    );

    return notesEnrichies;
  }

  // ==================== CONVOCATIONS ====================

  /**
   * Génère des convocations pour une session d'examen
   */
  async genererConvocationsExamen(tid: string, sessionExamenId: string, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    // Récupérer la session d'examen
    const session = await this.sessionExamenRepo.findOne({ where: { id: sessionExamenId } });
    if (!session) throw new NotFoundException('Session d\'examen non trouvée');

    // Récupérer les étudiants concernés
    const inscriptions = await this.inscriptionRepo.find({
      where: { anneeAcademiqueId: session.anneeAcademiqueId },
    });

    const convocations: Convocation[] = [];

    for (const inscription of inscriptions) {
      const convocation = this.convocationRepo.create({
        etudiantId: inscription.etudiantId,
        sessionExamenId,
        type: 'examen',
        libelle: `Convocation à la session d'examen: ${session.libelle}`,
        message: `Vous êtes convoqué(e) à la session d'examen du ${session.dateDebut} au ${session.dateFin}`,
        dateConvocation: session.dateDebut,
        statut: 'brouillon',
        generePar: userId,
      });

      convocations.push(await this.convocationRepo.save(convocation));
    }

    return convocations;
  }

  /**
   * Crée une convocation individuelle
   */
  async creerConvocation(tid: string, dto: CreateConvocationDto, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const convocation = this.convocationRepo.create({
      ...dto,
      statut: 'brouillon',
      generePar: userId,
    });

    return this.convocationRepo.save(convocation);
  }

  /**
   * Envoie les convocations (change le statut)
   */
  async envoyerConvocations(tid: string, convocationIds: string[], userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const convocations = await this.convocationRepo.findByIds(convocationIds);

    const updates = convocations.map(convocation =>
      this.convocationRepo.save({
        ...convocation,
        statut: 'envoyee',
        dateEnvoi: new Date(),
      })
    );

    return Promise.all(updates);
  }

  /**
   * Récupère les convocations
   */
  async getConvocations(tid: string, etudiantId?: string, statut?: string) {
    await this.tenantConnection.setTenantSchema(tid);
    
    // Temporarily return empty array until Convocation entity is properly registered
    console.warn(`[SecretaireService] Convocation table not available in tenant ${tid}`);
    return [];
  }

  // ==================== DOSSIERS ÉTUDIANTS ====================

  /**
   * Crée un dossier étudiant
   */
  async creerDossier(tid: string, etudiantId: string, typeDocument: string, libelle: string, fichierUrl: string, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    
    // Temporarily throw error until DossierEtudiant entity is properly registered
    throw new BadRequestException('DossierEtudiant repository not available - feature not implemented yet');
  }

  /**
   * Archive un dossier
   */
  async archiverDossier(tid: string, dossierId: string, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    
    // Temporarily throw error until DossierEtudiant entity is properly registered
    throw new BadRequestException('DossierEtudiant repository not available - feature not implemented yet');
  }

  /**
   * Récupère les dossiers d'un étudiant
   */
  async getDossiers(tid: string, etudiantId?: string, estArchive?: boolean) {
    await this.tenantConnection.setTenantSchema(tid);
    
    // Temporarily return empty array until DossierEtudiant entity is properly registered
    console.warn(`[SecretaireService] DossierEtudiant table not available in tenant ${tid}`);
    return [];
  }

  // ==================== DEMANDES ÉTUDIANTS ====================

  /**
   * Soumet une demande étudiante
   */
  async soumettreDemande(tid: string, etudiantId: string, typeDemande: string, description: string, userId: string, pieceJointeUrl?: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const demande = this.demandeRepo.create({
      etudiantId,
      typeDemande,
      description,
      pieceJointeUrl,
      dateSoumission: new Date(),
      statut: 'soumise',
    });

    return this.demandeRepo.save(demande);
  }

  /**
   * Traite une demande étudiante
   */
  async traiterDemande(tid: string, demandeId: string, acceptee: boolean, reponse: string, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const demande = await this.demandeRepo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException('Demande non trouvée');

    return this.demandeRepo.save({
      ...demande,
      statut: acceptee ? 'acceptee' : 'refusee',
      reponse,
      traitePar: userId,
      dateTraitement: new Date(),
    });
  }

  /**
   * Récupère les demandes
   */
  async getDemandes(tid: string, statut?: string, userId?: string, userRole?: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const where: any = {};
    if (statut) where.statut = statut;

    const demandes = await this.demandeRepo.find({
      where,
      order: { dateSoumission: 'DESC' },
    });

    // Filtrer par parcours pour les secrétaires
    let demandesFiltrees = demandes;
    if (userId && userRole && !this.isAdmin(userRole)) {
      const accessibleParcoursIds = await this.getSecretaireParcoursIds(tid, userId);
      
      // Récupérer les étudiants des parcours accessibles
      const inscriptions = await this.inscriptionRepo.find({
        where: { parcoursId: In(accessibleParcoursIds) }
      });
      const etudiantIdsAccessibles = inscriptions.map(i => i.etudiantId);
      
      demandesFiltrees = demandes.filter(d => etudiantIdsAccessibles.includes(d.etudiantId));
    }

    // Enrichir
    const demandesEnrichies = await Promise.all(
      demandesFiltrees.map(async (d) => {
        const etudiant = await this.etudiantRepo.findOne({ where: { id: d.etudiantId } });
        return { ...d, etudiant };
      })
    );

    return demandesEnrichies;
  }

  // ==================== TRANSMISSION PV À LA SCOLARITÉ CENTRALE ====================

  /**
   * Récupère les PV de jury du parcours prêts à être transmis
   */
  async getPVsATransmettre(tid: string, parcoursId: string, anneeAcademiqueId?: string, userId?: string, userRole?: string) {
    await this.tenantConnection.setTenantSchema(tid);

    // Vérifier l'accès au parcours pour les secrétaires
    if (userId && userRole && !this.isAdmin(userRole)) {
      const accessibleParcours = await this.getSecretaireParcoursIds(tid, userId);
      if (!accessibleParcours.includes(parcoursId)) {
        throw new BadRequestException('Vous n\'avez pas accès à ce parcours');
      }
    }

    const where: any = {
      parcoursId,
      statut: 'valide', // Seulement les PV validés
      transmisAScolarite: false, // Seulement ceux non transmis
    };
    if (anneeAcademiqueId) where.anneeAcademiqueId = anneeAcademiqueId;

    const pvs = await this.pvRepo.find({
      where,
      order: { dateDeliberation: 'DESC' },
    });

    return pvs;
  }

  /**
   * Transmet un PV de jury à la scolarité centrale
   */
  async transmettrePVAScolarite(tid: string, pvId: string, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const pv = await this.pvRepo.findOne({ where: { id: pvId } });
    if (!pv) throw new NotFoundException('Procès-verbal non trouvé');

    if (pv.statut !== 'valide') {
      throw new BadRequestException('Le PV doit être validé avant transmission');
    }

    // Marquer comme transmis à la scolarité
    const pvUpdated = await this.pvRepo.save({
      ...pv,
      statut: 'transmis_scolarite',
      transmisAScolarite: true,
      dateTransmissionScolarite: new Date(),
      transmisPar: userId,
    });

    return {
      message: 'PV transmis à la scolarité centrale avec succès',
      pv: pvUpdated,
    };
  }

  /**
   * Transmet plusieurs PV à la scolarité centrale (batch)
   */
  async transmettrePVsBatch(tid: string, pvIds: string[], userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const results = [];
    for (const pvId of pvIds) {
      try {
        const result = await this.transmettrePVAScolarite(tid, pvId, userId);
        results.push({ pvId, success: true, message: result.message });
      } catch (error: any) {
        results.push({ pvId, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    return {
      message: `${successCount}/${pvIds.length} PV transmis à la scolarité centrale`,
      details: results,
    };
  }

  /**
   * Récupère l'historique des PV transmis à la scolarité
   */
  async getPVsTransmis(tid: string, parcoursId?: string, anneeAcademiqueId?: string, userId?: string, userRole?: string) {
    await this.tenantConnection.setTenantSchema(tid);

    // Filtrer par parcours accessibles pour les secrétaires
    let parcoursIds: string[] = [];
    if (userId && userRole && !this.isAdmin(userRole)) {
      parcoursIds = await this.getSecretaireParcoursIds(tid, userId);
      if (parcoursId && !parcoursIds.includes(parcoursId)) {
        throw new BadRequestException('Vous n\'avez pas accès à ce parcours');
      }
      if (parcoursId) {
        parcoursIds = [parcoursId];
      }
    } else if (parcoursId) {
      parcoursIds = [parcoursId];
    }

    const where: any = {
      transmisAScolarite: true,
      statut: In(['valide', 'transmis_scolarite'])
    };
    if (parcoursIds.length > 0) where.parcoursId = In(parcoursIds);
    if (anneeAcademiqueId) where.anneeAcademiqueId = anneeAcademiqueId;

    return this.pvRepo.find({
      where,
      order: { dateTransmissionScolarite: 'DESC' },
    });
  }

  // ==================== GESTION DES PV DE JURY ====================

  async getPVs(tid: string, parcoursId?: string, anneeAcademiqueId?: string, statut?: string, userId?: string, userRole?: string) {
    await this.tenantConnection.setTenantSchema(tid);

    // Filtrer par parcours accessibles pour les secrétaires
    let parcoursIds: string[] = [];
    if (userId && userRole && !this.isAdmin(userRole)) {
      parcoursIds = await this.getSecretaireParcoursIds(tid, userId);
      if (parcoursId && !parcoursIds.includes(parcoursId)) {
        throw new BadRequestException('Vous n\'avez pas accès à ce parcours');
      }
      if (parcoursId) {
        parcoursIds = [parcoursId];
      }
    } else if (parcoursId) {
      parcoursIds = [parcoursId];
    }

    const where: any = {};
    if (parcoursIds.length > 0) where.parcoursId = In(parcoursIds);
    if (anneeAcademiqueId) where.anneeAcademiqueId = anneeAcademiqueId;
    if (statut) where.statut = statut;

    return this.pvRepo.find({
      where,
      order: { dateDeliberation: 'DESC' },
    });
  }

  async getPVById(tid: string, pvId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const pv = await this.pvRepo.findOne({ where: { id: pvId } });
    if (!pv) {
      throw new NotFoundException('Procès-verbal non trouvé');
    }

    return pv;
  }

  async createPV(tid: string, createPvDto: any, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const pv = this.pvRepo.create({
      ...createPvDto,
      creePar: userId,
      statut: 'brouillon',
      dateCreation: new Date(),
    });

    return this.pvRepo.save(pv);
  }

  async updatePV(tid: string, pvId: string, updatePvDto: any, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const pv = await this.pvRepo.findOne({ where: { id: pvId } });
    if (!pv) {
      throw new NotFoundException('Procès-verbal non trouvé');
    }

    return this.pvRepo.save({
      ...pv,
      ...updatePvDto,
      modifiePar: userId,
      dateModification: new Date(),
    });
  }

  async validerPV(tid: string, pvId: string, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const pv = await this.pvRepo.findOne({ where: { id: pvId } });
    if (!pv) {
      throw new NotFoundException('Procès-verbal non trouvé');
    }

    if (pv.statut === 'valide') {
      throw new BadRequestException('Ce PV est déjà validé');
    }

    return this.pvRepo.save({
      ...pv,
      statut: 'valide',
      validePar: userId,
      dateValidation: new Date(),
    });
  }

  async deletePV(tid: string, pvId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const pv = await this.pvRepo.findOne({ where: { id: pvId } });
    if (!pv) {
      throw new NotFoundException('Procès-verbal non trouvé');
    }

    if (pv.statut === 'valide') {
      throw new BadRequestException('Impossible de supprimer un PV validé');
    }

    return this.pvRepo.remove(pv);
  }

  // ==================== GESTION SECRÉTAIRE PAR PARCOURS ====================

  /**
   * Assigne un secrétaire à un parcours spécifique via la table secretaire_parcours (Admin uniquement)
   */
  async assignSecretaireToParcours(tid: string, parcoursId: string, secretaireId: string, userId: string, userRole: string) {
    await this.tenantConnection.setTenantSchema(tid);

    // RÈGLE: Seuls les admins peuvent assigner des secrétaires
    if (!this.isAdmin(userRole)) {
      throw new ForbiddenException('Seuls les administrateurs peuvent assigner des secrétaires aux parcours');
    }

    // Vérifier que le parcours existe
    const parcours = await this.parcoursRepo.findOne({ where: { id: parcoursId } });
    if (!parcours) {
      throw new NotFoundException('Parcours non trouvé');
    }

    // Vérifier si une affectation existe déjà
    const existingAffectation = await this.secretaireParcoursRepo.findOne({
      where: { secretaireId, parcoursId },
    });

    if (existingAffectation) {
      // Réactiver l'affectation si elle existe mais est inactive
      if (!existingAffectation.actif) {
        await this.secretaireParcoursRepo.save({
          ...existingAffectation,
          actif: true,
          assignedAt: new Date(),
          assignedBy: userId,
        });
      }
    } else {
      // Créer une nouvelle affectation
      const affectation = this.secretaireParcoursRepo.create({
        secretaireId,
        parcoursId,
        assignedAt: new Date(),
        assignedBy: userId,
        actif: true,
      });
      await this.secretaireParcoursRepo.save(affectation);
    }

    return {
      message: 'Secrétaire assigné au parcours avec succès',
      parcoursId,
      secretaireId,
    };
  }

  /**
   * Retire un secrétaire d'un parcours (Admin uniquement)
   */
  async removeSecretaireFromParcours(tid: string, parcoursId: string, secretaireId: string, userId: string, userRole: string) {
    await this.tenantConnection.setTenantSchema(tid);

    // RÈGLE: Seuls les admins peuvent retirer des secrétaires
    if (!this.isAdmin(userRole)) {
      throw new ForbiddenException('Seuls les administrateurs peuvent retirer des secrétaires des parcours');
    }

    // Vérifier que l'affectation existe
    const affectation = await this.secretaireParcoursRepo.findOne({
      where: { secretaireId, parcoursId, actif: true },
    });

    if (!affectation) {
      throw new BadRequestException('Ce secrétaire n\'est pas affecté à ce parcours');
    }

    // Désactiver l'affectation (soft delete)
    await this.secretaireParcoursRepo.save({
      ...affectation,
      actif: false,
    });

    return {
      message: 'Secrétaire retiré du parcours avec succès',
      parcoursId,
      secretaireId,
    };
  }

  /**
   * Récupère les parcours assignés à un secrétaire via la table secretaire_parcours
   */
  async getParcoursBySecretaire(tid: string, secretaireId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const affectations = await this.secretaireParcoursRepo.find({
      where: { secretaireId, actif: true },
      relations: ['parcours'],
      order: { createdAt: 'DESC' },
    });

    return affectations.map(a => a.parcours).filter(p => p);
  }

  /**
   * Récupère le secrétaire assigné à un parcours
   */
  async getSecretaireByParcours(tid: string, parcoursId: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const parcours = await this.parcoursRepo.findOne({ where: { id: parcoursId } });
    if (!parcours) {
      throw new NotFoundException('Parcours non trouvé');
    }

    return {
      parcoursId,
      secretaireId: parcours.secretaireId,
    };
  }

  /**
   * @deprecated Utiliser canAccessParcoursViaTable à la place
   * Vérifie si un secrétaire a accès à un parcours spécifique
   */
  async canAccessParcours(tid: string, secretaireId: string, parcoursId: string): Promise<boolean> {
    return this.canAccessParcoursViaTable(tid, secretaireId, parcoursId);
  }

  /**
   * Récupère tous les parcours avec leur secrétaire assigné (Admin uniquement)
   */
  async getAllParcoursWithSecretaires(tid: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const parcours = await this.parcoursRepo.find({
      order: { nom: 'ASC' },
    });

    return parcours.map(p => ({
      id: p.id,
      code: p.code,
      nom: p.nom,
      niveau: p.niveau,
      secretaireId: p.secretaireId,
      actif: p.actif,
    }));
  }

  // ==================== UTILITAIRES DE FILTRAGE PAR PARCOURS ====================

  /**
   * Récupère les IDs des parcours assignés à un secrétaire via la table secretaire_parcours
   */
  async getSecretaireParcoursIds(tid: string, secretaireId: string): Promise<string[]> {
    await this.tenantConnection.setTenantSchema(tid);
    const affectations = await this.secretaireParcoursRepo.find({
      where: { secretaireId, actif: true },
      select: ['parcoursId'],
    });
    return affectations.map(a => a.parcoursId);
  }

  /**
   * Vérifie si un secrétaire a accès à un parcours spécifique via la table secretaire_parcours
   */
  async canAccessParcoursViaTable(tid: string, secretaireId: string, parcoursId: string): Promise<boolean> {
    await this.tenantConnection.setTenantSchema(tid);
    const affectation = await this.secretaireParcoursRepo.findOne({
      where: {
        secretaireId,
        parcoursId,
        actif: true,
      },
    });
    return !!affectation;
  }

  /**
   * Vérifie si un utilisateur est admin (peut voir tous les parcours)
   */
  isAdmin(role: string): boolean {
    return ['admin', 'resp_pedagogique', 'president', 'surveillant_general', 'scolarite'].includes(role);
  }

  // ==================== DASHBOARD SECRÉTAIRE ====================

  async getDashboardData(tid: string, parcoursId: string, userId: string, userRole: string) {
    await this.tenantConnection.setTenantSchema(tid);

    // Déterminer les parcours accessibles
    let accessibleParcoursIds: string[];
    if (this.isAdmin(userRole)) {
      // Admin peut spécifier un parcours ou voir tous
      accessibleParcoursIds = parcoursId ? [parcoursId] : (await this.parcoursRepo.find({ select: ['id'] })).map(p => p.id);
    } else {
      // Secrétaire ne voit que ses parcours assignés
      accessibleParcoursIds = await this.getSecretaireParcoursIds(tid, userId);
      if (parcoursId && !accessibleParcoursIds.includes(parcoursId)) {
        throw new BadRequestException('Vous n\'avez pas accès à ce parcours');
      }
      if (parcoursId) {
        accessibleParcoursIds = [parcoursId];
      }
    }

    // Si aucun parcours accessible, retourner des stats vides
    if (accessibleParcoursIds.length === 0) {
      return {
        nbInscrits: 0,
        absencesEnAttente: 0,
        absencesSansRattrapage: 0,
        absencesEtudiantsAJustifier: 0,
        convocationsEnBrouillon: 0,
        notesDerogatoiresAProposer: 0,
        demandesEnAttente: 0,
        mesParcours: [],
      };
    }

    // Récupérer l'année académique active
    const anneeActive = await this.anneeAcademiqueRepo.findOne({
      where: { active: true },
    });
    const anneeAcademiqueId = anneeActive?.id;

    // Statistiques inscriptions - filtrées par parcours accessibles
    const whereInscription: any = { parcoursId: In(accessibleParcoursIds) };
    if (anneeAcademiqueId) whereInscription.anneeAcademiqueId = anneeAcademiqueId;

    const inscriptions = await this.inscriptionRepo.find({ where: whereInscription });
    const nbInscrits = inscriptions.length;

    // Absences enseignants en attente de validation (global pour tous les parcours)
    const absencesEnAttente = await this.absenceRepo.count({
      where: { statut: 'declaree' },
    });

    // Rattrapages à planifier
    const absencesSansRattrapage = await this.absenceRepo
      .createQueryBuilder('abs')
      .leftJoin(Rattrapage, 'rat', 'rat.absence_id = abs.id')
      .where('abs.statut = :statut', { statut: 'validee' })
      .andWhere('rat.id IS NULL')
      .getCount();

    // Absences étudiants à justifier - filtrées par parcours accessibles
    const etudiantIds = inscriptions.map(i => i.etudiantId);
    let absencesEtudiantsAJustifier = 0;
    if (etudiantIds.length > 0) {
      const allPresences = await this.presenceRepo.find({
        where: {
          statut: 'absent',
          justifie: false,
        },
      });
      absencesEtudiantsAJustifier = allPresences.filter(p => etudiantIds.includes(p.etudiantId)).length;
    }

    // Convocations en brouillon - filtrées par étudiants des parcours accessibles
    let convocationsEnBrouillon = 0;
    if (etudiantIds.length > 0) {
      convocationsEnBrouillon = await this.convocationRepo.count({
        where: {
          statut: 'brouillon',
          etudiantId: In(etudiantIds),
        },
      });
    }

    // Notes dérogatoires non soumises - filtrées par étudiants des parcours accessibles
    let notesDerogatoiresAProposer = 0;
    if (etudiantIds.length > 0) {
      notesDerogatoiresAProposer = await this.noteDerogatoireRepo.count({
        where: {
          statut: 'proposee',
          etudiantId: In(etudiantIds),
        },
      });
    }

    // Demandes étudiants en attente - filtrées par étudiants des parcours accessibles
    let demandesEnAttente = 0;
    if (etudiantIds.length > 0) {
      demandesEnAttente = await this.demandeRepo.count({
        where: {
          statut: 'soumise',
          etudiantId: In(etudiantIds),
        },
      });
    }

    return {
      nbInscrits,
      absencesEnAttente,
      absencesSansRattrapage,
      absencesEtudiantsAJustifier,
      convocationsEnBrouillon,
      notesDerogatoiresAProposer,
      demandesEnAttente,
      mesParcours: accessibleParcoursIds,
    };
  }
}

// Made with Bob
