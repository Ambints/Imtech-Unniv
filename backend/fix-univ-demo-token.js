const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function fixTokenColumn() {
  try {
    console.log('Updating token_reset column in univ_demo schema...');
    
    await pool.query('ALTER TABLE univ_demo.utilisateur ALTER COLUMN token_reset TYPE TEXT');
    console.log('✓ Column token_reset updated to TEXT in univ_demo schema');
    
    const result = await pool.query(`
      SELECT data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_schema = 'univ_demo' 
        AND table_name = 'utilisateur' 
        AND column_name = 'token_reset'
    `);
    
    console.log('Verified type:', result.rows[0].data_type);
    console.log('Max length:', result.rows[0].character_maximum_length || 'unlimited');
    
    // Also check other tenant schemas
    const schemas = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%' OR schema_name LIKE 'univ_%'
    `);
    
    console.log('\nUpdating all tenant schemas...');
    for (const row of schemas.rows) {
      try {
        await pool.query(`ALTER TABLE ${row.schema_name}.utilisateur ALTER COLUMN token_reset TYPE TEXT`);
        console.log(`✓ Updated ${row.schema_name}`);
      } catch (err) {
        console.log(`  ${row.schema_name}: ${err.message}`);
      }
    }
    
    console.log('\n✓ All schemas updated successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixTokenColumn();

// Made with Bob
