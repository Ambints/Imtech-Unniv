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

    // Check affectation_cours structure
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

    // Check if there are any affectations
    const count = await client.query(`
      SELECT COUNT(*) as total FROM tenant_test.affectation_cours
    `);
    console.log(`Nombre d'affectations: ${count.rows[0].total}\n`);

    // Check enseignant table
    const enseignants = await client.query(`
      SELECT COUNT(*) as total FROM tenant_test.enseignant
    `);
    console.log(`Nombre d'enseignants: ${enseignants.rows[0].total}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkAffectationStructure();

// Made with Bob
