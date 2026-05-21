const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007'
});

async function fixSchema() {
  try {
    await client.connect();
    console.log('✅ Connected to Imtech_SaaS');
    
    // Set schema to univ_demo
    await client.query('SET search_path TO univ_demo');
    console.log('✅ Schema set to univ_demo');
    
    // Check columns in utilisateur table
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'univ_demo' 
      AND table_name = 'utilisateur'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Current columns in univ_demo.utilisateur:');
    const columnNames = columns.rows.map(c => c.column_name);
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check if password_hash exists
    const hasPasswordHash = columnNames.includes('password_hash');
    const hasPassword = columnNames.includes('password');
    
    console.log(`\n🔍 Column check:`);
    console.log(`  - password_hash exists: ${hasPasswordHash}`);
    console.log(`  - password exists: ${hasPassword}`);
    
    if (!hasPasswordHash && hasPassword) {
      console.log('\n🔧 Renaming password column to password_hash...');
      await client.query(`
        ALTER TABLE utilisateur 
        RENAME COLUMN password TO password_hash
      `);
      console.log('✅ Column renamed successfully');
    } else if (!hasPasswordHash && !hasPassword) {
      console.log('\n❌ Neither password nor password_hash column exists!');
      console.log('Creating password_hash column...');
      await client.query(`
        ALTER TABLE utilisateur 
        ADD COLUMN password_hash VARCHAR(255)
      `);
      console.log('✅ password_hash column created');
    } else if (hasPasswordHash) {
      console.log('\n✅ password_hash column already exists');
    }
    
    // Check for users
    const users = await client.query(`
      SELECT id, email, nom, prenom, role, actif 
      FROM utilisateur 
      LIMIT 5
    `);
    
    console.log(`\n👥 Users in univ_demo schema: ${users.rows.length}`);
    users.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - actif: ${user.actif}`);
    });
    
    // Check if admin@ispm.mg exists
    const adminUser = await client.query(`
      SELECT id, email, role, actif, password_hash 
      FROM utilisateur 
      WHERE email = 'admin@ispm.mg'
    `);
    
    if (adminUser.rows.length > 0) {
      const user = adminUser.rows[0];
      console.log(`\n✅ User admin@ispm.mg found:`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Actif: ${user.actif}`);
      console.log(`   Password hash exists: ${user.password_hash ? 'Yes' : 'No'}`);
      
      if (!user.password_hash || !user.password_hash.startsWith('$2b$')) {
        console.log('\n🔧 Fixing password hash for admin@ispm.mg...');
        const bcrypt = require('bcryptjs');
        const hash = bcrypt.hashSync('password123', 10);
        await client.query(`
          UPDATE utilisateur 
          SET password_hash = $1 
          WHERE email = 'admin@ispm.mg'
        `, [hash]);
        console.log('✅ Password updated');
        console.log('\n📧 Login credentials:');
        console.log('   Email: admin@ispm.mg');
        console.log('   Password: password123');
      }
    } else {
      console.log('\n⚠️  User admin@ispm.mg not found');
      console.log('Creating user...');
      const bcrypt = require('bcryptjs');
      const hash = bcrypt.hashSync('password123', 10);
      await client.query(`
        INSERT INTO utilisateur (email, password_hash, nom, prenom, role, actif, email_verifie)
        VALUES ('admin@ispm.mg', $1, 'Admin', 'ISPM', 'scolarite', true, true)
      `, [hash]);
      console.log('✅ User created');
      console.log('\n📧 Login credentials:');
      console.log('   Email: admin@ispm.mg');
      console.log('   Password: password123');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

fixSchema();

// Made with Bob
