const { Client } = require('pg');
require('dotenv').config();

async function checkDBStructure() {
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
    
    // Vérifier les colonnes de la table parcours
    console.log('📋 Structure de la table PARCOURS:');
    console.log('='.repeat(60));
    const parcoursColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = 'parcours'
      ORDER BY ordinal_position
    `, [schema]);
    
    parcoursColumns.rows.forEach(col => {
      console.log(`  ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable}`);
    });

    // Vérifier les colonnes de la table etudiant
    console.log('\n📋 Structure de la table ETUDIANT:');
    console.log('='.repeat(60));
    const etudiantColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = 'etudiant'
      ORDER BY ordinal_position
    `, [schema]);
    
    etudiantColumns.rows.forEach(col => {
      console.log(`  ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable}`);
    });

    // Vérifier les colonnes de la table inscription
    console.log('\n📋 Structure de la table INSCRIPTION:');
    console.log('='.repeat(60));
    const inscriptionColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = 'inscription'
      ORDER BY ordinal_position
    `, [schema]);
    
    inscriptionColumns.rows.forEach(col => {
      console.log(`  ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable}`);
    });

    console.log('\n✅ Vérification terminée');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkDBStructure();

// Made with Bob
