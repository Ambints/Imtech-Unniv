import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { Parcours, UniteEnseignement, Note, Inscription, Presence, Salle, EmploiDuTemps, Departement, Etudiant, AnneeAcademique, SessionExamen } from './academic.entities';
import { TenantConnectionService } from '../tenants/tenant-connection.service';

@Injectable()
export class AcademicService {
  private readonly logger = new Logger(AcademicService.name);

  constructor(
    @InjectRepository(Parcours, 'tenant') private parcoursRepo: Repository<Parcours>,
    @InjectRepository(UniteEnseignement, 'tenant') private ueRepo: Repository<UniteEnseignement>,
    @InjectRepository(Note, 'tenant') private noteRepo: Repository<Note>,
    @InjectRepository(Inscription, 'tenant') private inscriptionRepo: Repository<Inscription>,
    @InjectRepository(Presence, 'tenant') private presenceRepo: Repository<Presence>,
    @InjectRepository(Salle, 'tenant') private salleRepo: Repository<Salle>,
    @InjectRepository(EmploiDuTemps, 'tenant') private edtRepo: Repository<EmploiDuTemps>,
    @InjectRepository(Departement, 'tenant') private departementRepo: Repository<Departement>,
    @InjectRepository(Etudiant, 'tenant') private etudiantRepo: Repository<Etudiant>,
    @InjectRepository(AnneeAcademique, 'tenant') private anneeRepo: Repository<AnneeAcademique>,
    @InjectRepository(SessionExamen, 'tenant') private sessionRepo: Repository<SessionExamen>,
    @InjectDataSource('tenant') private dataSource: DataSource,
    private readonly tenantConnection: TenantConnectionService,
  ) {}

  // Departements
  async getDepartementsFromContext() {
    // Tenant schema is already set by middleware/interceptor
    return this.departementRepo.find({ where: { actif: true }, order: { nom: 'ASC' } });
  }

  async getDepartements(tid: string) {
    await this.tenantConnection.setTenantSchema(tid);
    return this.departementRepo.find({ where: { actif: true }, order: { nom: 'ASC' } });
  }

  async createDepartement(tid: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    return this.departementRepo.save(this.departementRepo.create(dto));
  }

  async updateDepartement(tid: string, id: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    const dept = await this.departementRepo.findOne({ where: { id } });
    if (!dept) throw new NotFoundException('Département non trouvé');
    return this.departementRepo.save({ ...dept, ...dto });
  }

  async deleteDepartement(tid: string, id: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const dept = await this.departementRepo.findOne({ where: { id } });
    if (!dept) throw new NotFoundException('Département non trouvé');
    await this.departementRepo.update(id, { actif: false });
    return { message: 'Département supprimé avec succès' };
  }

  // Parcours
  async createParcours(tid: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    
    // Validate required fields
    if (!dto.code || dto.code.trim() === '') {
      throw new BadRequestException('Le code du parcours est requis');
    }
    
    if (!dto.nom || dto.nom.trim() === '') {
      throw new BadRequestException('Le nom du parcours est requis');
    }
    
    // Check if departementId is provided and not empty
    if (!dto.departementId || dto.departementId.trim() === '') {
      throw new BadRequestException('Le département est requis');
    }
    
    // Check if code already exists
    const existingParcours = await this.parcoursRepo.findOne({
      where: { code: dto.code.trim() }
    });
    
    if (existingParcours) {
      throw new BadRequestException(`Un parcours avec le code "${dto.code}" existe déjà`);
    }
    
    // Verify department exists
    const departement = await this.departementRepo.findOne({
      where: { id: dto.departementId }
    });
    
    if (!departement) {
      throw new NotFoundException('Département non trouvé');
    }
    
    return this.parcoursRepo.save(this.parcoursRepo.create(dto));
  }

