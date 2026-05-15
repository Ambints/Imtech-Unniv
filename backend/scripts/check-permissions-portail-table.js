const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function checkPermissionsPortailTable() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'Imtech_SaaS',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL');

    // Vérifier les schémas tenant
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);

    console.log(`\n📊 ${schemas.rows.length} schémas tenant trouvés\n`);

    for (const schema of schemas.rows) {
      const schemaName = schema.schema_name;
      console.log(`\n🔍 Vérification de ${schemaName}:`);

      // Vérifier si la table permissions_portail existe
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_name = 'permissions_portail'
        ) as exists
      `, [schemaName]);

      const tableExists = tableCheck.rows[0].exists;

      if (tableExists) {
        console.log(`   ✅ Table permissions_portail existe`);

        // Compter les permissions
        const countResult = await client.query(`
          SELECT COUNT(*) as count 
          FROM ${schemaName}.permissions_portail
        `);
        console.log(`   📊 ${countResult.rows[0].count} permissions trouvées`);

        // Afficher quelques exemples
        const sampleResult = await client.query(`
          SELECT type_portail, permission_key, actif 
          FROM ${schemaName}.permissions_portail 
          LIMIT 5
        `);
        console.log(`   📝 Exemples:`);
        sampleResult.rows.forEach(row => {
          console.log(`      - ${row.type_portail}.${row.permission_key} (actif: ${row.actif})`);
        });
      } else {
        console.log(`   ❌ Table permissions_portail N'EXISTE PAS`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkPermissionsPortailTable();

// Made with Bob
