const { Client } = require('pg');
require('dotenv').config();

async function testDepensesEndpoint() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'imtech_university',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Test with tenant_ispm schema
    const schema = 'tenant_ispm';
    console.log(`🔍 Testing queries for schema: ${schema}\n`);

    // Set search path
    await client.query(`SET search_path TO ${schema}, public`);

    // Test 1: Check depense table structure
    console.log('1️⃣ Checking depense table structure...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = 'depense'
      ORDER BY ordinal_position
    `, [schema]);
    
    console.log('   Columns:', columnsResult.rows.map(r => r.column_name).join(', '));
    const hasUpdatedAt = columnsResult.rows.some(r => r.column_name === 'updated_at');
    console.log(`   ✓ Has updated_at column: ${hasUpdatedAt ? 'YES' : 'NO'}\n`);

    // Test 2: Check if there are any depenses
    console.log('2️⃣ Checking existing depenses...');
    const countResult = await client.query(`SELECT COUNT(*) as total FROM depense`);
    console.log(`   Total depenses: ${countResult.rows[0].total}\n`);

    // Test 3: Test the main query used by getDepenses
    console.log('3️⃣ Testing main depenses query...');
    const mainQuery = `
      SELECT 
        d.id, d.libelle, d.montant, d.date_depense, d.fournisseur,
        d.numero_facture, d.statut, d.categorie, d.facture_url,
        d.observations, d.date_approbation, d.updated_at,
        b.categorie as budget_categorie,
        u1.nom as demandeur, u2.nom as approbateur,
        aa.libelle as annee
      FROM depense d
      LEFT JOIN budget b ON d.budget_id = b.id
      LEFT JOIN utilisateur u1 ON d.demande_par = u1.id
      LEFT JOIN utilisateur u2 ON d.approuve_par = u2.id
      JOIN annee_academique aa ON d.annee_academique_id = aa.id
      WHERE aa.active = TRUE
      ORDER BY d.date_depense DESC, d.created_at DESC
      LIMIT 10
    `;

    try {
      const result = await client.query(mainQuery);
      console.log(`   ✅ Query executed successfully`);
      console.log(`   Found ${result.rows.length} depenses`);
      
      if (result.rows.length > 0) {
        console.log('\n   Sample depense:');
        const sample = result.rows[0];
        console.log(`   - ID: ${sample.id}`);
        console.log(`   - Libellé: ${sample.libelle}`);
        console.log(`   - Montant: ${sample.montant}`);
        console.log(`   - Statut: ${sample.statut}`);
        console.log(`   - Date: ${sample.date_depense}`);
        console.log(`   - Updated at: ${sample.updated_at || 'NULL'}`);
      }
    } catch (error) {
      console.error('   ❌ Query failed:', error.message);
      console.error('   Error details:', error);
    }

    // Test 4: Test stats query
    console.log('\n4️⃣ Testing stats query...');
    const statsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE statut = 'en_attente') as nb_en_attente,
        COUNT(*) FILTER (WHERE statut = 'approuve') as nb_approuve,
        COUNT(*) FILTER (WHERE statut = 'paye') as nb_paye,
        COUNT(*) FILTER (WHERE statut = 'rejete') as nb_rejete,
        COALESCE(SUM(montant), 0) as montant_total
      FROM depense d
      JOIN annee_academique aa ON d.annee_academique_id = aa.id
      WHERE aa.active = TRUE
    `;

    try {
      const statsResult = await client.query(statsQuery);
      console.log('   ✅ Stats query executed successfully');
      console.log('   Stats:', statsResult.rows[0]);
    } catch (error) {
      console.error('   ❌ Stats query failed:', error.message);
    }

    // Test 5: Check active annee_academique
    console.log('\n5️⃣ Checking active annee_academique...');
    const anneeResult = await client.query(`
      SELECT id, libelle, active FROM annee_academique WHERE active = TRUE
    `);
    
    if (anneeResult.rows.length > 0) {
      console.log(`   ✅ Active year: ${anneeResult.rows[0].libelle}`);
    } else {
      console.log('   ⚠️  No active annee_academique found!');
    }

    console.log('\n✅ All tests completed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testDepensesEndpoint();

// Made with Bob
