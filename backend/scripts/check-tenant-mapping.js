const { Client } = require('pg');

async function checkTenantMapping() {
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

    console.log('📊 Mapping des tenants:\n');
    console.log('='.repeat(100));

    const tenantsResult = await client.query(`
      SELECT id, nom, schema_name, actif
      FROM public.tenant
      ORDER BY nom
    `);

    if (tenantsResult.rows.length === 0) {
      console.log('❌ Aucun tenant trouvé dans la table public.tenant');
      return;
    }

    tenantsResult.rows.forEach((tenant, index) => {
      console.log(`\n${index + 1}. ${tenant.nom}`);
      console.log(`   ID: ${tenant.id}`);
      console.log(`   Schema: ${tenant.schema_name}`);
      console.log(`   Actif: ${tenant.actif ? '✅ Oui' : '❌ Non'}`);
      
      // Vérifier si le schema existe
      if (tenant.id === 'eaceef7f-dd73-46bd-9d77-231896181cca') {
        console.log(`   ⚠️  C'EST LE TENANT ISPM UTILISÉ DANS L'URL`);
      }
    });

    console.log('\n' + '='.repeat(100));

    // Vérifier spécifiquement le tenant ISPM
    const ispmTenant = tenantsResult.rows.find(t => t.id === 'eaceef7f-dd73-46bd-9d77-231896181cca');
    
    if (ispmTenant) {
      console.log('\n🔍 Analyse du tenant ISPM:\n');
      console.log(`Schema configuré: ${ispmTenant.schema_name}`);
      
      // Vérifier si le schema existe et combien de tables il contient
      const schemaCheck = await client.query(`
        SELECT COUNT(*) as table_count
        FROM information_schema.tables
        WHERE table_schema = $1
        AND table_type = 'BASE TABLE'
      `, [ispmTenant.schema_name]);
      
      console.log(`Tables dans ce schema: ${schemaCheck.rows[0].table_count}`);
      
      if (schemaCheck.rows[0].table_count === '0') {
        console.log('\n❌ PROBLÈME: Le schema est vide !');
        console.log('💡 Solution: Le schema devrait probablement être "tenant_ispm" au lieu de "' + ispmTenant.schema_name + '"');
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

checkTenantMapping();

// Made with Bob
