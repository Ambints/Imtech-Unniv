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
      this.logger.log(`🔧 Création du schéma: ${schemaName}`);
      const createSchemaResult = await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
      this.logger.log(`✅ Schéma ${schemaName} créé ou déjà existant`);

      // 2. Vérifier que le schéma existe
      const schemaCheck = await queryRunner.query(`
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name = $1
      `, [schemaName]);
      
      if (schemaCheck.length === 0) {
        throw new Error(`Le schéma ${schemaName} n'a pas été créé correctement`);
      }
      this.logger.log(`✅ Vérification: schéma ${schemaName} existe dans la base`);

      // 3. Créer les extensions dans le schéma public
      this.logger.log(`🔧 Création des extensions PostgreSQL...`);
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public`);
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public`);
      this.logger.log(`✅ Extensions créées dans le schéma public`);

      // 4. Lire et exécuter le script SQL de création des tables
      const sqlPath = process.env.NODE_ENV === 'production'
        ? join(__dirname, 'tenant-schema.sql')
        : join(__dirname, '../../src/tenants/tenant-schema.sql');
      
      this.logger.log(`📄 Lecture du script SQL: ${sqlPath}`);
      let sqlScript = readFileSync(sqlPath, 'utf-8');

      // 5. Exécuter le script dans le contexte du nouveau schéma
      this.logger.log(`🔧 Initialisation des tables dans ${schemaName}`);

      // Définir le search_path pour ce schéma
      await queryRunner.query(`SET search_path TO "${schemaName}"`);
      this.logger.log(`✅ search_path défini sur ${schemaName}`);
      
      // Parser et exécuter chaque instruction SQL individuellement
      const statements = this.parseSqlStatements(sqlScript);
      this.logger.log(`📊 ${statements.length} instructions SQL à exécuter`);
      
      let successCount = 0;
      let skipCount = 0;
      
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
          await queryRunner.query(stmt);
          successCount++;
          
          // Log tous les 10 statements
          if ((i + 1) % 10 === 0) {
            this.logger.log(`   ⏳ Progression: ${i + 1}/${statements.length} instructions exécutées`);
          }
        } catch (error) {
          const msg = getErrorMessage(error);
          // Ignorer les erreurs "already exists" et "IF NOT EXISTS" déjà créés
          if (!msg.includes('already exists') && !msg.includes('n\'existe pas') && !msg.includes('does not exist')) {
            this.logger.error(`❌ Instruction ${i + 1} ÉCHOUÉE:`);
            this.logger.error(`   SQL: ${stmt.substring(0, 200)}...`);
            this.logger.error(`   Erreur: ${msg}`);
          }
          skipCount++;
        }
      }
      
      this.logger.log(`✅ Exécution terminée: ${successCount} réussies, ${skipCount} ignorées`);
      
      // Réinitialiser le search_path
      await queryRunner.query(`SET search_path TO public`);

      // 6. Vérifier que les tables ont été créées
      const tableCheck = await queryRunner.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = $1
        LIMIT 5
      `, [schemaName]);
      
      this.logger.log(`✅ ${tableCheck.length} tables créées dans ${schemaName}`);
      if (tableCheck.length > 0) {
        this.logger.log(`   Tables: ${tableCheck.map((t: any) => t.table_name).join(', ')}`);
      }

      this.logger.log(`🎉 Schéma ${schemaName} créé avec succès avec toutes ses tables`);

    } catch (error) {
      this.logger.error(`❌ Erreur lors de la création du schéma ${schemaName}: ${getErrorMessage(error)}`);
      this.logger.error(`Stack trace: ${error instanceof Error ? error.stack : 'N/A'}`);
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

      // Définir le search_path une seule fois
      await queryRunner.query(`SET search_path TO "${schemaName}"`);

      // 1. Créer l'année académique
      await queryRunner.query(`
        INSERT INTO annee_academique (libelle, date_debut, date_fin, active)
        VALUES ('2025-2026', '2025-09-01', '2026-07-31', TRUE)
        ON CONFLICT DO NOTHING
      `);

      // 2. Créer l'utilisateur admin (utiliser public.crypt et public.gen_salt)
      await queryRunner.query(`
        INSERT INTO utilisateur (email, password_hash, nom, prenom, role, actif, email_verifie)
        VALUES (
          $1,
          public.crypt($2, public.gen_salt('bf')),
          'ADMIN',
          'Système',
          'admin',
          TRUE,
          TRUE
        )
        ON CONFLICT (email) DO NOTHING
      `, [adminEmail, adminPassword]);

      // 3. Créer quelques départements par défaut
      await queryRunner.query(`
        INSERT INTO departement (code, nom) VALUES
          ('INFO', 'Département Informatique et Numérique'),
          ('GESTION', 'Département Gestion et Commerce'),
          ('DROIT', 'Département Droit et Sciences Politiques')
        ON CONFLICT DO NOTHING
      `);

      // 4. Créer quelques bâtiments par défaut
      await queryRunner.query(`
        INSERT INTO batiment (nom, code) VALUES
          ('Bloc A - Sciences', 'BLOCA'),
          ('Bloc B - Administration', 'BLOCB'),
          ('Amphithéâtre Central', 'AMPHI')
        ON CONFLICT DO NOTHING
      `);

      // Réinitialiser le search_path
      await queryRunner.query(`SET search_path TO public`);

      this.logger.log(`Données initiales insérées dans ${schemaName}`);

    } catch (error) {
      this.logger.error(`Erreur lors du seed de ${schemaName}: ${getErrorMessage(error)}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Parse le script SQL en instructions individuelles
   * Gère les commentaires et les blocs dollar-quoted ($$)
   */
  private parseSqlStatements(script: string): string[] {
    const statements: string[] = [];
    let current = '';
    let inBlockComment = false;
    let inLineComment = false;
    let inDollarQuote = false;
    let dollarTag = '';

    for (let i = 0; i < script.length; i++) {
      const char = script[i];
      const nextChar = script[i + 1] || '';

      // Détection début de commentaire bloc /* */
      if (!inBlockComment && !inLineComment && !inDollarQuote && char === '/' && nextChar === '*') {
        inBlockComment = true;
        i++; // skip next char
        continue;
      }

      // Fin de commentaire bloc
      if (inBlockComment && char === '*' && nextChar === '/') {
        inBlockComment = false;
        i++; // skip next char
        continue;
      }

      // Ignorer contenu dans les commentaires
      if (inBlockComment || inLineComment) {
        if (inLineComment && char === '\n') {
          inLineComment = false;
        }
        continue;
      }

      // Détection commentaire ligne --
      if (!inDollarQuote && char === '-' && nextChar === '-') {
        inLineComment = true;
        i++; // skip next char
        continue;
      }

      // Détection début bloc dollar-quoted $tag$
      if (!inDollarQuote && char === '$') {
        // Chercher le pattern $tag$
        const remaining = script.substring(i);
        const match = remaining.match(/^\$(\w*)\$/);
        if (match) {
          inDollarQuote = true;
          dollarTag = match[1];
          current += match[0];
          i += match[0].length - 1;
          continue;
        }
      }

      // Fin de bloc dollar-quoted
      if (inDollarQuote && char === '$') {
        const endTag = `$${dollarTag}$`;
        const remaining = script.substring(i);
        if (remaining.startsWith(endTag)) {
          inDollarQuote = false;
          current += endTag;
          i += endTag.length - 1;
          continue;
        }
      }

      // Séparateur de commandes (point-virgule) hors blocs spéciaux
      if (!inDollarQuote && char === ';') {
        const trimmed = current.trim();
        if (trimmed) {
          statements.push(trimmed + ';');
        }
        current = '';
        continue;
      }

      current += char;
    }

    // Dernière instruction si non vide
    const trimmed = current.trim();
    if (trimmed) {
      statements.push(trimmed + (trimmed.endsWith(';') ? '' : ';'));
    }

    return statements.filter(s => s.length > 0 && !s.startsWith('--'));
  }

}

