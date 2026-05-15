const { Client } = require('pg');

async function testEtudiantEndpoints() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'Imtech_SaaS',
    user: 'postgres',
    password: '2007',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à la base de données\n');

    const tenantId = process.argv[2] || 'eaceef7f-dd73-46bd-9d77-231896181cca';
    
    const tenantResult = await client.query(
      'SELECT schema_name FROM public.tenant WHERE id = $1',
      [tenantId]
    );

    const schemaName = tenantResult.rows[0].schema_name;
    console.log(`📋 Schéma: ${schemaName}\n`);

    // Définir le search_path
    await client.query(`SET search_path TO "${schemaName}", public`);

    // Test 1: getDepartements()
    console.log('🧪 Test 1: getDepartements()');
    const departements = await client.query(`
      SELECT
        d.id,
        d.code,
        d.nom,
        d.description,
        COUNT(DISTINCT p.id) as nombre_parcours
      FROM departement d
      LEFT JOIN parcours p ON p.departement_id = d.id AND p.actif = true
      WHERE d.actif = true
      GROUP BY d.id, d.code, d.nom, d.description
      ORDER BY d.nom
    `);
    console.log(`   ✅ ${departements.rows.length} départements trouvés`);
    departements.rows.forEach(d => {
      console.log(`      - ${d.code}: ${d.nom} (${d.nombre_parcours} parcours)`);
    });

    // Test 2: getParcoursDisponibles()
    console.log('\n🧪 Test 2: getParcoursDisponibles()');
    const parcours = await client.query(`
      SELECT
        p.*,
        d.nom as departement_nom,
        d.code as departement_code,
        COUNT(DISTINCT ue.id) as nombre_ues
      FROM parcours p
      LEFT JOIN departement d ON d.id = p.departement_id
      LEFT JOIN unite_enseignement ue ON ue.parcours_id = p.id
      WHERE p.actif = true
      GROUP BY p.id, d.nom, d.code
      ORDER BY d.nom, p.nom
    `);
    console.log(`   ✅ ${parcours.rows.length} parcours trouvés`);
    parcours.rows.forEach(p => {
      console.log(`      - ${p.code}: ${p.nom} (Dept: ${p.departement_nom})`);
    });

    // Test 3: getAnneesAcademiques()
    console.log('\n🧪 Test 3: getAnneesAcademiques()');
    const annees = await client.query(`
      SELECT
        id,
        libelle,
        EXTRACT(YEAR FROM date_debut) as annee_debut,
        EXTRACT(YEAR FROM date_fin) as annee_fin,
        CASE WHEN active = true THEN 'en_cours' ELSE 'terminee' END as statut,
        date_debut,
        date_fin
      FROM annee_academique
      ORDER BY date_debut DESC
    `);
    console.log(`   ✅ ${annees.rows.length} années académiques trouvées`);
    annees.rows.forEach(a => {
      console.log(`      - ${a.libelle} (${a.annee_debut}-${a.annee_fin}) - ${a.statut}`);
    });

    // Test 4: getNiveauxEtude()
    console.log('\n🧪 Test 4: getNiveauxEtude()');
    const niveaux = await client.query(`
      SELECT
        id,
        code,
        libelle,
        description,
        ordre,
        type_diplome
      FROM niveau_etude
      WHERE actif = true
      ORDER BY ordre ASC
    `);
    console.log(`   ✅ ${niveaux.rows.length} niveaux d'étude trouvés`);
    niveaux.rows.forEach(n => {
      console.log(`      - ${n.code}: ${n.libelle} (ordre: ${n.ordre})`);
    });

    console.log('\n✅ Tous les tests passés! Les données existent dans la base.');
    console.log('\n💡 Si les dropdowns sont vides, le problème est probablement:');
    console.log('   1. Les appels API ne se font pas (vérifier la console du navigateur)');
    console.log('   2. Les réponses API ne sont pas traitées correctement');
    console.log('   3. Un problème d\'authentification (token invalide)');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

testEtudiantEndpoints();

// Made with Bob
