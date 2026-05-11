import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SujetExamen,
  ProcesVerbal,
  StageMemoire,
  StatistiqueParcours,
  ContenuCours,
} from './pedagogique.entities';
import {
  Parcours,
  UniteEnseignement,
  ElementConstitutif,
  Inscription,
  Presence,
  Note,
} from '../academic/academic.entities';
import { TenantConnectionService } from '../tenants/tenant-connection.service';

/**
 * Service sécurisé pour le Responsable Pédagogique
 * Toutes les opérations sont filtrées par ParcoursID
 * Seul le RP assigné à un parcours peut effectuer des actions sur ce parcours
 */
@Injectable()
export class RPSecureService {
  constructor(
    @InjectRepository(SujetExamen, 'tenant') private sujetRepo: Repository<SujetExamen>,
    @InjectRepository(ProcesVerbal, 'tenant') private pvRepo: Repository<ProcesVerbal>,
    @InjectRepository(StageMemoire, 'tenant') private stageRepo: Repository<StageMemoire>,
    @InjectRepository(StatistiqueParcours, 'tenant') private statRepo: Repository<StatistiqueParcours>,
    @InjectRepository(ContenuCours, 'tenant') private contenuRepo: Repository<ContenuCours>,
    @InjectRepository(Parcours, 'tenant') private parcoursRepo: Repository<Parcours>,
    @InjectRepository(UniteEnseignement, 'tenant') private ueRepo: Repository<UniteEnseignement>,
    @InjectRepository(ElementConstitutif, 'tenant') private ecRepo: Repository<ElementConstitutif>,
    @InjectRepository(Inscription, 'tenant') private inscriptionRepo: Repository<Inscription>,
    @InjectRepository(Presence, 'tenant') private presenceRepo: Repository<Presence>,
    @InjectRepository(Note, 'tenant') private noteRepo: Repository<Note>,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  /**
   * Vérifie que l'utilisateur est bien le RP du parcours
   */
  private async verifyRPAccess(tid: string, userId: string, parcoursId: string): Promise<void> {
    await this.tenantConnection.setTenantSchema(tid);
    
    const parcours = await this.parcoursRepo.findOne({
      where: { id: parcoursId, actif: true }
    });

    if (!parcours) {
      throw new NotFoundException('Parcours non trouvé');
    }

    // Vérifier que l'utilisateur est le responsable du parcours
    if (parcours.responsableId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à gérer ce parcours');
    }
  }

  /**
   * Récupère les parcours dont l'utilisateur est responsable
   */
  async getMesParcours(tid: string, userId: string): Promise<Parcours[]> {
    await this.tenantConnection.setTenantSchema(tid);
    
    return this.parcoursRepo.find({
      where: { responsableId: userId, actif: true },
      order: { nom: 'ASC' }
    });
  }

  // ==================== VALIDATION SUJETS D'EXAMENS (SÉCURISÉ) ====================

  /**
   * Récupère les sujets d'examen pour les parcours du RP uniquement
   */
  async getSujetsExamenByParcours(
    tid: string,
    userId: string,
    parcoursId: string,
    statut?: string
  ): Promise<SujetExamen[]> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const where: any = {};
    if (statut) where.statut = statut;

    // Récupérer les UE et EC du parcours
    const ues = await this.ueRepo.find({ where: { parcoursId } });
    const ueIds = ues.map(ue => ue.id);

    const ecs = await this.ecRepo.find({
      where: ueIds.length > 0 ? ueIds.map(ueId => ({ ueId })) : []
    });
    const ecIds = ecs.map(ec => ec.id);

    // Filtrer les sujets par UE ou EC du parcours
    const sujets = await this.sujetRepo
      .createQueryBuilder('sujet')
      .where('(sujet.ueId IN (:...ueIds) OR sujet.ecId IN (:...ecIds))', { ueIds, ecIds })
      .andWhere(statut ? 'sujet.statut = :statut' : '1=1', { statut })
      .orderBy('sujet.dateSoumission', 'DESC')
      .getMany();

    return sujets;
  }

