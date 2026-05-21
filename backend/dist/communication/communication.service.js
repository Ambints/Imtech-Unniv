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
var CommunicationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let CommunicationService = CommunicationService_1 = class CommunicationService {
    constructor(dataSource, request) {
        this.dataSource = dataSource;
        this.request = request;
        this.logger = new common_1.Logger(CommunicationService_1.name);
        this.tenantSchema = this.request.tenantSchema || 'public';
        this.logger.log(`CommunicationService initialized with schema: ${this.tenantSchema}`);
        if (!this.request.tenantSchema) {
            this.logger.warn('No tenant schema found in request! Using public schema as fallback.');
        }
    }
    async query(sql, params = []) {
        try {
            if (!this.tenantSchema || this.tenantSchema === 'public') {
                throw new common_1.BadRequestException('Tenant schema not set. Please provide X-Tenant-Id header.');
            }
            const schemaQuery = `SET search_path TO "${this.tenantSchema}", public`;
            await this.dataSource.query(schemaQuery);
            this.logger.debug(`Executing query in schema: ${this.tenantSchema}`);
            return this.dataSource.query(sql, params);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Query error in schema ${this.tenantSchema}: ${errorMessage}`);
            throw error;
        }
    }
    async createEvenement(data) {
        return { message: 'Événement créé', data };
    }
    async findEvenements(dateDebut, dateFin, type) {
        return [];
    }
    async findEvenementsAvenir(limit = 10) {
        return [];
    }
    async updateEvenement(id, data) {
        return { message: 'Événement mis à jour', id, data };
    }
    async createCampagne(data) {
        return { message: 'Campagne créée', data };
    }
    async findCampagnes(statut) {
        return [];
    }
    async activerCampagne(id) {
        return { message: 'Campagne activée', id };
    }
    async envoyerCampagne(id) {
        return { message: 'Campagne envoyée', id };
    }
    async createAlerte(data) {
        return { message: 'Alerte créée', data };
    }
    async findAlertesActives() {
        return [];
    }
    async desactiverAlerte(id) {
        return { message: 'Alerte désactivée', id };
    }
    async publierResultats(data) {
        return { message: 'Résultats publiés', data };
    }
    async verifierResultats(sessionId) {
        return { message: 'Résultats vérifiés', sessionId };
    }
    async publierSurReseaux(data) {
        return { message: 'Publication sur réseaux sociaux', data };
    }
    async getStatsReseaux() {
        return { likes: 0, shares: 0, comments: 0 };
    }
    async createSujetForum(data) {
        return { message: 'Sujet de forum créé', data };
    }
    async findSujetsForum(categorie) {
        return [];
    }
    async repondreForum(sujetId, data) {
        return { message: 'Réponse ajoutée', sujetId, data };
    }
    async modererSujet(id, data) {
        return { message: 'Sujet modéré', id, data };
    }
    async genererDossierPresse(data) {
        return { message: 'Dossier de presse généré', data };
    }
    async getStatsPromotion() {
        return { etudiants: 0, enseignants: 0, parcours: 0 };
    }
    async createAnnonce(data) {
        try {
            if (!data.auteurId) {
                this.logger.error('createAnnonce: auteurId manquant dans les données', data);
                throw new common_1.BadRequestException('auteurId est requis pour créer une annonce');
            }
            if (!data.titre || !data.contenu) {
                this.logger.error('createAnnonce: titre ou contenu manquant', data);
                throw new common_1.BadRequestException('titre et contenu sont requis');
            }
            this.logger.log(`Creating annonce with auteurId: ${data.auteurId}, titre: ${data.titre}`);
            const result = await this.query(`
        INSERT INTO annonce (
          titre, contenu, type_annonce, cible, parcours_id,
          publie, date_expiration, auteur_id, photo_url
        ) VALUES ($1, $2, $3, $4, $5, false, $6, $7, $8)
        RETURNING *
      `, [
                data.titre, data.contenu, data.typeAnnonce || 'information',
                data.cible || 'tous', data.parcoursId || null,
                data.dateExpiration || null, data.auteurId, data.photoUrl || null
            ]);
            this.logger.log(`Annonce créée avec succès: ${result[0]?.id}`);
            return result[0];
        }
        catch (error) {
            this.logger.error('Erreur lors de la création de l\'annonce:', error);
            if (error instanceof Error) {
                this.logger.error(`Message: ${error.message}`);
                this.logger.error(`Stack: ${error.stack}`);
            }
            if (error && typeof error === 'object' && 'code' in error) {
                const pgError = error;
                this.logger.error(`PostgreSQL Error Code: ${pgError.code}`);
                this.logger.error(`PostgreSQL Detail: ${pgError.detail}`);
                this.logger.error(`PostgreSQL Constraint: ${pgError.constraint}`);
                if (pgError.code === '23502') {
                    throw new common_1.BadRequestException(`Champ requis manquant: ${pgError.column}`);
                }
                if (pgError.code === '23503') {
                    throw new common_1.BadRequestException(`Référence invalide: ${pgError.detail}`);
                }
            }
            throw error;
        }
    }
    async findAnnoncesPubliees(cible, type) {
        let sql = `
      SELECT a.*, u.nom || ' ' || u.prenom as auteur_nom
      FROM annonce a
      LEFT JOIN utilisateur u ON u.id = a.auteur_id
      WHERE a.publie = true
        AND (a.date_expiration IS NULL OR a.date_expiration > NOW())
    `;
        const params = [];
        let paramCount = 0;
        if (cible) {
            sql += ` AND (a.cible = $${++paramCount} OR a.cible = 'tous')`;
            params.push(cible);
        }
        if (type) {
            sql += ` AND a.type_annonce = $${++paramCount}`;
            params.push(type);
        }
        sql += ` ORDER BY a.date_publication DESC`;
        return this.query(sql, params);
    }
    async findAllAnnonces(filters) {
        let sql = `
      SELECT a.*, u.nom || ' ' || u.prenom as auteur_nom
      FROM annonce a
      LEFT JOIN utilisateur u ON u.id = a.auteur_id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 0;
        if (filters?.statut === 'publie') {
            sql += ` AND a.publie = true`;
        }
        else if (filters?.statut === 'brouillon') {
            sql += ` AND a.publie = false`;
        }
        if (filters?.type) {
            sql += ` AND a.type_annonce = $${++paramCount}`;
            params.push(filters.type);
        }
        sql += ` ORDER BY a.created_at DESC`;
        return this.query(sql, params);
    }
    async findAnnonceById(id) {
        const result = await this.query(`
      SELECT a.*, u.nom || ' ' || u.prenom as auteur_nom
      FROM annonce a
      LEFT JOIN utilisateur u ON u.id = a.auteur_id
      WHERE a.id = $1
    `, [id]);
        if (!result[0])
            throw new common_1.NotFoundException('Annonce non trouvée');
        return result[0];
    }
    async publierAnnonce(id) {
        await this.query(`
      UPDATE annonce 
      SET publie = true, date_publication = NOW()
      WHERE id = $1
    `, [id]);
        return this.findAnnonceById(id);
    }
    async depublierAnnonce(id) {
        await this.query(`
      UPDATE annonce SET publie = false WHERE id = $1
    `, [id]);
        return this.findAnnonceById(id);
    }
    async deleteAnnonce(id) {
        await this.query(`DELETE FROM annonce WHERE id = $1`, [id]);
    }
    async dupliquerAnnonce(id, nouvelAuteurId) {
        const originale = await this.findAnnonceById(id);
        const result = await this.query(`
      INSERT INTO annonce (
        titre, contenu, type_annonce, cible, parcours_id,
        publie, auteur_id, photo_url
      ) VALUES ($1, $2, $3, $4, $5, false, $6, $7)
      RETURNING *
    `, [
            `[COPIE] ${originale.titre}`, originale.contenu, originale.type_annonce,
            originale.cible, originale.parcours_id, nouvelAuteurId, originale.photo_url
        ]);
        return result[0];
    }
    async envoyerNotificationCiblee(data) {
        const { filieres, annees, niveaux, titre, message } = data;
        let sql = `
      SELECT DISTINCT u.id, u.email, u.telephone
      FROM utilisateur u
      JOIN inscription i ON i.etudiant_id = u.id
      WHERE i.statut = 'validee'
    `;
        const conditions = [];
        const params = [];
        let paramCount = 0;
        if (filieres?.length) {
            conditions.push(`i.parcours_id = ANY($${++paramCount})`);
            params.push(filieres);
        }
        if (annees?.length) {
            conditions.push(`EXTRACT(YEAR FROM i.date_inscription) = ANY($${++paramCount})`);
            params.push(annees);
        }
        if (niveaux?.length) {
            conditions.push(`i.annee_niveau = ANY($${++paramCount})`);
            params.push(niveaux);
        }
        if (conditions.length) {
            sql += ` AND ${conditions.join(' AND ')}`;
        }
        const cibles = await this.query(sql, params);
        let envoyees = 0;
        for (const cible of cibles) {
            await this.query(`
        INSERT INTO notification (utilisateur_id, titre, message, type_notification, lue)
        VALUES ($1, $2, $3, 'info', false)
      `, [cible.id, titre, message]);
            envoyees++;
        }
        return { envoyees, cibles: cibles.length };
    }
    async getStatsNotifications(dateDebut, dateFin) {
        let dateFilter = '';
        const params = [];
        if (dateDebut && dateFin) {
            dateFilter = `WHERE created_at BETWEEN $1 AND $2`;
            params.push(dateDebut, dateFin);
        }
        return this.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE lue = true) as lues,
        COUNT(*) FILTER (WHERE lue = false) as non_lues,
        type_notification,
        COUNT(*) as count_par_type
      FROM notification
      ${dateFilter}
      GROUP BY type_notification
    `, params);
    }
    async envoyerMessage(data) {
        const result = await this.query(`
      INSERT INTO message (expediteur_id, destinataire_id, sujet, contenu, lu)
      VALUES ($1, $2, $3, $4, false)
      RETURNING *
    `, [data.expediteurId, data.destinataireId, data.sujet, data.contenu]);
        return result[0];
    }
    async getMessagesRecus(utilisateurId, nonLus) {
        let sql = `
      SELECT m.*, 
        u_exp.nom || ' ' || u_exp.prenom as expediteur_nom,
        u_exp.email as expediteur_email
      FROM message m
      LEFT JOIN utilisateur u_exp ON u_exp.id = m.expediteur_id
      WHERE m.destinataire_id = $1
    `;
        const params = [utilisateurId];
        if (nonLus) {
            sql += ` AND m.lu = false`;
        }
        sql += ` ORDER BY m.created_at DESC`;
        return this.query(sql, params);
    }
    async getMessagesEnvoyes(utilisateurId) {
        return this.query(`
      SELECT m.*,
        u_dest.nom || ' ' || u_dest.prenom as destinataire_nom,
        u_dest.email as destinataire_email
      FROM message m
      LEFT JOIN utilisateur u_dest ON u_dest.id = m.destinataire_id
      WHERE m.expediteur_id = $1
      ORDER BY m.created_at DESC
    `, [utilisateurId]);
    }
    async marquerMessageLu(id) {
        await this.query(`
      UPDATE message SET lu = true, lu_at = NOW() WHERE id = $1
    `, [id]);
        const result = await this.query(`SELECT * FROM message WHERE id = $1`, [id]);
        return result[0];
    }
    async getDashboard() {
        const [annonces, notifications] = await Promise.all([
            this.query(`SELECT COUNT(*) as count FROM annonce WHERE publie = true`),
            this.query(`SELECT COUNT(*) as count FROM notification WHERE lue = false`),
        ]);
        return {
            annoncesPubliees: parseInt(annonces[0]?.count || 0),
            notificationsNonLues: parseInt(notifications[0]?.count || 0),
        };
    }
};
exports.CommunicationService = CommunicationService;
exports.CommunicationService = CommunicationService = CommunicationService_1 = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, typeorm_1.InjectDataSource)('tenant')),
    __param(1, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [typeorm_2.DataSource, Object])
], CommunicationService);
//# sourceMappingURL=communication.service.js.map