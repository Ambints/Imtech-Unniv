const { Client } = require('pg');
require('dotenv').config();

async function applyMigration() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'imtech_university',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Get all tenant schemas
    const schemasResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);

    console.log(`\n📋 Found ${schemasResult.rows.length} tenant schemas\n`);

    for (const row of schemasResult.rows) {
      const schema = row.schema_name;
      console.log(`\n🔧 Processing schema: ${schema}`);

      try {
        // Check if depense table exists
        const tableCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = $1 AND table_name = 'depense'
          )
        `, [schema]);

        if (!tableCheck.rows[0].exists) {
          console.log(`   ⚠️  Table depense does not exist in ${schema}, skipping...`);
          continue;
        }

        // Check if updated_at column already exists
        const columnCheck = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = $1 AND table_name = 'depense' AND column_name = 'updated_at'
          )
        `, [schema]);

        if (columnCheck.rows[0].exists) {
          console.log(`   ✓ Column updated_at already exists in ${schema}.depense`);
        } else {
          // Add updated_at column
          await client.query(`
            ALTER TABLE ${schema}.depense 
            ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW()
          `);
          console.log(`   ✅ Added updated_at column to ${schema}.depense`);
        }

        // Drop existing trigger if any
        await client.query(`
          DROP TRIGGER IF EXISTS trg_depense_updated_at ON ${schema}.depense
        `);

        // Create trigger
        await client.query(`
          CREATE TRIGGER trg_depense_updated_at 
          BEFORE UPDATE ON ${schema}.depense
          FOR EACH ROW 
          EXECUTE FUNCTION ${schema}.trigger_set_updated_at()
        `);
        console.log(`   ✅ Created trigger trg_depense_updated_at on ${schema}.depense`);

      } catch (error) {
        console.error(`   ❌ Error processing ${schema}:`, error.message);
      }
    }

    console.log('\n✅ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyMigration();

// Made with Bob
