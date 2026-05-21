const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007'
});

async function checkSuperAdminColumns() {
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données\n');

    // Vérifier les colonnes de la table super_admin
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'super_admin'
      ORDER BY ordinal_position
    `);

    console.log('📋 Colonnes de la table public.super_admin:');
    console.log('─'.repeat(80));
    result.rows.forEach(row => {
      console.log(`- ${row.column_name.padEnd(30)} | ${row.data_type.padEnd(20)} | Nullable: ${row.is_nullable}`);
    });
    console.log('─'.repeat(80));
    console.log(`\nTotal: ${result.rows.length} colonnes\n`);

    // Vérifier si les colonnes manquantes existent
    const requiredColumns = ['password_reset_required', 'last_password_reset'];
    const existingColumns = result.rows.map(r => r.column_name);
    
    console.log('🔍 Vérification des colonnes requises:');
    requiredColumns.forEach(col => {
      if (existingColumns.includes(col)) {
        console.log(`✅ ${col} - EXISTE`);
      } else {
        console.log(`❌ ${col} - MANQUANTE`);
      }
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

checkSuperAdminColumns();

// Made with Bob
