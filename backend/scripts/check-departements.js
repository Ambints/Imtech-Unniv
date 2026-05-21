const { Client } = require('pg');

async function checkDepartements() {
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
    
    // 1. Récupérer le schéma du tenant
    const tenantResult = await client.query(
      'SELECT schema_name, nom FROM public.tenant WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant non trouvé!');
      return;
    }

    const { schema_name: schemaName, nom: tenantName } = tenantResult.rows[0];
    console.log(`📋 Tenant: ${tenantName}`);
    console.log(`📋 Schéma: ${schemaName}\n`);

    // 2. Vérifier si la table departement existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = $1 
        AND table_name = 'departement'
      )
    `, [schemaName]);

    if (!tableExists.rows[0].exists) {
      console.log('❌ La table departement n\'existe PAS dans le schéma du tenant!\n');
      return;
    }

    console.log('✅ La table departement existe!\n');

    // 3. Vérifier les départements
    console.log('📊 Départements dans la base de données:');
    const departements = await client.query(`
      SELECT
        d.id,
        d.code,
        d.nom,
        d.description,
        d.actif,
        COUNT(DISTINCT p.id) as nombre_parcours
      FROM "${schemaName}".departement d
      LEFT JOIN "${schemaName}".parcours p ON p.departement_id = d.id AND p.actif = true
      GROUP BY d.id, d.code, d.nom, d.description, d.actif
      ORDER BY d.nom
    `);

    if (departements.rows.length === 0) {
      console.log('   ❌ Aucun département trouvé!\n');
      console.log('💡 Solution: Créer des départements dans la base de données');
    } else {
      departements.rows.forEach(dept => {
        const status = dept.actif ? '✅ Actif' : '❌ Inactif';
        console.log(`   ${status} - ${dept.code}: ${dept.nom}`);
        console.log(`      Description: ${dept.description || 'N/A'}`);
        console.log(`      Parcours: ${dept.nombre_parcours}`);
        console.log('');
      });
    }

    // 4. Vérifier les parcours
    console.log('📚 Parcours disponibles:');
    const parcours = await client.query(`
      SELECT
        p.id,
        p.code,
        p.nom,
        p.niveau,
        p.actif,
        d.nom as departement_nom,
        COUNT(DISTINCT ue.id) as nombre_ues
      FROM "${schemaName}".parcours p
      LEFT JOIN "${schemaName}".departement d ON d.id = p.departement_id
      LEFT JOIN "${schemaName}".unite_enseignement ue ON ue.parcours_id = p.id
      GROUP BY p.id, p.code, p.nom, p.niveau, p.actif, d.nom
      ORDER BY d.nom, p.nom
    `);

    if (parcours.rows.length === 0) {
      console.log('   ❌ Aucun parcours trouvé!\n');
    } else {
      parcours.rows.forEach(parc => {
        const status = parc.actif ? '✅' : '❌';
        console.log(`   ${status} ${parc.code}: ${parc.nom} (${parc.niveau})`);
        console.log(`      Département: ${parc.departement_nom || 'N/A'}`);
        console.log(`      UEs: ${parc.nombre_ues}`);
        console.log('');
      });
    }

    // 5. Vérifier les années académiques
    console.log('📅 Années académiques:');
    const annees = await client.query(`
      SELECT
        id,
        libelle,
        annee_debut,
        annee_fin,
        statut
      FROM "${schemaName}".annee_academique
      ORDER BY annee_debut DESC
    `);

    if (annees.rows.length === 0) {
      console.log('   ❌ Aucune année académique trouvée!\n');
    } else {
      annees.rows.forEach(annee => {
        console.log(`   - ${annee.libelle} (${annee.annee_debut}-${annee.annee_fin}) - ${annee.statut}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkDepartements();

// Made with Bob
