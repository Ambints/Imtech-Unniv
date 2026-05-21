/**
 * Script de Migration: Ajouter la table utilisateur aux schémas tenants
 * 
 * Ce script ajoute la table utilisateur manquante dans tous les schémas tenants
 * pour résoudre l'erreur 500 lors de la création d'annonces.
 * 
 * Usage: node scripts/add-utilisateur-to-tenants.js
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'imtech_university',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function addUtilisateurTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Récupération des tenants actifs...\n');
    
    // Récupérer tous les tenants actifs
    const tenantsResult = await client.query(
      'SELECT id, nom, schema_name FROM public.tenant WHERE actif = true ORDER BY nom'
    );
    
    const tenants = tenantsResult.rows;
    console.log(`📊 ${tenants.length} tenant(s) trouvé(s)\n`);
    
    if (tenants.length === 0) {
      console.log('⚠️  Aucun tenant actif trouvé. Rien à faire.');
      return;
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const tenant of tenants) {
      try {
        console.log(`\n📝 Traitement du tenant: ${tenant.nom} (${tenant.schema_name})`);
        
        // Définir le search_path pour ce tenant
        await client.query(`SET search_path TO "${tenant.schema_name}", public`);
        
        // Vérifier si la table utilisateur existe déjà
        const checkTable = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = '${tenant.schema_name}'
            AND table_name = 'utilisateur'
          );
        `);
        
        if (checkTable.rows[0].exists) {
          console.log(`   ℹ️  Table utilisateur existe déjà - ignoré`);
          successCount++;
          continue;
        }
        
        // Créer la table utilisateur
        await client.query(`
          CREATE TABLE utilisateur (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            nom VARCHAR(100) NOT NULL,
            prenom VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            telephone VARCHAR(20),
            role VARCHAR(50) NOT NULL,
            mot_de_passe VARCHAR(255),
            actif BOOLEAN DEFAULT true,
            photo_url VARCHAR(500),
            date_naissance DATE,
            adresse TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `);
        console.log(`   ✅ Table utilisateur créée`);
        
        // Créer les index pour les performances
        await client.query(`
          CREATE INDEX idx_utilisateur_email ON utilisateur(email);
          CREATE INDEX idx_utilisateur_role ON utilisateur(role);
          CREATE INDEX idx_utilisateur_actif ON utilisateur(actif);
        `);
        console.log(`   ✅ Index créés`);
        
        // Vérifier si la table annonce existe et ajouter la contrainte FK si nécessaire
        const checkAnnonce = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = '${tenant.schema_name}'
            AND table_name = 'annonce'
          );
        `);
        
        if (checkAnnonce.rows[0].exists) {
          // Vérifier si la contrainte FK existe déjà
          const checkConstraint = await client.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_schema = '${tenant.schema_name}'
            AND table_name = 'annonce'
            AND constraint_name = 'fk_annonce_auteur';
          `);
          
          if (checkConstraint.rows.length === 0) {
            try {
              await client.query(`
                ALTER TABLE annonce 
                ADD CONSTRAINT fk_annonce_auteur 
                FOREIGN KEY (auteur_id) REFERENCES utilisateur(id) ON DELETE SET NULL;
              `);
              console.log(`   ✅ Contrainte FK ajoutée sur annonce.auteur_id`);
            } catch (fkError) {
              console.log(`   ⚠️  Impossible d'ajouter la contrainte FK (données existantes?)`);
            }
          }
        }
        
        // Créer un utilisateur système par défaut pour ce tenant
        await client.query(`
          INSERT INTO utilisateur (nom, prenom, email, role, actif)
          VALUES ('Système', 'Admin', 'admin@${tenant.schema_name}.local', 'admin', true)
          ON CONFLICT (email) DO NOTHING;
        `);
        console.log(`   ✅ Utilisateur système créé`);
        
        successCount++;
        console.log(`   ✅ Schéma ${tenant.schema_name} mis à jour avec succès`);
        
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Erreur pour ${tenant.schema_name}:`, error.message);
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ DE LA MIGRATION');
    console.log('='.repeat(60));
    console.log(`✅ Succès: ${successCount}/${tenants.length}`);
    console.log(`❌ Erreurs: ${errorCount}/${tenants.length}`);
    console.log('='.repeat(60) + '\n');
    
    if (successCount === tenants.length) {
      console.log('🎉 Migration terminée avec succès!\n');
    } else if (errorCount > 0) {
      console.log('⚠️  Migration terminée avec des erreurs. Vérifiez les logs ci-dessus.\n');
    }
    
  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécution du script
console.log('🚀 Démarrage de la migration...\n');
console.log('Configuration:');
console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`   Port: ${process.env.DB_PORT || '5432'}`);
console.log(`   Database: ${process.env.DB_NAME || 'imtech_university'}`);
console.log(`   User: ${process.env.DB_USER || 'postgres'}\n`);

addUtilisateurTable()
  .then(() => {
    console.log('✅ Script terminé.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

// Made with Bob
