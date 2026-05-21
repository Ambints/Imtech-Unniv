import { Injectable, Logger, NotFoundException, Scope, Inject, BadRequestException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);
  private tenantSchema: string;

  constructor(
    @InjectDataSource('tenant') private dataSource: DataSource,
    @Inject(REQUEST) private request: any,
  ) {
    // Récupérer le schéma du tenant depuis la requête
    this.tenantSchema = this.request.tenantSchema || 'public';
    this.logger.log(`CommunicationService initialized with schema: ${this.tenantSchema}`);
    
    if (!this.request.tenantSchema) {
      this.logger.warn('No tenant schema found in request! Using public schema as fallback.');
    }
  }

  private async query(sql: string, params: any[] = []): Promise<any> {
    try {
      if (!this.tenantSchema || this.tenantSchema === 'public') {
        throw new BadRequestException('Tenant schema not set. Please provide X-Tenant-Id header.');
      }
      
      const schemaQuery = `SET search_path TO "${this.tenantSchema}", public`;
      await this.dataSource.query(schemaQuery);
      this.logger.debug(`Executing query in schema: ${this.tenantSchema}`);
      return this.dataSource.query(sql, params);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Query error in schema ${this.tenantSchema}: ${errorMessage}`);
      throw error;
    }
  }

  // ========== ÉVÉNEMENTS ==========
  async createEvenement(data: any): Promise<any> {
    return { message: 'Événement créé', data };
  }

  async findEvenements(dateDebut?: string, dateFin?: string, type?: string): Promise<any[]> {
    return [];
  }

  async findEvenementsAvenir(limit: number = 10): Promise<any[]> {
    return [];
  }

  async updateEvenement(id: string, data: any): Promise<any> {
    return { message: 'Événement mis à jour', id, data };
  }

  // ========== CAMPAGNES ==========
  async createCampagne(data: any): Promise<any> {
    return { message: 'Campagne créée', data };
  }

  async findCampagnes(statut?: string): Promise<any[]> {
    return [];
  }

  async activerCampagne(id: string): Promise<any> {
    return { message: 'Campagne activée', id };
  }

  async envoyerCampagne(id: string): Promise<any> {
    return { message: 'Campagne envoyée', id };
  }

  // ========== ALERTES ==========
  async createAlerte(data: any): Promise<any> {
    return { message: 'Alerte créée', data };
  }

  async findAlertesActives(): Promise<any[]> {
    return [];
  }

  async desactiverAlerte(id: string): Promise<any> {
    return { message: 'Alerte désactivée', id };
  }

  // ========== RÉSULTATS ==========
  async publierResultats(data: any): Promise<any> {
    return { message: 'Résultats publiés', data };
  }

  async verifierResultats(sessionId: string): Promise<any> {
    return { message: 'Résultats vérifiés', sessionId };
  }

  // ========== RÉSEAUX SOCIAUX ==========
  async publierSurReseaux(data: any): Promise<any> {
    return { message: 'Publication sur réseaux sociaux', data };
  }

  async getStatsReseaux(): Promise<any> {
    return { likes: 0, shares: 0, comments: 0 };
  }

  // ========== FORUMS ==========
  async createSujetForum(data: any): Promise<any> {
    return { message: 'Sujet de forum créé', data };
  }

  async findSujetsForum(categorie?: string): Promise<any[]> {
    return [];
  }

  async repondreForum(sujetId: string, data: any): Promise<any> {
    return { message: 'Réponse ajoutée', sujetId, data };
  }

  async modererSujet(id: string, data: any): Promise<any> {
    return { message: 'Sujet modéré', id, data };
  }

  // ========== PROMOTION ==========
  async genererDossierPresse(data: any): Promise<any> {
    return { message: 'Dossier de presse généré', data };
  }

  async getStatsPromotion(): Promise<any> {
    return { etudiants: 0, enseignants: 0, parcours: 0 };
  }

  // ========== ANNONCES & ACTUALITÉS ==========
  async createAnnonce(data: any): Promise<any> {
    try {
      // Validation des données requises
      if (!data.auteurId) {
        this.logger.error('createAnnonce: auteurId manquant dans les données', data);
        throw new BadRequestException('auteurId est requis pour créer une annonce');
      }
      
      if (!data.titre || !data.contenu) {
        this.logger.error('createAnnonce: titre ou contenu manquant', data);
        throw new BadRequestException('titre et contenu sont requis');
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
    } catch (error) {
      this.logger.error('Erreur lors de la création de l\'annonce:', error);
      
      // Log détaillé de l'erreur
      if (error instanceof Error) {
        this.logger.error(`Message: ${error.message}`);
        this.logger.error(`Stack: ${error.stack}`);
      }
      
      // Si c'est une erreur de base de données PostgreSQL
      if (error && typeof error === 'object' && 'code' in error) {
        const pgError = error as any;
        this.logger.error(`PostgreSQL Error Code: ${pgError.code}`);
        this.logger.error(`PostgreSQL Detail: ${pgError.detail}`);
        this.logger.error(`PostgreSQL Constraint: ${pgError.constraint}`);
        
        // Erreur de contrainte NOT NULL
        if (pgError.code === '23502') {
          throw new BadRequestException(`Champ requis manquant: ${pgError.column}`);
        }
        
        // Erreur de clé étrangère
        if (pgError.code === '23503') {
          throw new BadRequestException(`Référence invalide: ${pgError.detail}`);
        }
      }
      
      throw error;
    }
  }

  async findAnnoncesPubliees(cible?: string, type?: string): Promise<any[]> {
    let sql = `
      SELECT a.*, u.nom || ' ' || u.prenom as auteur_nom
      FROM annonce a
      LEFT JOIN utilisateur u ON u.id = a.auteur_id
      WHERE a.publie = true
        AND (a.date_expiration IS NULL OR a.date_expiration > NOW())
    `;
    const params: any[] = [];
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

  async findAllAnnonces(filters?: any): Promise<any[]> {
    let sql = `
      SELECT a.*, u.nom || ' ' || u.prenom as auteur_nom
      FROM annonce a
      LEFT JOIN utilisateur u ON u.id = a.auteur_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.statut === 'publie') {
      sql += ` AND a.publie = true`;
    } else if (filters?.statut === 'brouillon') {
      sql += ` AND a.publie = false`;
    }
    if (filters?.type) {
      sql += ` AND a.type_annonce = $${++paramCount}`;
      params.push(filters.type);
    }

    sql += ` ORDER BY a.created_at DESC`;
    return this.query(sql, params);
  }

  async findAnnonceById(id: string): Promise<any> {
    const result = await this.query(`
      SELECT a.*, u.nom || ' ' || u.prenom as auteur_nom
      FROM annonce a
      LEFT JOIN utilisateur u ON u.id = a.auteur_id
      WHERE a.id = $1
    `, [id]);
    
    if (!result[0]) throw new NotFoundException('Annonce non trouvée');
    return result[0];
  }

  async publierAnnonce(id: string): Promise<any> {
    await this.query(`
      UPDATE annonce 
      SET publie = true, date_publication = NOW()
      WHERE id = $1
    `, [id]);
    return this.findAnnonceById(id);
  }

  async depublierAnnonce(id: string): Promise<any> {
    await this.query(`
      UPDATE annonce SET publie = false WHERE id = $1
    `, [id]);
    return this.findAnnonceById(id);
  }

  async deleteAnnonce(id: string): Promise<void> {
    await this.query(`DELETE FROM annonce WHERE id = $1`, [id]);
  }

  async dupliquerAnnonce(id: string, nouvelAuteurId: string): Promise<any> {
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

  // ========== NOTIFICATIONS CIBLÉES ==========
  async envoyerNotificationCiblee(data: any): Promise<any> {
    const { filieres, annees, niveaux, titre, message } = data;

    // Récupérer les utilisateurs ciblés
    let sql = `
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
      sql += ` AND ${conditions.join(' AND ')}`;
    }

    const cibles = await this.query(sql, params);

    // Créer les notifications
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

  async getStatsNotifications(dateDebut?: string, dateFin?: string): Promise<any> {
    let dateFilter = '';
    const params: any[] = [];

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

  // ========== MESSAGERIE INTERNE ==========
  async envoyerMessage(data: any): Promise<any> {
    const result = await this.query(`
      INSERT INTO message (expediteur_id, destinataire_id, sujet, contenu, lu)
      VALUES ($1, $2, $3, $4, false)
      RETURNING *
    `, [data.expediteurId, data.destinataireId, data.sujet, data.contenu]);
    return result[0];
  }

  async getMessagesRecus(utilisateurId: string, nonLus?: boolean): Promise<any[]> {
    let sql = `
      SELECT m.*, 
        u_exp.nom || ' ' || u_exp.prenom as expediteur_nom,
        u_exp.email as expediteur_email
      FROM message m
      LEFT JOIN utilisateur u_exp ON u_exp.id = m.expediteur_id
      WHERE m.destinataire_id = $1
    `;
    const params: any[] = [utilisateurId];

    if (nonLus) {
      sql += ` AND m.lu = false`;
    }

    sql += ` ORDER BY m.created_at DESC`;
    return this.query(sql, params);
  }

  async getMessagesEnvoyes(utilisateurId: string): Promise<any[]> {
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

  async marquerMessageLu(id: string): Promise<any> {
    await this.query(`
      UPDATE message SET lu = true, lu_at = NOW() WHERE id = $1
    `, [id]);
    
    const result = await this.query(`SELECT * FROM message WHERE id = $1`, [id]);
    return result[0];
  }

  // ========== DASHBOARD COMMUNICATION ==========
  async getDashboard(): Promise<any> {
    const [annonces, notifications] = await Promise.all([
      this.query(`SELECT COUNT(*) as count FROM annonce WHERE publie = true`),
      this.query(`SELECT COUNT(*) as count FROM notification WHERE lue = false`),
    ]);

    return {
      annoncesPubliees: parseInt(annonces[0]?.count || 0),
      notificationsNonLues: parseInt(notifications[0]?.count || 0),
    };
  }
}

// Made with Bob
