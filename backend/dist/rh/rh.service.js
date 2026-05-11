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
var RHService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RHService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const core_1 = require("@nestjs/core");
let RHService = RHService_1 = class RHService {
    constructor(dataSource, request) {
        this.dataSource = dataSource;
        this.request = request;
        this.logger = new common_1.Logger(RHService_1.name);
        this.tenantSchema = this.request.tenantSchema || 'public';
        this.logger.log(`RHService initialized with schema: ${this.tenantSchema}`);
        if (!this.request.tenantSchema) {
            this.logger.warn('No tenant schema found in request! Using public schema as fallback.');
        }
    }
    async query(sql, params) {
        try {
            if (!this.tenantSchema || this.tenantSchema === 'public') {
                throw new common_1.BadRequestException('Tenant schema not set. Please provide X-Tenant-Id header.');
            }
            const schemaQuery = `SET search_path TO "${this.tenantSchema}", public`;
            await this.dataSource.query(schemaQuery);
            this.logger.debug(`Executing query in schema: ${this.tenantSchema}`);
            return this.dataSource.query(sql, params);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Query error in schema ${this.tenantSchema}: ${errorMessage}`);
            throw error;
        }
    }
    async createContrat(data) {
        const result = await this.query(`
      INSERT INTO contrat_personnel (
        utilisateur_id, type_contrat, poste, departement_id, date_debut, date_fin,
        salaire_brut, salaire_net, volume_horaire_hebdo, actif, observations
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
            data.utilisateurId, data.typeContrat, data.poste, data.departementId,
            data.dateDebut, data.dateFin, data.salaireBrut, data.salaireNet,
            data.volumeHoraireHebdo, data.actif !== false, data.observations
        ]);
        return result[0];
    }
    async findContrats(filters) {
        let query = `
      SELECT c.*, u.nom as utilisateur_nom, u.prenom as utilisateur_prenom, d.nom as departement_nom
      FROM contrat_personnel c
      LEFT JOIN utilisateur u ON u.id = c.utilisateur_id
      LEFT JOIN departement d ON d.id = c.departement_id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 0;
        if (filters?.typeContrat) {
            query += ` AND c.type_contrat = $${++paramCount}`;
            params.push(filters.typeContrat);
        }
        if (filters?.actif !== undefined) {
            query += ` AND c.actif = $${++paramCount}`;
            params.push(filters.actif);
        }
        if (filters?.departementId) {
            query += ` AND c.departement_id = $${++paramCount}`;
            params.push(filters.departementId);
        }
        query += ` ORDER BY c.date_debut DESC`;
        return this.query(query, params);
    }
    async renouvelerContrat(id, data) {
        const contrats = await this.query(`SELECT * FROM contrat_personnel WHERE id = $1`, [id]);
        if (!contrats || contrats.length === 0) {
            throw new common_1.NotFoundException('Contrat non trouvé');
        }
        if (data.nouveauSalaire) {
            await this.query(`
        UPDATE contrat_personnel
        SET date_fin = $1, salaire_brut = $2, updated_at = NOW()
        WHERE id = $3
      `, [data.nouvelleDateFin, data.nouveauSalaire, id]);
        }
        else {
            await this.query(`
        UPDATE contrat_personnel
        SET date_fin = $1, updated_at = NOW()
        WHERE id = $2
      `, [data.nouvelleDateFin, id]);
        }
        const result = await this.query(`SELECT * FROM contrat_personnel WHERE id = $1`, [id]);
        return result[0];
    }
    async resilierContrat(id, motif) {
        await this.query(`
      UPDATE contrat_personnel
      SET actif = false, observations = $1, updated_at = NOW()
      WHERE id = $2
    `, [motif, id]);
        const result = await this.query(`SELECT * FROM contrat_personnel WHERE id = $1`, [id]);
        return result[0];
    }
    async createHeuresComplementaires(data) {
        const heuresComp = await this.query(`
      INSERT INTO heure_complementaire (enseignant_id, date_travail, nb_heures, taux_horaire, motif, statut, created_at)
      VALUES ($1, $2, $3, $4, $5, 'saisie', NOW())
      RETURNING *
    `, [data.enseignantId, data.dateTravail, data.nbHeures, data.tauxHoraire, data.motif]);
        return heuresComp[0];
    }
    async findHeuresComplementaires(filters) {
        let query = `SELECT hc.*, e.nom, e.prenom FROM heure_complementaire hc
                 JOIN enseignant e ON e.id = hc.enseignant_id WHERE 1=1`;
        const params = [];
        let paramCount = 0;
        if (filters?.enseignantId) {
            query += ` AND hc.enseignant_id = $${++paramCount}`;
            params.push(filters.enseignantId);
        }
        if (filters?.statut) {
            query += ` AND hc.statut = $${++paramCount}`;
            params.push(filters.statut);
        }
        if (filters?.mois && filters?.annee) {
            query += ` AND EXTRACT(MONTH FROM hc.date_travail) = $${++paramCount} AND EXTRACT(YEAR FROM hc.date_travail) = $${++paramCount}`;
            params.push(filters.mois, filters.annee);
        }
        query += ` ORDER BY hc.date_travail DESC`;
        return this.query(query, params);
    }
    async validerHeuresComplementaires(id, validePar) {
        await this.query(`
      UPDATE heure_complementaire
      SET statut = 'valide', valide_par = $1, date_validation = NOW()
      WHERE id = $2
    `, [validePar, id]);
        const result = await this.query(`SELECT * FROM heure_complementaire WHERE id = $1`, [id]);
        return result[0];
    }
    async getVolumeHoraireEnseignant(enseignantId, annee) {
        const anneeFilter = annee ? `AND EXTRACT(YEAR FROM date_travail) = ${annee}` : '';
        const result = await this.query(`
      SELECT
        COALESCE(SUM(nb_heures), 0) as total_heures,
        COUNT(*) as nb_seances,
        COALESCE(SUM(CASE WHEN statut = 'valide' THEN nb_heures ELSE 0 END), 0) as heures_validees,
        COALESCE(SUM(CASE WHEN statut = 'saisie' THEN nb_heures ELSE 0 END), 0) as heures_en_attente
      FROM heure_complementaire
      WHERE enseignant_id = $1 ${anneeFilter}
    `, [enseignantId]);
        return result[0];
    }
    async demanderConge(data) {
        const result = await this.query(`
      INSERT INTO conge_personnel (
        utilisateur_id, type_conge, date_debut, date_fin, nb_jours, motif, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, 'demande')
      RETURNING *
    `, [
            data.utilisateurId, data.typeConge, data.dateDebut, data.dateFin,
            data.nbJours, data.motif
        ]);
        return result[0];
    }
    async findConges(filters) {
        let query = `
      SELECT c.*, u.nom as utilisateur_nom, u.prenom as utilisateur_prenom
      FROM conge_personnel c
      LEFT JOIN utilisateur u ON u.id = c.utilisateur_id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 0;
        if (filters?.utilisateurId) {
            query += ` AND c.utilisateur_id = $${++paramCount}`;
            params.push(filters.utilisateurId);
        }
        if (filters?.statut) {
            query += ` AND c.statut = $${++paramCount}`;
            params.push(filters.statut);
        }
        if (filters?.typeConge) {
            query += ` AND c.type_conge = $${++paramCount}`;
            params.push(filters.typeConge);
        }
        query += ` ORDER BY c.date_debut DESC`;
        return this.query(query, params);
    }
    async approuverConge(id, data) {
        await this.query(`
      UPDATE conge_personnel
      SET statut = 'approuve', approuve_par = $1, date_approbation = NOW()
      WHERE id = $2
    `, [data.approuvePar, id]);
        const result = await this.query(`SELECT * FROM conge_personnel WHERE id = $1`, [id]);
        return result[0];
    }
    async refuserConge(id, data) {
        await this.query(`
      UPDATE conge_personnel
      SET statut = 'refuse', approuve_par = $1, date_approbation = NOW(), motif = $2
      WHERE id = $3
    `, [data.approuvePar, data.motif, id]);
        const result = await this.query(`SELECT * FROM conge_personnel WHERE id = $1`, [id]);
        return result[0];
    }
    async getSoldeConges(utilisateurId) {
        const result = await this.query(`
      SELECT
        25 as conges_acquis_annuels,
        COALESCE(SUM(nb_jours), 0) as conges_pris,
        25 - COALESCE(SUM(nb_jours), 0) as solde_restant
      FROM conge_personnel
      WHERE utilisateur_id = $1
        AND statut = 'approuve'
        AND EXTRACT(YEAR FROM date_debut) = EXTRACT(YEAR FROM NOW())
    `, [utilisateurId]);
        return result[0] || { conges_acquis_annuels: 25, conges_pris: 0, solde_restant: 25 };
    }
    async genererFichePaie(data) {
        const cotisations = data.salaireBrut * 0.22;
        const netAPayer = data.salaireBrut - cotisations + (data.primes || 0) - (data.retenues || 0) + (data.montantHeuresSupp || 0);
        const result = await this.query(`
      INSERT INTO fiche_paie (
        contrat_id, annee, mois, salaire_brut, cotisations, primes, retenues,
        net_a_payer, heures_supp, montant_heures_supp, statut
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'brouillon')
      RETURNING *
    `, [
            data.contratId, data.annee, data.mois, data.salaireBrut, cotisations,
            data.primes || 0, data.retenues || 0, netAPayer, data.heuresSupp || 0,
            data.montantHeuresSupp || 0
        ]);
        return result[0];
    }
    async findFichesPaie(filters) {
        let query = `
      SELECT fp.*, c.poste, u.nom as utilisateur_nom, u.prenom as utilisateur_prenom
      FROM fiche_paie fp
      LEFT JOIN contrat_personnel c ON c.id = fp.contrat_id
      LEFT JOIN utilisateur u ON u.id = c.utilisateur_id
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 0;
        if (filters?.contratId) {
            query += ` AND fp.contrat_id = $${++paramCount}`;
            params.push(filters.contratId);
        }
        if (filters?.annee) {
            query += ` AND fp.annee = $${++paramCount}`;
            params.push(filters.annee);
        }
        if (filters?.mois) {
            query += ` AND fp.mois = $${++paramCount}`;
            params.push(filters.mois);
        }
        query += ` ORDER BY fp.annee DESC, fp.mois DESC`;
        return this.query(query, params);
    }
    async validerFichePaie(id) {
        await this.query(`
      UPDATE fiche_paie
      SET statut = 'valide'
      WHERE id = $1
    `, [id]);
        const result = await this.query(`SELECT * FROM fiche_paie WHERE id = $1`, [id]);
        return result[0];
    }
    async genererFichesPaieMasse(annee, mois) {
        const contrats = await this.query(`SELECT * FROM contrat_personnel WHERE actif = true`);
        const results = [];
        for (const contrat of contrats) {
            const existing = await this.query(`
        SELECT * FROM fiche_paie
        WHERE contrat_id = $1 AND annee = $2 AND mois = $3
      `, [contrat.id, annee, mois]);
            if (!existing || existing.length === 0) {
                const cotisations = Number(contrat.salaire_brut) * 0.22;
                const netAPayer = Number(contrat.salaire_net) || (Number(contrat.salaire_brut) - cotisations);
                const result = await this.query(`
          INSERT INTO fiche_paie (
            contrat_id, annee, mois, salaire_brut, cotisations, net_a_payer, statut
          ) VALUES ($1, $2, $3, $4, $5, $6, 'brouillon')
          RETURNING *
        `, [contrat.id, annee, mois, contrat.salaire_brut, cotisations, netAPayer]);
                results.push(result[0]);
            }
        }
        return { generees: results.length };
    }
    async createEvaluation(data) {
        const evalResult = await this.query(`
      INSERT INTO evaluation_personnel (
        utilisateur_id, evaluateur_id, annee_evaluation, date_evaluation, objectifs, competences, statut
      ) VALUES ($1, $2, $3, NOW(), $4, $5, 'en_cours')
      RETURNING *
    `, [data.utilisateurId, data.evaluateurId, data.anneeEvaluation, data.objectifs, data.competences]);
        return evalResult[0];
    }
    async findEvaluations(filters) {
        let query = `SELECT ep.*, u.nom, u.prenom FROM evaluation_personnel ep
                 JOIN utilisateur u ON u.id = ep.utilisateur_id WHERE 1=1`;
        const params = [];
        let paramCount = 0;
        if (filters?.utilisateurId) {
            query += ` AND ep.utilisateur_id = $${++paramCount}`;
            params.push(filters.utilisateurId);
        }
        if (filters?.annee) {
            query += ` AND ep.annee_evaluation = $${++paramCount}`;
            params.push(filters.annee);
        }
        if (filters?.statut) {
            query += ` AND ep.statut = $${++paramCount}`;
            params.push(filters.statut);
        }
        query += ` ORDER BY ep.date_evaluation DESC`;
        return this.query(query, params);
    }
    async submitAutoEvaluation(id, data) {
        await this.query(`
      UPDATE evaluation_personnel
      SET auto_evaluation = $1, date_auto_evaluation = NOW(), statut = 'auto_evalue'
      WHERE id = $2
    `, [JSON.stringify(data), id]);
        const result = await this.query(`SELECT * FROM evaluation_personnel WHERE id = $1`, [id]);
        return result[0];
    }
    async finaliserEvaluation(id, data) {
        await this.query(`
      UPDATE evaluation_personnel
      SET appreciation = $1, points_forts = $2, axes_amelioration = $3,
          note_globale = $4, statut = 'finalise', date_finalisation = NOW()
      WHERE id = $5
    `, [data.appreciation, data.pointsForts, data.axesAmelioration, data.noteGlobale, id]);
        const result = await this.query(`SELECT * FROM evaluation_personnel WHERE id = $1`, [id]);
        return result[0];
    }
    async createDeclarationSociale(data) {
        const decl = await this.query(`
      INSERT INTO declaration_sociale (
        type_declaration, periode_debut, periode_fin, organisme,
        montant_total_cotisations, nb_salaries, statut, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'preparation', NOW())
      RETURNING *
    `, [data.type, data.periodeDebut, data.periodeFin, data.organisme, data.montantTotal, data.nbSalaries]);
        return decl[0];
    }
    async findDeclarationsSociales(filters) {
        let query = `SELECT * FROM declaration_sociale WHERE 1=1`;
        const params = [];
        let paramCount = 0;
        if (filters?.type) {
            query += ` AND type_declaration = $${++paramCount}`;
            params.push(filters.type);
        }
        if (filters?.organisme) {
            query += ` AND organisme = $${++paramCount}`;
            params.push(filters.organisme);
        }
        if (filters?.statut) {
            query += ` AND statut = $${++paramCount}`;
            params.push(filters.statut);
        }
        query += ` ORDER BY periode_debut DESC`;
        return this.query(query, params);
    }
    async exportDeclarationSociale(id) {
        const declaration = await this.query(`
      SELECT ds.*,
        json_agg(json_build_object(
          'salarie', u.nom || ' ' || u.prenom,
          'salaire_brut', fp.salaire_brut,
          'cotisations', fp.cotisations
        )) as lignes
      FROM declaration_sociale ds
      JOIN fiche_paie fp ON fp.annee = EXTRACT(YEAR FROM ds.periode_debut)
        AND fp.mois = EXTRACT(MONTH FROM ds.periode_debut)
      JOIN contrat_personnel cp ON cp.id = fp.contrat_id
      JOIN utilisateur u ON u.id = cp.utilisateur_id
      WHERE ds.id = $1
      GROUP BY ds.id
    `, [id]);
        return declaration[0];
    }
    async createRecrutement(data) {
        const recrutement = await this.query(`
      INSERT INTO recrutement (
        poste, type_contrat, departement_id, nb_postes, date_cloture,
        statut, created_at, description
      ) VALUES ($1, $2, $3, $4, $5, 'ouvert', NOW(), $6)
      RETURNING *
    `, [data.poste, data.typeContrat, data.departementId, data.nbPostes, data.dateCloture, data.description]);
        return recrutement[0];
    }
    async findRecrutements(filters) {
        let query = `SELECT r.*, d.nom as departement_nom FROM recrutement r
                 LEFT JOIN departement d ON d.id = r.departement_id WHERE 1=1`;
        const params = [];
        let paramCount = 0;
        if (filters?.statut) {
            query += ` AND r.statut = $${++paramCount}`;
            params.push(filters.statut);
        }
        if (filters?.departementId) {
            query += ` AND r.departement_id = $${++paramCount}`;
            params.push(filters.departementId);
        }
        query += ` ORDER BY r.created_at DESC`;
        return this.query(query, params);
    }
    async getStatsRH() {
        const effectifsResult = await this.query(`
      SELECT COUNT(*) as count FROM contrat_personnel WHERE actif = true
    `);
        const masseSalariale = await this.query(`
      SELECT COALESCE(SUM(salaire_brut), 0) as total FROM contrat_personnel WHERE actif = true
    `);
        const contratsParType = await this.query(`
      SELECT type_contrat, COUNT(*) as count FROM contrat_personnel
      WHERE actif = true GROUP BY type_contrat
    `);
        const congesEnAttenteResult = await this.query(`
      SELECT COUNT(*) as count FROM conge_personnel WHERE statut = 'demande'
    `);
        return {
            effectifs: parseInt(effectifsResult[0]?.count || 0),
            masseSalarialeMensuelle: parseFloat(masseSalariale[0]?.total || 0),
            repartitionContrats: contratsParType,
            congesEnAttente: parseInt(congesEnAttenteResult[0]?.count || 0),
        };
    }
    async getStatsHeuresComplementaires(annee, mois) {
        const result = await this.query(`
      SELECT
        COUNT(DISTINCT enseignant_id) as nb_enseignants,
        COALESCE(SUM(nb_heures), 0) as total_heures,
        COALESCE(SUM(nb_heures * taux_horaire), 0) as cout_total
      FROM heure_complementaire
      WHERE EXTRACT(YEAR FROM date_travail) = $1 AND EXTRACT(MONTH FROM date_travail) = $2
        AND statut = 'valide'
    `, [annee, mois]);
        return result[0];
    }
};
exports.RHService = RHService;
exports.RHService = RHService = RHService_1 = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, typeorm_1.InjectDataSource)('tenant')),
    __param(1, (0, common_1.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [typeorm_2.DataSource, Object])
], RHService);
//# sourceMappingURL=rh.service.js.map