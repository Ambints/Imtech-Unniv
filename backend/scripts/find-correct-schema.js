const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007'
});

async function findSchema() {
  try {
    await client.connect();
    console.log('✅ Connected to Imtech_SaaS');
    
    // List all schemas
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `);
    
    console.log('\n📊 Available schemas:');
    console.log('─'.repeat(60));
    
    for (const schema of schemas.rows) {
      const schemaName = schema.schema_name;
      
      // Check if utilisateur table exists in this schema
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_name = 'utilisateur'
        );
      `, [schemaName]);
      
      const hasUtilisateur = tableCheck.rows[0].exists;
      
      if (hasUtilisateur) {
        // Count users
        const countResult = await client.query(`
          SELECT COUNT(*) FROM "${schemaName}".utilisateur
        `);
        const userCount = countResult.rows[0].count;
        
        // Check for admin@ispm.mg
        const adminCheck = await client.query(`
          SELECT email, role FROM "${schemaName}".utilisateur 
          WHERE email = 'admin@ispm.mg'
        `);
        
        console.log(`✅ ${schemaName.padEnd(30)} ${userCount} users`);
        if (adminCheck.rows.length > 0) {
          console.log(`   └─ Contains admin@ispm.mg (${adminCheck.rows[0].role})`);
        }
      } else {
        console.log(`   ${schemaName.padEnd(30)} (no utilisateur table)`);
      }
    }
    
    console.log('─'.repeat(60));
    
    // Check tenants table
    console.log('\n🏢 Checking tenants table...');
    const tenants = await client.query(`
      SELECT id, nom, slug, schema_name, actif 
      FROM public.tenants 
      WHERE actif = true
      ORDER BY nom
    `);
    
    console.log(`\nActive tenants: ${tenants.rows.length}`);
    tenants.rows.forEach(t => {
      console.log(`  - ${t.nom} (${t.slug})`);
      console.log(`    Schema: ${t.schema_name}`);
      console.log(`    ID: ${t.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

findSchema();

// Made with Bob
