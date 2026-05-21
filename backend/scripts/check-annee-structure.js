const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:2007@localhost:5432/Imtech_SaaS'
});

async function checkStructure() {
  try {
    await client.connect();
    
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'tenant_ispm' 
      AND table_name = 'annee_academique' 
      ORDER BY ordinal_position
    `);
    
    console.log('Colonnes de la table annee_academique:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type})`);
    });
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await client.end();
  }
}

checkStructure();

// Made with Bob
