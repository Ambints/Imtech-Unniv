const { Client } = require('pg');

async function checkNiveauEtudeTable() {
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
      'SELECT schema_name FROM public.tenant WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant non trouvé!');
      return;
    }

    const schemaName = tenantResult.rows[0].schema_name;
    console.log(`📋 Schéma du tenant: ${schemaName}\n`);

    // 2. Vérifier si la table niveau_etude existe
    console.log('🔍 Vérification de la table niveau_etude...\n');
    
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = $1 
        AND table_name = 'niveau_etude'
      )
    `, [schemaName]);

    if (!tableExists.rows[0].exists) {
      console.log('❌ La table niveau_etude n\'existe PAS dans le schéma du tenant!\n');
      
      // Vérifier les tables qui existent
      console.log('📊 Tables existantes dans le schéma:');
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1 
        ORDER BY table_name
      `, [schemaName]);
      
      tables.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
      
      console.log('\n💡 Solution: Créer la table niveau_etude dans le schéma du tenant');
      return;
    }

    console.log('✅ La table niveau_etude existe!\n');

    // 3. Vérifier la structure de la table
    console.log('📋 Structure de la table niveau_etude:');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = 'niveau_etude'
      ORDER BY ordinal_position
    `, [schemaName]);

    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // 4. Vérifier les données existantes
    console.log('\n📊 Données existantes:');
    const data = await client.query(`
      SELECT id, code, libelle, ordre, actif 
      FROM "${schemaName}".niveau_etude 
      ORDER BY ordre
    `);

    if (data.rows.length === 0) {
      console.log('   ℹ️ Aucune donnée dans la table');
    } else {
      data.rows.forEach(row => {
        console.log(`   - ${row.code}: ${row.libelle} (ordre: ${row.ordre}, actif: ${row.actif})`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkNiveauEtudeTable();

// Made with Bob
