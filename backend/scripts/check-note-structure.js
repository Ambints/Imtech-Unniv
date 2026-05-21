const { Client } = require('pg');
require('dotenv').config();

async function checkNoteStructure() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'imtech_university',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL\n');

    // Définir le schéma
    await client.query("SET search_path TO 'tenant_ispm'");
    
    // Vérifier la structure de la table note
    const result = await client.query(`
      SELECT
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'tenant_ispm'
        AND table_name = 'note'
      ORDER BY ordinal_position;
    `);

    console.log('📋 Structure de la table note dans tenant_ispm:');
    console.table(result.rows);

    // Vérifier spécifiquement la colonne mention
    const mentionCol = result.rows.find(r => r.column_name === 'mention');
    if (mentionCol) {
      console.log('\n🔍 Colonne mention:');
      console.log('  - Type:', mentionCol.data_type);
      console.log('  - Nullable:', mentionCol.is_nullable);
      console.log('  - Default:', mentionCol.column_default || 'NULL');
      console.log('  - Max length:', mentionCol.character_maximum_length);
    } else {
      console.log('\n❌ Colonne mention introuvable!');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

checkNoteStructure();

// Made with Bob
