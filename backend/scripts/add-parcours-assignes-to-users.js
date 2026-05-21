const { Client } = require('pg');
require('dotenv').config();

async function addParcoursAssignesToUsers() {
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
            AND table_name = 'utilisateur' 
            AND column_name = 'parcours_assignes'
        `, [schemaName]);

        if (checkColumn.rows.length > 0) {
          console.log(`   ⏭️  Column 'parcours_assignes' already exists in ${schemaName}`);
          continue;
        }

        // Add the parcours_assignes column to utilisateur table
        await client.query(`
          ALTER TABLE ${schemaName}.utilisateur
          ADD COLUMN IF NOT EXISTS parcours_assignes JSONB DEFAULT '[]'::jsonb;
        `);

        console.log(`   ✅ Added 'parcours_assignes' column to ${schemaName}.utilisateur`);

        // Migrate existing secretaire assignments from parcours table to user table
        const migrateResult = await client.query(`
          WITH secretaire_parcours AS (
            SELECT 
              secretaire_id,
              json_agg(id) as parcours_ids
            FROM ${schemaName}.parcours
            WHERE secretaire_id IS NOT NULL
            GROUP BY secretaire_id
          )
          UPDATE ${schemaName}.utilisateur u
          SET parcours_assignes = sp.parcours_ids::jsonb
          FROM secretaire_parcours sp
          WHERE u.id = sp.secretaire_id
            AND u.role = 'secretaire'
            AND (u.parcours_assignes IS NULL OR u.parcours_assignes = '[]'::jsonb);
        `);

        if (migrateResult.rowCount > 0) {
          console.log(`   📝 Migrated ${migrateResult.rowCount} secretaire assignments`);
        }

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
addParcoursAssignesToUsers()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });

// Made with Bob
