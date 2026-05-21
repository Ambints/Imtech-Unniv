const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'imtech_university',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function checkEconomatTables() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Set schema to tenant_test
    await client.query(`SET search_path TO tenant_test, public`);
    console.log('\n📍 Schema set to: tenant_test\n');

    // Check for economat tables
    const tables = ['budget', 'depense', 'paiement', 'echeancier', 'grille_tarifaire', 'inscription', 'departement', 'annee_academique'];
    
    console.log('=========================================');
    console.log('Checking Economat Tables');
    console.log('=========================================\n');

    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'tenant_test' 
          AND table_name = $1
        ) as exists
      `, [table]);
      
      const exists = result.rows[0].exists;
      console.log(`${exists ? '✅' : '❌'} Table ${table}: ${exists ? 'EXISTS' : 'MISSING'}`);
    }

    console.log('\n=========================================');
    console.log('Counting Data');
    console.log('=========================================\n');

    // Count data in existing tables
    for (const table of tables) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`📊 ${table}: ${countResult.rows[0].count} rows`);
      } catch (error) {
        console.log(`❌ ${table}: Table does not exist or error - ${error.message}`);
      }
    }

    // Check if annee_academique has active year
    console.log('\n=========================================');
    console.log('Active Academic Year');
    console.log('=========================================\n');
    
    try {
      const activeYear = await client.query(`
        SELECT id, libelle, active 
        FROM annee_academique 
        WHERE active = TRUE
      `);
      
      if (activeYear.rows.length > 0) {
        console.log('✅ Active academic year found:');
        console.log(activeYear.rows[0]);
      } else {
        console.log('⚠️  No active academic year found');
      }
    } catch (error) {
      console.log(`❌ Error checking active year: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('\n✅ Connection closed');
  }
}

checkEconomatTables();

// Made with Bob
