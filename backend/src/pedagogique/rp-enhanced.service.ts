import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  SujetExamen,
  ProcesVerbal,
  StageMemoire,
  StatistiqueParcours,
  ContenuCours,
  ReferentielCompetences,
  Soutenance,
} from './pedagogique.entities';
import {
  Parcours,
  UniteEnseignement,
  ElementConstitutif,
  Enseignant,
  AffectationCours,
  Inscription,
  Presence,
  Note,
  AnneeAcademique,
} from '../academic/academic.entities';
import { TenantConnectionService } from '../tenants/tenant-connection.service';

/**
 * DTOs pour la gestion des maquettes
 */
export interface CreateMaquetteDto {
  parcours: {
    code: string;
    nom: string;
    niveau: string;
    dureeAnnees?: number;
    description?: string;
    departementId: string;
  };
  unites: CreateUEDto[];
}

export interface CreateUEDto {
  code: string;
  intitule: string;
  creditsEcts?: number;
  coefficient?: number;
  volumeCm?: number;
  volumeTd?: number;
  volumeTp?: number;
  semestre: number;
  anneeNiveau: number;
  typeUe?: string;
  elementsConstitutifs?: CreateECDto[];
}

export interface CreateECDto {
  code: string;
  intitule: string;
  coefficient?: number;
}

export interface UpdateMaquetteDto {
  code?: string;
  nom?: string;
  niveau?: string;
  dureeAnnees?: number;
  description?: string;
  actif?: boolean;
}

export interface UpdateUEDto {
  code?: string;
  intitule?: string;
  creditsEcts?: number;
  coefficient?: number;
  volumeCm?: number;
  volumeTd?: number;
  volumeTp?: number;
  semestre?: number;
  anneeNiveau?: number;
  typeUe?: string;
  actif?: boolean;
}

export interface UpdateECDto {
  code?: string;
  intitule?: string;
  coefficient?: number;
  actif?: boolean;
}

/**
 * DTOs pour la gestion des affectations
 */
export interface CreateAffectationDto {
  enseignantId: string;
  ueId?: string;
  ecId?: string;
  anneeAcademiqueId: string;
  typeSeance?: string;
  volumePrevu?: number;
}

export interface UpdateAffectationDto {
  enseignantId?: string;
  typeSeance?: string;
  volumePrevu?: number;
  volumeRealise?: number;
}

export interface AffectationQueryDto {
  anneeAcademiqueId?: string;
  ueId?: string;
  ecId?: string;
  enseignantId?: string;
}

/**
 * Interface pour les statistiques de performance
 */
export interface PerformanceStats {
  parcoursId: string;
  anneeAcademiqueId: string;
  nbInscrits: number;
  nbPresents: number;
  tauxAssiduite: number;
  tauxReussite: number;
  moyenneGenerale: number;
  statsParUE: Array<{
    ueId: string;
    code: string;
    intitule: string;
    creditsECTS: number;
    moyenne: number;
    tauxReussite: number;
    nbEtudiants: number;
  }>;
}

/**
 * Service amélioré pour le Responsable Pédagogique
 * Gestion complète des maquettes, affectations et suivi des performances
 */
