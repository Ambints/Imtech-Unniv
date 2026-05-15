require('dotenv').config();
const { Client } = require('pg');

async function assignAdminToISPM() {
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

    const ispmTenantId = 'eaceef7f-dd73-46bd-9d77-231896181cca';
    const adminEmail = 'admin@univ_demo.local';

    console.log(`🔧 Assignment de l'admin "${adminEmail}" au tenant ISPM...\n`);

    const result = await client.query(`
      UPDATE public.utilisateur
      SET tenant_id = $1
      WHERE email = $2
      RETURNING id, email, nom, prenom, role, tenant_id
    `, [ispmTenantId, adminEmail]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✅ Admin assigné avec succès !');
      console.log(`\n👤 Utilisateur: ${user.prenom} ${user.nom}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🎭 Rôle: ${user.role}`);
      console.log(`🏢 Tenant ID: ${user.tenant_id}`);
      console.log('\n🔄 Veuillez vous DÉCONNECTER et vous RECONNECTER pour que les changements prennent effet.');
      console.log('\n✅ Après reconnexion, l\'API des niveaux devrait fonctionner !');
    } else {
      console.log('❌ Aucun utilisateur trouvé avec cet email');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

assignAdminToISPM();

// Made with Bob
