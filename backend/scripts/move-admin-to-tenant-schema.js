require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function moveAdminToTenantSchema() {
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

    const ispmSchema = 'tenant_ispm';
    const adminEmail = 'admin@univ_demo.local';

    // 1. Récupérer l'admin depuis public.utilisateur
    console.log('🔍 Recherche de l\'admin dans public.utilisateur...\n');
    const publicAdmin = await client.query(`
      SELECT * FROM public.utilisateur WHERE email = $1
    `, [adminEmail]);

    if (publicAdmin.rows.length === 0) {
      console.log('❌ Admin non trouvé dans public.utilisateur');
      console.log('Vérification dans le schéma tenant...\n');
      
      const tenantAdmin = await client.query(`
        SELECT * FROM ${ispmSchema}.utilisateur WHERE email = $1
      `, [adminEmail]);
      
      if (tenantAdmin.rows.length > 0) {
        console.log('✅ Admin déjà présent dans le schéma tenant !');
        console.log('Aucune action nécessaire.');
        return;
      }
      
      console.log('❌ Admin introuvable. Création d\'un nouvel admin...\n');
      
      // Créer un nouvel admin dans le schéma tenant
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(`
        INSERT INTO ${ispmSchema}.utilisateur 
        (email, password_hash, nom, prenom, role, actif, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `, [adminEmail, hashedPassword, 'Système', 'Admin', 'admin', true]);
      
      console.log('✅ Nouvel admin créé dans le schéma tenant !');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Mot de passe: admin123`);
      console.log('\n🔄 Veuillez vous reconnecter avec ces identifiants.');
      return;
    }

    const admin = publicAdmin.rows[0];
    console.log(`✅ Admin trouvé: ${admin.prenom} ${admin.nom}`);
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🎭 Rôle: ${admin.role}`);
    
    // Vérifier si le password_hash existe
    if (!admin.password_hash) {
      console.log('⚠️  Pas de mot de passe dans public.utilisateur\n');
      console.log('Création d\'un nouvel admin avec mot de passe...\n');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      // Vérifier si existe déjà dans tenant
      const existingInTenant = await client.query(`
        SELECT id FROM ${ispmSchema}.utilisateur WHERE email = $1
      `, [adminEmail]);
      
      if (existingInTenant.rows.length > 0) {
        console.log('⚠️  Admin existe déjà dans le schéma tenant. Mise à jour du mot de passe...\n');
        await client.query(`
          UPDATE ${ispmSchema}.utilisateur
          SET password_hash = $1, updated_at = NOW()
          WHERE email = $2
        `, [hashedPassword, adminEmail]);
        console.log('✅ Mot de passe mis à jour !');
      } else {
        await client.query(`
          INSERT INTO ${ispmSchema}.utilisateur
          (email, password_hash, nom, prenom, role, actif, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        `, [adminEmail, hashedPassword, admin.nom, admin.prenom, admin.role, admin.actif]);
        console.log('✅ Admin créé dans le schéma tenant !');
      }
      
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Mot de passe: admin123`);
      
      // Supprimer de public
      await client.query(`DELETE FROM public.utilisateur WHERE email = $1`, [adminEmail]);
      console.log('\n✅ Admin supprimé de public.utilisateur');
      console.log('\n🔄 Veuillez vous reconnecter avec le mot de passe: admin123');
      return;
    }

    console.log('\n');

    // 2. Vérifier si l'admin existe déjà dans le schéma tenant
    const existingInTenant = await client.query(`
      SELECT id FROM ${ispmSchema}.utilisateur WHERE email = $1
    `, [adminEmail]);

    if (existingInTenant.rows.length > 0) {
      console.log('⚠️  Admin existe déjà dans le schéma tenant.');
      console.log('Mise à jour des informations...\n');
      
      await client.query(`
        UPDATE ${ispmSchema}.utilisateur
        SET password_hash = $1, nom = $2, prenom = $3, role = $4, actif = $5, updated_at = NOW()
        WHERE email = $6
      `, [admin.password_hash, admin.nom, admin.prenom, admin.role, admin.actif, adminEmail]);
      
      console.log('✅ Admin mis à jour dans le schéma tenant !');
    } else {
      // 3. Copier l'admin dans le schéma tenant
      console.log(`🔄 Copie de l'admin vers ${ispmSchema}.utilisateur...\n`);
      
      await client.query(`
        INSERT INTO ${ispmSchema}.utilisateur
        (email, password_hash, nom, prenom, telephone, photo_url, role, actif, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        admin.email,
        admin.password_hash,
        admin.nom,
        admin.prenom,
        admin.telephone,
        admin.photo_url,
        admin.role,
        admin.actif,
        admin.created_at,
        admin.updated_at
      ]);
      
      console.log('✅ Admin copié dans le schéma tenant !');
    }

    // 4. Supprimer l'admin de public.utilisateur (optionnel)
    console.log('\n🗑️  Suppression de l\'admin de public.utilisateur...');
    await client.query(`DELETE FROM public.utilisateur WHERE email = $1`, [adminEmail]);
    console.log('✅ Admin supprimé de public.utilisateur');

    console.log('\n✅ Migration terminée avec succès !');
    console.log('\n🔄 Veuillez vous DÉCONNECTER et vous RECONNECTER.');
    console.log('✅ L\'API des niveaux devrait maintenant fonctionner !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

moveAdminToTenantSchema();

// Made with Bob
