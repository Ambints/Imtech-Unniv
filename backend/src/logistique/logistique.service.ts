import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DashboardLogistique } from './interfaces/dashboard-logistique.interface';
import { StockAlerte } from './interfaces/stock-alerte.interface';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateStockDto } from './dto/create-stock.dto';
import { MouvementStockDto } from './dto/mouvement-stock.dto';
import { CreatePlanningEntretienDto } from './dto/create-planning-entretien.dto';
import { CreateRapportEntretienDto } from './dto/create-rapport-entretien.dto';
import { CreateBatimentDto } from './dto/create-batiment.dto';
import { CreateSalleDto } from './dto/create-salle.dto';
import { UpdateSalleDto } from './dto/update-salle.dto';
import { TraiterDemandeRessourceDto } from './dto/traiter-demande-ressource.dto';

@Injectable()
export class LogistiqueService {
  constructor(private readonly dataSource: DataSource) {}

  private schema(tenantSchema: string): string {
    if (!tenantSchema) throw new BadRequestException('tenantSchema manquant');
    if (!/^tenant_[a-z0-9_]+$/.test(tenantSchema)) {
      throw new BadRequestException(`Schéma tenant invalide: "${tenantSchema}"`);
    }
    return tenantSchema;
  }

  // ==================== DASHBOARD ====================
  async getDashboard(tenantSchema: string): Promise<DashboardLogistique> {
    const s = this.schema(tenantSchema);

    const [
      ticketsOuverts,
      ticketsUrgents,
      ticketsNonAssignes,
      ticketsResolusAujourdHui,
      articlesEnAlerteCritique,
      mouvementsAujourdHui,
      sallesDisponibles,
      reservationsAujourdHui,
      reservationsEnAttente,
      planningsActifs,
      rapportsAujourdHui,
      totalBatiments,
      totalSalles,
    ] = await Promise.all([
      // Tickets ouverts
      this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${s}.ticket_maintenance WHERE statut IN ('ouvert', 'en_cours')`
      ).then(r => r[0]?.count || 0),

      // Tickets urgents
      this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${s}.ticket_maintenance 
         WHERE priorite = 'urgente' AND statut NOT IN ('resolu', 'ferme', 'annule')`
      ).then(r => r[0]?.count || 0),

      // Tickets non assignés
      this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${s}.ticket_maintenance 
         WHERE assigne_a IS NULL AND statut = 'ouvert'`
      ).then(r => r[0]?.count || 0),

      // Tickets résolus aujourd'hui
      this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${s}.ticket_maintenance 
         WHERE DATE(date_resolution) = CURRENT_DATE`
      ).then(r => r[0]?.count || 0),

      // Articles en alerte critique
      this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${s}.stock WHERE quantite_stock <= seuil_alerte`
      ).then(r => r[0]?.count || 0),

      // Mouvements aujourd'hui
      this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${s}.mouvement_stock WHERE DATE(date_mouvement) = CURRENT_DATE`
      ).then(r => r[0]?.count || 0),

