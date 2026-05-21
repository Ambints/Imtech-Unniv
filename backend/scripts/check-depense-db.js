const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'imtech_university',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const schemas = ['tenant_test', 'tenant_ispm'];
    for (const schema of schemas) {
      console.log(`\n--- Users in ${schema} ---`);
      const usersRes = await client.query(`
        SELECT id, email, nom, prenom, role, actif 
        FROM "${schema}".utilisateur
      `);
      console.log(usersRes.rows);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

run();
