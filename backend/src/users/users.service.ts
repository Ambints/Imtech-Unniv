import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './user.entity';
import { SuperAdmin } from './super-admin.entity';
import { Tenant } from '../tenants/tenant.entity';
import { EmailService } from '../email/email.service';
import { CacheService } from '../cache/cache.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'tenant') private repo: Repository<User>,
    @InjectRepository(SuperAdmin, 'default') private superAdminRepo: Repository<SuperAdmin>,
    @InjectRepository(Tenant, 'default') private tenantRepo: Repository<Tenant>,
    private dataSource: DataSource,
    private emailService: EmailService,
    private cacheService: CacheService,
  ) {}

  /**
   * Génère un mot de passe aléatoire sécurisé
   */
  private generateSecurePassword(length: number = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // S'assurer d'avoir au moins un caractère de chaque type
    password += 'abcdefghijklmnopqrstuvwxyz'[crypto.randomInt(26)];
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[crypto.randomInt(26)];
    password += '0123456789'[crypto.randomInt(10)];
    password += '!@#$%^&*'[crypto.randomInt(8)];
    
    // Remplir le reste avec des caractères aléatoires
    for (let i = 4; i < length; i++) {
      password += charset[crypto.randomInt(charset.length)];
    }
    
    // Mélanger le mot de passe
    return password.split('').sort(() => crypto.randomInt(3) - 1).join('');
  }

  async create(dto: any): Promise<any> {
    const password = dto.password || this.generateSecurePassword();
    const hashedPassword = await bcrypt.hash(password, 12);

    // Invalider le cache des utilisateurs
    await this.cacheService.invalidatePattern('users:*');

    // Si c'est un super_admin, créer dans la table super_admin
    if (dto.role === 'super_admin') {
      const existingSuperAdmin = await this.superAdminRepo.findOne({ where: { email: dto.email } });
      if (existingSuperAdmin) throw new ConflictException('Email deja utilise');
      
      const superAdmin = this.superAdminRepo.create({
        email: dto.email,
        password: hashedPassword,
        nom: dto.nom,
        prenom: dto.prenom,
        actif: dto.actif !== undefined ? dto.actif : true,
        passwordResetRequired: !dto.password, // Forcer reset si généré automatiquement
        lastPasswordReset: !dto.password ? new Date() : null,
      });
      
      const savedSuperAdmin = await this.superAdminRepo.save(superAdmin);
      
      // Envoyer l'email avec les identifiants si le mot de passe a été généré
      if (!dto.password) {
        try {
          await this.emailService.sendCredentialsEmail(
            dto.email,
            dto.nom,
            dto.prenom,
            password,
            'Super Administrateur',
            'IMTECH University'
          );
          console.log(`Email d'identifiants envoyé au super admin ${dto.email}`);
        } catch (error: any) {
          console.error('Erreur lors de l\'envoi d\'email au super admin:', error);
          // Ne pas bloquer la création de l'utilisateur
        }
      }
      
      // Retourner le mot de passe en clair seulement s'il a été généré
      return {
        ...savedSuperAdmin,
        plainPassword: !dto.password ? password : undefined,
        passwordResetRequired: !dto.password,
        emailSent: !dto.password
      };
    }

    // Pour tous les autres rôles, créer dans le schéma de l'université spécifiée
    if (dto.tenantId) {
      const tenant = await this.tenantRepo.findOne({ where: { id: dto.tenantId } });
      if (!tenant) throw new NotFoundException('Université non trouvée');

      // Vérifier si l'email existe déjà dans ce schéma
      const checkQuery = `SELECT id FROM "${tenant.schemaName}".utilisateur WHERE email = $1`;
      const existing = await this.dataSource.query(checkQuery, [dto.email]);
      if (existing.length > 0) throw new ConflictException('Email deja utilise dans cette université');

      // Vérifier si la table utilisateur existe dans le schéma
      const tableCheckQuery = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = $1 AND table_name = 'utilisateur'
      `;
      const tableExists = await this.dataSource.query(tableCheckQuery, [tenant.schemaName]);
      
      if (tableExists.length === 0) {
        throw new NotFoundException(`La table 'utilisateur' n'existe pas dans le schéma ${tenant.schemaName}`);
      }

      // Créer l'utilisateur dans le schéma de l'université
      const insertQuery = `
        INSERT INTO "${tenant.schemaName}".utilisateur
        (email, password_hash, nom, prenom, telephone, role, actif, email_verifie, password_reset_required, last_password_reset)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, email, nom, prenom, telephone, role, actif, created_at, password_reset_required
      `;
      
      const result = await this.dataSource.query(insertQuery, [
        dto.email,
        hashedPassword,
        dto.nom,
        dto.prenom,
        dto.telephone || null,
        dto.role,
        dto.actif !== undefined ? dto.actif : true,
        true,
        !dto.password, // password_reset_required
        !dto.password ? new Date() : null // last_password_reset
      ]);

      const userId = result[0].id;

      // Si le rôle est "enseignant", créer automatiquement l'enregistrement dans la table enseignant
      if (dto.role === 'enseignant') {
        try {
          // Générer un matricule unique pour l'enseignant
          // Count existing enseignants to generate next matricule
          const countQuery = `
            SELECT COUNT(*) as count
            FROM "${tenant.schemaName}".enseignant
          `;
          const countResult = await this.dataSource.query(countQuery);
          const nextNum = (parseInt(countResult[0]?.count || 0) + 1);
          const matricule = `ENS${String(nextNum).padStart(5, '0')}`;

          console.log(`Génération du matricule: ${matricule} (next_num: ${nextNum})`);

          // Créer l'enregistrement enseignant avec les données fournies
          const insertEnseignantQuery = `
            INSERT INTO "${tenant.schemaName}".enseignant
            (utilisateur_id, matricule, nom, prenom, titre, grade, specialite, email, telephone, actif)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, matricule
          `;
          
          const enseignantResult = await this.dataSource.query(insertEnseignantQuery, [
            userId,
            matricule,
            dto.nom,
            dto.prenom,
            dto.titre || null,
            dto.grade || null,
            dto.specialite || null,
            dto.email,
            dto.telephone || null,
            true
          ]);

          console.log(`Enregistrement enseignant créé avec matricule ${matricule} pour l'utilisateur ${dto.email}`);
          
          result[0].enseignantId = enseignantResult[0].id;
          result[0].matricule = enseignantResult[0].matricule;
        } catch (error: any) {
          console.error('Erreur lors de la création de l\'enregistrement enseignant:', error);
          console.error('Détails de l\'erreur:', error.stack);
          // Supprimer l'utilisateur créé en cas d'erreur
          await this.dataSource.query(`DELETE FROM "${tenant.schemaName}".utilisateur WHERE id = $1`, [userId]);
          throw new ConflictException('Erreur lors de la création du profil enseignant: ' + error.message);
        }
      }

      // Envoyer l'email avec les identifiants si le mot de passe a été généré
      if (!dto.password) {
        try {
          await this.emailService.sendCredentialsEmail(
            dto.email,
            dto.nom,
            dto.prenom,
            password,
            dto.role,
            tenant.nom
          );
          console.log(`Email d'identifiants envoyé à l'utilisateur ${dto.email} (${tenant.nom})`);
        } catch (error: any) {
          console.error('Erreur lors de l\'envoi d\'email à l\'utilisateur:', error);
          // Ne pas bloquer la création de l'utilisateur
        }
      }

      return {
        ...result[0],
        tenantId: tenant.id,
        university: tenant.nom,
        plainPassword: !dto.password ? password : undefined,
        passwordResetRequired: !dto.password,
        emailSent: !dto.password
      };
    }

    // Si pas de tenantId fourni, erreur
    throw new ConflictException('TenantId requis pour créer un utilisateur');
  }

  /**
   * Trouve un super admin par ID
   */
  async findSuperAdminById(id: string): Promise<SuperAdmin | null> {
    return this.superAdminRepo.findOne({ where: { id } });
  }

  /**
   * Met à jour le mot de passe d'un super admin
   */
  async updateSuperAdminPassword(id: string, hashedPassword: string): Promise<void> {
    await this.superAdminRepo.update(id, {
      password: hashedPassword,
      passwordResetRequired: false,
      lastPasswordReset: new Date()
    });
  }

  /**
   * Trouve un utilisateur par ID
   */
  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * Met à jour le mot de passe d'un utilisateur
   */
  async updateUserPassword(id: string, hashedPassword: string): Promise<void> {
    await this.repo.update(id, {
      password: hashedPassword,
      passwordResetRequired: false,
      lastPasswordReset: new Date()
    });
  }

  async findAll(
    tid?: string,
    role?: string,
    university?: string,
    page: number = 1,
    limit: number = 50
  ): Promise<any[]> {
    // Générer la clé de cache
    const cacheKey = CacheService.generateUserCacheKey('findAll', {
      tid, role, university, page, limit
    });
    
    // Vérifier le cache d'abord
    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Get all active tenants
    const tenants = await this.tenantRepo.find({ where: { actif: true } });
    
    const allUsers: any[] = [];
    let totalCount = 0;
    
    for (const tenant of tenants) {
      // Skip if tenant filter is specified and doesn't match (by ID or name)
      if (tid && tenant.id !== tid) continue;
      
      // Skip if university filter is specified and doesn't match (by ID or name)
      if (university) {
        const matchById = tenant.id === university;
        const matchByName = tenant.nom.toLowerCase().indexOf(university.toLowerCase()) !== -1;
        if (!matchById && !matchByName) continue;
      }
      
      const schemaName = tenant.schemaName;
      
      // Build query based on filters
      let query = `SELECT id, email, nom, prenom, telephone, role, actif, created_at, derniere_connexion FROM "${schemaName}".utilisateur`;
      const params: any[] = [];
      const conditions: string[] = [];
      
      if (role) {
        conditions.push(`role = $${params.length + 1}`);
        params.push(role);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY created_at DESC';
      
      // Ajouter la pagination
      const offset = (page - 1) * limit;
      query += ` LIMIT ${limit} OFFSET ${offset}`;
      
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
          tenantId: tenant.id,
          university: tenant.nom,
        })));
      } catch (err: any) {
        // Skip tenants with missing schemas
        console.warn(`Failed to query schema ${tenant.schemaName}:`, err?.message || String(err));
      }
    }
    
    // Mettre en cache le résultat
    await this.cacheService.set(cacheKey, allUsers, 300); // 5 minutes
    
    return allUsers;
  }

  async findOne(id: string): Promise<any> {
    // Search across all tenant schemas
    // Note: For auth routes, tenant middleware is skipped, so we can't rely on repo
    const tenants = await this.tenantRepo.find({ where: { actif: true } });
    
    for (const tenant of tenants) {
      if (!tenant.schemaName) continue;
      
      try {
        const query = `
          SELECT id, email, password_hash, nom, prenom, telephone, photo_url, role, actif, 
                 token_reset, token_reset_expiry, created_at, updated_at
          FROM "${tenant.schemaName}".utilisateur
          WHERE id = $1
          LIMIT 1
        `;
        const result = await this.dataSource.query(query, [id]);
        
        if (result && result.length > 0) {
          const user = result[0];
          return {
            id: user.id,
            email: user.email,
            password: user.password_hash,
            nom: user.nom,
            prenom: user.prenom,
            telephone: user.telephone,
            photoUrl: user.photo_url,
            role: user.role,
            actif: user.actif,
            tokenReset: user.token_reset,
            tokenResetExpiry: user.token_reset_expiry,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            tenantId: tenant.id,
          };
        }
      } catch (err: any) {
        console.warn(`[UsersService] Failed to findOne in schema ${tenant.schemaName}:`, err?.message);
      }
    }
    
    throw new NotFoundException('Utilisateur introuvable');
  }

  async findByEmail(email: string): Promise<any> {
    // Search across all active tenant schemas
    // Note: For auth routes, tenant middleware is skipped, so we can't rely on repo
    const tenants = await this.tenantRepo.find({ where: { actif: true } });
    
    for (const tenant of tenants) {
      if (!tenant.schemaName) continue;
      
      try {
        const query = `
          SELECT id, email, password_hash, nom, prenom, telephone, photo_url, role, actif, created_at, updated_at
          FROM "${tenant.schemaName}".utilisateur
          WHERE email = $1
          LIMIT 1
        `;
        const result = await this.dataSource.query(query, [email]);
        
        if (result && result.length > 0) {
          const user = result[0];
          console.log(`[UsersService] Found user in tenant ${tenant.nom} (${tenant.schemaName})`);
          return {
            id: user.id,
            email: user.email,
            password: user.password_hash,
            nom: user.nom,
            prenom: user.prenom,
            telephone: user.telephone,
            photoUrl: user.photo_url,
            role: user.role,
            actif: user.actif,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            tenantId: tenant.id,
            tenantSchema: tenant.schemaName,
          };
        }
      } catch (err: any) {
        console.warn(`[UsersService] Failed to search in schema ${tenant.schemaName}:`, err?.message);
      }
    }
    
    return null;
  }

  async getTenantInfo(tenantId: string): Promise<Tenant | null> {
    return this.tenantRepo.findOne({ where: { id: tenantId } });
  }

  async findSuperAdminByEmail(email: string): Promise<SuperAdmin | null> {
    return this.superAdminRepo.findOne({ where: { email } });
  }

  async updateSuperAdminLastLogin(id: string): Promise<void> {
    await this.superAdminRepo.update(id, { derniereConnexion: new Date() });
  }

  async update(id: string, dto: any): Promise<any> {
    console.log(`[UsersService] Updating user ${id} with data:`, { ...dto, password: dto.password ? '***' : undefined });
    
    // Invalider le cache des utilisateurs
    await this.cacheService.invalidatePattern('users:*');
    
    // Try to find user in tenant schemas
    const tenants = await this.tenantRepo.find({ where: { actif: true } });
    
    for (const tenant of tenants) {
      // Skip tenants without valid schema names (like univ_demo)
      if (!tenant.schemaName || tenant.schemaName === 'univ_demo') {
        continue;
      }
      
      try {
        const checkQuery = `SELECT id FROM "${tenant.schemaName}".utilisateur WHERE id = $1`;
        const exists = await this.dataSource.query(checkQuery, [id]);
        
        if (exists.length > 0) {
          console.log(`[UsersService] Found user in schema ${tenant.schemaName}`);
          
          // Si l'email est modifié, vérifier qu'il n'existe pas déjà
          if (dto.email !== undefined) {
            const emailCheckQuery = `SELECT id FROM "${tenant.schemaName}".utilisateur WHERE email = $1 AND id != $2`;
            const emailExists = await this.dataSource.query(emailCheckQuery, [dto.email, id]);
            
            if (emailExists.length > 0) {
              throw new ConflictException(`L'email ${dto.email} est déjà utilisé par un autre utilisateur`);
            }
          }
          
          // Build update query dynamically
          const updates: string[] = [];
          const values: any[] = [];
          let paramIndex = 1;
          
          if (dto.nom !== undefined) {
            updates.push(`nom = $${paramIndex++}`);
            values.push(dto.nom);
          }
          if (dto.prenom !== undefined) {
            updates.push(`prenom = $${paramIndex++}`);
            values.push(dto.prenom);
          }
          if (dto.email !== undefined) {
            updates.push(`email = $${paramIndex++}`);
            values.push(dto.email);
          }
          if (dto.telephone !== undefined) {
            updates.push(`telephone = $${paramIndex++}`);
            values.push(dto.telephone);
          }
          if (dto.role !== undefined) {
            updates.push(`role = $${paramIndex++}`);
            values.push(dto.role);
          }
          if (dto.actif !== undefined) {
            updates.push(`actif = $${paramIndex++}`);
            values.push(dto.actif);
          }
          if (dto.derniereConnexion !== undefined) {
            updates.push(`derniere_connexion = $${paramIndex++}`);
            values.push(dto.derniereConnexion);
          }
          if (dto.password) {
            const hashedPassword = await bcrypt.hash(dto.password, 12);
            updates.push(`password_hash = $${paramIndex++}`);
            values.push(hashedPassword);
            updates.push(`password_reset_required = false`);
            updates.push(`last_password_reset = NOW()`);
          }
          
          // Always update updated_at
          updates.push(`updated_at = NOW()`);
          
          if (updates.length > 1) { // Au moins updated_at + un autre champ
            values.push(id);
            const updateQuery = `
              UPDATE "${tenant.schemaName}".utilisateur
              SET ${updates.join(', ')}
              WHERE id = $${paramIndex}
              RETURNING id, email, nom, prenom, telephone, role, actif, created_at, updated_at
            `;
            console.log(`[UsersService] Executing update query with ${values.length} params`);
            const result = await this.dataSource.query(updateQuery, values);
            
            console.log(`[UsersService] Update successful`);
            return {
              ...result[0],
              tenantId: tenant.id,
              university: tenant.nom
            };
          }
          
          // Si aucune mise à jour, retourner l'utilisateur existant
          const selectQuery = `SELECT id, email, nom, prenom, telephone, role, actif, created_at, updated_at FROM "${tenant.schemaName}".utilisateur WHERE id = $1`;
          const result = await this.dataSource.query(selectQuery, [id]);
          return {
            ...result[0],
            tenantId: tenant.id,
            university: tenant.nom
          };
        }
      } catch (err: any) {
        console.error(`[UsersService] Failed to update in schema ${tenant.schemaName}:`, err?.message || String(err));
        console.error(err);
        throw err; // Propager l'erreur au lieu de la masquer
      }
    }
    
    // Si l'utilisateur n'est trouvé dans aucun schéma
    console.error(`[UsersService] User ${id} not found in any tenant schema`);
    throw new NotFoundException(`Utilisateur ${id} introuvable`);
  }

  async remove(id: string): Promise<void> {
    // Invalider le cache des utilisateurs
    await this.cacheService.invalidatePattern('users:*');
    
    // Try to find and delete user in tenant schemas
    const tenants = await this.tenantRepo.find({ where: { actif: true } });
    
    for (const tenant of tenants) {
      // Skip tenants without valid schema names (like univ_demo)
      if (!tenant.schemaName || tenant.schemaName === 'univ_demo') {
        continue;
      }
      
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
      // Skip tenants without valid schema names (like univ_demo)
      if (!tenant.schemaName || tenant.schemaName === 'univ_demo') {
        continue;
      }
      
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
    
    // Note: tokenReset and tokenResetExpiry columns don't exist in the current schema
    // This functionality would need to be added if password reset is required
    console.warn('[UsersService] updateRefreshToken: tokenReset columns not available in schema');
  }
}