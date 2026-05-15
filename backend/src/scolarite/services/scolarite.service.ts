import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Etudiant } from '../entities/etudiant.entity';
import { Inscription } from '../entities/inscription.entity';
import { Deliberation } from '../entities/deliberation.entity';
import { Diplome } from '../entities/diplome.entity';
import { VerrouillageNotes } from '../entities/verrouillage-notes.entity';

@Injectable()
export class ScolariteService {
  constructor(
    @InjectRepository(Etudiant, 'tenant')
    private readonly etudiantRepo: Repository<Etudiant>,
    @InjectRepository(Inscription, 'tenant')
    private readonly inscriptionRepo: Repository<Inscription>,
    @InjectRepository(Deliberation, 'tenant')
    private readonly deliberationRepo: Repository<Deliberation>,
    @InjectRepository(Diplome, 'tenant')
    private readonly diplomeRepo: Repository<Diplome>,
    @InjectRepository(VerrouillageNotes, 'tenant')
    private readonly verrouillageRepo: Repository<VerrouillageNotes>,
    private dataSource: DataSource,
  ) {}

  /**
   * Récupère les statistiques générales de la scolarité
   */
  async getDashboardStats() {
    try {
      // Statistiques générales
      const totalEtudiants = await this.etudiantRepo.count({ where: { actif: true } });
      const totalInscriptions = await this.inscriptionRepo.count();
      const totalDeliberations = await this.deliberationRepo.count();
      const totalDiplomes = await this.diplomeRepo.count();

      // Statistiques par année académique
      const statsByYear = await this.dataSource.query(`
        SELECT 
          annee_academique,
          COUNT(*) as total_inscriptions,
          COUNT(CASE WHEN statut = 'valide' THEN 1 END) as inscriptions_valides,
          COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as inscriptions_en_attente
        FROM inscription 
        GROUP BY annee_academique 
        ORDER BY annee_academique DESC
        LIMIT 5
      `);

      // Statistiques des notes
      const notesStats = await this.dataSource.query(`
        SELECT 
          AVG(moyenne_generale) as moyenne_generale,
          COUNT(CASE WHEN moyenne_generale >= 10 THEN 1 END) as admis,
          COUNT(CASE WHEN moyenne_generale < 10 THEN 1 END) as ajournes,
          COUNT(*) as total_etudes
        FROM deliberation 
        WHERE session_examen_id IN (
          SELECT id FROM session_examen WHERE annee_academique = (
            SELECT MAX(annee_academique) FROM session_examen
          )
        )
      `);

      // Dernières activités
      const recentInscriptions = await this.inscriptionRepo.find({
        relations: ['etudiant'],
        order: { createdAt: 'DESC' },
        take: 5
      });

      const recentDeliberations = await this.deliberationRepo.find({
        relations: ['sessionExamen'],
        order: { createdAt: 'DESC' },
        take: 5
      });

      return {
        overview: {
          totalEtudiants,
          totalInscriptions,
          totalDeliberations,
          totalDiplomes
        },
        statsByYear: statsByYear.map((stat: any) => ({
          anneeAcademique: stat.annee_academique,
          totalInscriptions: parseInt(stat.total_inscriptions),
          inscriptionsValides: parseInt(stat.inscriptions_valides),
          inscriptionsEnAttente: parseInt(stat.inscriptions_en_attente)
        })),
        notesStats: notesStats[0] ? {
          moyenneGenerale: parseFloat(notesStats[0].moyenne_generale) || 0,
          admis: parseInt(notesStats[0].admis) || 0,
          ajournes: parseInt(notesStats[0].ajournes) || 0,
          totalEtudes: parseInt(notesStats[0].total_etudes) || 0
        } : null,
        recentActivities: {
          inscriptions: recentInscriptions,
          deliberations: recentDeliberations
        }
      };
    } catch (error: any) {
      console.error('Erreur dashboard scolarite:', error);
      throw new BadRequestException('Impossible de récupérer les statistiques de scolarité');
    }
  }

