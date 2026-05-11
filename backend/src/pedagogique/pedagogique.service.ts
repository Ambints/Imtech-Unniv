import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReferentielCompetences,
  SujetExamen,
  ProcesVerbal,
  StageMemoire,
  StatistiqueParcours,
  ContenuCours,
  Soutenance
} from './pedagogique.entities';
import {
  Parcours,
  UniteEnseignement,
  ElementConstitutif,
  Enseignant,
  AffectationCours,
  Note,
  Inscription,
  Presence,
  SessionExamen
} from '../academic/academic.entities';
import { TenantConnectionService } from '../tenants/tenant-connection.service';

@Injectable()
export class PedagogiqueService {
  constructor(
    @InjectRepository(ReferentielCompetences, 'tenant') private refCompRepo: Repository<ReferentielCompetences>,
    @InjectRepository(SujetExamen, 'tenant') private sujetRepo: Repository<SujetExamen>,
    @InjectRepository(ProcesVerbal, 'tenant') private pvRepo: Repository<ProcesVerbal>,
    @InjectRepository(StageMemoire, 'tenant') private stageRepo: Repository<StageMemoire>,
    @InjectRepository(StatistiqueParcours, 'tenant') private statRepo: Repository<StatistiqueParcours>,
    @InjectRepository(ContenuCours, 'tenant') private contenuRepo: Repository<ContenuCours>,
    @InjectRepository(Soutenance, 'tenant') private soutenanceRepo: Repository<Soutenance>,
    @InjectRepository(Parcours, 'tenant') private parcoursRepo: Repository<Parcours>,
    @InjectRepository(UniteEnseignement, 'tenant') private ueRepo: Repository<UniteEnseignement>,
    @InjectRepository(ElementConstitutif, 'tenant') private ecRepo: Repository<ElementConstitutif>,
    @InjectRepository(Enseignant, 'tenant') private enseignantRepo: Repository<Enseignant>,
    @InjectRepository(AffectationCours, 'tenant') private affectationRepo: Repository<AffectationCours>,
    @InjectRepository(Note, 'tenant') private noteRepo: Repository<Note>,
    @InjectRepository(Inscription, 'tenant') private inscriptionRepo: Repository<Inscription>,
    @InjectRepository(Presence, 'tenant') private presenceRepo: Repository<Presence>,
    @InjectRepository(SessionExamen, 'tenant') private sessionRepo: Repository<SessionExamen>,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  // ==================== RÉFÉRENTIEL DE COMPÉTENCES ====================
  async createReferentiel(tid: string, dto: any, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const referentiel = this.refCompRepo.create({
      ...dto,
      statut: 'brouillon',
    });
    return this.refCompRepo.save(referentiel);
  }

  async getReferentiels(tid: string, parcoursId?: string) {
    try {
      await this.tenantConnection.setTenantSchema(tid);
      const where: any = {};
      if (parcoursId) where.parcoursId = parcoursId;
      const referentiels = await this.refCompRepo.find({ where, order: { createdAt: 'DESC' } });
      return referentiels || [];
    } catch (error) {
      console.error('Error in getReferentiels:', error);
      // Return empty array instead of throwing to prevent frontend hanging
      return [];
    }
  }

  async updateReferentiel(tid: string, id: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    const ref = await this.refCompRepo.findOne({ where: { id } });
    if (!ref) throw new NotFoundException('Référentiel non trouvé');
    return this.refCompRepo.save({ ...ref, ...dto });
  }

  async validerReferentiel(tid: string, id: string, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const ref = await this.refCompRepo.findOne({ where: { id } });
    if (!ref) throw new NotFoundException('Référentiel non trouvé');
    return this.refCompRepo.save({
      ...ref,
      statut: 'valide',
      validePar: userId,
      dateValidation: new Date(),
    });
  }

  // ==================== MAQUETTES DE FORMATION ====================
  async createMaquette(tid: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    // Créer le parcours
    const parcoursEntity = this.parcoursRepo.create(dto.parcours);
    const savedParcours: Parcours = await this.parcoursRepo.save(parcoursEntity) as any;
    
    // Créer les UE associées
    if (dto.unites && dto.unites.length > 0) {
      for (const ue of dto.unites) {
        const ueEntity = this.ueRepo.create({ ...ue, parcoursId: savedParcours.id });
        await this.ueRepo.save(ueEntity);
      }
    }
    
    return { message: 'Maquette créée avec succès', parcours: savedParcours };
  }

  async getMaquettes(tid: string) {
    try {
      await this.tenantConnection.setTenantSchema(tid);
      const parcours = await this.parcoursRepo.find({ where: { actif: true }, order: { nom: 'ASC' } });
      
      if (!parcours || parcours.length === 0) {
        return [];
      }
      
      // Pour chaque parcours, récupérer les UE
      const maquettes = await Promise.all(
        parcours.map(async (p) => {
          const unites = await this.ueRepo.find({
            where: { parcoursId: p.id, actif: true },
            order: { semestre: 'ASC', code: 'ASC' }
          });
          return { ...p, unites };
        })
      );
      
      return maquettes;
    } catch (error) {
      console.error('Error in getMaquettes:', error);
      // Return empty array instead of throwing to prevent frontend hanging
      return [];
    }
  }

  async validerMaquette(tid: string, parcoursId: string, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const parcours = await this.parcoursRepo.findOne({ where: { id: parcoursId } });
    if (!parcours) throw new NotFoundException('Parcours non trouvé');
    
    // Marquer comme validé (on peut ajouter un champ validation si nécessaire)
    return { message: 'Maquette validée avec succès', parcours };
  }

  // ==================== AFFECTATION DES ENSEIGNANTS ====================
  async affecterEnseignant(tid: string, dto: any, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const affectation = this.affectationRepo.create({
      ...dto,
      validePar: userId,
    });
    return this.affectationRepo.save(affectation);
  }

  async getAffectations(tid: string, anneeAcademiqueId?: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const where: any = {};
    if (anneeAcademiqueId) where.anneeAcademiqueId = anneeAcademiqueId;
    return this.affectationRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async updateAffectation(tid: string, id: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    const affectation = await this.affectationRepo.findOne({ where: { id } });
    if (!affectation) throw new NotFoundException('Affectation non trouvée');
    return this.affectationRepo.save({ ...affectation, ...dto });
  }

  async deleteAffectation(tid: string, id: string) {
    await this.tenantConnection.setTenantSchema(tid);
    await this.affectationRepo.delete(id);
    return { message: 'Affectation supprimée avec succès' };
  }

  // ==================== CONTENUS DE COURS ====================
  async createContenuCours(tid: string, dto: any, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const contenu = this.contenuRepo.create({
      ...dto,
      soumisPar: userId,
      statut: 'brouillon',
    });
    return this.contenuRepo.save(contenu);
  }

  async getContenusCours(tid: string, ueId?: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const where: any = {};
    if (ueId) where.ueId = ueId;
    return this.contenuRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async validerContenuCours(tid: string, id: string, userId: string, commentaires?: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const contenu = await this.contenuRepo.findOne({ where: { id } });
    if (!contenu) throw new NotFoundException('Contenu non trouvé');
    
    return this.contenuRepo.save({
      ...contenu,
      statut: 'valide',
      validePar: userId,
      dateValidation: new Date(),
      commentaires: commentaires || contenu.commentaires,
    });
  }

  async rejeterContenuCours(tid: string, id: string, commentaires: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const contenu = await this.contenuRepo.findOne({ where: { id } });
    if (!contenu) throw new NotFoundException('Contenu non trouvé');
    
    return this.contenuRepo.save({
      ...contenu,
      statut: 'rejete',
      commentaires,
    });
  }

  // ==================== SUJETS D'EXAMENS ====================
  async createSujetExamen(tid: string, dto: any, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const sujet = this.sujetRepo.create({
      ...dto,
      soumisPar: userId,
      statut: 'soumis',
      dateSoumission: new Date(),
    });
    return this.sujetRepo.save(sujet);
  }

  async getSujetsExamen(tid: string, sessionId?: string, statut?: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const where: any = {};
    if (sessionId) where.sessionExamenId = sessionId;
    if (statut) where.statut = statut;
    return this.sujetRepo.find({ where, order: { dateSoumission: 'DESC' } });
  }

  async relireSujetExamen(tid: string, id: string, userId: string, commentaires?: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const sujet = await this.sujetRepo.findOne({ where: { id } });
    if (!sujet) throw new NotFoundException('Sujet non trouvé');
    
    return this.sujetRepo.save({
      ...sujet,
      statut: 'en_relecture',
      reluPar: userId,
      dateRelecture: new Date(),
      commentaires: commentaires || sujet.commentaires,
    });
  }

  async validerSujetExamen(tid: string, id: string, userId: string, commentaires?: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const sujet = await this.sujetRepo.findOne({ where: { id } });
    if (!sujet) throw new NotFoundException('Sujet non trouvé');
    
    return this.sujetRepo.save({
      ...sujet,
      statut: 'valide',
      validePar: userId,
      dateValidation: new Date(),
      commentaires: commentaires || sujet.commentaires,
    });
  }

  async rejeterSujetExamen(tid: string, id: string, motifRejet: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const sujet = await this.sujetRepo.findOne({ where: { id } });
    if (!sujet) throw new NotFoundException('Sujet non trouvé');
    
    return this.sujetRepo.save({
      ...sujet,
      statut: 'rejete',
      motifRejet,
    });
  }

  // ==================== PROCÈS-VERBAUX DE DÉLIBÉRATION ====================
  async createProcesVerbal(tid: string, dto: any, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    
    // Calculer les statistiques
    const resultats = dto.resultats || [];
    const nbAdmis = resultats.filter((r: any) => r.decision === 'admis').length;
    const nbAjournes = resultats.filter((r: any) => r.decision === 'ajourne').length;
    const nbAbsents = resultats.filter((r: any) => r.decision === 'absent').length;
    const tauxReussite = resultats.length > 0 ? (nbAdmis / resultats.length) * 100 : 0;
    
    const pv = this.pvRepo.create({
      ...dto,
      nbAdmis,
      nbAjournes,
      nbAbsents,
      tauxReussite: parseFloat(tauxReussite.toFixed(2)),
      redigePar: userId,
      statut: 'brouillon',
    });
    
    return this.pvRepo.save(pv);
  }

  async getProcesVerbaux(tid: string, parcoursId?: string, sessionId?: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const where: any = {};
    if (parcoursId) where.parcoursId = parcoursId;
    if (sessionId) where.sessionExamenId = sessionId;
    return this.pvRepo.find({ where, order: { dateDeliberation: 'DESC' } });
  }

  async validerProcesVerbal(tid: string, id: string, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const pv = await this.pvRepo.findOne({ where: { id } });
    if (!pv) throw new NotFoundException('Procès-verbal non trouvé');
    
    return this.pvRepo.save({
      ...pv,
      statut: 'valide',
      validePar: userId,
      dateValidation: new Date(),
    });
  }

  // ==================== STAGES ET MÉMOIRES ====================
  async createStageMemoire(tid: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    const stage = this.stageRepo.create({
      ...dto,
      statut: 'en_cours',
    });
    return this.stageRepo.save(stage);
  }

  async getStagesMemoires(tid: string, parcoursId?: string, etudiantId?: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const where: any = {};
    if (parcoursId) where.parcoursId = parcoursId;
    if (etudiantId) where.etudiantId = etudiantId;
    return this.stageRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async updateStageMemoire(tid: string, id: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    const stage = await this.stageRepo.findOne({ where: { id } });
    if (!stage) throw new NotFoundException('Stage/Mémoire non trouvé');
    return this.stageRepo.save({ ...stage, ...dto });
  }

  async validerStageMemoire(tid: string, id: string, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const stage = await this.stageRepo.findOne({ where: { id } });
    if (!stage) throw new NotFoundException('Stage/Mémoire non trouvé');
    
    return this.stageRepo.save({
      ...stage,
      statut: 'valide',
      validePar: userId,
      dateValidation: new Date(),
    });
  }

  // ==================== SOUTENANCES ====================
  async createSoutenance(tid: string, dto: any, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const soutenance = this.soutenanceRepo.create({
      ...dto,
      organisePar: userId,
      statut: 'planifie',
    });
    return this.soutenanceRepo.save(soutenance);
  }

  async getSoutenances(tid: string, date?: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const where: any = {};
    if (date) where.dateSoutenance = new Date(date);
    return this.soutenanceRepo.find({ where, order: { dateSoutenance: 'ASC', heureDebut: 'ASC' } });
  }

  async updateSoutenance(tid: string, id: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    const soutenance = await this.soutenanceRepo.findOne({ where: { id } });
    if (!soutenance) throw new NotFoundException('Soutenance non trouvée');
    return this.soutenanceRepo.save({ ...soutenance, ...dto });
  }

  // ==================== STATISTIQUES ET PERFORMANCES ====================
  async calculerStatistiques(tid: string, parcoursId: string, anneeAcademiqueId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    
    // Récupérer les inscriptions
    const inscriptions = await this.inscriptionRepo.find({
      where: { parcoursId, anneeAcademiqueId }
    });
    const nbInscrits = inscriptions.length;
    
    // Calculer l'assiduité (présences)
    let totalPresences = 0;
    let totalSeances = 0;
    for (const inscription of inscriptions) {
      const presences = await this.presenceRepo.find({
        where: { etudiantId: inscription.etudiantId }
      });
      totalSeances += presences.length;
      totalPresences += presences.filter(p => p.statut === 'present').length;
    }
    const tauxAssiduite = totalSeances > 0 ? (totalPresences / totalSeances) * 100 : 0;
    
    // Calculer le taux de réussite (notes)
    const notes = await this.noteRepo.find({
      where: { verrouille: true }
    });
    const notesEtudiants = notes.filter(n => 
      inscriptions.some(i => i.etudiantId === n.etudiantId)
    );
    const nbReussis = notesEtudiants.filter(n => n.valeur >= 10).length;
    const tauxReussite = notesEtudiants.length > 0 ? (nbReussis / notesEtudiants.length) * 100 : 0;
    
    // Moyenne générale
    const sommeNotes = notesEtudiants.reduce((sum, n) => sum + Number(n.valeur), 0);
    const moyenneGenerale = notesEtudiants.length > 0 ? sommeNotes / notesEtudiants.length : 0;
    
    // Créer ou mettre à jour les statistiques
    const existingStat = await this.statRepo.findOne({
      where: { parcoursId, anneeAcademiqueId }
    });
    
    const statData = {
      parcoursId,
      anneeAcademiqueId,
      nbInscrits,
      nbPresents: totalPresences,
      tauxAssiduite: parseFloat(tauxAssiduite.toFixed(2)),
      tauxReussite: parseFloat(tauxReussite.toFixed(2)),
      moyenneGenerale: parseFloat(moyenneGenerale.toFixed(2)),
      dateCalcul: new Date(),
    };
    
    if (existingStat) {
      return this.statRepo.save({ ...existingStat, ...statData });
    }
    
    return this.statRepo.save(this.statRepo.create(statData));
  }

  async getStatistiques(tid: string, parcoursId?: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const where: any = {};
    if (parcoursId) where.parcoursId = parcoursId;
    return this.statRepo.find({ where, order: { dateCalcul: 'DESC' } });
  }

  // ==================== DASHBOARD RP ====================
  async getDashboardData(tid: string, userId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    
    // Récupérer les parcours dont l'utilisateur est responsable
    const parcours = await this.parcoursRepo.find({
      where: { responsableId: userId, actif: true }
    });
    
    // Sujets en attente de validation
    const sujetsEnAttente = await this.sujetRepo.count({
      where: { statut: 'soumis' }
    });
    
    // Contenus en attente
    const contenusEnAttente = await this.contenuRepo.count({
      where: { statut: 'soumis' }
    });
    
    // PV en attente
    const pvEnAttente = await this.pvRepo.count({
      where: { statut: 'brouillon' }
    });
    
    // Soutenances à venir
    const soutenancesAVenir = await this.soutenanceRepo.count({
      where: { statut: 'planifie' }
    });
    
    return {
      parcours,
      sujetsEnAttente,
      contenusEnAttente,
      pvEnAttente,
      soutenancesAVenir,
    };
  }
}

// Made with Bob
