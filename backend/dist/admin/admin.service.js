"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const academic_entities_1 = require("../academic/academic.entities");
const tenant_connection_service_1 = require("../tenants/tenant-connection.service");
const fs = __importStar(require("fs"));
let AdminService = class AdminService {
    constructor(tenantRepo, dataSource, tenantConnection) {
        this.tenantRepo = tenantRepo;
        this.dataSource = dataSource;
        this.tenantConnection = tenantConnection;
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
          (SELECT COUNT(*) FROM "${schemaName}".utilisateur WHERE role = 'enseignant' AND actif = true) as teachers_count
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
            let newModulesStats = null;
            try {
                const gouvernanceStats = await this.dataSource.query(`
          SELECT 
            (SELECT COUNT(*) FROM "${schemaName}".presidents WHERE actif = true) as presidents_count,
            (SELECT COUNT(*) FROM "${schemaName}".decisions_presidentielles) as decisions_count,
            (SELECT COUNT(*) FROM "${schemaName}".validations_recrutement) as validations_count,
            (SELECT COUNT(*) FROM "${schemaName}".arbitrages) as arbitrages_count,
            (SELECT COUNT(*) FROM "${schemaName}".conseils_universitaires) as conseils_count
        `);
                const surveillanceStats = await this.dataSource.query(`
          SELECT 
            (SELECT COUNT(*) FROM "${schemaName}".surveillants_generaux WHERE actif = true) as surveillants_count,
            (SELECT COUNT(*) FROM "${schemaName}".appels_numeriques) as appels_count,
            (SELECT COUNT(*) FROM "${schemaName}".incidents_disciplinaires) as incidents_count,
            (SELECT COUNT(*) FROM "${schemaName}".organisations_examens) as examens_count,
            (SELECT COUNT(*) FROM "${schemaName}".rapports_surveillance) as rapports_count
        `);
                const entretienStats = await this.dataSource.query(`
          SELECT 
            (SELECT COUNT(*) FROM "${schemaName}".responsables_logistique WHERE actif = true) as responsables_count,
            (SELECT COUNT(*) FROM "${schemaName}".services_entretien) as services_count,
            (SELECT COUNT(*) FROM "${schemaName}".plannings_nettoyage) as plannings_count,
            (SELECT COUNT(*) FROM "${schemaName}".stocks_produits_menage) as stocks_count,
            (SELECT COUNT(*) FROM "${schemaName}".maintenances_preventives) as maintenances_count,
            (SELECT COUNT(*) FROM "${schemaName}".rapports_entretien) as rapports_count
        `);
                newModulesStats = {
                    gouvernance: {
                        presidents: parseInt(gouvernanceStats[0]?.presidents_count || 0),
                        decisions: parseInt(gouvernanceStats[0]?.decisions_count || 0),
                        validations: parseInt(gouvernanceStats[0]?.validations_count || 0),
                        arbitrages: parseInt(gouvernanceStats[0]?.arbitrages_count || 0),
                        conseils: parseInt(gouvernanceStats[0]?.conseils_count || 0)
                    },
                    surveillance: {
                        surveillants: parseInt(surveillanceStats[0]?.surveillants_count || 0),
                        appels: parseInt(surveillanceStats[0]?.appels_count || 0),
                        incidents: parseInt(surveillanceStats[0]?.incidents_count || 0),
                        examens: parseInt(surveillanceStats[0]?.examens_count || 0),
                        rapports: parseInt(surveillanceStats[0]?.rapports_count || 0)
                    },
                    entretien: {
                        responsables: parseInt(entretienStats[0]?.responsables_count || 0),
                        services: parseInt(entretienStats[0]?.services_count || 0),
                        plannings: parseInt(entretienStats[0]?.plannings_count || 0),
                        stocks: parseInt(entretienStats[0]?.stocks_count || 0),
                        maintenances: parseInt(entretienStats[0]?.maintenances_count || 0),
                        rapports: parseInt(entretienStats[0]?.rapports_count || 0)
                    }
                };
            }
            catch (e) {
                console.log('Modules nouveaux non encore créés:', e.message);
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
                } : null,
                newModules: newModulesStats
            };
        }
        catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            throw error;
        }
    }
    async getGlobalStats() {
        try {
            const tenants = await this.tenantRepo.find({
                where: { actif: true },
                order: { createdAt: 'DESC' }
            });
            let totalUsers = 0;
            let totalStudents = 0;
            let totalTeachers = 0;
            let totalRevenue = 0;
            let totalTransactions = 0;
            let activeTenants = 0;
            let totalPresidents = 0;
            let totalSurveillants = 0;
            let totalResponsables = 0;
            for (const tenant of tenants) {
                const schemaName = tenant.schemaName;
                try {
                    const userStats = await this.dataSource.query(`
            SELECT
              COUNT(*) as total_users,
              COUNT(CASE WHEN role = 'etudiant' THEN 1 END) as students,
              COUNT(CASE WHEN role = 'enseignant' THEN 1 END) as teachers,
              COUNT(CASE WHEN actif = true THEN 1 END) as active_users
            FROM "${schemaName}".utilisateur
          `);
                    const financeStats = await this.dataSource.query(`
            SELECT 
              SUM(CASE WHEN statut = 'valide' THEN montant ELSE 0 END) as total_revenue,
              COUNT(*) as transaction_count
            FROM "${schemaName}".paiement
            WHERE date_paiement >= CURRENT_DATE - INTERVAL '12 months'
          `);
                    let moduleStats = null;
                    try {
                        moduleStats = await this.dataSource.query(`
              SELECT 
                (SELECT COUNT(*) FROM "${schemaName}".presidents WHERE actif = true) as presidents,
                (SELECT COUNT(*) FROM "${schemaName}".surveillants_generaux WHERE actif = true) as surveillants,
                (SELECT COUNT(*) FROM "${schemaName}".responsables_logistique WHERE actif = true) as responsables
            `);
                    }
                    catch (e) {
                    }
                    totalUsers += parseInt(userStats[0]?.total_users || 0);
                    totalStudents += parseInt(userStats[0]?.students || 0);
                    totalTeachers += parseInt(userStats[0]?.teachers || 0);
                    totalRevenue += parseFloat(financeStats[0]?.total_revenue || 0);
                    totalTransactions += parseInt(financeStats[0]?.transaction_count || 0);
                    if (moduleStats) {
                        totalPresidents += parseInt(moduleStats[0]?.presidents || 0);
                        totalSurveillants += parseInt(moduleStats[0]?.surveillants || 0);
                        totalResponsables += parseInt(moduleStats[0]?.responsables || 0);
                    }
                    activeTenants++;
                }
                catch (e) {
                    console.error(`Erreur stats tenant ${tenant.nom}:`, e.message);
                }
            }
            return {
                overview: {
                    totalTenants: tenants.length,
                    activeTenants: activeTenants,
                    totalUsers: totalUsers,
                    totalStudents: totalStudents,
                    totalTeachers: totalTeachers,
                    averageUsersPerTenant: activeTenants > 0 ? Math.round(totalUsers / activeTenants) : 0
                },
                finance: {
                    totalRevenue: totalRevenue,
                    totalTransactions: totalTransactions,
                    averageRevenuePerTenant: activeTenants > 0 ? Math.round(totalRevenue / activeTenants) : 0
                },
                newModules: {
                    totalPresidents: totalPresidents,
                    totalSurveillants: totalSurveillants,
                    totalResponsables: totalResponsables
                },
                tenants: tenants.map(tenant => ({
                    id: tenant.id,
                    nom: tenant.nom,
                    slug: tenant.slug,
                    emailContact: tenant.emailContact,
                    typeEtablissement: tenant.typeEtablissement,
                    actif: tenant.actif,
                    createdAt: tenant.createdAt
                }))
            };
        }
        catch (error) {
            console.error('Erreur lors de la récupération des statistiques globales:', error);
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
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupId = `backup_${tenant.slug}_${timestamp}`;
            const backupDir = process.env.BACKUP_DIR || './backups';
            const backupPath = `${backupDir}/${backupId}.sql`;
            const fs = require('fs');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            const dbConfig = {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || '5432',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || '2007',
                database: process.env.DB_NAME || 'Imtech_SaaS',
            };
            const pgDumpCommand = `pg_dump --host=${dbConfig.host} --port=${dbConfig.port} --username=${dbConfig.user} --no-password --verbose --clean --if-exists --format=custom --compress=9 --file="${backupPath}" --schema="${tenant.schemaName}" ${dbConfig.database}`;
            const { exec } = require('child_process');
            const { promisify } = require('util');
            const execAsync = promisify(exec);
            console.log(`Début du backup pour ${tenant.nom} (schéma: ${tenant.schemaName})`);
            const env = { ...process.env, PGPASSWORD: dbConfig.password };
            const { stdout, stderr } = await execAsync(pgDumpCommand, { env });
            if (stderr && !stderr.includes('WARNING')) {
                console.error('Erreur pg_dump:', stderr);
                throw new Error(`Erreur lors de la création du backup: ${stderr}`);
            }
            if (!fs.existsSync(backupPath)) {
                throw new Error('Le fichier de backup n\'a pas été créé');
            }
            const stats = fs.statSync(backupPath);
            const fileSize = (stats.size / (1024 * 1024)).toFixed(2);
            try {
                const backupQuery = `
          INSERT INTO public.backups (id, tenant_id, schema_name, file_path, file_size, created_at, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `;
                await this.dataSource.query(backupQuery, [
                    backupId,
                    tenant.id,
                    tenant.schemaName,
                    backupPath,
                    fileSize,
                    new Date(),
                    'completed'
                ]);
            }
            catch (error) {
                console.warn('Impossible d\'enregistrer le backup dans la table:', error.message);
            }
            console.log(`Backup terminé avec succès: ${backupPath} (${fileSize} MB)`);
            return {
                success: true,
                message: 'Sauvegarde créée avec succès',
                backupId: backupId,
                tenantName: tenant.nom,
                schemaName: tenant.schemaName,
                timestamp: new Date().toISOString(),
                filePath: backupPath,
                size: `${fileSize} MB`,
                status: 'completed'
            };
        }
        catch (error) {
            console.error('Erreur lors de la création du backup:', error);
            return {
                success: false,
                message: `Erreur lors de la création du backup: ${error.message}`,
                backupId: `backup_${tenant.slug}_${Date.now()}`,
                timestamp: new Date().toISOString(),
                status: 'failed',
                error: error.message
            };
        }
    }
    async listBackups(tenantId) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Université non trouvée');
        try {
            const backupsQuery = `
        SELECT * FROM public.backups 
        WHERE tenant_id = $1 
        ORDER BY created_at DESC
      `;
            const dbBackups = await this.dataSource.query(backupsQuery, [tenant.id]);
            if (dbBackups.length > 0) {
                return dbBackups.map((backup) => ({
                    id: backup.id,
                    tenantName: tenant.nom,
                    schemaName: backup.schema_name,
                    timestamp: backup.created_at,
                    size: `${backup.file_size} MB`,
                    status: backup.status,
                    filePath: backup.file_path
                }));
            }
        }
        catch (error) {
            console.warn('Impossible de récupérer les backups depuis la base:', error.message);
        }
        const fs = require('fs');
        const backupDir = process.env.BACKUP_DIR || './backups';
        if (!fs.existsSync(backupDir)) {
            return [];
        }
        const files = fs.readdirSync(backupDir);
        const tenantBackups = files
            .filter(file => file.startsWith(`backup_${tenant.slug}_`) && file.endsWith('.sql'))
            .map(file => {
            const filePath = `${backupDir}/${file}`;
            const stats = fs.statSync(filePath);
            const fileSize = (stats.size / (1024 * 1024)).toFixed(2);
            const timestampPart = file.replace(`backup_${tenant.slug}_`, '').replace('.sql', '');
            const timestamp = new Date(timestampPart.replace(/-/g, ':')).toISOString();
            return {
                id: file.replace('.sql', ''),
                tenantName: tenant.nom,
                schemaName: tenant.schemaName,
                timestamp: timestamp,
                size: `${fileSize} MB`,
                status: 'completed',
                filePath: filePath
            };
        })
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return tenantBackups;
    }
    async restoreBackup(tenantId, backupId) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Université non trouvée');
        try {
            const backups = await this.listBackups(tenantId);
            const backup = backups.find(b => b.id === backupId);
            if (!backup) {
                throw new common_1.NotFoundException('Backup non trouvé');
            }
            if (!fs.existsSync(backup.filePath)) {
                throw new common_1.NotFoundException('Fichier de backup non trouvé');
            }
            const dbConfig = {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || '5432',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || '2007',
                database: process.env.DB_NAME || 'Imtech_SaaS',
            };
            const pgRestoreCommand = `pg_restore --host=${dbConfig.host} --port=${dbConfig.port} --username=${dbConfig.user} --no-password --verbose --clean --if-exists --disable-triggers --exit-on-error --dbname="${dbConfig.database}" "${backup.filePath}"`;
            const { exec } = require('child_process');
            const { promisify } = require('util');
            const execAsync = promisify(exec);
            console.log(`Début de la restauration du backup ${backupId} pour ${tenant.nom}`);
            const env = { ...process.env, PGPASSWORD: dbConfig.password };
            const { stdout, stderr } = await execAsync(pgRestoreCommand, { env });
            if (stderr && !stderr.includes('WARNING')) {
                console.error('Erreur pg_restore:', stderr);
                throw new Error(`Erreur lors de la restauration: ${stderr}`);
            }
            try {
                const updateQuery = `
          UPDATE public.backups 
          SET status = 'restored', restored_at = $2 
          WHERE id = $1
        `;
                await this.dataSource.query(updateQuery, [backupId, new Date()]);
            }
            catch (error) {
                console.warn('Impossible de mettre à jour le statut du backup:', error.message);
            }
            console.log(`Restauration terminée avec succès: ${backupId}`);
            return {
                success: true,
                message: 'Backup restauré avec succès',
                backupId: backupId,
                tenantName: tenant.nom,
                timestamp: new Date().toISOString(),
                status: 'restored'
            };
        }
        catch (error) {
            console.error('Erreur lors de la restauration:', error);
            return {
                success: false,
                message: `Erreur lors de la restauration: ${error.message}`,
                backupId: backupId,
                timestamp: new Date().toISOString(),
                status: 'restore_failed',
                error: error.message
            };
        }
    }
    async cleanupOldBackups() {
        try {
            const fs = require('fs');
            const backupDir = process.env.BACKUP_DIR || './backups';
            if (!fs.existsSync(backupDir)) {
                return { success: true, message: 'Aucun répertoire de backup trouvé', deleted: 0 };
            }
            const files = fs.readdirSync(backupDir);
            const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
            let deletedCount = 0;
            for (const file of files) {
                if (file.startsWith('backup_') && file.endsWith('.sql')) {
                    const filePath = `${backupDir}/${file}`;
                    const stats = fs.statSync(filePath);
                    if (stats.mtime < thirtyDaysAgo) {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                        console.log(`Ancien backup supprimé: ${file}`);
                    }
                }
            }
            try {
                const cleanupQuery = `
          DELETE FROM public.backups 
          WHERE created_at < $1
        `;
                await this.dataSource.query(cleanupQuery, [thirtyDaysAgo]);
            }
            catch (error) {
                console.warn('Impossible de nettoyer la table des backups:', error.message);
            }
            return {
                success: true,
                message: `${deletedCount} anciens backups supprimés`,
                deleted: deletedCount,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            console.error('Erreur lors du nettoyage des backups:', error);
            return {
                success: false,
                message: `Erreur lors du nettoyage: ${error.message}`,
                timestamp: new Date().toISOString()
            };
        }
    }
    async defineSecretaireParcours(tenantId, parcoursId, secretaireId) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Université non trouvée');
        await this.tenantConnection.setTenantSchema(tenantId);
        const parcoursRepo = this.dataSource.getRepository(academic_entities_1.Parcours);
        const parcours = await parcoursRepo.findOne({ where: { id: parcoursId } });
        if (!parcours) {
            throw new common_1.NotFoundException('Parcours non trouvé');
        }
        const etudiantRepo = this.dataSource.getRepository(academic_entities_1.Etudiant);
        const secretaire = await etudiantRepo.findOne({ where: { id: secretaireId } });
        if (!secretaire) {
            throw new common_1.NotFoundException('Secrétaire non trouvé');
        }
        const userResult = await this.dataSource.query(`SELECT role FROM "${tenant.schemaName}".utilisateur WHERE id = $1`, [secretaireId]);
        if (userResult.length === 0) {
            throw new common_1.NotFoundException('Utilisateur non trouvé');
        }
        const userRole = userResult[0].role;
        if (!userRole.includes('secretaire')) {
            throw new common_1.BadRequestException('L\'utilisateur spécifié n\'a pas le rôle de secrétaire');
        }
        await parcoursRepo.update(parcoursId, { secretaireId });
        return {
            message: 'Secrétaire défini avec succès pour le parcours',
            parcoursId,
            secretaireId,
            secretaireNom: `${secretaire.prenom} ${secretaire.nom}`,
            parcoursNom: parcours.nom
        };
    }
    async getSecretairesParcours(tenantId) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Université non trouvée');
        await this.tenantConnection.setTenantSchema(tenantId);
        const parcoursRepo = this.dataSource.getRepository(academic_entities_1.Parcours);
        const etudiantRepo = this.dataSource.getRepository(academic_entities_1.Etudiant);
        const parcours = await parcoursRepo.find({
            where: { actif: true },
            order: { nom: 'ASC' }
        });
        const result = await Promise.all(parcours.map(async (p) => {
            let secretaire = null;
            if (p.secretaireId) {
                secretaire = await etudiantRepo.findOne({ where: { id: p.secretaireId } });
            }
            return {
                id: p.id,
                nom: p.nom,
                code: p.code,
                niveau: p.niveau,
                secretaireId: p.secretaireId,
                secretaire: secretaire ? {
                    id: secretaire.id,
                    nom: secretaire.nom,
                    prenom: secretaire.prenom,
                    email: secretaire.email
                } : null
            };
        }));
        return result;
    }
    async getSecretairesDisponibles(tenantId) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Université non trouvée');
        const query = `
      SELECT 
        u.id,
        u.prenom,
        u.nom,
        u.email,
        u.role,
        e.matricule
      FROM "${tenant.schemaName}".utilisateur u
      LEFT JOIN "${tenant.schemaName}".etudiant e ON u.id = e.utilisateur_id
      WHERE u.role LIKE '%secretaire%' AND u.actif = true
      ORDER BY u.prenom, u.nom
    `;
        const result = await this.dataSource.query(query);
        return result;
    }
    async removeSecretaireParcours(tenantId, parcoursId) {
        const tenant = await this.tenantRepo.findOne({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Université non trouvée');
        await this.tenantConnection.setTenantSchema(tenantId);
        const parcoursRepo = this.dataSource.getRepository(academic_entities_1.Parcours);
        const parcours = await parcoursRepo.findOne({ where: { id: parcoursId } });
        if (!parcours) {
            throw new common_1.NotFoundException('Parcours non trouvé');
        }
        await parcoursRepo.update(parcoursId, { secretaireId: null });
        return {
            message: 'Secrétaire supprimé avec succès du parcours',
            parcoursId,
            parcoursNom: parcours.nom
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant, 'default')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        tenant_connection_service_1.TenantConnectionService])
], AdminService);
//# sourceMappingURL=admin.service.js.map