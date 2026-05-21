import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

/**
 * Script pour appliquer la migration de la table utilisateur
 * à tous les schémas de tenants existants
 */

async function applyUserMigration() {
  console.log('🔄 Début de la migration de la table utilisateur...');
  
  let app;
  let successCount = 0;
  let failureCount = 0;
  let tenants: any[] = [];

  try {
    // Initialiser l'application NestJS
    app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    // Récupérer tous les tenants actifs
    const tenantsQuery = 'SELECT id, nom, slug, schema_name FROM public.tenant WHERE actif = true';
    tenants = await dataSource.query(tenantsQuery);

    console.log(`📊 ${tenants.length} universités à migrer`);

    // Lire le fichier de migration
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, '../src/users/migrations/create_user_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Appliquer la migration à chaque schéma de tenant
    for (const tenant of tenants) {
      try {
        console.log(`🔧 Migration pour: ${tenant.nom} (schéma: ${tenant.schema_name})`);
        
        // Créer la table utilisateur avec une requête simple
        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS "${tenant.schema_name}".utilisateur (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              email VARCHAR(254) UNIQUE NOT NULL,
              password_hash VARCHAR(255) NOT NULL,
              nom VARCHAR(100) NOT NULL,
              prenom VARCHAR(100) NOT NULL,
              telephone VARCHAR(30),
              photo_url VARCHAR(500),
              role VARCHAR(50) NOT NULL,
              actif BOOLEAN DEFAULT true,
              email_verifie BOOLEAN DEFAULT false,
              derniere_connexion TIMESTAMPTZ,
              token_reset TEXT,
              token_reset_expiry TIMESTAMPTZ,
              password_reset_required BOOLEAN DEFAULT false,
              last_password_reset TIMESTAMPTZ,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;
        
        await dataSource.query(createTableQuery);
        
        // Créer les indexes
        const indexQueries = [
          `CREATE INDEX IF NOT EXISTS idx_${tenant.schema_name}_utilisateur_email ON "${tenant.schema_name}".utilisateur(email);`,
          `CREATE INDEX IF NOT EXISTS idx_${tenant.schema_name}_utilisateur_role ON "${tenant.schema_name}".utilisateur(role);`,
          `CREATE INDEX IF NOT EXISTS idx_${tenant.schema_name}_utilisateur_actif ON "${tenant.schema_name}".utilisateur(actif);`
        ];
        
        for (const indexQuery of indexQueries) {
          await dataSource.query(indexQuery);
        }
        
        console.log(`✅ Migration réussie pour ${tenant.nom}`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Erreur migration pour ${tenant.nom}:`, error.message);
        failureCount++;
      }
    }

    console.log(`📈 Résumé: ${successCount} succès, ${failureCount} échecs sur ${tenants.length} universités`);

  } catch (error: any) {
    console.error('💥 Erreur critique lors de la migration:', error);
    failureCount = tenants?.length || 0;
  } finally {
    // Fermer l'application proprement
    if (app) {
      await app.close();
    }
  }

  // Sortir avec le code approprié
  process.exit(failureCount > 0 ? 1 : 0);
}

// Exécuter la migration
if (require.main === module) {
  applyUserMigration().catch(error => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
}

export { applyUserMigration };
