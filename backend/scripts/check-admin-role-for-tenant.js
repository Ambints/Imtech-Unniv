const { Client } = require('pg');

async function checkAdminRole() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'Imtech_SaaS',
    user: 'postgres',
    password: '2007',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à la base de données\n');

    // Récupérer le tenant ID depuis les arguments ou utiliser celui de l'erreur
    const tenantId = process.argv[2] || 'eaceef7f-dd73-46bd-9d77-231896181cca';
    
    console.log(`🔍 Vérification pour le tenant: ${tenantId}\n`);

    // 1. Vérifier le tenant
    const tenantResult = await client.query(
      'SELECT id, nom, schema_name, actif FROM public.tenant WHERE id = $1',
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant non trouvé!');
      return;
    }

    const tenant = tenantResult.rows[0];
    console.log('📋 Tenant trouvé:');
    console.log(`   - Nom: ${tenant.nom}`);
    console.log(`   - Schema: ${tenant.schema_name}`);
    console.log(`   - Actif: ${tenant.actif}\n`);

    // 2. Vérifier les utilisateurs admin dans public.utilisateur
    console.log('👥 Utilisateurs admin dans public.utilisateur:');
    const publicAdmins = await client.query(
      `SELECT id, email, role, tenant_id, actif 
       FROM public.utilisateur 
       WHERE tenant_id = $1 AND role = 'admin'`,
      [tenantId]
    );

    if (publicAdmins.rows.length === 0) {
      console.log('   ❌ Aucun admin trouvé dans public.utilisateur\n');
    } else {
      publicAdmins.rows.forEach(admin => {
        console.log(`   - Email: ${admin.email}`);
        console.log(`     ID: ${admin.id}`);
        console.log(`     Role: ${admin.role}`);
        console.log(`     Actif: ${admin.actif}\n`);
      });
    }

    // 3. Vérifier les utilisateurs dans le schéma du tenant
    console.log(`👥 Utilisateurs dans ${tenant.schema_name}.utilisateur:`);
    const schemaAdmins = await client.query(
      `SELECT id, email, role, actif 
       FROM "${tenant.schema_name}".utilisateur 
       WHERE role = 'admin'`
    );

    if (schemaAdmins.rows.length === 0) {
      console.log('   ❌ Aucun admin trouvé dans le schéma du tenant\n');
    } else {
      schemaAdmins.rows.forEach(admin => {
        console.log(`   - Email: ${admin.email}`);
        console.log(`     ID: ${admin.id}`);
        console.log(`     Role: ${admin.role}`);
        console.log(`     Actif: ${admin.actif}\n`);
      });
    }

    // 4. Vérifier tous les rôles disponibles
    console.log('📊 Tous les rôles dans le schéma du tenant:');
    const allRoles = await client.query(
      `SELECT DISTINCT role, COUNT(*) as count 
       FROM "${tenant.schema_name}".utilisateur 
       GROUP BY role 
       ORDER BY role`
    );

    allRoles.rows.forEach(row => {
      console.log(`   - ${row.role}: ${row.count} utilisateur(s)`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkAdminRole();

// Made with Bob
