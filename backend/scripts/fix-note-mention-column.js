const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'imtech_university',
});

async function fixMentionColumn() {
  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL');

    // Modifier la colonne mention pour accepter NULL
    await client.query(`
      SET search_path TO "tenant_ispm";
      ALTER TABLE note ALTER COLUMN mention DROP NOT NULL;
      ALTER TABLE note ALTER COLUMN mention DROP DEFAULT;
    `);

    console.log('✅ Colonne "mention" modifiée avec succès (nullable)');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

fixMentionColumn();

// Made with Bob
