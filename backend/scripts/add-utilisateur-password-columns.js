const { Client } = require('pg');
require('dotenv').config();

async function addPasswordColumns() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'imtech_university',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL\n');

    // Récupérer tous les tenants actifs
    const tenantsResult = await client.query(`
      SELECT id, nom, slug, schema_name 
      FROM tenant 
      WHERE actif = true
      ORDER BY nom
    `);

    console.log(`📊 ${tenantsResult.rows.length} tenant(s) à traiter\n`);

    for (const tenant of tenantsResult.rows) {
      console.log(`\n🏛️  Tenant: ${tenant.nom} (${tenant.slug})`);
      console.log(`   Schema: ${tenant.schema_name}`);

      // Vérifier si la table utilisateur existe
      const tableCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name = 'utilisateur'
      `, [tenant.schema_name]);

      if (tableCheck.rows.length === 0) {
        console.log(`   ⚠️  Table 'utilisateur' n'existe pas - SKIP`);
        continue;
      }

      // Vérifier si les colonnes existent déjà
      const columnsCheck = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = $1 
          AND table_name = 'utilisateur'
          AND column_name IN ('password_reset_required', 'last_password_reset')
      `, [tenant.schema_name]);

      const existingColumns = columnsCheck.rows.map(r => r.column_name);
      const needPasswordResetRequired = !existingColumns.includes('password_reset_required');
      const needLastPasswordReset = !existingColumns.includes('last_password_reset');

      if (!needPasswordResetRequired && !needLastPasswordReset) {
        console.log(`   ✅ Colonnes déjà présentes - SKIP`);
        continue;
      }

      // Ajouter les colonnes manquantes
      try {
        await client.query('BEGIN');

        if (needPasswordResetRequired) {
          console.log(`   📝 Ajout de la colonne password_reset_required...`);
          await client.query(`
            ALTER TABLE "${tenant.schema_name}".utilisateur
            ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT false
          `);
          console.log(`   ✅ Colonne password_reset_required ajoutée`);
        }

        if (needLastPasswordReset) {
          console.log(`   📝 Ajout de la colonne last_password_reset...`);
          await client.query(`
            ALTER TABLE "${tenant.schema_name}".utilisateur
            ADD COLUMN IF NOT EXISTS last_password_reset TIMESTAMPTZ
          `);
          console.log(`   ✅ Colonne last_password_reset ajoutée`);
        }

        await client.query('COMMIT');
        console.log(`   ✅ Migration réussie pour ${tenant.nom}`);

      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`   ❌ Erreur lors de la migration:`, error.message);
      }
    }

    // Mettre à jour le schéma de création tenant
    console.log(`\n📝 Mise à jour du fichier tenant-schema.sql...`);
    console.log(`   ⚠️  IMPORTANT: Vérifiez manuellement que tenant-schema.sql contient:`);
    console.log(`   - password_reset_required BOOLEAN DEFAULT false`);
    console.log(`   - last_password_reset TIMESTAMPTZ`);

    console.log('\n✅ Migration terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

addPasswordColumns();

// Made with Bob
