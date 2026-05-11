const { Client } = require('pg');
require('dotenv').config();

async function checkAllColumns() {
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
    
    const tables = ['etudiant', 'session_examen', 'utilisateur', 'parcours', 'inscription'];
    
    for (const table of tables) {
      console.log(`\n=== Table: ${table.toUpperCase()} ===`);
      const result = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'tenant_ispm' AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);
      
      result.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type}`);
      });
    }
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await client.end();
  }
}

checkAllColumns();

// Made with Bob
