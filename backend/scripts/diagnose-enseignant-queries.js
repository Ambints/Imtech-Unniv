const { Client } = require('pg');

async function diagnose() {
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

    const schemas = ['tenant_test', 'tenant_ispm'];

    for (const schema of schemas) {
      console.log(`\n========================================`);
      console.log(`🔍 DIAGNOSING SCHEMA: ${schema}`);
      console.log(`========================================`);

      // Set search path
      await client.query(`SET search_path TO "${schema}", public`);

      // Check if tables exist
      const tablesToCheck = ['enseignant', 'affectation_cours', 'unite_enseignement', 'annee_academique', 'element_constitutif', 'emploi_du_temps'];
      console.log('\n--- 1. Table existence checks ---');
      for (const table of tablesToCheck) {
        const existCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = $1 AND table_name = $2
          )
        `, [schema, table]);
        console.log(`Table '${table}': ${existCheck.rows[0].exists ? '✅ EXISTS' : '❌ MISSING'}`);
      }

      // Check users with role 'enseignant'
      console.log('\n--- 2. Enseignants and linked Users ---');
      const enseignants = await client.query(`
        SELECT 
          e.id as enseignant_id, e.nom, e.prenom, e.utilisateur_id,
          u.email, u.role
        FROM enseignant e
        LEFT JOIN utilisateur u ON u.id = e.utilisateur_id
      `);
      console.log(`Found ${enseignants.rows.length} enseignants:`);
      console.log(JSON.stringify(enseignants.rows, null, 2));

      if (enseignants.rows.length === 0) {
        console.log(`⚠️ No enseignants in ${schema}. Skipping queries.`);
        continue;
      }

      const activeUser = enseignants.rows[0];
      const userId = activeUser.utilisateur_id;
      console.log(`\nRunning test queries for userId: ${userId} (${activeUser.nom} ${activeUser.prenom})`);

      // Test 1: Check active academic year
      const activeYear = await client.query(`
        SELECT id, libelle, active FROM annee_academique WHERE active = true
      `);
      console.log('\nActive Academic Year:', activeYear.rows);

      // Test 2: Simulate getMesCours SELECT query
      console.log('\n--- 3. Running getMesCours query ---');
      try {
        const queryCours = `
          SELECT
            ac.id,
            ac.enseignant_id,
            ac.ue_id,
            ac.ec_id,
            ac.type_seance,
            ac.volume_prevu,
            ac.volume_realise,
            ac.annee_academique_id,
            COALESCE(ec.intitule, ue.intitule) as cours_nom,
            COALESCE(ec.code, ue.code) as cours_code,
            COALESCE(ec.credits_ects, ue.credits_ects) as credits_ects,
            ue.intitule as ue_nom,
            ue.code as ue_code,
            ue.semestre,
            aa.libelle as annee_academique,
            aa.date_debut,
            aa.date_fin,
            (SELECT COUNT(*) FROM emploi_du_temps edt WHERE edt.affectation_id = ac.id) as nb_seances,
            0 as nb_etudiants
          FROM affectation_cours ac
          LEFT JOIN element_constitutif ec ON ec.id = ac.ec_id
          LEFT JOIN unite_enseignement ue ON ue.id = COALESCE(ac.ue_id, ec.ue_id)
          JOIN annee_academique aa ON aa.id = ac.annee_academique_id
          JOIN enseignant e ON e.id = ac.enseignant_id
          WHERE e.utilisateur_id = $1 AND aa.active = true
          ORDER BY aa.date_debut DESC, ue.code, COALESCE(ec.code, '')
        `;
        const res = await client.query(queryCours, [userId]);
        console.log(`✅ Success! Returned ${res.rows.length} cours.`);
        console.log(JSON.stringify(res.rows, null, 2));
      } catch (err) {
        console.log('❌ getMesCours query FAILED!');
        console.error(err.message);
        if (err.stack) console.error(err.stack);
      }

      // Test 3: Simulate getMesStats query
      console.log('\n--- 4. Running getMesStats queries ---');
      try {
        const nbCours = await client.query(`
          SELECT COUNT(DISTINCT ac.id) as count
          FROM affectation_cours ac
          JOIN enseignant e ON e.id = ac.enseignant_id
          JOIN annee_academique aa ON aa.id = ac.annee_academique_id
          WHERE e.utilisateur_id = $1 AND aa.active = true
        `, [userId]);
        console.log(`✅ count courses query successful: ${nbCours.rows[0].count}`);

        const nbSeances = await client.query(`
          SELECT COUNT(DISTINCT edt.id) as count
          FROM emploi_du_temps edt
          JOIN affectation_cours ac ON ac.id = edt.affectation_id
          JOIN enseignant e ON e.id = ac.enseignant_id
          JOIN annee_academique aa ON aa.id = ac.annee_academique_id
          WHERE e.utilisateur_id = $1 AND aa.active = true
        `, [userId]);
        console.log(`✅ count seances query successful: ${nbSeances.rows[0].count}`);

      } catch (err) {
        console.log('❌ getMesStats query FAILED!');
        console.error(err.message);
      }

      // Test 4: Simulate getSessionsEvaluation query
      console.log('\n--- 5. Running getSessionsEvaluation query ---');
      try {
        const querySessions = `
          SELECT DISTINCT
            se.id,
            se.libelle,
            se.type_session,
            se.date_debut,
            se.date_fin,
            aa.libelle as annee_academique,
            COUNT(DISTINCT n.id) as notes_saisies,
            COUNT(DISTINCT i.etudiant_id) as total_etudiants
          FROM session_examen se
          JOIN annee_academique aa ON aa.id = se.annee_academique_id
          JOIN affectation_cours ac ON ac.annee_academique_id = se.annee_academique_id
          JOIN enseignant e ON e.id = ac.enseignant_id
          LEFT JOIN element_constitutif ec ON ec.id = ac.ec_id
          LEFT JOIN unite_enseignement ue ON ue.id = COALESCE(ac.ue_id, ec.ue_id)
          LEFT JOIN note n ON n.session_id = se.id AND n.ec_id = ac.ec_id
          LEFT JOIN inscription i ON i.annee_academique_id = se.annee_academique_id
            AND i.parcours_id = ue.parcours_id AND i.statut = 'validee'
          WHERE e.utilisateur_id = $1
            AND se.date_fin >= NOW()
          GROUP BY se.id, se.libelle, se.type_session, se.date_debut, se.date_fin, aa.libelle
          ORDER BY se.date_debut
        `;
        const res = await client.query(querySessions, [userId]);
        console.log(`✅ Success! Returned ${res.rows.length} sessions.`);
        console.log(JSON.stringify(res.rows, null, 2));
      } catch (err) {
        console.log('❌ getSessionsEvaluation query FAILED!');
        console.error(err.message);
        if (err.stack) console.error(err.stack);
      }
    }

  } catch (err) {
    console.error('❌ Diagnostic error:', err.message);
  } finally {
    await client.end();
  }
}

diagnose();
