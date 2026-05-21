const { Client } = require('pg');
require('dotenv').config();

async function simulateServiceQuery() {
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

    const schema = 'tenant_test';
    console.log(`🔍 Simulating EconomatService query for schema: ${schema}\n`);

    // Set search path exactly like the service does
    await client.query(`SET search_path TO "${schema}", public`);
    console.log(`✅ Search path set to: "${schema}", public\n`);

    // Test 1: Count query (this is what runs first)
    console.log('1️⃣ Testing COUNT query...');
    const countQuery = `
      SELECT COUNT(*) as total
      FROM depense d
      LEFT JOIN budget b ON d.budget_id = b.id
      LEFT JOIN utilisateur u1 ON d.demande_par = u1.id
      LEFT JOIN utilisateur u2 ON d.approuve_par = u2.id
      JOIN annee_academique aa ON d.annee_academique_id = aa.id
      WHERE aa.active = TRUE
    `;

    try {
      const countResult = await client.query(countQuery);
      console.log(`   ✅ Count query successful: ${countResult.rows[0].total} depenses\n`);
    } catch (error) {
      console.error('   ❌ Count query FAILED!');
      console.error('   Error:', error.message);
      console.error('   Detail:', error.detail);
      console.error('   Hint:', error.hint);
      console.error('   Position:', error.position);
      console.error('   Full error:', error);
      return;
    }

    // Test 2: Main query with all columns
    console.log('2️⃣ Testing MAIN query with all columns...');
    const mainQuery = `
      SELECT 
        d.id, d.libelle, d.montant, d.date_depense, d.fournisseur,
        d.numero_facture, d.statut, d.categorie, d.facture_url,
        d.observations, d.date_approbation, d.created_at, d.updated_at,
        d.valide_par_president, d.valide_le, d.motif_decision, d.conditions_speciales,
        b.categorie as budget_categorie,
        u1.nom as demandeur, 
        u1.prenom as demandeur_prenom,
        u2.nom as approbateur,
        u2.prenom as approbateur_prenom,
        aa.libelle as annee
      FROM depense d
      LEFT JOIN budget b ON d.budget_id = b.id
      LEFT JOIN utilisateur u1 ON d.demande_par = u1.id
      LEFT JOIN utilisateur u2 ON d.approuve_par = u2.id
      JOIN annee_academique aa ON d.annee_academique_id = aa.id
      WHERE aa.active = TRUE
      ORDER BY d.date_depense DESC, d.created_at DESC
      LIMIT 10 OFFSET 0
    `;

    try {
      const mainResult = await client.query(mainQuery);
      console.log(`   ✅ Main query successful: ${mainResult.rows.length} rows returned\n`);
      
      if (mainResult.rows.length > 0) {
        console.log('   📋 First row data:');
        const first = mainResult.rows[0];
        console.log(`   - ID: ${first.id}`);
        console.log(`   - Libellé: ${first.libelle}`);
        console.log(`   - Montant: ${first.montant}`);
        console.log(`   - Statut: ${first.statut}`);
        console.log(`   - Demandeur: ${first.demandeur} ${first.demandeur_prenom || ''}`);
        console.log(`   - Année: ${first.annee}`);
        console.log(`   - Created: ${first.created_at}`);
        console.log(`   - Updated: ${first.updated_at}\n`);
      }
    } catch (error) {
      console.error('   ❌ Main query FAILED!');
      console.error('   Error:', error.message);
      console.error('   Detail:', error.detail);
      console.error('   Hint:', error.hint);
      console.error('   Position:', error.position);
      console.error('   Code:', error.code);
      console.error('   Full error:', JSON.stringify(error, null, 2));
      return;
    }

    // Test 3: Stats query
    console.log('3️⃣ Testing STATS query...');
    const statsQuery = `
      SELECT
        COUNT(*) FILTER (WHERE statut = 'en_attente') as nb_en_attente,
        COALESCE(SUM(montant) FILTER (WHERE statut = 'en_attente'), 0) as montant_total,
        COUNT(*) FILTER (WHERE statut = 'approuve') as nb_approuve,
        COUNT(*) FILTER (WHERE statut = 'paye') as nb_paye,
        COUNT(*) FILTER (WHERE statut = 'rejete') as nb_rejete
      FROM depense d
      JOIN annee_academique aa ON d.annee_academique_id = aa.id
      WHERE aa.active = TRUE
    `;

    try {
      const statsResult = await client.query(statsQuery);
      console.log('   ✅ Stats query successful');
      console.log('   Stats:', statsResult.rows[0]);
      console.log();
    } catch (error) {
      console.error('   ❌ Stats query FAILED!');
      console.error('   Error:', error.message);
      console.error('   Detail:', error.detail);
      return;
    }

    console.log('✅ All queries executed successfully!\n');
    console.log('🎯 Conclusion: The queries work fine in isolation.');
    console.log('   The 500 error must be coming from something else in the service.');
    console.log('   Please check the backend logs for the actual error message.\n');

  } catch (error) {
    console.error('❌ Connection or setup error:', error);
  } finally {
    await client.end();
  }
}

simulateServiceQuery();

// Made with Bob
