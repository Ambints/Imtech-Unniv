/**
 * Script d'application des tables et colonnes Module Président
 * Applique les modifications à tous les tenants actifs
 */

const { Client } = require('pg');
const path = require('path');

// Charger le .env depuis le dossier backend
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2007',
};

console.log('📝 Configuration de connexion:');
console.log(`   Host: ${config.host}`);
console.log(`   Port: ${config.port}`);
console.log(`   Database: ${config.database}`);
console.log(`   User: ${config.user}`);
console.log(`   Password: ${'*'.repeat(config.password.length)}\n`);

async function applyPresidentTables() {
  const client = new Client(config);

  try {
    await client.connect();
    console.log('✓ Connexion à la base de données établie\n');

    // Récupérer tous les tenants actifs
    const tenantsResult = await client.query(
      'SELECT id, nom, schema_name FROM public.tenant WHERE actif = true ORDER BY nom'
    );

    const tenants = tenantsResult.rows;
    console.log(`📊 ${tenants.length} tenant(s) actif(s) trouvé(s)\n`);

    if (tenants.length === 0) {
      console.log('⚠️  Aucun tenant actif trouvé');
      return;
    }

    // Charger la fonction SQL
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, 'add-president-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Chargement de la fonction SQL...');
    await client.query(sqlContent);
    console.log('✓ Fonction SQL chargée\n');

    // Appliquer les modifications à chaque tenant
    let successCount = 0;
    let errorCount = 0;

    for (const tenant of tenants) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🏢 Tenant: ${tenant.nom}`);
      console.log(`📂 Schéma: ${tenant.schema_name}`);
      console.log(`${'='.repeat(60)}`);

      try {
        // Appeler la fonction pour ce tenant
        await client.query(
          'SELECT add_president_tables_to_tenant($1)',
          [tenant.schema_name]
        );

        successCount++;
        console.log(`\n✅ Modifications appliquées avec succès pour ${tenant.nom}`);
      } catch (error) {
        errorCount++;
        console.error(`\n❌ Erreur pour ${tenant.nom}:`, error.message);
      }
    }

    // Résumé final
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 RÉSUMÉ DE L\'APPLICATION');
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Succès: ${successCount}/${tenants.length}`);
    console.log(`❌ Erreurs: ${errorCount}/${tenants.length}`);
    console.log(`${'='.repeat(60)}\n`);

    if (successCount === tenants.length) {
      console.log('🎉 Toutes les modifications ont été appliquées avec succès!');
      console.log('\n📋 Tables créées:');
      console.log('   - convention (signatures conventions)');
      console.log('   - delegation_signature (délégations)');
      console.log('\n📋 Colonnes ajoutées:');
      console.log('   - contrat_personnel: valide_par, valide_le, commentaire_president, conditions_speciales');
      console.log('   - depense: valide_par_president, valide_le, motif_decision, conditions_speciales');
      console.log('   - diplome: signe_president, date_signature, signature_hash, mention_speciale');
      console.log('   - conseil_discipline: decision_president, motivation, duree_suspension, mesures_accompagnement, statue_le, statue_par');
      console.log('   - parcours: date_ouverture, motif_ouverture, conditions_ouverture, date_fermeture, motif_fermeture, valide_par_president');
      console.log('   - calendrier_academique: valide_par_president, valide_le, commentaire_president');
      console.log('\n🚀 Le module Président est maintenant prêt à être utilisé!');
    } else {
      console.log('⚠️  Certaines modifications ont échoué. Vérifiez les erreurs ci-dessus.');
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✓ Connexion fermée');
  }
}

// Exécution
console.log('🚀 Démarrage de l\'application des tables Module Président...\n');
applyPresidentTables()
  .then(() => {
    console.log('\n✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur lors de l\'exécution:', error);
    process.exit(1);
  });

// Made with Bob
