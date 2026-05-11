/**
 * Script pour ajouter les tables de surveillance aux tenants existants
 * Exécute le script add-surveillance-tables.sql sur chaque tenant
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyMigration() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'imtech_saas',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à la base de données');

    // 1. Récupérer tous les tenants
    const tenantsResult = await client.query(`
      SELECT id, nom, schema_name 
      FROM public.tenant 
      WHERE actif = TRUE
      ORDER BY nom
    `);

    const tenants = tenantsResult.rows;
    console.log(`\n📊 ${tenants.length} tenant(s) trouvé(s)\n`);

    if (tenants.length === 0) {
      console.log('⚠️  Aucun tenant actif trouvé');
      return;
    }

    // 2. Lire le script SQL de surveillance
    const sqlPath = path.join(__dirname, 'add-surveillance-tables.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf-8');
    console.log(`📄 Script SQL chargé: ${sqlPath}\n`);

    // 3. Appliquer le script à chaque tenant
    for (const tenant of tenants) {
      console.log(`\n🔧 Traitement du tenant: ${tenant.nom} (${tenant.schema_name})`);
      
      try {
        // Définir le search_path pour ce tenant
        await client.query(`SET search_path TO "${tenant.schema_name}"`);
        
        // Vérifier si les tables existent déjà
        const checkResult = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_name IN ('presence_surveillance', 'alerte_discipline', 'configuration_examen')
        `, [tenant.schema_name]);

        if (checkResult.rows.length > 0) {
          console.log(`   ⚠️  Tables de surveillance déjà présentes (${checkResult.rows.length}/3)`);
          console.log(`   Tables trouvées: ${checkResult.rows.map(r => r.table_name).join(', ')}`);
          continue;
        }

        // Exécuter le script SQL
        await client.query(sqlScript);
        
        // Vérifier que les tables ont été créées
        const verifyResult = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_name IN (
            'pointage_qr', 'presence_surveillance', 'alerte_discipline', 
            'configuration_examen', 'suivi_moral', 'autorisation_sortie',
            'rapport_conduite', 'conseil_discipline'
          )
          ORDER BY table_name
        `, [tenant.schema_name]);

        console.log(`   ✅ ${verifyResult.rows.length} tables créées avec succès`);
        console.log(`   Tables: ${verifyResult.rows.map(r => r.table_name).join(', ')}`);

      } catch (error) {
        console.error(`   ❌ Erreur pour ${tenant.nom}:`, error.message);
        // Continuer avec les autres tenants même en cas d'erreur
      }
    }

    // Réinitialiser le search_path
    await client.query(`SET search_path TO public`);

    console.log('\n✅ Migration terminée pour tous les tenants');

  } catch (error) {
    console.error('❌ Erreur globale:', error);
    throw error;
  } finally {
    await client.end();
    console.log('\n🔌 Connexion fermée');
  }
}

// Exécution
console.log('🚀 Démarrage de la migration des tables de surveillance...\n');
applyMigration()
  .then(() => {
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Échec du script:', error);
    process.exit(1);
  });

// Made with Bob
