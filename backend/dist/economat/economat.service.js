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
exports.EconomatService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
let EconomatService = class EconomatService {
    constructor(dataSource, request) {
        this.dataSource = dataSource;
        this.request = request;
        this.tenantSchema = this.request.tenantSchema || 'public';
        this.userId = this.request.user?.id;
    }
    async query(sql, params) {
        if (!this.tenantSchema || this.tenantSchema === 'public') {
            console.error('[EconomatService] Tenant schema not set or is public');
            throw new common_1.BadRequestException('Tenant schema not set');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            console.log(`[EconomatService] Setting search_path to: ${this.tenantSchema}`);
            await queryRunner.query(`SET search_path TO "${this.tenantSchema}", public`);
            console.log(`[EconomatService] Executing query:`, sql.substring(0, 200));
            console.log(`[EconomatService] With params:`, params);
            const result = await queryRunner.query(sql, params);
            console.log(`[EconomatService] Query result rows:`, result?.rows?.length || result?.length || 0);
            return result;
        }
        catch (error) {
            const err = error;
            console.error('[EconomatService] Query error:', err.message || error);
            console.error('[EconomatService] SQL:', sql);
            console.error('[EconomatService] Params:', params);
            console.error('[EconomatService] Stack:', err.stack);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getAnneesAcademiques() {
        const query = `
      SELECT
        id,
        libelle,
        date_debut,
        date_fin,
        active,
        created_at
      FROM annee_academique
      ORDER BY date_debut DESC
    `;
        const result = await this.query(query);
        console.log('[getAnneesAcademiques] Result:', result);
        console.log('[getAnneesAcademiques] Result.rows:', result?.rows);
        if (Array.isArray(result)) {
            console.log('[getAnneesAcademiques] Result is array, returning directly');
            return result;
        }
        console.log('[getAnneesAcademiques] Returning result.rows');
        return result.rows || [];
    }
    async createBudget(dto) {
        const id = (0, uuid_1.v4)();
        let anneeAcademiqueId = dto.annee_academique_id;
        if (!anneeAcademiqueId) {
            const activeYearQuery = 'SELECT id FROM annee_academique WHERE active = TRUE LIMIT 1';
            const activeYearResult = await this.query(activeYearQuery);
            if (!activeYearResult.rows || activeYearResult.rows.length === 0) {
                throw new common_1.BadRequestException('Aucune année académique active trouvée');
            }
            anneeAcademiqueId = activeYearResult.rows[0].id;
        }
        const query = `
      INSERT INTO budget (
        id, annee_academique_id, departement_id, categorie,
        montant_prevu, description, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const values = [
            id,
            anneeAcademiqueId,
            dto.departement_id || null,
            dto.categorie,
            dto.montant_prevu,
            dto.description || null,
            this.userId,
        ];
        const result = await this.query(query, values);
        if (Array.isArray(result)) {
            return result[0];
        }
        return result.rows?.[0] || result;
    }
    async getBudgets(filters) {
        let query = `
      SELECT 
        b.id, b.categorie, b.montant_prevu, b.montant_realise,
        b.description, b.created_at, b.updated_at,
        d.nom as departement, 
        aa.libelle as annee,
        ROUND((b.montant_realise / NULLIF(b.montant_prevu, 0) * 100), 2) as taux_execution,
        (b.montant_prevu - b.montant_realise) as solde
      FROM budget b
      LEFT JOIN departement d ON b.departement_id = d.id
      JOIN annee_academique aa ON b.annee_academique_id = aa.id
      WHERE 1=1
    `;
        const values = [];
        let paramCount = 1;
        if (filters.annee_academique_id) {
            query += ` AND b.annee_academique_id = $${paramCount}`;
            values.push(filters.annee_academique_id);
            paramCount++;
        }
        else {
            query += ` AND aa.active = TRUE`;
        }
        if (filters.departement_id) {
            query += ` AND b.departement_id = $${paramCount}`;
            values.push(filters.departement_id);
            paramCount++;
        }
        if (filters.categorie) {
            query += ` AND b.categorie = $${paramCount}`;
            values.push(filters.categorie);
            paramCount++;
        }
        if (filters.search) {
            query += ` AND (b.categorie ILIKE $${paramCount} OR b.description ILIKE $${paramCount} OR d.nom ILIKE $${paramCount})`;
            values.push(`%${filters.search}%`);
            paramCount++;
        }
        query += ` ORDER BY b.created_at DESC`;
        const result = await this.query(query, values);
        if (Array.isArray(result)) {
            return result;
        }
        return result.rows || [];
    }
    async getBudgetById(id) {
        const query = `
      SELECT 
        b.*, d.nom as departement, aa.libelle as annee,
        ROUND((b.montant_realise / NULLIF(b.montant_prevu, 0) * 100), 2) as taux_execution,
        (b.montant_prevu - b.montant_realise) as solde
      FROM budget b
      LEFT JOIN departement d ON b.departement_id = d.id
      JOIN annee_academique aa ON b.annee_academique_id = aa.id
      WHERE b.id = $1
    `;
        const result = await this.query(query, [id]);
        if (result.rows.length === 0) {
            throw new common_1.NotFoundException('Budget non trouvé');
        }
        return result.rows[0];
    }
    async updateBudget(id, dto) {
        const updates = [];
        const values = [];
        let paramCount = 1;
        if (dto.montant_prevu !== undefined) {
            updates.push(`montant_prevu = $${paramCount}`);
            values.push(dto.montant_prevu);
            paramCount++;
        }
        if (dto.montant_realise !== undefined) {
            updates.push(`montant_realise = $${paramCount}`);
            values.push(dto.montant_realise);
            paramCount++;
        }
        if (dto.description !== undefined) {
            updates.push(`description = $${paramCount}`);
            values.push(dto.description);
            paramCount++;
        }
        if (updates.length === 0) {
            throw new common_1.BadRequestException('Aucune donnée à mettre à jour');
        }
        updates.push(`updated_at = NOW()`);
        values.push(id);
        const query = `
      UPDATE budget
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
        const result = await this.query(query, values);
        if (result.rows.length === 0) {
            throw new common_1.NotFoundException('Budget non trouvé');
        }
        return result.rows[0];
    }
    async getBudgetStats(anneeAcademiqueId) {
        let query = `
      SELECT
        COALESCE(SUM(montant_prevu), 0) as budget_total,
        COALESCE(SUM(montant_realise), 0) as depense_totale,
        COALESCE(SUM(montant_prevu - montant_realise), 0) as solde,
        ROUND((COALESCE(SUM(montant_realise), 0) / NULLIF(SUM(montant_prevu), 0) * 100), 2) as taux_execution
      FROM budget b
      JOIN annee_academique aa ON b.annee_academique_id = aa.id
      WHERE 1=1
    `;
        const values = [];
        if (anneeAcademiqueId) {
            query += ` AND b.annee_academique_id = $1`;
            values.push(anneeAcademiqueId);
        }
        else {
            query += ` AND aa.active = TRUE`;
        }
        const result = await this.query(query, values);
        if (Array.isArray(result) && result.length > 0) {
            return result[0];
        }
        if (result.rows && result.rows.length > 0) {
            return result.rows[0];
        }
        return {
            budget_total: 0,
            depense_totale: 0,
            solde: 0,
            taux_execution: 0,
        };
    }
    async getBudgetByDepartement(anneeAcademiqueId) {
        let query = `
      SELECT 
        d.nom as departement,
        COALESCE(SUM(b.montant_prevu), 0) as budget_total,
        COALESCE(SUM(b.montant_realise), 0) as depense_totale,
        COALESCE(SUM(b.montant_prevu - b.montant_realise), 0) as solde,
        ROUND((COALESCE(SUM(b.montant_realise), 0) / NULLIF(SUM(b.montant_prevu), 0) * 100), 2) as taux_execution
      FROM budget b
      JOIN departement d ON b.departement_id = d.id
      JOIN annee_academique aa ON b.annee_academique_id = aa.id
      WHERE 1=1
    `;
        const values = [];
        if (anneeAcademiqueId) {
            query += ` AND b.annee_academique_id = $1`;
            values.push(anneeAcademiqueId);
        }
        else {
            query += ` AND aa.active = TRUE`;
        }
        query += ` GROUP BY d.id, d.nom ORDER BY taux_execution DESC`;
        const result = await this.query(query, values);
        return result.rows;
    }
    async createDepense(dto) {
        const id = (0, uuid_1.v4)();
        if (dto.budget_id) {
            const budgetCheck = await this.query(`SELECT montant_prevu, montant_realise FROM budget WHERE id = $1`, [dto.budget_id]);
            if (budgetCheck.rows.length === 0) {
                throw new common_1.NotFoundException('Budget non trouvé');
            }
            const budget = budgetCheck.rows[0];
            const nouveauMontantRealise = parseFloat(budget.montant_realise) + dto.montant;
            if (nouveauMontantRealise > parseFloat(budget.montant_prevu)) {
                throw new common_1.BadRequestException('Cette dépense dépasserait le budget alloué');
            }
        }
        const query = `
      INSERT INTO depense (
        id, budget_id, annee_academique_id, libelle, montant,
        categorie, date_depense, fournisseur, numero_facture,
        facture_url, observations, demande_par, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'en_attente')
      RETURNING *
    `;
        const values = [
            id,
            dto.budget_id || null,
            dto.annee_academique_id,
            dto.libelle,
            dto.montant,
            dto.categorie || null,
            dto.date_depense || new Date(),
            dto.fournisseur || null,
            dto.numero_facture || null,
            dto.facture_url || null,
            dto.observations || null,
            this.userId,
        ];
        const result = await this.query(query, values);
        return result.rows[0];
    }
    async getDepenses(filters) {
        const page = parseInt(String(filters.page || 1));
        const limit = parseInt(String(filters.limit || 20));
        const offset = (page - 1) * limit;
        let query = `
      SELECT
        d.id, d.libelle, d.montant, d.date_depense, d.fournisseur,
        d.numero_facture, d.statut, d.categorie, d.facture_url,
        d.observations, d.date_approbation, d.created_at, d.updated_at,
        d.valide_par_president, d.valide_le, d.motif_decision, d.conditions_speciales,
        b.categorie as budget_categorie,
        u1.nom as demandeur,
        u1.prenom as demandeur_prenom,
        u2.nom as approbateur,
        u2.prenom as approbateur_prenom,
        aa.libelle as annee
      FROM depense d
      LEFT JOIN budget b ON d.budget_id = b.id
      LEFT JOIN utilisateur u1 ON d.demande_par = u1.id
      LEFT JOIN utilisateur u2 ON d.approuve_par = u2.id
      JOIN annee_academique aa ON d.annee_academique_id = aa.id
      WHERE 1=1
    `;
        const values = [];
        let paramCount = 1;
        if (filters.annee_academique_id) {
            query += ` AND d.annee_academique_id = $${paramCount}`;
            values.push(filters.annee_academique_id);
            paramCount++;
        }
        else {
            query += ` AND aa.active = TRUE`;
        }
        if (filters.statut) {
            query += ` AND d.statut = $${paramCount}`;
            values.push(filters.statut);
            paramCount++;
        }
        if (filters.categorie) {
            query += ` AND d.categorie = $${paramCount}`;
            values.push(filters.categorie);
            paramCount++;
        }
        if (filters.fournisseur) {
            query += ` AND d.fournisseur ILIKE $${paramCount}`;
            values.push(`%${filters.fournisseur}%`);
            paramCount++;
        }
        if (filters.date_debut) {
            query += ` AND d.date_depense >= $${paramCount}`;
            values.push(filters.date_debut);
            paramCount++;
        }
        if (filters.date_fin) {
            query += ` AND d.date_depense <= $${paramCount}`;
            values.push(filters.date_fin);
            paramCount++;
        }
        if (filters.search) {
            query += ` AND (d.libelle ILIKE $${paramCount} OR d.fournisseur ILIKE $${paramCount} OR d.numero_facture ILIKE $${paramCount})`;
            values.push(`%${filters.search}%`);
            paramCount++;
        }
        let countQuery = `
      SELECT COUNT(*) as total
      FROM depense d
      LEFT JOIN budget b ON d.budget_id = b.id
      LEFT JOIN utilisateur u1 ON d.demande_par = u1.id
      LEFT JOIN utilisateur u2 ON d.approuve_par = u2.id
      JOIN annee_academique aa ON d.annee_academique_id = aa.id
      WHERE 1=1
    `;
        let countParamIndex = 1;
        const countValues = [];
        if (filters.annee_academique_id) {
            countQuery += ` AND d.annee_academique_id = $${countParamIndex}`;
            countValues.push(filters.annee_academique_id);
            countParamIndex++;
        }
        else {
            countQuery += ` AND aa.active = TRUE`;
        }
        if (filters.statut) {
            countQuery += ` AND d.statut = $${countParamIndex}`;
            countValues.push(filters.statut);
            countParamIndex++;
        }
        if (filters.categorie) {
            countQuery += ` AND d.categorie = $${countParamIndex}`;
            countValues.push(filters.categorie);
            countParamIndex++;
        }
        if (filters.fournisseur) {
            countQuery += ` AND d.fournisseur ILIKE $${countParamIndex}`;
            countValues.push(`%${filters.fournisseur}%`);
            countParamIndex++;
        }
        if (filters.date_debut) {
            countQuery += ` AND d.date_depense >= $${countParamIndex}`;
            countValues.push(filters.date_debut);
            countParamIndex++;
        }
        if (filters.date_fin) {
            countQuery += ` AND d.date_depense <= $${countParamIndex}`;
            countValues.push(filters.date_fin);
            countParamIndex++;
        }
        if (filters.search) {
            countQuery += ` AND (d.libelle ILIKE $${countParamIndex} OR d.fournisseur ILIKE $${countParamIndex} OR d.numero_facture ILIKE $${countParamIndex})`;
            countValues.push(`%${filters.search}%`);
            countParamIndex++;
        }
        const countResult = await this.query(countQuery, countValues);
        const total = parseInt(countResult.rows[0]?.total || '0');
        console.log('[EconomatService] After COUNT query, paramCount:', paramCount);
        console.log('[EconomatService] Current values array:', values);
        console.log('[EconomatService] About to add pagination');
        query += ` ORDER BY d.date_depense DESC, d.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);
        console.log('[EconomatService] After adding pagination, values:', values);
        console.log('[EconomatService] Final paramCount:', paramCount);
        try {
            console.log('[EconomatService] About to execute main depenses query');
            console.log('[EconomatService] Full query:', query);
            console.log('[EconomatService] Values:', values);
            const result = await this.query(query, values);
            console.log('[EconomatService] Main query executed successfully, rows:', result.rows?.length);
            return { data: result.rows || [], total };
        }
        catch (error) {
            console.error('[EconomatService] ❌ ERROR in main depenses query:', error);
            console.error('[EconomatService] Error message:', error?.message);
            console.error('[EconomatService] Error stack:', error?.stack);
            console.error('[EconomatService] Query:', query);
            console.error('[EconomatService] Values:', values);
            throw new Error(`Erreur lors de la récupération des dépenses: ${error?.message || 'Erreur inconnue'}`);
        }
    }
    async getDepenseById(id) {
        const query = `
      SELECT 
        d.*, b.categorie as budget_categorie,
        u1.nom as demandeur, u2.nom as approbateur,
        aa.libelle as annee
      FROM depense d
      LEFT JOIN budget b ON d.budget_id = b.id
      LEFT JOIN utilisateur u1 ON d.demande_par = u1.id
      LEFT JOIN utilisateur u2 ON d.approuve_par = u2.id
      JOIN annee_academique aa ON d.annee_academique_id = aa.id
      WHERE d.id = $1
    `;
        const result = await this.query(query, [id]);
        if (result.rows.length === 0) {
            throw new common_1.NotFoundException('Dépense non trouvée');
        }
        return result.rows[0];
    }
    async approveDepense(id, dto) {
        const depense = await this.getDepenseById(id);
        if (depense.statut !== 'en_attente') {
            throw new common_1.BadRequestException('Cette dépense a déjà été traitée');
        }
        const query = `
      UPDATE depense
      SET statut = $1, approuve_par = $2, date_approbation = NOW(),
          motif_decision = $3, conditions_speciales = $4
      WHERE id = $5
      RETURNING *
    `;
        const values = [dto.statut, this.userId, dto.motif_decision, dto.conditions_speciales, id];
        const result = await this.query(query, values);
        if (dto.statut === 'approuve' && depense.budget_id) {
            await this.query(`UPDATE budget 
         SET montant_realise = montant_realise + $1 
         WHERE id = $2`, [depense.montant, depense.budget_id]);
        }
        return result.rows[0];
    }
    async validateByPresident(id, dto) {
        const query = `
      UPDATE depense
      SET valide_par_president = $1, valide_le = NOW(), motif_decision = $2
      WHERE id = $3
      RETURNING *
    `;
        const values = [dto.valide_par_president || this.userId, dto.motif_decision, id];
        const result = await this.query(query, values);
        if (result.rows.length === 0) {
            throw new common_1.NotFoundException('Dépense non trouvée');
        }
        return result.rows[0];
    }
    async markAsPaid(id, dto) {
        const depense = await this.getDepenseById(id);
        if (depense.statut !== 'approuve') {
            throw new common_1.BadRequestException('Seules les dépenses approuvées peuvent être marquées comme payées');
        }
        const query = `
      UPDATE depense
      SET statut = 'paye', observations = $1
      WHERE id = $2
      RETURNING *
    `;
        const values = [dto.observations, id];
        const result = await this.query(query, values);
        return result.rows[0];
    }
    async getDepenseStats(anneeAcademiqueId) {
        let query = `
      SELECT
        COUNT(*) FILTER (WHERE statut = 'en_attente') as nb_en_attente,
        COALESCE(SUM(montant) FILTER (WHERE statut = 'en_attente'), 0) as montant_total,
        COUNT(*) FILTER (WHERE statut = 'approuve') as nb_approuve,
        COUNT(*) FILTER (WHERE statut = 'paye') as nb_paye,
        COUNT(*) FILTER (WHERE statut = 'rejete') as nb_rejete
      FROM depense d
      JOIN annee_academique aa ON d.annee_academique_id = aa.id
      WHERE 1=1
    `;
        const values = [];
        if (anneeAcademiqueId) {
            query += ` AND d.annee_academique_id = $1`;
            values.push(anneeAcademiqueId);
        }
        else {
            query += ` AND aa.active = TRUE`;
        }
        const result = await this.query(query, values);
        if (result.rows && result.rows.length > 0) {
            return result.rows[0];
        }
        return {
            nb_en_attente: 0,
            montant_total: 0,
            nb_approuve: 0,
            nb_paye: 0,
            nb_rejete: 0,
        };
    }
    async getDepensesByFournisseur(anneeAcademiqueId) {
        let query = `
      SELECT 
        fournisseur,
        COUNT(*) as nb_factures,
        SUM(montant) as montant_total,
        AVG(montant) as montant_moyen,
        MAX(date_depense) as derniere_transaction
      FROM depense d
      JOIN annee_academique aa ON d.annee_academique_id = aa.id
      WHERE fournisseur IS NOT NULL AND statut != 'rejete'
    `;
        const values = [];
        if (anneeAcademiqueId) {
            query += ` AND d.annee_academique_id = $1`;
            values.push(anneeAcademiqueId);
        }
        else {
            query += ` AND aa.active = TRUE`;
        }
        query += ` GROUP BY fournisseur ORDER BY montant_total DESC`;
        const result = await this.query(query, values);
        return result.rows;
    }
    async getDepensesByCategorie(anneeAcademiqueId) {
        let query = `
      SELECT 
        categorie,
        COUNT(*) as nb_depenses,
        SUM(montant) as montant_total,
        ROUND((SUM(montant) / (SELECT SUM(montant) FROM depense WHERE statut != 'rejete') * 100), 2) as pourcentage
      FROM depense d
      JOIN annee_academique aa ON d.annee_academique_id = aa.id
      WHERE categorie IS NOT NULL AND statut != 'rejete'
    `;
        const values = [];
        if (anneeAcademiqueId) {
            query += ` AND d.annee_academique_id = $1`;
            values.push(anneeAcademiqueId);
        }
        else {
            query += ` AND aa.active = TRUE`;
        }
        query += ` GROUP BY categorie ORDER BY montant_total DESC`;
        const result = await this.query(query, values);
        return result.rows;
    }
    async getFournisseurs(search) {
        let query = `
      SELECT
        fournisseur,
        COUNT(*)::integer as nb_factures,
        COALESCE(SUM(montant), 0)::numeric as montant_total,
        COALESCE(AVG(montant), 0)::numeric as montant_moyen,
        MAX(date_depense) as derniere_transaction
      FROM depense
      WHERE fournisseur IS NOT NULL AND fournisseur != '' AND statut != 'rejete'
    `;
        const values = [];
        if (search) {
            query += ` AND fournisseur ILIKE $1`;
            values.push(`%${search}%`);
        }
        query += ` GROUP BY fournisseur ORDER BY montant_total DESC`;
        try {
            const result = await this.query(query, values);
            if (Array.isArray(result)) {
                console.log('[EconomatService] Fournisseurs found:', result.length);
                return result;
            }
            console.log('[EconomatService] Fournisseurs found:', result.rows?.length || 0);
            return result.rows || [];
        }
        catch (error) {
            console.error('[EconomatService] Error fetching fournisseurs:', error);
            return [];
        }
    }
    async getFournisseurTransactions(fournisseur) {
        const query = `
      SELECT
        d.id, d.libelle, d.montant, d.date_depense,
        d.numero_facture, d.statut, d.facture_url,
        d.categorie, aa.libelle as annee
      FROM depense d
      JOIN annee_academique aa ON d.annee_academique_id = aa.id
      WHERE d.fournisseur = $1
      ORDER BY d.date_depense DESC
    `;
        try {
            const result = await this.query(query, [fournisseur]);
            if (Array.isArray(result)) {
                console.log('[EconomatService] Transactions found for fournisseur:', result.length);
                return result;
            }
            console.log('[EconomatService] Transactions found for fournisseur:', result.rows?.length || 0);
            return result.rows || [];
        }
        catch (error) {
            console.error('[EconomatService] Error fetching fournisseur transactions:', error);
            return [];
        }
    }
    async getRecouvrementStats(anneeAcademiqueId) {
        let query = `
      SELECT
        COUNT(DISTINCT i.id) as nb_inscriptions,
        COALESCE(SUM(gt.montant_total), 0) as montant_attendu,
        COALESCE(SUM(p.montant), 0) as montant_recouvre,
        COALESCE(SUM(gt.montant_total) - COALESCE(SUM(p.montant), 0), 0) as montant_impaye,
        ROUND((COALESCE(SUM(p.montant), 0) / NULLIF(SUM(gt.montant_total), 0) * 100), 2) as taux_recouvrement
      FROM inscription i
      JOIN grille_tarifaire gt ON i.parcours_id = gt.parcours_id
        AND i.annee_academique_id = gt.annee_academique_id
        AND i.annee_niveau = gt.annee_niveau
      LEFT JOIN paiement p ON i.id = p.inscription_id AND p.statut = 'valide'
      WHERE 1=1
    `;
        const values = [];
        if (anneeAcademiqueId) {
            query += ` AND i.annee_academique_id = $1`;
            values.push(anneeAcademiqueId);
        }
        else {
            query += ` AND EXISTS (SELECT 1 FROM annee_academique aa WHERE aa.id = i.annee_academique_id AND aa.active = TRUE)`;
        }
        const result = await this.query(query, values);
        if (Array.isArray(result)) {
            if (result.length > 0) {
                return result[0];
            }
        }
        else if (result.rows && result.rows.length > 0) {
            return result.rows[0];
        }
        return {
            nb_inscriptions: 0,
            montant_attendu: 0,
            montant_recouvre: 0,
            montant_impaye: 0,
            taux_recouvrement: 0,
        };
    }
    async getInscriptionsImpayees(filters) {
        let query = `
      SELECT
        i.id as inscription_id,
        et.matricule, et.nom, et.prenom,
        p.nom as parcours,
        gt.montant_total,
        COALESCE(SUM(pa.montant), 0) as montant_paye,
        (gt.montant_total - COALESCE(SUM(pa.montant), 0)) as reste_a_payer,
        i.statut
      FROM inscription i
      JOIN etudiant et ON i.etudiant_id = et.id
      JOIN parcours p ON i.parcours_id = p.id
      JOIN grille_tarifaire gt ON i.parcours_id = gt.parcours_id
        AND i.annee_academique_id = gt.annee_academique_id
        AND i.annee_niveau = gt.annee_niveau
      LEFT JOIN paiement pa ON i.id = pa.inscription_id AND pa.statut = 'valide'
      WHERE 1=1
    `;
        const values = [];
        let paramCount = 1;
        if (filters.annee_academique_id) {
            query += ` AND i.annee_academique_id = $${paramCount}`;
            values.push(filters.annee_academique_id);
            paramCount++;
        }
        if (filters.parcours_id) {
            query += ` AND i.parcours_id = $${paramCount}`;
            values.push(filters.parcours_id);
            paramCount++;
        }
        if (filters.niveau) {
            query += ` AND ne.code = $${paramCount}`;
            values.push(filters.niveau);
            paramCount++;
        }
        if (filters.search) {
            query += ` AND (et.matricule ILIKE $${paramCount} OR et.nom ILIKE $${paramCount} OR et.prenom ILIKE $${paramCount})`;
            values.push(`%${filters.search}%`);
            paramCount++;
        }
        query += `
      GROUP BY i.id, et.matricule, et.nom, et.prenom, p.nom, gt.montant_total, i.statut
      HAVING (gt.montant_total - COALESCE(SUM(pa.montant), 0)) > 0
      ORDER BY reste_a_payer DESC
    `;
        const result = await this.query(query, values);
        if (Array.isArray(result)) {
            return result;
        }
        return result.rows || [];
    }
    async getRecouvrementByParcours(anneeAcademiqueId) {
        let query = `
      SELECT
        p.nom as parcours,
        COUNT(DISTINCT i.id) as nb_etudiants,
        SUM(gt.montant_total) as montant_attendu,
        COALESCE(SUM(pa.montant), 0) as montant_recouvre,
        ROUND((COALESCE(SUM(pa.montant), 0) / NULLIF(SUM(gt.montant_total), 0) * 100), 2) as taux
      FROM inscription i
      JOIN parcours p ON i.parcours_id = p.id
      JOIN grille_tarifaire gt ON i.parcours_id = gt.parcours_id
        AND i.annee_academique_id = gt.annee_academique_id
        AND i.annee_niveau = gt.annee_niveau
      LEFT JOIN paiement pa ON i.id = pa.inscription_id AND pa.statut = 'valide'
      WHERE 1=1
    `;
        const values = [];
        if (anneeAcademiqueId) {
            query += ` AND i.annee_academique_id = $1`;
            values.push(anneeAcademiqueId);
        }
        else {
            query += ` AND EXISTS (SELECT 1 FROM annee_academique aa WHERE aa.id = i.annee_academique_id AND aa.active = TRUE)`;
        }
        query += ` GROUP BY p.id, p.nom ORDER BY taux DESC`;
        const result = await this.query(query, values);
        if (Array.isArray(result)) {
            return result;
        }
        return result.rows || [];
    }
    async getRapportJournalier(date) {
        const paiementsQuery = `
      SELECT 
        p.recu_numero, p.montant, p.mode_paiement,
        et.matricule, et.nom, et.prenom,
        u.nom as caissier,
        TO_CHAR(p.created_at, 'HH24:MI') as heure
      FROM paiement p
      JOIN inscription i ON p.inscription_id = i.id
      JOIN etudiant et ON i.etudiant_id = et.id
      LEFT JOIN utilisateur u ON p.caissier_id = u.id
      WHERE p.date_paiement = $1 AND p.statut = 'valide'
      ORDER BY p.created_at
    `;
        const modesQuery = `
      SELECT 
        mode_paiement,
        COUNT(*) as nb_transactions,
        SUM(montant) as montant_total
      FROM paiement
      WHERE date_paiement = $1 AND statut = 'valide'
      GROUP BY mode_paiement
    `;
        const [paiementsResult, modesResult] = await Promise.all([
            this.query(paiementsQuery, [date]),
            this.query(modesQuery, [date]),
        ]);
        const total = paiementsResult.rows.reduce((sum, p) => sum + parseFloat(p.montant), 0);
        return {
            date: new Date(date),
            paiements: paiementsResult.rows,
            total_paiements: total,
            nb_paiements: paiementsResult.rows.length,
            par_mode_paiement: modesResult.rows,
        };
    }
    async getRapportMensuel(mois, annee) {
        const recettesQuery = `
      SELECT
        COALESCE(SUM(p.montant), 0) as total
      FROM paiement p
      WHERE EXTRACT(MONTH FROM p.date_paiement) = $1
        AND EXTRACT(YEAR FROM p.date_paiement) = $2
        AND p.statut = 'valide'
    `;
        const depensesQuery = `
      SELECT
        COALESCE(SUM(d.montant), 0) as total
      FROM depense d
      WHERE EXTRACT(MONTH FROM d.date_depense) = $1
        AND EXTRACT(YEAR FROM d.date_depense) = $2
        AND d.statut = 'paye'
    `;
        const [recettesResult, depensesResult] = await Promise.all([
            this.query(recettesQuery, [mois, annee]),
            this.query(depensesQuery, [mois, annee]),
        ]);
        const recettesRows = Array.isArray(recettesResult) ? recettesResult : (recettesResult.rows || []);
        const depensesRows = Array.isArray(depensesResult) ? depensesResult : (depensesResult.rows || []);
        const totalRecettes = parseFloat(recettesRows[0]?.total || 0);
        const totalDepenses = parseFloat(depensesRows[0]?.total || 0);
        return {
            mois,
            annee,
            par_jour: [],
            total_mois: totalRecettes,
            nb_paiements: 0,
            moyenne_journaliere: 0,
            total_recettes: totalRecettes,
            total_depenses: totalDepenses,
            solde: totalRecettes - totalDepenses,
        };
    }
    async getRapportAnnuel(anneeAcademiqueId) {
        const recettesQuery = `
      SELECT SUM(p.montant) as total
      FROM paiement p
      JOIN inscription i ON p.inscription_id = i.id
      WHERE i.annee_academique_id = $1 AND p.statut = 'valide'
    `;
        const depensesQuery = `
      SELECT SUM(montant) as total
      FROM depense
      WHERE annee_academique_id = $1 AND statut = 'paye'
    `;
        const anneeQuery = `
      SELECT libelle FROM annee_academique WHERE id = $1
    `;
        const [recettesResult, depensesResult, anneeResult] = await Promise.all([
            this.query(recettesQuery, [anneeAcademiqueId]),
            this.query(depensesQuery, [anneeAcademiqueId]),
            this.query(anneeQuery, [anneeAcademiqueId]),
        ]);
        const recettesRows = Array.isArray(recettesResult) ? recettesResult : (recettesResult.rows || []);
        const depensesRows = Array.isArray(depensesResult) ? depensesResult : (depensesResult.rows || []);
        const anneeRows = Array.isArray(anneeResult) ? anneeResult : (anneeResult.rows || []);
        const recettes = parseFloat(recettesRows[0]?.total || 0);
        const depenses = parseFloat(depensesRows[0]?.total || 0);
        return {
            annee_academique: anneeRows[0]?.libelle || '',
            recettes_totales: recettes,
            depenses_totales: depenses,
            solde: recettes - depenses,
            par_mois: [],
            par_categorie_depense: [],
            par_source_recette: [],
        };
    }
    async getBilanFinancier(anneeAcademiqueId) {
        const recettesQuery = `
      SELECT 
        SUM(p.montant) FILTER (WHERE gt.frais_scolarite > 0) as scolarite,
        SUM(p.montant) FILTER (WHERE gt.frais_inscription > 0) as inscription,
        SUM(p.montant) as total
      FROM paiement p
      JOIN inscription i ON p.inscription_id = i.id
      JOIN grille_tarifaire gt ON i.parcours_id = gt.parcours_id
        AND i.annee_academique_id = gt.annee_academique_id
        AND i.annee_niveau = gt.annee_niveau
      WHERE i.annee_academique_id = $1 AND p.statut = 'valide'
    `;
        const depensesQuery = `
      SELECT 
        SUM(montant) FILTER (WHERE categorie = 'personnel') as personnel,
        SUM(montant) FILTER (WHERE categorie = 'equipement') as equipement,
        SUM(montant) FILTER (WHERE categorie = 'fonctionnement') as fonctionnement,
        SUM(montant) as total
      FROM depense
      WHERE annee_academique_id = $1 AND statut = 'paye'
    `;
        const subventionsQuery = `
      SELECT COALESCE(SUM(montant_prevu), 0) as total
      FROM budget
      WHERE annee_academique_id = $1 AND categorie = 'subvention'
    `;
        const [recettesResult, depensesResult, subventionsResult] = await Promise.all([
            this.query(recettesQuery, [anneeAcademiqueId]),
            this.query(depensesQuery, [anneeAcademiqueId]),
            this.query(subventionsQuery, [anneeAcademiqueId]),
        ]);
        const recettes = recettesResult.rows[0];
        const depenses = depensesResult.rows[0];
        const subventions = parseFloat(subventionsResult.rows[0]?.total || 0);
        const recettesTotales = parseFloat(recettes.total || 0) + subventions;
        const depensesTotales = parseFloat(depenses.total || 0);
        return {
            periode: anneeAcademiqueId,
            recettes: {
                scolarite: parseFloat(recettes.scolarite || 0),
                inscription: parseFloat(recettes.inscription || 0),
                subventions,
                autres: 0,
                total: recettesTotales,
            },
            depenses: {
                personnel: parseFloat(depenses.personnel || 0),
                equipement: parseFloat(depenses.equipement || 0),
                fonctionnement: parseFloat(depenses.fonctionnement || 0),
                autres: depensesTotales - (parseFloat(depenses.personnel || 0) + parseFloat(depenses.equipement || 0) + parseFloat(depenses.fonctionnement || 0)),
                total: depensesTotales,
            },
            resultat: recettesTotales - depensesTotales,
            taux_execution_budget: 0,
        };
    }
    async getSubventions(anneeAcademiqueId) {
        let query = `
      SELECT 
        b.id, b.description as source, b.montant_prevu as montant_recu,
        b.montant_realise as montant_utilise,
        (b.montant_prevu - b.montant_realise) as solde,
        b.created_at as date_reception,
        aa.libelle as annee
      FROM budget b
      JOIN annee_academique aa ON b.annee_academique_id = aa.id
      WHERE b.categorie = 'subvention'
    `;
        const values = [];
        if (anneeAcademiqueId) {
            query += ` AND b.annee_academique_id = $1`;
            values.push(anneeAcademiqueId);
        }
        else {
            query += ` AND aa.active = TRUE`;
        }
        query += ` ORDER BY b.created_at DESC`;
        const result = await this.query(query, values);
        return result.rows;
    }
    async getSubventionUtilisation(subventionId) {
        const query = `
      SELECT 
        d.libelle, d.montant, d.date_depense, d.statut,
        b.description as source
      FROM depense d
      JOIN budget b ON d.budget_id = b.id
      WHERE b.id = $1 AND b.categorie = 'subvention'
      ORDER BY d.date_depense DESC
    `;
        const result = await this.query(query, [subventionId]);
        return result.rows;
    }
};
exports.EconomatService = EconomatService;
exports.EconomatService = EconomatService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, typeorm_1.InjectDataSource)('tenant')),
    __param(1, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [typeorm_2.DataSource, Object])
], EconomatService);
//# sourceMappingURL=economat.service.js.map