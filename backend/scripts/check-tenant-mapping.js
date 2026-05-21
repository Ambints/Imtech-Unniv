const { Client } = require('pg');

async function checkTenantMapping() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '2007',
    database: 'Imtech_SaaS'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check tenants table in public schema
    console.log('📋 Checking tenants in public.tenant table:');
    const tenants = await client.query(`
      SELECT id, nom, schema_name, actif, created_at 
      FROM public.tenant 
      ORDER BY created_at DESC
    `);
    
    if (tenants.rows.length === 0) {
      console.log('❌ No tenants found in public.tenant table');
    } else {
      console.log(`Found ${tenants.rows.length} tenant(s):\n`);
      tenants.rows.forEach((tenant, index) => {
        console.log(`${index + 1}. Tenant: ${tenant.nom}`);
        console.log(`   ID: ${tenant.id}`);
        console.log(`   Schema: ${tenant.schema_name}`);
        console.log(`   Active: ${tenant.actif}`);
        console.log(`   Created: ${tenant.created_at}`);
        console.log('');
      });
    }

    // Check the specific tenant ID from the error
    const targetTenantId = '324746c0-67d0-4d87-b9d6-1af7d149599b';
    console.log(`\n🔍 Looking for tenant ID: ${targetTenantId}`);
    
    const specificTenant = await client.query(`
      SELECT id, nom, schema_name, actif 
      FROM public.tenant 
      WHERE id = $1
    `, [targetTenantId]);
    
    if (specificTenant.rows.length > 0) {
      const t = specificTenant.rows[0];
      console.log(`✅ Found tenant:`);
      console.log(`   Name: ${t.nom}`);
      console.log(`   Schema: ${t.schema_name}`);
      console.log(`   Active: ${t.actif}`);
      
      // Check if salle table exists in that schema
      const salleCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1 AND table_name = 'salle'
      `, [t.schema_name]);
      
      if (salleCheck.rows.length > 0) {
        console.log(`   ✅ Salle table EXISTS in ${t.schema_name}`);
        
        // Count salles
        const count = await client.query(`SELECT COUNT(*) as count FROM ${t.schema_name}.salle`);
        console.log(`   📊 Number of salles: ${count.rows[0].count}`);
      } else {
        console.log(`   ❌ Salle table MISSING in ${t.schema_name}`);
      }
    } else {
      console.log(`❌ Tenant ID ${targetTenantId} NOT FOUND in database`);
    }

    // List all schemas that start with 'tenant_'
    console.log('\n📂 All tenant schemas in database:');
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);
    
    schemas.rows.forEach(s => {
      console.log(`   - ${s.schema_name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

checkTenantMapping();

// Made with Bob
