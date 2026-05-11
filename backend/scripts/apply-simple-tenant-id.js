require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'imtech_university',
});

async function applyMigration() {
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données:', process.env.DB_NAME);
    console.log('');

    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'add-tenant-id-column-simple.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Ajout de la colonne tenant_id...');
    console.log('');

    // Exécuter le SQL
    await client.query(sql);
    
    console.log('');
    console.log('✅ Colonne ajoutée avec succès !');
    console.log('');

    // Vérifier la structure
    const result = await client.query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'utilisateur'
      ORDER BY ordinal_position
    `);

    console.log('📊 Structure de la table utilisateur:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name} (${row.data_type}) ${row.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('');
    console.log('✅ Connexion fermée');
  }
}

applyMigration()
  .then(() => {
    console.log('');
    console.log('✅ Script terminé avec succès');
    console.log('');
    console.log('ℹ️  Note: La colonne tenant_id a été ajoutée mais est NULL pour tous les utilisateurs.');
    console.log('ℹ️  Le système fonctionne en mode mono-schéma (DEFAULT_TENANT_SCHEMA=tenant_ispm)');
    console.log('ℹ️  Les utilisateurs peuvent se connecter sans tenantId.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

// Made with Bob
