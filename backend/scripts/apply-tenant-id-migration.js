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
    const sqlPath = path.join(__dirname, 'add-tenant-id-to-utilisateur.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Exécution de la migration...');
    console.log('');

    // Exécuter le SQL
    const result = await client.query(sql);
    
    console.log('');
    console.log('✅ Migration exécutée avec succès !');
    console.log('');

    // Afficher les notices si disponibles
    if (result.rows && result.rows.length > 0) {
      console.log('📊 Résumé des utilisateurs par tenant:');
      result.rows.forEach(row => {
        console.log(`  ${row.tenant_nom} - ${row.role}: ${row.count}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
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
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

// Made with Bob
