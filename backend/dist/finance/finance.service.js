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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const finance_entities_1 = require("./finance.entities");
let FinanceService = class FinanceService {
    constructor(grilleRepo, echeancierRepo, paiementRepo, budgetRepo, depenseRepo, contratRepo, fichePaieRepo, dataSource) {
        this.grilleRepo = grilleRepo;
        this.echeancierRepo = echeancierRepo;
        this.paiementRepo = paiementRepo;
        this.budgetRepo = budgetRepo;
        this.depenseRepo = depenseRepo;
        this.contratRepo = contratRepo;
        this.fichePaieRepo = fichePaieRepo;
        this.dataSource = dataSource;
    }
    async enregistrerPaiement(tid, dto, caissierId) {
        let inscriptionId = dto.inscriptionId;
        let etudiantNom = '';
        if (!inscriptionId && dto.matricule) {
            const result = await this.dataSource.query(`
        SELECT i.id, e.nom, e.prenom
        FROM inscription i
        JOIN etudiant e ON e.id = i.etudiant_id
        WHERE e.matricule = $1
        ORDER BY i.date_inscription DESC
        LIMIT 1
      `, [dto.matricule]);
            if (result.length === 0) {
                throw new common_1.BadRequestException(`Aucune inscription trouvée pour le matricule: ${dto.matricule}`);
            }
            inscriptionId = result[0].id;
            etudiantNom = `${result[0].nom} ${result[0].prenom}`;
        }
        if (!inscriptionId) {
            throw new common_1.BadRequestException('Veuillez fournir soit inscriptionId soit matricule');
        }
        const reference = 'REC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        const paiementData = {
            inscriptionId,
            montant: dto.montant,
            modePaiement: dto.modePaiement,
            echeancierId: dto.echeancierId || null,
            reference,
            statut: 'valide',
            caissierId,
            numeroRecu: reference,
            observations: dto.motif || dto.observations || null,
        };
        const paiement = await this.paiementRepo.save(this.paiementRepo.create(paiementData));
        return {
            paiement,
            etudiantNom,
            recu: {
                numeroRecu: reference,
                date: new Date(),
                montant: dto.montant,
                mode: dto.modePaiement,
                matricule: dto.matricule,
                statut: 'Paye',
                message: 'Recu de paiement - IMTECH UNIVERSITY',
            },
        };
    }
    getPaiementsEtudiant(tid, inscriptionId) {
        return this.paiementRepo.find({ where: { inscriptionId }, order: { createdAt: 'DESC' } });
    }
    async getTousPaiements(tid, date) {
        let dateFilter = '';
        const params = [];
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            dateFilter = 'AND p.date_paiement >= $1 AND p.date_paiement <= $2';
            params.push(start, end);
        }
        const paiements = await this.dataSource.query(`
      SELECT
        p.id,
        p.inscription_id as "inscriptionId",
        p.montant,
        p.mode_paiement as "modePaiement",
        p.date_paiement as "datePaiement",
        p.statut,
        p.numero_recu as "numeroRecu",
        p.reference,
        p.observations,
        p.caissier_id as "caissierId",
        p.recu_url as "recuUrl",
        e.nom as "etudiantNom",
        e.prenom as "etudiantPrenom",
        e.matricule as "etudiantMatricule",
        CONCAT(e.nom, ' ', e.prenom) as "etudiantNomComplet",
        par.nom as "parcoursNom",
        i.annee_niveau as "anneeNiveau"
      FROM paiement p
      LEFT JOIN inscription i ON i.id = p.inscription_id
      LEFT JOIN etudiant e ON e.id = i.etudiant_id
      LEFT JOIN parcours par ON par.id = i.parcours_id
      WHERE 1=1 ${dateFilter}
      ORDER BY p.created_at DESC
    `, params);
        return paiements;
    }
    async getCaisseJournaliere(tid) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const paiementsAvecEtudiant = await this.dataSource.query(`
      SELECT
        p.id,
        p.inscription_id as "inscriptionId",
        p.montant,
        p.mode_paiement as "modePaiement",
        p.date_paiement as "datePaiement",
        p.statut,
        p.numero_recu as "numeroRecu",
        p.reference,
        p.observations,
        e.nom as "etudiantNom",
        e.prenom as "etudiantPrenom",
        e.matricule as "etudiantMatricule",
        CONCAT(e.nom, ' ', e.prenom) as "etudiantNomComplet"
      FROM paiement p
      JOIN inscription i ON i.id = p.inscription_id
      JOIN etudiant e ON e.id = i.etudiant_id
      WHERE p.date_paiement >= $1
        AND p.date_paiement <= $2
        AND p.statut = 'valide'
      ORDER BY p.created_at DESC
    `, [today, endOfDay]);
        const total = paiementsAvecEtudiant.reduce((s, p) => s + Number(p.montant), 0);
        return {
            date: today,
            total,
            nombrePaiements: paiementsAvecEtudiant.length,
            paiements: paiementsAvecEtudiant
        };
    }
    async cloturerCaisse(tid, userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const paiements = await this.paiementRepo.find({
            where: { datePaiement: (0, typeorm_2.Between)(today, endOfDay), statut: 'valide' }
        });
        const total = paiements.reduce((s, p) => s + Number(p.montant), 0);
        return { message: 'Caisse cloturee', date: today, totalCloture: total, nombreTransactions: paiements.length, cloturePar: userId };
    }
    creerGrille(dto) {
        return this.grilleRepo.save(this.grilleRepo.create(dto));
    }
    getGrilles(parcoursId) {
        const where = {};
        if (parcoursId)
            where.parcoursId = parcoursId;
        return this.grilleRepo.find({ where });
    }
    creerBudget(tid, dto) {
        return this.budgetRepo.save(this.budgetRepo.create(dto));
    }
    getBudgets(tid, anneeAcademiqueId) {
        const where = {};
        if (anneeAcademiqueId)
            where.anneeAcademiqueId = anneeAcademiqueId;
        return this.budgetRepo.find({ where });
    }
    async ajouterDepense(tid, dto, demandePar) {
        const depense = await this.depenseRepo.save(this.depenseRepo.create({ ...dto, demandePar, statut: 'en_attente' }));
        if (dto.budgetId) {
            const budget = await this.budgetRepo.findOne({ where: { id: dto.budgetId } });
            if (budget) {
                await this.budgetRepo.save({ ...budget, montantRealise: Number(budget.montantRealise) + Number(dto.montant) });
            }
        }
        return depense;
    }
    getDepenses(tid, anneeAcademiqueId) {
        const where = {};
        if (anneeAcademiqueId)
            where.anneeAcademiqueId = anneeAcademiqueId;
        return this.depenseRepo.find({ where, order: { dateDepense: 'DESC' } });
    }
    async updateBudget(tid, id, dto) {
        const budget = await this.budgetRepo.findOne({ where: { id } });
        if (!budget)
            throw new common_1.NotFoundException('Budget non trouvé');
        return this.budgetRepo.save({ ...budget, ...dto });
    }
    async updateDepense(tid, id, dto) {
        const depense = await this.depenseRepo.findOne({ where: { id } });
        if (!depense)
            throw new common_1.NotFoundException('Dépense non trouvée');
        return this.depenseRepo.save({ ...depense, ...dto });
    }
    async deleteDepense(tid, id) {
        const depense = await this.depenseRepo.findOne({ where: { id } });
        if (!depense)
            throw new common_1.NotFoundException('Dépense non trouvée');
        await this.depenseRepo.delete(id);
        return { message: 'Dépense supprimée avec succès' };
    }
    async updateContrat(tid, id, dto) {
        const contrat = await this.contratRepo.findOne({ where: { id } });
        if (!contrat)
            throw new common_1.NotFoundException('Contrat non trouvé');
        return this.contratRepo.save({ ...contrat, ...dto });
    }
    async getRapportFinancier(tid, anneeAcademiqueId) {
        const paiements = await this.paiementRepo.find({ where: { datePaiement: (0, typeorm_2.Between)(new Date(anneeAcademiqueId), new Date()) } });
        const budgets = await this.budgetRepo.find({ where: { anneeAcademiqueId } });
        const totalRecettes = paiements.reduce((s, p) => s + Number(p.montant), 0);
        const totalBudget = budgets.reduce((s, b) => s + Number(b.montantPrevu), 0);
        const totalDepenses = budgets.reduce((s, b) => s + Number(b.montantRealise), 0);
        return { anneeAcademiqueId, totalRecettes, totalBudget, totalDepenses, solde: totalRecettes - totalDepenses, nbPaiements: paiements.length };
    }
    creerContrat(tid, dto) {
        return this.contratRepo.save(this.contratRepo.create(dto));
    }
    getContrats(tid, utilisateurId) {
        const where = {};
        if (utilisateurId)
            where.utilisateurId = utilisateurId;
        return this.contratRepo.find({ where });
    }
    creerEcheancier(tid, dto) {
        return this.echeancierRepo.save(this.echeancierRepo.create(dto));
    }
    async getEcheanciers(tid, inscriptionId) {
        try {
            let query = `
        SELECT
          ech.*,
          e.nom as etudiant_nom,
          e.prenom as etudiant_prenom,
          e.matricule as etudiant_matricule,
          p.nom as parcours_nom,
          i.annee_niveau,
          aa.libelle as annee_academique,
          CASE
            WHEN ech.statut = 'paye' THEN 'paye'
            WHEN ech.date_echeance < CURRENT_DATE AND ech.statut = 'en_attente' THEN 'en_retard'
            ELSE ech.statut
          END as statut_calcule
        FROM echeancier ech
        JOIN inscription i ON i.id = ech.inscription_id
        JOIN etudiant e ON e.id = i.etudiant_id
        JOIN parcours p ON p.id = i.parcours_id
        JOIN annee_academique aa ON aa.id = i.annee_academique_id
      `;
            if (inscriptionId) {
                query += ` WHERE ech.inscription_id = $1`;
                return await this.dataSource.query(query, [inscriptionId]);
            }
            query += ` ORDER BY ech.date_echeance ASC`;
            return await this.dataSource.query(query);
        }
        catch (error) {
            console.error('Erreur getEcheanciers:', error);
            return [];
        }
    }
    async getInscriptionsActives(tid) {
        try {
            const inscriptions = await this.dataSource.query(`
        SELECT
          i.id,
          i.etudiant_id,
          e.nom,
          e.prenom,
          e.matricule,
          p.nom as parcours_nom,
          i.annee_niveau,
          aa.libelle as annee_academique
        FROM inscription i
        JOIN etudiant e ON e.id = i.etudiant_id
        JOIN parcours p ON p.id = i.parcours_id
        JOIN annee_academique aa ON aa.id = i.annee_academique_id
        WHERE i.statut = 'active'
        ORDER BY e.nom, e.prenom
      `);
            return inscriptions;
        }
        catch (error) {
            console.error('Erreur getInscriptionsActives:', error);
            return [];
        }
    }
    creerFichePaie(dto) {
        return this.fichePaieRepo.save(this.fichePaieRepo.create(dto));
    }
    getFichesPaie(contratId) {
        const where = {};
        if (contratId)
            where.contratId = contratId;
        return this.fichePaieRepo.find({ where });
    }
    async getGrilleTarifaire(tid) {
        try {
            const frais = await this.dataSource.query(`
        SELECT
          gt.*,
          p.code as parcours_code,
          p.nom as parcours_nom,
          d.nom as departement_nom,
          aa.libelle as annee_academique,
          (SELECT COUNT(*) FROM inscription i WHERE i.parcours_id = gt.parcours_id AND i.annee_academique_id = gt.annee_academique_id) as nb_inscriptions,
          (SELECT COALESCE(SUM(pa.montant), 0) FROM paiement pa
           JOIN inscription i ON i.id = pa.inscription_id
           WHERE i.parcours_id = gt.parcours_id AND i.annee_academique_id = gt.annee_academique_id) as total_encaisse
        FROM grille_tarifaire gt
        JOIN parcours p ON p.id = gt.parcours_id
        LEFT JOIN departement d ON d.id = p.departement_id
        JOIN annee_academique aa ON aa.id = gt.annee_academique_id
        ORDER BY aa.date_debut DESC, p.nom ASC
      `);
            return frais;
        }
        catch (error) {
            console.error('Erreur getGrilleTarifaire:', error);
            return [];
        }
    }
    async creerFraisInscription(tid, dto) {
        try {
            const existing = await this.grilleRepo.findOne({
                where: {
                    parcoursId: dto.parcoursId,
                    anneeAcademiqueId: dto.anneeAcademiqueId
                }
            });
            if (existing) {
                throw new common_1.BadRequestException('Des frais existent déjà pour ce parcours et cette année académique');
            }
            const montantTotal = (dto.montantInscription || 0) + (dto.montantScolarite || 0);
            const frais = this.grilleRepo.create({
                parcoursId: dto.parcoursId,
                anneeAcademiqueId: dto.anneeAcademiqueId,
                montantInscription: dto.montantInscription,
                montantScolarite: dto.montantScolarite || 0,
                montantTotal,
                description: dto.description || null,
                dateLimitePaiement: dto.dateLimitePaiement || null,
                modalitesPaiement: dto.modalitesPaiement || {
                    especes: true,
                    cheque: true,
                    virement: true,
                    carte_bancaire: false,
                    echelonnement: false
                },
                actif: true
            });
            await this.grilleRepo.save(frais);
            return { message: 'Frais d\'inscription créés avec succès', frais };
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException)
                throw error;
            console.error('Erreur creerFraisInscription:', error);
            throw new common_1.BadRequestException('Erreur lors de la création des frais d\'inscription');
        }
    }
    async updateFraisInscription(tid, id, dto) {
        try {
            const frais = await this.grilleRepo.findOne({ where: { id } });
            if (!frais) {
                throw new common_1.NotFoundException('Frais d\'inscription non trouvés');
            }
            const montantTotal = (dto.montantInscription || frais.montantInscription) +
                (dto.montantScolarite || frais.montantScolarite || 0);
            Object.assign(frais, {
                montantInscription: dto.montantInscription || frais.montantInscription,
                montantScolarite: dto.montantScolarite || frais.montantScolarite,
                montantTotal,
                description: dto.description !== undefined ? dto.description : frais.description,
                dateLimitePaiement: dto.dateLimitePaiement !== undefined ? dto.dateLimitePaiement : frais.dateLimitePaiement,
                modalitesPaiement: dto.modalitesPaiement || frais.modalitesPaiement
            });
            await this.grilleRepo.save(frais);
            return { message: 'Frais d\'inscription mis à jour avec succès', frais };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            console.error('Erreur updateFraisInscription:', error);
            throw new common_1.BadRequestException('Erreur lors de la mise à jour des frais d\'inscription');
        }
    }
    async deleteFraisInscription(tid, id) {
        try {
            const frais = await this.grilleRepo.findOne({ where: { id } });
            if (!frais) {
                throw new common_1.NotFoundException('Frais d\'inscription non trouvés');
            }
            const inscriptions = await this.dataSource.query(`
        SELECT COUNT(*) as count FROM inscription
        WHERE parcours_id = $1 AND annee_academique_id = $2
      `, [frais.parcoursId, frais.anneeAcademiqueId]);
            if (parseInt(inscriptions[0].count) > 0) {
                throw new common_1.BadRequestException('Impossible de supprimer : des inscriptions utilisent ces frais');
            }
            await this.grilleRepo.delete(id);
            return { message: 'Frais d\'inscription supprimés avec succès' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException)
                throw error;
            console.error('Erreur deleteFraisInscription:', error);
            throw new common_1.BadRequestException('Erreur lors de la suppression des frais d\'inscription');
        }
    }
    async toggleActifFrais(tid, id) {
        try {
            const frais = await this.grilleRepo.findOne({ where: { id } });
            if (!frais) {
                throw new common_1.NotFoundException('Frais d\'inscription non trouvés');
            }
            frais.actif = !frais.actif;
            await this.grilleRepo.save(frais);
            return {
                message: `Frais ${frais.actif ? 'activés' : 'désactivés'} avec succès`,
                frais
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            console.error('Erreur toggleActifFrais:', error);
            throw new common_1.BadRequestException('Erreur lors du changement de statut');
        }
    }
    async getPaiementsInscriptionEnAttente(tid) {
        try {
            const paiements = await this.dataSource.query(`
        SELECT
          pi.*,
          e.nom as etudiant_nom,
          e.prenom as etudiant_prenom,
          e.matricule as etudiant_matricule,
          i.annee_niveau,
          p.nom as parcours_nom,
          aa.libelle as annee_academique
        FROM paiement_inscription pi
        JOIN etudiant e ON e.id = pi.etudiant_id
        JOIN inscription i ON i.id = pi.inscription_id
        JOIN parcours p ON p.id = i.parcours_id
        JOIN annee_academique aa ON aa.id = i.annee_academique_id
        WHERE pi.statut = 'en_attente'
        ORDER BY pi.created_at ASC
      `);
            return paiements;
        }
        catch (error) {
            throw new common_1.BadRequestException('Erreur lors de la récupération des paiements en attente');
        }
    }
    async getTousPaiementsInscription(tid, statut) {
        try {
            let statutFilter = '';
            if (statut) {
                statutFilter = `WHERE pi.statut = '${statut}'`;
            }
            const paiements = await this.dataSource.query(`
        SELECT
          pi.*,
          e.nom as etudiant_nom,
          e.prenom as etudiant_prenom,
          e.matricule as etudiant_matricule,
          i.annee_niveau,
          p.nom as parcours_nom,
          aa.libelle as annee_academique,
          u.nom as validateur_nom,
          u.prenom as validateur_prenom
        FROM paiement_inscription pi
        JOIN etudiant e ON e.id = pi.etudiant_id
        JOIN inscription i ON i.id = pi.inscription_id
        JOIN parcours p ON p.id = i.parcours_id
        JOIN annee_academique aa ON aa.id = i.annee_academique_id
        LEFT JOIN utilisateur u ON u.id = pi.valide_par
        ${statutFilter}
        ORDER BY pi.created_at DESC
      `);
            return paiements;
        }
        catch (error) {
            throw new common_1.BadRequestException('Erreur lors de la récupération des paiements d\'inscription');
        }
    }
    async validerPaiementInscription(tid, paiementId, caissierId, noteValidation) {
        try {
            const paiementResult = await this.dataSource.query(`
        SELECT pi.*, i.etudiant_id, i.id as inscription_id
        FROM paiement_inscription pi
        JOIN inscription i ON i.id = pi.inscription_id
        WHERE pi.id = $1
      `, [paiementId]);
            if (paiementResult.length === 0) {
                throw new common_1.NotFoundException('Paiement non trouvé');
            }
            const paiement = paiementResult[0];
            if (paiement.statut !== 'en_attente') {
                throw new common_1.BadRequestException('Ce paiement a déjà été traité');
            }
            await this.dataSource.query(`
        UPDATE paiement_inscription
        SET statut = 'valide',
            valide_par = $1,
            date_validation = NOW(),
            note_validation = $2,
            updated_at = NOW()
        WHERE id = $3
      `, [caissierId, noteValidation, paiementId]);
            await this.dataSource.query(`
        UPDATE inscription
        SET statut = 'validee',
            updated_at = NOW()
        WHERE id = $1 AND statut = 'en_attente'
      `, [paiement.inscription_id]);
            return {
                message: 'Paiement validé avec succès',
                paiementId,
                inscriptionId: paiement.inscription_id
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Erreur lors de la validation du paiement');
        }
    }
    async rejeterPaiementInscription(tid, paiementId, caissierId, motifRejet) {
        try {
            const paiementResult = await this.dataSource.query(`
        SELECT * FROM paiement_inscription WHERE id = $1
      `, [paiementId]);
            if (paiementResult.length === 0) {
                throw new common_1.NotFoundException('Paiement non trouvé');
            }
            const paiement = paiementResult[0];
            if (paiement.statut !== 'en_attente') {
                throw new common_1.BadRequestException('Ce paiement a déjà été traité');
            }
            await this.dataSource.query(`
        UPDATE paiement_inscription
        SET statut = 'rejete',
            valide_par = $1,
            date_validation = NOW(),
            motif_rejet = $2,
            updated_at = NOW()
        WHERE id = $3
      `, [caissierId, motifRejet, paiementId]);
            return {
                message: 'Paiement rejeté',
                paiementId,
                motifRejet
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException || error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException('Erreur lors du rejet du paiement');
        }
    }
    async getStatistiquesPaiementsInscription(tid) {
        try {
            const stats = await this.dataSource.query(`
        SELECT
          COUNT(*) FILTER (WHERE statut = 'en_attente') as en_attente,
          COUNT(*) FILTER (WHERE statut = 'valide') as valides,
          COUNT(*) FILTER (WHERE statut = 'rejete') as rejetes,
          SUM(montant) FILTER (WHERE statut = 'valide') as total_valide,
          SUM(montant) FILTER (WHERE statut = 'en_attente') as total_en_attente
        FROM paiement_inscription
      `);
            return stats[0] || {
                en_attente: 0,
                valides: 0,
                rejetes: 0,
                total_valide: 0,
                total_en_attente: 0
            };
        }
        catch (error) {
            throw new common_1.BadRequestException('Erreur lors de la récupération des statistiques');
        }
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(finance_entities_1.GrilleTarifaire, 'tenant')),
    __param(1, (0, typeorm_1.InjectRepository)(finance_entities_1.Echeancier, 'tenant')),
    __param(2, (0, typeorm_1.InjectRepository)(finance_entities_1.Paiement, 'tenant')),
    __param(3, (0, typeorm_1.InjectRepository)(finance_entities_1.Budget, 'tenant')),
    __param(4, (0, typeorm_1.InjectRepository)(finance_entities_1.Depense, 'tenant')),
    __param(5, (0, typeorm_1.InjectRepository)(finance_entities_1.ContratPersonnel, 'tenant')),
    __param(6, (0, typeorm_1.InjectRepository)(finance_entities_1.FichePaie, 'tenant')),
    __param(7, (0, typeorm_1.InjectDataSource)('tenant')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], FinanceService);
//# sourceMappingURL=finance.service.js.map