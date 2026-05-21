require('dotenv').config();
const { Client } = require('pg');

const publicClient = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'imtech_university',
});

console.log('🔧 Configuration de la base de données:');
console.log(`  Host: ${process.env.DB_HOST}`);
console.log(`  Port: ${process.env.DB_PORT}`);
console.log(`  User: ${process.env.DB_USER}`);
console.log(`  Database: ${process.env.DB_NAME}`);
console.log('');

async function checkAndFixUserTenantIds() {
  try {
    await publicClient.connect();
    console.log('✅ Connecté à la base de données');

    // 1. Vérifier les utilisateurs sans tenantId (sauf super_admin)
    console.log('\n📊 Vérification des utilisateurs sans tenantId...');
    const usersWithoutTenant = await publicClient.query(`
      SELECT id, email, nom, prenom, role, "tenantId"
      FROM public.utilisateur
      WHERE "tenantId" IS NULL AND role != 'super_admin'
      ORDER BY email
    `);

    if (usersWithoutTenant.rows.length === 0) {
      console.log('✅ Tous les utilisateurs (sauf super_admin) ont un tenantId');
    } else {
      console.log(`⚠️ ${usersWithoutTenant.rows.length} utilisateur(s) sans tenantId trouvé(s):`);
      usersWithoutTenant.rows.forEach(user => {
        console.log(`  - ${user.email} (${user.role}) - ${user.prenom} ${user.nom}`);
      });

      // 2. Récupérer le premier tenant actif (tenant_ispm)
      const tenants = await publicClient.query(`
        SELECT id, nom, slug
        FROM public.tenants
        WHERE actif = true
        ORDER BY "createdAt"
        LIMIT 1
      `);

      if (tenants.rows.length === 0) {
        console.log('❌ Aucun tenant actif trouvé dans la base de données');
        return;
      }

      const defaultTenant = tenants.rows[0];
      console.log(`\n🏢 Tenant par défaut: ${defaultTenant.nom} (${defaultTenant.slug})`);

      // 3. Demander confirmation pour assigner le tenant
      console.log(`\n🔧 Assignation du tenant "${defaultTenant.nom}" aux utilisateurs sans tenantId...`);

      for (const user of usersWithoutTenant.rows) {
        await publicClient.query(`
          UPDATE public.utilisateur
          SET "tenantId" = $1
          WHERE id = $2
        `, [defaultTenant.id, user.id]);
        console.log(`  ✅ ${user.email} -> tenant assigné`);
      }

      console.log(`\n✅ ${usersWithoutTenant.rows.length} utilisateur(s) mis à jour avec succès`);
    }

    // 4. Afficher un résumé
    console.log('\n📊 Résumé des utilisateurs par tenant:');
    const summary = await publicClient.query(`
      SELECT 
        COALESCE(t.nom, 'Sans tenant') as tenant_nom,
        u.role,
        COUNT(*) as count
      FROM public.utilisateur u
      LEFT JOIN public.tenants t ON u."tenantId" = t.id
      GROUP BY t.nom, u.role
      ORDER BY t.nom, u.role
    `);

    summary.rows.forEach(row => {
      console.log(`  ${row.tenant_nom} - ${row.role}: ${row.count}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  } finally {
    await publicClient.end();
    console.log('\n✅ Connexion fermée');
  }
}

checkAndFixUserTenantIds()
  .then(() => {
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });

// Made with Bob
