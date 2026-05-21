const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007',
});

async function checkEnseignantActif() {
  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL\n');

    // 1. Lister tous les tenants
    const tenantsResult = await client.query(`
      SELECT id, nom, schema_name 
      FROM public.tenant 
      ORDER BY nom
    `);

    console.log(`📊 Tenants trouvés: ${tenantsResult.rows.length}\n`);

    for (const tenant of tenantsResult.rows) {
      console.log(`\n🏢 Tenant: ${tenant.nom} (${tenant.schema_name})`);
      console.log('='.repeat(60));

      // 2. Vérifier si la table enseignant existe
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_name = 'enseignant'
        )
      `, [tenant.schema_name]);

      if (!tableCheck.rows[0].exists) {
        console.log('⚠️  Table enseignant n\'existe pas dans ce schema');
        continue;
      }

      // 3. Vérifier si la colonne actif existe
      const columnCheck = await client.query(`
        SELECT column_name, data_type, column_default
        FROM information_schema.columns
        WHERE table_schema = $1 
        AND table_name = 'enseignant'
        AND column_name = 'actif'
      `, [tenant.schema_name]);

      if (columnCheck.rows.length === 0) {
        console.log('⚠️  Colonne "actif" n\'existe pas dans la table enseignant');
        console.log('   Il faut l\'ajouter avec une migration');
        continue;
      }

      console.log(`✅ Colonne "actif" existe (type: ${columnCheck.rows[0].data_type}, default: ${columnCheck.rows[0].column_default})`);

      // 4. Lister tous les enseignants avec leur statut actif
      const enseignantsResult = await client.query(`
        SELECT 
          id,
          nom,
          prenom,
          matricule,
          grade,
          actif,
          created_at
        FROM ${tenant.schema_name}.enseignant
        ORDER BY created_at DESC
      `);

      console.log(`\n📋 Enseignants dans ${tenant.schema_name}:`);
      console.log('-'.repeat(100));
      console.log('ID'.padEnd(40) + 'Nom'.padEnd(25) + 'Grade'.padEnd(15) + 'Actif'.padEnd(10) + 'Créé le');
      console.log('-'.repeat(100));

      for (const ens of enseignantsResult.rows) {
        const actifStatus = ens.actif === true ? '✅ OUI' : 
                           ens.actif === false ? '❌ NON' : 
                           '⚠️  NULL';
        const createdAt = ens.created_at ? new Date(ens.created_at).toLocaleDateString('fr-FR') : 'N/A';
        
        console.log(
          ens.id.padEnd(40) +
          `${ens.prenom} ${ens.nom}`.padEnd(25) +
          (ens.grade || 'N/A').padEnd(15) +
          actifStatus.padEnd(10) +
          createdAt
        );
      }

      // 5. Compter les enseignants par statut
      const statsResult = await client.query(`
        SELECT 
          COUNT(*) FILTER (WHERE actif = true) as actifs,
          COUNT(*) FILTER (WHERE actif = false) as inactifs,
          COUNT(*) FILTER (WHERE actif IS NULL) as null_actif,
          COUNT(*) as total
        FROM ${tenant.schema_name}.enseignant
      `);

      const stats = statsResult.rows[0];
      console.log('\n📊 Statistiques:');
      console.log(`   Total: ${stats.total}`);
      console.log(`   Actifs: ${stats.actifs}`);
      console.log(`   Inactifs: ${stats.inactifs}`);
      console.log(`   NULL: ${stats.null_actif}`);

      // 6. Identifier les enseignants récemment créés qui ne sont pas actifs
      if (parseInt(stats.inactifs) > 0 || parseInt(stats.null_actif) > 0) {
        console.log('\n⚠️  PROBLÈME DÉTECTÉ:');
        console.log(`   ${parseInt(stats.inactifs) + parseInt(stats.null_actif)} enseignant(s) ne sont pas actifs`);
        console.log('   Ces enseignants n\'apparaîtront pas dans la liste des affectations');
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('\n✅ Connexion fermée');
  }
}

checkEnseignantActif();

// Made with Bob