  async getParcours(tid?: string, userId?: string, userRole?: string) {
    if (tid) await this.tenantConnection.setTenantSchema(tid);
    
    // Construire la requête de base
    let query = this.parcoursRepo
      .createQueryBuilder('p')
      .leftJoin('secretaire_parcours', 'sp', 'sp.parcours_id = p.id AND sp.actif = true')
      .leftJoin('utilisateur', 'u', 'u.id = sp.secretaire_id')
      .select([
        'p.*',
        'sp.secretaire_id as "secretaireAssigneId"',
        'u.nom as "secretaireNom"',
        'u.prenom as "secretairePrenom"'
      ])
      .where('p.actif = true');
    
    // FILTRE: Si l'utilisateur est un secrétaire, ne montrer que ses parcours assignés
    if (userId && userRole === 'secretaire_parcours') {
      query = query.andWhere('sp.secretaire_id = :userId AND sp.actif = true', { userId });
    }
    
    const parcours = await query
      .orderBy('p.nom', 'ASC')
      .getRawMany();
    
    // Transformer les résultats pour inclure les infos du secrétaire
    return parcours.map(p => ({
      ...p,
      secretaireAssigne: p.secretaireAssigneId ? {
        id: p.secretaireAssigneId,
        nom: p.secretaireNom,
        prenom: p.secretairePrenom
      } : null
    }));
  }

  async updateParcours(tid: string, id: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    const parcours = await this.parcoursRepo.findOne({ where: { id } });
    if (!parcours) throw new NotFoundException('Parcours non trouvé');
    return this.parcoursRepo.save({ ...parcours, ...dto });
  }

  async deleteParcours(tid: string, id: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const parcours = await this.parcoursRepo.findOne({ where: { id } });
    if (!parcours) throw new NotFoundException('Parcours non trouvé');
    await this.parcoursRepo.update(id, { actif: false });
    return { message: 'Parcours supprimé avec succès' };
  }

  // UE
  async createUE(tid: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    return this.ueRepo.save(this.ueRepo.create(dto));
  }

  async getUEByParcours(tid: string, parcoursId: string) {
    await this.tenantConnection.setTenantSchema(tid);
    return this.ueRepo.find({ where: { parcoursId, actif: true }, order: { semestre: 'ASC', code: 'ASC' } });
  }

  async updateUE(tid: string, id: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    const ue = await this.ueRepo.findOne({ where: { id } });
    if (!ue) throw new NotFoundException('UE non trouvée');
    return this.ueRepo.save({ ...ue, ...dto });
  }

  async deleteUE(tid: string, id: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const ue = await this.ueRepo.findOne({ where: { id } });
    if (!ue) throw new NotFoundException('UE non trouvée');
    await this.ueRepo.update(id, { actif: false });
    return { message: 'UE supprimée avec succès' };
  }

  // Etudiants
  async getEtudiants(tid: string, parcoursId?: string) {
    this.logger.log(`[getEtudiants] Called with tenant: ${tid}, parcoursId: ${parcoursId}`);
    await this.tenantConnection.setTenantSchema(tid);
    const currentSchema = this.tenantConnection.getCurrentSchema();
    this.logger.log(`[getEtudiants] Schema set to: ${currentSchema}`);

    if (parcoursId) {
      // Get students enrolled in a specific parcours
      const inscriptions = await this.inscriptionRepo.find({
        where: { parcoursId },
        order: { createdAt: 'DESC' }
      });
      const etudiantIds = inscriptions.map(i => i.etudiantId);
      this.logger.log(`[getEtudiants] Found ${inscriptions.length} inscriptions for parcours ${parcoursId}`);
      
      if (etudiantIds.length === 0) {
        this.logger.warn(`[getEtudiants] No inscriptions found for parcours ${parcoursId}`);
        return [];
      }
      
      // Use In operator instead of deprecated findByIds
      const students = await this.etudiantRepo.find({
        where: { id: In(etudiantIds), actif: true },
        order: { nom: 'ASC', prenom: 'ASC' }
      });
      
      this.logger.log(`[getEtudiants] Returning ${students.length} active students for parcours ${parcoursId}`);
      return students;
    }

    // Get all active students if no parcours specified
    const allStudents = await this.etudiantRepo.find({
      where: { actif: true },
      order: { nom: 'ASC', prenom: 'ASC' }
    });
    this.logger.log(`[getEtudiants] Total active students in schema ${currentSchema}: ${allStudents.length}`);

    return allStudents;
  }

