const { Client } = require('pg');

async function checkConstraints() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'Imtech_SaaS',
    user: 'postgres',
    password: '2007',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const schema = 'tenant_test';
    await client.query(`SET search_path TO ${schema}, public`);

    // Check stock constraints
    console.log('\n--- Stock Constraints ---');
    const stockConstraints = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = '${schema}.stock'::regclass
      AND contype = 'c'
    `);
    stockConstraints.rows.forEach(row => {
      console.log(`${row.conname}:`);
      console.log(`  ${row.definition}\n`);
    });

    // Check ticket_maintenance constraints
    console.log('\n--- Ticket Maintenance Constraints ---');
    const ticketConstraints = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = '${schema}.ticket_maintenance'::regclass
      AND contype = 'c'
    `);
    ticketConstraints.rows.forEach(row => {
      console.log(`${row.conname}:`);
      console.log(`  ${row.definition}\n`);
    });

    // Check rapport_entretien constraints
    console.log('\n--- Rapport Entretien Constraints ---');
    const rapportConstraints = await client.query(`
      SELECT conname, pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = '${schema}.rapport_entretien'::regclass
      AND contype = 'c'
    `);
    rapportConstraints.rows.forEach(row => {
      console.log(`${row.conname}:`);
      console.log(`  ${row.definition}\n`);
    });

    // Check current data
    console.log('\n--- Current Data Counts ---');
    const counts = await Promise.all([
      client.query(`SELECT COUNT(*) as count FROM stock`),
      client.query(`SELECT COUNT(*) as count FROM ticket_maintenance`),
      client.query(`SELECT COUNT(*) as count FROM planning_entretien`),
      client.query(`SELECT COUNT(*) as count FROM rapport_entretien`),
      client.query(`SELECT COUNT(*) as count FROM reservation_salle`),
      client.query(`SELECT COUNT(*) as count FROM demande_ressource`),
    ]);

    console.log(`Stock: ${counts[0].rows[0].count}`);
    console.log(`Tickets: ${counts[1].rows[0].count}`);
    console.log(`Planning: ${counts[2].rows[0].count}`);
    console.log(`Rapports: ${counts[3].rows[0].count}`);
    console.log(`Réservations: ${counts[4].rows[0].count}`);
    console.log(`Demandes: ${counts[5].rows[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkConstraints();

// Made with Bob