  /**
   * Valide un sujet d'examen (RP uniquement pour son parcours)
   */
  async validerSujetExamen(
    tid: string,
    userId: string,
    sujetId: string,
    parcoursId: string,
    commentaires?: string
  ): Promise<SujetExamen> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const sujet = await this.sujetRepo.findOne({ where: { id: sujetId } });
    if (!sujet) {
      throw new NotFoundException('Sujet d\'examen non trouvé');
    }

    // Vérifier que le sujet appartient bien au parcours
    let appartientAuParcours = false;
    
    if (sujet.ueId) {
      const ue = await this.ueRepo.findOne({ where: { id: sujet.ueId } });
      appartientAuParcours = ue?.parcoursId === parcoursId;
    } else if (sujet.ecId) {
      const ec = await this.ecRepo.findOne({ where: { id: sujet.ecId }, relations: ['ue'] });
      const ue = await this.ueRepo.findOne({ where: { id: ec?.ueId } });
      appartientAuParcours = ue?.parcoursId === parcoursId;
    }

    if (!appartientAuParcours) {
      throw new ForbiddenException('Ce sujet n\'appartient pas à votre parcours');
    }

    // Workflow: soumis -> en_relecture -> valide
    if (sujet.statut !== 'soumis' && sujet.statut !== 'en_relecture') {
      throw new BadRequestException('Le sujet ne peut pas être validé dans son état actuel');
    }

