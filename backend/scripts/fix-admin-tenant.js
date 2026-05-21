require('dotenv').config();
const { Client } = require('pg');

async function fixAdminTenant() {
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

    // Lister tous les tenants
    console.log('📋 Liste des tenants disponibles:\n');
    const tenants = await client.query(`
      SELECT id, nom, schema_name, actif, created_at
      FROM public.tenant
      ORDER BY created_at DESC
    `);

    if (tenants.rows.length === 0) {
      console.log('❌ Aucun tenant trouvé dans la base de données\n');
      return;
    }

    tenants.rows.forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.nom}`);
      console.log(`   ID: ${tenant.id}`);
      console.log(`   Schema: ${tenant.schema_name}`);
      console.log(`   Actif: ${tenant.actif ? 'Oui' : 'Non'}`);
      console.log(`   Créé le: ${tenant.created_at}`);
      console.log('');
    });

    // Lister les admins sans tenant
    console.log('\n👤 Utilisateurs admin sans tenant:\n');
    const adminsWithoutTenant = await client.query(`
      SELECT id, email, nom, prenom, role
      FROM public.utilisateur
      WHERE role IN ('admin', 'president') AND tenant_id IS NULL
    `);

    if (adminsWithoutTenant.rows.length === 0) {
      console.log('✅ Tous les admins ont un tenant assigné\n');
      return;
    }

    adminsWithoutTenant.rows.forEach(admin => {
      console.log(`📧 ${admin.email} (${admin.prenom} ${admin.nom}) - Rôle: ${admin.role}`);
    });

    // Si un seul tenant, assigner automatiquement
    if (tenants.rows.length === 1 && adminsWithoutTenant.rows.length > 0) {
      const tenant = tenants.rows[0];
      console.log(`\n🔧 Un seul tenant trouvé. Assignment automatique à "${tenant.nom}"...\n`);
      
      for (const admin of adminsWithoutTenant.rows) {
        await client.query(`
          UPDATE public.utilisateur
          SET tenant_id = $1
          WHERE id = $2
        `, [tenant.id, admin.id]);
        
        console.log(`✅ ${admin.email} assigné au tenant "${tenant.nom}"`);
      }
      
      console.log('\n✅ Tous les admins ont été assignés au tenant !');
      console.log('\n🔄 Veuillez vous reconnecter pour que les changements prennent effet.');
    } else {
      console.log('\n⚠️  Plusieurs tenants trouvés. Veuillez exécuter manuellement:');
      console.log('\nPour assigner un admin à un tenant:');
      console.log('UPDATE public.utilisateur SET tenant_id = \'<TENANT_ID>\' WHERE email = \'<ADMIN_EMAIL>\';');
      console.log('\nRemplacez <TENANT_ID> par l\'ID du tenant et <ADMIN_EMAIL> par l\'email de l\'admin.');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

fixAdminTenant();

// Made with Bob
