const { Client } = require('pg');
require('dotenv').config();

async function diagnoseError() {
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

    // Test with tenant_test schema (the one being used)
    const schema = 'tenant_test';
    console.log(`🔍 Diagnosing schema: ${schema}\n`);

    await client.query(`SET search_path TO ${schema}, public`);

    // 1. Check depense table structure
    console.log('1️⃣ Checking depense table structure in tenant_test...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = 'depense'
      ORDER BY ordinal_position
    `, [schema]);
    
    if (columnsResult.rows.length === 0) {
      console.log('   ❌ Table depense does NOT exist in tenant_test!');
      console.log('   Creating depense table...\n');
      
      // Create the table
      await client.query(`
        CREATE TABLE IF NOT EXISTS depense (
          id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
          budget_id           UUID        REFERENCES budget(id),
          annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
          libelle             VARCHAR(300) NOT NULL,
          montant             DECIMAL(12,2) NOT NULL CHECK (montant > 0),
          categorie           VARCHAR(100),
          date_depense        DATE        NOT NULL DEFAULT CURRENT_DATE,
          fournisseur         VARCHAR(200),
          numero_facture      VARCHAR(100),
          facture_url         VARCHAR(500),
          statut              VARCHAR(20) DEFAULT 'en_attente'
                              CHECK (statut IN ('en_attente', 'approuve', 'paye', 'rejete')),
          demande_par         UUID        REFERENCES utilisateur(id),
          approuve_par        UUID        REFERENCES utilisateur(id),
          date_approbation    TIMESTAMPTZ,
          observations        TEXT,
          valide_par_president UUID,
          valide_le           TIMESTAMPTZ,
          motif_decision      TEXT,
          conditions_speciales TEXT,
          created_at          TIMESTAMPTZ DEFAULT NOW(),
          updated_at          TIMESTAMPTZ DEFAULT NOW()
        );
      `);
      
      console.log('   ✅ Table depense created in tenant_test\n');
    } else {
      console.log('   ✅ Table exists with columns:', columnsResult.rows.map(r => r.column_name).join(', '));
      const hasUpdatedAt = columnsResult.rows.some(r => r.column_name === 'updated_at');
      console.log(`   Updated_at column: ${hasUpdatedAt ? 'YES ✅' : 'NO ❌'}\n`);
    }

    // 2. Check if budget table exists
    console.log('2️⃣ Checking budget table...');
    const budgetCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name = 'budget'
      )
    `, [schema]);
    console.log(`   Budget table exists: ${budgetCheck.rows[0].exists ? 'YES ✅' : 'NO ❌'}\n`);

    // 3. Check annee_academique
    console.log('3️⃣ Checking annee_academique...');
    const anneeResult = await client.query(`
      SELECT id, libelle, active FROM annee_academique ORDER BY active DESC, date_debut DESC LIMIT 5
    `);
    
    if (anneeResult.rows.length > 0) {
      console.log('   Available years:');
      anneeResult.rows.forEach(row => {
        console.log(`   - ${row.libelle} (${row.active ? 'ACTIVE ✅' : 'inactive'})`);
      });
      console.log();
    } else {
      console.log('   ❌ No annee_academique found!\n');
    }

    // 4. Test the exact query from the service
    console.log('4️⃣ Testing the exact query from economat.service.ts...');
    const testQuery = `
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
      LIMIT 10
    `;

    try {
      const result = await client.query(testQuery);
      console.log(`   ✅ Query executed successfully`);
      console.log(`   Found ${result.rows.length} depenses\n`);
      
      if (result.rows.length > 0) {
        console.log('   Sample depense:');
        const sample = result.rows[0];
        console.log(`   - Libellé: ${sample.libelle}`);
        console.log(`   - Montant: ${sample.montant}`);
        console.log(`   - Statut: ${sample.statut}\n`);
      }
    } catch (error) {
      console.error('   ❌ Query failed!');
      console.error('   Error:', error.message);
      console.error('   Detail:', error.detail || 'N/A');
      console.error('   Hint:', error.hint || 'N/A\n');
    }

    console.log('✅ Diagnosis complete!\n');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

diagnoseError();

// Made with Bob
