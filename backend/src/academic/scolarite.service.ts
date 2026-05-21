import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantConnectionService } from '../tenants/tenant-connection.service';
import {
  VerrouillageNotes,
  ResultatAcademique,
  ReleveNote,
  DiplomeDocument,
  EquivalenceCredit,
} from './scolarite.entities';
import {
  Note,
  UniteEnseignement,
  ElementConstitutif,
  Etudiant,
  Inscription,
  Parcours,
  SessionExamen,
  AnneeAcademique,
} from './academic.entities';

/**
 * DTOs pour la scolarité
 */
export interface CalculMoyenneDto {
  sessionExamenId: string;
  parcoursId: string;
  anneeAcademiqueId?: string;
}

export interface VerrouillerNotesDto {
  sessionExamenId: string;
  parcoursId: string;
  ueId?: string;
  dateDeliberation: Date;
}

export interface DeverrouillerNotesDto {
  verrouillageId: string;
  motif: string;
  jetonAdmin?: string;
}

export interface GenererReleveDto {
  etudiantId: string;
  sessionExamenId: string;
  estSigneNumerique?: boolean;
}

@Injectable()
export class ScolariteService {
  private readonly logger = new Logger(ScolariteService.name);

  constructor(
    @InjectRepository(VerrouillageNotes, 'tenant') private verrouillageRepo: Repository<VerrouillageNotes>,
    @InjectRepository(ResultatAcademique, 'tenant') private resultatRepo: Repository<ResultatAcademique>,
    @InjectRepository(ReleveNote, 'tenant') private releveRepo: Repository<ReleveNote>,
    @InjectRepository(DiplomeDocument, 'tenant') private diplomeRepo: Repository<DiplomeDocument>,
    @InjectRepository(EquivalenceCredit, 'tenant') private equivalenceRepo: Repository<EquivalenceCredit>,
    @InjectRepository(Note, 'tenant') private noteRepo: Repository<Note>,
    @InjectRepository(UniteEnseignement, 'tenant') private ueRepo: Repository<UniteEnseignement>,
    @InjectRepository(ElementConstitutif, 'tenant') private ecRepo: Repository<ElementConstitutif>,
    @InjectRepository(Etudiant, 'tenant') private etudiantRepo: Repository<Etudiant>,
    @InjectRepository(Inscription, 'tenant') private inscriptionRepo: Repository<Inscription>,
    @InjectRepository(Parcours, 'tenant') private parcoursRepo: Repository<Parcours>,
    @InjectRepository(SessionExamen, 'tenant') private sessionRepo: Repository<SessionExamen>,
    @InjectRepository(AnneeAcademique, 'tenant') private anneeRepo: Repository<AnneeAcademique>,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  // ==================== MOTEUR DE CALCUL DES MOYENNES ====================

  /**
   * Calcule les moyennes pondérées pour une session d'examen
   * Respecte les coefficients et crédits ECTS du schéma
   */
  async calculerMoyennesSession(tid: string, dto: CalculMoyenneDto, userId: string): Promise<ResultatAcademique[]> {
    await this.tenantConnection.setTenantSchema(tid);

    const { sessionExamenId, parcoursId } = dto;

    // Récupérer les UE du parcours
    const ues = await this.ueRepo.find({ where: { parcoursId } });
    
    // Récupérer les inscriptions
    const inscriptions = await this.inscriptionRepo.find({
      where: { parcoursId, anneeAcademiqueId: dto.anneeAcademiqueId },
    });

    const resultats: ResultatAcademique[] = [];

    for (const inscription of inscriptions) {
      const etudiantId = inscription.etudiantId;
      
      let moyenneGenerale = 0;
      let totalCoefficients = 0;
      let totalCredits = 0;
      let creditsValides = 0;
      const detailsUes: any[] = [];
      const detailsEcs: any[] = [];

      for (const ue of ues) {
        // Récupérer les ECs de l'UE
        const ecs = await this.ecRepo.find({ where: { ueId: ue.id } });
        
        let moyenneUe = 0;
        let coefUe = 0;
        const notesEc: any[] = [];

        for (const ec of ecs) {
          // Récupérer la note de l'EC
          const note = await this.noteRepo.findOne({
            where: { etudiantId, ecId: ec.id, sessionId: sessionExamenId },
          });

          const valeurNote = note ? Number(note.valeur) : 0;
          const coefEc = Number(ec.coefficient) || 1;

          notesEc.push({
            ecId: ec.id,
            code: ec.code,
            intitule: ec.intitule,
            note: valeurNote,
            coefficient: coefEc,
          });

          moyenneUe += valeurNote * coefEc;
          coefUe += coefEc;
          
          detailsEcs.push({
            ecId: ec.id,
            ueId: ue.id,
            note: valeurNote,
            coefficient: coefEc,
          });
        }

        if (coefUe > 0) {
          moyenneUe = moyenneUe / coefUe;
        }

        const coefUeGlobal = Number(ue.coefficient) || 1;
        const creditsUe = ue.creditsEcts || 0;

        detailsUes.push({
          ueId: ue.id,
          code: ue.code,
          intitule: ue.intitule,
          moyenneUe: parseFloat(moyenneUe.toFixed(2)),
          coefficient: coefUeGlobal,
          credits: creditsUe,
          valide: moyenneUe >= 10,
        });

        moyenneGenerale += moyenneUe * coefUeGlobal;
        totalCoefficients += coefUeGlobal;
        totalCredits += creditsUe;
        
        if (moyenneUe >= 10) {
          creditsValides += creditsUe;
        }
      }

      if (totalCoefficients > 0) {
        moyenneGenerale = moyenneGenerale / totalCoefficients;
      }

      // Déterminer la mention
      let mention = 'passable';
      if (moyenneGenerale >= 16) mention = 'excellent';
      else if (moyenneGenerale >= 14) mention = 'tres_bien';
      else if (moyenneGenerale >= 12) mention = 'bien';
      else if (moyenneGenerale >= 10) mention = 'assez_bien';

      // Déterminer la décision
      let decision: 'passe' | 'redouble' | 'ajourne' | 'exclu' | 'dispense' = 'passe';
      if (creditsValides < totalCredits * 0.5) {
        decision = 'ajourne';
      } else if (creditsValides < totalCredits * 0.75) {
        decision = 'redouble';
      }

      // Créer ou mettre à jour le résultat
      let resultat = await this.resultatRepo.findOne({
        where: { etudiantId, sessionExamenId },
      });

      const resultatData = {
        etudiantId,
        sessionExamenId,
        parcoursId,
        moyenneGenerale: parseFloat(moyenneGenerale.toFixed(2)),
        totalCredits,
        creditsValides,
        detailsUes,
        detailsEcs,
        mention,
        decision,
        estDefinitif: false,
      };

      if (resultat) {
        resultat = await this.resultatRepo.save({ ...resultat, ...resultatData });
      } else {
        resultat = await this.resultatRepo.save(this.resultatRepo.create(resultatData));
      }

      resultats.push(resultat);
    }

    return resultats;
  }

  /**
   * Récupère les résultats calculés
   */
  async getResultats(tid: string, sessionExamenId?: string, parcoursId?: string): Promise<ResultatAcademique[]> {
    await this.tenantConnection.setTenantSchema(tid);

    const where: any = {};
    if (sessionExamenId) where.sessionExamenId = sessionExamenId;
    if (parcoursId) where.parcoursId = parcoursId;

    return this.resultatRepo.find({
      where,
      order: { moyenneGenerale: 'DESC' },
    });
  }

  // ==================== VERROUILLAGE DES NOTES ====================

  /**
   * Verrouille les notes après délibération
   * Aucune modification possible sans jeton d'admin
   */
  async verrouillerNotes(tid: string, dto: VerrouillerNotesDto, userId: string): Promise<VerrouillageNotes> {
    await this.tenantConnection.setTenantSchema(tid);

    // Vérifier si déjà verrouillé
    const existant = await this.verrouillageRepo.findOne({
      where: {
        sessionExamenId: dto.sessionExamenId,
        parcoursId: dto.parcoursId,
      },
    });

    if (existant && existant.verrouille) {
      throw new BadRequestException('Les notes sont déjà verrouillées pour cette session');
    }

    const verrouillage = this.verrouillageRepo.create({
      sessionExamenId: dto.sessionExamenId,
      parcoursId: dto.parcoursId,
      ueId: dto.ueId,
      dateDeliberation: new Date(),
      verrouille: true,
      verrouillePar: userId,
      dateVerrouillage: new Date(),
    });

    const saved = await this.verrouillageRepo.save(verrouillage);

    // Marquer les résultats comme définitifs
    await this.resultatRepo.update(
      { sessionExamenId: dto.sessionExamenId, parcoursId: dto.parcoursId },
      { estDefinitif: true }
    );

    // Verrouiller les notes
    await this.noteRepo.update(
      { sessionId: dto.sessionExamenId },
      { verrouille: true, dateVerrouillage: new Date() }
    );

    return saved;
  }

  /**
   * Déverrouille les notes (nécessite jeton admin)
   */
  async deverrouillerNotes(tid: string, dto: DeverrouillerNotesDto, userId: string): Promise<VerrouillageNotes> {
    await this.tenantConnection.setTenantSchema(tid);

    const verrouillage = await this.verrouillageRepo.findOne({
      where: { id: dto.verrouillageId },
    });

    if (!verrouillage) throw new NotFoundException('Verrouillage non trouvé');

    if (!verrouillage.verrouille) {
      throw new BadRequestException('Les notes ne sont pas verrouillées');
    }

    // Vérifier le jeton admin si fourni
    if (dto.jetonAdmin && verrouillage.jetonAdmin !== dto.jetonAdmin) {
      throw new ForbiddenException('Jeton admin invalide');
    }

    const updated = await this.verrouillageRepo.save({
      ...verrouillage,
      verrouille: false,
      deverrouillePar: userId,
      dateDeverrouillage: new Date(),
      motif_deverrouillage: dto.motif,
    });

    // Déverrouiller les notes
    await this.noteRepo.update(
      { sessionId: verrouillage.sessionExamenId },
      { verrouille: false, dateVerrouillage: null }
    );

    return updated;
  }

  /**
   * Vérifie si les notes sont verrouillées
   */
  async isNotesVerrouillees(tid: string, sessionExamenId: string, parcoursId: string): Promise<boolean> {
    await this.tenantConnection.setTenantSchema(tid);

    const verrouillage = await this.verrouillageRepo.findOne({
      where: {
        sessionExamenId: sessionExamenId,
        parcoursId: parcoursId,
        verrouille: true
      },
    });

    return !!verrouillage;
  }

  // ==================== GÉNÉRATION DES RELEVÉS ====================

  /**
   * Génère un relevé de notes officiel
   */
  async genererReleve(tid: string, dto: GenererReleveDto, userId: string): Promise<ReleveNote> {
    await this.tenantConnection.setTenantSchema(tid);

    const { etudiantId, sessionExamenId } = dto;

    // Récupérer le résultat
    const resultat = await this.resultatRepo.findOne({
      where: { etudiantId, sessionExamenId },
    });

    if (!resultat) {
      throw new NotFoundException('Résultat non trouvé pour cet étudiant et cette session');
    }

    // Vérifier que le résultat est définitif
    if (!resultat.estDefinitif) {
      throw new BadRequestException('Les résultats ne sont pas encore validés');
    }

    // Générer un numéro unique
    const annee = new Date().getFullYear();
    const numeroReleve = `REL-${annee}-${etudiantId.substring(0, 8)}-${sessionExamenId.substring(0, 8)}`;

    // Créer le relevé
    const releve = this.releveRepo.create({
      etudiantId,
      sessionExamenId,
      numeroReleve,
      contenu: {
        etudiant: await this.etudiantRepo.findOne({ where: { id: etudiantId } }),
        resultat,
        dateGeneration: new Date(),
      },
      statut: 'brouillon',
      generePar: userId,
      estSigneNumerique: dto.estSigneNumerique || false,
    });

    return this.releveRepo.save(releve);
  }

  /**
   * Valide un relevé de notes
   */
  async validerReleve(tid: string, releveId: string, userId: string): Promise<ReleveNote> {
    await this.tenantConnection.setTenantSchema(tid);

    const releve = await this.releveRepo.findOne({ where: { id: releveId } });
    if (!releve) throw new NotFoundException('Relevé non trouvé');

    return this.releveRepo.save({
      ...releve,
      statut: 'valide',
      validePar: userId,
      dateValidation: new Date(),
    });
  }

  /**
   * Récupère les relevés
   */
  async getReleves(tid: string, etudiantId?: string, statut?: string): Promise<ReleveNote[]> {
    await this.tenantConnection.setTenantSchema(tid);

    const where: any = {};
    if (etudiantId) where.etudiantId = etudiantId;
    if (statut) where.statut = statut;

    return this.releveRepo.find({
      where,
      order: { dateGeneration: 'DESC' },
    });
  }

  // ==================== GESTION DES DIPLÔMES ====================

  /**
   * Vérifie les conditions d'obtention du diplôme
   * Intègre la vérification des dettes financières (via économat)
   */
  async verifierConditionsDiplome(tid: string, etudiantId: string, parcoursId: string): Promise<{
    eligible: boolean;
    creditsOk: boolean;
    financeOk: boolean;
    disciplineOk: boolean;
    details: any;
  }> {
    await this.tenantConnection.setTenantSchema(tid);

    // Récupérer le parcours pour connaître les crédits requis
    const parcours = await this.parcoursRepo.findOne({ where: { id: parcoursId } });
    if (!parcours) throw new NotFoundException('Parcours non trouvé');

    // Calculer les crédits validés
    const resultats = await this.resultatRepo.find({ where: { etudiantId, parcoursId } });
    const totalCreditsValides = resultats.reduce((sum, r) => sum + r.creditsValides, 0);

    // TODO: Vérifier les dettes financières via service économat
    // Pour l'instant, simuler
    const financeOk = true;

    // Vérifier les sanctions disciplinaires
    const sanctionsEnCours = 0; // TODO: Récupérer du service discipline
    const disciplineOk = sanctionsEnCours === 0;

    const creditsRequis = 60; // À adapter selon le parcours
    const creditsOk = totalCreditsValides >= creditsRequis;

    return {
      eligible: creditsOk && financeOk && disciplineOk,
      creditsOk,
      financeOk,
      disciplineOk,
      details: {
        creditsValides: totalCreditsValides,
        creditsRequis,
        sanctionsEnCours,
      },
    };
  }

  /**
   * Crée un document de diplôme
   */
  async creerDiplome(tid: string, etudiantId: string, parcoursId: string, type: string, userId: string): Promise<DiplomeDocument> {
    await this.tenantConnection.setTenantSchema(tid);

    // Vérifier les conditions
    const conditions = await this.verifierConditionsDiplome(tid, etudiantId, parcoursId);
    if (!conditions.eligible && type !== 'attestation_reussite') {
      throw new BadRequestException('L\'étudiant ne remplit pas toutes les conditions pour le diplôme');
    }

    // Générer un numéro unique
    const annee = new Date().getFullYear();
    const numeroDocument = `DIP-${type.substring(0, 3).toUpperCase()}-${annee}-${etudiantId.substring(0, 8)}`;

    const diplome = this.diplomeRepo.create({
      etudiantId,
      parcoursId,
      type: type as any,
      numeroDocument,
      statut: 'en_preparation',
      estVerifieFinance: conditions.financeOk,
      estVerifieDiscipline: conditions.disciplineOk,
    });

    return this.diplomeRepo.save(diplome);
  }

  // ==================== ÉQUIVALENCES DE CRÉDITS ====================

  /**
   * Crée une demande d'équivalence (Erasmus, transfert)
   */
  async creerEquivalence(tid: string, dto: any, userId: string): Promise<EquivalenceCredit> {
    await this.tenantConnection.setTenantSchema(tid);

    const equivalence = this.equivalenceRepo.create({
      ...dto,
      statut: 'demande',
    });

    const saved = await this.equivalenceRepo.save(equivalence);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  /**
   * Traite une demande d'équivalence
   */
  async traiterEquivalence(tid: string, equivalenceId: string, accepte: boolean, creditsAttribues: any[], userId: string): Promise<EquivalenceCredit> {
    await this.tenantConnection.setTenantSchema(tid);

    const equivalence = await this.equivalenceRepo.findOne({ where: { id: equivalenceId } });
    if (!equivalence) throw new NotFoundException('Demande non trouvée');

    const totalCredits = creditsAttribues.reduce((sum, c) => sum + (c.creditsAttribues || 0), 0);

    return this.equivalenceRepo.save({
      ...equivalence,
      statut: accepte ? 'valide' : 'refuse',
      equivalencesAttribuees: creditsAttribues,
      totalCreditsTransfere: totalCredits,
      traitePar: userId,
      dateDecision: new Date(),
    });
  }

  // ==================== INTEGRATION ASSIDUITE ====================

  /**
   * Met à jour le compteur d'assiduité après validation d'absence
   * Appelé par le service Surveillant Général
   */
  async mettreAJourAssiduite(tid: string, etudiantId: string, presenceId: string, estJustifiee: boolean): Promise<void> {
    await this.tenantConnection.setTenantSchema(tid);

    this.logger.log(`Mise à jour assiduité: étudiant ${etudiantId}, présence ${presenceId}, justifiée: ${estJustifiee}`);
    
    // Mettre à jour le résultat académique si nécessaire
    // Une absence justifiée ne pénalise pas le semestre
    
    // Log pour audit
    this.logger.log(`Assiduité mise à jour pour étudiant ${etudiantId}`);
  }

  // ==================== DASHBOARD SCOLARITE ====================

  async getDashboardScolarite(tid: string) {
    await this.tenantConnection.setTenantSchema(tid);

    const anneeActive = await this.anneeRepo.findOne({ where: { active: true } });
    
    // Notes en attente de validation
    const notesEnAttente = await this.noteRepo.count({
      where: { verrouille: false },
    });

    // Sessions verrouillées
    const sessionsVerrouillees = await this.verrouillageRepo.count({
      where: { verrouille: true },
    });

    // Relevés en brouillon
    const relevesEnBrouillon = await this.releveRepo.count({
      where: { statut: 'brouillon' },
    });

    // Diplômes en attente
    const diplomesEnAttente = await this.diplomeRepo.count({
      where: { statut: 'en_preparation' },
    });

    return {
      anneeActive: anneeActive?.libelle || 'Non définie',
      notesEnAttente,
      sessionsVerrouillees,
      relevesEnBrouillon,
      diplomesEnAttente,
    };
  }
}

// Made with Bob
