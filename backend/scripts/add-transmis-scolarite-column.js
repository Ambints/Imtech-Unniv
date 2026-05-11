const { Client } = require('pg');
require('dotenv').config();

async function addTransmisScolariteColumn() {
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
    const tenantsResult = await client.query(`
      SELECT id, schema_name FROM public.tenant WHERE actif = true
    `);

    console.log(`\n📋 Found ${tenantsResult.rows.length} active tenants\n`);

    for (const tenant of tenantsResult.rows) {
      const schemaName = tenant.schema_name;
      console.log(`\n🔧 Processing tenant: ${schemaName}`);

      try {
        // Check if the column already exists
        const checkColumn = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_schema = $1 
            AND table_name = 'proces_verbal' 
            AND column_name = 'transmis_a_scolarite'
        `, [schemaName]);

        if (checkColumn.rows.length > 0) {
          console.log(`   ⏭️  Column 'transmis_a_scolarite' already exists in ${schemaName}`);
          continue;
        }

        // Add the missing columns to proces_verbal table
        await client.query(`
          ALTER TABLE ${schemaName}.proces_verbal
          ADD COLUMN IF NOT EXISTS transmis_a_scolarite BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS date_transmission_scolarite TIMESTAMP,
          ADD COLUMN IF NOT EXISTS transmis_par VARCHAR(255);
        `);

        console.log(`   ✅ Added columns to ${schemaName}.proces_verbal`);

        // Update existing records to set transmis_a_scolarite based on statut
        const updateResult = await client.query(`
          UPDATE ${schemaName}.proces_verbal
          SET transmis_a_scolarite = CASE 
            WHEN statut = 'transmis_scolarite' THEN true 
            ELSE false 
          END
          WHERE transmis_a_scolarite IS NULL;
        `);

        console.log(`   📝 Updated ${updateResult.rowCount} existing records`);

      } catch (error) {
        console.error(`   ❌ Error processing ${schemaName}:`, error.message);
      }
    }

    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the migration
addTransmisScolariteColumn()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });

// Made with Bob
