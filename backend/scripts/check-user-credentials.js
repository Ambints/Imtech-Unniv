const { Client } = require('pg');

async function checkUser() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'Imtech_SaaS',
    user: 'postgres',
    password: '2007'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Set schema
    await client.query('SET search_path TO tenant_ispm');
    console.log('✅ Schema set to tenant_ispm');

    // First, check table structure
    const columnsResult = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'tenant_ispm'
      AND table_name = 'utilisateur'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Table structure (utilisateur):');
    columnsResult.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // Check user without password column
    const result = await client.query(
      'SELECT * FROM utilisateur WHERE email = $1',
      ['admin@ispm.mg']
    );

    if (result.rows.length === 0) {
      console.log('\n❌ User not found with email: admin@ispm.mg');
      
      // List all users
      const allUsers = await client.query('SELECT id, nom, prenom, email, role FROM utilisateur LIMIT 10');
      console.log('\n📋 Available users:');
      allUsers.rows.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - ${user.nom} ${user.prenom}`);
      });
    } else {
      const user = result.rows[0];
      console.log('\n✅ User found:');
      console.log(JSON.stringify(user, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUser();

// Made with Bob
