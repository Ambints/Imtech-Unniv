const { Client } = require('pg');

async function checkEnseignants() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'Imtech_SaaS',
    user: 'postgres',
    password: '2007',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL\n');

    const schemaName = 'tenant_ispm';
    
    console.log(`📌 Vérification des enseignants dans: ${schemaName}\n`);
    console.log('='.repeat(100));

    // Vérifier si la table enseignant existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = $1 
        AND table_name = 'enseignant'
      )
    `, [schemaName]);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table enseignant n\'existe pas dans le schema', schemaName);
      return;
    }

    console.log('✅ Table enseignant existe\n');

    // Lister tous les enseignants
    const enseignantsResult = await client.query(`
      SELECT id, nom, prenom, email, grade, actif
      FROM ${schemaName}.enseignant
      ORDER BY nom, prenom
    `);

    console.log(`📊 Enseignants trouvés: ${enseignantsResult.rows.length}\n`);

    if (enseignantsResult.rows.length === 0) {
      console.log('❌ Aucun enseignant dans la base de données');
      console.log('\n💡 SOLUTION: Vous devez créer des enseignants avant de pouvoir les affecter aux UE');
      console.log('   Utilisez l\'interface d\'administration pour ajouter des enseignants.');
    } else {
      enseignantsResult.rows.forEach((ens, index) => {
        console.log(`${index + 1}. ${ens.prenom} ${ens.nom}`);
        console.log(`   ID: ${ens.id}`);
        console.log(`   Email: ${ens.email || 'N/A'}`);
        console.log(`   Grade: ${ens.grade || 'N/A'}`);
        console.log(`   Actif: ${ens.actif ? '✅ Oui' : '❌ Non'}`);
        console.log('');
      });

      const actifsCount = enseignantsResult.rows.filter(e => e.actif).length;
      const inactifsCount = enseignantsResult.rows.length - actifsCount;

      console.log('='.repeat(100));
      console.log(`📊 Résumé:`);
      console.log(`   Total: ${enseignantsResult.rows.length} enseignants`);
      console.log(`   ✅ Actifs: ${actifsCount}`);
      console.log(`   ❌ Inactifs: ${inactifsCount}`);
    }

    // Vérifier les affectations existantes
    const affectationsResult = await client.query(`
      SELECT COUNT(*) as count
      FROM ${schemaName}.affectation_cours
    `);

    console.log(`\n📊 Affectations existantes: ${affectationsResult.rows[0].count}`);

    // Vérifier les UE disponibles
    const ueResult = await client.query(`
      SELECT COUNT(*) as count
      FROM ${schemaName}.unite_enseignement
      WHERE actif = true
    `);

    console.log(`📊 UE actives disponibles: ${ueResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkEnseignants();

// Made with Bob
