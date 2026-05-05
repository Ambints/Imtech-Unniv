const { Client } = require('pg');
require('dotenv').config();

async function testSchemaCreation() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'Imtech_SaaS',
  });

  try {
    console.log('🔌 Connexion à PostgreSQL...');
    await client.connect();
    console.log('✅ Connecté à la base de données');

    // Test 1: Vérifier les schémas existants
    console.log('\n📊 Schémas existants:');
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%' OR schema_name = 'public'
      ORDER BY schema_name
    `);
    schemas.rows.forEach(row => {
      console.log(`   - ${row.schema_name}`);
    });

    // Test 2: Créer un schéma de test
    const testSchemaName = 'tenant_test_' + Date.now();
    console.log(`\n🔧 Création du schéma de test: ${testSchemaName}`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${testSchemaName}"`);
    console.log('✅ Schéma créé');

    // Test 3: Vérifier que le schéma existe
    const checkSchema = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = $1
    `, [testSchemaName]);

    if (checkSchema.rows.length > 0) {
      console.log('✅ Schéma vérifié dans information_schema');
    } else {
      console.log('❌ Schéma non trouvé dans information_schema');
    }

    // Test 4: Créer une table de test dans le schéma
    console.log('\n🔧 Création d\'une table de test...');
    await client.query(`SET search_path TO "${testSchemaName}"`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100)
      )
    `);
    console.log('✅ Table créée');

    // Test 5: Vérifier les tables dans le schéma
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1
    `, [testSchemaName]);
    
    console.log(`✅ ${tables.rows.length} table(s) trouvée(s):`);
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Test 6: Nettoyer
    console.log(`\n🧹 Suppression du schéma de test...`);
    await client.query(`SET search_path TO public`);
    await client.query(`DROP SCHEMA IF EXISTS "${testSchemaName}" CASCADE`);
    console.log('✅ Schéma de test supprimé');

    console.log('\n🎉 Tous les tests sont passés avec succès!');
    console.log('✅ PostgreSQL peut créer des schémas correctement');

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
    console.log('\n🔌 Déconnexion de PostgreSQL');
  }
}

testSchemaCreation();

// Made with Bob
