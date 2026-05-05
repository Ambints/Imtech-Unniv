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
const finance_entities_1 = require("../finance/finance.entities");
let RHService = RHService_1 = class RHService {
    constructor(contratRepo, congeRepo, fichePaieRepo, dataSource) {
        this.contratRepo = contratRepo;
        this.congeRepo = congeRepo;
        this.fichePaieRepo = fichePaieRepo;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(RHService_1.name);
    }
    async createContrat(data) {
        const contrat = this.contratRepo.create(data);
        return this.contratRepo.save(contrat);
    }
    async findContrats(filters) {
        const query = this.contratRepo.createQueryBuilder('c')
            .leftJoinAndSelect('c.utilisateur', 'u')
            .leftJoinAndSelect('c.departement', 'd');
        if (filters?.typeContrat)
            query.andWhere('c.typeContrat = :type', { type: filters.typeContrat });
        if (filters?.actif !== undefined)
            query.andWhere('c.actif = :actif', { actif: filters.actif });
        if (filters?.departementId)
            query.andWhere('c.departementId = :depId', { depId: filters.departementId });
        return query.orderBy('c.dateDebut', 'DESC').getMany();
    }
    async renouvelerContrat(id, data) {
        const contrat = await this.contratRepo.findOne({ where: { id } });
        if (!contrat)
            throw new common_1.NotFoundException('Contrat non trouvé');
        await this.contratRepo.update(id, {
            dateFin: data.nouvelleDateFin,
            ...(data.nouveauSalaire && { salaireBrut: data.nouveauSalaire }),
        });
        return this.contratRepo.findOne({ where: { id } });
    }
    async resilierContrat(id, motif) {
        await this.contratRepo.update(id, { actif: false, observations: motif });
        return this.contratRepo.findOne({ where: { id } });
    }
    async createHeuresComplementaires(data) {
        const heuresComp = await this.dataSource.query(`
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
        return this.dataSource.query(query, params);
    }
    async validerHeuresComplementaires(id, validePar) {
        await this.dataSource.query(`
      UPDATE heure_complementaire 
      SET statut = 'valide', valide_par = $1, date_validation = NOW()
      WHERE id = $2
    `, [validePar, id]);
        return this.dataSource.query(`SELECT * FROM heure_complementaire WHERE id = $1`, [id]);
    }
    async getVolumeHoraireEnseignant(enseignantId, annee) {
        const anneeFilter = annee ? `AND EXTRACT(YEAR FROM date_travail) = ${annee}` : '';
        const result = await this.dataSource.query(`
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
        const conge = this.congeRepo.create(data);
        return this.congeRepo.save(conge);
    }
    async findConges(filters) {
        const query = this.congeRepo.createQueryBuilder('c');
        if (filters?.utilisateurId)
            query.andWhere('c.utilisateurId = :uid', { uid: filters.utilisateurId });
        if (filters?.statut)
            query.andWhere('c.statut = :statut', { statut: filters.statut });
        if (filters?.typeConge)
            query.andWhere('c.typeConge = :type', { type: filters.typeConge });
        return query.orderBy('c.dateDebut', 'DESC').getMany();
    }
    async approuverConge(id, data) {
        await this.congeRepo.update(id, {
            statut: 'approuve',
            approuvePar: data.approuvePar,
            dateApprobation: new Date(),
        });
        return this.congeRepo.findOne({ where: { id } });
    }
    async refuserConge(id, data) {
        await this.congeRepo.update(id, {
            statut: 'refuse',
            approuvePar: data.approuvePar,
            dateApprobation: new Date(),
            motif: data.motif,
        });
        return this.congeRepo.findOne({ where: { id } });
    }
    async getSoldeConges(utilisateurId) {
        const result = await this.dataSource.query(`
      SELECT 
        25 as conges_acquis_annuels,
        COALESCE(SUM(EXTRACT(DAY FROM (date_fin - date_debut))), 0) as conges_pris,
        25 - COALESCE(SUM(EXTRACT(DAY FROM (date_fin - date_debut))), 0) as solde_restant
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
        const fiche = this.fichePaieRepo.create({
            ...data,
            cotisations,
            netAPayer,
            statut: 'brouillon',
        });
        return this.fichePaieRepo.save(fiche);
    }
    async findFichesPaie(filters) {
        const query = this.fichePaieRepo.createQueryBuilder('fp');
        if (filters?.contratId)
            query.andWhere('fp.contratId = :cid', { cid: filters.contratId });
        if (filters?.annee)
            query.andWhere('fp.annee = :annee', { annee: filters.annee });
        if (filters?.mois)
            query.andWhere('fp.mois = :mois', { mois: filters.mois });
        return query.orderBy('fp.annee', 'DESC').addOrderBy('fp.mois', 'DESC').getMany();
    }
    async validerFichePaie(id) {
        await this.fichePaieRepo.update(id, { statut: 'valide' });
        return this.fichePaieRepo.findOne({ where: { id } });
    }
    async genererFichesPaieMasse(annee, mois) {
        const contrats = await this.contratRepo.find({ where: { actif: true } });
        const results = [];
        for (const contrat of contrats) {
            const existing = await this.fichePaieRepo.findOne({
                where: { contratId: contrat.id, annee, mois },
            });
            if (!existing) {
                const cotisations = Number(contrat.salaireBrut) * 0.22;
                const fiche = await this.fichePaieRepo.create({
                    contratId: contrat.id,
                    annee,
                    mois,
                    salaireBrut: Number(contrat.salaireBrut),
                    cotisations,
                    netAPayer: Number(contrat.salaireNet) || (Number(contrat.salaireBrut) - cotisations),
                    statut: 'brouillon',
                });
                results.push(await this.fichePaieRepo.save(fiche));
            }
        }
        return { generees: results.length };
    }
    async createEvaluation(data) {
        const evalResult = await this.dataSource.query(`
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
        return this.dataSource.query(query, params);
    }
    async submitAutoEvaluation(id, data) {
        await this.dataSource.query(`
      UPDATE evaluation_personnel 
      SET auto_evaluation = $1, date_auto_evaluation = NOW(), statut = 'auto_evalue'
      WHERE id = $2
    `, [JSON.stringify(data), id]);
        return this.dataSource.query(`SELECT * FROM evaluation_personnel WHERE id = $1`, [id]);
    }
    async finaliserEvaluation(id, data) {
        await this.dataSource.query(`
      UPDATE evaluation_personnel 
      SET appreciation = $1, points_forts = $2, axes_amelioration = $3, 
          note_globale = $4, statut = 'finalise', date_finalisation = NOW()
      WHERE id = $5
    `, [data.appreciation, data.pointsForts, data.axesAmelioration, data.noteGlobale, id]);
        return this.dataSource.query(`SELECT * FROM evaluation_personnel WHERE id = $1`, [id]);
    }
    async createDeclarationSociale(data) {
        const decl = await this.dataSource.query(`
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
        return this.dataSource.query(query, params);
    }
    async exportDeclarationSociale(id) {
        const declaration = await this.dataSource.query(`
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
        const recrutement = await this.dataSource.query(`
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
        return this.dataSource.query(query, params);
    }
    async getStatsRH() {
        const [effectifs, masseSalariale, contratsParType, congesEnAttente] = await Promise.all([
            this.contratRepo.count({ where: { actif: true } }),
            this.dataSource.query(`
        SELECT COALESCE(SUM(salaire_brut), 0) as total FROM contrat_personnel WHERE actif = true
      `),
            this.dataSource.query(`
        SELECT type_contrat, COUNT(*) as count FROM contrat_personnel 
        WHERE actif = true GROUP BY type_contrat
      `),
            this.congeRepo.count({ where: { statut: 'demande' } }),
        ]);
        return {
            effectifs,
            masseSalarialeMensuelle: parseFloat(masseSalariale[0]?.total || 0),
            repartitionContrats: contratsParType,
            congesEnAttente,
        };
    }
    async getStatsHeuresComplementaires(annee, mois) {
        const result = await this.dataSource.query(`
      SELECT 
        COUNT(*) as nb_enseignants,
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
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(finance_entities_1.ContratPersonnel)),
    __param(1, (0, typeorm_1.InjectRepository)(finance_entities_1.CongePersonnel)),
    __param(2, (0, typeorm_1.InjectRepository)(finance_entities_1.FichePaie)),
    __param(3, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], RHService);
//# sourceMappingURL=rh.service.js.map