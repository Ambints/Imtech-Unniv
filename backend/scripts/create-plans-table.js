const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function createPlansTable() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'imtech_university',
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Read SQL file
    const sqlPath = path.join(__dirname, '../../create_plans_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute SQL
    await client.query(sql);
    console.log('✓ Plans table created successfully');
    console.log('✓ Default plans inserted');

  } catch (error) {
    console.error('Error creating plans table:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createPlansTable();

// Made with Bob
