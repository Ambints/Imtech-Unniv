const { Client } = require('pg');

async function checkAnneeAcademique() {
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

    // Vérifier la structure de la table annee_academique
    console.log('📋 Structure de la table annee_academique:');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = 'annee_academique'
      ORDER BY ordinal_position
    `, [schemaName]);

    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    console.log('\n📊 Données dans annee_academique:');
    const data = await client.query(`
      SELECT * FROM "${schemaName}".annee_academique
      ORDER BY id
    `);

    if (data.rows.length === 0) {
      console.log('   ❌ Aucune année académique trouvée!\n');
      console.log('💡 Il faut créer au moins une année académique');
    } else {
      data.rows.forEach(row => {
        console.log(`   - ID: ${row.id}`);
        console.log(`     Libellé: ${row.libelle}`);
        console.log(`     Statut: ${row.statut}`);
        console.log(`     Dates: ${row.date_debut} -> ${row.date_fin}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

checkAnneeAcademique();

// Made with Bob
