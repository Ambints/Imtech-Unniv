const { Client } = require('pg');
require('dotenv').config();

async function checkPasswordColumns() {
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

    // Récupérer tous les tenants
    const tenantsResult = await client.query(`
      SELECT id, nom, slug, schema_name 
      FROM tenant 
      WHERE actif = true
      ORDER BY nom
    `);

    console.log(`📊 ${tenantsResult.rows.length} tenant(s) trouvé(s)\n`);

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
        console.log(`   ⚠️  Table 'utilisateur' n'existe pas`);
        continue;
      }

      // Vérifier les colonnes password_reset_required et last_password_reset
      const columnsCheck = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = $1 
          AND table_name = 'utilisateur'
          AND column_name IN ('password_reset_required', 'last_password_reset')
        ORDER BY column_name
      `, [tenant.schema_name]);

      if (columnsCheck.rows.length === 0) {
        console.log(`   ❌ Colonnes manquantes: password_reset_required, last_password_reset`);
      } else if (columnsCheck.rows.length === 1) {
        console.log(`   ⚠️  Une seule colonne trouvée: ${columnsCheck.rows[0].column_name}`);
        const missing = columnsCheck.rows[0].column_name === 'password_reset_required' 
          ? 'last_password_reset' 
          : 'password_reset_required';
        console.log(`   ❌ Colonne manquante: ${missing}`);
      } else {
        console.log(`   ✅ Colonnes présentes:`);
        columnsCheck.rows.forEach(col => {
          console.log(`      - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
        });
      }

      // Compter les utilisateurs
      const countResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM "${tenant.schema_name}".utilisateur
      `);
      console.log(`   👥 ${countResult.rows[0].count} utilisateur(s)`);
    }

    console.log('\n✅ Vérification terminée');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

checkPasswordColumns();

// Made with Bob