  async createEtudiant(tid: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    this.logger.log(`[createEtudiant] Creating student with data: ${JSON.stringify(dto)}`);
    
    const data = { ...dto };
    if (data.dateNaissance) {
      data.dateNaissance = new Date(data.dateNaissance);
    }
    
    try {
      // 1. Créer l'étudiant dans la table etudiant
      const entity = this.etudiantRepo.create(data);
      const savedEtudiant = await this.etudiantRepo.save(entity);
      // Ensure we have a single entity, not an array
      const etudiant = Array.isArray(savedEtudiant) ? savedEtudiant[0] : savedEtudiant;
      this.logger.log(`[createEtudiant] Student created with ID: ${etudiant.id}`);
      
      // 2. Créer automatiquement un compte utilisateur pour l'étudiant
      try {
        // Générer un email si non fourni
        const email = etudiant.email || `${etudiant.matricule}@etudiant.local`;
        this.logger.log(`[createEtudiant] Generated email for user account: ${email}`);
        
        // Vérifier si un utilisateur avec cet email existe déjà
        this.logger.log(`[createEtudiant] Checking if user exists with email: ${email}`);
        const existingUser = await this.dataSource.query(
          `SELECT id FROM utilisateur WHERE email = $1`,
          [email]
        );
        this.logger.log(`[createEtudiant] Existing user check result: ${existingUser.length} found`);
        
        if (existingUser.length === 0) {
          // Créer l'utilisateur sans mot de passe (sera défini lors de la première connexion)
          this.logger.log(`[createEtudiant] Creating new user account with data:`, {
            nom: etudiant.nom,
            prenom: etudiant.prenom,
            email: email,
            telephone: etudiant.telephone || null
          });
          
          // Générer un hash temporaire pour le mot de passe (sera changé à la première connexion)
          const tempPasswordHash = '$2b$10$TEMPORARY_HASH_TO_BE_CHANGED_ON_FIRST_LOGIN';
          
          const userResult = await this.dataSource.query(`
            INSERT INTO utilisateur (nom, prenom, email, role, actif, telephone, password_hash)
            VALUES ($1, $2, $3, 'etudiant', true, $4, $5)
            RETURNING id
          `, [
            etudiant.nom,
            etudiant.prenom,
            email,
            etudiant.telephone || null,
            tempPasswordHash
          ]);
          
          if (!userResult || userResult.length === 0) {
            throw new Error('User insertion returned no data');
          }
          
          const utilisateurId = userResult[0].id;
          this.logger.log(`[createEtudiant] User account created with ID: ${utilisateurId}`);
          
          // Mettre à jour l'étudiant avec l'ID utilisateur (si la colonne existe)
          try {
            this.logger.log(`[createEtudiant] Linking student ${etudiant.id} to user ${utilisateurId}`);
            await this.dataSource.query(`
              UPDATE etudiant SET utilisateur_id = $1 WHERE id = $2
            `, [utilisateurId, etudiant.id]);
            this.logger.log(`[createEtudiant] Student linked to user account successfully`);
          } catch (updateError) {
            // La colonne utilisateur_id n'existe peut-être pas, ce n'est pas grave
            const errMsg = updateError instanceof Error ? updateError.message : String(updateError);
            this.logger.warn(`[createEtudiant] Could not link student to user: ${errMsg}`);
          }
          
          return {
            ...etudiant,
            utilisateurId,
            compteCreé: true,
            message: 'Étudiant et compte utilisateur créés avec succès'
          };
        } else {
          this.logger.log(`[createEtudiant] User account already exists for email: ${email}`);
          return {
            ...etudiant,
            utilisateurId: existingUser[0].id,
            compteCreé: false,
            message: 'Étudiant créé, compte utilisateur existant'
          };
        }
      } catch (userError) {
        // Si la création du compte utilisateur échoue, on log mais on ne bloque pas
        const errorMsg = userError instanceof Error ? userError.message : String(userError);
        this.logger.error(`[createEtudiant] Error creating user account: ${errorMsg}`);
        if (userError instanceof Error && userError.stack) {
          this.logger.error(`[createEtudiant] Stack: ${userError.stack}`);
        }
        
        return {
          ...etudiant,
          compteCreé: false,
          message: 'Étudiant créé, mais erreur lors de la création du compte utilisateur',
          error: errorMsg
        };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`[createEtudiant] Error saving student: ${errorMsg}`);
      if (error instanceof Error && error.stack) {
        this.logger.error(`[createEtudiant] Stack: ${error.stack}`);
      }
      throw error;
    }
  }

