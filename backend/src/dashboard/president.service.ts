import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PresidentDashboardService {
  private readonly logger = new Logger(PresidentDashboardService.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getKPI(anneeAcademiqueId?: string): Promise<any> {
    const whereAnnee = anneeAcademiqueId ? `WHERE annee_academique_id = '${anneeAcademiqueId}'` : '';
    
    const [
      totalEtudiants,
      etudiantsInscrits,
      totalEnseignants,
      totalPersonnel,
    ] = await Promise.all([
      this.dataSource.query(`SELECT COUNT(*) as count FROM etudiant WHERE actif = true`),
      this.dataSource.query(`
        SELECT COUNT(*) as count FROM inscription i
        JOIN annee_academique aa ON aa.id = i.annee_academique_id
        WHERE aa.active = true AND i.statut = 'validee'
      `),
      this.dataSource.query(`SELECT COUNT(*) as count FROM utilisateur WHERE role = 'professeur' AND actif = true`),
      this.dataSource.query(`SELECT COUNT(*) as count FROM utilisateur WHERE role NOT IN ('etudiant', 'parent', 'professeur') AND actif = true`),
    ]);

    // Recettes de l'année
    const recettes = await this.dataSource.query(`
      SELECT COALESCE(SUM(p.montant), 0) as total
      FROM paiement p
      JOIN inscription i ON p.inscription_id = i.id
      JOIN annee_academique aa ON aa.id = i.annee_academique_id
      WHERE aa.active = true AND p.statut = 'valide'
    `);

    // Dépenses du mois
    const depenses = await this.dataSource.query(`
      SELECT COALESCE(SUM(montant), 0) as total
      FROM depense
      WHERE statut = 'paye' AND date_depense >= DATE_TRUNC('month', NOW())
    `);

    return {
      effectifs: {
        totalEtudiants: parseInt(totalEtudiants[0].count),
        etudiantsInscrits: parseInt(etudiantsInscrits[0].count),
        totalEnseignants: parseInt(totalEnseignants[0].count),
        totalPersonnel: parseInt(totalPersonnel[0].count),
      },
      finances: {
        recettesAnnee: parseFloat(recettes[0].total),
        depensesMois: parseFloat(depenses[0].total),
        solde: parseFloat(recettes[0].total) - parseFloat(depenses[0].total),
      },
    };
  }

  async getStatsEtudiants(anneeAcademiqueId?: string): Promise<any> {
    const anneeFilter = anneeAcademiqueId 
      ? `WHERE i.annee_academique_id = '${anneeAcademiqueId}'` 
      : `JOIN annee_academique aa ON aa.id = i.annee_academique_id WHERE aa.active = true`;

    const [nouveaux, redoublants, boursiers] = await Promise.all([
      this.dataSource.query(`
        SELECT COUNT(*) as count FROM inscription i ${anneeFilter.replace('WHERE', 'WHERE i.')} AND i.type_inscription = 'premiere'
      `),
      this.dataSource.query(`
        SELECT COUNT(*) as count FROM inscription i ${anneeFilter.replace('WHERE', 'WHERE i.')} AND i.type_inscription = 'redoublement'
      `),
      this.dataSource.query(`
        SELECT COUNT(*) as count FROM inscription i ${anneeFilter.replace('WHERE', 'WHERE i.')} AND i.bourse = true
      `),
    ]);

    return {
      nouveaux: parseInt(nouveaux[0].count),
      redoublants: parseInt(redoublants[0].count),
      boursiers: parseInt(boursiers[0].count),
    };
  }

  async getStatsFinancieres(anneeAcademiqueId?: string): Promise<any> {
    const anneeFilter = anneeAcademiqueId 
      ? `AND i.annee_academique_id = '${anneeAcademiqueId}'` 
      : `AND aa.active = true`;

    const [paiementsParMois, impayes, parMode] = await Promise.all([
      this.dataSource.query(`
        SELECT 
          TO_CHAR(p.date_paiement, 'YYYY-MM') as mois,
          SUM(p.montant) as total,
          COUNT(*) as nb_transactions
        FROM paiement p
        JOIN inscription i ON i.id = p.inscription_id
        JOIN annee_academique aa ON aa.id = i.annee_academique_id
        WHERE p.statut = 'valide' ${anneeFilter}
        GROUP BY TO_CHAR(p.date_paiement, 'YYYY-MM')
        ORDER BY mois DESC
        LIMIT 6
      `),
      this.dataSource.query(`
        SELECT 
          COUNT(*) as nb_impayes,
          SUM(gt.montant_total - COALESCE(payes.montant_paye, 0)) as montant_impaye
        FROM inscription i
        JOIN grille_tarifaire gt ON gt.parcours_id = i.parcours_id AND gt.annee_academique_id = i.annee_academique_id
        LEFT JOIN (
          SELECT inscription_id, SUM(montant) as montant_paye
          FROM paiement WHERE statut = 'valide' GROUP BY inscription_id
        ) payes ON payes.inscription_id = i.id
        JOIN annee_academique aa ON aa.id = i.annee_academique_id
        WHERE i.statut = 'validee' ${anneeFilter}
        AND gt.montant_total > COALESCE(payes.montant_paye, 0)
      `),
      this.dataSource.query(`
        SELECT mode_paiement, SUM(montant) as total, COUNT(*) as nb
        FROM paiement p
        JOIN inscription i ON i.id = p.inscription_id
        JOIN annee_academique aa ON aa.id = i.annee_academique_id
        WHERE p.statut = 'valide' ${anneeFilter}
        GROUP BY mode_paiement
      `),
    ]);

    return {
      paiementsParMois,
      impayes: impayes[0],
      repartitionParMode: parMode,
    };
  }

  async getStatsAcademiques(sessionId?: string): Promise<any> {
    const whereSession = sessionId ? `WHERE n.session_id = '${sessionId}'` : '';

    const [moyennes, tauxReussite, mentions] = await Promise.all([
      this.dataSource.query(`
        SELECT 
          ROUND(AVG(n.valeur), 2) as moyenne_generale,
          MIN(n.valeur) as note_min,
          MAX(n.valeur) as note_max
        FROM note n
        ${whereSession}
      `),
      this.dataSource.query(`
        SELECT 
          ROUND(100.0 * COUNT(CASE WHEN n.valeur >= 10 THEN 1 END) / NULLIF(COUNT(*), 0), 2) as taux_reussite
        FROM note n
        ${whereSession}
      `),
      this.dataSource.query(`
        SELECT 
          CASE 
            WHEN valeur >= 16 THEN 'tres_bien'
            WHEN valeur >= 14 THEN 'bien'
            WHEN valeur >= 12 THEN 'assez_bien'
            WHEN valeur >= 10 THEN 'passable'
            ELSE 'ajourne'
          END as mention,
          COUNT(*) as count
        FROM note n
        ${whereSession}
        GROUP BY 
          CASE 
            WHEN valeur >= 16 THEN 'tres_bien'
            WHEN valeur >= 14 THEN 'bien'
            WHEN valeur >= 12 THEN 'assez_bien'
            WHEN valeur >= 10 THEN 'passable'
            ELSE 'ajourne'
          END
      `),
    ]);

    return {
      moyennes: moyennes[0],
      tauxReussite: parseFloat(tauxReussite[0]?.taux_reussite || 0),
      repartitionMentions: mentions,
    };
  }

  async getActiviteRecente(): Promise<any> {
    const [dernieresInscriptions, derniersPaiements, incidentsRecents] = await Promise.all([
      this.dataSource.query(`
        SELECT i.id, e.nom, e.prenom, p.nom as parcours, i.date_inscription
        FROM inscription i
        JOIN etudiant e ON e.id = i.etudiant_id
        JOIN parcours p ON p.id = i.parcours_id
        ORDER BY i.date_inscription DESC
        LIMIT 5
      `),
      this.dataSource.query(`
        SELECT p.id, e.nom, e.prenom, p.montant, p.date_paiement
        FROM paiement p
        JOIN inscription i ON i.id = p.inscription_id
        JOIN etudiant e ON e.id = i.etudiant_id
        WHERE p.statut = 'valide'
        ORDER BY p.date_paiement DESC
        LIMIT 5
      `),
      this.dataSource.query(`
        SELECT id, gravite, description, date_incident
        FROM incident
        WHERE statut = 'en_attente'
        ORDER BY date_incident DESC
        LIMIT 5
      `),
    ]);

    return {
      dernieresInscriptions,
      derniersPaiements,
      incidentsRecents,
    };
  }

  async getAlertes(): Promise<any> {
    const [incidentsEnAttente, paiementsEnRetard, stockBas, congesEnAttente] = await Promise.all([
      this.dataSource.query(`SELECT COUNT(*) as count FROM incident WHERE statut = 'en_attente'`),
      this.dataSource.query(`
        SELECT COUNT(*) as count 
        FROM echeancier e
        WHERE e.statut = 'en_retard' AND e.date_echeance < NOW()
      `),
      this.dataSource.query(`
        SELECT COUNT(*) as count FROM stock WHERE quantite_stock <= seuil_alerte
      `),
      this.dataSource.query(`
        SELECT COUNT(*) as count FROM conge_personnel WHERE statut = 'demande'
      `),
    ]);

    return {
      incidents: parseInt(incidentsEnAttente[0].count),
      paiementsRetard: parseInt(paiementsEnRetard[0].count),
      stockBas: parseInt(stockBas[0].count),
      congesEnAttente: parseInt(congesEnAttente[0].count),
    };
  }

  async getRepartitionParParcours(anneeAcademiqueId?: string): Promise<any> {
    const anneeFilter = anneeAcademiqueId 
      ? `AND i.annee_academique_id = '${anneeAcademiqueId}'` 
      : `AND aa.active = true`;

    return this.dataSource.query(`
      SELECT 
        p.code,
        p.nom,
        COUNT(i.id) as nb_inscrits,
        d.nom as departement
      FROM parcours p
      LEFT JOIN inscription i ON i.parcours_id = p.id AND i.statut = 'validee' ${anneeFilter}
      LEFT JOIN annee_academique aa ON aa.id = i.annee_academique_id
      JOIN departement d ON d.id = p.departement_id
      WHERE p.actif = true
      GROUP BY p.id, p.code, p.nom, d.nom
      ORDER BY nb_inscrits DESC
    `);
  }
}
