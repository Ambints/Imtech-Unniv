const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2007',
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('--- Database Connection Check ---');
    const dbName = await client.query('SELECT current_database()');
    console.log('Connected to database:', dbName.rows[0].current_database);

    console.log('\n--- Active Tenants ---');
    const tenants = await client.query('SELECT id, nom, schema_name, actif FROM public.tenant');
    console.log(tenants.rows);

    for (const tenant of tenants.rows) {
      if (!tenant.actif) continue;
      const schema = tenant.schema_name;
      console.log(`\n=== Checking Schema: ${schema} ===`);
      
      // Check tables in this schema
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1
        ORDER BY table_name
      `, [schema]);
      const tables = tablesResult.rows.map(r => r.table_name);
      console.log('Tables found:', tables.join(', '));

      // Check if depense, budget, utilisateur, annee_academique exist
      const checkTables = ['depense', 'budget', 'utilisateur', 'annee_academique'];
      for (const t of checkTables) {
        const exists = tables.includes(t);
        console.log(`Table "${t}" exists?`, exists ? '✅ YES' : '❌ NO');
        if (exists) {
          // Print columns
          const colsResult = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = $1 AND table_name = $2
          `, [schema, t]);
          console.log(`  Columns for ${t}:`, colsResult.rows.map(r => `${r.column_name} (${r.data_type})`).join(', '));
        }
      }

      // Try running the query that might be failing
      console.log(`\nTrying count query for schema ${schema}...`);
      try {
        await client.query(`SET search_path TO "${schema}", public`);
        const countRes = await client.query(`
          SELECT COUNT(*) as total
          FROM depense d
          LEFT JOIN budget b ON d.budget_id = b.id
          LEFT JOIN utilisateur u1 ON d.demande_par = u1.id
          LEFT JOIN utilisateur u2 ON d.approuve_par = u2.id
          JOIN annee_academique aa ON d.annee_academique_id = aa.id
        `);
        console.log('Count query Success! Total:', countRes.rows[0].total);
      } catch (err) {
        console.error('Count query Failed ❌:', err.message);
      }
    }
  } catch (err) {
    console.error('Error running script:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
