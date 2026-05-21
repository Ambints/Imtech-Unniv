const { Client } = require('pg');

async function checkTenants() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'Imtech_SaaS',
    user: 'postgres',
    password: '2007',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à la base de données Imtech_SaaS\n');

    // Vérifier les tenants
    const result = await client.query('SELECT id, slug, nom, schema_name FROM public.tenant');
    
    console.log('📊 Tenants existants:');
    if (result.rows.length === 0) {
      console.log('   ❌ Aucun tenant trouvé\n');
      console.log('💡 Vous devez créer un tenant via l\'interface Super Admin');
      console.log('   1. Connectez-vous en tant que Super Admin');
      console.log('   2. Allez dans "Gestion des universités"');
      console.log('   3. Créez une nouvelle université');
    } else {
      result.rows.forEach(tenant => {
        console.log(`   - ${tenant.slug} (${tenant.nom})`);
        console.log(`     Schema: ${tenant.schema_name}`);
        console.log(`     ID: ${tenant.id}\n`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

checkTenants();

// Made with Bob
