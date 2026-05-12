const { Client } = require('pg');
require('dotenv').config();

async function testTenantCreationIssue() {
  console.log('🔍 ========================================');
  console.log('🔍 DIAGNOSTIC: Pourquoi le schéma n\'est pas créé');
  console.log('🔍 ========================================\n');

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'imtech_university',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connexion PostgreSQL établie\n');

    // 1. Vérifier les tenants dans la table
    console.log('📋 ÉTAPE 1: Tenants dans la table "tenant"');
    console.log('─────────────────────────────────────────');
    const tenants = await client.query(`
      SELECT id, nom, slug, schema_name, actif, created_at
      FROM tenant
      ORDER BY created_at DESC
    `);
    
    console.log(`✅ ${tenants.rows.length} tenant(s) trouvé(s) dans la table:\n`);
    tenants.rows.forEach((t, i) => {
      console.log(`${i + 1}. ${t.nom}`);
      console.log(`   Slug: ${t.slug}`);
      console.log(`   Schéma attendu: ${t.schema_name}`);
      console.log(`   Actif: ${t.actif}`);
      console.log(`   Créé le: ${t.created_at}`);
      console.log('');
    });

    // 2. Vérifier les schémas réellement créés
    console.log('📋 ÉTAPE 2: Schémas réellement créés dans PostgreSQL');
    console.log('─────────────────────────────────────────');
    const schemas = await client.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name LIKE 'tenant_%' OR schema_name = 'univ_demo'
      ORDER BY schema_name
    `);
    
    console.log(`✅ ${schemas.rows.length} schéma(s) trouvé(s):\n`);
    schemas.rows.forEach((s, i) => {
      console.log(`${i + 1}. ${s.schema_name}`);
    });
    console.log('');

    // 3. Comparer et identifier les incohérences
    console.log('🔍 ÉTAPE 3: Analyse des incohérences');
    console.log('─────────────────────────────────────────');
    
    const schemaNames = schemas.rows.map(s => s.schema_name);
    const missingSchemas = [];
    const orphanSchemas = [];
    
    // Vérifier les schémas manquants
    tenants.rows.forEach(t => {
      if (!schemaNames.includes(t.schema_name)) {
        missingSchemas.push({
          tenant: t.nom,
          slug: t.slug,
          expectedSchema: t.schema_name,
          createdAt: t.created_at
        });
      }
    });
    
    // Vérifier les schémas orphelins
    const tenantSchemaNames = tenants.rows.map(t => t.schema_name);
    schemaNames.forEach(schema => {
      if (!tenantSchemaNames.includes(schema)) {
        orphanSchemas.push(schema);
      }
    });
    
    if (missingSchemas.length === 0 && orphanSchemas.length === 0) {
      console.log('✅ Aucune incohérence détectée\n');
    } else {
      if (missingSchemas.length > 0) {
        console.log(`❌ ${missingSchemas.length} tenant(s) SANS schéma PostgreSQL:\n`);
        missingSchemas.forEach((m, i) => {
          console.log(`${i + 1}. ${m.tenant} (${m.slug})`);
          console.log(`   Schéma attendu: ${m.expectedSchema}`);
          console.log(`   Créé le: ${m.createdAt}`);
          console.log(`   ⚠️  Le schéma n'existe PAS dans PostgreSQL`);
          console.log('');
        });
      }
      
      if (orphanSchemas.length > 0) {
        console.log(`⚠️  ${orphanSchemas.length} schéma(s) orphelin(s) (sans tenant):\n`);
        orphanSchemas.forEach((s, i) => {
          console.log(`${i + 1}. ${s}`);
        });
        console.log('');
      }
    }

    // 4. Vérifier les tables dans chaque schéma
    console.log('📊 ÉTAPE 4: Nombre de tables par schéma');
    console.log('─────────────────────────────────────────');
    
    for (const schema of schemas.rows) {
      const tableCount = await client.query(`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = $1
      `, [schema.schema_name]);
      
      const count = parseInt(tableCount.rows[0].count);
      const status = count >= 60 ? '✅' : count >= 40 ? '⚠️' : '❌';
      console.log(`${status} ${schema.schema_name}: ${count} tables`);
    }
    console.log('');

    // 5. Diagnostic final et recommandations
    console.log('💡 ÉTAPE 5: Diagnostic et Recommandations');
    console.log('═════════════════════════════════════════');
    
    if (missingSchemas.length > 0) {
      console.log('\n❌ PROBLÈME IDENTIFIÉ:');
      console.log('   Des tenants existent dans la table mais leurs schémas');
      console.log('   PostgreSQL n\'ont PAS été créés.\n');
      
      console.log('🔍 CAUSES POSSIBLES:');
      console.log('   1. Erreur silencieuse dans TenantCreationService');
      console.log('   2. Exception levée mais non propagée');
      console.log('   3. Transaction non commitée');
      console.log('   4. Problème de permissions PostgreSQL');
      console.log('   5. Timeout lors de la création\n');
      
      console.log('🔧 SOLUTIONS:');
      console.log('   1. Vérifier les logs du backend lors de la création');
      console.log('   2. Ajouter plus de logs dans TenantCreationService');
      console.log('   3. Tester la création avec le script test-full-tenant-creation.js');
      console.log('   4. Recréer manuellement les schémas manquants\n');
      
      console.log('📝 COMMANDES POUR RECRÉER LES SCHÉMAS:');
      missingSchemas.forEach(m => {
        console.log(`\n-- Pour ${m.tenant}:`);
        console.log(`CREATE SCHEMA "${m.expectedSchema}";`);
        console.log(`-- Puis exécuter le script tenant-schema.sql dans ce schéma`);
      });
      console.log('');
    } else {
      console.log('\n✅ TOUS LES SCHÉMAS SONT CRÉÉS CORRECTEMENT\n');
      console.log('   Si vous rencontrez des problèmes lors de la création');
      console.log('   d\'un nouveau tenant, vérifiez:');
      console.log('   1. Les logs du backend (console)');
      console.log('   2. Les permissions de l\'utilisateur PostgreSQL');
      console.log('   3. L\'espace disque disponible\n');
    }

    // 6. Test de création rapide
    console.log('🧪 ÉTAPE 6: Test de création rapide');
    console.log('─────────────────────────────────────────');
    console.log('Voulez-vous tester la création d\'un schéma maintenant?');
    console.log('Exécutez: node scripts/test-full-tenant-creation.js\n');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

testTenantCreationIssue();

// Made with Bob
