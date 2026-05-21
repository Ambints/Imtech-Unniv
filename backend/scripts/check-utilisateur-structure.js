const { Client } = require('pg');
require('dotenv').config();

async function checkUtilisateurStructure() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'imtech_university',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('✓ Connecté à PostgreSQL\n');

    const schema = 'tenant_ispm';
    
    // Vérifier les colonnes de la table utilisateur
    console.log('📋 Structure de la table UTILISATEUR:');
    console.log('='.repeat(60));
    const utilisateurColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = 'utilisateur'
      ORDER BY ordinal_position
    `, [schema]);
    
    if (utilisateurColumns.rows.length === 0) {
      console.log('❌ Table utilisateur n\'existe pas dans le schéma tenant_ispm');
    } else {
      utilisateurColumns.rows.forEach(col => {
        console.log(`  ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable}`);
      });
    }

    console.log('\n✅ Vérification terminée');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkUtilisateurStructure();

// Made with Bob
