const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:2007@localhost:5432/Imtech_SaaS';

async function applyMissingRHTables() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Lire le script SQL
    const sqlPath = path.join(__dirname, 'add-missing-rh-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('✅ SQL script loaded');

    // Récupérer tous les tenants
    const tenantsResult = await client.query(`
      SELECT id, nom, schema_name 
      FROM public.tenant 
      WHERE actif = true
      ORDER BY nom
    `);

    console.log(`\n📋 Found ${tenantsResult.rows.length} active tenant(s)\n`);

    for (const tenant of tenantsResult.rows) {
      console.log(`\n🏢 Processing tenant: ${tenant.nom} (${tenant.schema_name})`);
      
      try {
        // Définir le search_path pour le schéma du tenant
        await client.query(`SET search_path TO "${tenant.schema_name}", public`);
        
        // Vérifier si les tables existent déjà
        const checkTables = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = $1 
            AND table_name IN ('recrutement', 'heure_complementaire', 'evaluation_personnel', 'declaration_sociale', 'candidature')
        `, [tenant.schema_name]);

        const existingTables = checkTables.rows.map(r => r.table_name);
        console.log(`   Existing RH tables: ${existingTables.length > 0 ? existingTables.join(', ') : 'none'}`);

        // Appliquer le script SQL
        await client.query(sql);
        
        // Vérifier les tables après création
        const verifyTables = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = $1 
            AND table_name IN ('recrutement', 'heure_complementaire', 'evaluation_personnel', 'declaration_sociale', 'candidature')
          ORDER BY table_name
        `, [tenant.schema_name]);

        console.log(`   ✅ RH tables now present: ${verifyTables.rows.map(r => r.table_name).join(', ')}`);
        
      } catch (error) {
        console.error(`   ❌ Error processing tenant ${tenant.nom}:`, error.message);
      }
    }

    // Réinitialiser le search_path
    await client.query(`SET search_path TO public`);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Tenants processed: ${tenantsResult.rows.length}`);
    console.log(`   - Tables added: recrutement, heure_complementaire, evaluation_personnel, declaration_sociale, candidature`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Exécuter le script
applyMissingRHTables()
  .then(() => {
    console.log('\n✨ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });

// Made with Bob
