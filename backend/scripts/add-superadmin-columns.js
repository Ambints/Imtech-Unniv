const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007'
});

async function addSuperAdminColumns() {
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données\n');

    // Ajouter les colonnes manquantes
    console.log('📝 Ajout des colonnes manquantes...\n');

    // 1. Ajouter password_reset_required
    try {
      await client.query(`
        ALTER TABLE public.super_admin 
        ADD COLUMN IF NOT EXISTS password_reset_required BOOLEAN DEFAULT false
      `);
      console.log('✅ Colonne password_reset_required ajoutée');
    } catch (error) {
      console.log('⚠️  Colonne password_reset_required existe déjà ou erreur:', error.message);
    }

    // 2. Ajouter last_password_reset
    try {
      await client.query(`
        ALTER TABLE public.super_admin 
        ADD COLUMN IF NOT EXISTS last_password_reset TIMESTAMP WITH TIME ZONE
      `);
      console.log('✅ Colonne last_password_reset ajoutée');
    } catch (error) {
      console.log('⚠️  Colonne last_password_reset existe déjà ou erreur:', error.message);
    }

    // Vérifier les colonnes après ajout
    console.log('\n📋 Vérification des colonnes après ajout:');
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'super_admin'
      ORDER BY ordinal_position
    `);

    console.log('─'.repeat(80));
    result.rows.forEach(row => {
      console.log(`- ${row.column_name.padEnd(30)} | ${row.data_type.padEnd(20)} | Nullable: ${row.is_nullable}`);
    });
    console.log('─'.repeat(80));
    console.log(`\nTotal: ${result.rows.length} colonnes\n`);

    console.log('✅ Migration terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

addSuperAdminColumns();

// Made with Bob
