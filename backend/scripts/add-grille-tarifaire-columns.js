const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:2007@localhost:5432/Imtech_SaaS';

async function addColumns() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données');

    // Récupérer tous les schémas tenant
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
    `);

    console.log(`📊 ${schemas.rows.length} schémas tenant trouvés`);

    for (const { schema_name } of schemas.rows) {
      console.log(`\n🔧 Traitement du schéma: ${schema_name}`);

      try {
        // Vérifier si les colonnes existent déjà
        const checkColumns = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = $1 
          AND table_name = 'grille_tarifaire'
          AND column_name IN ('montant_inscription', 'montant_scolarite', 'date_limite_paiement', 'modalites_paiement')
        `, [schema_name]);

        const existingColumns = checkColumns.rows.map(r => r.column_name);
        console.log(`   Colonnes existantes: ${existingColumns.join(', ') || 'aucune'}`);

        // Ajouter montant_inscription si elle n'existe pas
        if (!existingColumns.includes('montant_inscription')) {
          await client.query(`
            ALTER TABLE ${schema_name}.grille_tarifaire 
            ADD COLUMN montant_inscription DECIMAL(12,2) DEFAULT 0
          `);
          console.log('   ✅ Colonne montant_inscription ajoutée');
        }

        // Ajouter montant_scolarite si elle n'existe pas
        if (!existingColumns.includes('montant_scolarite')) {
          await client.query(`
            ALTER TABLE ${schema_name}.grille_tarifaire 
            ADD COLUMN montant_scolarite DECIMAL(12,2) DEFAULT 0
          `);
          console.log('   ✅ Colonne montant_scolarite ajoutée');
        }

        // Ajouter date_limite_paiement si elle n'existe pas
        if (!existingColumns.includes('date_limite_paiement')) {
          await client.query(`
            ALTER TABLE ${schema_name}.grille_tarifaire 
            ADD COLUMN date_limite_paiement DATE
          `);
          console.log('   ✅ Colonne date_limite_paiement ajoutée');
        }

        // Ajouter modalites_paiement si elle n'existe pas
        if (!existingColumns.includes('modalites_paiement')) {
          await client.query(`
            ALTER TABLE ${schema_name}.grille_tarifaire 
            ADD COLUMN modalites_paiement JSONB
          `);
          console.log('   ✅ Colonne modalites_paiement ajoutée');
        }

        // Mettre à jour les données existantes si nécessaire
        if (!existingColumns.includes('montant_inscription') || !existingColumns.includes('montant_scolarite')) {
          await client.query(`
            UPDATE ${schema_name}.grille_tarifaire 
            SET montant_inscription = montant_total,
                montant_scolarite = 0
            WHERE montant_inscription IS NULL OR montant_inscription = 0
          `);
          console.log('   ✅ Données migrées (montant_total → montant_inscription)');
        }

      } catch (error) {
        console.error(`   ❌ Erreur pour ${schema_name}:`, error.message);
      }
    }

    console.log('\n✅ Migration terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addColumns();

// Made with Bob
