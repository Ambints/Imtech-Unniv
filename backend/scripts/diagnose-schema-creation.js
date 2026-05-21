const { Client } = require('pg');
require('dotenv').config();

async function diagnoseSchemaCreation() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'imtech_university',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connexion à PostgreSQL réussie\n');

    // 1. Vérifier les permissions de l'utilisateur
    console.log('📋 ÉTAPE 1: Vérification des permissions utilisateur');
    console.log('─────────────────────────────────────────────────────');
    const userPerms = await client.query(`
      SELECT
        usename,
        usesuper,
        usecreatedb
      FROM pg_user
      WHERE usename = current_user
    `);
    console.log('Utilisateur actuel:', userPerms.rows[0]);
    
    if (!userPerms.rows[0].usecreatedb && !userPerms.rows[0].usesuper) {
      console.log('⚠️  ATTENTION: L\'utilisateur n\'a pas les droits CREATE DATABASE/SCHEMA');
    } else {
      console.log('✅ Permissions suffisantes\n');
    }

    // 2. Tester la création d'un schéma de test
    console.log('📋 ÉTAPE 2: Test de création de schéma');
    console.log('─────────────────────────────────────────────────────');
    const testSchemaName = 'test_tenant_diagnostic';
    
    try {
      // Supprimer le schéma de test s'il existe
      await client.query(`DROP SCHEMA IF EXISTS "${testSchemaName}" CASCADE`);
      console.log(`🧹 Schéma de test nettoyé`);
      
      // Créer le schéma de test
      await client.query(`CREATE SCHEMA "${testSchemaName}"`);
      console.log(`✅ Schéma "${testSchemaName}" créé avec succès`);
      
      // Vérifier que le schéma existe
      const schemaCheck = await client.query(`
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name = $1
      `, [testSchemaName]);
      
      if (schemaCheck.rows.length > 0) {
        console.log(`✅ Schéma vérifié dans information_schema`);
      } else {
        console.log(`❌ Schéma non trouvé dans information_schema`);
      }
      
      // Tester la création d'une table dans le schéma
      await client.query(`SET search_path TO "${testSchemaName}"`);
      await client.query(`
        CREATE TABLE test_table (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100)
        )
      `);
      console.log(`✅ Table de test créée dans le schéma`);
      
      // Vérifier la table
      const tableCheck = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = $1
      `, [testSchemaName]);
      console.log(`✅ ${tableCheck.rows.length} table(s) trouvée(s) dans le schéma`);
      
      // Nettoyer
      await client.query(`SET search_path TO public`);
      await client.query(`DROP SCHEMA "${testSchemaName}" CASCADE`);
      console.log(`🧹 Schéma de test supprimé\n`);
      
    } catch (error) {
      console.log(`❌ ERREUR lors du test de création:`);
      console.log(`   Message: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Detail: ${error.detail || 'N/A'}\n`);
    }

    // 3. Vérifier les schémas tenant existants
    console.log('📋 ÉTAPE 3: Schémas tenant existants');
    console.log('─────────────────────────────────────────────────────');
    const tenantSchemas = await client.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);
    
    if (tenantSchemas.rows.length === 0) {
      console.log('ℹ️  Aucun schéma tenant trouvé');
    } else {
      console.log(`✅ ${tenantSchemas.rows.length} schéma(s) tenant trouvé(s):`);
      for (const row of tenantSchemas.rows) {
        // Compter les tables dans chaque schéma
        const tableCount = await client.query(`
          SELECT COUNT(*) as count
          FROM information_schema.tables
          WHERE table_schema = $1
        `, [row.schema_name]);
        console.log(`   - ${row.schema_name}: ${tableCount.rows[0].count} tables`);
      }
    }
    console.log('');

    // 4. Vérifier les extensions
    console.log('📋 ÉTAPE 4: Extensions PostgreSQL');
    console.log('─────────────────────────────────────────────────────');
    const extensions = await client.query(`
      SELECT extname, extversion, nspname as schema
      FROM pg_extension
      JOIN pg_namespace ON pg_extension.extnamespace = pg_namespace.oid
      WHERE extname IN ('uuid-ossp', 'pgcrypto')
    `);
    
    if (extensions.rows.length === 0) {
      console.log('⚠️  Extensions uuid-ossp et pgcrypto non installées');
      console.log('   Tentative d\'installation...');
      try {
        await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public`);
        await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public`);
        console.log('✅ Extensions installées avec succès');
      } catch (error) {
        console.log(`❌ Erreur lors de l\'installation: ${error.message}`);
      }
    } else {
      console.log('✅ Extensions installées:');
      extensions.rows.forEach(ext => {
        console.log(`   - ${ext.extname} v${ext.extversion} (schéma: ${ext.schema})`);
      });
    }
    console.log('');

    // 5. Vérifier la table tenant
    console.log('📋 ÉTAPE 5: Table tenant dans le schéma public');
    console.log('─────────────────────────────────────────────────────');
    const tenantTable = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'tenant'
    `);
    
    if (tenantTable.rows[0].count === '0') {
      console.log('⚠️  Table tenant non trouvée dans le schéma public');
    } else {
      const tenants = await client.query(`
        SELECT id, nom, slug, schema_name, actif
        FROM tenant
        ORDER BY created_at DESC
      `);
      console.log(`✅ Table tenant trouvée avec ${tenants.rows.length} université(s):`);
      tenants.rows.forEach(t => {
        console.log(`   - ${t.nom} (${t.slug})`);
        console.log(`     Schéma: ${t.schema_name}, Actif: ${t.actif}`);
      });
    }
    console.log('');

    // 6. Diagnostic final
    console.log('📋 DIAGNOSTIC FINAL');
    console.log('═════════════════════════════════════════════════════');
    console.log('✅ Connexion PostgreSQL: OK');
    console.log(`${userPerms.rows[0].usecreatedb || userPerms.rows[0].usesuper ? '✅' : '❌'} Permissions utilisateur: ${userPerms.rows[0].usecreatedb || userPerms.rows[0].usesuper ? 'OK' : 'INSUFFISANTES'}`);
    console.log(`${extensions.rows.length === 2 ? '✅' : '⚠️'} Extensions: ${extensions.rows.length === 2 ? 'OK' : 'MANQUANTES'}`);
    console.log(`${tenantSchemas.rows.length > 0 ? '✅' : 'ℹ️'} Schémas tenant: ${tenantSchemas.rows.length} trouvé(s)`);
    console.log('═════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ ERREUR CRITIQUE:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

diagnoseSchemaCreation();

// Made with Bob
