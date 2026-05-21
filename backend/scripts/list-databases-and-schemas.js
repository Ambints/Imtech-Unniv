const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'postgres', // Se connecter à postgres pour lister les bases
  user: 'postgres',
  password: '2007'
});

async function listDatabasesAndSchemas() {
  try {
    console.log('🔍 Listing databases...\n');
    
    // Lister toutes les bases de données
    const dbResult = await pool.query(`
      SELECT datname FROM pg_database 
      WHERE datistemplate = false 
      ORDER BY datname
    `);
    
    console.log('📊 Bases de données disponibles:');
    dbResult.rows.forEach(db => {
      console.log(`  - ${db.datname}`);
    });
    
    await pool.end();
    
    // Se connecter à Imtech_SaaS pour voir les schémas
    const saasPool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'Imtech_SaaS',
      user: 'postgres',
      password: '2007'
    });
    
    console.log('\n🔍 Schémas dans Imtech_SaaS:');
    const schemaResult = await saasPool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `);
    
    schemaResult.rows.forEach(s => {
      console.log(`  - ${s.schema_name}`);
    });
    
    // Vérifier si la table tenants existe
    console.log('\n🔍 Recherche de la table tenants...');
    const tenantTableResult = await saasPool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_name = 'tenants'
    `);
    
    if (tenantTableResult.rows.length > 0) {
      console.log('✅ Table tenants trouvée dans:');
      tenantTableResult.rows.forEach(t => {
        console.log(`  - ${t.table_schema}.${t.table_name}`);
      });
    } else {
      console.log('❌ Table tenants non trouvée');
    }
    
    await saasPool.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

listDatabasesAndSchemas();

// Made with Bob
