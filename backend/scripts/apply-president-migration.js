/**
 * Script pour appliquer la migration du module président à tous les tenants
 * Usage: node backend/scripts/apply-president-migration.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la connexion
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password',
};

async function applyMigration() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données');

    // Lire le fichier de migration
    const migrationPath = path.join(__dirname, '../src/president/migrations/001_add_president_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Récupérer tous les schémas tenant
    const result = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);

    const tenantSchemas = result.rows.map(row => row.schema_name);
    console.log(`\n📋 ${tenantSchemas.length} schémas tenant trouvés:`, tenantSchemas.join(', '));

    // Appliquer la migration à chaque tenant
    for (const schema of tenantSchemas) {
      console.log(`\n🔄 Application de la migration pour ${schema}...`);
      
      try {
        // Remplacer {schema} par le nom du schéma tenant
        const tenantSQL = migrationSQL.replace(/{schema}/g, schema);
        
        // Exécuter la migration
        await client.query(tenantSQL);
        
        console.log(`✅ Migration appliquée avec succès pour ${schema}`);
      } catch (error) {
        console.error(`❌ Erreur lors de la migration de ${schema}:`, error.message);
        // Continuer avec les autres tenants même en cas d'erreur
      }
    }

    // Vérifier les tables créées
    console.log('\n📊 Vérification des tables créées...');
    for (const schema of tenantSchemas) {
      const checkResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1 
        AND table_name IN ('convention', 'delegation_signature', 'conseil_discipline')
        ORDER BY table_name
      `, [schema]);
      
      const tables = checkResult.rows.map(row => row.table_name);
      console.log(`  ${schema}: ${tables.join(', ') || 'Aucune table trouvée'}`);
    }

    // Vérifier la table audit_log dans public
    const auditCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_log'
      ) as exists
    `);
    
    if (auditCheck.rows[0].exists) {
      console.log('\n✅ Table public.audit_log créée avec succès');
    } else {
      console.log('\n⚠️  Table public.audit_log non trouvée');
    }

    console.log('\n✅ Migration terminée avec succès!');

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'application de la migration:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Exécuter la migration
applyMigration().catch(console.error);

// Made with Bob