  async updateEtudiant(tid: string, id: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    const etudiant = await this.etudiantRepo.findOne({ where: { id } });
    if (!etudiant) throw new NotFoundException('Etudiant non trouvé');
    const data = { ...dto };
    if (data.dateNaissance) {
      data.dateNaissance = new Date(data.dateNaissance);
    }
    return this.etudiantRepo.save({ ...etudiant, ...data });
  }

  async deleteEtudiant(tid: string, id: string) {
    this.logger.log(`[deleteEtudiant] Starting deletion for student ID: ${id}, tenant: ${tid}`);

    try {
      await this.tenantConnection.setTenantSchema(tid);
      this.logger.log(`[deleteEtudiant] Schema set for tenant: ${tid}`);

      const etudiant = await this.etudiantRepo.findOne({ where: { id } });
      this.logger.log(`[deleteEtudiant] Student lookup result: ${etudiant ? 'found' : 'not found'}`);

      if (!etudiant) {
        this.logger.warn(`[deleteEtudiant] Student not found with ID: ${id} in tenant: ${tid}`);
        throw new NotFoundException('Etudiant non trouvé');
      }

      this.logger.log(`[deleteEtudiant] Found student: ${etudiant.matricule} - ${etudiant.nom} ${etudiant.prenom}`);

      // Check for related records that might prevent soft delete
      const inscriptions = await this.inscriptionRepo.count({ where: { etudiantId: id } });
      const notes = await this.noteRepo.count({ where: { etudiantId: id } });
      const presences = await this.presenceRepo.count({ where: { etudiantId: id } });

      this.logger.log(`[deleteEtudiant] Related records - inscriptions: ${inscriptions}, notes: ${notes}, presences: ${presences}`);

      // Perform soft delete
      await this.etudiantRepo.update(id, { actif: false });
      this.logger.log(`[deleteEtudiant] Soft delete completed for student ID: ${id}`);

      return {
        message: 'Etudiant supprimé avec succès',
        student: {
          id: etudiant.id,
          matricule: etudiant.matricule,
          nom: etudiant.nom,
          prenom: etudiant.prenom
        },
        relatedRecords: { inscriptions, notes, presences }
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`[deleteEtudiant] Error deleting student ${id}: ${errorMsg}`);
      if (error instanceof Error && error.stack) {
        this.logger.error(`[deleteEtudiant] Stack trace: ${error.stack}`);
      }
      throw error;
    }
  }

  // Notes
  async saisirNote(tid: string, dto: any, saisiPar: string) {
    const existing = await this.noteRepo.findOne({
      where: { etudiantId: dto.etudiantId, ueId: dto.ueId, sessionId: dto.sessionId }
    });
    if (existing?.verrouille) throw new BadRequestException('Note verrouillee apres deliberation');
    const valeur = dto.valeur;
    const mention = this.getMention(valeur);
    if (existing) {
      return this.noteRepo.save({ ...existing, ...dto, mention, saisiPar });
    }
    return this.noteRepo.save(this.noteRepo.create({ ...dto, mention, saisiPar }));
  }

  private calcMoyenne(cc: number, exam: number): number {
    if (!cc && !exam) return 0;
    if (!cc) return Number(exam);
    if (!exam) return Number(cc);
    return parseFloat((Number(cc) * 0.4 + Number(exam) * 0.6).toFixed(2));
  }

  private getMention(note: number): string {
    if (note >= 16) return 'Tres Bien';
    if (note >= 14) return 'Bien';
    if (note >= 12) return 'Assez Bien';
    if (note >= 10) return 'Passable';
    return 'Insuffisant';
  }

  async deliberer(tid: string, parcoursId: string, sessionId: string, annee?: string) {
    const notes = await this.noteRepo.find({ where: { sessionId } });
    await this.noteRepo.save(notes.map(n => ({ ...n, verrouille: true, dateVerrouillage: new Date() })));
    return { message: 'Deliberation effectuee, notes verrouillee', count: notes.length };
  }