  /**
   * Génère les attestations pour un étudiant
   */
  async getAttestations(etudiantId?: string) {
    try {
      const whereClause = etudiantId ? { etudiant: { id: etudiantId } } : {};
      
      const attestations = await this.dataSource.query(`
        SELECT 
          e.id as etudiant_id,
          e.nom,
          e.prenom,
          e.date_naissance,
          e.lieu_naissance,
          e.matricule,
          i.id as inscription_id,
          i.annee_academique,
          i.niveau,
          i.parcours_id,
          p.nom as parcours_nom,
          i.statut as inscription_statut,
          i.date_inscription,
          d.id as deliberation_id,
          d.moyenne_generale,
          d.decision,
          d.session_examen_id,
          se.libelle as session_libelle,
          se.date_deliberation
        FROM etudiant e
        LEFT JOIN inscription i ON e.id = i.etudiant_id
        LEFT JOIN parcours p ON i.parcours_id = p.id
        LEFT JOIN deliberation d ON e.id = d.etudiant_id
        LEFT JOIN session_examen se ON d.session_examen_id = se.id
        WHERE e.actif = true
        ${etudiantId ? `AND e.id = '${etudiantId}'` : ''}
        ORDER BY i.annee_academique DESC, se.date_deliberation DESC
      `);

      return attestations.map((att: any) => ({
        etudiant: {
          id: att.etudiant_id,
          nom: att.nom,
          prenom: att.prenom,
          dateNaissance: att.date_naissance,
          lieuNaissance: att.lieu_naissance,
          matricule: att.matricule
        },
        inscription: att.inscription_id ? {
          id: att.inscription_id,
          anneeAcademique: att.annee_academique,
          niveau: att.niveau,
          parcoursId: att.parcours_id,
          parcoursNom: att.parcours_nom,
          statut: att.inscription_statut,
          dateInscription: att.date_inscription
        } : null,
        deliberation: att.deliberation_id ? {
          id: att.deliberation_id,
          moyenneGenerale: parseFloat(att.moyenne_generale),
          decision: att.decision,
          sessionExamen: {
            id: att.session_examen_id,
            libelle: att.session_libelle,
            dateDeliberation: att.date_deliberation
          }
        } : null,
        typeAttestation: this.determineTypeAttestation(att.inscription_statut, att.decision)
      }));
    } catch (error: any) {
      console.error('Erreur attestations:', error);
      throw new BadRequestException('Impossible de récupérer les attestations');
    }
  }

  /**
   * Génère les attestations de transfert
   */
  async getTransferts(etudiantId?: string) {
    try {
      const whereClause = etudiantId ? { etudiant: { id: etudiantId } } : {};
      
      const transferts = await this.dataSource.query(`
        SELECT 
          e.id as etudiant_id,
          e.nom,
          e.prenom,
          e.matricule,
          i.id as inscription_id,
          i.annee_academique,
          i.niveau,
          i.parcours_id,
          p.nom as parcours_nom,
          i.statut as inscription_statut,
          i.date_inscription,
          d.moyenne_generale,
          d.decision,
          se.libelle as session_libelle,
          se.date_deliberation,
          -- Historique des transferts
          t.id as transfert_id,
          t.date_transfert,
          t.motif,
          t.universite_destination,
          t.statut as transfert_statut
        FROM etudiant e
        LEFT JOIN inscription i ON e.id = i.etudiant_id
        LEFT JOIN parcours p ON i.parcours_id = p.id
        LEFT JOIN deliberation d ON e.id = d.etudiant_id AND d.session_examen_id = (
          SELECT MAX(id) FROM session_examen WHERE annee_academique = i.annee_academique
        )
        LEFT JOIN session_examen se ON d.session_examen_id = se.id
        LEFT JOIN transfert t ON e.id = t.etudiant_id
        WHERE e.actif = true
        ${etudiantId ? `AND e.id = '${etudiantId}'` : ''}
        ORDER BY i.annee_academique DESC, t.date_transfert DESC
      `);

      return transferts.map((transfert: any) => ({
        etudiant: {
          id: transfert.etudiant_id,
          nom: transfert.nom,
          prenom: transfert.prenom,
          matricule: transfert.matricule
        },
        inscription: {
          id: transfert.inscription_id,
          anneeAcademique: transfert.annee_academique,
          niveau: transfert.niveau,
          parcoursId: transfert.parcours_id,
          parcoursNom: transfert.parcours_nom,
          statut: transfert.inscription_statut,
          dateInscription: transfert.date_inscription
        },
        resultatAcademique: {
          moyenneGenerale: parseFloat(transfert.moyenne_generale) || null,
          decision: transfert.decision,
          sessionExamen: {
            libelle: transfert.session_libelle,
            dateDeliberation: transfert.date_deliberation
          }
        },
        transfert: transfert.transfert_id ? {
          id: transfert.transfert_id,
          dateTransfert: transfert.date_transfert,
          motif: transfert.motif,
          universiteDestination: transfert.universite_destination,
          statut: transfert.transfert_statut
        } : null,
        eligibleTransfert: this.isEligibleTransfert(transfert.inscription_statut, transfert.decision)
      }));
    } catch (error: any) {
      console.error('Erreur transferts:', error);
      throw new BadRequestException('Impossible de récupérer les transferts');
    }
  }

