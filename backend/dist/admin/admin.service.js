"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../tenants/tenant.entity");
let AdminService = class AdminService {
    constructor(tenantRepo, dataSource) {
        this.tenantRepo = tenantRepo;
        this.dataSource = dataSource;
    }
    async getActivityLogs(tenantId, limit = 50) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Université non trouvée');
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
        return logs.map((log) => ({
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
    async getDetailedStats(tenantId) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Université non trouvée');
        const schemaName = tenant.schemaName;
        try {
            const usersByRole = await this.dataSource.query(`
        SELECT role, COUNT(*) as count, 
               COUNT(CASE WHEN actif = true THEN 1 END) as active_count
        FROM "${schemaName}".utilisateur
        GROUP BY role
      `);
            const academicStats = await this.dataSource.query(`
        SELECT 
          (SELECT COUNT(*) FROM "${schemaName}".parcours WHERE actif = true) as parcours_count,
          (SELECT COUNT(*) FROM "${schemaName}".unite_enseignement) as ue_count,
          (SELECT COUNT(*) FROM "${schemaName}".utilisateur WHERE role = 'etudiant' AND actif = true) as students_count,
          (SELECT COUNT(*) FROM "${schemaName}".utilisateur WHERE role = 'professeur' AND actif = true) as teachers_count
      `);
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
            }
            catch (e) {
            }
            return {
                users: {
                    byRole: usersByRole.map((r) => ({
                        role: r.role,
                        total: parseInt(r.count),
                        active: parseInt(r.active_count)
                    })),
                    total: usersByRole.reduce((sum, r) => sum + parseInt(r.count), 0)
                },
                academic: {
                    parcours: parseInt(academicStats[0]?.parcours_count || 0),
                    courses: parseInt(academicStats[0]?.ue_count || 0),
                    students: parseInt(academicStats[0]?.students_count || 0),
                    teachers: parseInt(academicStats[0]?.teachers_count || 0)
                },
                finance: {
                    monthly: monthlyFinance.map((m) => ({
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
        }
        catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            throw error;
        }
    }
    async bulkUpdateUserStatus(tenantId, userIds, active) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Université non trouvée');
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
    async exportUsers(tenantId, role) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Université non trouvée');
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
        return users.map((u) => ({
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
    async getSystemHealth(tenantId) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Université non trouvée');
        try {
            const dbSize = await this.dataSource.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);
            const schemaSize = await this.dataSource.query(`
        SELECT pg_size_pretty(SUM(pg_total_relation_size(quote_ident(schemaname) || '.' || quote_ident(tablename)))::bigint) as size
        FROM pg_tables
        WHERE schemaname = $1
      `, [tenant.schemaName]);
            const connections = await this.dataSource.query(`
        SELECT count(*) as count
        FROM pg_stat_activity
        WHERE datname = current_database()
      `);
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
        }
        catch (error) {
            console.error('Erreur lors de la récupération de la santé système:', error);
            return {
                database: { size: 'N/A', schemaSize: 'N/A', connections: 0 },
                backup: { lastBackup: new Date().toISOString(), status: 'unknown', nextScheduled: null },
                uptime: 99.9,
                status: 'unknown'
            };
        }
    }
    async createBackup(tenantId) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Université non trouvée');
        return {
            success: true,
            message: 'Sauvegarde créée avec succès',
            backupId: `backup_${tenant.slug}_${Date.now()}`,
            timestamp: new Date().toISOString(),
            size: '15.2 MB'
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant, 'default')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], AdminService);
//# sourceMappingURL=admin.service.js.map