require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2007',
});

async function createAdminISPM() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔧 CRÉATION ADMIN POUR TENANT ISPM\n');
    console.log('='.repeat(80));

    const tenantId = 'eaceef7f-dd73-46bd-9d77-231896181cca';
    
    // 1. Vérifier la structure de la table utilisateur
    console.log('\n📋 1. Structure de la table utilisateur:');
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'tenant_ispm' 
      AND table_name = 'utilisateur'
      ORDER BY ordinal_position
    `);
    
    console.log('Colonnes disponibles:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });

    // 2. Vérifier s'il existe déjà des utilisateurs admin
    console.log('\n📋 2. Utilisateurs existants:');
    const users = await client.query(`
      SELECT id, email, nom, prenom, role, actif
      FROM tenant_ispm.utilisateur
      WHERE role IN ('admin', 'president')
      LIMIT 5
    `);

    if (users.rows.length > 0) {
      console.log(`✅ ${users.rows.length} admin(s) trouvé(s):`);
      users.rows.forEach(u => {
        console.log(`   - ${u.email} (${u.role}) ${u.actif ? '✅' : '❌'}`);
      });
    } else {
      console.log('❌ Aucun admin trouvé');
    }

    // 3. Vérifier aussi dans public.utilisateur
    console.log('\n📋 3. Utilisateurs dans public.utilisateur:');
    const publicUsers = await client.query(`
      SELECT id, email, nom, prenom, role, actif, tenant_id
      FROM public.utilisateur
      WHERE tenant_id = $1 AND role IN ('admin', 'president')
      LIMIT 5
    `, [tenantId]);

    if (publicUsers.rows.length > 0) {
      console.log(`✅ ${publicUsers.rows.length} admin(s) trouvé(s) dans public:`);
      publicUsers.rows.forEach(u => {
        console.log(`   - ${u.email} (${u.role}) ${u.actif ? '✅' : '❌'}`);
        console.log(`     ID: ${u.id}`);
      });
      
      console.log('\n✅ SOLUTION: Utilisez un de ces comptes pour vous connecter');
      console.log('   Si vous avez oublié le mot de passe, contactez l\'administrateur système');
    } else {
      console.log('❌ Aucun admin trouvé dans public.utilisateur');
      console.log('\n⚠️ PROBLÈME: Aucun utilisateur admin n\'existe pour ce tenant');
      console.log('   Vous devez créer un admin via l\'interface super-admin');
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdminISPM().catch(console.error);

// Made with Bob
