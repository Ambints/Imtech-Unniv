const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'imtech_university',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function checkPaiementStructure() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    await client.query(`SET search_path TO tenant_test, public`);

    console.log('=========================================');
    console.log('Paiement Table Structure');
    console.log('=========================================\n');

    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'tenant_test'
      AND table_name = 'paiement'
      ORDER BY ordinal_position
    `);

    if (columnsResult.rows.length > 0) {
      console.log('Columns in paiement table:');
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    } else {
      console.log('❌ No columns found or table does not exist');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('\n✅ Connection closed');
  }
}

checkPaiementStructure();

// Made with Bob
