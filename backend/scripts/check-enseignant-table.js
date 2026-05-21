const { Client } = require('pg');

async function checkEnseignantTable() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'imtech_university',
    user: 'postgres',
    password: 'postgres'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check tables with 'enseignant' in tenant_test schema
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'tenant_test' 
      AND table_name LIKE '%enseignant%'
      ORDER BY table_name
    `);
    
    console.log('\n=== Tables with "enseignant" in tenant_test schema ===');
    console.log(tables.rows);

    // Check all tables in tenant_test
    const allTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'tenant_test' 
      ORDER BY table_name
      LIMIT 20
    `);
    
    console.log('\n=== First 20 tables in tenant_test schema ===');
    allTables.rows.forEach(row => console.log(row.table_name));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

checkEnseignantTable();

// Made with Bob
