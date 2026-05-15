require('dotenv').config();
const { Client } = require('pg');

async function checkAdminRole() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'Imtech_SaaS',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2007',
  });

  console.log('🔌 Connexion à:', {
    host: client.host,
    port: client.port,
    database: client.database,
    user: client.user
  });

  try {
    await client.connect();
    console.log('✅ Connecté à la base de données\n');

    // Lister tous les utilisateurs avec leur rôle
    console.log('📋 Liste des utilisateurs et leurs rôles:\n');
    const users = await client.query(`
      SELECT 
        u.id,
        u.email,
        u.nom,
        u.prenom,
        u.role,
        u.tenant_id,
        t.nom as tenant_nom
      FROM public.utilisateur u
      LEFT JOIN public.tenant t ON u.tenant_id = t.id
      WHERE u.role IN ('admin', 'president')
      ORDER BY u.email
    `);

    if (users.rows.length === 0) {
      console.log('❌ Aucun utilisateur admin ou président trouvé\n');
    } else {
      users.rows.forEach(user => {
        console.log(`👤 ${user.email}`);
        console.log(`   Nom: ${user.prenom} ${user.nom}`);
        console.log(`   Rôle: ${user.role}`);
        console.log(`   Tenant: ${user.tenant_nom || 'N/A'} (${user.tenant_id || 'N/A'})`);
        console.log('');
      });
    }

    // Vérifier la structure de la table
    console.log('\n📊 Structure de la colonne role:\n');
    const roleColumn = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'utilisateur'
        AND column_name = 'role'
    `);
    
    if (roleColumn.rows.length > 0) {
      console.log(`Type: ${roleColumn.rows[0].data_type}`);
      console.log(`Longueur max: ${roleColumn.rows[0].character_maximum_length || 'N/A'}`);
    }

    // Vérifier les valeurs distinctes de role
    console.log('\n🔍 Valeurs distinctes de role dans la table:\n');
    const distinctRoles = await client.query(`
      SELECT DISTINCT role, COUNT(*) as count
      FROM public.utilisateur
      GROUP BY role
      ORDER BY role
    `);
    
    distinctRoles.rows.forEach(row => {
      console.log(`   ${row.role}: ${row.count} utilisateur(s)`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

checkAdminRole();

// Made with Bob
