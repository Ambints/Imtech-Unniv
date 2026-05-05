import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './user.entity';
import { SuperAdmin } from './super-admin.entity';
import { Tenant } from '../tenants/tenant.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'tenant') private repo: Repository<User>,
    @InjectRepository(SuperAdmin, 'default') private superAdminRepo: Repository<SuperAdmin>,
    @InjectRepository(Tenant, 'default') private tenantRepo: Repository<Tenant>,
    private dataSource: DataSource,
  ) {}

  async create(dto: any): Promise<any> {
    const password = await bcrypt.hash(dto.password || 'Imtech@2024!', 12);

    // Si c'est un super_admin, créer dans la table super_admin
    if (dto.role === 'super_admin') {
      const existingSuperAdmin = await this.superAdminRepo.findOne({ where: { email: dto.email } });
      if (existingSuperAdmin) throw new ConflictException('Email deja utilise');
      
      const superAdmin = this.superAdminRepo.create({
        email: dto.email,
        password: password,
        nom: dto.nom,
        prenom: dto.prenom,
        actif: dto.actif !== undefined ? dto.actif : true,
      });
      
      return this.superAdminRepo.save(superAdmin);
    }

    // Pour tous les autres rôles, créer dans le schéma de l'université spécifiée
    if (dto.tenantId) {
      const tenant = await this.tenantRepo.findOne({ where: { id: dto.tenantId } });
      if (!tenant) throw new NotFoundException('Université non trouvée');

      // Vérifier si l'email existe déjà dans ce schéma
      const checkQuery = `SELECT id FROM "${tenant.schemaName}".utilisateur WHERE email = $1`;
      const existing = await this.dataSource.query(checkQuery, [dto.email]);
      if (existing.length > 0) throw new ConflictException('Email deja utilise dans cette université');

      // Créer l'utilisateur dans le schéma de l'université
      const insertQuery = `
        INSERT INTO "${tenant.schemaName}".utilisateur
        (email, password_hash, nom, prenom, telephone, role, actif, email_verifie)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, email, nom, prenom, telephone, role, actif, created_at
      `;
      
      const result = await this.dataSource.query(insertQuery, [
        dto.email,
        password,
        dto.nom,
        dto.prenom,
        dto.telephone || null,
        dto.role,
        dto.actif !== undefined ? dto.actif : true,
        true
      ]);

      return {
        ...result[0],
        tenantId: tenant.id,
        university: tenant.nom
      };
    }

    // Si pas de tenantId fourni, erreur
    throw new ConflictException('TenantId requis pour créer un utilisateur');
  }

  async findAll(tid?: string, role?: string, university?: string): Promise<any[]> {
    // Get all active tenants
    const tenants = await this.tenantRepo.find({ where: { actif: true } });
    
    const allUsers: any[] = [];
    
    for (const tenant of tenants) {
      // Skip if filtering by specific tenantId or university
      if (tid && tenant.id !== tid) continue;
      if (university && tenant.id !== university && tenant.slug !== university) continue;
      
      // Query users from this tenant's schema using positional parameters
      const query = role
        ? `SELECT id, prenom, nom, email, role, actif, created_at, telephone, photo_url, $1::uuid as tenant_id, $2 as university
           FROM "${tenant.schemaName}".utilisateur
           WHERE role = $3`
        : `SELECT id, prenom, nom, email, role, actif, created_at, telephone, photo_url, $1::uuid as tenant_id, $2 as university
           FROM "${tenant.schemaName}".utilisateur`;
      
      const params = role ? [tenant.id, tenant.nom, role] : [tenant.id, tenant.nom];
      
      try {
        const users = await this.dataSource.query(query, params);
        allUsers.push(...users.map((u: any) => ({
          id: u.id,
          prenom: u.prenom,
          nom: u.nom,
          email: u.email,
          role: u.role,
          actif: u.actif,
          createdAt: u.created_at,
          telephone: u.telephone,
          photoUrl: u.photo_url,
          tenantId: u.tenant_id,
          university: u.university,
        })));
      } catch (err: any) {
        // Skip tenants with missing schemas
        console.warn(`Failed to query schema ${tenant.schemaName}:`, err?.message || String(err));
      }
    }
    
    return allUsers;
  }

  async findOne(id: string): Promise<any> {
    const u = await this.repo.findOne({ where: { id } });
    if (!u) throw new NotFoundException('Utilisateur introuvable');
    return u;
  }

  async findByEmail(email: string): Promise<any> {
    // Search across all tenant schemas
    const tenants = await this.tenantRepo.find({ where: { actif: true } });
    
    for (const tenant of tenants) {
      try {
        const query = `
          SELECT id, email, password_hash as password, nom, prenom, telephone,
                 photo_url, role, actif, email_verifie, derniere_connexion,
                 token_reset, token_reset_expiry, created_at, updated_at
          FROM "${tenant.schemaName}".utilisateur
          WHERE email = $1
        `;
        
        const result = await this.dataSource.query(query, [email]);
        
        if (result.length > 0) {
          const user = result[0];
          return {
            id: user.id,
            email: user.email,
            password: user.password,
            nom: user.nom,
            prenom: user.prenom,
            telephone: user.telephone,
            photoUrl: user.photo_url,
            role: user.role,
            actif: user.actif,
            emailVerifie: user.email_verifie,
            derniereConnexion: user.derniere_connexion,
            tokenReset: user.token_reset,
            tokenResetExpiry: user.token_reset_expiry,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            tenantId: tenant.id,
          };
        }
      } catch (err: any) {
        // Skip tenants with missing schemas
        console.warn(`Failed to query schema ${tenant.schemaName}:`, err?.message || String(err));
      }
    }
    
    // If not found in any tenant schema, return null
    return null;
  }

  async findSuperAdminByEmail(email: string): Promise<SuperAdmin | null> {
    return this.superAdminRepo.findOne({ where: { email } });
  }

  async updateSuperAdminLastLogin(id: string): Promise<void> {
    await this.superAdminRepo.update(id, { derniereConnexion: new Date() });
  }

  async update(id: string, dto: any): Promise<any> {
    // Try to find user in tenant schemas
    const tenants = await this.tenantRepo.find({ where: { actif: true } });
    
    for (const tenant of tenants) {
      try {
        const checkQuery = `SELECT id FROM "${tenant.schemaName}".utilisateur WHERE id = $1`;
        const exists = await this.dataSource.query(checkQuery, [id]);
        
        if (exists.length > 0) {
          // Build update query dynamically
          const updates: string[] = [];
          const values: any[] = [];
          let paramIndex = 1;
          
          if (dto.nom) {
            updates.push(`nom = $${paramIndex++}`);
            values.push(dto.nom);
          }
          if (dto.prenom) {
            updates.push(`prenom = $${paramIndex++}`);
            values.push(dto.prenom);
          }
          if (dto.email) {
            updates.push(`email = $${paramIndex++}`);
            values.push(dto.email);
          }
          if (dto.telephone !== undefined) {
            updates.push(`telephone = $${paramIndex++}`);
            values.push(dto.telephone);
          }
          if (dto.role) {
            updates.push(`role = $${paramIndex++}`);
            values.push(dto.role);
          }
          if (dto.actif !== undefined) {
            updates.push(`actif = $${paramIndex++}`);
            values.push(dto.actif);
          }
          if (dto.derniereConnexion) {
            updates.push(`derniere_connexion = $${paramIndex++}`);
            values.push(dto.derniereConnexion);
          }
          if (dto.password) {
            const hashedPassword = await bcrypt.hash(dto.password, 12);
            updates.push(`password_hash = $${paramIndex++}`);
            values.push(hashedPassword);
          }
          
          // Always update updated_at
          updates.push(`updated_at = NOW()`);
          
          if (updates.length > 0) {
            values.push(id);
            const updateQuery = `
              UPDATE "${tenant.schemaName}".utilisateur
              SET ${updates.join(', ')}
              WHERE id = $${paramIndex}
              RETURNING id, email, nom, prenom, telephone, role, actif, created_at, updated_at
            `;
            const result = await this.dataSource.query(updateQuery, values);
            return {
              ...result[0],
              tenantId: tenant.id,
              university: tenant.nom
            };
          }
          return exists[0];
        }
      } catch (err: any) {
        console.warn(`Failed to update in schema ${tenant.schemaName}:`, err?.message || String(err));
      }
    }
    
    // Fallback to default repository
    const u = await this.findOne(id);
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 12);
    return this.repo.save({ ...u, ...dto });
  }

  async remove(id: string): Promise<void> {
    // Try to find and delete user in tenant schemas
    const tenants = await this.tenantRepo.find({ where: { actif: true } });
    
    for (const tenant of tenants) {
      try {
        const checkQuery = `SELECT id FROM "${tenant.schemaName}".utilisateur WHERE id = $1`;
        const exists = await this.dataSource.query(checkQuery, [id]);
        
        if (exists.length > 0) {
          const deleteQuery = `DELETE FROM "${tenant.schemaName}".utilisateur WHERE id = $1`;
          await this.dataSource.query(deleteQuery, [id]);
          return;
        }
      } catch (err: any) {
        console.warn(`Failed to delete in schema ${tenant.schemaName}:`, err?.message || String(err));
      }
    }
    
    // Fallback to default repository
    await this.repo.delete(id);
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    // Try to update in tenant schemas
    const tenants = await this.tenantRepo.find({ where: { actif: true } });
    
    for (const tenant of tenants) {
      try {
        const checkQuery = `SELECT id FROM "${tenant.schemaName}".utilisateur WHERE id = $1`;
        const exists = await this.dataSource.query(checkQuery, [id]);
        
        if (exists.length > 0) {
          const updateQuery = `
            UPDATE "${tenant.schemaName}".utilisateur
            SET token_reset = $1, token_reset_expiry = $2
            WHERE id = $3
          `;
          const expiry = token ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;
          await this.dataSource.query(updateQuery, [token, expiry, id]);
          return;
        }
      } catch (err: any) {
        console.warn(`Failed to update token in schema ${tenant.schemaName}:`, err?.message || String(err));
      }
    }
    
    // Fallback to default repository
    await this.repo.update(id, {
      tokenReset: token,
      tokenResetExpiry: token ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null
    });
  }
}