import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Annonce, Notification, Message } from './communication.entities';

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);

  constructor(
    @InjectRepository(Annonce) private annonceRepo: Repository<Annonce>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // ========== ANNONCES & ACTUALITÉS ==========
  async createAnnonce(data: Partial<Annonce>): Promise<Annonce> {
    const annonce = this.annonceRepo.create({
      ...data,
      publie: false,
    });
    return this.annonceRepo.save(annonce);
  }

  async findAnnoncesPubliees(cible?: string, type?: string): Promise<Annonce[]> {
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

  async findAllAnnonces(filters?: any): Promise<Annonce[]> {
    const query = this.annonceRepo.createQueryBuilder('a')
      .leftJoinAndSelect('a.auteur', 'u');

    if (filters?.statut === 'publie') {
      query.andWhere('a.publie = true');
    } else if (filters?.statut === 'brouillon') {
      query.andWhere('a.publie = false');
    }
    if (filters?.type) {
      query.andWhere('a.typeAnnonce = :type', { type: filters.type });
    }

    return query.orderBy('a.createdAt', 'DESC').getMany();
  }

  async findAnnonceById(id: string): Promise<Annonce> {
    const annonce = await this.annonceRepo.findOne({ where: { id } });
    if (!annonce) throw new NotFoundException('Annonce non trouvée');
    return annonce;
  }

  async publierAnnonce(id: string): Promise<Annonce> {
    await this.annonceRepo.update(id, {
      publie: true,
      datePublication: new Date(),
    });
    return this.findAnnonceById(id);
  }

  async depublierAnnonce(id: string): Promise<Annonce> {
    await this.annonceRepo.update(id, { publie: false });
    return this.findAnnonceById(id);
  }

  async deleteAnnonce(id: string): Promise<void> {
    await this.annonceRepo.delete(id);
  }

  async dupliquerAnnonce(id: string, nouvelAuteurId: string): Promise<Annonce> {
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

  // ========== CALENDRIER ÉVÉNEMENTIEL ==========
  async createEvenement(data: any): Promise<any> {
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

  async findEvenements(dateDebut?: string, dateFin?: string, type?: string): Promise<any[]> {
    let query = `SELECT e.*, u.nom || ' ' || u.prenom as organisateur_nom
                 FROM evenement e
                 LEFT JOIN utilisateur u ON u.id = e.organisateur_id
                 WHERE 1=1`;
    const params: any[] = [];
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

  async findEvenementsAvenir(limit: number = 10): Promise<any[]> {
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

  async updateEvenement(id: string, data: any): Promise<any> {
    const fields = [];
    const values = [];
    let paramCount = 0;

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = $${++paramCount}`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return this.findEvenementById(id);

    values.push(id);
    await this.dataSource.query(`
      UPDATE evenement SET ${fields.join(', ')} WHERE id = $${++paramCount}
    `, values);

    return this.findEvenementById(id);
  }

  private async findEvenementById(id: string): Promise<any> {
    const result = await this.dataSource.query(`
      SELECT e.*, u.nom || ' ' || u.prenom as organisateur_nom
      FROM evenement e
      LEFT JOIN utilisateur u ON u.id = e.organisateur_id
      WHERE e.id = $1
    `, [id]);
    return result[0];
  }

  // ========== CAMPAGNES D'INSCRIPTION ==========
  async createCampagne(data: any): Promise<any> {
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

  async findCampagnes(statut?: string): Promise<any[]> {
    let query = `SELECT c.*, aa.libelle as annee_academique
                 FROM campagne_inscription c
                 JOIN annee_academique aa ON aa.id = c.annee_academique_id
                 WHERE 1=1`;
    const params: any[] = [];

    if (statut) {
      query += ` AND c.statut = $1`;
      params.push(statut);
    }

    query += ` ORDER BY c.created_at DESC`;
    return this.dataSource.query(query, params);
  }

  async activerCampagne(id: string): Promise<any> {
    await this.dataSource.query(`
      UPDATE campagne_inscription SET statut = 'active', date_activation = NOW() WHERE id = $1
    `, [id]);
    return this.findCampagneById(id);
  }

  async envoyerCampagne(id: string): Promise<any> {
    const campagne = await this.findCampagneById(id);
    
    // Simuler l'envoi aux cibles
    await this.dataSource.query(`
      UPDATE campagne_inscription SET statut = 'envoyee', date_envoi = NOW() WHERE id = $1
    `, [id]);

    // Créer des notifications pour les cibles
    // (simplifié - en vrai il faudrait récupérer les étudiants ciblés)
    
    return { ...campagne, statut: 'envoyee', message: 'Campagne envoyée avec succès' };
  }

  private async findCampagneById(id: string): Promise<any> {
    const result = await this.dataSource.query(`
      SELECT c.*, aa.libelle as annee_academique
      FROM campagne_inscription c
      JOIN annee_academique aa ON aa.id = c.annee_academique_id
      WHERE c.id = $1
    `, [id]);
    return result[0];
  }

  // ========== NOTIFICATIONS CIBLÉES ==========
  async envoyerNotificationCiblee(data: any): Promise<any> {
    const { filieres, annees, niveaux, titre, message } = data;

    // Récupérer les utilisateurs ciblés
    let query = `
      SELECT DISTINCT u.id, u.email, u.telephone
      FROM utilisateur u
      JOIN inscription i ON i.etudiant_id = u.id
      WHERE i.statut = 'validee'
    `;
    const conditions = [];
    const params: any[] = [];
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

    // Créer les notifications
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

  async getStatsNotifications(dateDebut?: string, dateFin?: string): Promise<any> {
    let dateFilter = '';
    const params: any[] = [];

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

  // ========== ALERTES INSTITUTIONNELLES ==========
  async createAlerte(data: any): Promise<any> {
    const alerte = await this.dataSource.query(`
      INSERT INTO alerte_institutionnelle (
        titre, message, type_alerte, niveau_urgence,
        date_debut, date_fin, auteur_id, actif, created_at
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $6, true, NOW())
      RETURNING *
    `, [data.titre, data.message, data.type, data.niveauUrgence || 'moyen', data.dateFin, data.auteurId]);

    // Envoyer une notification push/email à tous les utilisateurs
    // (simplifié - à implémenter avec un service de notification)

    return alerte[0];
  }

  async findAlertesActives(): Promise<any[]> {
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

  async desactiverAlerte(id: string): Promise<any> {
    await this.dataSource.query(`
      UPDATE alerte_institutionnelle SET actif = false, date_desactivation = NOW() WHERE id = $1
    `, [id]);
    return { id, actif: false };
  }

  // ========== PUBLICATION DES RÉSULTATS ==========
  async publierResultats(data: any): Promise<any> {
    const { sessionId, masquerPartiel = true, datePublication } = data;

    // Créer une entrée de publication
    const publication = await this.dataSource.query(`
      INSERT INTO publication_resultat (
        session_id, masquage_partiel, date_publication, publie_par, statut
      ) VALUES ($1, $2, $3, $4, 'publie')
      RETURNING *
    `, [sessionId, masquerPartiel, datePublication || new Date(), data.publiePar]);

    // Mettre à jour les notes comme publiées
    await this.dataSource.query(`
      UPDATE note SET publie = true WHERE session_id = $1
    `, [sessionId]);

    return publication[0];
  }

  async verifierResultats(sessionId: string): Promise<any> {
    // Vérifier les anomalies avant publication
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

  // ========== RÉSEAUX SOCIAUX & SITE WEB ==========
  async publierSurReseaux(data: any): Promise<any> {
    // Simuler la publication sur réseaux sociaux
    // En production, intégrer avec les APIs Facebook, Twitter, LinkedIn, etc.
    
    const publication = await this.dataSource.query(`
      INSERT INTO publication_reseaux (
        contenu, reseaux, image_url, lien, statut, date_programmation, created_at
      ) VALUES ($1, $2, $3, $4, 'programme', $5, NOW())
      RETURNING *
    `, [data.contenu, data.reseaux, data.imageUrl, data.lien, data.dateProgrammation]);

    return { ...publication[0], message: 'Publication programmée' };
  }

  async getStatsReseaux(): Promise<any> {
    // Simuler les stats de réseaux sociaux
    return {
      followers: { facebook: 15000, twitter: 8500, linkedin: 12000, instagram: 22000 },
      engagement: { moyenne: 4.5, tendance: 'hausse' },
      dernieresPublications: 45,
    };
  }

  // ========== MESSAGERIE INTERNE ==========
  async envoyerMessage(data: Partial<Message>): Promise<Message> {
    const message = this.messageRepo.create(data);
    return this.messageRepo.save(message);
  }

  async getMessagesRecus(utilisateurId: string, nonLus?: boolean): Promise<Message[]> {
    const query = this.messageRepo.createQueryBuilder('m')
      .where('m.destinataireId = :uid', { uid: utilisateurId });

    if (nonLus) {
      query.andWhere('m.lu = false');
    }

    return query.orderBy('m.createdAt', 'DESC').getMany();
  }

  async getMessagesEnvoyes(utilisateurId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: { expediteurId: utilisateurId },
      order: { createdAt: 'DESC' },
    });
  }

  async marquerMessageLu(id: string): Promise<Message> {
    await this.messageRepo.update(id, { lu: true, luAt: new Date() });
    return this.messageRepo.findOne({ where: { id } });
  }

  // ========== FORUMS & ESPACES COMMUNAUTAIRES ==========
  async createSujetForum(data: any): Promise<any> {
    const sujet = await this.dataSource.query(`
      INSERT INTO forum_sujet (
        titre, contenu, categorie, auteur_id, statut, created_at
      ) VALUES ($1, $2, $3, $4, 'actif', NOW())
      RETURNING *
    `, [data.titre, data.contenu, data.categorie, data.auteurId]);

    return sujet[0];
  }

  async findSujetsForum(categorie?: string): Promise<any[]> {
    let query = `SELECT fs.*, u.nom || ' ' || u.prenom as auteur_nom,
                 (SELECT COUNT(*) FROM forum_reponse WHERE sujet_id = fs.id) as nb_reponses
                 FROM forum_sujet fs
                 JOIN utilisateur u ON u.id = fs.auteur_id
                 WHERE fs.statut = 'actif'`;
    const params: any[] = [];

    if (categorie) {
      query += ` AND fs.categorie = $1`;
      params.push(categorie);
    }

    query += ` ORDER BY fs.created_at DESC`;
    return this.dataSource.query(query, params);
  }

  async repondreForum(sujetId: string, data: any): Promise<any> {
    const reponse = await this.dataSource.query(`
      INSERT INTO forum_reponse (
        sujet_id, contenu, auteur_id, created_at
      ) VALUES ($1, $2, $3, NOW())
      RETURNING *
    `, [sujetId, data.contenu, data.auteurId]);

    return reponse[0];
  }

  async modererSujet(id: string, dto: { action: 'masquer' | 'supprimer'; motif: string }): Promise<any> {
    const nouveauStatut = dto.action === 'masquer' ? 'masque' : 'supprime';
    
    await this.dataSource.query(`
      UPDATE forum_sujet 
      SET statut = $1, motif_moderation = $2, date_moderation = NOW()
      WHERE id = $3
    `, [nouveauStatut, dto.motif, id]);

    return { id, statut: nouveauStatut, action: dto.action };
  }

  // ========== PROMOTION & RELATIONS PUBLIQUES ==========
  async genererDossierPresse(data: any): Promise<any> {
    // Générer un dossier de presse avec les stats clés
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

  async getStatsPromotion(): Promise<any> {
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

  // ========== DASHBOARD COMMUNICATION ==========
  async getDashboard(): Promise<any> {
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
}
