const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:2007@localhost:5432/Imtech_SaaS';

async function checkPresidentDashboardTables() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Récupérer tous les tenants
    const tenantsResult = await client.query(`
      SELECT id, nom, schema_name 
      FROM public.tenant 
      WHERE actif = true
      ORDER BY nom
    `);

    console.log(`📋 Found ${tenantsResult.rows.length} active tenant(s)\n`);

    const requiredTables = [
      'etudiant',
      'resultat_semestre',
      'presence',
      'parcours',
      'soutenance',
      'paiement',
      'echeancier',
      'depense',
      'budget',
      'enseignant',
      'contrat_personnel',
      'conge_personnel',
      'incident_disciplinaire',
      'conseil_discipline',
      'annonce',
      'ticket_maintenance',
      'stock',
      'inscription',
      'diplome',
      'transfert_etudiant',
      'pv_deliberation',
      'recrutement'
    ];

    for (const tenant of tenantsResult.rows) {
      console.log(`\n🏢 Checking tenant: ${tenant.nom} (${tenant.schema_name})`);
      
      try {
        // Vérifier les tables existantes
        const existingTablesResult = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = $1 
            AND table_type = 'BASE TABLE'
          ORDER BY table_name
        `, [tenant.schema_name]);

        const existingTables = existingTablesResult.rows.map(r => r.table_name);
        
        console.log(`   ✅ Total tables: ${existingTables.length}`);
        
        // Vérifier les tables requises
        const missingTables = requiredTables.filter(t => !existingTables.includes(t));
        
        if (missingTables.length > 0) {
          console.log(`   ⚠️  Missing tables for president dashboard:`);
          missingTables.forEach(table => {
            console.log(`      - ${table}`);
          });
        } else {
          console.log(`   ✅ All required tables present`);
        }

        // Vérifier les colonnes critiques
        const criticalChecks = [
          { table: 'contrat_personnel', column: 'statut', expectedValues: ['actif', 'en_attente_president'] },
          { table: 'conseil_discipline', column: 'statut', expectedValues: ['en_attente_president'] },
          { table: 'diplome', column: 'statut', expectedValues: ['pret_signature'] },
          { table: 'pv_deliberation', column: 'statut', expectedValues: ['en_attente_validation'] },
          { table: 'transfert_etudiant', column: 'statut', expectedValues: ['en_attente'] }
        ];

        for (const check of criticalChecks) {
          if (existingTables.includes(check.table)) {
            const columnCheck = await client.query(`
              SELECT column_name, data_type 
              FROM information_schema.columns 
              WHERE table_schema = $1 AND table_name = $2 AND column_name = $3
            `, [tenant.schema_name, check.table, check.column]);

            if (columnCheck.rows.length === 0) {
              console.log(`   ⚠️  Table ${check.table} missing column: ${check.column}`);
            }
          }
        }

      } catch (error) {
        console.error(`   ❌ Error checking tenant ${tenant.nom}:`, error.message);
      }
    }

    console.log('\n✅ Check completed!');

  } catch (error) {
    console.error('❌ Check failed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Exécuter le script
checkPresidentDashboardTables()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });

// Made with Bob
