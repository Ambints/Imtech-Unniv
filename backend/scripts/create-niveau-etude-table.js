const { Client } = require('pg');

async function createNiveauEtudeTable() {
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

    // 2. Créer la table niveau_etude
    console.log('🔨 Création de la table niveau_etude...\n');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS "${schemaName}".niveau_etude (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(20) NOT NULL UNIQUE,
        libelle VARCHAR(255) NOT NULL,
        description TEXT,
        ordre INTEGER NOT NULL,
        type_diplome VARCHAR(50),
        actif BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Table niveau_etude créée avec succès!\n');

    // 3. Créer un index sur le code
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_niveau_etude_code 
      ON "${schemaName}".niveau_etude(code);
    `);

    console.log('✅ Index créé sur la colonne code\n');

    // 4. Insérer des données par défaut
    console.log('📝 Insertion des niveaux par défaut...\n');
    
    const defaultNiveaux = [
      { code: 'L1', libelle: 'Licence 1ère année', ordre: 1, type_diplome: 'Licence' },
      { code: 'L2', libelle: 'Licence 2ème année', ordre: 2, type_diplome: 'Licence' },
      { code: 'L3', libelle: 'Licence 3ème année', ordre: 3, type_diplome: 'Licence' },
      { code: 'M1', libelle: 'Master 1ère année', ordre: 4, type_diplome: 'Master' },
      { code: 'M2', libelle: 'Master 2ème année', ordre: 5, type_diplome: 'Master' },
    ];

    for (const niveau of defaultNiveaux) {
      await client.query(`
        INSERT INTO "${schemaName}".niveau_etude (code, libelle, ordre, type_diplome, actif)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (code) DO NOTHING
      `, [niveau.code, niveau.libelle, niveau.ordre, niveau.type_diplome]);
      
      console.log(`   ✅ ${niveau.code}: ${niveau.libelle}`);
    }

    console.log('\n✅ Niveaux par défaut insérés avec succès!\n');

    // 5. Vérifier les données
    console.log('📊 Vérification des données:');
    const data = await client.query(`
      SELECT id, code, libelle, ordre, type_diplome, actif 
      FROM "${schemaName}".niveau_etude 
      ORDER BY ordre
    `);

    data.rows.forEach(row => {
      console.log(`   - ${row.code}: ${row.libelle} (ordre: ${row.ordre}, type: ${row.type_diplome}, actif: ${row.actif})`);
    });

    console.log('\n✅ Configuration terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

createNiveauEtudeTable();

// Made with Bob
