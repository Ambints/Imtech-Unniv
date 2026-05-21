const { Client } = require('pg');
require('dotenv').config();

async function checkMissingSchemas() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'imtech_university',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connexion établie\n');

    // 1. Lister TOUS les tenants dans la table
    console.log('📋 TENANTS DANS LA TABLE:');
    console.log('═══════════════════════════════════════');
    const tenants = await client.query(`
      SELECT id, nom, slug, schema_name, actif, created_at
      FROM tenant
      ORDER BY created_at DESC
    `);
    
    console.log(`Total: ${tenants.rows.length} tenant(s)\n`);
    tenants.rows.forEach((t, i) => {
      console.log(`${i + 1}. ${t.nom}`);
      console.log(`   Slug: ${t.slug}`);
      console.log(`   Schéma attendu: ${t.schema_name}`);
      console.log(`   Créé le: ${t.created_at}`);
      console.log('');
    });

    // 2. Lister TOUS les schémas tenant dans PostgreSQL
    console.log('📋 SCHÉMAS DANS POSTGRESQL:');
    console.log('═══════════════════════════════════════');
    const schemas = await client.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name LIKE 'tenant_%' OR schema_name = 'univ_demo'
      ORDER BY schema_name
    `);
    
    console.log(`Total: ${schemas.rows.length} schéma(s)\n`);
    schemas.rows.forEach((s, i) => {
      console.log(`${i + 1}. ${s.schema_name}`);
    });
    console.log('');

    // 3. Identifier les schémas MANQUANTS
    console.log('❌ SCHÉMAS MANQUANTS:');
    console.log('═══════════════════════════════════════');
    const schemaNames = schemas.rows.map(s => s.schema_name);
    const missing = tenants.rows.filter(t => !schemaNames.includes(t.schema_name));
    
    if (missing.length === 0) {
      console.log('✅ Aucun schéma manquant\n');
    } else {
      console.log(`⚠️  ${missing.length} schéma(s) manquant(s):\n`);
      missing.forEach((t, i) => {
        console.log(`${i + 1}. ${t.nom} (${t.slug})`);
        console.log(`   Schéma attendu: ${t.schema_name}`);
        console.log(`   Créé le: ${t.created_at}`);
        console.log(`   ❌ CE SCHÉMA N'EXISTE PAS DANS POSTGRESQL`);
        console.log('');
      });
    }

    // 4. Proposer des solutions
    if (missing.length > 0) {
      console.log('🔧 SOLUTIONS:');
      console.log('═══════════════════════════════════════\n');
      
      console.log('Option 1: RECRÉER LES SCHÉMAS MANUELLEMENT');
      console.log('─────────────────────────────────────────');
      missing.forEach(t => {
        console.log(`\n-- Pour ${t.nom}:`);
        console.log(`CREATE SCHEMA "${t.schema_name}";`);
        console.log(`-- Puis exécuter tenant-schema.sql dans ce schéma`);
      });
      
      console.log('\n\nOption 2: SUPPRIMER ET RECRÉER VIA L\'APPLICATION');
      console.log('─────────────────────────────────────────');
      missing.forEach(t => {
        console.log(`\n-- Supprimer ${t.nom}:`);
        console.log(`DELETE FROM tenant WHERE id = '${t.id}';`);
        console.log(`-- Puis recréer via l'interface web`);
      });
      
      console.log('\n\nOption 3: UTILISER LE SCRIPT DE RÉPARATION');
      console.log('─────────────────────────────────────────');
      console.log('node scripts/repair-missing-schemas.js');
      console.log('');
    }

  } catch (error) {
    console.error('❌ ERREUR:', error.message);
  } finally {
    await client.end();
  }
}

checkMissingSchemas();

// Made with Bob
