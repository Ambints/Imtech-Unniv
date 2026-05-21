import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class EnseignantAffectationService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}
  /**
   * Récupère l'ID enseignant à partir de l'ID utilisateur
   */
  async getEnseignantIdByUserId(utilisateurId: number): Promise<number | null> {
    const result = await this.dataSource.query(
      'SELECT id FROM enseignant WHERE utilisateur_id = $1',
      [utilisateurId],
    );
    return result.length > 0 ? result[0].id : null;
  }


  /**
   * Vérifier si un enseignant a un contrat actif
   */
  async checkEnseignantHasActiveContract(enseignantId: string): Promise<{
    hasContract: boolean;
    contractDetails?: any;
    message: string;
  }> {
    const query = `
      SELECT 
        e.id as enseignant_id,
        e.matricule,
        e.nom,
        e.prenom,
        cp.id as contrat_id,
        cp.type_contrat,
        cp.poste,
        cp.date_debut,
        cp.date_fin,
        cp.actif as contrat_actif
      FROM enseignant e
      LEFT JOIN contrat_personnel cp ON cp.utilisateur_id = e.utilisateur_id
        AND cp.actif = TRUE
        AND cp.date_debut <= CURRENT_DATE
        AND (cp.date_fin IS NULL OR cp.date_fin >= CURRENT_DATE)
      WHERE e.id = $1
      LIMIT 1
    `;

    const result = await this.dataSource.query(query, [enseignantId]);

    if (result.length === 0) {
      throw new NotFoundException('Enseignant non trouvé');
    }

    const enseignant = result[0];
    const hasContract = enseignant.contrat_id !== null;

    return {
      hasContract,
      contractDetails: hasContract ? {
        contratId: enseignant.contrat_id,
        typeContrat: enseignant.type_contrat,
        poste: enseignant.poste,
        dateDebut: enseignant.date_debut,
        dateFin: enseignant.date_fin,
      } : null,
      message: hasContract
        ? 'L\'enseignant possède un contrat actif'
        : 'L\'enseignant n\'a pas de contrat actif. Il ne peut pas être affecté à une UE.',
    };
  }

  /**
   * Récupérer les enseignants sans affectation
   */
  async getEnseignantsSansAffectation(): Promise<any[]> {
    const query = `
      SELECT * FROM vue_enseignants_sans_affectation
      ORDER BY nom, prenom
    `;

    return await this.dataSource.query(query);
  }

  /**
   * Récupérer les statistiques d'affectation d'un enseignant
   */
  async getStatistiquesAffectation(enseignantId?: string): Promise<any[]> {
    let query = `
      SELECT * FROM vue_statistiques_affectation_enseignant
    `;

    if (enseignantId) {
      query += ` WHERE enseignant_id = $1`;
      return await this.dataSource.query(query, [enseignantId]);
    }

    return await this.dataSource.query(query);
  }

  /**
   * Récupérer les affectations UE avec détails
   */
  async getAffectationsUEDetails(filters?: {
    enseignantId?: string;
    parcours?: string;
    anneeAcademique?: string;
  }): Promise<any[]> {
    let query = `
      SELECT * FROM vue_affectations_ue_details
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.enseignantId) {
      query += ` AND enseignant_id = $${paramIndex}`;
      params.push(filters.enseignantId);
      paramIndex++;
    }

    if (filters?.parcours) {
      query += ` AND parcours_code = $${paramIndex}`;
      params.push(filters.parcours);
      paramIndex++;
    }

    if (filters?.anneeAcademique) {
      query += ` AND annee_academique = $${paramIndex}`;
      params.push(filters.anneeAcademique);
      paramIndex++;
    }

    query += ` ORDER BY annee_academique DESC, parcours_code, ue_code`;

    return await this.dataSource.query(query, params);
  }

  /**
   * Vérifier si une UE est déjà affectée
   */
  async checkUEAlreadyAffected(
    ueId: string,
    anneeAcademiqueId: string,
    excludeAffectationId?: string,
  ): Promise<{
    isAffected: boolean;
    affectation?: any;
    message: string;
  }> {
    let query = `
      SELECT 
        ac.id as affectation_id,
        e.id as enseignant_id,
        e.matricule,
        e.nom || ' ' || e.prenom as enseignant_nom,
        ue.code as ue_code,
        ue.intitule as ue_intitule
      FROM affectation_cours ac
      JOIN enseignant e ON ac.enseignant_id = e.id
      JOIN unite_enseignement ue ON ac.ue_id = ue.id
      WHERE ac.ue_id = $1
        AND ac.annee_academique_id = $2
    `;

    const params: any[] = [ueId, anneeAcademiqueId];

    if (excludeAffectationId) {
      query += ` AND ac.id != $3`;
      params.push(excludeAffectationId);
    }

    query += ` LIMIT 1`;

    const result = await this.dataSource.query(query, params);

    if (result.length > 0) {
      const affectation = result[0];
      return {
        isAffected: true,
        affectation: {
          affectationId: affectation.affectation_id,
          enseignantId: affectation.enseignant_id,
          enseignantMatricule: affectation.matricule,
          enseignantNom: affectation.enseignant_nom,
          ueCode: affectation.ue_code,
          ueIntitule: affectation.ue_intitule,
        },
        message: `Cette UE est déjà affectée à ${affectation.enseignant_nom}`,
      };
    }

    return {
      isAffected: false,
      message: 'Cette UE n\'est pas encore affectée',
    };
  }

  /**
   * Valider une affectation avant création/modification
   */
  async validateAffectation(data: {
    enseignantId: string;
    ueId?: string;
    ecId?: string;
    anneeAcademiqueId: string;
    affectationId?: string;
  }): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Vérifier que l'enseignant a un contrat actif
    try {
      const contractCheck = await this.checkEnseignantHasActiveContract(data.enseignantId);
      if (!contractCheck.hasContract) {
        errors.push(contractCheck.message);
      }
    } catch (error) {
      errors.push('Enseignant non trouvé');
    }

    // 2. Si c'est une UE, vérifier qu'elle n'est pas déjà affectée
    if (data.ueId) {
      const ueCheck = await this.checkUEAlreadyAffected(
        data.ueId,
        data.anneeAcademiqueId,
        data.affectationId,
      );
      if (ueCheck.isAffected) {
        errors.push(ueCheck.message);
      }
    }

    // 3. Vérifier que l'enseignant n'a pas trop d'affectations (warning)
    const stats = await this.getStatistiquesAffectation(data.enseignantId);
    if (stats.length > 0) {
      const stat = stats[0];
      if (stat.nb_ue_affectees >= 5) {
        warnings.push(
          `Cet enseignant a déjà ${stat.nb_ue_affectees} UE affectées. Vérifiez sa charge de travail.`,
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Obtenir le statut d'affectation d'un enseignant (pour son portail)
   */
  async getEnseignantAffectationStatus(enseignantId: string): Promise<{
    hasAffectation: boolean;
    hasActiveContract: boolean;
    affectations: any[];
    statistics: any;
    message: string;
  }> {
    // Vérifier le contrat
    const contractCheck = await this.checkEnseignantHasActiveContract(enseignantId);

    // Récupérer les statistiques
    const stats = await this.getStatistiquesAffectation(enseignantId);
    const statistics = stats.length > 0 ? stats[0] : null;

    // Récupérer les affectations détaillées
    const affectations = await this.getAffectationsUEDetails({ enseignantId });

    const hasAffectation = affectations.length > 0;

    let message = '';
    if (!contractCheck.hasContract) {
      message = 'Vous n\'avez pas de contrat actif. Veuillez contacter le service RH.';
    } else if (!hasAffectation) {
      message = 'Vous n\'êtes pas affecté à un parcours. Veuillez contacter le responsable pédagogique.';
    } else {
      message = `Vous êtes affecté à ${affectations.length} UE.`;
    }

    return {
      hasAffectation,
      hasActiveContract: contractCheck.hasContract,
      affectations,
      statistics,
      message,
    };
  }
}

// Made with Bob
