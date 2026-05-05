const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testSqlDirect() {
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
    console.log('✅ Connecté\n');

    const schemaName = 'tenant_test_direct';
    
    // 1. Créer le schéma
    console.log(`🔧 Création du schéma: ${schemaName}`);
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    console.log('✅ Schéma créé\n');

    // 2. Créer les extensions
    console.log('🔧 Création des extensions...');
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    console.log('✅ Extensions créées\n');

    // 3. Définir le search_path
    console.log(`🔧 Définition du search_path sur ${schemaName}`);
    await client.query(`SET search_path TO "${schemaName}"`);
    console.log('✅ search_path défini\n');

    // 4. Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'src', 'tenants', 'tenant-schema.sql');
    console.log(`📄 Lecture du fichier: ${sqlPath}`);
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    console.log(`✅ Fichier lu (${sqlContent.length} caractères)\n`);

    // 5. Exécuter le SQL complet d'un coup
    console.log('🔧 Exécution du script SQL complet...');
    try {
      await client.query(sqlContent);
      console.log('✅ Script exécuté avec succès\n');
    } catch (error) {
      console.error('❌ Erreur lors de l\'exécution du script:');
      console.error(`   Message: ${error.message}`);
      console.error(`   Position: ${error.position || 'N/A'}`);
      
      if (error.position) {
        const pos = parseInt(error.position);
        const snippet = sqlContent.substring(Math.max(0, pos - 100), Math.min(sqlContent.length, pos + 100));
        console.error(`\n   Contexte autour de l'erreur:`);
        console.error(`   ${snippet}`);
      }
      throw error;
    }

    // 6. Vérifier les tables créées
    console.log('🔍 Vérification des tables créées...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1
      ORDER BY table_name
    `, [schemaName]);
    
    console.log(`✅ ${tables.rows.length} tables créées:`);
    tables.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.table_name}`);
    });

    // 7. Nettoyer
    console.log(`\n🧹 Suppression du schéma de test...`);
    await client.query(`SET search_path TO public`);
    await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
    console.log('✅ Nettoyé\n');

    console.log('🎉 Test réussi !');

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
  } finally {
    await client.end();
    console.log('\n🔌 Déconnexion');
  }
}

testSqlDirect();

// Made with Bob
