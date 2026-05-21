require('dotenv').config();
const { Client } = require('pg');

async function checkAllRoles() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'Imtech_SaaS',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2007',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à la base de données\n');

    // Vérifier les rôles dans tous les schémas tenant
    const tenants = await client.query(`
      SELECT id, nom, schema_name FROM public.tenant WHERE actif = true
    `);

    for (const tenant of tenants.rows) {
      console.log(`\n📋 Tenant: ${tenant.nom} (${tenant.schema_name})`);
      console.log('─'.repeat(60));
      
      try {
        const roles = await client.query(`
          SELECT DISTINCT role, COUNT(*) as count
          FROM ${tenant.schema_name}.utilisateur
          GROUP BY role
          ORDER BY role
        `);
        
        if (roles.rows.length === 0) {
          console.log('   Aucun utilisateur trouvé');
        } else {
          roles.rows.forEach(r => {
            console.log(`   ${r.role}: ${r.count} utilisateur(s)`);
          });
        }
      } catch (err) {
        console.log(`   ❌ Erreur: ${err.message}`);
      }
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

checkAllRoles();

// Made with Bob
