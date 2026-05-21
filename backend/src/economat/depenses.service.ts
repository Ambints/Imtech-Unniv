import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantConnectionService } from '../tenants/tenant-connection.service';

export interface Depense {
  id: string;
  libelle: string;
  montant: number;
  date_depense: string;
  fournisseur?: string;
  numero_facture?: string;
  statut: 'en_attente' | 'approuve' | 'paye' | 'rejete';
  categorie?: string;
  observations?: string;
  facture_url?: string;
  demandeur?: string;
  approbateur?: string;
  date_approbation?: string;
  created_at: string;
  updated_at: string;
}

export interface DepenseStats {
  nb_en_attente: number;
  montant_total: number;
  nb_approuve: number;
  nb_paye: number;
  nb_rejete: number;
}

@Injectable()
export class DepensesService {
  constructor(private tenantConnection: TenantConnectionService) {}

  private async query(sql: string, params: any[] = []): Promise<any> {
    const connection = this.tenantConnection.getConnection();
    if (!connection) {
      throw new Error('No tenant connection available');
    }

    try {
      const result = await connection.query(sql, params);
      return result;
    } catch (error) {
      console.error('[DepensesService] Query error:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getAll(filters: {
    page?: number;
    limit?: number;
    statut?: string;
    categorie?: string;
    fournisseur?: string;
    search?: string;
  }): Promise<{ data: Depense[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.statut) {
      conditions.push(`d.statut = $${paramIndex}`);
      params.push(filters.statut);
      paramIndex++;
    }

    if (filters.categorie) {
      conditions.push(`d.categorie = $${paramIndex}`);
      params.push(filters.categorie);
      paramIndex++;
    }

    if (filters.fournisseur) {
      conditions.push(`d.fournisseur ILIKE $${paramIndex}`);
      params.push(`%${filters.fournisseur}%`);
      paramIndex++;
    }

    if (filters.search) {
      conditions.push(`(d.libelle ILIKE $${paramIndex} OR d.fournisseur ILIKE $${paramIndex})`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM depense d WHERE ${whereClause}`;
    const countResult = await this.query(countQuery, params);
    const total = parseInt(countResult[0]?.total || '0');

    // Get data
    const dataQuery = `
      SELECT 
        d.id,
        d.libelle,
        d.montant,
        d.date_depense,
        d.fournisseur,
        d.numero_facture,
        d.statut,
        d.categorie,
        d.observations,
        d.facture_url,
        d.date_approbation,
        d.created_at,
        d.updated_at,
        CONCAT(u1.nom, ' ', u1.prenom) as demandeur,
        CONCAT(u2.nom, ' ', u2.prenom) as approbateur
      FROM depense d
      LEFT JOIN utilisateur u1 ON d.demande_par = u1.id
      LEFT JOIN utilisateur u2 ON d.approuve_par = u2.id
      WHERE ${whereClause}
      ORDER BY d.date_depense DESC, d.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataParams = [...params, limit, offset];
    const data = await this.query(dataQuery, dataParams);

    return { data, total };
  }

  async getStats(): Promise<DepenseStats> {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE statut = 'en_attente') as nb_en_attente,
        COALESCE(SUM(montant) FILTER (WHERE statut = 'en_attente'), 0) as montant_total,
        COUNT(*) FILTER (WHERE statut = 'approuve') as nb_approuve,
        COUNT(*) FILTER (WHERE statut = 'paye') as nb_paye,
        COUNT(*) FILTER (WHERE statut = 'rejete') as nb_rejete
      FROM depense
    `;

    const result = await this.query(query);
    return result[0];
  }

  async getById(id: string): Promise<Depense> {
    const query = `
      SELECT 
        d.*,
        CONCAT(u1.nom, ' ', u1.prenom) as demandeur,
        CONCAT(u2.nom, ' ', u2.prenom) as approbateur
      FROM depense d
      LEFT JOIN utilisateur u1 ON d.demande_par = u1.id
      LEFT JOIN utilisateur u2 ON d.approuve_par = u2.id
      WHERE d.id = $1
    `;

    const result = await this.query(query, [id]);
    if (!result || result.length === 0) {
      throw new NotFoundException('Dépense non trouvée');
    }

    return result[0];
  }

  async create(data: {
    libelle: string;
    montant: number;
    categorie?: string;
    fournisseur?: string;
    numero_facture?: string;
    observations?: string;
    annee_academique_id: string;
    budget_id?: string;
    demande_par: string;
  }): Promise<Depense> {
    const query = `
      INSERT INTO depense (
        libelle, montant, categorie, fournisseur, numero_facture,
        observations, annee_academique_id, budget_id, demande_par, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'en_attente')
      RETURNING *
    `;

    const params = [
      data.libelle,
      data.montant,
      data.categorie,
      data.fournisseur,
      data.numero_facture,
      data.observations,
      data.annee_academique_id,
      data.budget_id || null,
      data.demande_par,
    ];

    const result = await this.query(query, params);
    return result[0];
  }

  async approve(id: string, data: {
    statut: 'approuve' | 'rejete';
    motif_decision?: string;
    approuve_par: string;
  }): Promise<Depense> {
    // Si on approuve, vérifier que le budget a suffisamment de solde
    if (data.statut === 'approuve') {
      const checkQuery = `
        SELECT d.montant, d.budget_id, b.montant_prevu, b.montant_realise
        FROM depense d
        LEFT JOIN budget b ON d.budget_id = b.id
        WHERE d.id = $1
      `;
      
      const checkResult = await this.query(checkQuery, [id]);
      
      if (checkResult && checkResult.length > 0) {
        const depense = checkResult[0];
        
        // Si la dépense est liée à un budget, vérifier le solde
        if (depense.budget_id) {
          const solde = depense.montant_prevu - depense.montant_realise;
          
          if (depense.montant > solde) {
            throw new Error(`Budget insuffisant. Solde disponible: ${solde}, Montant demandé: ${depense.montant}`);
          }
        }
      }
    }

    const query = `
      UPDATE depense
      SET statut = $1,
          motif_decision = $2,
          approuve_par = $3,
          date_approbation = NOW(),
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;

    const params = [data.statut, data.motif_decision, data.approuve_par, id];
    const result = await this.query(query, params);

    if (!result || result.length === 0) {
      throw new NotFoundException('Dépense non trouvée');
    }

    return result[0];
  }

  async markAsPaid(id: string): Promise<Depense> {
    // Récupérer la dépense pour obtenir le budget_id et le montant
    const getDepenseQuery = `
      SELECT id, montant, budget_id
      FROM depense
      WHERE id = $1 AND statut = 'approuve'
    `;
    
    const depenseResult = await this.query(getDepenseQuery, [id]);
    
    if (!depenseResult || depenseResult.length === 0) {
      throw new NotFoundException('Dépense non trouvée ou non approuvée');
    }
    
    const depense = depenseResult[0];
    
    // Mettre à jour le statut de la dépense
    const updateDepenseQuery = `
      UPDATE depense
      SET statut = 'paye',
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.query(updateDepenseQuery, [id]);
    
    // Si la dépense est liée à un budget, mettre à jour le montant_realise du budget
    if (depense.budget_id) {
      const updateBudgetQuery = `
        UPDATE budget
        SET montant_realise = montant_realise + $1,
            updated_at = NOW()
        WHERE id = $2
      `;
      
      await this.query(updateBudgetQuery, [depense.montant, depense.budget_id]);
    }

    return result[0];
  }
}

// Made with Bob
