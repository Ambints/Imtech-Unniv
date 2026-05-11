const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '2007'
});

async function listDatabases() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');
    
    const result = await client.query(`
      SELECT datname, pg_size_pretty(pg_database_size(datname)) as size
      FROM pg_database 
      WHERE datistemplate = false
      ORDER BY datname
    `);
    
    console.log('\n📊 Available databases:');
    console.log('─'.repeat(60));
    result.rows.forEach(db => {
      console.log(`  ${db.datname.padEnd(40)} ${db.size}`);
    });
    console.log('─'.repeat(60));
    
    console.log('\n💡 Update backend/.env with the correct database name');
    console.log('   Current: DB_NAME=IMTECH_SAAS');
    console.log('   Should be one of the databases listed above');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

listDatabases();

// Made with Bob
