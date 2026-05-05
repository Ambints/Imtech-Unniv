const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '2007',
  database: 'Imtech_SaaS'
});

client.connect()
  .then(() => client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'super_admin'
    ORDER BY ordinal_position
  `))
  .then(res => {
    console.log('Columns in super_admin table:');
    res.rows.forEach(r => {
      console.log(`  ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable})`);
    });
    client.end();
  })
  .catch(err => {
    console.error('Error:', err.message);
    client.end();
  });

// Made with Bob
