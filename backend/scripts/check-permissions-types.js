const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function checkPermissionsTypes() {
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

    // Vérifier les schémas tenant
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);

    for (const schema of schemas.rows) {
      const schemaName = schema.schema_name;
      console.log(`\n🔍 ${schemaName}:`);

      // Compter par type de portail
      const typeCount = await client.query(`
        SELECT type_portail, COUNT(*) as count
        FROM ${schemaName}.permissions_portail
        GROUP BY type_portail
        ORDER BY type_portail
      `);

      console.log(`   📊 Répartition par type:`);
      typeCount.rows.forEach(row => {
        console.log(`      - ${row.type_portail}: ${row.count} permissions`);
      });

      // Vérifier si "professeur" existe
      const professeurCheck = await client.query(`
        SELECT COUNT(*) as count
        FROM ${schemaName}.permissions_portail
        WHERE type_portail = 'professeur'
      `);

      if (professeurCheck.rows[0].count > 0) {
        console.log(`   ⚠️  ${professeurCheck.rows[0].count} permissions avec type "professeur" trouvées`);
      }

      // Vérifier si "enseignant" existe
      const enseignantCheck = await client.query(`
        SELECT COUNT(*) as count
        FROM ${schemaName}.permissions_portail
        WHERE type_portail = 'enseignant'
      `);

      if (enseignantCheck.rows[0].count > 0) {
        console.log(`   ✅ ${enseignantCheck.rows[0].count} permissions avec type "enseignant" trouvées`);
      } else {
        console.log(`   ❌ Aucune permission avec type "enseignant"`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkPermissionsTypes();

// Made with Bob
