const { Client } = require('pg');
require('dotenv').config();

async function checkColumns() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    await client.query(`SET search_path TO tenant_ispm`);
    
    console.log('=== Colonnes de la table DELIBERATION ===');
    const delib = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'tenant_ispm' AND table_name = 'deliberation' 
      ORDER BY ordinal_position
    `);
    delib.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));
    
    console.log('\n=== Colonnes de la table DIPLOME ===');
    const dipl = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'tenant_ispm' AND table_name = 'diplome' 
      ORDER BY ordinal_position
    `);
    dipl.rows.forEach(row => console.log(`  ${row.column_name}: ${row.data_type}`));
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await client.end();
  }
}

checkColumns();

// Made with Bob
