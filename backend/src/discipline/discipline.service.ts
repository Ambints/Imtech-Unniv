import { Injectable, Logger, NotFoundException, Scope, Inject, BadRequestException } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class DisciplineService {
  private readonly logger = new Logger(DisciplineService.name);
  private tenantSchema: string;

  constructor(
    @InjectDataSource('tenant') private dataSource: DataSource,
    @Inject(REQUEST) private request: any,
  ) {
    // Récupérer le schéma du tenant depuis la requête
    this.tenantSchema = this.request.tenantSchema || 'public';
    this.logger.log(`DisciplineService initialized with schema: ${this.tenantSchema}`);
    
    if (!this.request.tenantSchema) {
      this.logger.warn('No tenant schema found in request! Using public schema as fallback.');
    }
  }

  private async query(sql: string, params: any[] = []): Promise<any> {
    try {
      this.logger.log(`[DEBUG] query() called with schema: ${this.tenantSchema}`);
      this.logger.log(`[DEBUG] Request tenantSchema: ${this.request?.tenantSchema}, tenantId: ${this.request?.tenantId}`);
      
      if (!this.tenantSchema || this.tenantSchema === 'public') {
        this.logger.error(`[DEBUG] Tenant schema is not set or is public!`);
        throw new BadRequestException('Tenant schema not set. Please provide X-Tenant-Id header.');
      }
      
      const schemaQuery = `SET search_path TO "${this.tenantSchema}", public`;
      this.logger.log(`[DEBUG] Setting search_path: ${schemaQuery}`);
      await this.dataSource.query(schemaQuery);
      this.logger.log(`[DEBUG] Executing SQL in schema ${this.tenantSchema}: ${sql.substring(0, 100)}...`);
      const result = await this.dataSource.query(sql, params);
      this.logger.log(`[DEBUG] Query executed successfully, rows: ${result?.length || 0}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[DEBUG] Query error in schema ${this.tenantSchema}: ${errorMessage}`);
      throw error;
    }
  }

  // ========== INCIDENTS ==========
  async createIncident(data: any): Promise<any> {
    // Validation des champs obligatoires
    if (!data.etudiantId) {
      throw new BadRequestException('Le champ etudiantId est obligatoire');
    }
    if (!data.typeIncident) {
      throw new BadRequestException('Le champ typeIncident est obligatoire');
    }
    if (!data.description) {
      throw new BadRequestException('Le champ description est obligatoire');
    }
    if (!data.rapportePar) {
      throw new BadRequestException('Le champ rapportePar est obligatoire');
    }

    this.logger.log(`[createIncident] Creating incident for etudiantId: ${data.etudiantId}, type: ${data.typeIncident}`);

    const result = await this.query(`
      INSERT INTO incident_disciplinaire (
        etudiant_id, date_incident, type_incident, description,
        sanction, duree_sanction, statut, rapporte_par, observations
      ) VALUES ($1, $2, $3, $4, $5, $6, 'ouvert', $7, $8)
      RETURNING *
    `, [
      data.etudiantId,
      data.dateIncident || new Date(),
      data.typeIncident,
      data.description,
      data.sanction || null,
      data.dureeSanction || null,
      data.rapportePar,
      data.observations || null
    ]);

    this.logger.log(`[createIncident] Incident created with ID: ${result[0]?.id}`);
    return result[0];
  }

  async findAllIncidents(filters?: { etudiantId?: string; statut?: string; typeIncident?: string }): Promise<any[]> {
    let sql = `
      SELECT i.*,
        e.nom || ' ' || e.prenom as etudiant_nom,
        u.nom || ' ' || u.prenom as rapporte_par_nom
      FROM incident_disciplinaire i
      LEFT JOIN etudiant e ON e.id = i.etudiant_id
      LEFT JOIN utilisateur u ON u.id = i.rapporte_par
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.etudiantId) {
      sql += ` AND i.etudiant_id = $${++paramCount}`;
      params.push(filters.etudiantId);
    }
    if (filters?.statut) {
      sql += ` AND i.statut = $${++paramCount}`;
      params.push(filters.statut);
    }
    if (filters?.typeIncident) {
      sql += ` AND i.type_incident = $${++paramCount}`;
      params.push(filters.typeIncident);
    }

    sql += ` ORDER BY i.date_incident DESC, i.created_at DESC`;
    return this.query(sql, params);
  }

  async findIncidentById(id: string): Promise<any> {
    const result = await this.query(`
      SELECT i.*,
        e.nom || ' ' || e.prenom as etudiant_nom,
        u.nom || ' ' || u.prenom as rapporte_par_nom,
        arb.nom || ' ' || arb.prenom as arbitre_par_nom
      FROM incident_disciplinaire i
      LEFT JOIN etudiant e ON e.id = i.etudiant_id
      LEFT JOIN utilisateur u ON u.id = i.rapporte_par
      LEFT JOIN utilisateur arb ON arb.id = i.arbitre_par
      WHERE i.id = $1
    `, [id]);

    if (!result[0]) throw new NotFoundException('Incident non trouvé');
    return result[0];
  }

  async validerIncident(id: string, validePar: string): Promise<any> {
    await this.query(`
      UPDATE incident_disciplinaire
      SET statut = 'clos', arbitre_par = $1, date_cloture = CURRENT_DATE
      WHERE id = $2
    `, [validePar, id]);
    return this.findIncidentById(id);
  }

  async updateIncident(id: string, data: any): Promise<any> {
    const fields = [];
    const values = [];
    let paramCount = 0;

    if (data.typeIncident !== undefined) {
      fields.push(`type_incident = $${++paramCount}`);
      values.push(data.typeIncident);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${++paramCount}`);
      values.push(data.description);
    }
    if (data.sanction !== undefined) {
      fields.push(`sanction = $${++paramCount}`);
      values.push(data.sanction);
    }
    if (data.dureeSanction !== undefined) {
      fields.push(`duree_sanction = $${++paramCount}`);
      values.push(data.dureeSanction);
    }
    if (data.statut !== undefined) {
      fields.push(`statut = $${++paramCount}`);
      values.push(data.statut);
    }
    if (data.observations !== undefined) {
      fields.push(`observations = $${++paramCount}`);
      values.push(data.observations);
    }

    if (fields.length === 0) return this.findIncidentById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    await this.query(`
      UPDATE incident_disciplinaire
      SET ${fields.join(', ')}
      WHERE id = $${++paramCount}
    `, values);

    return this.findIncidentById(id);
  }

  async deleteIncident(id: string): Promise<void> {
    await this.query(`DELETE FROM incident_disciplinaire WHERE id = $1`, [id]);
  }

  // ========== STATISTIQUES PAR ÉTUDIANT ==========
  async getIncidentsByStudent(etudiantId: string): Promise<any> {
    const incidents = await this.query(`
      SELECT *
      FROM incident_disciplinaire
      WHERE etudiant_id = $1
      ORDER BY date_incident DESC
    `, [etudiantId]);

    const stats = await this.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE statut = 'ouvert') as ouverts,
        COUNT(*) FILTER (WHERE statut = 'en_cours') as en_cours,
        COUNT(*) FILTER (WHERE statut = 'clos') as clos,
        COUNT(*) FILTER (WHERE type_incident = 'retard') as retards,
        COUNT(*) FILTER (WHERE type_incident = 'absenteisme') as absenteisme,
        COUNT(*) FILTER (WHERE type_incident = 'incivilite') as incivilite,
        COUNT(*) FILTER (WHERE type_incident = 'triche') as triche,
        COUNT(*) FILTER (WHERE type_incident = 'violence') as violence
      FROM incident_disciplinaire
      WHERE etudiant_id = $1
    `, [etudiantId]);

    return {
      incidents,
      stats: stats[0]
    };
  }

  // ========== DASHBOARD ==========
  async getDisciplineStats(): Promise<any> {
    const result = await this.query(`
      SELECT
        COUNT(*) as total_incidents,
        COUNT(*) FILTER (WHERE statut = 'ouvert') as incidents_ouverts,
        COUNT(*) FILTER (WHERE statut = 'en_cours') as incidents_en_cours,
        COUNT(*) FILTER (WHERE statut = 'clos') as incidents_clos,
        COUNT(*) FILTER (WHERE type_incident = 'retard') as retards,
        COUNT(*) FILTER (WHERE type_incident = 'absenteisme') as absenteisme,
        COUNT(*) FILTER (WHERE type_incident = 'incivilite') as incivilite,
        COUNT(*) FILTER (WHERE type_incident = 'triche') as triche,
        COUNT(*) FILTER (WHERE type_incident = 'violence') as violence,
        COUNT(*) FILTER (WHERE type_incident = 'autre') as autres
      FROM incident_disciplinaire
    `);

    return result[0];
  }

  // ========== RAPPORTS ==========
  async getIncidentsByPeriod(dateDebut: string, dateFin: string): Promise<any[]> {
    return this.query(`
      SELECT i.*,
        e.nom || ' ' || e.prenom as etudiant_nom,
        u.nom || ' ' || u.prenom as rapporte_par_nom
      FROM incident_disciplinaire i
      LEFT JOIN etudiant e ON e.id = i.etudiant_id
      LEFT JOIN utilisateur u ON u.id = i.rapporte_par
      WHERE i.date_incident BETWEEN $1 AND $2
      ORDER BY i.date_incident DESC
    `, [dateDebut, dateFin]);
  }

  async getIncidentsByType(): Promise<any[]> {
    return this.query(`
      SELECT
        type_incident,
        COUNT(*) as nombre,
        COUNT(*) FILTER (WHERE statut = 'ouvert') as ouverts,
        COUNT(*) FILTER (WHERE statut = 'clos') as clos
      FROM incident_disciplinaire
      GROUP BY type_incident
      ORDER BY nombre DESC
    `);
  }
}

// Made with Bob
