const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007',
});

async function checkAffectationStructure() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema='tenant_test' AND table_name='affectation_cours' 
      ORDER BY ordinal_position
    `);

    console.log('Colonnes de la table affectation_cours:');
    console.log('='.repeat(60));
    result.rows.forEach(row => {
      console.log(`- ${row.column_name.padEnd(25)} : ${row.data_type.padEnd(20)} (${row.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });
    console.log('='.repeat(60));
    console.log(`Total: ${result.rows.length} colonnes\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAffectationStructure();

// Made with Bob
