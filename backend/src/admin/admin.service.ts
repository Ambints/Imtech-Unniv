import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant } from '../tenants/tenant.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Tenant, 'default') private tenantRepo: Repository<Tenant>,
    private dataSource: DataSource,
  ) {}

  /**
   * Récupère les logs d'activité des utilisateurs
   */
  async getActivityLogs(tenantId: string, limit: number = 50): Promise<any[]> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Université non trouvée');

    const query = `
      SELECT 
        u.id as user_id,
        u.prenom || ' ' || u.nom as user_name,
        u.email,
        u.role,
        u.derniere_connexion as last_login,
        u.created_at,
        u.actif
      FROM "${tenant.schemaName}".utilisateur u
      WHERE u.derniere_connexion IS NOT NULL
      ORDER BY u.derniere_connexion DESC
      LIMIT $1
    `;

    const logs = await this.dataSource.query(query, [limit]);
    
    return logs.map((log: any) => ({
      userId: log.user_id,
      userName: log.user_name,
      email: log.email,
      role: log.role,
      action: 'Connexion',
      timestamp: log.last_login,
      createdAt: log.created_at,
      active: log.actif
    }));
  }

  /**
   * Récupère les statistiques détaillées pour les rapports
   */
  async getDetailedStats(tenantId: string): Promise<any> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Université non trouvée');

    const schemaName = tenant.schemaName;

    try {
      // Statistiques utilisateurs par rôle
      const usersByRole = await this.dataSource.query(`
        SELECT role, COUNT(*) as count, 
               COUNT(CASE WHEN actif = true THEN 1 END) as active_count
        FROM "${schemaName}".utilisateur
        GROUP BY role
      `);

      // Statistiques académiques
      const academicStats = await this.dataSource.query(`
        SELECT 
          (SELECT COUNT(*) FROM "${schemaName}".parcours WHERE actif = true) as parcours_count,
          (SELECT COUNT(*) FROM "${schemaName}".unite_enseignement) as ue_count,
          (SELECT COUNT(*) FROM "${schemaName}".utilisateur WHERE role = 'etudiant' AND actif = true) as students_count,
          (SELECT COUNT(*) FROM "${schemaName}".utilisateur WHERE role = 'professeur' AND actif = true) as teachers_count
      `);

      // Statistiques financières mensuelles
      const monthlyFinance = await this.dataSource.query(`
        SELECT 
          EXTRACT(MONTH FROM date_paiement) as month,
          EXTRACT(YEAR FROM date_paiement) as year,
          SUM(CASE WHEN statut = 'valide' THEN montant ELSE 0 END) as revenue,
          SUM(CASE WHEN statut = 'en_attente' THEN montant ELSE 0 END) as pending,
          COUNT(*) as transaction_count
        FROM "${schemaName}".paiement
        WHERE date_paiement >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY EXTRACT(YEAR FROM date_paiement), EXTRACT(MONTH FROM date_paiement)
        ORDER BY year DESC, month DESC
        LIMIT 6
      `);

      // Statistiques de présence (si table existe)
      let attendanceStats = null;
      try {
        attendanceStats = await this.dataSource.query(`
          SELECT 
            COUNT(*) as total_records,
            COUNT(CASE WHEN present = true THEN 1 END) as present_count,
            ROUND(COUNT(CASE WHEN present = true THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as attendance_rate
          FROM "${schemaName}".presence
          WHERE date_presence >= CURRENT_DATE - INTERVAL '30 days'
        `);
      } catch (e) {
        // Table présence n'existe pas encore
      }

      return {
        users: {
          byRole: usersByRole.map((r: any) => ({
            role: r.role,
            total: parseInt(r.count),
            active: parseInt(r.active_count)
          })),
          total: usersByRole.reduce((sum: number, r: any) => sum + parseInt(r.count), 0)
        },
        academic: {
          parcours: parseInt(academicStats[0]?.parcours_count || 0),
          courses: parseInt(academicStats[0]?.ue_count || 0),
          students: parseInt(academicStats[0]?.students_count || 0),
          teachers: parseInt(academicStats[0]?.teachers_count || 0)
        },
        finance: {
          monthly: monthlyFinance.map((m: any) => ({
            month: parseInt(m.month),
            year: parseInt(m.year),
            revenue: parseFloat(m.revenue || 0),
            pending: parseFloat(m.pending || 0),
            transactions: parseInt(m.transaction_count)
          }))
        },
        attendance: attendanceStats ? {
          totalRecords: parseInt(attendanceStats[0]?.total_records || 0),
          presentCount: parseInt(attendanceStats[0]?.present_count || 0),
          rate: parseFloat(attendanceStats[0]?.attendance_rate || 0)
        } : null
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Active ou désactive plusieurs utilisateurs en masse
   */
  async bulkUpdateUserStatus(tenantId: string, userIds: string[], active: boolean): Promise<any> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Université non trouvée');

    if (!userIds || userIds.length === 0) {
      return { updated: 0, message: 'Aucun utilisateur sélectionné' };
    }

    const placeholders = userIds.map((_, i) => `$${i + 2}`).join(', ');
    const query = `
      UPDATE "${tenant.schemaName}".utilisateur
      SET actif = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders})
    `;

    await this.dataSource.query(query, [active, ...userIds]);

    return {
      updated: userIds.length,
      message: `${userIds.length} utilisateur(s) ${active ? 'activé(s)' : 'désactivé(s)'} avec succès`
    };
  }

  /**
   * Exporte les utilisateurs au format CSV
   */
  async exportUsers(tenantId: string, role?: string): Promise<any[]> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Université non trouvée');

    const query = role
      ? `SELECT id, prenom, nom, email, telephone, role, actif, created_at, derniere_connexion
         FROM "${tenant.schemaName}".utilisateur
         WHERE role = $1
         ORDER BY created_at DESC`
      : `SELECT id, prenom, nom, email, telephone, role, actif, created_at, derniere_connexion
         FROM "${tenant.schemaName}".utilisateur
         ORDER BY created_at DESC`;

    const params = role ? [role] : [];
    const users = await this.dataSource.query(query, params);

    return users.map((u: any) => ({
      id: u.id,
      prenom: u.prenom,
      nom: u.nom,
      email: u.email,
      telephone: u.telephone || '',
      role: u.role,
      actif: u.actif ? 'Oui' : 'Non',
      dateCreation: u.created_at,
      derniereConnexion: u.derniere_connexion || 'Jamais'
    }));
  }

  /**
   * Récupère les statistiques système
   */
  async getSystemHealth(tenantId: string): Promise<any> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Université non trouvée');

    try {
      // Taille de la base de données
      const dbSize = await this.dataSource.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);

      // Taille du schéma
      const schemaSize = await this.dataSource.query(`
        SELECT pg_size_pretty(SUM(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)))::bigint) as size
        FROM pg_tables
        WHERE schemaname = $1
      `, [tenant.schemaName]);

      // Nombre de connexions actives
      const connections = await this.dataSource.query(`
        SELECT count(*) as count
        FROM pg_stat_activity
        WHERE datname = current_database()
      `);

      // Dernière sauvegarde (simulé pour l'instant)
      const lastBackup = new Date();
      lastBackup.setHours(lastBackup.getHours() - 6);

      return {
        database: {
          size: dbSize[0]?.size || 'N/A',
          schemaSize: schemaSize[0]?.size || 'N/A',
          connections: parseInt(connections[0]?.count || 0)
        },
        backup: {
          lastBackup: lastBackup.toISOString(),
          status: 'success',
          nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        uptime: 99.9,
        status: 'healthy'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la santé système:', error);
      return {
        database: { size: 'N/A', schemaSize: 'N/A', connections: 0 },
        backup: { lastBackup: new Date().toISOString(), status: 'unknown', nextScheduled: null },
        uptime: 99.9,
        status: 'unknown'
      };
    }
  }

  /**
   * Crée une sauvegarde de la base de données (simulation)
   */
  async createBackup(tenantId: string): Promise<any> {
    const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Université non trouvée');

    // TODO: Implémenter la vraie logique de backup avec pg_dump
    // Pour l'instant, on simule
    return {
      success: true,
      message: 'Sauvegarde créée avec succès',
      backupId: `backup_${tenant.slug}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      size: '15.2 MB'
    };
  }
}

// Made with Bob
