const { Client } = require('pg');

async function listSchemas() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'Imtech_SaaS',
    user: 'postgres',
    password: '2007',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL\n');

    console.log('📊 Liste de tous les schemas dans la base Imtech_SaaS:\n');
    console.log('='.repeat(80));

    const schemasResult = await client.query(`
      SELECT schema_name,
             (SELECT COUNT(*) FROM information_schema.tables 
              WHERE table_schema = s.schema_name AND table_type = 'BASE TABLE') as table_count
      FROM information_schema.schemata s
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name
    `);

    if (schemasResult.rows.length === 0) {
      console.log('❌ Aucun schema trouvé');
      return;
    }

    console.log(`\nTotal: ${schemasResult.rows.length} schemas\n`);

    schemasResult.rows.forEach((schema, index) => {
      const indicator = schema.table_count > 0 ? '✅' : '❌';
      console.log(`${index + 1}. ${indicator} ${schema.schema_name} (${schema.table_count} tables)`);
    });

    console.log('\n' + '='.repeat(80));

    // Chercher les schemas tenant
    console.log('\n🔍 Schemas tenant:\n');
    
    const tenantSchemas = schemasResult.rows.filter(s => 
      s.schema_name.toLowerCase().startsWith('tenant_')
    );

    if (tenantSchemas.length > 0) {
      tenantSchemas.forEach(schema => {
        const status = schema.table_count > 0 ? '✅ Initialisé' : '❌ Vide';
        console.log(`  ${schema.schema_name}: ${status} (${schema.table_count} tables)`);
      });
    } else {
      console.log('❌ Aucun schema tenant trouvé');
    }

    // Afficher le contenu du schema public
    console.log('\n📦 Tables dans le schema public:\n');
    
    const publicTablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    if (publicTablesResult.rows.length > 0) {
      publicTablesResult.rows.forEach((table, index) => {
        console.log(`  ${index + 1}. ${table.table_name}`);
      });
    } else {
      console.log('  ❌ Aucune table dans public');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

listSchemas();

// Made with Bob
