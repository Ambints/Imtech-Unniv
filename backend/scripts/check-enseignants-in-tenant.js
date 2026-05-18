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

    // Utiliser directement le schema tenant_eaceef7f_dd73_46bd_9d77_231896181cca (ISPM)
    const schemaName = 'tenant_eaceef7f_dd73_46bd_9d77_231896181cca';
    
    console.log('📌 Schema utilisé:', schemaName);
    console.log('');

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

    // Lister tous les enseignants
    const enseignantsResult = await client.query(`
      SELECT id, nom, prenom, email, grade, actif, "createdAt"
      FROM ${schemaName}.enseignant
      ORDER BY "createdAt" DESC
    `);

    console.log(`\n📊 Enseignants dans ${schemaName}:`);
    console.log('='.repeat(100));
    
    if (enseignantsResult.rows.length === 0) {
      console.log('❌ Aucun enseignant trouvé dans la base de données');
      console.log('\n💡 Vous devez créer des enseignants avant de pouvoir les affecter aux UE');
    } else {
      enseignantsResult.rows.forEach((ens, index) => {
        console.log(`\n${index + 1}. ${ens.prenom} ${ens.nom}`);
        console.log(`   ID: ${ens.id}`);
        console.log(`   Email: ${ens.email || 'N/A'}`);
        console.log(`   Grade: ${ens.grade || 'N/A'}`);
        console.log(`   Actif: ${ens.actif ? '✅ Oui' : '❌ Non'}`);
        console.log(`   Créé le: ${ens.createdAt}`);
      });

      const actifsCount = enseignantsResult.rows.filter(e => e.actif).length;
      const inactifsCount = enseignantsResult.rows.length - actifsCount;

      console.log('\n' + '='.repeat(100));
      console.log(`📊 Total: ${enseignantsResult.rows.length} enseignants`);
      console.log(`   ✅ Actifs: ${actifsCount}`);
      console.log(`   ❌ Inactifs: ${inactifsCount}`);
    }

    // Vérifier les affectations existantes
    const affectationsResult = await client.query(`
      SELECT COUNT(*) as count
      FROM ${schemaName}.affectation_cours
    `);

    console.log(`\n📊 Affectations existantes: ${affectationsResult.rows[0].count}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkEnseignants();

// Made with Bob
