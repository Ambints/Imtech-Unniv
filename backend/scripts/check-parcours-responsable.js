const { Client } = require('pg');
require('dotenv').config();

async function checkParcoursResponsable() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'imtech_university',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL\n');

    // Récupérer le tenant ISPM
    const tenantResult = await client.query(`
      SELECT id, nom, schema_name 
      FROM tenant 
      WHERE slug = 'ispm'
    `);

    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant ISPM non trouvé');
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log(`🏛️  Tenant: ${tenant.nom}`);
    console.log(`   Schema: ${tenant.schema_name}\n`);

    // Récupérer tous les parcours avec leur responsable
    const parcoursResult = await client.query(`
      SELECT 
        p.id,
        p.code,
        p.nom,
        p.niveau,
        p.responsable_id,
        u.nom as resp_nom,
        u.prenom as resp_prenom,
        u.email as resp_email,
        u.role as resp_role
      FROM "${tenant.schema_name}".parcours p
      LEFT JOIN "${tenant.schema_name}".utilisateur u ON p.responsable_id = u.id
      WHERE p.actif = true
      ORDER BY p.nom
    `);

    console.log(`📚 ${parcoursResult.rows.length} parcours trouvé(s):\n`);

    parcoursResult.rows.forEach(parcours => {
      console.log(`📖 ${parcours.nom} (${parcours.code})`);
      console.log(`   ID: ${parcours.id}`);
      console.log(`   Niveau: ${parcours.niveau}`);
      
      if (parcours.responsable_id) {
        console.log(`   ✅ Responsable ID: ${parcours.responsable_id}`);
        console.log(`   👤 ${parcours.resp_prenom} ${parcours.resp_nom} (${parcours.resp_email})`);
        console.log(`   🎭 Rôle: ${parcours.resp_role}`);
      } else {
        console.log(`   ❌ Aucun responsable assigné`);
      }
      console.log('');
    });

    // Lister tous les RPs disponibles
    console.log('\n👥 Responsables Pédagogiques disponibles:\n');
    const rpsResult = await client.query(`
      SELECT id, nom, prenom, email, role
      FROM "${tenant.schema_name}".utilisateur
      WHERE role = 'resp_pedagogique' AND actif = true
      ORDER BY nom, prenom
    `);

    rpsResult.rows.forEach(rp => {
      console.log(`   👤 ${rp.prenom} ${rp.nom} (${rp.email})`);
      console.log(`      ID: ${rp.id}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

checkParcoursResponsable();

// Made with Bob
