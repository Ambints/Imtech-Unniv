const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007'
});

async function fixEnseignantTenantId() {
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données\n');

    // Récupérer le tenant ISPM
    const tenantResult = await client.query(`
      SELECT id, nom, slug FROM public.tenant WHERE slug = 'ispm'
    `);

    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant ISPM non trouvé');
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log(`📌 Tenant trouvé: ${tenant.nom} (${tenant.id})\n`);

    // Mettre à jour le tenant_id de l'utilisateur enseignant
    await client.query(`SET search_path TO tenant_ispm`);
    
    const updateResult = await client.query(`
      UPDATE utilisateur 
      SET tenant_id = $1
      WHERE email = 'prof@ispm.mg'
      RETURNING id, email, tenant_id
    `, [tenant.id]);

    if (updateResult.rows.length > 0) {
      console.log('✅ Utilisateur enseignant mis à jour:');
      console.log(JSON.stringify(updateResult.rows[0], null, 2));
    } else {
      console.log('⚠️  Aucun utilisateur trouvé avec email prof@ispm.mg');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

fixEnseignantTenantId();

// Made with Bob
