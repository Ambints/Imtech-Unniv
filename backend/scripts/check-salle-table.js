const { Client } = require('pg');

async function checkSalleTable() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '2007',
    database: 'Imtech_SaaS'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const schema = 'tenant_324746c0_67d0_4d87_b9d6_1af7d149599b';
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1 AND table_name = 'salle'
    `, [schema]);
    
    console.log('\n📋 Salle table exists:', tableCheck.rows.length > 0 ? 'YES' : 'NO');
    
    if (tableCheck.rows.length > 0) {
      // Get columns
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = $1 AND table_name = 'salle'
        ORDER BY ordinal_position
      `, [schema]);
      
      console.log('\n📊 Salle table columns:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Count rows
      const count = await client.query(`SELECT COUNT(*) as count FROM ${schema}.salle`);
      console.log(`\n📈 Number of salles: ${count.rows[0].count}`);
      
      // Sample data
      const sample = await client.query(`SELECT * FROM ${schema}.salle LIMIT 3`);
      console.log('\n📝 Sample data:');
      console.log(JSON.stringify(sample.rows, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

checkSalleTable();

// Made with Bob
