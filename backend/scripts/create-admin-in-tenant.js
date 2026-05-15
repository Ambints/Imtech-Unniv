require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createAdminInTenant() {
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
    console.log('📋 Tenants disponibles:\n');
    const tenants = await client.query(`
      SELECT id, nom, schema_name
      FROM public.tenant
      WHERE actif = true
      ORDER BY nom
    `);

    if (tenants.rows.length === 0) {
      console.log('❌ Aucun tenant actif trouvé');
      return;
    }

    tenants.rows.forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.nom} (${tenant.schema_name})`);
    });

    // Pour cet exemple, on utilise ISPM
    // Dans un vrai script interactif, vous demanderiez à l'utilisateur de choisir
    const selectedTenant = tenants.rows.find(t => t.schema_name === 'tenant_ispm');
    
    if (!selectedTenant) {
      console.log('\n❌ Tenant ISPM non trouvé');
      return;
    }

    console.log(`\n✅ Tenant sélectionné: ${selectedTenant.nom}\n`);

    // Demander les informations du nouvel admin
    // Pour cet exemple, on utilise des valeurs par défaut
    // Dans un vrai script, vous utiliseriez readline ou inquirer pour demander à l'utilisateur
    
    const newAdmin = {
      email: process.argv[2] || 'admin.ispm@example.com',
      password: process.argv[3] || 'SecurePassword123!',
      nom: process.argv[4] || 'ISPM',
      prenom: process.argv[5] || 'Administrateur',
      role: 'admin'
    };

    console.log('📝 Informations du nouvel admin:');
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Nom: ${newAdmin.prenom} ${newAdmin.nom}`);
    console.log(`   Rôle: ${newAdmin.role}\n`);

    // Vérifier si l'email existe déjà
    const existing = await client.query(`
      SELECT id FROM ${selectedTenant.schema_name}.utilisateur
      WHERE email = $1
    `, [newAdmin.email]);

    if (existing.rows.length > 0) {
      console.log('❌ Un utilisateur avec cet email existe déjà dans ce tenant');
      console.log('   Utilisez un autre email ou supprimez l\'utilisateur existant\n');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(newAdmin.password, 10);

    // Créer l'admin
    const result = await client.query(`
      INSERT INTO ${selectedTenant.schema_name}.utilisateur 
      (id, email, password_hash, nom, prenom, role, actif, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, email, nom, prenom, role
    `, [
      uuidv4(),
      newAdmin.email,
      hashedPassword,
      newAdmin.nom,
      newAdmin.prenom,
      newAdmin.role,
      true
    ]);

    const createdAdmin = result.rows[0];

    console.log('✅ Admin créé avec succès !\n');
    console.log('📋 Détails:');
    console.log(`   ID: ${createdAdmin.id}`);
    console.log(`   Email: ${createdAdmin.email}`);
    console.log(`   Nom: ${createdAdmin.prenom} ${createdAdmin.nom}`);
    console.log(`   Rôle: ${createdAdmin.role}`);
    console.log(`   Tenant: ${selectedTenant.nom}`);
    console.log(`   Schema: ${selectedTenant.schema_name}\n`);
    
    console.log('🔐 Identifiants de connexion:');
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Mot de passe: ${newAdmin.password}\n`);
    
    console.log('✅ Vous pouvez maintenant vous connecter avec ces identifiants !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

// Afficher l'aide si demandé
if (process.argv[2] === '--help' || process.argv[2] === '-h') {
  console.log(`
📖 Utilisation:
  node create-admin-in-tenant.js [email] [password] [nom] [prenom]

📝 Exemples:
  # Créer un admin avec les valeurs par défaut
  node create-admin-in-tenant.js

  # Créer un admin personnalisé
  node create-admin-in-tenant.js admin@ispm.mg MyPassword123 RAKOTO Jean

  # Créer plusieurs admins
  node create-admin-in-tenant.js admin1@ispm.mg Pass123 RABE Marie
  node create-admin-in-tenant.js admin2@ispm.mg Pass456 RANDRIA Paul
  node create-admin-in-tenant.js admin3@ispm.mg Pass789 RASOA Sophie

💡 Note: Le script crée l'admin dans le tenant ISPM par défaut.
   Pour créer dans un autre tenant, modifiez la ligne 48 du script.
  `);
  process.exit(0);
}

createAdminInTenant();

// Made with Bob
