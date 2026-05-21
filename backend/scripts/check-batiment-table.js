const { Client } = require('pg');

async function checkBatimentTable() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '2007',
    database: 'Imtech_SaaS'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const schema = 'tenant_test';
    
    // Check if batiment table exists
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1 AND table_name = 'batiment'
    `, [schema]);
    
    console.log('📋 Batiment table exists:', tableCheck.rows.length > 0 ? 'YES' : 'NO');
    
    if (tableCheck.rows.length > 0) {
      // Get columns
      const columns = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = $1 AND table_name = 'batiment'
        ORDER BY ordinal_position
      `, [schema]);
      
      console.log('\n📊 Batiment table columns:');
      columns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Count rows
      const count = await client.query(`SELECT COUNT(*) as count FROM ${schema}.batiment`);
      console.log(`\n📈 Number of batiments: ${count.rows[0].count}`);
      
      if (count.rows[0].count > 0) {
        // Sample data
        const sample = await client.query(`SELECT * FROM ${schema}.batiment LIMIT 5`);
        console.log('\n📝 Sample batiments:');
        sample.rows.forEach(b => {
          console.log(`  - ${b.nom} (${b.code}): ${b.adresse || 'Pas d\'adresse'}`);
        });
      }
    } else {
      console.log('\n❌ Table batiment does not exist in schema:', schema);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

checkBatimentTable();

// Made with Bob
