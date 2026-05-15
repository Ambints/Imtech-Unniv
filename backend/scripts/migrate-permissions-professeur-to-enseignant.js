const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function migratePermissions() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'Imtech_SaaS',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL\n');

    // Récupérer tous les schémas tenant
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);

    console.log(`📊 ${schemas.rows.length} schémas tenant trouvés\n`);

    for (const schema of schemas.rows) {
      const schemaName = schema.schema_name;
      console.log(`\n🔧 Migration de ${schemaName}:`);

      // Vérifier combien de permissions "professeur" existent
      const countBefore = await client.query(`
        SELECT COUNT(*) as count
        FROM ${schemaName}.permissions_portail
        WHERE type_portail = 'professeur'
      `);

      const professeurCount = parseInt(countBefore.rows[0].count);
      console.log(`   📊 ${professeurCount} permissions "professeur" trouvées`);

      if (professeurCount === 0) {
        console.log(`   ✅ Aucune migration nécessaire`);
        continue;
      }

      // Migrer les permissions de "professeur" vers "enseignant"
      await client.query(`
        UPDATE ${schemaName}.permissions_portail
        SET type_portail = 'enseignant'
        WHERE type_portail = 'professeur'
      `);

      console.log(`   ✅ ${professeurCount} permissions migrées vers "enseignant"`);

      // Vérifier le résultat
      const countAfter = await client.query(`
        SELECT COUNT(*) as count
        FROM ${schemaName}.permissions_portail
        WHERE type_portail = 'enseignant'
      `);

      console.log(`   ✅ ${countAfter.rows[0].count} permissions "enseignant" maintenant présentes`);

      // Afficher quelques exemples
      const samples = await client.query(`
        SELECT permission_key, permission_label
        FROM ${schemaName}.permissions_portail
        WHERE type_portail = 'enseignant'
        LIMIT 3
      `);

      console.log(`   📝 Exemples:`);
      samples.rows.forEach(row => {
        console.log(`      - ${row.permission_key}: ${row.permission_label}`);
      });
    }

    console.log(`\n\n🎉 Migration terminée avec succès !`);
    console.log(`✅ Toutes les permissions "professeur" ont été migrées vers "enseignant"`);

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migratePermissions();

// Made with Bob