  getReleverNotes(tid: string, etudiantId: string, sessionId: string) {
    return this.noteRepo.find({ where: { etudiantId, sessionId } });
  }

  // Inscriptions
  async inscrire(tid: string, dto: any) {
    const ex = await this.inscriptionRepo.findOne({
      where: { etudiantId: dto.etudiantId, parcoursId: dto.parcoursId, anneeAcademiqueId: dto.anneeAcademiqueId }
    });
    if (ex) throw new BadRequestException('Etudiant deja inscrit pour cette annee');
    return this.inscriptionRepo.save(this.inscriptionRepo.create(dto));
  }

  getInscriptions(tid: string, parcoursId?: string) {
    const where: any = {};
    if (parcoursId) where.parcoursId = parcoursId;
    return this.inscriptionRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  // Presences
  saisirPresence(tid: string, dto: any) {
    return this.presenceRepo.save(this.presenceRepo.create(dto));
  }
  getPresencesEtudiant(tid: string, etudiantId: string) {
    return this.presenceRepo.find({ where: { etudiantId } });
  }
  saisirAbsence(tid: string, dto: any) { return this.saisirPresence(tid, dto); }
  getAbsencesEtudiant(tid: string, etudiantId: string) { return this.getPresencesEtudiant(tid, etudiantId); }

  // Salles & EDT
  getSalles(tid: string) { return this.salleRepo.find(); }
  createSalle(tid: string, dto: any) {
    return this.salleRepo.save(this.salleRepo.create(dto));
  }
  getEDT(tid?: string, parcoursId?: string) {
    return this.edtRepo.find();
  }
  createEDT(tid: string, dto: any) {
    return this.edtRepo.save(this.edtRepo.create(dto));
  }

  // Annees Academiques
  async getAnneesAcademiques(tid: string) {
    await this.tenantConnection.setTenantSchema(tid);
    return this.anneeRepo.find({ order: { dateDebut: 'DESC' } });
  }

  async createAnneeAcademique(tid: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    const data = { ...dto };
    if (data.dateDebut) data.dateDebut = new Date(data.dateDebut);
    if (data.dateFin) data.dateFin = new Date(data.dateFin);
    return this.anneeRepo.save(this.anneeRepo.create(data));
  }

  async updateAnneeAcademique(tid: string, id: string, dto: any) {
    await this.tenantConnection.setTenantSchema(tid);
    const annee = await this.anneeRepo.findOne({ where: { id } });
    if (!annee) throw new NotFoundException('Année académique non trouvée');
    const data = { ...dto };
    if (data.dateDebut) data.dateDebut = new Date(data.dateDebut);
    if (data.dateFin) data.dateFin = new Date(data.dateFin);
    return this.anneeRepo.save({ ...annee, ...data });
  }

  async activerAnneeAcademique(tid: string, id: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const annee = await this.anneeRepo.findOne({ where: { id } });
    if (!annee) throw new NotFoundException('Année académique non trouvée');
    
    // Désactiver toutes les autres années
    await this.anneeRepo.update({}, { active: false });
    
    // Activer celle-ci
    await this.anneeRepo.update(id, { active: true });
    
    return { message: 'Année académique activée avec succès', annee: { ...annee, active: true } };
  }

  // Enseignants (Utilisateurs avec rôle professeur)
  async getEnseignants(tid: string) {
    await this.tenantConnection.setTenantSchema(tid);
    return this.dataSource.query(`
      SELECT id, nom, prenom, email, telephone, photo_url, actif, created_at
      FROM utilisateur
      WHERE role = 'professeur' AND actif = true
      ORDER BY nom ASC, prenom ASC
    `);
  }

  // Sessions d'examens
  async getSessionsExamen(tid: string) {
    await this.tenantConnection.setTenantSchema(tid);
    return this.sessionRepo.find({ order: { createdAt: 'DESC' } });
  }

  // Presences
  async getPresences(tid: string, statut?: string) {
    await this.tenantConnection.setTenantSchema(tid);
    const where: any = {};
    if (statut) where.statut = statut;
    return this.presenceRepo.find({ where, order: { createdAt: 'DESC' } });
  }
}