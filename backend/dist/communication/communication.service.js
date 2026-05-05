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
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const communication_entities_1 = require("./communication.entities");
let CommunicationService = CommunicationService_1 = class CommunicationService {
    constructor(annonceRepo, notifRepo, messageRepo, dataSource) {
        this.annonceRepo = annonceRepo;
        this.notifRepo = notifRepo;
        this.messageRepo = messageRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(CommunicationService_1.name);
    }
    async createAnnonce(data) {
        const annonce = this.annonceRepo.create({
            ...data,
            publie: false,
        });
        return this.annonceRepo.save(annonce);
    }
    async findAnnoncesPubliees(cible, type) {
        const query = this.annonceRepo.createQueryBuilder('a')
            .where('a.publie = :publie', { publie: true })
            .andWhere('(a.dateExpiration IS NULL OR a.dateExpiration > :now)', { now: new Date() });
        if (cible) {
            query.andWhere('(a.cible = :cible OR a.cible = :tous)', { cible, tous: 'tous' });
        }
        if (type) {
            query.andWhere('a.typeAnnonce = :type', { type });
        }
        return query.orderBy('a.datePublication', 'DESC').getMany();
    }
    async findAllAnnonces(filters) {
        const query = this.annonceRepo.createQueryBuilder('a')
            .leftJoinAndSelect('a.auteur', 'u');
        if (filters?.statut === 'publie') {
            query.andWhere('a.publie = true');
        }
        else if (filters?.statut === 'brouillon') {
            query.andWhere('a.publie = false');
        }
        if (filters?.type) {
            query.andWhere('a.typeAnnonce = :type', { type: filters.type });
        }
        return query.orderBy('a.createdAt', 'DESC').getMany();
    }
    async findAnnonceById(id) {
        const annonce = await this.annonceRepo.findOne({ where: { id } });
        if (!annonce)
            throw new common_1.NotFoundException('Annonce non trouvée');
        return annonce;
    }
    async publierAnnonce(id) {
        await this.annonceRepo.update(id, {
            publie: true,
            datePublication: new Date(),
        });
        return this.findAnnonceById(id);
    }
    async depublierAnnonce(id) {
        await this.annonceRepo.update(id, { publie: false });
        return this.findAnnonceById(id);
    }
    async deleteAnnonce(id) {
        await this.annonceRepo.delete(id);
    }
    async dupliquerAnnonce(id, nouvelAuteurId) {
        const originale = await this.findAnnonceById(id);
        const copie = this.annonceRepo.create({
            ...originale,
            id: undefined,
            titre: `[COPIE] ${originale.titre}`,
            auteurId: nouvelAuteurId,
            publie: false,
            datePublication: null,
            createdAt: undefined,
            updatedAt: undefined,
        });
        return this.annonceRepo.save(copie);
    }
    async createEvenement(data) {
        const evenement = await this.dataSource.query(`
      INSERT INTO evenement (
        titre, description, type_evenement, date_debut, date_fin, 
        lieu, public_cible, organisateur_id, statut, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'planifie', NOW())
      RETURNING *
    `, [data.titre, data.description, data.type, data.dateDebut, data.dateFin,
            data.lieu, data.publicCible, data.auteurId]);
        return evenement[0];
    }
    async findEvenements(dateDebut, dateFin, type) {
        let query = `SELECT e.*, u.nom || ' ' || u.prenom as organisateur_nom
                 FROM evenement e
                 LEFT JOIN utilisateur u ON u.id = e.organisateur_id
                 WHERE 1=1`;
        const params = [];
        let paramCount = 0;
        if (dateDebut && dateFin) {
            query += ` AND e.date_debut BETWEEN $${++paramCount} AND $${++paramCount}`;
            params.push(dateDebut, dateFin);
        }
        if (type) {
            query += ` AND e.type_evenement = $${++paramCount}`;
            params.push(type);
        }
        query += ` ORDER BY e.date_debut`;
        return this.dataSource.query(query, params);
    }
    async findEvenementsAvenir(limit = 10) {
        return this.dataSource.query(`
      SELECT e.*, u.nom || ' ' || u.prenom as organisateur_nom
      FROM evenement e
      LEFT JOIN utilisateur u ON u.id = e.organisateur_id
      WHERE e.date_debut >= NOW()
        AND e.statut = 'planifie'
      ORDER BY e.date_debut
      LIMIT $1
    `, [limit]);
    }
    async updateEvenement(id, data) {
        const fields = [];
        const values = [];
        let paramCount = 0;
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                fields.push(`${key} = $${++paramCount}`);
                values.push(data[key]);
            }
        });
        if (fields.length === 0)
            return this.findEvenementById(id);
        values.push(id);
        await this.dataSource.query(`
      UPDATE evenement SET ${fields.join(', ')} WHERE id = $${++paramCount}
    `, values);
        return this.findEvenementById(id);
    }
    async findEvenementById(id) {
        const result = await this.dataSource.query(`
      SELECT e.*, u.nom || ' ' || u.prenom as organisateur_nom
      FROM evenement e
      LEFT JOIN utilisateur u ON u.id = e.organisateur_id
      WHERE e.id = $1
    `, [id]);
        return result[0];
    }
    async createCampagne(data) {
        const campagne = await this.dataSource.query(`
      INSERT INTO campagne_inscription (
        titre, description, parcours_cibles, annee_academique_id,
        date_debut, date_fin, canal_diffusion, statut, auteur_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'brouillon', $8, NOW())
      RETURNING *
    `, [data.titre, data.description, data.parcoursCibles, data.anneeAcademiqueId,
            data.dateDebut, data.dateFin, data.canalDiffusion || 'tous', data.auteurId]);
        return campagne[0];
    }
    async findCampagnes(statut) {
        let query = `SELECT c.*, aa.libelle as annee_academique
                 FROM campagne_inscription c
                 JOIN annee_academique aa ON aa.id = c.annee_academique_id
                 WHERE 1=1`;
        const params = [];
        if (statut) {
            query += ` AND c.statut = $1`;
            params.push(statut);
        }
        query += ` ORDER BY c.created_at DESC`;
        return this.dataSource.query(query, params);
    }
    async activerCampagne(id) {
        await this.dataSource.query(`
      UPDATE campagne_inscription SET statut = 'active', date_activation = NOW() WHERE id = $1
    `, [id]);
        return this.findCampagneById(id);
    }
    async envoyerCampagne(id) {
        const campagne = await this.findCampagneById(id);
        await this.dataSource.query(`
      UPDATE campagne_inscription SET statut = 'envoyee', date_envoi = NOW() WHERE id = $1
    `, [id]);
        return { ...campagne, statut: 'envoyee', message: 'Campagne envoyée avec succès' };
    }
    async findCampagneById(id) {
        const result = await this.dataSource.query(`
      SELECT c.*, aa.libelle as annee_academique
      FROM campagne_inscription c
      JOIN annee_academique aa ON aa.id = c.annee_academique_id
      WHERE c.id = $1
    `, [id]);
        return result[0];
    }
    async envoyerNotificationCiblee(data) {
        const { filieres, annees, niveaux, titre, message } = data;
        let query = `
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
            query += ` AND ${conditions.join(' AND ')}`;
        }
        const cibles = await this.dataSource.query(query, params);
        const notifications = [];
        for (const cible of cibles) {
            const notif = this.notifRepo.create({
                utilisateurId: cible.id,
                titre,
                message,
                typeNotification: 'info',
                lue: false,
            });
            notifications.push(await this.notifRepo.save(notif));
        }
        return { envoyees: notifications.length, cibles: cibles.length };
    }
    async getStatsNotifications(dateDebut, dateFin) {
        let dateFilter = '';
        const params = [];
        if (dateDebut && dateFin) {
            dateFilter = `WHERE created_at BETWEEN $1 AND $2`;
            params.push(dateDebut, dateFin);
        }
        const result = await this.dataSource.query(`
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
        return result;
    }
    async createAlerte(data) {
        const alerte = await this.dataSource.query(`
      INSERT INTO alerte_institutionnelle (
        titre, message, type_alerte, niveau_urgence,
        date_debut, date_fin, auteur_id, actif, created_at
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, true, NOW())
      RETURNING *
    `, [data.titre, data.message, data.type, data.niveauUrgence || 'moyen', data.dateFin, data.auteurId]);
        return alerte[0];
    }
    async findAlertesActives() {
        return this.dataSource.query(`
      SELECT *
      FROM alerte_institutionnelle
      WHERE actif = true
        AND (date_fin IS NULL OR date_fin > NOW())
      ORDER BY 
        CASE niveau_urgence 
          WHEN 'critique' THEN 1
          WHEN 'eleve' THEN 2
          WHEN 'moyen' THEN 3
          ELSE 4
        END,
        created_at DESC
    `);
    }
    async desactiverAlerte(id) {
        await this.dataSource.query(`
      UPDATE alerte_institutionnelle SET actif = false, date_desactivation = NOW() WHERE id = $1
    `, [id]);
        return { id, actif: false };
    }
    async publierResultats(data) {
        const { sessionId, masquerPartiel = true, datePublication } = data;
        const publication = await this.dataSource.query(`
      INSERT INTO publication_resultat (
        session_id, masquage_partiel, date_publication, publie_par, statut
      ) VALUES ($1, $2, $3, $4, 'publie')
      RETURNING *
    `, [sessionId, masquerPartiel, datePublication || new Date(), data.publiePar]);
        await this.dataSource.query(`
      UPDATE note SET publie = true WHERE session_id = $1
    `, [sessionId]);
        return publication[0];
    }
    async verifierResultats(sessionId) {
        const verifications = await this.dataSource.query(`
      SELECT 
        COUNT(*) as total_notes,
        COUNT(*) FILTER (WHERE valeur IS NULL) as notes_manquantes,
        COUNT(*) FILTER (WHERE valeur < 0 OR valeur > 20) as notes_anormales,
        COUNT(DISTINCT etudiant_id) as nb_etudiants,
        COUNT(DISTINCT ec_id) as nb_ecs
      FROM note
      WHERE session_id = $1
    `, [sessionId]);
        const anomalies = await this.dataSource.query(`
      SELECT n.*, e.nom, e.prenom, ec.intitule as ec_nom
      FROM note n
      JOIN etudiant e ON e.id = n.etudiant_id
      JOIN element_constitutif ec ON ec.id = n.ec_id
      WHERE n.session_id = $1
        AND (n.valeur IS NULL OR n.valeur < 0 OR n.valeur > 20)
    `, [sessionId]);
        return {
            verifications: verifications[0],
            anomalies,
            peutPublier: anomalies.length === 0,
        };
    }
    async publierSurReseaux(data) {
        const publication = await this.dataSource.query(`
      INSERT INTO publication_reseaux (
        contenu, reseaux, image_url, lien, statut, date_programmation, created_at
      ) VALUES ($1, $2, $3, $4, 'programme', $5, NOW())
      RETURNING *
    `, [data.contenu, data.reseaux, data.imageUrl, data.lien, data.dateProgrammation]);
        return { ...publication[0], message: 'Publication programmée' };
    }
    async getStatsReseaux() {
        return {
            followers: { facebook: 15000, twitter: 8500, linkedin: 12000, instagram: 22000 },
            engagement: { moyenne: 4.5, tendance: 'hausse' },
            dernieresPublications: 45,
        };
    }
    async envoyerMessage(data) {
        const message = this.messageRepo.create(data);
        return this.messageRepo.save(message);
    }
    async getMessagesRecus(utilisateurId, nonLus) {
        const query = this.messageRepo.createQueryBuilder('m')
            .where('m.destinataireId = :uid', { uid: utilisateurId });
        if (nonLus) {
            query.andWhere('m.lu = false');
        }
        return query.orderBy('m.createdAt', 'DESC').getMany();
    }
    async getMessagesEnvoyes(utilisateurId) {
        return this.messageRepo.find({
            where: { expediteurId: utilisateurId },
            order: { createdAt: 'DESC' },
        });
    }
    async marquerMessageLu(id) {
        await this.messageRepo.update(id, { lu: true, luAt: new Date() });
        return this.messageRepo.findOne({ where: { id } });
    }
    async createSujetForum(data) {
        const sujet = await this.dataSource.query(`
      INSERT INTO forum_sujet (
        titre, contenu, categorie, auteur_id, statut, created_at
      ) VALUES ($1, $2, $3, $4, 'actif', NOW())
      RETURNING *
    `, [data.titre, data.contenu, data.categorie, data.auteurId]);
        return sujet[0];
    }
    async findSujetsForum(categorie) {
        let query = `SELECT fs.*, u.nom || ' ' || u.prenom as auteur_nom,
                 (SELECT COUNT(*) FROM forum_reponse WHERE sujet_id = fs.id) as nb_reponses
                 FROM forum_sujet fs
                 JOIN utilisateur u ON u.id = fs.auteur_id
                 WHERE fs.statut = 'actif'`;
        const params = [];
        if (categorie) {
            query += ` AND fs.categorie = $1`;
            params.push(categorie);
        }
        query += ` ORDER BY fs.created_at DESC`;
        return this.dataSource.query(query, params);
    }
    async repondreForum(sujetId, data) {
        const reponse = await this.dataSource.query(`
      INSERT INTO forum_reponse (
        sujet_id, contenu, auteur_id, created_at
      ) VALUES ($1, $2, $3, NOW())
      RETURNING *
    `, [sujetId, data.contenu, data.auteurId]);
        return reponse[0];
    }
    async modererSujet(id, dto) {
        const nouveauStatut = dto.action === 'masquer' ? 'masque' : 'supprime';
        await this.dataSource.query(`
      UPDATE forum_sujet 
      SET statut = $1, motif_moderation = $2, date_moderation = NOW()
      WHERE id = $3
    `, [nouveauStatut, dto.motif, id]);
        return { id, statut: nouveauStatut, action: dto.action };
    }
    async genererDossierPresse(data) {
        const stats = await this.getStatsPromotion();
        return {
            titre: data.titre || `Dossier de presse - ${new Date().getFullYear()}`,
            dateGeneration: new Date(),
            contenu: {
                chiffresCles: stats,
                actualitesRecentes: await this.findAnnoncesPubliees(),
                evenementsAvenir: await this.findEvenementsAvenir(5),
            },
            format: data.format || 'pdf',
        };
    }
    async getStatsPromotion() {
        const [effectifs, tauxReussite, evenements, publications] = await Promise.all([
            this.dataSource.query(`SELECT COUNT(*) as total FROM etudiant WHERE actif = true`),
            this.dataSource.query(`
        SELECT ROUND(AVG(valeur), 2) as moyenne FROM note WHERE valeur >= 10
      `),
            this.dataSource.query(`
        SELECT COUNT(*) as total FROM evenement WHERE date_debut >= NOW() - INTERVAL '1 year'
      `),
            this.dataSource.query(`
        SELECT COUNT(*) as total FROM annonce WHERE publie = true AND created_at >= NOW() - INTERVAL '1 year'
      `),
        ]);
        return {
            effectifs: parseInt(effectifs[0]?.total || 0),
            moyenneGenerale: parseFloat(tauxReussite[0]?.moyenne || 0),
            evenementsAnnee: parseInt(evenements[0]?.total || 0),
            publicationsAnnee: parseInt(publications[0]?.total || 0),
        };
    }
    async getDashboard() {
        const [annonces, evenementsAvenir, campagnesActives, alertesActives, messagesNonLus] = await Promise.all([
            this.annonceRepo.count({ where: { publie: true } }),
            this.findEvenementsAvenir(5),
            this.dataSource.query(`SELECT COUNT(*) as count FROM campagne_inscription WHERE statut = 'active'`),
            this.findAlertesActives(),
            this.notifRepo.count({ where: { lue: false } }),
        ]);
        return {
            annoncesPubliees: annonces,
            evenementsAvenir: evenementsAvenir.length,
            campagnesActives: parseInt(campagnesActives[0]?.count || 0),
            alertesActives: alertesActives.length,
            notificationsNonLues: messagesNonLus,
        };
    }
};
exports.CommunicationService = CommunicationService;
exports.CommunicationService = CommunicationService = CommunicationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(communication_entities_1.Annonce)),
    __param(1, (0, typeorm_1.InjectRepository)(communication_entities_1.Notification)),
    __param(2, (0, typeorm_1.InjectRepository)(communication_entities_1.Message)),
    __param(3, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], CommunicationService);
//# sourceMappingURL=communication.service.js.map