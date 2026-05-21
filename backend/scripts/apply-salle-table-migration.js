const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
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

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../migrations/add-salle-table-to-tenant.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('\n📝 Applying migration: add-salle-table-to-tenant.sql');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Migration applied successfully!');
    
    // Verify the table was created
    const schema = 'tenant_324746c0_67d0_4d87_b9d6_1af7d149599b';
    const checkTable = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1 AND table_name = 'salle'
    `, [schema]);
    
    if (checkTable.rows.length > 0) {
      console.log('✅ Salle table exists in tenant schema');
      
      // Count rows
      const count = await client.query(`SELECT COUNT(*) as count FROM ${schema}.salle`);
      console.log(`📊 Number of salles: ${count.rows[0].count}`);
      
      // Show sample data
      const sample = await client.query(`SELECT id, nom, code, capacite, type_salle FROM ${schema}.salle LIMIT 5`);
      console.log('\n📋 Sample salles:');
      sample.rows.forEach(salle => {
        console.log(`  - ${salle.nom} (${salle.code}): ${salle.capacite} places, type: ${salle.type_salle}`);
      });
    } else {
      console.log('❌ Salle table was not created');
    }
    
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

applyMigration();

// Made with Bob
