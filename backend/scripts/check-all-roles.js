const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007'
});

async function checkAllRoles() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔍 Vérification de tous les rôles dans les schémas tenant...\n');
    
    // Récupérer tous les schémas tenant
    const schemasResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);
    
    for (const { schema_name } of schemasResult.rows) {
      console.log(`📦 ${schema_name}:`);
      
      // Récupérer tous les rôles distincts
      const rolesResult = await client.query(`
        SELECT DISTINCT role, COUNT(*) as count
        FROM ${schema_name}.utilisateur
        GROUP BY role
        ORDER BY role
      `);
      
      for (const row of rolesResult.rows) {
        console.log(`  - ${row.role}: ${row.count} utilisateur(s)`);
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAllRoles();

// Made with Bob
