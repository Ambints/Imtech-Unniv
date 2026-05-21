require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function testLogin(email, password) {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'imtech_university',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Test super admin first
    console.log(`🔍 Testing login for: ${email}\n`);
    console.log('=== CHECKING SUPER ADMIN ===');
    const superAdmin = await client.query(
      'SELECT id, email, password, prenom, nom, actif FROM public.super_admin WHERE email = $1',
      [email]
    );

    if (superAdmin.rows.length > 0) {
      const user = superAdmin.rows[0];
      console.log('✅ Found in super_admin table');
      console.log(`   Name: ${user.prenom} ${user.nom}`);
      console.log(`   Active: ${user.actif}`);
      console.log(`   Password hash: ${user.password.substring(0, 20)}...`);
      
      const isValid = await bcrypt.compare(password, user.password);
      console.log(`   Password match: ${isValid ? '✅ YES' : '❌ NO'}`);
      
      if (isValid && user.actif) {
        console.log('\n✅ LOGIN SHOULD SUCCEED as super_admin');
      } else if (!isValid) {
        console.log('\n❌ LOGIN WILL FAIL - Wrong password');
        console.log('   Try default password: Imtech@2024!');
      } else {
        console.log('\n❌ LOGIN WILL FAIL - Account inactive');
      }
      return;
    }

    console.log('❌ Not found in super_admin table\n');

    // Check tenant schemas
    console.log('=== CHECKING TENANT SCHEMAS ===');
    const tenants = await client.query('SELECT id, nom, slug, schema_name FROM public.tenant WHERE actif = true');
    
    for (const tenant of tenants.rows) {
      if (!tenant.schema_name) continue;
      
      try {
        const users = await client.query(
          `SELECT id, email, password_hash, prenom, nom, role, actif 
           FROM "${tenant.schema_name}".utilisateur 
           WHERE email = $1`,
          [email]
        );
        
        if (users.rows.length > 0) {
          const user = users.rows[0];
          console.log(`✅ Found in schema: ${tenant.schema_name} (${tenant.nom})`);
          console.log(`   Name: ${user.prenom} ${user.nom}`);
          console.log(`   Role: ${user.role}`);
          console.log(`   Active: ${user.actif}`);
          console.log(`   Password hash: ${user.password_hash.substring(0, 20)}...`);
          
          const isValid = await bcrypt.compare(password, user.password_hash);
          console.log(`   Password match: ${isValid ? '✅ YES' : '❌ NO'}`);
          
          if (isValid && user.actif) {
            console.log(`\n✅ LOGIN SHOULD SUCCEED as ${user.role} in ${tenant.nom}`);
          } else if (!isValid) {
            console.log('\n❌ LOGIN WILL FAIL - Wrong password');
            console.log('   Try default password: Imtech@2024!');
          } else {
            console.log('\n❌ LOGIN WILL FAIL - Account inactive');
          }
          return;
        }
      } catch (err) {
        console.log(`⚠️  Error checking schema ${tenant.schema_name}: ${err.message}`);
      }
    }

    console.log('\n❌ Email not found in any schema');
    console.log('\nAvailable emails:');
    console.log('  Super admin: superadmin@imtech-university.mg');
    console.log('  ISPM: admin@ispm.mg, rp@ispm.mg, sc@ispm.mg, etc.');
    console.log('  UCM: admin@ucm.edu, admin@ucm.com');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

// Get email and password from command line
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node test-login-credentials.js <email> <password>');
  console.log('Example: node test-login-credentials.js admin@ispm.mg Imtech@2024!');
  process.exit(1);
}

testLogin(email, password);

// Made with Bob
