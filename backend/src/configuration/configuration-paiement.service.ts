import { Injectable, Logger, NotFoundException, BadRequestException, Inject, Scope } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class ConfigurationPaiementService {
  private readonly logger = new Logger(ConfigurationPaiementService.name);
  private tenantSchema: string;

  constructor(
    @InjectDataSource('tenant') private dataSource: DataSource,
    @Inject(REQUEST) private request: any,
  ) {
    this.tenantSchema = this.request.tenantSchema || 'public';
    this.logger.log(`ConfigurationPaiementService initialized with schema: ${this.tenantSchema}`);
    
    if (!this.request.tenantSchema) {
      this.logger.warn('No tenant schema found in request! Using public schema as fallback.');
    }
  }

  // Méthode helper pour exécuter des requêtes avec le bon schéma
  private async query(sql: string, params?: any[]): Promise<any> {
    try {
      if (!this.tenantSchema || this.tenantSchema === 'public') {
        throw new BadRequestException('Tenant schema not set. Please provide X-Tenant-Id header.');
      }
      
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      
      try {
        await queryRunner.query(`SET search_path TO "${this.tenantSchema}", public`);
        this.logger.debug(`Executing query in schema: ${this.tenantSchema}`);
        const result = await queryRunner.query(sql, params);
        return result;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Query error in schema ${this.tenantSchema}: ${errorMessage}`);
      throw error;
    }
  }

  // Helper pour convertir snake_case en camelCase
  private toCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.toCamelCase(item));
    }
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = this.toCamelCase(obj[key]);
      return acc;
    }, {} as any);
  }

  // ========== GESTION DES CONFIGURATIONS DE PAIEMENT ==========

  /**
   * Récupérer toutes les configurations de paiement
   */
  async findAll(filters?: { typePaiement?: string; actif?: boolean }): Promise<any[]> {
    this.logger.log(`[findAll] Fetching payment configurations from schema: ${this.tenantSchema}`);
    
    let query = `
      SELECT
        id, tenant_id, type_paiement, nom_affichage, est_actif, ordre_affichage,
        nom_banque, numero_compte, nom_titulaire,
        nom_service, numero_telephone,
        instructions_supplementaires,
        created_at, updated_at
      FROM "${this.tenantSchema}".configuration_paiement
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 0;

    if (filters?.typePaiement) {
      query += ` AND type_paiement = $${++paramCount}`;
      params.push(filters.typePaiement);
    }
    
    if (filters?.actif !== undefined) {
      query += ` AND est_actif = $${++paramCount}`;
      params.push(filters.actif);
    }

    query += ` ORDER BY ordre_affichage ASC, nom_affichage ASC`;
    
    const result = await this.query(query, params);
    this.logger.log(`[findAll] Found ${result.length} payment configurations`);
    return this.toCamelCase(result);
  }

  /**
   * Récupérer les moyens de paiement actifs (pour affichage aux étudiants)
   */
  async findActifs(): Promise<any[]> {
    this.logger.log(`[findActifs] Fetching active payment methods from schema: ${this.tenantSchema}`);
    
    const result = await this.query(`
      SELECT * FROM "${this.tenantSchema}".vue_moyens_paiement_actifs
    `);
    
    this.logger.log(`[findActifs] Found ${result.length} active payment methods`);
    return this.toCamelCase(result);
  }

  /**
   * Récupérer une configuration par ID
   */
  async findOne(id: string): Promise<any> {
    this.logger.log(`[findOne] Fetching payment configuration ${id} from schema: ${this.tenantSchema}`);
    
    const result = await this.query(`
      SELECT
        id, tenant_id, type_paiement, nom_affichage, est_actif, ordre_affichage,
        nom_banque, numero_compte, nom_titulaire,
        nom_service, numero_telephone,
        instructions_supplementaires,
        created_at, updated_at
      FROM "${this.tenantSchema}".configuration_paiement
      WHERE id = $1
    `, [id]);

    if (!result || result.length === 0) {
      throw new NotFoundException(`Configuration de paiement ${id} non trouvée`);
    }

    return this.toCamelCase(result[0]);
  }

  /**
   * Créer une nouvelle configuration de paiement
   */
  async create(data: any, userId: string): Promise<any> {
    this.logger.log(`[create] Creating payment configuration in schema: ${this.tenantSchema}`);
    
    const result = await this.query(`
      INSERT INTO "${this.tenantSchema}".configuration_paiement (
        tenant_id, type_paiement, nom_affichage, est_actif, ordre_affichage,
        nom_banque, numero_compte, nom_titulaire,
        nom_service, numero_telephone,
        instructions_supplementaires
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      data.tenantId,
      data.typePaiement,
      data.nomAffichage,
      data.estActif !== false,
      data.ordreAffichage || 0,
      data.nomBanque || null,
      data.numeroCompte || null,
      data.nomTitulaire || null,
      data.nomService || null,
      data.numeroTelephone || null,
      data.instructionsSupplementaires || null
    ]);

    this.logger.log(`[create] Payment configuration created with ID: ${result[0].id}`);
    return this.toCamelCase(result[0]);
  }

  /**
   * Mettre à jour une configuration de paiement
   */
  async update(id: string, data: any, userId: string): Promise<any> {
    this.logger.log(`[update] Updating payment configuration ${id} in schema: ${this.tenantSchema}`);
    
    // Vérifier que la configuration existe
    await this.findOne(id);

    const result = await this.query(`
      UPDATE "${this.tenantSchema}".configuration_paiement
      SET
        type_paiement = COALESCE($1, type_paiement),
        nom_affichage = COALESCE($2, nom_affichage),
        est_actif = COALESCE($3, est_actif),
        ordre_affichage = COALESCE($4, ordre_affichage),
        nom_banque = $5,
        numero_compte = $6,
        nom_titulaire = $7,
        nom_service = $8,
        numero_telephone = $9,
        instructions_supplementaires = $10,
        updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `, [
      data.typePaiement,
      data.nomAffichage,
      data.estActif,
      data.ordreAffichage,
      data.nomBanque,
      data.numeroCompte,
      data.nomTitulaire,
      data.nomService,
      data.numeroTelephone,
      data.instructionsSupplementaires,
      id
    ]);

    this.logger.log(`[update] Payment configuration ${id} updated successfully`);
    return this.toCamelCase(result[0]);
  }

  /**
   * Supprimer une configuration de paiement
   */
  async delete(id: string): Promise<void> {
    this.logger.log(`[delete] Deleting payment configuration ${id} from schema: ${this.tenantSchema}`);
    
    // Vérifier que la configuration existe
    await this.findOne(id);

    await this.query(`
      DELETE FROM "${this.tenantSchema}".configuration_paiement
      WHERE id = $1
    `, [id]);

    this.logger.log(`[delete] Payment configuration ${id} deleted successfully`);
  }

  /**
   * Activer/Désactiver une configuration de paiement
   */
  async toggleActif(id: string, actif: boolean, userId: string): Promise<any> {
    this.logger.log(`[toggleActif] Toggling payment configuration ${id} to ${actif} in schema: ${this.tenantSchema}`);
    
    const result = await this.query(`
      UPDATE "${this.tenantSchema}".configuration_paiement
      SET est_actif = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [actif, id]);

    if (!result || result.length === 0) {
      throw new NotFoundException(`Configuration de paiement ${id} non trouvée`);
    }

    this.logger.log(`[toggleActif] Payment configuration ${id} toggled successfully`);
    return this.toCamelCase(result[0]);
  }
}

// Made with Bob
