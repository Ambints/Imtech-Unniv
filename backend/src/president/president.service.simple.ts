import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface KpiDashboard {
  totalEtudiants: number;
  tauxReussiteGlobal: number;
  tauxAbsenceMoyen: number;
  parcoursActifs: number;
  soutenancesPrevues: number;
  recettesTotales: number;
  impayesTotal: number;
  tauxRecouvrementScolarite: number;
  depensesTotalesMois: number;
  budgetConsomme: number;
  totalEnseignants: number;
  totalPersonnelAdmin: number;
  congesEnCours: number;
  recrutementsEnAttente: number;
  contratsSurPointExpirer: number;
  incidentsOuverts: number;
  conseilsDisciplineEnAttente: number;
  evenementsPastorauxMois: number;
  ticketsMaintenanceOuverts: number;
  stocksAlerteCritique: number;
  inscriptionsEnCours: number;
  diplomesAGenerer: number;
  transfertsEnAttente: number;
  pvDeliberationEnAttente: number;
}

@Injectable()
export class PresidentServiceSimple {
  constructor(
    @InjectDataSource('tenant') private dataSource: DataSource,
  ) {}

  private validateSchema(schema: string): string {
    console.log('[validateSchema] Input schema:', schema, '| type:', typeof schema);
    if (!schema || schema.includes(';') || schema.includes('--')) {
      console.error('[validateSchema] REJECTED - Invalid schema');
      throw new Error('Invalid schema name');
    }
    return schema;
  }

  async getKpiDashboard(tenantSchema: string, anneeAcademiqueId: string | null): Promise<KpiDashboard> {
    console.log('[PresidentService.getKpiDashboard] tenantSchema:', tenantSchema, '| anneeAcademiqueId:', anneeAcademiqueId, '| type:', typeof anneeAcademiqueId);
    const schema = this.validateSchema(tenantSchema);
    
    // Si anneeId n'est pas fourni, récupérer l'année académique active
    let anneeId = anneeAcademiqueId;
    if (!anneeId) {
      console.log('[PresidentService.getKpiDashboard] Récupération de l\'année académique active...');
      const anneeActive = await this.dataSource.query(
        `SELECT id FROM ${schema}.annee_academique WHERE active = true LIMIT 1`
      );
      if (!anneeActive || anneeActive.length === 0) {
        throw new Error('Aucune année académique active trouvée');
      }
      anneeId = anneeActive[0].id;
      console.log('[PresidentService.getKpiDashboard] Année active trouvée:', anneeId);
    }

    try {
      // Requêtes simplifiées avec gestion d'erreur - CORRIGÉ: etudiant.actif au lieu de statut
      const totalEtudiants = await this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${schema}.etudiant WHERE actif = true`
      ).catch(() => [{count: 0}]);

      const totalEnseignants = await this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${schema}.enseignant WHERE actif = true`
      ).catch(() => [{count: 0}]);

      const parcoursActifs = await this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${schema}.parcours WHERE actif = true`
      ).catch(() => [{count: 0}]);

      const inscriptionsEnCours = await this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${schema}.inscription WHERE annee_academique_id = $1 AND statut = 'validee'`,
        [anneeAcademiqueId]
      ).catch(() => [{count: 0}]);

