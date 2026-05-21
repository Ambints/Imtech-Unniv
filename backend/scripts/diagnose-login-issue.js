require('dotenv').config();
const { Client } = require('pg');

async function diagnoseLoginIssue() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'imtech_university',
  });

  console.log('🔍 Connecting to database:', {
    host: client.host,
    port: client.port,
    user: client.user,
    database: client.database,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // 1. Check super_admin table
    console.log('=== SUPER ADMIN TABLE ===');
    const superAdmins = await client.query('SELECT id, email, prenom, nom, actif FROM public.super_admin');
    console.log(`Found ${superAdmins.rows.length} super admin(s):`);
    superAdmins.rows.forEach(sa => {
      console.log(`  - ${sa.email} (${sa.prenom} ${sa.nom}) - Active: ${sa.actif}`);
    });
    console.log('');

    // 2. Check tenants
    console.log('=== TENANTS ===');
    const tenants = await client.query('SELECT id, nom, slug, schema_name, actif FROM public.tenant WHERE actif = true');
    console.log(`Found ${tenants.rows.length} active tenant(s):`);
    tenants.rows.forEach(t => {
      console.log(`  - ${t.nom} (${t.slug}) - Schema: ${t.schema_name}`);
    });
    console.log('');

    // 3. Check users in each tenant schema
    console.log('=== USERS IN TENANT SCHEMAS ===');
    for (const tenant of tenants.rows) {
      if (!tenant.schema_name) {
        console.log(`⚠️  Tenant ${tenant.nom} has no schema_name`);
        continue;
      }

      try {
        const users = await client.query(`
          SELECT id, email, prenom, nom, role, actif 
          FROM "${tenant.schema_name}".utilisateur 
          LIMIT 10
        `);
        
        console.log(`\n📁 Schema: ${tenant.schema_name} (${tenant.nom})`);
        console.log(`   Found ${users.rows.length} user(s):`);
        users.rows.forEach(u => {
          console.log(`   - ${u.email} (${u.prenom} ${u.nom}) - Role: ${u.role} - Active: ${u.actif}`);
        });
      } catch (err) {
        console.log(`❌ Error querying schema ${tenant.schema_name}: ${err.message}`);
      }
    }

    console.log('\n=== DIAGNOSIS COMPLETE ===');
    console.log('\nTo test login, try one of the emails listed above.');
    console.log('If no users are found, you need to create users first.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

diagnoseLoginIssue();

// Made with Bob
