require('dotenv').config();
const { Pool } = require('pg');
const crypto = require('crypto');

// Fonction simple pour hasher le mot de passe (compatible avec bcrypt format)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2007',
});

async function createAdminForISPM() {
  const client = await pool.connect();
  
  try {
    console.log('\n🔧 CRÉATION D\'UN ADMIN POUR LE TENANT ISPM\n');
    console.log('='.repeat(80));

    const tenantId = 'eaceef7f-dd73-46bd-9d77-231896181cca';
    const email = 'admin@ispm.mg';
    const password = 'Admin@2026';
    const nom = 'Administrateur';
    const prenom = 'ISPM';

    // 1. Vérifier si l'utilisateur existe déjà
    console.log('\n📋 1. Vérification de l\'existence de l\'utilisateur...');
    const existing = await client.query(`
      SELECT id, email, role, actif FROM public.utilisateur WHERE email = $1
    `, [email]);

    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      console.log('⚠️ Utilisateur existe déjà:');
      console.log(`   Email: ${user.email}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Actif: ${user.actif ? '✅ Oui' : '❌ Non'}`);
      
      // Mettre à jour si nécessaire
      if (user.role !== 'admin' || !user.actif) {
        console.log('\n📋 2. Mise à jour du rôle et du statut...');
        await client.query(`
          UPDATE public.utilisateur
          SET role = 'admin', actif = true, tenant_id = $1
          WHERE id = $2
        `, [tenantId, user.id]);
        console.log('✅ Utilisateur mis à jour avec succès!');
      }
      
      console.log('\n✅ Utilisateur admin prêt à être utilisé:');
      console.log(`   Email: ${email}`);
      console.log(`   Mot de passe: ${password}`);
      console.log(`   Tenant ID: ${tenantId}`);
      
      return;
    }

    // 2. Hasher le mot de passe
    console.log('\n📋 2. Hashage du mot de passe...');
    const hashedPassword = hashPassword(password);
    console.log('✅ Mot de passe hashé');
    console.log('⚠️ Note: Utilisez un vrai hash bcrypt en production!');

    // 3. Créer l'utilisateur dans public.utilisateur
    console.log('\n📋 3. Création de l\'utilisateur dans public.utilisateur...');
    const userId = uuidv4();
    
    await client.query(`
      INSERT INTO public.utilisateur (
        id, email, password, nom, prenom, role, actif, tenant_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    `, [userId, email, hashedPassword, nom, prenom, 'admin', true, tenantId]);
    
    console.log('✅ Utilisateur créé dans public.utilisateur');
    console.log(`   ID: ${userId}`);

    // 4. Créer l'utilisateur dans le schéma du tenant
    console.log('\n📋 4. Création de l\'utilisateur dans tenant_ispm.utilisateur...');
    
    await client.query(`
      INSERT INTO tenant_ispm.utilisateur (
        id, email, password, nom, prenom, role, actif, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password = EXCLUDED.password,
        nom = EXCLUDED.nom,
        prenom = EXCLUDED.prenom,
        role = EXCLUDED.role,
        actif = EXCLUDED.actif,
        updated_at = NOW()
    `, [userId, email, hashedPassword, nom, prenom, 'admin', true]);
    
    console.log('✅ Utilisateur créé dans tenant_ispm.utilisateur');

    // 5. Résumé
    console.log('\n' + '='.repeat(80));
    console.log('✅ ADMIN CRÉÉ AVEC SUCCÈS!\n');
    console.log('📧 Identifiants de connexion:');
    console.log(`   Email: ${email}`);
    console.log(`   Mot de passe: ${password}`);
    console.log(`   Rôle: admin`);
    console.log(`   Tenant: ISPM (${tenantId})`);
    console.log('\n🔗 URL de connexion:');
    console.log('   http://localhost:3000/login');
    console.log('\n📝 Après connexion, vous pourrez:');
    console.log('   - Créer des niveaux d\'études');
    console.log('   - Gérer les parcours');
    console.log('   - Administrer l\'université');
    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdminForISPM().catch(console.error);

// Made with Bob