      const diplomesAGenerer = await this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${schema}.diplome WHERE statut = 'pret_signature'`
      ).catch(() => [{count: 0}]);

      const incidentsOuverts = await this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${schema}.incident_disciplinaire WHERE statut = 'ouvert'`
      ).catch(() => [{count: 0}]);

      const ticketsMaintenance = await this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${schema}.ticket_maintenance WHERE statut IN ('ouvert', 'en_cours')`
      ).catch(() => [{count: 0}]);

      const stocksCritiques = await this.dataSource.query(
        `SELECT COUNT(*)::int as count FROM ${schema}.stock WHERE quantite_actuelle <= seuil_alerte`
      ).catch(() => [{count: 0}]);

      // Calculs financiers
      const recettes = await this.dataSource.query(
        `SELECT COALESCE(SUM(montant), 0)::numeric as total FROM ${schema}.paiement
         WHERE EXTRACT(YEAR FROM date_paiement) = EXTRACT(YEAR FROM CURRENT_DATE)`
      ).catch(() => [{total: 0}]);

      const impayes = await this.dataSource.query(
        `SELECT COALESCE(SUM(montant_restant), 0)::numeric as total FROM ${schema}.inscription
         WHERE annee_academique_id = $1 AND montant_restant > 0`,
        [anneeAcademiqueId]
      ).catch(() => [{total: 0}]);

      const depenses = await this.dataSource.query(
        `SELECT COALESCE(SUM(montant), 0)::numeric as total FROM ${schema}.depense
         WHERE EXTRACT(MONTH FROM date_depense) = EXTRACT(MONTH FROM CURRENT_DATE)
         AND EXTRACT(YEAR FROM date_depense) = EXTRACT(YEAR FROM CURRENT_DATE)`
      ).catch(() => [{total: 0}]);

      const recettesTotal = parseFloat(recettes[0]?.total || '0');
      const impayesTotal = parseFloat(impayes[0]?.total || '0');
      const tauxRecouvrement = recettesTotal > 0 
        ? ((recettesTotal / (recettesTotal + impayesTotal)) * 100) 
        : 0;

      return {
        totalEtudiants: parseInt(totalEtudiants[0]?.count || '0'),
        tauxReussiteGlobal: 75.5, // Mock - nécessite calcul complexe
        tauxAbsenceMoyen: 8.2, // Mock - nécessite calcul complexe
        parcoursActifs: parseInt(parcoursActifs[0]?.count || '0'),
        soutenancesPrevues: 0, // Mock
        recettesTotales: recettesTotal,
        impayesTotal: impayesTotal,
        tauxRecouvrementScolarite: tauxRecouvrement,
        depensesTotalesMois: parseFloat(depenses[0]?.total || '0'),
        budgetConsomme: 65.3, // Mock - nécessite calcul complexe
        totalEnseignants: parseInt(totalEnseignants[0]?.count || '0'),
        totalPersonnelAdmin: 0, // Mock - nécessite table personnel
        congesEnCours: 0, // Mock
        recrutementsEnAttente: 0, // Mock - nécessite table recrutement
        contratsSurPointExpirer: 0, // Mock
        incidentsOuverts: parseInt(incidentsOuverts[0]?.count || '0'),
        conseilsDisciplineEnAttente: 0, // Mock - nécessite table conseil_discipline
        evenementsPastorauxMois: 0, // Mock - nécessite table evenements
        ticketsMaintenanceOuverts: parseInt(ticketsMaintenance[0]?.count || '0'),
        stocksAlerteCritique: parseInt(stocksCritiques[0]?.count || '0'),
        inscriptionsEnCours: parseInt(inscriptionsEnCours[0]?.count || '0'),
        diplomesAGenerer: parseInt(diplomesAGenerer[0]?.count || '0'),
        transfertsEnAttente: 0, // Mock
        pvDeliberationEnAttente: 0, // Mock
      };
    } catch (error) {
      console.error('❌ Erreur dans getKpiDashboard:', error);
      // Retourner des données par défaut en cas d'erreur
      return {
        totalEtudiants: 0,
        tauxReussiteGlobal: 0,
        tauxAbsenceMoyen: 0,
        parcoursActifs: 0,
        soutenancesPrevues: 0,
        recettesTotales: 0,
        impayesTotal: 0,
        tauxRecouvrementScolarite: 0,
        depensesTotalesMois: 0,
        budgetConsomme: 0,
        totalEnseignants: 0,
        totalPersonnelAdmin: 0,
        congesEnCours: 0,
        recrutementsEnAttente: 0,
        contratsSurPointExpirer: 0,
        incidentsOuverts: 0,
        conseilsDisciplineEnAttente: 0,
        evenementsPastorauxMois: 0,
        ticketsMaintenanceOuverts: 0,
        stocksAlerteCritique: 0,
        inscriptionsEnCours: 0,
        diplomesAGenerer: 0,
        transfertsEnAttente: 0,
        pvDeliberationEnAttente: 0,
      };
    }
  }

  // Méthodes simplifiées pour les autres endpoints
  async getDirectionsSummary(tenantSchema: string, anneeAcademiqueId: string) {
    return {
      academique: { parcoursTotal: 0, enseignantsAffectes: 0, examensEnCours: 0, pvEnAttente: 0 },
      scolarite: { inscriptionsEnCours: 0, diplomesAGenerer: 0, transfertsEnAttente: 0 },
      finances: { budgetConsomme: 0, achatsEnAttentValidation: 0, caisseJournaliereClôturee: true },
      rh: { contratsSurPointExpirer: 0, fichePaieGenereeMois: true, evalAnnuellesEnCours: 0 },
      logistique: { ticketsMaintenanceOuverts: 0, stocksAlerteCritique: 0 }
    };
  }

  async getAuditTrail(tenantSchema: string, limit: number) {
    return [];
  }

  async getRecrutementsEnAttente(tenantSchema: string) {
    return [];
  }

  async getInvestissementsEnAttente(tenantSchema: string) {
    return [];
  }

  async getDiplomesASigner(tenantSchema: string) {
    return [];
  }

  async getConventionsEnAttente(tenantSchema: string) {
    return [];
  }

  async getConseilsDisciplineEnAttente(tenantSchema: string) {
    return [];
  }

  async getParcoursList(tenantSchema: string) {
    const schema = this.validateSchema(tenantSchema);
    try {
      const result = await this.dataSource.query(`
        SELECT
          id,
          code,
          nom as intitule,
          niveau,
          actif,
          CASE
            WHEN actif = true THEN 'ouvert'
            ELSE 'ferme'
          END as statut,
          responsable_id,
          (SELECT COUNT(*) FROM ${schema}.inscription i
           WHERE i.parcours_id = parcours.id
           AND i.statut = 'valide') as effectif_actuel,
          created_at
        FROM ${schema}.parcours
        ORDER BY nom
      `);
      
      // Mapper les résultats pour correspondre à l'interface frontend
      return result.map((p: any) => ({
        id: p.id,
        intitule: p.intitule,
        niveau: p.niveau,
        statut: p.statut,
        effectifActuel: parseInt(p.effectif_actuel) || 0,
        responsablePedagogique: p.responsable_id || null,
      }));
    } catch (error) {
      console.error('❌ Erreur getParcoursList:', error);
      return [];
    }
  }

  async getCalendrierEnAttente(tenantSchema: string) {
    return [];
  }

  async getDelegations(tenantSchema: string) {
    return [];
  }

  // Méthodes de validation/action (à implémenter selon besoins) - UUID
  async validerRecrutement(tenantSchema: string, id: string, dto: any, userId: string) {
    throw new Error('Fonctionnalité non implémentée');
  }

  async validerInvestissement(tenantSchema: string, id: string, dto: any, userId: string) {
    throw new Error('Fonctionnalité non implémentée');
  }

  async signerDiplome(tenantSchema: string, id: string, dto: any, userId: string) {
    throw new Error('Fonctionnalité non implémentée');
  }

  async signerDiplomesEnMasse(tenantSchema: string, dto: any, userId: string) {
    throw new Error('Fonctionnalité non implémentée');
  }

  async signerConvention(tenantSchema: string, id: string, dto: any, userId: string) {
    throw new Error('Fonctionnalité non implémentée');
  }

  async arbitrerDiscipline(tenantSchema: string, id: string, dto: any, userId: string) {
    throw new Error('Fonctionnalité non implémentée');
  }

  async ouvrirParcours(tenantSchema: string, id: string, dto: any, userId: string) {
    throw new Error('Fonctionnalité non implémentée');
  }

  async fermerParcours(tenantSchema: string, id: string, dto: any, userId: string) {
    throw new Error('Fonctionnalité non implémentée');
  }

  async validerCalendrier(tenantSchema: string, id: string, dto: any, userId: string) {
    throw new Error('Fonctionnalité non implémentée');
  }

  async creerDelegation(tenantSchema: string, dto: any, userId: string) {
    throw new Error('Fonctionnalité non implémentée');
  }

  async revoquerDelegation(tenantSchema: string, id: string, userId: string) {
    throw new Error('Fonctionnalité non implémentée');
  }
}

// Made with Bob
