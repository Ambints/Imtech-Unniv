const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007',
});

async function checkConstraints() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const result = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition 
      FROM pg_constraint 
      WHERE conrelid='tenant_test.enseignant'::regclass AND contype='c'
    `);

    console.log('Contraintes CHECK sur la table enseignant:');
    console.log('='.repeat(80));
    result.rows.forEach(row => {
      console.log(`\n${row.conname}:`);
      console.log(`  ${row.definition}`);
    });
    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkConstraints();

// Made with Bob
