const { Client } = require('pg');

async function listTables() {
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

    const schemaName = 'tenant_eaceef7f_dd73_46bd_9d77_231896181cca';
    
    console.log(`📌 Tables dans le schema: ${schemaName}\n`);
    console.log('='.repeat(80));

    const tablesResult = await client.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns 
              WHERE table_schema = $1 AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = $1
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `, [schemaName]);

    if (tablesResult.rows.length === 0) {
      console.log('❌ Aucune table trouvée dans ce schema');
      return;
    }

    console.log(`\nTotal: ${tablesResult.rows.length} tables\n`);

    tablesResult.rows.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name} (${table.column_count} colonnes)`);
    });

    console.log('\n' + '='.repeat(80));

    // Chercher spécifiquement les tables liées aux enseignants/professeurs
    console.log('\n🔍 Recherche de tables liées aux enseignants/professeurs:\n');
    
    const enseignantTables = tablesResult.rows.filter(t => 
      t.table_name.toLowerCase().includes('enseignant') ||
      t.table_name.toLowerCase().includes('professeur') ||
      t.table_name.toLowerCase().includes('teacher')
    );

    if (enseignantTables.length > 0) {
      enseignantTables.forEach(table => {
        console.log(`✅ ${table.table_name}`);
      });
    } else {
      console.log('❌ Aucune table trouvée avec "enseignant", "professeur" ou "teacher"');
    }

    // Chercher les tables d'affectation
    console.log('\n🔍 Recherche de tables d\'affectation:\n');
    
    const affectationTables = tablesResult.rows.filter(t => 
      t.table_name.toLowerCase().includes('affectation') ||
      t.table_name.toLowerCase().includes('assignment')
    );

    if (affectationTables.length > 0) {
      affectationTables.forEach(table => {
        console.log(`✅ ${table.table_name}`);
      });
    } else {
      console.log('❌ Aucune table d\'affectation trouvée');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

listTables();

// Made with Bob
