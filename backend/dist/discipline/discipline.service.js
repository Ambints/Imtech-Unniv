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
var DisciplineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisciplineService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
let DisciplineService = DisciplineService_1 = class DisciplineService {
    constructor(dataSource, request) {
        this.dataSource = dataSource;
        this.request = request;
        this.logger = new common_1.Logger(DisciplineService_1.name);
        this.tenantSchema = this.request.tenantSchema || 'public';
        this.logger.log(`DisciplineService initialized with schema: ${this.tenantSchema}`);
        if (!this.request.tenantSchema) {
            this.logger.warn('No tenant schema found in request! Using public schema as fallback.');
        }
    }
    async query(sql, params = []) {
        try {
            this.logger.log(`[DEBUG] query() called with schema: ${this.tenantSchema}`);
            this.logger.log(`[DEBUG] Request tenantSchema: ${this.request?.tenantSchema}, tenantId: ${this.request?.tenantId}`);
            if (!this.tenantSchema || this.tenantSchema === 'public') {
                this.logger.error(`[DEBUG] Tenant schema is not set or is public!`);
                throw new common_1.BadRequestException('Tenant schema not set. Please provide X-Tenant-Id header.');
            }
            const schemaQuery = `SET search_path TO "${this.tenantSchema}", public`;
            this.logger.log(`[DEBUG] Setting search_path: ${schemaQuery}`);
            await this.dataSource.query(schemaQuery);
            this.logger.log(`[DEBUG] Executing SQL in schema ${this.tenantSchema}: ${sql.substring(0, 100)}...`);
            const result = await this.dataSource.query(sql, params);
            this.logger.log(`[DEBUG] Query executed successfully, rows: ${result?.length || 0}`);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`[DEBUG] Query error in schema ${this.tenantSchema}: ${errorMessage}`);
            throw error;
        }
    }
    async createIncident(data) {
        if (!data.etudiantId) {
            throw new common_1.BadRequestException('Le champ etudiantId est obligatoire');
        }
        if (!data.typeIncident) {
            throw new common_1.BadRequestException('Le champ typeIncident est obligatoire');
        }
        if (!data.description) {
            throw new common_1.BadRequestException('Le champ description est obligatoire');
        }
        if (!data.rapportePar) {
            throw new common_1.BadRequestException('Le champ rapportePar est obligatoire');
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
    async findAllIncidents(filters) {
        let sql = `
      SELECT i.*,
        e.nom || ' ' || e.prenom as etudiant_nom,
        u.nom || ' ' || u.prenom as rapporte_par_nom
      FROM incident_disciplinaire i
      LEFT JOIN etudiant e ON e.id = i.etudiant_id
      LEFT JOIN utilisateur u ON u.id = i.rapporte_par
      WHERE 1=1
    `;
        const params = [];
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
    async findIncidentById(id) {
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
        if (!result[0])
            throw new common_1.NotFoundException('Incident non trouvé');
        return result[0];
    }
    async validerIncident(id, validePar) {
        await this.query(`
      UPDATE incident_disciplinaire
      SET statut = 'clos', arbitre_par = $1, date_cloture = CURRENT_DATE
      WHERE id = $2
    `, [validePar, id]);
        return this.findIncidentById(id);
    }
    async updateIncident(id, data) {
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
        if (fields.length === 0)
            return this.findIncidentById(id);
        fields.push(`updated_at = NOW()`);
        values.push(id);
        await this.query(`
      UPDATE incident_disciplinaire
      SET ${fields.join(', ')}
      WHERE id = $${++paramCount}
    `, values);
        return this.findIncidentById(id);
    }
    async deleteIncident(id) {
        await this.query(`DELETE FROM incident_disciplinaire WHERE id = $1`, [id]);
    }
    async getIncidentsByStudent(etudiantId) {
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
    async getDisciplineStats() {
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
    async getIncidentsByPeriod(dateDebut, dateFin) {
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
    async getIncidentsByType() {
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
};
exports.DisciplineService = DisciplineService;
exports.DisciplineService = DisciplineService = DisciplineService_1 = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, typeorm_1.InjectDataSource)('tenant')),
    __param(1, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [typeorm_2.DataSource, Object])
], DisciplineService);
//# sourceMappingURL=discipline.service.js.map