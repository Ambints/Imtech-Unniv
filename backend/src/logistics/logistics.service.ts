import { Injectable, Scope, Inject, BadRequestException, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class LogisticsService {
  private readonly logger = new Logger(LogisticsService.name);
  private tenantSchema: string;

  constructor(
    @InjectDataSource('tenant') private dataSource: DataSource,
    @Inject(REQUEST) private request: any,
  ) {
    // Récupérer le schéma du tenant depuis la requête
    this.tenantSchema = this.request.tenantSchema || 'public';
    this.logger.log(`LogisticsService initialized with schema: ${this.tenantSchema}`);
    
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

  // ========== TICKETS DE MAINTENANCE ==========
  async createTicket(tid: string, dto: any): Promise<any> {
    const result = await this.query(`
      INSERT INTO ticket_maintenance (
        batiment_id, salle_id, titre, description, type_maintenance,
        priorite, statut, signale_par, assigne_a, observations
      ) VALUES ($1, $2, $3, $4, $5, $6, 'ouvert', $7, $8, $9)
      RETURNING *
    `, [
      dto.batimentId || null,
      dto.salleId || null,
      dto.titre,
      dto.description,
      dto.typeMaintenance || 'curative',
      dto.priorite || 'normale',
      dto.signalePar,
      dto.assigneA || null,
      dto.observations || null
    ]);
    return result[0];
  }

  async getTickets(tid: string, statut?: string): Promise<any[]> {
    let sql = `
      SELECT t.*,
        u_signale.nom || ' ' || u_signale.prenom as signale_par_nom,
        u_assigne.nom || ' ' || u_assigne.prenom as assigne_a_nom,
        s.nom as salle_nom,
        b.nom as batiment_nom
      FROM ticket_maintenance t
      LEFT JOIN utilisateur u_signale ON u_signale.id = t.signale_par
      LEFT JOIN utilisateur u_assigne ON u_assigne.id = t.assigne_a
      LEFT JOIN salle s ON s.id = t.salle_id
      LEFT JOIN batiment b ON b.id = t.batiment_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (statut) {
      sql += ` AND t.statut = $1`;
      params.push(statut);
    }

    sql += ` ORDER BY t.date_signalement DESC`;
    return this.query(sql, params);
  }

  async updateTicket(id: string, dto: any): Promise<any> {
    const fields = [];
    const values = [];
    let paramCount = 0;

    if (dto.statut !== undefined) {
      fields.push(`statut = $${++paramCount}`);
      values.push(dto.statut);
      
      if (dto.statut === 'resolu' || dto.statut === 'ferme') {
        fields.push(`date_resolution = NOW()`);
      }
    }
    if (dto.assigneA !== undefined) {
      fields.push(`assigne_a = $${++paramCount}`);
      values.push(dto.assigneA);
    }
    if (dto.priorite !== undefined) {
      fields.push(`priorite = $${++paramCount}`);
      values.push(dto.priorite);
    }
    if (dto.coutReparation !== undefined) {
      fields.push(`cout_reparation = $${++paramCount}`);
      values.push(dto.coutReparation);
    }
    if (dto.observations !== undefined) {
      fields.push(`observations = $${++paramCount}`);
      values.push(dto.observations);
    }

    if (fields.length === 0) {
      const result = await this.query(`SELECT * FROM ticket_maintenance WHERE id = $1`, [id]);
      return result[0];
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    await this.query(`
      UPDATE ticket_maintenance
      SET ${fields.join(', ')}
      WHERE id = $${++paramCount}
    `, values);

    const result = await this.query(`SELECT * FROM ticket_maintenance WHERE id = $1`, [id]);
    return result[0];
  }

  // ========== PLANNING ENTRETIEN ==========
  async createPlanning(tid: string, dto: any): Promise<any> {
    const result = await this.query(`
      INSERT INTO planning_entretien (
        salle_id, batiment_id, zone, type_nettoyage,
        responsable_id, jour_semaine, heure_debut, duree_minutes, actif
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING *
    `, [
      dto.salleId || null,
      dto.batimentId || null,
      dto.zone || null,
      dto.typeNettoyage,
      dto.responsableId || null,
      dto.jourSemaine || null,
      dto.heureDebut || null,
      dto.dureeMinutes || null
    ]);
    return result[0];
  }

  async getPlanning(tid?: string): Promise<any[]> {
    return this.query(`
      SELECT p.*,
        u.nom || ' ' || u.prenom as responsable_nom,
        s.nom as salle_nom,
        b.nom as batiment_nom
      FROM planning_entretien p
      LEFT JOIN utilisateur u ON u.id = p.responsable_id
      LEFT JOIN salle s ON s.id = p.salle_id
      LEFT JOIN batiment b ON b.id = p.batiment_id
      WHERE p.actif = true
      ORDER BY p.jour_semaine, p.heure_debut
    `);
  }

  // ========== STOCKS ==========
  async createStock(tid: string, dto: any): Promise<any> {
    const result = await this.query(`
      INSERT INTO stock (
        reference, libelle, categorie, unite, quantite_stock,
        seuil_alerte, prix_unitaire, fournisseur, emplacement
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      dto.reference,
      dto.libelle,
      dto.categorie,
      dto.unite,
      dto.quantiteStock || 0,
      dto.seuilAlerte || 0,
      dto.prixUnitaire || null,
      dto.fournisseur || null,
      dto.emplacement || null
    ]);
    return result[0];
  }

  async getStocks(tid?: string): Promise<any[]> {
    return this.query(`
      SELECT * FROM stock ORDER BY libelle
    `);
  }

  async getStocksEnAlerte(tid?: string): Promise<any[]> {
    return this.query(`
      SELECT * FROM stock
      WHERE quantite_stock <= seuil_alerte
      ORDER BY quantite_stock ASC
    `);
  }

  async updateStock(id: string, quantiteStock: number): Promise<any> {
    await this.query(`
      UPDATE stock
      SET quantite_stock = $1, derniere_mise_a_jour = NOW()
      WHERE id = $2
    `, [quantiteStock, id]);

    const result = await this.query(`SELECT * FROM stock WHERE id = $1`, [id]);
    return result[0];
  }

  async createMouvement(dto: any): Promise<any> {
    const result = await this.query(`
      INSERT INTO mouvement_stock (
        stock_id, type_mouvement, quantite, motif,
        reference_doc, utilisateur_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      dto.stockId,
      dto.typeMouvement,
      dto.quantite,
      dto.motif || null,
      dto.referenceDoc || null,
      dto.utilisateurId || null
    ]);

    // Mettre à jour le stock
    if (dto.typeMouvement === 'entree') {
      await this.query(`
        UPDATE stock SET quantite_stock = quantite_stock + $1 WHERE id = $2
      `, [dto.quantite, dto.stockId]);
    } else if (dto.typeMouvement === 'sortie') {
      await this.query(`
        UPDATE stock SET quantite_stock = quantite_stock - $1 WHERE id = $2
      `, [dto.quantite, dto.stockId]);
    }

    return result[0];
  }

  async getMouvements(stockId?: string): Promise<any[]> {
    let sql = `
      SELECT m.*,
        s.libelle as stock_libelle,
        u.nom || ' ' || u.prenom as utilisateur_nom
      FROM mouvement_stock m
      LEFT JOIN stock s ON s.id = m.stock_id
      LEFT JOIN utilisateur u ON u.id = m.utilisateur_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (stockId) {
      sql += ` AND m.stock_id = $1`;
      params.push(stockId);
    }

    sql += ` ORDER BY m.date_mouvement DESC`;
    return this.query(sql, params);
  }

  // ========== RÉSERVATIONS DE SALLES ==========
  async reserver(tid: string, dto: any): Promise<any> {
    const result = await this.query(`
      INSERT INTO reservation_salle (
        salle_id, titre, description, date_reservation,
        heure_debut, heure_fin, demande_par, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'en_attente')
      RETURNING *
    `, [
      dto.salleId,
      dto.titre,
      dto.description || null,
      dto.dateReservation,
      dto.heureDebut,
      dto.heureFin,
      dto.demandePar
    ]);
    return result[0];
  }

  async getReservations(tid: string, salleId?: string): Promise<any[]> {
    let sql = `
      SELECT r.*,
        s.nom as salle_nom,
        u_demande.nom || ' ' || u_demande.prenom as demande_par_nom,
        u_approuve.nom || ' ' || u_approuve.prenom as approuve_par_nom
      FROM reservation_salle r
      LEFT JOIN salle s ON s.id = r.salle_id
      LEFT JOIN utilisateur u_demande ON u_demande.id = r.demande_par
      LEFT JOIN utilisateur u_approuve ON u_approuve.id = r.approuve_par
      WHERE 1=1
    `;
    const params: any[] = [];

    if (salleId) {
      sql += ` AND r.salle_id = $1`;
      params.push(salleId);
    }

    sql += ` ORDER BY r.date_reservation ASC, r.heure_debut ASC`;
    return this.query(sql, params);
  }

  async approuverReservation(id: string, approuvePar: string): Promise<any> {
    await this.query(`
      UPDATE reservation_salle
      SET statut = 'approuvee', approuve_par = $1
      WHERE id = $2
    `, [approuvePar, id]);

    const result = await this.query(`SELECT * FROM reservation_salle WHERE id = $1`, [id]);
    return result[0];
  }

  async refuserReservation(id: string, approuvePar: string): Promise<any> {
    await this.query(`
      UPDATE reservation_salle
      SET statut = 'refusee', approuve_par = $1
      WHERE id = $2
    `, [approuvePar, id]);

    const result = await this.query(`SELECT * FROM reservation_salle WHERE id = $1`, [id]);
    return result[0];
  }

  // ========== STATISTIQUES ==========
  async getStats(): Promise<any> {
    const [tickets, stocks, reservations] = await Promise.all([
      this.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE statut = 'ouvert') as ouverts,
          COUNT(*) FILTER (WHERE statut = 'en_cours') as en_cours,
          COUNT(*) FILTER (WHERE statut = 'resolu') as resolus
        FROM ticket_maintenance
      `),
      this.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE quantite_stock <= seuil_alerte) as alertes
        FROM stock
      `),
      this.query(`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE statut = 'en_attente') as en_attente,
          COUNT(*) FILTER (WHERE statut = 'approuvee') as approuvees
        FROM reservation_salle
      `)
    ]);

    return {
      tickets: tickets[0],
      stocks: stocks[0],
      reservations: reservations[0]
    };
  }
}

// Made with Bob
