const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007'
});

async function addResponsableParcours() {
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données\n');

    // 1. Récupérer tous les tenants actifs
    const tenantsResult = await client.query(`
      SELECT id, nom, schema_name 
      FROM public.tenant 
      WHERE actif = true
      ORDER BY nom
    `);

    console.log(`📋 ${tenantsResult.rows.length} tenant(s) trouvé(s)\n`);

    for (const tenant of tenantsResult.rows) {
      console.log(`\n🔧 Traitement du tenant: ${tenant.nom} (${tenant.schema_name})`);
      console.log('─'.repeat(80));

      try {
        // 2. Vérifier si la colonne existe déjà
        const columnCheck = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = $1 
            AND table_name = 'parcours' 
            AND column_name = 'responsable_id'
        `, [tenant.schema_name]);

        if (columnCheck.rows.length > 0) {
          console.log('⚠️  Colonne responsable_id existe déjà');
          continue;
        }

        // 3. Ajouter la colonne responsable_id
        await client.query(`
          ALTER TABLE "${tenant.schema_name}".parcours 
          ADD COLUMN responsable_id UUID
        `);
        console.log('✅ Colonne responsable_id ajoutée');

        // 4. Ajouter la contrainte de clé étrangère
        await client.query(`
          ALTER TABLE "${tenant.schema_name}".parcours
          ADD CONSTRAINT fk_parcours_responsable 
          FOREIGN KEY (responsable_id) 
          REFERENCES "${tenant.schema_name}".utilisateur(id) 
          ON DELETE SET NULL
        `);
        console.log('✅ Contrainte de clé étrangère ajoutée');

        // 5. Créer un index pour les performances
        await client.query(`
          CREATE INDEX idx_parcours_responsable 
          ON "${tenant.schema_name}".parcours(responsable_id)
        `);
        console.log('✅ Index créé');

        // 6. Vérifier la structure finale
        const finalCheck = await client.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_schema = $1 
            AND table_name = 'parcours' 
            AND column_name = 'responsable_id'
        `, [tenant.schema_name]);

        if (finalCheck.rows.length > 0) {
          const col = finalCheck.rows[0];
          console.log(`✅ Vérification: ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
        }

      } catch (error) {
        console.error(`❌ Erreur pour ${tenant.nom}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Migration terminée avec succès!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Erreur globale:', error.message);
  } finally {
    await client.end();
  }
}

addResponsableParcours();

// Made with Bob
