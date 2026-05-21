const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'imtech_saas', // Try lowercase first
  user: 'postgres',
  password: '2007'
});

async function fixLogin() {
  try {
    await client.connect();
    console.log('✅ Connected to database: imtech_saas');
    
    // Check if ispm schema exists
    const schemaCheck = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'ispm'
    `);
    
    if (schemaCheck.rows.length === 0) {
      console.log('❌ Schema ispm does not exist!');
      return;
    }
    
    console.log('✅ Schema ispm exists');
    
    // Set schema
    await client.query('SET search_path TO ispm');
    console.log('✅ Schema set to ispm');
    
    // Check if utilisateur table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'ispm' 
        AND table_name = 'utilisateur'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Table utilisateur does not exist in ispm schema!');
      return;
    }
    
    console.log('✅ Table utilisateur exists');
    
    // Check columns
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'ispm' 
      AND table_name = 'utilisateur'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Columns in utilisateur table:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Check if there are any users
    const userCount = await client.query('SELECT COUNT(*) FROM utilisateur');
    console.log(`\n👥 Total users: ${userCount.rows[0].count}`);
    
    // Check for scolarite user
    const scolariteUsers = await client.query(`
      SELECT id, email, nom, prenom, role, actif, 
             CASE 
               WHEN password_hash IS NULL THEN 'NULL'
               WHEN password_hash = '' THEN 'EMPTY'
               WHEN password_hash LIKE '$2b$%' THEN 'BCRYPT_HASH'
               ELSE 'PLAIN_TEXT'
             END as password_status
      FROM utilisateur 
      WHERE role = 'scolarite'
    `);
    
    console.log(`\n🔍 Scolarite users found: ${scolariteUsers.rows.length}`);
    scolariteUsers.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.nom} ${user.prenom})`);
      console.log(`    Role: ${user.role}, Actif: ${user.actif}`);
      console.log(`    Password status: ${user.password_status}`);
    });
    
    // If no scolarite user or password is not hashed, create/fix one
    if (scolariteUsers.rows.length === 0 || 
        scolariteUsers.rows.some(u => u.password_status !== 'BCRYPT_HASH')) {
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('password123', 10);
      
      console.log('\n🔧 Creating/Fixing scolarite user...');
      
      // Check if user exists
      const existingUser = await client.query(`
        SELECT id FROM utilisateur WHERE email = 'scolarite@ispm.edu'
      `);
      
      if (existingUser.rows.length > 0) {
        // Update existing user
        await client.query(`
          UPDATE utilisateur 
          SET password_hash = $1, actif = true
          WHERE email = 'scolarite@ispm.edu'
        `, [hashedPassword]);
        console.log('✅ Updated existing scolarite user');
      } else {
        // Create new user
        await client.query(`
          INSERT INTO utilisateur (email, password_hash, nom, prenom, role, actif, email_verifie)
          VALUES ('scolarite@ispm.edu', $1, 'Service', 'Scolarité', 'scolarite', true, true)
        `, [hashedPassword]);
        console.log('✅ Created new scolarite user');
      }
      
      console.log('\n📧 Login credentials:');
      console.log('   Email: scolarite@ispm.edu');
      console.log('   Password: password123');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Try with uppercase database name
    if (error.message.includes('does not exist')) {
      console.log('\n🔄 Trying with uppercase database name: IMTECH_SAAS');
      const clientUpper = new Client({
        host: 'localhost',
        port: 5432,
        database: 'IMTECH_SAAS',
        user: 'postgres',
        password: '2007'
      });
      
      try {
        await clientUpper.connect();
        console.log('✅ Connected to IMTECH_SAAS');
        await clientUpper.end();
        console.log('\n⚠️  Update backend/.env to use DB_NAME=IMTECH_SAAS (uppercase)');
      } catch (err) {
        console.log('❌ IMTECH_SAAS also not found');
        console.log('\n💡 Available databases:');
        const mainClient = new Client({
          host: 'localhost',
          port: 5432,
          database: 'postgres',
          user: 'postgres',
          password: '2007'
        });
        await mainClient.connect();
        const dbs = await mainClient.query('SELECT datname FROM pg_database WHERE datistemplate = false');
        dbs.rows.forEach(db => console.log(`   - ${db.datname}`));
        await mainClient.end();
      }
    }
  } finally {
    await client.end();
  }
}

fixLogin();

// Made with Bob