    return this.sujetRepo.save({
      ...sujet,
      statut: 'valide',
      validePar: userId,
      dateValidation: new Date(),
      commentaires: commentaires || sujet.commentaires,
    });
  }

  /**
   * Rejette un sujet d'examen avec motif
   */
  async rejeterSujetExamen(
    tid: string,
    userId: string,
    sujetId: string,
    parcoursId: string,
    motifRejet: string
  ): Promise<SujetExamen> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const sujet = await this.sujetRepo.findOne({ where: { id: sujetId } });
    if (!sujet) {
      throw new NotFoundException('Sujet d\'examen non trouvé');
    }

    // Vérifier l'appartenance au parcours (même logique que validation)
    let appartientAuParcours = false;
    
    if (sujet.ueId) {
      const ue = await this.ueRepo.findOne({ where: { id: sujet.ueId } });
      appartientAuParcours = ue?.parcoursId === parcoursId;
    } else if (sujet.ecId) {
      const ec = await this.ecRepo.findOne({ where: { id: sujet.ecId } });
      const ue = await this.ueRepo.findOne({ where: { id: ec?.ueId } });
      appartientAuParcours = ue?.parcoursId === parcoursId;
    }

    if (!appartientAuParcours) {
      throw new ForbiddenException('Ce sujet n\'appartient pas à votre parcours');
    }

    return this.sujetRepo.save({
      ...sujet,
      statut: 'rejete',
      reluPar: userId,
      dateRelecture: new Date(),
      motifRejet,
    });
  }

  // ==================== VALIDATION CONTENUS DE COURS ====================

  /**
   * Récupère les contenus de cours pour validation (parcours du RP)
   */
  async getContenusCoursByParcours(
    tid: string,
    userId: string,
    parcoursId: string,
    statut?: string
  ): Promise<ContenuCours[]> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const where: any = {};
    if (statut) where.statut = statut;

    // Récupérer les UE et EC du parcours
    const ues = await this.ueRepo.find({ where: { parcoursId } });
    const ueIds = ues.map(ue => ue.id);

    const ecs = await this.ecRepo.find({
      where: ueIds.length > 0 ? ueIds.map(ueId => ({ ueId })) : []
    });
    const ecIds = ecs.map(ec => ec.id);

    const contenus = await this.contenuRepo
      .createQueryBuilder('contenu')
      .where('(contenu.ueId IN (:...ueIds) OR contenu.ecId IN (:...ecIds))', { ueIds, ecIds })
      .andWhere(statut ? 'contenu.statut = :statut' : '1=1', { statut })
      .orderBy('contenu.createdAt', 'DESC')
      .getMany();

    return contenus;
  }

  /**
   * Valide un contenu de cours
   */
  async validerContenuCours(
    tid: string,
    userId: string,
    contenuId: string,
    parcoursId: string,
    commentaires?: string
  ): Promise<ContenuCours> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const contenu = await this.contenuRepo.findOne({ where: { id: contenuId } });
    if (!contenu) {
      throw new NotFoundException('Contenu de cours non trouvé');
    }

    // Vérifier l'appartenance au parcours
    let appartientAuParcours = false;
    
    if (contenu.ueId) {
      const ue = await this.ueRepo.findOne({ where: { id: contenu.ueId } });
      appartientAuParcours = ue?.parcoursId === parcoursId;
    } else if (contenu.ecId) {
      const ec = await this.ecRepo.findOne({ where: { id: contenu.ecId } });
      const ue = await this.ueRepo.findOne({ where: { id: ec?.ueId } });
      appartientAuParcours = ue?.parcoursId === parcoursId;
    }

    if (!appartientAuParcours) {
      throw new ForbiddenException('Ce contenu n\'appartient pas à votre parcours');
    }

    return this.contenuRepo.save({
      ...contenu,
      statut: 'valide',
      validePar: userId,
      dateValidation: new Date(),
      commentaires: commentaires || contenu.commentaires,
    });
  }

  // ==================== VALIDATION STAGES/MÉMOIRES ====================

  /**
   * Récupère les stages/mémoires du parcours
   */
  async getStagesMemoiresByParcours(
    tid: string,
    userId: string,
    parcoursId: string,
    statut?: string
  ): Promise<StageMemoire[]> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const where: any = { parcoursId };
    if (statut) where.statut = statut;

    return this.stageRepo.find({
      where,
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Valide un stage/mémoire
   */
  async validerStageMemoire(
    tid: string,
    userId: string,
    stageId: string,
    parcoursId: string
  ): Promise<StageMemoire> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const stage = await this.stageRepo.findOne({
      where: { id: stageId, parcoursId }
    });

    if (!stage) {
      throw new NotFoundException('Stage/Mémoire non trouvé ou n\'appartient pas à votre parcours');
    }

    return this.stageRepo.save({
      ...stage,
      statut: 'valide',
      validePar: userId,
      dateValidation: new Date(),
    });
  }

  // ==================== VALIDATION PROCÈS-VERBAUX ====================

  /**
   * Récupère les PV du parcours
   */
  async getProcesVerbauxByParcours(
    tid: string,
    userId: string,
    parcoursId: string,
    statut?: string
  ): Promise<ProcesVerbal[]> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const where: any = { parcoursId };
    if (statut) where.statut = statut;

    return this.pvRepo.find({
      where,
      order: { dateDeliberation: 'DESC' }
    });
  }

  /**
   * Valide un procès-verbal
   */
  async validerProcesVerbal(
    tid: string,
    userId: string,
    pvId: string,
    parcoursId: string
  ): Promise<ProcesVerbal> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    const pv = await this.pvRepo.findOne({
      where: { id: pvId, parcoursId }
    });

    if (!pv) {
      throw new NotFoundException('Procès-verbal non trouvé ou n\'appartient pas à votre parcours');
    }

    return this.pvRepo.save({
      ...pv,
      statut: 'valide',
      validePar: userId,
      dateValidation: new Date(),
    });
  }

  // ==================== STATISTIQUES & SUIVI ASSIDUITÉ ====================

  /**
   * Récupère les statistiques de performance du parcours
   */
  async getStatistiquesPerformance(
    tid: string,
    userId: string,
    parcoursId: string,
    anneeAcademiqueId: string
  ): Promise<any> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    // Récupérer les inscriptions du parcours
    const inscriptions = await this.inscriptionRepo.find({
      where: { parcoursId, anneeAcademiqueId, statut: 'validee' }
    });

    const nbInscrits = inscriptions.length;
    const etudiantIds = inscriptions.map(i => i.etudiantId);

    // Calculer le taux de réussite
    const notes = await this.noteRepo
      .createQueryBuilder('note')
      .where('note.etudiantId IN (:...etudiantIds)', { etudiantIds })
      .andWhere('note.verrouille = :verrouille', { verrouille: true })
      .getMany();

    const notesReussies = notes.filter(n => Number(n.valeur) >= 10);
    const tauxReussite = notes.length > 0 ? (notesReussies.length / notes.length) * 100 : 0;

    // Calculer la moyenne générale
    const sommeNotes = notes.reduce((sum, n) => sum + Number(n.valeur), 0);
    const moyenneGenerale = notes.length > 0 ? sommeNotes / notes.length : 0;

    // Statistiques par UE
    const ues = await this.ueRepo.find({ where: { parcoursId } });
    const statsParUE = await Promise.all(
      ues.map(async (ue) => {
        const notesUE = notes.filter(n => n.ueId === ue.id);
        const moyenneUE = notesUE.length > 0
          ? notesUE.reduce((sum, n) => sum + Number(n.valeur), 0) / notesUE.length
          : 0;
        const tauxReussiteUE = notesUE.length > 0
          ? (notesUE.filter(n => Number(n.valeur) >= 10).length / notesUE.length) * 100
          : 0;

        return {
          ueId: ue.id,
          code: ue.code,
          intitule: ue.intitule,
          creditsECTS: ue.creditsEcts,
          moyenne: parseFloat(moyenneUE.toFixed(2)),
          tauxReussite: parseFloat(tauxReussiteUE.toFixed(2)),
          nbEtudiants: notesUE.length
        };
      })
    );

    return {
      parcoursId,
      anneeAcademiqueId,
      nbInscrits,
      tauxReussite: parseFloat(tauxReussite.toFixed(2)),
      moyenneGenerale: parseFloat(moyenneGenerale.toFixed(2)),
      statsParUE,
      dateCalcul: new Date()
    };
  }

  /**
   * Récupère le suivi d'assiduité des étudiants du parcours
   */
  async getSuiviAssiduite(
    tid: string,
    userId: string,
    parcoursId: string,
    anneeAcademiqueId: string
  ): Promise<any[]> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    // Récupérer les inscriptions
    const inscriptions = await this.inscriptionRepo.find({
      where: { parcoursId, anneeAcademiqueId, statut: 'validee' }
    });

    // Pour chaque étudiant, calculer l'assiduité
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

        // Alerte si taux < 75%
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
          alerteAssiduite
        };
      })
    );

    return suiviAssiduite;
  }

  /**
   * Dashboard complet du RP pour un parcours spécifique
   */
  async getDashboardRP(
    tid: string,
    userId: string,
    parcoursId: string,
    anneeAcademiqueId: string
  ): Promise<any> {
    await this.verifyRPAccess(tid, userId, parcoursId);

    // Sujets en attente de validation
    const sujetsEnAttente = await this.getSujetsExamenByParcours(tid, userId, parcoursId, 'soumis');

    // Contenus en attente
    const contenusEnAttente = await this.getContenusCoursByParcours(tid, userId, parcoursId, 'soumis');

    // PV en attente
    const pvEnAttente = await this.getProcesVerbauxByParcours(tid, userId, parcoursId, 'brouillon');

    // Stages en cours
    const stagesEnCours = await this.getStagesMemoiresByParcours(tid, userId, parcoursId, 'en_cours');

    // Statistiques de performance
    const statsPerformance = await this.getStatistiquesPerformance(tid, userId, parcoursId, anneeAcademiqueId);

    // Suivi assiduité
    const suiviAssiduite = await this.getSuiviAssiduite(tid, userId, parcoursId, anneeAcademiqueId);

    // Alertes assiduité (< 75%)
    const alertesAssiduite = suiviAssiduite.filter(s => s.alerteAssiduite);

    return {
      parcours: await this.parcoursRepo.findOne({ where: { id: parcoursId } }),
      validations: {
        sujetsEnAttente: sujetsEnAttente.length,
        contenusEnAttente: contenusEnAttente.length,
        pvEnAttente: pvEnAttente.length,
        stagesEnCours: stagesEnCours.length
      },
      performance: statsPerformance,
      assiduite: {
        total: suiviAssiduite.length,
        alertes: alertesAssiduite.length,
        tauxMoyen: suiviAssiduite.length > 0
          ? suiviAssiduite.reduce((sum, s) => sum + s.tauxAssiduite, 0) / suiviAssiduite.length
          : 0
      },
      details: {
        sujets: sujetsEnAttente,
        contenus: contenusEnAttente,
        pv: pvEnAttente,
        stages: stagesEnCours,
        alertesAssiduite
      }
    };
  }
}

// Made with Bob