      // Salles disponibles
      this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${s}.salle WHERE disponible = true`
      ).then(r => r[0]?.count || 0),

      // Réservations aujourd'hui
      this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${s}.reservation_salle WHERE date_reservation = CURRENT_DATE`
      ).then(r => r[0]?.count || 0),

      // Réservations en attente
      this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${s}.reservation_salle WHERE statut = 'en_attente'`
      ).then(r => r[0]?.count || 0),

      // Plannings actifs
      this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${s}.planning_entretien WHERE actif = true`
      ).then(r => r[0]?.count || 0),

      // Rapports aujourd'hui
      this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${s}.rapport_entretien WHERE date_realisation = CURRENT_DATE`
      ).then(r => r[0]?.count || 0),

      // Total bâtiments
      this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${s}.batiment WHERE actif = true`
      ).then(r => r[0]?.count || 0),

      // Total salles
      this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${s}.salle`
      ).then(r => r[0]?.count || 0),
    ]);

    return {
      ticketsOuverts,
      ticketsUrgents,
      ticketsNonAssignes,
      ticketsResolusAujourdHui,
      articlesEnAlerteCritique,
      mouvementsAujourdHui,
      sallesDisponibles,
      reservationsAujourdHui,
      reservationsEnAttente,
      planningsActifs,
      rapportsAujourdHui,
      totalBatiments,
      totalSalles,
    };
  }

  // ==================== BÂTIMENTS ====================
  async getBatiments(tenantSchema: string) {
    const s = this.schema(tenantSchema);
    return this.dataSource.query(`
      SELECT b.id, b.nom, b.code, b.adresse, b.actif,
        COUNT(s.id)::int AS nb_salles,
        COUNT(s.id) FILTER (WHERE s.disponible = true)::int AS salles_disponibles
      FROM ${s}.batiment b
      LEFT JOIN ${s}.salle s ON s.batiment_id = b.id
      GROUP BY b.id
      ORDER BY b.nom
    `);
  }

  async createBatiment(tenantSchema: string, dto: CreateBatimentDto) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(
      `INSERT INTO ${s}.batiment (nom, code, adresse, actif)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [dto.nom, dto.code, dto.adresse, dto.actif ?? true]
    );
    return result[0];
  }

  // ==================== SALLES ====================
  async getSalles(tenantSchema: string, filters?: { type_salle?: string; disponible?: boolean; batiment_id?: string }) {
    const s = this.schema(tenantSchema);
    let query = `
      SELECT s.id, s.nom, s.code, s.capacite, s.type_salle,
        s.equipements, s.disponible, s.etage,
        b.nom AS batiment_nom, b.code AS batiment_code
      FROM ${s}.salle s
      LEFT JOIN ${s}.batiment b ON b.id = s.batiment_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.type_salle) {
      params.push(filters.type_salle);
      query += ` AND s.type_salle = $${params.length}`;
    }
    if (filters?.disponible !== undefined) {
      params.push(filters.disponible);
      query += ` AND s.disponible = $${params.length}`;
    }
    if (filters?.batiment_id) {
      params.push(filters.batiment_id);
      query += ` AND s.batiment_id = $${params.length}`;
    }

    query += ` ORDER BY b.nom, s.nom`;
    return this.dataSource.query(query, params);
  }

  async getSalle(tenantSchema: string, id: string) {
    const s = this.schema(tenantSchema);
    
    const [salle, tickets, reservations] = await Promise.all([
      this.dataSource.query(
        `SELECT s.*, b.nom AS batiment_nom
         FROM ${s}.salle s
         LEFT JOIN ${s}.batiment b ON b.id = s.batiment_id
         WHERE s.id = $1`,
        [id]
      ),
      this.dataSource.query(
        `SELECT id, titre, type_maintenance, priorite, statut, date_signalement
         FROM ${s}.ticket_maintenance
         WHERE salle_id = $1 AND statut IN ('ouvert', 'en_cours')
         ORDER BY priorite DESC, date_signalement DESC`,
        [id]
      ),
      this.dataSource.query(
        `SELECT r.id, r.titre, r.date_reservation, r.heure_debut, r.heure_fin, r.statut,
           u.nom || ' ' || u.prenom AS demandeur
         FROM ${s}.reservation_salle r
         JOIN ${s}.utilisateur u ON u.id = r.demande_par
         WHERE r.salle_id = $1 AND r.date_reservation >= CURRENT_DATE
         ORDER BY r.date_reservation, r.heure_debut`,
        [id]
      ),
    ]);

    if (!salle[0]) throw new NotFoundException('Salle non trouvée');

    return {
      ...salle[0],
      tickets,
      reservations,
    };
  }

  async createSalle(tenantSchema: string, dto: CreateSalleDto) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(
      `INSERT INTO ${s}.salle (batiment_id, nom, code, capacite, type_salle, equipements, disponible, etage)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        dto.batiment_id,
        dto.nom,
        dto.code,
        dto.capacite,
        dto.type_salle,
        JSON.stringify(dto.equipements || {}),
        dto.disponible ?? true,
        dto.etage ?? 0,
      ]
    );
    return result[0];
  }

  async updateSalle(tenantSchema: string, id: string, dto: UpdateSalleDto) {
    const s = this.schema(tenantSchema);
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (dto.nom !== undefined) {
      fields.push(`nom = $${paramIndex++}`);
      values.push(dto.nom);
    }
    if (dto.code !== undefined) {
      fields.push(`code = $${paramIndex++}`);
      values.push(dto.code);
    }
    if (dto.capacite !== undefined) {
      fields.push(`capacite = $${paramIndex++}`);
      values.push(dto.capacite);
    }
    if (dto.type_salle !== undefined) {
      fields.push(`type_salle = $${paramIndex++}`);
      values.push(dto.type_salle);
    }
    if (dto.equipements !== undefined) {
      fields.push(`equipements = $${paramIndex++}`);
      values.push(JSON.stringify(dto.equipements));
    }
    if (dto.disponible !== undefined) {
      fields.push(`disponible = $${paramIndex++}`);
      values.push(dto.disponible);
    }
    if (dto.etage !== undefined) {
      fields.push(`etage = $${paramIndex++}`);
      values.push(dto.etage);
    }

    if (fields.length === 0) {
      throw new BadRequestException('Aucun champ à mettre à jour');
    }

    values.push(id);
    const result = await this.dataSource.query(
      `UPDATE ${s}.salle SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (!result[0]) throw new NotFoundException('Salle non trouvée');
    return result[0];
  }

  async toggleDisponibilite(tenantSchema: string, id: string, disponible: boolean) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(
      `UPDATE ${s}.salle SET disponible = $1 WHERE id = $2 RETURNING *`,
      [disponible, id]
    );
    if (!result[0]) throw new NotFoundException('Salle non trouvée');
    return result[0];
  }

  // ==================== STOCK ====================
  async getStock(tenantSchema: string, filters?: { categorie?: string; en_alerte?: boolean }) {
    const s = this.schema(tenantSchema);
    let query = `
      SELECT id, reference, libelle, categorie, unite,
        quantite_stock, seuil_alerte, prix_unitaire,
        fournisseur, emplacement, derniere_mise_a_jour,
        CASE WHEN quantite_stock <= seuil_alerte THEN true ELSE false END AS en_alerte
      FROM ${s}.stock
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.categorie) {
      params.push(filters.categorie);
      query += ` AND categorie = $${params.length}`;
    }
    if (filters?.en_alerte) {
      query += ` AND quantite_stock <= seuil_alerte`;
    }

    query += ` ORDER BY categorie, libelle`;
    return this.dataSource.query(query, params);
  }

  async getAlertes(tenantSchema: string): Promise<StockAlerte[]> {
    const s = this.schema(tenantSchema);
    return this.dataSource.query(`
      SELECT id, reference, libelle, categorie, unite,
        quantite_stock, seuil_alerte,
        (seuil_alerte - quantite_stock) AS deficit,
        prix_unitaire, fournisseur
      FROM ${s}.stock
      WHERE quantite_stock <= seuil_alerte
      ORDER BY deficit DESC
    `);
  }

  async createArticle(tenantSchema: string, dto: CreateStockDto) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(
      `INSERT INTO ${s}.stock (reference, libelle, categorie, unite, quantite_stock, seuil_alerte, prix_unitaire, fournisseur, emplacement)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        dto.reference,
        dto.libelle,
        dto.categorie,
        dto.unite,
        dto.quantite_stock,
        dto.seuil_alerte,
        dto.prix_unitaire,
        dto.fournisseur,
        dto.emplacement,
      ]
    );
    return result[0];
  }

  async getMouvements(tenantSchema: string, stockId: string, page: number = 1, limit: number = 10) {
    const s = this.schema(tenantSchema);
    const offset = (page - 1) * limit;
    return this.dataSource.query(
      `SELECT ms.id, ms.type_mouvement, ms.quantite, ms.motif,
         ms.reference_doc, ms.date_mouvement,
         u.nom || ' ' || u.prenom AS operateur
       FROM ${s}.mouvement_stock ms
       LEFT JOIN ${s}.utilisateur u ON u.id = ms.utilisateur_id
       WHERE ms.stock_id = $1
       ORDER BY ms.date_mouvement DESC
       LIMIT $2 OFFSET $3`,
      [stockId, limit, offset]
    );
  }

  async enregistrerMouvement(tenantSchema: string, stockId: string, dto: MouvementStockDto, utilisateurId: string) {
    const s = this.schema(tenantSchema);

    // Vérifier que le stock existe
    const stock = await this.dataSource.query(
      `SELECT quantite_stock, libelle, unite FROM ${s}.stock WHERE id = $1`,
      [stockId]
    );
    if (!stock[0]) throw new NotFoundException('Article non trouvé');

    // Vérifier stock suffisant pour sortie
    if (dto.type_mouvement === 'sortie' && stock[0].quantite_stock < dto.quantite) {
      throw new ConflictException('Stock insuffisant pour cette sortie');
    }

    // Transaction
    await this.dataSource.query('BEGIN');
    try {
      // Calculer le signe
      const signe = dto.type_mouvement === 'entree' ? '+' : '-';

      // Update stock
      await this.dataSource.query(
        `UPDATE ${s}.stock SET
          quantite_stock = quantite_stock ${signe} $1,
          derniere_mise_a_jour = NOW()
        WHERE id = $2`,
        [dto.quantite, stockId]
      );

      // Insert mouvement
      await this.dataSource.query(
        `INSERT INTO ${s}.mouvement_stock
          (stock_id, type_mouvement, quantite, motif, reference_doc, utilisateur_id, date_mouvement)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [stockId, dto.type_mouvement, dto.quantite, dto.motif, dto.reference_doc, utilisateurId]
      );

      await this.dataSource.query('COMMIT');

      // Vérifier alerte (le trigger DB le fait déjà, mais on peut notifier manuellement)
      await this.checkEtNotifierStockCritique(tenantSchema, stockId);

      return { success: true };
    } catch (err) {
      await this.dataSource.query('ROLLBACK');
      throw err;
    }
  }

  private async checkEtNotifierStockCritique(tenantSchema: string, stockId: string): Promise<void> {
    const s = this.schema(tenantSchema);
    const stock = await this.dataSource.query(
      `SELECT libelle, quantite_stock, seuil_alerte, unite
       FROM ${s}.stock WHERE id = $1`,
      [stockId]
    );
    
    if (stock[0] && stock[0].quantite_stock <= stock[0].seuil_alerte) {
      // Le trigger trg_alerte_stock gère déjà cela automatiquement
      // Ce code est une sécurité applicative supplémentaire si besoin
      // On peut logger ou envoyer une notification externe ici
    }
  }

  // ==================== TICKETS ====================
  async getTickets(tenantSchema: string, filters?: { statut?: string; priorite?: string; batiment_id?: string }) {
    const s = this.schema(tenantSchema);
    let query = `
      SELECT t.id, t.titre, t.description,
        t.type_maintenance, t.priorite, t.statut,
        t.date_signalement, t.date_resolution,
        t.cout_reparation, t.observations,
        b.nom AS batiment_nom,
        s.nom AS salle_nom, s.code AS salle_code,
        u_signal.nom || ' ' || u_signal.prenom AS signale_par_nom,
        u_assign.nom || ' ' || u_assign.prenom AS assigne_a_nom
      FROM ${s}.ticket_maintenance t
      LEFT JOIN ${s}.batiment b ON b.id = t.batiment_id
      LEFT JOIN ${s}.salle s ON s.id = t.salle_id
      LEFT JOIN ${s}.utilisateur u_signal ON u_signal.id = t.signale_par
      LEFT JOIN ${s}.utilisateur u_assign ON u_assign.id = t.assigne_a
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.statut) {
      params.push(filters.statut);
      query += ` AND t.statut = $${params.length}`;
    }
    if (filters?.priorite) {
      params.push(filters.priorite);
      query += ` AND t.priorite = $${params.length}`;
    }
    if (filters?.batiment_id) {
      params.push(filters.batiment_id);
      query += ` AND t.batiment_id = $${params.length}`;
    }

    query += `
      ORDER BY
        CASE t.priorite
          WHEN 'urgente' THEN 1
          WHEN 'haute' THEN 2
          WHEN 'normale' THEN 3
          WHEN 'basse' THEN 4
        END,
        t.date_signalement DESC
    `;

    return this.dataSource.query(query, params);
  }

  async createTicket(tenantSchema: string, dto: CreateTicketDto, signalePar: string) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(
      `INSERT INTO ${s}.ticket_maintenance 
        (batiment_id, salle_id, titre, description, type_maintenance, priorite, signale_par, assigne_a, date_signalement)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *`,
      [
        dto.batiment_id,
        dto.salle_id,
        dto.titre,
        dto.description,
        dto.type_maintenance,
        dto.priorite || 'normale',
        signalePar,
        dto.assigne_a,
      ]
    );
    return result[0];
  }

  async updateTicket(tenantSchema: string, id: string, dto: UpdateTicketDto) {
    const s = this.schema(tenantSchema);
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (dto.statut !== undefined) {
      fields.push(`statut = $${paramIndex++}`);
      values.push(dto.statut);
      
      // Si résolu, injecter date_resolution
      if (dto.statut === 'resolu') {
        fields.push(`date_resolution = NOW()`);
      }
    }
    if (dto.priorite !== undefined) {
      fields.push(`priorite = $${paramIndex++}`);
      values.push(dto.priorite);
    }
    if (dto.assigne_a !== undefined) {
      fields.push(`assigne_a = $${paramIndex++}`);
      values.push(dto.assigne_a);
    }
    if (dto.cout_reparation !== undefined) {
      fields.push(`cout_reparation = $${paramIndex++}`);
      values.push(dto.cout_reparation);
    }
    if (dto.observations !== undefined) {
      fields.push(`observations = $${paramIndex++}`);
      values.push(dto.observations);
    }

    if (fields.length === 0) {
      throw new BadRequestException('Aucun champ à mettre à jour');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.dataSource.query(
      `UPDATE ${s}.ticket_maintenance SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (!result[0]) throw new NotFoundException('Ticket non trouvé');
    return result[0];
  }

  async getTicketStats(tenantSchema: string) {
    const s = this.schema(tenantSchema);
    return this.dataSource.query(`
      SELECT
        statut,
        COUNT(*)::int AS total,
        AVG(EXTRACT(EPOCH FROM (COALESCE(date_resolution, NOW()) - date_signalement))/3600)::INT
          AS delai_moyen_heures
      FROM ${s}.ticket_maintenance
      WHERE date_signalement >= NOW() - INTERVAL '30 days'
      GROUP BY statut
    `);
  }

  // ==================== PLANNING ENTRETIEN ====================
  async getPlanning(tenantSchema: string) {
    const s = this.schema(tenantSchema);
    return this.dataSource.query(`
      SELECT pe.id, pe.zone, pe.type_nettoyage,
        pe.jour_semaine, pe.heure_debut, pe.duree_minutes, pe.actif,
        s.nom AS salle_nom, s.code AS salle_code,
        b.nom AS batiment_nom,
        u.nom || ' ' || u.prenom AS responsable_nom
      FROM ${s}.planning_entretien pe
      LEFT JOIN ${s}.salle s ON s.id = pe.salle_id
      LEFT JOIN ${s}.batiment b ON b.id = pe.batiment_id
      LEFT JOIN ${s}.utilisateur u ON u.id = pe.responsable_id
      WHERE pe.actif = true
      ORDER BY pe.jour_semaine, pe.heure_debut
    `);
  }

  async createPlanning(tenantSchema: string, dto: CreatePlanningEntretienDto) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(
      `INSERT INTO ${s}.planning_entretien 
        (salle_id, batiment_id, zone, type_nettoyage, responsable_id, jour_semaine, heure_debut, duree_minutes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        dto.salle_id,
        dto.batiment_id,
        dto.zone,
        dto.type_nettoyage,
        dto.responsable_id,
        dto.jour_semaine,
        dto.heure_debut,
        dto.duree_minutes,
      ]
    );
    return result[0];
  }

  async togglePlanning(tenantSchema: string, id: string) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(
      `UPDATE ${s}.planning_entretien SET actif = NOT actif WHERE id = $1 RETURNING *`,
      [id]
    );
    if (!result[0]) throw new NotFoundException('Planning non trouvé');
    return result[0];
  }

  // ==================== RAPPORTS ENTRETIEN ====================
  async getRapports(tenantSchema: string, filters?: { date_debut?: string; date_fin?: string; statut?: string }) {
    const s = this.schema(tenantSchema);
    let query = `
      SELECT re.id, re.date_realisation, re.heure_debut, re.heure_fin,
        re.statut, re.observations,
        pe.type_nettoyage, pe.zone,
        s.nom AS salle_nom,
        b.nom AS batiment_nom,
        u.nom || ' ' || u.prenom AS realise_par_nom
      FROM ${s}.rapport_entretien re
      LEFT JOIN ${s}.planning_entretien pe ON pe.id = re.planning_id
      LEFT JOIN ${s}.salle s ON s.id = pe.salle_id
      LEFT JOIN ${s}.batiment b ON b.id = pe.batiment_id
      LEFT JOIN ${s}.utilisateur u ON u.id = re.realise_par
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.date_debut) {
      params.push(filters.date_debut);
      query += ` AND re.date_realisation >= $${params.length}`;
    }
    if (filters?.date_fin) {
      params.push(filters.date_fin);
      query += ` AND re.date_realisation <= $${params.length}`;
    }
    if (filters?.statut) {
      params.push(filters.statut);
      query += ` AND re.statut = $${params.length}`;
    }

    query += ` ORDER BY re.date_realisation DESC, re.heure_debut DESC`;
    return this.dataSource.query(query, params);
  }

  async createRapport(tenantSchema: string, dto: CreateRapportEntretienDto) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(
      `INSERT INTO ${s}.rapport_entretien 
        (planning_id, realise_par, date_realisation, heure_debut, heure_fin, statut, observations)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        dto.planning_id,
        dto.realise_par,
        dto.date_realisation,
        dto.heure_debut,
        dto.heure_fin,
        dto.statut,
        dto.observations,
      ]
    );
    return result[0];
  }

  // ==================== RÉSERVATIONS ====================
  async getReservations(tenantSchema: string) {
    const s = this.schema(tenantSchema);
    return this.dataSource.query(`
      SELECT r.id, r.titre, r.description,
        r.date_reservation, r.heure_debut, r.heure_fin, r.statut,
        s.nom AS salle_nom, s.code AS salle_code, s.capacite, s.type_salle,
        b.nom AS batiment_nom,
        u.nom || ' ' || u.prenom AS demandeur,
        u.role AS demandeur_role,
        u_app.nom || ' ' || u_app.prenom AS approuve_par_nom
      FROM ${s}.reservation_salle r
      JOIN ${s}.salle s ON s.id = r.salle_id
      LEFT JOIN ${s}.batiment b ON b.id = s.batiment_id
      JOIN ${s}.utilisateur u ON u.id = r.demande_par
      LEFT JOIN ${s}.utilisateur u_app ON u_app.id = r.approuve_par
      ORDER BY r.date_reservation DESC, r.heure_debut
    `);
  }

  async getCalendrier(tenantSchema: string, dateDebut: string, dateFin: string) {
    const s = this.schema(tenantSchema);
    return this.dataSource.query(`
      SELECT r.salle_id, s.nom AS salle_nom,
        r.date_reservation, r.heure_debut, r.heure_fin,
        r.titre, r.statut, 'reservation' AS source
      FROM ${s}.reservation_salle r
      JOIN ${s}.salle s ON s.id = r.salle_id
      WHERE r.date_reservation BETWEEN $1 AND $2
        AND r.statut != 'annulee'

      UNION ALL

      SELECT e.salle_id, s.nom AS salle_nom,
        e.date_seance AS date_reservation, e.heure_debut, e.heure_fin,
        'Cours' AS titre, e.statut, 'cours' AS source
      FROM ${s}.emploi_du_temps e
      JOIN ${s}.salle s ON s.id = e.salle_id
      WHERE e.date_seance BETWEEN $1 AND $2
        AND e.statut != 'annule'
        AND e.salle_id IS NOT NULL

      ORDER BY salle_id, date_reservation, heure_debut
    `, [dateDebut, dateFin]);
  }

  async approuverReservation(tenantSchema: string, id: string, approuvePar: string) {
    const s = this.schema(tenantSchema);

    // Récupérer la réservation
    const reservation = await this.dataSource.query(
      `SELECT salle_id, date_reservation, heure_debut, heure_fin FROM ${s}.reservation_salle WHERE id = $1 AND statut = 'en_attente'`,
      [id]
    );
    if (!reservation[0]) throw new NotFoundException('Réservation non trouvée ou déjà traitée');

    const { salle_id, date_reservation, heure_debut, heure_fin } = reservation[0];

    // Vérifier conflits avec autres réservations
    const conflitReservation = await this.dataSource.query(
      `SELECT COUNT(*)::int as count FROM ${s}.reservation_salle
       WHERE salle_id = $1
         AND date_reservation = $2
         AND statut = 'approuvee'
         AND id != $3
         AND (heure_debut < $5 AND heure_fin > $4)`,
      [salle_id, date_reservation, id, heure_debut, heure_fin]
    );

    if (conflitReservation[0]?.count > 0) {
      throw new ConflictException('Créneau déjà réservé');
    }

    // Vérifier conflits avec EDT
    const conflitEDT = await this.dataSource.query(
      `SELECT COUNT(*)::int as count FROM ${s}.emploi_du_temps
       WHERE salle_id = $1
         AND date_seance = $2
         AND statut != 'annule'
         AND heure_debut < $4 AND heure_fin > $3`,
      [salle_id, date_reservation, heure_debut, heure_fin]
    );

    if (conflitEDT[0]?.count > 0) {
      throw new ConflictException('Salle occupée par un cours');
    }

    // Approuver
    const result = await this.dataSource.query(
      `UPDATE ${s}.reservation_salle
       SET statut = 'approuvee', approuve_par = $1
       WHERE id = $2
       RETURNING *`,
      [approuvePar, id]
    );

    return result[0];
  }

  async refuserReservation(tenantSchema: string, id: string) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(
      `UPDATE ${s}.reservation_salle
       SET statut = 'refusee'
       WHERE id = $1 AND statut = 'en_attente'
       RETURNING *`,
      [id]
    );
    if (!result[0]) throw new NotFoundException('Réservation non trouvée ou déjà traitée');
    return result[0];
  }

  async annulerReservation(tenantSchema: string, id: string) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(
      `UPDATE ${s}.reservation_salle
       SET statut = 'annulee'
       WHERE id = $1 AND statut IN ('en_attente', 'approuvee')
       RETURNING *`,
      [id]
    );
    if (!result[0]) throw new NotFoundException('Réservation non trouvée ou déjà annulée');
    return result[0];
  }

  // ==================== INVENTAIRE ====================
  async getInventaireSalles(tenantSchema: string) {
    const s = this.schema(tenantSchema);
    return this.dataSource.query(`
      SELECT type_salle,
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE disponible = true)::int AS disponibles,
        SUM(capacite)::int AS capacite_totale
      FROM ${s}.salle
      GROUP BY type_salle
      ORDER BY total DESC
    `);
  }

  async getInventaireStocks(tenantSchema: string) {
    const s = this.schema(tenantSchema);
    return this.dataSource.query(`
      SELECT categorie,
        COUNT(*)::int AS nb_references,
        COUNT(*) FILTER (WHERE quantite_stock <= seuil_alerte)::int AS en_alerte,
        SUM(quantite_stock * COALESCE(prix_unitaire, 0))::numeric AS valeur_stock_totale
      FROM ${s}.stock
      GROUP BY categorie
      ORDER BY categorie
    `);
  }

  // ==================== DEMANDES RESSOURCE ====================
  async getDemandesRessource(tenantSchema: string) {
    const s = this.schema(tenantSchema);
    return this.dataSource.query(`
      SELECT dr.id, dr.type_ressource, dr.date_souhaitee,
        dr.heure_debut, dr.heure_fin, dr.motif,
        dr.nb_participants, dr.materiel_requis, dr.statut,
        dr.commentaire_rejet, dr.date_traitement,
        u.nom || ' ' || u.prenom AS demandeur_nom,
        u.role AS demandeur_role,
        u_trait.nom || ' ' || u_trait.prenom AS traite_par_nom
      FROM ${s}.demande_ressource dr
      JOIN ${s}.utilisateur u ON u.id = dr.demandeur_id
      LEFT JOIN ${s}.utilisateur u_trait ON u_trait.id = dr.traite_par
      ORDER BY
        CASE dr.statut WHEN 'soumise' THEN 1 ELSE 2 END,
        dr.date_souhaitee
    `);
  }

  async traiterDemande(tenantSchema: string, id: string, dto: TraiterDemandeRessourceDto, traitePar: string) {
    const s = this.schema(tenantSchema);
    const result = await this.dataSource.query(
      `UPDATE ${s}.demande_ressource
       SET statut = $1,
           commentaire_rejet = $2,
           traite_par = $3,
           date_traitement = NOW()
       WHERE id = $4
       RETURNING *`,
      [dto.statut, dto.commentaire_rejet, traitePar, id]
    );
    if (!result[0]) throw new NotFoundException('Demande non trouvée');
    return result[0];
  }
}

// Made with Bob
