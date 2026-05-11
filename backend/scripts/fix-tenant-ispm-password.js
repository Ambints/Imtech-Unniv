const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007'
});

async function fixPassword() {
  try {
    await client.connect();
    console.log('✅ Connected to Imtech_SaaS');
    
    // Set schema to tenant_ispm
    await client.query('SET search_path TO tenant_ispm');
    console.log('✅ Schema set to tenant_ispm');
    
    // Check columns
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'tenant_ispm' 
      AND table_name = 'utilisateur'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Columns in tenant_ispm.utilisateur:');
    const columnNames = columns.rows.map(c => c.column_name);
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    const hasPasswordHash = columnNames.includes('password_hash');
    const hasPassword = columnNames.includes('password');
    
    console.log(`\n🔍 Password column check:`);
    console.log(`  - password_hash: ${hasPasswordHash}`);
    console.log(`  - password: ${hasPassword}`);
    
    // Rename if needed
    if (!hasPasswordHash && hasPassword) {
      console.log('\n🔧 Renaming password to password_hash...');
      await client.query(`ALTER TABLE utilisateur RENAME COLUMN password TO password_hash`);
      console.log('✅ Column renamed');
    }
    
    // Check admin user
    const admin = await client.query(`
      SELECT id, email, role, actif, password_hash 
      FROM utilisateur 
      WHERE email = 'admin@ispm.mg'
    `);
    
    if (admin.rows.length > 0) {
      const user = admin.rows[0];
      console.log(`\n✅ User found: admin@ispm.mg`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Actif: ${user.actif}`);
      
      const passwordHash = user.password_hash;
      const isBcrypt = passwordHash && passwordHash.startsWith('$2b$');
      console.log(`   Password is bcrypt hash: ${isBcrypt}`);
      
      if (!isBcrypt) {
        console.log('\n🔧 Updating password to bcrypt hash...');
        const hash = bcrypt.hashSync('password123', 10);
        await client.query(`
          UPDATE utilisateur 
          SET password_hash = $1 
          WHERE email = 'admin@ispm.mg'
        `, [hash]);
        console.log('✅ Password updated');
      }
      
      console.log('\n📧 Login Credentials:');
      console.log('   Email: admin@ispm.mg');
      console.log('   Password: password123');
      console.log('\n⚠️  IMPORTANT: The middleware is setting schema to "univ_demo"');
      console.log('   but the correct schema is "tenant_ispm"');
      console.log('   This needs to be fixed in the tenant middleware or tenant configuration.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

fixPassword();

// Made with Bob
