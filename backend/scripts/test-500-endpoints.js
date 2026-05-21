const { Client } = require('pg');

async function testEndpoints() {
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

    const tenantId = '324746c0-67d0-4d87-b9d6-1af7d149599b';
    
    // Get tenant schema
    const tenantResult = await client.query(
      'SELECT schema_name FROM tenant WHERE id = $1',
      [tenantId]
    );
    
    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant not found');
      return;
    }

    const schema = tenantResult.rows[0].schema_name;
    console.log(`✅ Tenant schema: ${schema}`);

    // Set search path
    await client.query(`SET search_path TO ${schema}, public`);
    console.log(`✅ Search path set to ${schema}`);

    // Test 1: Check salle table
    console.log('\n--- Test 1: Salles ---');
    try {
      const sallesResult = await client.query('SELECT COUNT(*) as count FROM salle');
      console.log(`✅ Salles count: ${sallesResult.rows[0].count}`);
      
      const sallesSample = await client.query('SELECT id, nom, code FROM salle LIMIT 3');
      console.log('Sample salles:', sallesSample.rows);
    } catch (err) {
      console.log('❌ Error querying salles:', err.message);
    }

    // Test 2: Check affectation_cours table
    console.log('\n--- Test 2: Affectations ---');
    try {
      const affectationsResult = await client.query('SELECT COUNT(*) as count FROM affectation_cours');
      console.log(`✅ Affectations count: ${affectationsResult.rows[0].count}`);
      
      const affectationsSample = await client.query('SELECT id, enseignant_id, ue_id FROM affectation_cours LIMIT 3');
      console.log('Sample affectations:', affectationsSample.rows);
    } catch (err) {
      console.log('❌ Error querying affectations:', err.message);
    }

    // Test 3: Check emploi_du_temps table
    console.log('\n--- Test 3: Emploi du temps ---');
    try {
      const edtResult = await client.query('SELECT COUNT(*) as count FROM emploi_du_temps');
      console.log(`✅ EDT count: ${edtResult.rows[0].count}`);
      
      const edtSample = await client.query('SELECT id, date_seance, heure_debut, heure_fin FROM emploi_du_temps LIMIT 3');
      console.log('Sample EDT:', edtSample.rows);
    } catch (err) {
      console.log('❌ Error querying emploi_du_temps:', err.message);
    }

    // Test 4: Check parcours table
    console.log('\n--- Test 4: Parcours ---');
    try {
      const parcoursResult = await client.query('SELECT id, nom, code FROM parcours LIMIT 5');
      console.log('Parcours:', parcoursResult.rows);
    } catch (err) {
      console.log('❌ Error querying parcours:', err.message);
    }

    // Test 5: Check unite_enseignement table
    console.log('\n--- Test 5: Unités d\'enseignement ---');
    try {
      const ueResult = await client.query('SELECT COUNT(*) as count FROM unite_enseignement');
      console.log(`✅ UE count: ${ueResult.rows[0].count}`);
    } catch (err) {
      console.log('❌ Error querying unite_enseignement:', err.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

testEndpoints();

// Made with Bob
