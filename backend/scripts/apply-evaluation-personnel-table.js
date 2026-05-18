const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement depuis le fichier .env
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Configuration de la connexion
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
};

async function main() {
  const client = new Client(config);
  let successCount = 0;
  let errorCount = 0;
  const results = [];
  let tenants = [];

  try {
    console.log('📝 Configuration de connexion:');
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Password: ${'*'.repeat(4)}\n`);

    console.log('🚀 Démarrage de l\'application de la table evaluation_personnel...\n');

    // Connexion à la base de données
    await client.connect();
    console.log('✓ Connexion à la base de données établie\n');

    // Récupérer tous les tenants actifs
    const tenantsResult = await client.query(`
      SELECT id, nom, schema_name, actif 
      FROM public.tenant 
      WHERE actif = true 
      ORDER BY nom
    `);

    tenants = tenantsResult.rows;
    console.log(`📊 ${tenants.length} tenant(s) actif(s) trouvé(s)\n`);

    if (tenants.length === 0) {
      console.log('⚠️  Aucun tenant actif trouvé. Arrêt du script.');
      return;
    }

    // Charger la fonction SQL
    const sqlPath = path.join(__dirname, 'add-evaluation-personnel-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Chargement de la fonction SQL...');
    await client.query(sqlContent);
    console.log('✓ Fonction SQL chargée\n');

    // Appliquer la fonction pour chaque tenant
    for (const tenant of tenants) {
      console.log('============================================================');
      console.log(`🏢 Tenant: ${tenant.nom}`);
      console.log(`📂 Schéma: ${tenant.schema_name}`);
      console.log('============================================================\n');

      try {
        const result = await client.query(
          'SELECT add_evaluation_personnel_table($1) as message',
          [tenant.schema_name]
        );

        const message = result.rows[0].message;
        console.log(`${message}\n`);

        if (message.startsWith('SUCCÈS') || message.startsWith('INFO')) {
          successCount++;
          results.push({ tenant: tenant.nom, status: 'success', message });
        } else {
          errorCount++;
          results.push({ tenant: tenant.nom, status: 'error', message });
        }
      } catch (error) {
        errorCount++;
        const errorMsg = `Erreur lors de l'application: ${error.message}`;
        console.error(`❌ ${errorMsg}\n`);
        results.push({ tenant: tenant.nom, status: 'error', message: errorMsg });
      }
    }

    // Afficher le résumé
    console.log('============================================================');
    console.log('📊 RÉSUMÉ DE L\'APPLICATION');
    console.log('============================================================');
    console.log(`✅ Succès: ${successCount}/${tenants.length}`);
    console.log(`❌ Erreurs: ${errorCount}/${tenants.length}`);
    console.log('============================================================\n');

    // Afficher les détails si des erreurs
    if (errorCount > 0) {
      console.log('⚠️  DÉTAILS DES ERREURS:\n');
      results
        .filter(r => r.status === 'error')
        .forEach(r => {
          console.log(`   • ${r.tenant}: ${r.message}`);
        });
      console.log('');
    }

    if (successCount === tenants.length) {
      console.log('🎉 Toutes les modifications ont été appliquées avec succès!\n');
      console.log('📋 Table créée:');
      console.log('   - evaluation_personnel (évaluations annuelles du personnel)\n');
      console.log('📋 Colonnes:');
      console.log('   - id, utilisateur_id, evaluateur_id');
      console.log('   - date_evaluation, periode, annee_evaluation');
      console.log('   - note_globale, competences_techniques, competences_relationnelles');
      console.log('   - assiduite, initiative');
      console.log('   - commentaires, objectifs_atteints, axes_amelioration');
      console.log('   - auto_evaluation, date_auto_evaluation');
      console.log('   - statut (planifiee, en_cours, auto_evalue, terminee)');
      console.log('   - cree_par, cree_le, modifie_le\n');
      console.log('📋 Index créés:');
      console.log('   - idx_eval_utilisateur, idx_eval_evaluateur');
      console.log('   - idx_eval_statut, idx_eval_annee, idx_eval_date\n');
      console.log('🚀 La page EvaluationsPage devrait maintenant fonctionner correctement!\n');
    } else {
      console.log('⚠️  Certaines modifications ont échoué. Vérifiez les erreurs ci-dessus.\n');
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✓ Connexion fermée\n');
  }

  console.log(successCount === tenants.length ? '✅ Script terminé avec succès' : '⚠️  Script terminé avec des erreurs');
}

main();

// Made with Bob