@Injectable()
export class RPEnhancedService {
  constructor(
    @InjectRepository(SujetExamen, 'tenant') private sujetRepo: Repository<SujetExamen>,
    @InjectRepository(ProcesVerbal, 'tenant') private pvRepo: Repository<ProcesVerbal>,
    @InjectRepository(StageMemoire, 'tenant') private stageRepo: Repository<StageMemoire>,
    @InjectRepository(StatistiqueParcours, 'tenant') private statRepo: Repository<StatistiqueParcours>,
    @InjectRepository(ContenuCours, 'tenant') private contenuRepo: Repository<ContenuCours>,
    @InjectRepository(ReferentielCompetences, 'tenant') private refCompRepo: Repository<ReferentielCompetences>,
    @InjectRepository(Soutenance, 'tenant') private soutenanceRepo: Repository<Soutenance>,
    @InjectRepository(Parcours, 'tenant') private parcoursRepo: Repository<Parcours>,
    @InjectRepository(UniteEnseignement, 'tenant') private ueRepo: Repository<UniteEnseignement>,
    @InjectRepository(ElementConstitutif, 'tenant') private ecRepo: Repository<ElementConstitutif>,
    @InjectRepository(Enseignant, 'tenant') private enseignantRepo: Repository<Enseignant>,
    @InjectRepository(AffectationCours, 'tenant') private affectationRepo: Repository<AffectationCours>,
    @InjectRepository(Inscription, 'tenant') private inscriptionRepo: Repository<Inscription>,
    @InjectRepository(Presence, 'tenant') private presenceRepo: Repository<Presence>,
    @InjectRepository(Note, 'tenant') private noteRepo: Repository<Note>,
    @InjectRepository(AnneeAcademique, 'tenant') private anneeRepo: Repository<AnneeAcademique>,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  // ==================== VÉRIFICATION D'ACCÈS RP ====================

  /**
   * Vérifie que l'utilisateur est bien le responsable du parcours
   */
  private async verifyRPAccess(tid: string, userId: string, parcoursId: string): Promise<Parcours> {
    await this.tenantConnection.setTenantSchema(tid);

    const parcours = await this.parcoursRepo.findOne({
      where: { id: parcoursId, actif: true }
    });

    if (!parcours) {
      throw new NotFoundException('Parcours non trouvé');
    }

    if (parcours.responsableId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à gérer ce parcours');
    }

    return parcours;
  }

  /**
   * Récupère les parcours dont l'utilisateur est responsable
   */
  async getMesParcours(tid: string, userId: string): Promise<Parcours[]> {
    try {
      await this.tenantConnection.setTenantSchema(tid);

      const parcours = await this.parcoursRepo.find({
        where: { responsableId: userId, actif: true },
        order: { nom: 'ASC' }
      });
      
      return parcours || [];
    } catch (error) {
      console.error('Error in getMesParcours:', error);
      // Return empty array instead of throwing to prevent frontend hanging
      return [];
    }

  }

  /**
   * Récupère les UE d'un parcours spécifique
   */
  async getUEsByParcours(tid: string, parcoursId: string): Promise<UniteEnseignement[]> {
    try {
      await this.tenantConnection.setTenantSchema(tid);

      const unites = await this.ueRepo.find({
        where: { parcoursId, actif: true },
        order: { semestre: 'ASC', code: 'ASC' }
      });
      
      return unites || [];
    } catch (error) {
      console.error('Error in getUEsByParcours:', error);
      return [];
    }
  }

  /**
   * Récupère tous les enseignants actifs
   */
  async getEnseignants(tid: string): Promise<Enseignant[]> {
    try {
      await this.tenantConnection.setTenantSchema(tid);
      
      const enseignants = await this.enseignantRepo.find({
        where: { actif: true },
        order: { nom: 'ASC', prenom: 'ASC' }
      });
      
      console.log(`[getEnseignants] Trouvé ${enseignants.length} enseignants actifs dans le schema ${this.tenantConnection.getCurrentSchema()}`);
      return enseignants || [];
    } catch (error) {
      console.error('Error in getEnseignants:', error);
      return [];
    }
  }

  // ==================== GESTION DES MAQUETTES ====================

  /**
   * Crée une maquette complète (parcours + UE + EC)
   */
  async createMaquette(tid: string, userId: string, dto: CreateMaquetteDto): Promise<any> {
    await this.tenantConnection.setTenantSchema(tid);

    // Vérifier l'unicité du code
    const existingParcours = await this.parcoursRepo.findOne({
      where: { code: dto.parcours.code }
    });

    if (existingParcours) {
      throw new BadRequestException(`Un parcours avec le code ${dto.parcours.code} existe déjà`);
    }

    // Créer le parcours
    const parcours = this.parcoursRepo.create({
      ...dto.parcours,
      responsableId: userId,
      actif: true,
    });
    const savedParcours = await this.parcoursRepo.save(parcours);

    // Créer les UE et leurs EC
    const savedUnites: UniteEnseignement[] = [];
    if (dto.unites && dto.unites.length > 0) {
      for (const ueDto of dto.unites) {
        const ue = this.ueRepo.create({
          ...ueDto,
          parcoursId: savedParcours.id,
          actif: true,
        });
        const savedUE = await this.ueRepo.save(ue);

        // Créer les EC pour cette UE
        if (ueDto.elementsConstitutifs && ueDto.elementsConstitutifs.length > 0) {
          const ecEntities = ueDto.elementsConstitutifs.map(ecDto =>
            this.ecRepo.create({
              ...ecDto,
              ueId: savedUE.id,
              actif: true,
            })
          );
          await this.ecRepo.save(ecEntities);
        }

        savedUnites.push(savedUE);
      }
    }

    return {
      message: 'Maquette créée avec succès',
      parcours: savedParcours,
      nbUnites: savedUnites.length,
    };
  }

  /**
   * Récupère toutes les maquettes avec leurs UE et EC
   * Optimisé pour éviter les N+1 queries
   */
  async getAllMaquettes(tid: string, userId: string): Promise<any[]> {
    try {
      await this.tenantConnection.setTenantSchema(tid);

      // 1. Récupérer tous les parcours du responsable
      const parcours = await this.parcoursRepo.find({
        where: { responsableId: userId, actif: true },
        order: { nom: 'ASC' }
      });

      if (!parcours || parcours.length === 0) {
        return [];
      }

      const parcoursIds = parcours.map(p => p.id);

      // 2. Récupérer toutes les UE de ces parcours en une seule requête
      const allUnites = await this.ueRepo.find({
        where: { parcoursId: In(parcoursIds), actif: true },
        order: { semestre: 'ASC', code: 'ASC' }
      });

      // 3. Récupérer tous les EC de ces UE en une seule requête
      const ueIds = allUnites.map(ue => ue.id);
      const allEcs = ueIds.length > 0
        ? await this.ecRepo.find({
            where: { ueId: In(ueIds), actif: true },
            order: { code: 'ASC' }
          })
        : [];

      // 4. Grouper les EC par UE
      const ecsByUe = new Map<string, typeof allEcs>();
      for (const ec of allEcs) {
        if (!ecsByUe.has(ec.ueId)) {
          ecsByUe.set(ec.ueId, []);
        }
        ecsByUe.get(ec.ueId)!.push(ec);
      }

      // 5. Grouper les UE par parcours
      const unitesByParcours = new Map<string, typeof allUnites>();
      for (const ue of allUnites) {
        if (!unitesByParcours.has(ue.parcoursId)) {
          unitesByParcours.set(ue.parcoursId, []);
        }
        const ueWithEcs = {
          ...ue,
          elementsConstitutifs: ecsByUe.get(ue.id) || []
        };
        unitesByParcours.get(ue.parcoursId)!.push(ueWithEcs as any);
      }

      // 6. Construire le résultat final
      const maquettes = parcours.map(p => {
        const unites = unitesByParcours.get(p.id) || [];
        return {
          ...p,
          unites,
          totalCreditsECTS: unites.reduce((sum, ue) => sum + (ue.creditsEcts || 0), 0),
          totalVolumeCM: unites.reduce((sum, ue) => sum + (ue.volumeCm || 0), 0),
          totalVolumeTD: unites.reduce((sum, ue) => sum + (ue.volumeTd || 0), 0),
          totalVolumeTP: unites.reduce((sum, ue) => sum + (ue.volumeTp || 0), 0),
        };
      });

      return maquettes;
    } catch (error) {
      console.error('Error in getAllMaquettes:', error);
      // Return empty array instead of throwing to prevent frontend hanging
      return [];
    }
  }

  /**
   * Récupère une maquette par ID avec détails complets
   */
  async getMaquetteById(tid: string, userId: string, parcoursId: string): Promise<any> {
    const parcours = await this.verifyRPAccess(tid, userId, parcoursId);

    const unites = await this.ueRepo.find({
      where: { parcoursId, actif: true },
      order: { semestre: 'ASC', code: 'ASC' }
    });

    const unitesWithEC = await Promise.all(
      unites.map(async (ue) => {
        const ecs = await this.ecRepo.find({
          where: { ueId: ue.id, actif: true },
          order: { code: 'ASC' }
        });
        return { ...ue, elementsConstitutifs: ecs };
      })
    );

    return {
      ...parcours,
      unites: unitesWithEC,
      totalCreditsECTS: unitesWithEC.reduce((sum, ue) => sum + (ue.creditsEcts || 0), 0),
      totalVolumeCM: unitesWithEC.reduce((sum, ue) => sum + (ue.volumeCm || 0), 0),
      totalVolumeTD: unitesWithEC.reduce((sum, ue) => sum + (ue.volumeTd || 0), 0),
      totalVolumeTP: unitesWithEC.reduce((sum, ue) => sum + (ue.volumeTp || 0), 0),
    };
  }

  /**
   * Met à jour une maquette (parcours)
   */
  async updateMaquette(tid: string, userId: string, parcoursId: string, dto: UpdateMaquetteDto): Promise<Parcours> {
    const parcours = await this.verifyRPAccess(tid, userId, parcoursId);

    const updated = await this.parcoursRepo.save({
      ...parcours,
      ...dto,
    });

    return updated;
  }

  /**
   * Supprime une maquette (désactivation logique)
   */
  async deleteMaquette(tid: string, userId: string, parcoursId: string): Promise<{ message: string }> {
    const parcours = await this.verifyRPAccess(tid, userId, parcoursId);

    await this.parcoursRepo.save({
      ...parcours,
      actif: false,
    });

    return { message: 'Maquette désactivée avec succès' };
  }

  /**
   * Valide une maquette
   */
  async validerMaquette(tid: string, userId: string, parcoursId: string): Promise<{ message: string; parcours: Parcours }> {
    const parcours = await this.verifyRPAccess(tid, userId, parcoursId);

    // Vérifier que la maquette contient des UE
    const unites = await this.ueRepo.count({ where: { parcoursId } });
    if (unites === 0) {
      throw new BadRequestException('Impossible de valider une maquette sans unités d\'enseignement');
    }

    return {
      message: 'Maquette validée avec succès',
      parcours,
    };
  }

  // ==================== GESTION DES UE ====================

  /**
   * Ajoute une UE à une maquette
   */
  async createUE(tid: string, userId: string, parcoursId: string, dto: CreateUEDto): Promise<any> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const ue = this.ueRepo.create({
      ...dto,
      parcoursId,
      actif: true,
    });
    const savedUE = await this.ueRepo.save(ue);

    // Créer les EC si fournis
    let ecs: ElementConstitutif[] = [];
    if (dto.elementsConstitutifs && dto.elementsConstitutifs.length > 0) {
      const ecEntities = dto.elementsConstitutifs.map(ecDto =>
        this.ecRepo.create({
          ...ecDto,
          ueId: savedUE.id,
          actif: true,
        })
      );
      ecs = await this.ecRepo.save(ecEntities);
    }

    return {
      ...savedUE,
      elementsConstitutifs: ecs,
    };
  }

