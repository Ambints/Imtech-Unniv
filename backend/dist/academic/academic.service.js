"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AcademicService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const typeorm_3 = require("@nestjs/typeorm");
const academic_entities_1 = require("./academic.entities");
const tenant_connection_service_1 = require("../tenants/tenant-connection.service");
let AcademicService = AcademicService_1 = class AcademicService {
    constructor(parcoursRepo, ueRepo, noteRepo, inscriptionRepo, presenceRepo, salleRepo, edtRepo, departementRepo, etudiantRepo, anneeRepo, sessionRepo, dataSource, tenantConnection) {
        this.parcoursRepo = parcoursRepo;
        this.ueRepo = ueRepo;
        this.noteRepo = noteRepo;
        this.inscriptionRepo = inscriptionRepo;
        this.presenceRepo = presenceRepo;
        this.salleRepo = salleRepo;
        this.edtRepo = edtRepo;
        this.departementRepo = departementRepo;
        this.etudiantRepo = etudiantRepo;
        this.anneeRepo = anneeRepo;
        this.sessionRepo = sessionRepo;
        this.dataSource = dataSource;
        this.tenantConnection = tenantConnection;
        this.logger = new common_1.Logger(AcademicService_1.name);
    }
    async getDepartementsFromContext() {
        return this.departementRepo.find({ where: { actif: true }, order: { nom: 'ASC' } });
    }
    async getDepartements(tid) {
        await this.tenantConnection.setTenantSchema(tid);
        return this.departementRepo.find({ where: { actif: true }, order: { nom: 'ASC' } });
    }
    async createDepartement(tid, dto) {
        await this.tenantConnection.setTenantSchema(tid);
        return this.departementRepo.save(this.departementRepo.create(dto));
    }
    async updateDepartement(tid, id, dto) {
        await this.tenantConnection.setTenantSchema(tid);
        const dept = await this.departementRepo.findOne({ where: { id } });
        if (!dept)
            throw new common_1.NotFoundException('Département non trouvé');
        return this.departementRepo.save({ ...dept, ...dto });
    }
    async deleteDepartement(tid, id) {
        await this.tenantConnection.setTenantSchema(tid);
        const dept = await this.departementRepo.findOne({ where: { id } });
        if (!dept)
            throw new common_1.NotFoundException('Département non trouvé');
        await this.departementRepo.update(id, { actif: false });
        return { message: 'Département supprimé avec succès' };
    }
    async createParcours(tid, dto) {
        await this.tenantConnection.setTenantSchema(tid);
        if (!dto.code || dto.code.trim() === '') {
            throw new common_1.BadRequestException('Le code du parcours est requis');
        }
        if (!dto.nom || dto.nom.trim() === '') {
            throw new common_1.BadRequestException('Le nom du parcours est requis');
        }
        if (!dto.departementId || dto.departementId.trim() === '') {
            throw new common_1.BadRequestException('Le département est requis');
        }
        const existingParcours = await this.parcoursRepo.findOne({
            where: { code: dto.code.trim() }
        });
        if (existingParcours) {
            throw new common_1.BadRequestException(`Un parcours avec le code "${dto.code}" existe déjà`);
        }
        const departement = await this.departementRepo.findOne({
            where: { id: dto.departementId }
        });
        if (!departement) {
            throw new common_1.NotFoundException('Département non trouvé');
        }
        return this.parcoursRepo.save(this.parcoursRepo.create(dto));
    }
    async getParcours(tid, userId, userRole) {
        if (tid)
            await this.tenantConnection.setTenantSchema(tid);
        let query = this.parcoursRepo
            .createQueryBuilder('p')
            .leftJoin('secretaire_parcours', 'sp', 'sp.parcours_id = p.id AND sp.actif = true')
            .leftJoin('utilisateur', 'u', 'u.id = sp.secretaire_id')
            .leftJoin('utilisateur', 'rp', 'rp.id = p.responsable_id')
            .select([
            'p.*',
            'sp.secretaire_id as "secretaireAssigneId"',
            'u.nom as "secretaireNom"',
            'u.prenom as "secretairePrenom"',
            'rp.id as "responsableId"',
            'rp.nom as "responsableNom"',
            'rp.prenom as "responsablePrenom"',
            'rp.email as "responsableEmail"'
        ])
            .where('p.actif = true');
        if (userId && userRole === 'secretaire_parcours') {
            query = query.andWhere('sp.secretaire_id = :userId AND sp.actif = true', { userId });
        }
        const parcours = await query
            .orderBy('p.nom', 'ASC')
            .getRawMany();
        return parcours.map(p => ({
            ...p,
            secretaireAssigne: p.secretaireAssigneId ? {
                id: p.secretaireAssigneId,
                nom: p.secretaireNom,
                prenom: p.secretairePrenom
            } : null,
            responsable: p.responsableId ? {
                id: p.responsableId,
                nom: p.responsableNom,
                prenom: p.responsablePrenom,
                email: p.responsableEmail
            } : null
        }));
    }
    async updateParcours(tid, id, dto) {
        await this.tenantConnection.setTenantSchema(tid);
        const parcours = await this.parcoursRepo.findOne({ where: { id } });
        if (!parcours)
            throw new common_1.NotFoundException('Parcours non trouvé');
        return this.parcoursRepo.save({ ...parcours, ...dto });
    }
    async deleteParcours(tid, id) {
        await this.tenantConnection.setTenantSchema(tid);
        const parcours = await this.parcoursRepo.findOne({ where: { id } });
        if (!parcours)
            throw new common_1.NotFoundException('Parcours non trouvé');
        await this.parcoursRepo.update(id, { actif: false });
        return { message: 'Parcours supprimé avec succès' };
    }
    async createUE(tid, dto) {
        await this.tenantConnection.setTenantSchema(tid);
        return this.ueRepo.save(this.ueRepo.create(dto));
    }
    async getUEByParcours(tid, parcoursId) {
        await this.tenantConnection.setTenantSchema(tid);
        return this.ueRepo.find({ where: { parcoursId, actif: true }, order: { semestre: 'ASC', code: 'ASC' } });
    }
    async updateUE(tid, id, dto) {
        await this.tenantConnection.setTenantSchema(tid);
        const ue = await this.ueRepo.findOne({ where: { id } });
        if (!ue)
            throw new common_1.NotFoundException('UE non trouvée');
        return this.ueRepo.save({ ...ue, ...dto });
    }
    async deleteUE(tid, id) {
        await this.tenantConnection.setTenantSchema(tid);
        const ue = await this.ueRepo.findOne({ where: { id } });
        if (!ue)
            throw new common_1.NotFoundException('UE non trouvée');
        await this.ueRepo.update(id, { actif: false });
        return { message: 'UE supprimée avec succès' };
    }
    async getEtudiants(tid, parcoursId) {
        this.logger.log(`[getEtudiants] Called with tenant: ${tid}, parcoursId: ${parcoursId}`);
        await this.tenantConnection.setTenantSchema(tid);
        const currentSchema = this.tenantConnection.getCurrentSchema();
        this.logger.log(`[getEtudiants] Schema set to: ${currentSchema}`);
        if (parcoursId) {
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
            const students = await this.etudiantRepo.find({
                where: { id: (0, typeorm_2.In)(etudiantIds), actif: true },
                order: { nom: 'ASC', prenom: 'ASC' }
            });
            this.logger.log(`[getEtudiants] Returning ${students.length} active students for parcours ${parcoursId}`);
            return students;
        }
        const allStudents = await this.etudiantRepo.find({
            where: { actif: true },
            order: { nom: 'ASC', prenom: 'ASC' }
        });
        this.logger.log(`[getEtudiants] Total active students in schema ${currentSchema}: ${allStudents.length}`);
        return allStudents;
    }
    async createEtudiant(tid, dto) {
        await this.tenantConnection.setTenantSchema(tid);
        this.logger.log(`[createEtudiant] Creating student with data: ${JSON.stringify(dto)}`);
        const data = { ...dto };
        if (data.dateNaissance) {
            data.dateNaissance = new Date(data.dateNaissance);
        }
        try {
            const entity = this.etudiantRepo.create(data);
            const savedEtudiant = await this.etudiantRepo.save(entity);
            const etudiant = Array.isArray(savedEtudiant) ? savedEtudiant[0] : savedEtudiant;
            this.logger.log(`[createEtudiant] Student created with ID: ${etudiant.id}`);
            try {
                const email = etudiant.email || `${etudiant.matricule}@etudiant.local`;
                this.logger.log(`[createEtudiant] Generated email for user account: ${email}`);
                this.logger.log(`[createEtudiant] Checking if user exists with email: ${email}`);
                const existingUser = await this.dataSource.query(`SELECT id FROM utilisateur WHERE email = $1`, [email]);
                this.logger.log(`[createEtudiant] Existing user check result: ${existingUser.length} found`);
                if (existingUser.length === 0) {
                    this.logger.log(`[createEtudiant] Creating new user account with data:`, {
                        nom: etudiant.nom,
                        prenom: etudiant.prenom,
                        email: email,
                        telephone: etudiant.telephone || null
                    });
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
                    try {
                        this.logger.log(`[createEtudiant] Linking student ${etudiant.id} to user ${utilisateurId}`);
                        await this.dataSource.query(`
              UPDATE etudiant SET utilisateur_id = $1 WHERE id = $2
            `, [utilisateurId, etudiant.id]);
                        this.logger.log(`[createEtudiant] Student linked to user account successfully`);
                    }
                    catch (updateError) {
                        const errMsg = updateError instanceof Error ? updateError.message : String(updateError);
                        this.logger.warn(`[createEtudiant] Could not link student to user: ${errMsg}`);
                    }
                    return {
                        ...etudiant,
                        utilisateurId,
                        compteCreé: true,
                        message: 'Étudiant et compte utilisateur créés avec succès'
                    };
                }
                else {
                    this.logger.log(`[createEtudiant] User account already exists for email: ${email}`);
                    return {
                        ...etudiant,
                        utilisateurId: existingUser[0].id,
                        compteCreé: false,
                        message: 'Étudiant créé, compte utilisateur existant'
                    };
                }
            }
            catch (userError) {
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
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`[createEtudiant] Error saving student: ${errorMsg}`);
            if (error instanceof Error && error.stack) {
                this.logger.error(`[createEtudiant] Stack: ${error.stack}`);
            }
            throw error;
        }
    }
    async updateEtudiant(tid, id, dto) {
        await this.tenantConnection.setTenantSchema(tid);
        const etudiant = await this.etudiantRepo.findOne({ where: { id } });
        if (!etudiant)
            throw new common_1.NotFoundException('Etudiant non trouvé');
        const data = { ...dto };
        if (data.dateNaissance) {
            data.dateNaissance = new Date(data.dateNaissance);
        }
        return this.etudiantRepo.save({ ...etudiant, ...data });
    }
    async deleteEtudiant(tid, id) {
        this.logger.log(`[deleteEtudiant] Starting deletion for student ID: ${id}, tenant: ${tid}`);
        try {
            await this.tenantConnection.setTenantSchema(tid);
            this.logger.log(`[deleteEtudiant] Schema set for tenant: ${tid}`);
            const etudiant = await this.etudiantRepo.findOne({ where: { id } });
            this.logger.log(`[deleteEtudiant] Student lookup result: ${etudiant ? 'found' : 'not found'}`);
            if (!etudiant) {
                this.logger.warn(`[deleteEtudiant] Student not found with ID: ${id} in tenant: ${tid}`);
                throw new common_1.NotFoundException('Etudiant non trouvé');
            }
            this.logger.log(`[deleteEtudiant] Found student: ${etudiant.matricule} - ${etudiant.nom} ${etudiant.prenom}`);
            const inscriptions = await this.inscriptionRepo.count({ where: { etudiantId: id } });
            const notes = await this.noteRepo.count({ where: { etudiantId: id } });
            const presences = await this.presenceRepo.count({ where: { etudiantId: id } });
            this.logger.log(`[deleteEtudiant] Related records - inscriptions: ${inscriptions}, notes: ${notes}, presences: ${presences}`);
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
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`[deleteEtudiant] Error deleting student ${id}: ${errorMsg}`);
            if (error instanceof Error && error.stack) {
                this.logger.error(`[deleteEtudiant] Stack trace: ${error.stack}`);
            }
            throw error;
        }
    }
    async saisirNote(tid, dto, saisiPar) {
        const existing = await this.noteRepo.findOne({
            where: { etudiantId: dto.etudiantId, ueId: dto.ueId, sessionId: dto.sessionId }
        });
        if (existing?.verrouille)
            throw new common_1.BadRequestException('Note verrouillee apres deliberation');
        const valeur = dto.valeur;
        const mention = this.getMention(valeur);
        if (existing) {
            return this.noteRepo.save({ ...existing, ...dto, mention, saisiPar });
        }
        return this.noteRepo.save(this.noteRepo.create({ ...dto, mention, saisiPar }));
    }
    calcMoyenne(cc, exam) {
        if (!cc && !exam)
            return 0;
        if (!cc)
            return Number(exam);
        if (!exam)
            return Number(cc);
        return parseFloat((Number(cc) * 0.4 + Number(exam) * 0.6).toFixed(2));
    }
    getMention(note) {
        if (note >= 16)
            return 'Tres Bien';
        if (note >= 14)
            return 'Bien';
        if (note >= 12)
            return 'Assez Bien';
        if (note >= 10)
            return 'Passable';
        return 'Insuffisant';
    }
    async deliberer(tid, parcoursId, sessionId, annee) {
        const notes = await this.noteRepo.find({ where: { sessionId } });
        await this.noteRepo.save(notes.map(n => ({ ...n, verrouille: true, dateVerrouillage: new Date() })));
        return { message: 'Deliberation effectuee, notes verrouillee', count: notes.length };
    }
    getReleverNotes(tid, etudiantId, sessionId) {
        return this.noteRepo.find({ where: { etudiantId, sessionId } });
    }
    async inscrire(tid, dto) {
        const ex = await this.inscriptionRepo.findOne({
            where: { etudiantId: dto.etudiantId, parcoursId: dto.parcoursId, anneeAcademiqueId: dto.anneeAcademiqueId }
        });
        if (ex)
            throw new common_1.BadRequestException('Etudiant deja inscrit pour cette annee');
        return this.inscriptionRepo.save(this.inscriptionRepo.create(dto));
    }
    getInscriptions(tid, parcoursId) {
        const where = {};
        if (parcoursId)
            where.parcoursId = parcoursId;
        return this.inscriptionRepo.find({ where, order: { createdAt: 'DESC' } });
    }
    saisirPresence(tid, dto) {
        return this.presenceRepo.save(this.presenceRepo.create(dto));
    }
    getPresencesEtudiant(tid, etudiantId) {
        return this.presenceRepo.find({ where: { etudiantId } });
    }
    saisirAbsence(tid, dto) { return this.saisirPresence(tid, dto); }
    getAbsencesEtudiant(tid, etudiantId) { return this.getPresencesEtudiant(tid, etudiantId); }
    getSalles(tid) { return this.salleRepo.find(); }
    createSalle(tid, dto) {
        return this.salleRepo.save(this.salleRepo.create(dto));
    }
    getEDT(tid, parcoursId) {
        return this.edtRepo.find();
    }
    createEDT(tid, dto) {
        return this.edtRepo.save(this.edtRepo.create(dto));
    }
    async getAnneesAcademiques(tid) {
        await this.tenantConnection.setTenantSchema(tid);
        return this.anneeRepo.find({ order: { dateDebut: 'DESC' } });
    }
    async createAnneeAcademique(tid, dto) {
        await this.tenantConnection.setTenantSchema(tid);
        const data = { ...dto };
        if (data.dateDebut)
            data.dateDebut = new Date(data.dateDebut);
        if (data.dateFin)
            data.dateFin = new Date(data.dateFin);
        return this.anneeRepo.save(this.anneeRepo.create(data));
    }
    async updateAnneeAcademique(tid, id, dto) {
        await this.tenantConnection.setTenantSchema(tid);
        const annee = await this.anneeRepo.findOne({ where: { id } });
        if (!annee)
            throw new common_1.NotFoundException('Année académique non trouvée');
        const data = { ...dto };
        if (data.dateDebut)
            data.dateDebut = new Date(data.dateDebut);
        if (data.dateFin)
            data.dateFin = new Date(data.dateFin);
        return this.anneeRepo.save({ ...annee, ...data });
    }
    async activerAnneeAcademique(tid, id) {
        await this.tenantConnection.setTenantSchema(tid);
        const annee = await this.anneeRepo.findOne({ where: { id } });
        if (!annee)
            throw new common_1.NotFoundException('Année académique non trouvée');
        await this.anneeRepo.update({}, { active: false });
        await this.anneeRepo.update(id, { active: true });
        return { message: 'Année académique activée avec succès', annee: { ...annee, active: true } };
    }
    async getEnseignants(tid) {
        await this.tenantConnection.setTenantSchema(tid);
        return this.dataSource.query(`
      SELECT id, nom, prenom, email, telephone, photo_url, actif, created_at
      FROM utilisateur
      WHERE role = 'enseignant' AND actif = true
      ORDER BY nom ASC, prenom ASC
    `);
    }
    async getSessionsExamen(tid) {
        await this.tenantConnection.setTenantSchema(tid);
        return this.sessionRepo.find({ order: { createdAt: 'DESC' } });
    }
    async getPresences(tid, statut) {
        await this.tenantConnection.setTenantSchema(tid);
        const where = {};
        if (statut)
            where.statut = statut;
        return this.presenceRepo.find({ where, order: { createdAt: 'DESC' } });
    }
};
exports.AcademicService = AcademicService;
exports.AcademicService = AcademicService = AcademicService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(academic_entities_1.Parcours, 'tenant')),
    __param(1, (0, typeorm_1.InjectRepository)(academic_entities_1.UniteEnseignement, 'tenant')),
    __param(2, (0, typeorm_1.InjectRepository)(academic_entities_1.Note, 'tenant')),
    __param(3, (0, typeorm_1.InjectRepository)(academic_entities_1.Inscription, 'tenant')),
    __param(4, (0, typeorm_1.InjectRepository)(academic_entities_1.Presence, 'tenant')),
    __param(5, (0, typeorm_1.InjectRepository)(academic_entities_1.Salle, 'tenant')),
    __param(6, (0, typeorm_1.InjectRepository)(academic_entities_1.EmploiDuTemps, 'tenant')),
    __param(7, (0, typeorm_1.InjectRepository)(academic_entities_1.Departement, 'tenant')),
    __param(8, (0, typeorm_1.InjectRepository)(academic_entities_1.Etudiant, 'tenant')),
    __param(9, (0, typeorm_1.InjectRepository)(academic_entities_1.AnneeAcademique, 'tenant')),
    __param(10, (0, typeorm_1.InjectRepository)(academic_entities_1.SessionExamen, 'tenant')),
    __param(11, (0, typeorm_3.InjectDataSource)('tenant')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        tenant_connection_service_1.TenantConnectionService])
], AcademicService);
//# sourceMappingURL=academic.service.js.map