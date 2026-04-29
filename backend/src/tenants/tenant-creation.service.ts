import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';

// Helper pour extraire le message d'erreur
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

@Injectable()
export class TenantCreationService {
  private readonly logger = new Logger(TenantCreationService.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  /**
   * Crée un nouveau schéma PostgreSQL pour une université
   * et initialise toutes les tables nécessaires
   */
  async createTenantSchema(schemaName: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      // 1. Créer le schéma
      this.logger.log(`Création du schéma: ${schemaName}`);
      await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

      // 2. Lire et exécuter le script SQL de création des tables
      // Utiliser le chemin source car le fichier SQL n'est pas copié dans dist
      const sqlPath = process.env.NODE_ENV === 'production'
        ? join(__dirname, 'tenant-schema.sql')
        : join(__dirname, '../../src/tenants/tenant-schema.sql');
      
      const sqlScript = readFileSync(sqlPath, 'utf-8');

      // 3. Exécuter le script dans le contexte du nouveau schéma
      this.logger.log(`Initialisation des tables dans ${schemaName}`);
      
      // Découper le script en commandes individuelles et les exécuter
      const statements = this.splitSqlScript(sqlScript);
      
      for (const statement of statements) {
        const trimmed = statement.trim();
        if (trimmed && !trimmed.startsWith('--') && !trimmed.startsWith('/*')) {
          try {
            // Exécuter chaque commande dans le schéma du tenant
            await queryRunner.query(`SET search_path TO "${schemaName}"; ${trimmed}`);
          } catch (error) {
            // Ignorer les erreurs "already exists" ou « IF NOT EXISTS »
            const msg = getErrorMessage(error);
            if (!msg.includes('already exists') && !msg.includes('n\'existe pas')) {
              this.logger.warn(`Commande ignorée: ${msg}`);
            }
          }
        }
      }

      // 4. Créer les extensions dans le schéma public si nécessaire
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

      this.logger.log(`Schéma ${schemaName} créé avec succès`);

    } catch (error) {
      this.logger.error(`Erreur lors de la création du schéma ${schemaName}: ${getErrorMessage(error)}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Supprime un schéma de tenant (à utiliser avec précaution)
   */
  async dropTenantSchema(schemaName: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      
      this.logger.log(`Suppression du schéma: ${schemaName}`);
      await queryRunner.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
      
      this.logger.log(`Schéma ${schemaName} supprimé`);
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du schéma ${schemaName}: ${getErrorMessage(error)}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Insère les données de seed initiales dans un tenant
   */
  async seedTenantData(schemaName: string, adminEmail: string, adminPassword: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      this.logger.log(`Insertion des données initiales dans ${schemaName}`);

      // 1. Créer l'année académique
      await queryRunner.query(`
        SET search_path TO "${schemaName}";
        INSERT INTO annee_academique (libelle, date_debut, date_fin, active)
        VALUES ('2025-2026', '2025-09-01', '2026-07-31', TRUE)
        ON CONFLICT DO NOTHING;
      `);

      // 2. Créer l'utilisateur admin
      await queryRunner.query(`
        SET search_path TO "${schemaName}";
        INSERT INTO utilisateur (email, password_hash, nom, prenom, role, actif, email_verifie)
        VALUES (
          '${adminEmail}',
          crypt('${adminPassword}', gen_salt('bf')),
          'ADMIN',
          'Système',
          'admin',
          TRUE,
          TRUE
        )
        ON CONFLICT (email) DO NOTHING;
      `);

      // 3. Créer quelques départements par défaut
      await queryRunner.query(`
        SET search_path TO "${schemaName}";
        INSERT INTO departement (code, nom) VALUES
          ('INFO', 'Département Informatique et Numérique'),
          ('GESTION', 'Département Gestion et Commerce'),
          ('DROIT', 'Département Droit et Sciences Politiques')
        ON CONFLICT DO NOTHING;
      `);

      // 4. Créer quelques bâtiments par défaut
      await queryRunner.query(`
        SET search_path TO "${schemaName}";
        INSERT INTO batiment (nom, code) VALUES
          ('Bloc A - Sciences', 'BLOCA'),
          ('Bloc B - Administration', 'BLOCB'),
          ('Amphithéâtre Central', 'AMPHI')
        ON CONFLICT DO NOTHING;
      `);

      this.logger.log(`Données initiales insérées dans ${schemaName}`);

    } catch (error) {
      this.logger.error(`Erreur lors du seed de ${schemaName}: ${getErrorMessage(error)}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Divise le script SQL en commandes individuelles
   */
  private splitSqlScript(script: string): string[] {
    // Séparer par point-virgule, mais gérer les blocs DO $$
    const statements: string[] = [];
    let current = '';
    let inDollarQuote = false;
    let dollarTag = '';

    for (let i = 0; i < script.length; i++) {
      const char = script[i];
      const nextChars = script.substring(i, i + 10);

      // Détecter le début d'un bloc dollar-quote
      if (!inDollarQuote && char === '$') {
        const match = nextChars.match(/\$(\w*)\$/);
        if (match) {
          inDollarQuote = true;
          dollarTag = match[1];
          current += match[0];
          i += match[0].length - 1;
          continue;
        }
      }

      // Détecter la fin d'un bloc dollar-quote
      if (inDollarQuote && char === '$') {
        const endTag = `$${dollarTag}$`;
        if (script.substring(i, i + endTag.length) === endTag) {
          inDollarQuote = false;
          dollarTag = '';
          current += endTag;
          i += endTag.length - 1;
          continue;
        }
      }

      // Séparateur de commandes (hors blocs dollar-quote)
      if (!inDollarQuote && char === ';') {
        statements.push(current);
        current = '';
        continue;
      }

      current += char;
    }

    // Ajouter la dernière commande si non vide
    if (current.trim()) {
      statements.push(current);
    }

    return statements;
  }
}