  /**
   * Met à jour une UE
   */
  async updateUE(tid: string, userId: string, parcoursId: string, ueId: string, dto: UpdateUEDto): Promise<UniteEnseignement> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const ue = await this.ueRepo.findOne({
      where: { id: ueId, parcoursId }
    });

    if (!ue) {
      throw new NotFoundException('Unité d\'enseignement non trouvée');
    }

    return this.ueRepo.save({ ...ue, ...dto });
  }

  /**
   * Supprime une UE (désactivation logique)
   */
  async deleteUE(tid: string, userId: string, parcoursId: string, ueId: string): Promise<{ message: string }> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const ue = await this.ueRepo.findOne({
      where: { id: ueId, parcoursId }
    });

    if (!ue) {
      throw new NotFoundException('Unité d\'enseignement non trouvée');
    }

    await this.ueRepo.save({ ...ue, actif: false });

    return { message: 'UE désactivée avec succès' };
  }

  // ==================== GESTION DES EC ====================

  /**
   * Ajoute un EC à une UE
   */
  async createEC(tid: string, userId: string, parcoursId: string, ueId: string, dto: CreateECDto): Promise<ElementConstitutif> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const ue = await this.ueRepo.findOne({
      where: { id: ueId, parcoursId }
    });

    if (!ue) {
      throw new NotFoundException('Unité d\'enseignement non trouvée');
    }

    const ec = this.ecRepo.create({
      ...dto,
      ueId,
      actif: true,
    });

    return this.ecRepo.save(ec);
  }

  /**
   * Met à jour un EC
   */
  async updateEC(tid: string, userId: string, parcoursId: string, ueId: string, ecId: string, dto: UpdateECDto): Promise<ElementConstitutif> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const ue = await this.ueRepo.findOne({
      where: { id: ueId, parcoursId }
    });

    if (!ue) {
      throw new NotFoundException('Unité d\'enseignement non trouvée');
    }

    const ec = await this.ecRepo.findOne({
      where: { id: ecId, ueId }
    });

    if (!ec) {
      throw new NotFoundException('Élément constitutif non trouvé');
    }

    return this.ecRepo.save({ ...ec, ...dto });
  }

  /**
   * Supprime un EC (désactivation logique)
   */
  async deleteEC(tid: string, userId: string, parcoursId: string, ueId: string, ecId: string): Promise<{ message: string }> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const ue = await this.ueRepo.findOne({
      where: { id: ueId, parcoursId }
    });

    if (!ue) {
      throw new NotFoundException('Unité d\'enseignement non trouvée');
    }

    const ec = await this.ecRepo.findOne({
      where: { id: ecId, ueId }
    });

    if (!ec) {
      throw new NotFoundException('Élément constitutif non trouvé');
    }

    await this.ecRepo.save({ ...ec, actif: false });

    return { message: 'EC désactivé avec succès' };
  }

  // ==================== GESTION DES AFFECTATIONS ====================

  /**
   * Crée une affectation enseignant-cours
   */
  async createAffectation(tid: string, userId: string, dto: CreateAffectationDto): Promise<AffectationCours> {
    await this.tenantConnection.setTenantSchema(tid);

    console.log('[CreateAffectation] Recherche enseignant:', dto.enseignantId);
    console.log('[CreateAffectation] Schema actuel:', this.tenantConnection.getCurrentSchema());

    // Vérifier l'enseignant
    const enseignant = await this.enseignantRepo.findOne({
      where: { id: dto.enseignantId, actif: true }
    });

    console.log('[CreateAffectation] Enseignant trouvé:', enseignant ? 'OUI' : 'NON');

    if (!enseignant) {
      // Essayer sans le filtre actif pour voir si l'enseignant existe
      const enseignantSansFiltre = await this.enseignantRepo.findOne({
        where: { id: dto.enseignantId }
      });
      console.log('[CreateAffectation] Enseignant sans filtre actif:', enseignantSansFiltre ? `OUI (actif=${enseignantSansFiltre.actif})` : 'NON');
      throw new NotFoundException('Enseignant non trouvé');
    }

    // Vérifier l'UE ou EC
    if (dto.ueId) {
      const ue = await this.ueRepo.findOne({ where: { id: dto.ueId, actif: true } });
      if (!ue) {
        throw new NotFoundException('Unité d\'enseignement non trouvée');
      }
    }

    if (dto.ecId) {
      const ec = await this.ecRepo.findOne({ where: { id: dto.ecId, actif: true } });
      if (!ec) {
        throw new NotFoundException('Élément constitutif non trouvé');
      }
    }

    // Vérifier l'année académique
    const annee = await this.anneeRepo.findOne({
      where: { id: dto.anneeAcademiqueId }
    });

    if (!annee) {
      throw new NotFoundException('Année académique non trouvée');
    }

    // Vérifier si une affectation similaire existe déjà
    const existingAffectation = await this.affectationRepo.findOne({
      where: {
        enseignantId: dto.enseignantId,
        ueId: dto.ueId || null,
        ecId: dto.ecId || null,
        anneeAcademiqueId: dto.anneeAcademiqueId,
        typeSeance: dto.typeSeance || 'CM',
      }
    });

    if (existingAffectation) {
      throw new BadRequestException('Une affectation similaire existe déjà pour cet enseignant');
    }

    const affectation = this.affectationRepo.create({
      ...dto,
      typeSeance: dto.typeSeance || 'CM',
      volumePrevu: dto.volumePrevu || 0,
      volumeRealise: 0,
      validePar: userId,
    });

    return this.affectationRepo.save(affectation);
  }

  /**
   * Récupère toutes les affectations avec filtres optionnels
   */
  async getAffectations(tid: string, userId: string, query: AffectationQueryDto): Promise<any[]> {
    await this.tenantConnection.setTenantSchema(tid);

    // Construire la requête avec les filtres
    const where: any = {};
    if (query.anneeAcademiqueId) where.anneeAcademiqueId = query.anneeAcademiqueId;
    if (query.ueId) where.ueId = query.ueId;
    if (query.ecId) where.ecId = query.ecId;
    if (query.enseignantId) where.enseignantId = query.enseignantId;

    const affectations = await this.affectationRepo.find({
      where,
      order: { createdAt: 'DESC' }
    });

    // Enrichir avec les informations détaillées
    const enrichedAffectations = await Promise.all(
      affectations.map(async (aff) => {
        const enseignant = await this.enseignantRepo.findOne({ where: { id: aff.enseignantId } });
        const ue = aff.ueId ? await this.ueRepo.findOne({ where: { id: aff.ueId } }) : null;
        const ec = aff.ecId ? await this.ecRepo.findOne({ where: { id: aff.ecId } }) : null;
        const annee = await this.anneeRepo.findOne({ where: { id: aff.anneeAcademiqueId } });

        return {
          ...aff,
          enseignant: enseignant ? { id: enseignant.id, nom: enseignant.nom, prenom: enseignant.prenom, grade: enseignant.grade } : null,
          uniteEnseignement: ue ? { id: ue.id, code: ue.code, intitule: ue.intitule, creditsEcts: ue.creditsEcts } : null,
          elementConstitutif: ec ? { id: ec.id, code: ec.code, intitule: ec.intitule } : null,
          anneeAcademique: annee ? { id: annee.id, libelle: annee.libelle } : null,
        };
      })
    );

    return enrichedAffectations;
  }

  /**
   * Met à jour une affectation
   */
  async updateAffectation(tid: string, userId: string, affectationId: string, dto: UpdateAffectationDto): Promise<AffectationCours> {
    await this.tenantConnection.setTenantSchema(tid);

    const affectation = await this.affectationRepo.findOne({
      where: { id: affectationId }
    });

    if (!affectation) {
      throw new NotFoundException('Affectation non trouvée');
    }

    return this.affectationRepo.save({ ...affectation, ...dto });
  }

  /**
   * Supprime une affectation
   */
  async deleteAffectation(tid: string, userId: string, affectationId: string): Promise<{ message: string }> {
    await this.tenantConnection.setTenantSchema(tid);

    const affectation = await this.affectationRepo.findOne({
      where: { id: affectationId }
    });

    if (!affectation) {
      throw new NotFoundException('Affectation non trouvée');
    }

    await this.affectationRepo.delete(affectationId);

    return { message: 'Affectation supprimée avec succès' };
  }

  /**
   * Récupère les affectations par parcours
   */
  async getAffectationsByParcours(tid: string, userId: string, parcoursId: string, anneeAcademiqueId?: string): Promise<any[]> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    // Récupérer les UE du parcours
    const ues = await this.ueRepo.find({ where: { parcoursId, actif: true } });
    const ueIds = ues.map(ue => ue.id);

    // Récupérer les EC de ces UE
    const ecs = await this.ecRepo.find({
      where: ueIds.length > 0 ? { ueId: In(ueIds) } : {}
    });
    const ecIds = ecs.map(ec => ec.id);

    // Construire la requête
    const where: any = {
      ...(anneeAcademiqueId && { anneeAcademiqueId }),
    };

    // Construire la requête dynamiquement pour gérer les tableaux vides
    let query = this.affectationRepo.createQueryBuilder('affectation');
    
    // Filtre par UE et EC avec gestion des tableaux vides
    if (ueIds.length > 0 && ecIds.length > 0) {
      query = query.where('(affectation.ueId IN (:...ueIds) OR affectation.ecId IN (:...ecIds))', { ueIds, ecIds });
    } else if (ueIds.length > 0) {
      query = query.where('affectation.ueId IN (:...ueIds)', { ueIds });
    } else if (ecIds.length > 0) {
      query = query.where('affectation.ecId IN (:...ecIds)', { ecIds });
    } else {
      // Si aucun UE ni EC, retourner tableau vide
      return [];
    }
    
    // Filtre par année académique
    if (anneeAcademiqueId) {
      query = query.andWhere('affectation.anneeAcademiqueId = :anneeId', { anneeId: anneeAcademiqueId });
    }
    
    const affectations = await query
      .orderBy('affectation.createdAt', 'DESC')
      .getMany();

    // Enrichir avec les détails
    const enrichedAffectations = await Promise.all(
      affectations.map(async (aff) => {
        const enseignant = await this.enseignantRepo.findOne({ where: { id: aff.enseignantId } });
        const ue = aff.ueId ? await this.ueRepo.findOne({ where: { id: aff.ueId } }) : null;
        const ec = aff.ecId ? await this.ecRepo.findOne({ where: { id: aff.ecId } }) : null;
        const annee = await this.anneeRepo.findOne({ where: { id: aff.anneeAcademiqueId } });

        return {
          ...aff,
          enseignant: enseignant ? { id: enseignant.id, nom: enseignant.nom, prenom: enseignant.prenom, grade: enseignant.grade } : null,
          uniteEnseignement: ue ? { id: ue.id, code: ue.code, intitule: ue.intitule } : null,
          elementConstitutif: ec ? { id: ec.id, code: ec.code, intitule: ec.intitule } : null,
          anneeAcademique: annee ? { id: annee.id, libelle: annee.libelle } : null,
        };
      })
    );

    return enrichedAffectations;
  }

  // ==================== SUIVI DES PERFORMANCES ====================

  /**
   * Calcule les statistiques de performance d'un parcours
   */
  async calculatePerformanceStats(
    tid: string,
    userId: string,
    parcoursId: string,
    anneeAcademiqueId: string
  ): Promise<PerformanceStats> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    // Récupérer les inscriptions validées
    const inscriptions = await this.inscriptionRepo.find({
      where: { parcoursId, anneeAcademiqueId, statut: 'validee' }
    });

    const nbInscrits = inscriptions.length;
    const etudiantIds = inscriptions.map(i => i.etudiantId);

    if (nbInscrits === 0) {
      return {
        parcoursId,
        anneeAcademiqueId,
        nbInscrits: 0,
        nbPresents: 0,
        tauxAssiduite: 0,
        tauxReussite: 0,
        moyenneGenerale: 0,
        statsParUE: [],
      };
    }

    // Calculer le taux d'assiduité
    const presences = await this.presenceRepo.find({
      where: { etudiantId: In(etudiantIds) }
    });

    const totalSeances = presences.length;
    const nbPresents = presences.filter(p => p.statut === 'present').length;
    const tauxAssiduite = totalSeances > 0 ? (nbPresents / totalSeances) * 100 : 0;

    // Calculer les statistiques des notes
    const notes = await this.noteRepo.find({
      where: { etudiantId: In(etudiantIds), verrouille: true }
    });

    const notesValides = notes.filter(n => n.valeur !== null && n.valeur !== undefined);
    const notesReussies = notesValides.filter(n => Number(n.valeur) >= 10);
    const tauxReussite = notesValides.length > 0 ? (notesReussies.length / notesValides.length) * 100 : 0;

    const sommeNotes = notesValides.reduce((sum, n) => sum + Number(n.valeur || 0), 0);
    const moyenneGenerale = notesValides.length > 0 ? sommeNotes / notesValides.length : 0;

    // Statistiques par UE
    const ues = await this.ueRepo.find({ where: { parcoursId, actif: true } });
    const statsParUE = await Promise.all(
      ues.map(async (ue) => {
        const notesUE = notes.filter(n => n.ueId === ue.id && n.verrouille);
        const notesUEValides = notesUE.filter(n => n.valeur !== null && n.valeur !== undefined);

        const moyenneUE = notesUEValides.length > 0
          ? notesUEValides.reduce((sum, n) => sum + Number(n.valeur || 0), 0) / notesUEValides.length
          : 0;

        const tauxReussiteUE = notesUEValides.length > 0
          ? (notesUEValides.filter(n => Number(n.valeur || 0) >= 10).length / notesUEValides.length) * 100
          : 0;

        return {
          ueId: ue.id,
          code: ue.code,
          intitule: ue.intitule,
          creditsECTS: ue.creditsEcts,
          moyenne: parseFloat(moyenneUE.toFixed(2)),
          tauxReussite: parseFloat(tauxReussiteUE.toFixed(2)),
          nbEtudiants: notesUEValides.length,
        };
      })
    );

    return {
      parcoursId,
      anneeAcademiqueId,
      nbInscrits,
      nbPresents,
      tauxAssiduite: parseFloat(tauxAssiduite.toFixed(2)),
      tauxReussite: parseFloat(tauxReussite.toFixed(2)),
      moyenneGenerale: parseFloat(moyenneGenerale.toFixed(2)),
      statsParUE,
    };
  }

  /**
   * Récupère le dashboard de performance complet
   */
  async getPerformanceDashboard(
    tid: string,
    userId: string,
    parcoursId: string,
    anneeAcademiqueId: string
  ): Promise<any> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const [parcours, performance, affectations, enseignants] = await Promise.all([
      this.parcoursRepo.findOne({ where: { id: parcoursId } }),
      this.calculatePerformanceStats(tid, userId, parcoursId, anneeAcademiqueId),
      this.getAffectationsByParcours(tid, userId, parcoursId, anneeAcademiqueId),
      this.enseignantRepo.find({ where: { actif: true } }),
    ]);

    // Calculer les statistiques par enseignant
    const statsParEnseignant = enseignants.map(ens => {
      const affsEnseignant = affectations.filter(a => a.enseignantId === ens.id);
      const totalVolume = affsEnseignant.reduce((sum, a) => sum + (a.volumePrevu || 0), 0);
      const volumeRealise = affsEnseignant.reduce((sum, a) => sum + (a.volumeRealise || 0), 0);
      const tauxRealisation = totalVolume > 0 ? (volumeRealise / totalVolume) * 100 : 0;

      return {
        enseignantId: ens.id,
        nom: ens.nom,
        prenom: ens.prenom,
        grade: ens.grade,
        nbCours: affsEnseignant.length,
        volumePrevu: totalVolume,
        volumeRealise,
        tauxRealisation: parseFloat(tauxRealisation.toFixed(2)),
      };
    }).filter(s => s.nbCours > 0);

    // Répartition par type de séance
    const repartitionParType = {
      CM: affectations.filter(a => a.typeSeance === 'CM').length,
      TD: affectations.filter(a => a.typeSeance === 'TD').length,
      TP: affectations.filter(a => a.typeSeance === 'TP').length,
      AUTRE: affectations.filter(a => !['CM', 'TD', 'TP'].includes(a.typeSeance)).length,
    };

    return {
      parcours,
      performance,
      affectations,
      statsEnseignants: statsParEnseignant,
      repartitionParType,
      totalHeuresPrevues: affectations.reduce((sum, a) => sum + (a.volumePrevu || 0), 0),
      totalHeuresRealisees: affectations.reduce((sum, a) => sum + (a.volumeRealise || 0), 0),
    };
  }

  // ==================== SUIVI ASSIDUITÉ ====================

  /**
   * Récupère le suivi d'assiduité détaillé par étudiant
   */
  async getSuiviAssiduiteDetaille(
    tid: string,
    userId: string,
    parcoursId: string,
    anneeAcademiqueId: string
  ): Promise<any[]> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const inscriptions = await this.inscriptionRepo.find({
      where: { parcoursId, anneeAcademiqueId, statut: 'validee' }
    });

    const suiviAssiduite = await Promise.all(
      inscriptions.map(async (inscription) => {
        const presences = await this.presenceRepo.find({
          where: { etudiantId: inscription.etudiantId }
        });

        const totalSeances = presences.length;
        const nbPresents = presences.filter(p => p.statut === 'present').length;
        const nbAbsences = presences.filter(p => p.statut === 'absent').length;
        const nbAbsencesJustifiees = presences.filter(p => p.statut === 'absent' && p.justifie).length;
        const nbRetards = presences.filter(p => p.statut === 'retard').length;

        const tauxAssiduite = totalSeances > 0 ? (nbPresents / totalSeances) * 100 : 0;
        const alerteAssiduite = tauxAssiduite < 75;

        return {
          etudiantId: inscription.etudiantId,
          inscriptionId: inscription.id,
          totalSeances,
          nbPresents,
          nbAbsences,
          nbAbsencesJustifiees,
          nbRetards,
          tauxAssiduite: parseFloat(tauxAssiduite.toFixed(2)),
          alerteAssiduite,
        };
      })
    );

    return suiviAssiduite.sort((a, b) => a.tauxAssiduite - b.tauxAssiduite);
  }
}
