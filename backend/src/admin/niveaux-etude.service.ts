import { Injectable, NotFoundException, ConflictException, Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { TenantConnectionService } from '../tenants/tenant-connection.service';

@Injectable({ scope: Scope.REQUEST })
export class NiveauxEtudeService {
  constructor(
    @Inject(REQUEST) private request: any,
    private tenantConnectionService: TenantConnectionService,
  ) {}

  private async getManager() {
    return this.tenantConnectionService.getManager();
  }

  async findAll(): Promise<any[]> {
    const manager = await this.getManager();
    return manager.query(`
      SELECT 
        id,
        code,
        libelle,
        description,
        ordre,
        type_diplome,
        actif,
        created_at,
        updated_at
      FROM niveau_etude
      ORDER BY ordre ASC
    `);
  }

  async findActifs(): Promise<any[]> {
    const manager = await this.getManager();
    return manager.query(`
      SELECT
        id,
        code,
        libelle,
        description,
        ordre,
        type_diplome
      FROM niveau_etude
      WHERE actif = true
      ORDER BY ordre ASC
    `);
  }

  async findOne(id: string): Promise<any> {
    const manager = await this.getManager();
    const result = await manager.query(`
      SELECT * FROM niveau_etude WHERE id = $1
    `, [id]);

    if (result.length === 0) {
      throw new NotFoundException(`Niveau d'études avec l'ID ${id} non trouvé`);
    }

    return result[0];
  }

  async create(dto: any): Promise<any> {
    const manager = await this.getManager();
    
    // Vérifier si le code existe déjà
    const existing = await manager.query(`
      SELECT id FROM niveau_etude WHERE code = $1
    `, [dto.code]);

    if (existing.length > 0) {
      throw new ConflictException(`Un niveau avec le code "${dto.code}" existe déjà`);
    }

    const result = await manager.query(`
      INSERT INTO niveau_etude (code, libelle, description, ordre, type_diplome, actif)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      dto.code,
      dto.libelle,
      dto.description || null,
      dto.ordre,
      dto.typeDiplome || null,
      dto.actif !== undefined ? dto.actif : true
    ]);

    return result[0];
  }

  async update(id: string, dto: any): Promise<any> {
    const manager = await this.getManager();
    
    // Vérifier que le niveau existe
    await this.findOne(id);

    // Si le code change, vérifier qu'il n'existe pas déjà
    if (dto.code) {
      const existing = await manager.query(`
        SELECT id FROM niveau_etude WHERE code = $1 AND id != $2
      `, [dto.code, id]);

      if (existing.length > 0) {
        throw new ConflictException(`Un niveau avec le code "${dto.code}" existe déjà`);
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (dto.code !== undefined) {
      updates.push(`code = $${paramIndex++}`);
      values.push(dto.code);
    }
    if (dto.libelle !== undefined) {
      updates.push(`libelle = $${paramIndex++}`);
      values.push(dto.libelle);
    }
    if (dto.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(dto.description);
    }
    if (dto.ordre !== undefined) {
      updates.push(`ordre = $${paramIndex++}`);
      values.push(dto.ordre);
    }
    if (dto.typeDiplome !== undefined) {
      updates.push(`type_diplome = $${paramIndex++}`);
      values.push(dto.typeDiplome);
    }
    if (dto.actif !== undefined) {
      updates.push(`actif = $${paramIndex++}`);
      values.push(dto.actif);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await manager.query(`
      UPDATE niveau_etude
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, values);

    return result[0];
  }

  async remove(id: string): Promise<void> {
    const manager = await this.getManager();
    
    // Vérifier que le niveau existe
    await this.findOne(id);

    // Vérifier qu'aucune inscription n'utilise ce niveau
    const inscriptions = await manager.query(`
      SELECT COUNT(*) as count FROM inscription WHERE annee_niveau = (
        SELECT ordre FROM niveau_etude WHERE id = $1
      )
    `, [id]);

    if (parseInt(inscriptions[0].count) > 0) {
      throw new ConflictException(
        'Impossible de supprimer ce niveau car il est utilisé par des inscriptions'
      );
    }

    await manager.query(`
      DELETE FROM niveau_etude WHERE id = $1
    `, [id]);
  }

  async toggleActif(id: string): Promise<any> {
    const manager = await this.getManager();
    await this.findOne(id);

    const result = await manager.query(`
      UPDATE niveau_etude
      SET actif = NOT actif, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id]);

    return result[0];
  }
}

// Made with Bob
