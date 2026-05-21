import { Injectable } from '@nestjs/common';
import { TenantConnectionService } from '../tenants/tenant-connection.service';

export interface RapportFinancier {
  periode: string;
  total_recettes: number;
  total_depenses: number;
  solde: number;
  nb_inscriptions: number;
  nb_depenses: number;
  depenses_par_categorie: Array<{
    categorie: string;
    montant: number;
    nb: number;
  }>;
  recettes_par_parcours: Array<{
    parcours: string;
    montant: number;
    nb: number;
  }>;
}

@Injectable()
export class RapportsService {
  constructor(private tenantConnection: TenantConnectionService) {}

  private async query(sql: string, params: any[] = []): Promise<any> {
    const connection = this.tenantConnection.getConnection();
    if (!connection) {
      throw new Error('No tenant connection available');
    }

    try {
      const result = await connection.query(sql, params);
      return result;
    } catch (error) {
      console.error('[RapportsService] Query error:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  async getRapportMensuel(mois: number, annee: number): Promise<RapportFinancier> {
    // Calcul des recettes (paiements d'inscription)
    const recettesQuery = `
      SELECT COALESCE(SUM(montant_paye), 0) as total
      FROM paiement_inscription
      WHERE EXTRACT(MONTH FROM date_paiement) = $1
        AND EXTRACT(YEAR FROM date_paiement) = $2
        AND statut = 'valide'
    `;
    const recettesResult = await this.query(recettesQuery, [mois, annee]);
    const total_recettes = parseFloat(recettesResult[0]?.total || '0');

    // Calcul des dépenses
    const depensesQuery = `
      SELECT COALESCE(SUM(montant), 0) as total
      FROM depense
      WHERE EXTRACT(MONTH FROM date_depense) = $1
        AND EXTRACT(YEAR FROM date_depense) = $2
        AND statut IN ('approuve', 'paye')
    `;
    const depensesResult = await this.query(depensesQuery, [mois, annee]);
    const total_depenses = parseFloat(depensesResult[0]?.total || '0');

    // Nombre d'inscriptions
    const nbInscriptionsQuery = `
      SELECT COUNT(*) as nb
      FROM paiement_inscription
      WHERE EXTRACT(MONTH FROM date_paiement) = $1
        AND EXTRACT(YEAR FROM date_paiement) = $2
        AND statut = 'valide'
    `;
    const nbInscriptionsResult = await this.query(nbInscriptionsQuery, [mois, annee]);
    const nb_inscriptions = parseInt(nbInscriptionsResult[0]?.nb || '0');

    // Nombre de dépenses
    const nbDepensesQuery = `
      SELECT COUNT(*) as nb
      FROM depense
      WHERE EXTRACT(MONTH FROM date_depense) = $1
        AND EXTRACT(YEAR FROM date_depense) = $2
        AND statut IN ('approuve', 'paye')
    `;
    const nbDepensesResult = await this.query(nbDepensesQuery, [mois, annee]);
    const nb_depenses = parseInt(nbDepensesResult[0]?.nb || '0');

    // Dépenses par catégorie
    const depensesCategorieQuery = `
      SELECT 
        COALESCE(categorie, 'Non catégorisé') as categorie,
        COALESCE(SUM(montant), 0) as montant,
        COUNT(*) as nb
      FROM depense
      WHERE EXTRACT(MONTH FROM date_depense) = $1
        AND EXTRACT(YEAR FROM date_depense) = $2
        AND statut IN ('approuve', 'paye')
      GROUP BY categorie
      ORDER BY montant DESC
    `;
    const depenses_par_categorie = await this.query(depensesCategorieQuery, [mois, annee]);

    // Recettes par parcours
    const recettesParcoursQuery = `
      SELECT 
        p.nom as parcours,
        COALESCE(SUM(pi.montant_paye), 0) as montant,
        COUNT(*) as nb
      FROM paiement_inscription pi
      JOIN inscription i ON pi.inscription_id = i.id
      JOIN parcours p ON i.parcours_id = p.id
      WHERE EXTRACT(MONTH FROM pi.date_paiement) = $1
        AND EXTRACT(YEAR FROM pi.date_paiement) = $2
        AND pi.statut = 'valide'
      GROUP BY p.nom
      ORDER BY montant DESC
    `;
    const recettes_par_parcours = await this.query(recettesParcoursQuery, [mois, annee]);

    const moisNoms = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    return {
      periode: `${moisNoms[mois - 1]} ${annee}`,
      total_recettes,
      total_depenses,
      solde: total_recettes - total_depenses,
      nb_inscriptions,
      nb_depenses,
      depenses_par_categorie: depenses_par_categorie.map((d: any) => ({
        categorie: d.categorie,
        montant: parseFloat(d.montant),
        nb: parseInt(d.nb),
      })),
      recettes_par_parcours: recettes_par_parcours.map((r: any) => ({
        parcours: r.parcours,
        montant: parseFloat(r.montant),
        nb: parseInt(r.nb),
      })),
    };
  }

  async getRapportAnnuel(annee: number): Promise<RapportFinancier> {
    // Calcul des recettes (paiements d'inscription)
    const recettesQuery = `
      SELECT COALESCE(SUM(montant_paye), 0) as total
      FROM paiement_inscription
      WHERE EXTRACT(YEAR FROM date_paiement) = $1
        AND statut = 'valide'
    `;
    const recettesResult = await this.query(recettesQuery, [annee]);
    const total_recettes = parseFloat(recettesResult[0]?.total || '0');

    // Calcul des dépenses
    const depensesQuery = `
      SELECT COALESCE(SUM(montant), 0) as total
      FROM depense
      WHERE EXTRACT(YEAR FROM date_depense) = $1
        AND statut IN ('approuve', 'paye')
    `;
    const depensesResult = await this.query(depensesQuery, [annee]);
    const total_depenses = parseFloat(depensesResult[0]?.total || '0');

    // Nombre d'inscriptions
    const nbInscriptionsQuery = `
      SELECT COUNT(*) as nb
      FROM paiement_inscription
      WHERE EXTRACT(YEAR FROM date_paiement) = $1
        AND statut = 'valide'
    `;
    const nbInscriptionsResult = await this.query(nbInscriptionsQuery, [annee]);
    const nb_inscriptions = parseInt(nbInscriptionsResult[0]?.nb || '0');

    // Nombre de dépenses
    const nbDepensesQuery = `
      SELECT COUNT(*) as nb
      FROM depense
      WHERE EXTRACT(YEAR FROM date_depense) = $1
        AND statut IN ('approuve', 'paye')
    `;
    const nbDepensesResult = await this.query(nbDepensesQuery, [annee]);
    const nb_depenses = parseInt(nbDepensesResult[0]?.nb || '0');

    // Dépenses par catégorie
    const depensesCategorieQuery = `
      SELECT 
        COALESCE(categorie, 'Non catégorisé') as categorie,
        COALESCE(SUM(montant), 0) as montant,
        COUNT(*) as nb
      FROM depense
      WHERE EXTRACT(YEAR FROM date_depense) = $1
        AND statut IN ('approuve', 'paye')
      GROUP BY categorie
      ORDER BY montant DESC
    `;
    const depenses_par_categorie = await this.query(depensesCategorieQuery, [annee]);

    // Recettes par parcours
    const recettesParcoursQuery = `
      SELECT 
        p.nom as parcours,
        COALESCE(SUM(pi.montant_paye), 0) as montant,
        COUNT(*) as nb
      FROM paiement_inscription pi
      JOIN inscription i ON pi.inscription_id = i.id
      JOIN parcours p ON i.parcours_id = p.id
      WHERE EXTRACT(YEAR FROM pi.date_paiement) = $1
        AND pi.statut = 'valide'
      GROUP BY p.nom
      ORDER BY montant DESC
    `;
    const recettes_par_parcours = await this.query(recettesParcoursQuery, [annee]);

    return {
      periode: `Année ${annee}`,
      total_recettes,
      total_depenses,
      solde: total_recettes - total_depenses,
      nb_inscriptions,
      nb_depenses,
      depenses_par_categorie: depenses_par_categorie.map((d: any) => ({
        categorie: d.categorie,
        montant: parseFloat(d.montant),
        nb: parseInt(d.nb),
      })),
      recettes_par_parcours: recettes_par_parcours.map((r: any) => ({
        parcours: r.parcours,
        montant: parseFloat(r.montant),
        nb: parseInt(r.nb),
      })),
    };
  }
}

// Made with Bob
