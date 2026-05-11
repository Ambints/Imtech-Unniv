const { Client } = require('pg');
require('dotenv').config();

async function addActifColumn() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'imtech_university',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('✓ Connecté à PostgreSQL');

    // Récupérer tous les tenants (sans filtre sur le statut)
    const tenantsResult = await client.query(
      "SELECT id, schema_name FROM tenant"
    );
    
    console.log(`\n📋 ${tenantsResult.rows.length} tenant(s) trouvé(s)\n`);

    for (const tenant of tenantsResult.rows) {
      console.log(`\n🔧 Traitement du tenant: ${tenant.id}`);
      console.log(`   Schema: ${tenant.schema_name}`);

      try {
        // Vérifier si la colonne existe déjà
        const checkColumn = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = $1 
            AND table_name = 'etudiant' 
            AND column_name = 'actif'
        `, [tenant.schema_name]);

        if (checkColumn.rows.length > 0) {
          console.log('   ⚠️  Colonne "actif" existe déjà, passage au suivant');
          continue;
        }

        // Ajouter la colonne actif
        await client.query(`
          ALTER TABLE "${tenant.schema_name}".etudiant 
          ADD COLUMN IF NOT EXISTS actif BOOLEAN DEFAULT true
        `);
        console.log('   ✓ Colonne "actif" ajoutée');

        // Mettre à jour les valeurs existantes (tous actifs par défaut)
        await client.query(`
          UPDATE "${tenant.schema_name}".etudiant 
          SET actif = true 
          WHERE actif IS NULL
        `);
        console.log('   ✓ Valeurs par défaut définies');

      } catch (error) {
        console.error(`   ❌ Erreur pour ${tenant.schema_name}:`, error.message);
      }
    }

    console.log('\n✅ Migration terminée avec succès');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addActifColumn();

// Made with Bob