  /**
   * Crée une demande de transfert
   */
  async createTransfert(etudiantId: string, motif: string, universiteDestination: string) {
    try {
      // Vérifier si l'étudiant existe et est éligible
      const etudiant = await this.etudiantRepo.findOne({ 
        where: { id: etudiantId, actif: true } 
      });
      
      if (!etudiant) {
        throw new NotFoundException('Étudiant non trouvé');
      }

      // Vérifier l'éligibilité au transfert
      const eligibilityCheck = await this.dataSource.query(`
        SELECT i.statut, d.decision
        FROM inscription i
        LEFT JOIN deliberation d ON i.etudiant_id = d.etudiant_id 
          AND d.session_examen_id = (
            SELECT MAX(id) FROM session_examen WHERE annee_academique = i.annee_academique
          )
        WHERE i.etudiant_id = $1
        ORDER BY i.annee_academique DESC
        LIMIT 1
      `, [etudiantId]);

      if (eligibilityCheck.length === 0) {
        throw new BadRequestException('Aucune inscription trouvée pour cet étudiant');
      }

      const lastInscription = eligibilityCheck[0];
      if (!this.isEligibleTransfert(lastInscription.statut, lastInscription.decision)) {
        throw new BadRequestException('Étudiant non éligible au transfert');
      }

      // Créer la demande de transfert
      const transfertQuery = `
        INSERT INTO transfert (etudiant_id, date_transfert, motif, universite_destination, statut, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, date_transfert, motif, universite_destination, statut
      `;

      const result = await this.dataSource.query(transfertQuery, [
        etudiantId,
        new Date(),
        motif,
        universiteDestination,
        'en_attente',
        new Date()
      ]);

      return {
        success: true,
        transfert: result[0],
        message: 'Demande de transfert créée avec succès'
      };
    } catch (error: any) {
      console.error('Erreur création transfert:', error);
      throw error;
    }
  }

  /**
   * Met à jour le statut d'un transfert
   */
  async updateTransertStatut(transfertId: string, statut: string, commentaire?: string) {
    try {
      const updateQuery = `
        UPDATE transfert 
        SET statut = $1, commentaire = $2, updated_at = $3
        WHERE id = $4
        RETURNING id, statut, updated_at
      `;

      const result = await this.dataSource.query(updateQuery, [
        statut,
        commentaire || null,
        new Date(),
        transfertId
      ]);

      if (result.length === 0) {
        throw new NotFoundException('Transfert non trouvé');
      }

      return {
        success: true,
        transfert: result[0],
        message: `Statut du transfert mis à jour: ${statut}`
      };
    } catch (error: any) {
      console.error('Erreur mise à jour transfert:', error);
      throw error;
    }
  }

  /**
   * Détermine le type d'attestation basé sur le statut
   */
  private determineTypeAttestation(inscriptionStatut: string, decision: string): string {
    if (!inscriptionStatut) return 'inscription';
    
    switch (inscriptionStatut) {
      case 'valide':
        if (decision === 'admis') return 'reussite';
        if (decision === 'ajourne') return 'inscription';
        return 'scolarite';
      case 'en_attente':
        return 'preinscription';
      default:
        return 'inscription';
    }
  }

  /**
   * Vérifie si un étudiant est éligible au transfert
   */
  private isEligibleTransfert(inscriptionStatut: string, decision: string): boolean {
    // Conditions d'éligibilité au transfert:
    // - Inscription valide
    // - Pas en situation d'échec persistant
    // - Pas de dettes financières (à vérifier)
    
    if (inscriptionStatut !== 'valide') {
      return false;
    }

    if (decision === 'exclu' || decision === 'radié') {
      return false;
    }

    return true;
  }

  async getDeliberations() {
    return await this.deliberationRepo.find({
      relations: ['sessionExamen', 'presidentJury'],
      order: { createdAt: 'DESC' },
    });
  }

  async getDiplomes() {
    return await this.diplomeRepo.find({
      relations: ['etudiant', 'inscription', 'delivrePar'],
      order: { createdAt: 'DESC' },
    });
  }
}
