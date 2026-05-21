const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '2007',
  database: 'Imtech_SaaS'
});

async function checkColumns() {
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données\n');
    
    const result = await client.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'tenant_ispm' 
        AND table_name = 'utilisateur'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Colonnes de tenant_ispm.utilisateur:\n');
    console.log('Nom de colonne'.padEnd(30) + 'Type'.padEnd(20) + 'Nullable');
    console.log('-'.repeat(70));
    
    result.rows.forEach(row => {
      const name = row.column_name.padEnd(30);
      const type = (row.data_type + (row.character_maximum_length ? `(${row.character_maximum_length})` : '')).padEnd(20);
      const nullable = row.is_nullable;
      console.log(`${name}${type}${nullable}`);
    });
    
    console.log('\n🔍 Recherche de colonnes password:');
    const passwordCols = result.rows.filter(r => 
      r.column_name.toLowerCase().includes('password') || 
      r.column_name.toLowerCase().includes('mot_de_passe')
    );
    
    if (passwordCols.length > 0) {
      passwordCols.forEach(col => {
        console.log(`  ✅ Trouvé: ${col.column_name} (${col.data_type})`);
      });
    } else {
      console.log('  ❌ Aucune colonne password trouvée!');
    }
    
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    await client.end();
  }
}

checkColumns();

// Made with Bob
