const { Client } = require('pg');
require('dotenv').config();

async function checkTenantTables() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'imtech_university',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL\n');

    // Récupérer tous les tenants
    const tenantsResult = await client.query('SELECT id, nom FROM public.tenant');
    const tenants = tenantsResult.rows;

    console.log(`📋 ${tenants.length} tenant(s) trouvé(s)`);

    for (const tenant of tenants) {
      const schemaName = `tenant_${tenant.nom.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
      
      console.log(`\n🔍 Tables pour: ${tenant.nom} (${schemaName})`);
      console.log('='.repeat(50));

      try {
        // Lister les tables dans le schéma du tenant
        const tablesResult = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `, [schemaName]);

        const tables = tablesResult.rows;
        
        if (tables.length === 0) {
          console.log('  ❌ Aucune table trouvée');
        } else {
          tables.forEach(table => {
            console.log(`  ✓ ${table.table_name}`);
          });
        }

        // Vérifier les tables requises pour la scolarité
        const requiredTables = [
          'session_examen',
          'etudiant', 
          'parcours',
          'unite_enseignement',
          'element_constitutif',
          'inscription',
          'utilisateur'
        ];

        console.log('\n📋 Tables requises pour la scolarité:');
        for (const table of requiredTables) {
          const exists = tables.some(t => t.table_name === table);
          console.log(`  ${exists ? '✅' : '❌'} ${table}`);
        }

      } catch (error) {
        console.error(`  ❌ Erreur: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkTenantTables();
