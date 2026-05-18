import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MessageEnseignant } from './entities/message-enseignant.entity';
import { MessageDestinataire } from './entities/message-destinataire.entity';

@Injectable()
export class MessagerieService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  // Récupérer tous les étudiants pour message direct
  async getTousEtudiants() {
    const etudiants = await this.dataSource.query(`
      SELECT 
        e.id,
        e.nom,
        e.prenom,
        e.matricule,
        e.email,
        p.nom as parcours,
        ne.nom as niveau
      FROM etudiant e
      LEFT JOIN inscription i ON i.etudiant_id = e.id AND i.statut = 'active'
      LEFT JOIN parcours p ON p.id = i.parcours_id
      LEFT JOIN niveau_etude ne ON ne.id = i.niveau_id
      WHERE e.actif = true
      ORDER BY e.nom, e.prenom
    `);
    return etudiants;
  }

  // Récupérer les classes de l'enseignant
  async getMesClasses(enseignantId: string) {
    // Pour l'instant, retourner toutes les classes
    // TODO: Filtrer par les classes où l'enseignant enseigne
    const classes = await this.dataSource.query(`
      SELECT 
        p.id,
        p.nom,
        p.code,
        p.nom as parcours,
        ne.nom as niveau,
        COUNT(DISTINCT i.etudiant_id) as nombre_etudiants
      FROM parcours p
      LEFT JOIN niveau_etude ne ON ne.id = p.niveau_id
      LEFT JOIN inscription i ON i.parcours_id = p.id AND i.statut = 'active'
      WHERE p.actif = true
      GROUP BY p.id, p.nom, p.code, ne.nom
      HAVING COUNT(DISTINCT i.etudiant_id) > 0
      ORDER BY p.nom
    `);
    return classes;
  }

  // Récupérer les parcours disponibles
  async getParcoursDisponibles() {
    const parcours = await this.dataSource.query(`
      SELECT id, nom, code
      FROM parcours
      WHERE actif = true
      ORDER BY nom
    `);
    return parcours;
  }

  // Récupérer les niveaux disponibles
  async getNiveauxDisponibles() {
    const niveaux = await this.dataSource.query(`
      SELECT id, nom, code
      FROM niveau_etude
      WHERE actif = true
      ORDER BY ordre
    `);
    return niveaux;
  }

  // Obtenir les statistiques selon les filtres
  async getStatsFiltres(parcoursId?: string, niveauId?: string) {
    let query = `
      SELECT 
        COUNT(DISTINCT e.id) as nombre_etudiants,
        p.nom as parcours_nom,
        ne.nom as niveau_nom
      FROM etudiant e
      INNER JOIN inscription i ON i.etudiant_id = e.id AND i.statut = 'active'
      LEFT JOIN parcours p ON p.id = i.parcours_id
      LEFT JOIN niveau_etude ne ON ne.id = i.niveau_id
      WHERE e.actif = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (parcoursId) {
      query += ` AND i.parcours_id = $${paramIndex}`;
      params.push(parcoursId);
      paramIndex++;
    }

    if (niveauId) {
      query += ` AND i.niveau_id = $${paramIndex}`;
      params.push(niveauId);
      paramIndex++;
    }

    query += ` GROUP BY p.nom, ne.nom`;

    const result = await this.dataSource.query(query, params);
    
    if (result.length === 0) {
      return {
        nombre_etudiants: 0,
        parcours_nom: null,
        niveau_nom: null
      };
    }

    return result[0];
  }

  // Envoyer un message direct
  async envoyerMessageDirect(
    enseignantId: string,
    etudiantId: string,
    sujet: string,
    message: string
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Vérifier que l'étudiant existe
      const etudiant = await queryRunner.query(
        `SELECT id FROM etudiant WHERE id = $1 AND actif = true`,
        [etudiantId]
      );

      if (etudiant.length === 0) {
        throw new NotFoundException('Étudiant non trouvé');
      }

      // Créer le message
      const messageResult = await queryRunner.query(`
        INSERT INTO message_enseignant (
          enseignant_id, sujet, contenu, type_message, 
          etudiant_id, nombre_destinataires
        )
        VALUES ($1, $2, $3, 'direct', $4, 1)
        RETURNING id
      `, [enseignantId, sujet, message, etudiantId]);

      const messageId = messageResult[0].id;

      // Créer l'entrée destinataire
      await queryRunner.query(`
        INSERT INTO message_destinataire (message_id, etudiant_id)
        VALUES ($1, $2)
      `, [messageId, etudiantId]);

      await queryRunner.commitTransaction();

      return {
        success: true,
        messageId,
        nombreDestinataires: 1
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Envoyer un message à une classe
  async envoyerMessageClasse(
    enseignantId: string,
    classeId: string,
    sujet: string,
    message: string
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Récupérer les étudiants de la classe
      const etudiants = await queryRunner.query(`
        SELECT DISTINCT e.id
        FROM etudiant e
        INNER JOIN inscription i ON i.etudiant_id = e.id
        WHERE i.parcours_id = $1 
        AND i.statut = 'active'
        AND e.actif = true
      `, [classeId]);

      if (etudiants.length === 0) {
        throw new BadRequestException('Aucun étudiant trouvé dans cette classe');
      }

      // Créer le message
      const messageResult = await queryRunner.query(`
        INSERT INTO message_enseignant (
          enseignant_id, sujet, contenu, type_message, 
          classe_id, nombre_destinataires
        )
        VALUES ($1, $2, $3, 'classe', $4, $5)
        RETURNING id
      `, [enseignantId, sujet, message, classeId, etudiants.length]);

      const messageId = messageResult[0].id;

      // Créer les entrées destinataires
      for (const etudiant of etudiants) {
        await queryRunner.query(`
          INSERT INTO message_destinataire (message_id, etudiant_id)
          VALUES ($1, $2)
        `, [messageId, etudiant.id]);
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        messageId,
        nombreDestinataires: etudiants.length
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Envoyer un message par parcours/niveau
  async envoyerMessageParcours(
    enseignantId: string,
    parcoursId: string | null,
    niveauId: string | null,
    sujet: string,
    message: string
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Construire la requête pour récupérer les étudiants
      let query = `
        SELECT DISTINCT e.id
        FROM etudiant e
        INNER JOIN inscription i ON i.etudiant_id = e.id
        WHERE i.statut = 'active' AND e.actif = true
      `;

      const params: any[] = [];
      let paramIndex = 1;

      if (parcoursId) {
        query += ` AND i.parcours_id = $${paramIndex}`;
        params.push(parcoursId);
        paramIndex++;
      }

      if (niveauId) {
        query += ` AND i.niveau_id = $${paramIndex}`;
        params.push(niveauId);
        paramIndex++;
      }

      const etudiants = await queryRunner.query(query, params);

      if (etudiants.length === 0) {
        throw new BadRequestException('Aucun étudiant trouvé avec ces filtres');
      }

      // Créer le message
      const messageResult = await queryRunner.query(`
        INSERT INTO message_enseignant (
          enseignant_id, sujet, contenu, type_message, 
          parcours_id, niveau_id, nombre_destinataires
        )
        VALUES ($1, $2, $3, 'parcours', $4, $5, $6)
        RETURNING id
      `, [enseignantId, sujet, message, parcoursId, niveauId, etudiants.length]);

      const messageId = messageResult[0].id;

      // Créer les entrées destinataires
      for (const etudiant of etudiants) {
        await queryRunner.query(`
          INSERT INTO message_destinataire (message_id, etudiant_id)
          VALUES ($1, $2)
        `, [messageId, etudiant.id]);
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        messageId,
        nombreDestinataires: etudiants.length
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Récupérer l'historique des messages envoyés
  async getHistoriqueMessages(enseignantId: string) {
    const messages = await this.dataSource.query(`
      SELECT 
        m.id,
        m.sujet,
        m.contenu,
        m.type_message,
        m.nombre_destinataires,
        m.date_envoi,
        m.statut,
        CASE 
          WHEN m.type_message = 'direct' THEN e.nom || ' ' || e.prenom
          WHEN m.type_message = 'classe' THEN p.nom
          WHEN m.type_message = 'parcours' THEN 
            COALESCE(p2.nom, 'Tous') || ' - ' || COALESCE(ne.nom, 'Tous niveaux')
        END as destinataire_info,
        COUNT(CASE WHEN md.lu = true THEN 1 END) as nombre_lus
      FROM message_enseignant m
      LEFT JOIN etudiant e ON e.id = m.etudiant_id
      LEFT JOIN parcours p ON p.id = m.classe_id
      LEFT JOIN parcours p2 ON p2.id = m.parcours_id
      LEFT JOIN niveau_etude ne ON ne.id = m.niveau_id
      LEFT JOIN message_destinataire md ON md.message_id = m.id
      WHERE m.enseignant_id = $1
      GROUP BY m.id, e.nom, e.prenom, p.nom, p2.nom, ne.nom
      ORDER BY m.date_envoi DESC
      LIMIT 50
    `, [enseignantId]);

    return messages;
  }
}

// Made with Bob
