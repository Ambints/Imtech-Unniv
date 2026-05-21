const { Client } = require('pg');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
};

async function fixEvaluationTable() {
  const client = new Client(config);

  try {
    console.log('🔧 Correction des types de colonnes evaluation_personnel\n');
    await client.connect();
    console.log('✓ Connexion établie\n');

    // Récupérer les tenants
    const tenantsResult = await client.query(`
      SELECT id, nom, schema_name FROM public.tenant WHERE actif = true ORDER BY nom
    `);

    let successCount = 0;
    let errorCount = 0;

    for (const tenant of tenantsResult.rows) {
      console.log('============================================================');
      console.log(`🏢 Tenant: ${tenant.nom}`);
      console.log(`📂 Schéma: ${tenant.schema_name}`);
      console.log('============================================================\n');

      try {
        // Définir le search_path
        await client.query(`SET search_path TO "${tenant.schema_name}", public`);

        // Supprimer la table si elle existe
        console.log('1. Suppression de l\'ancienne table...');
        await client.query(`DROP TABLE IF EXISTS evaluation_personnel CASCADE`);
        console.log('✅ Table supprimée\n');

        // Recréer la table avec les bons types
        console.log('2. Création de la nouvelle table...');
        await client.query(`
          CREATE TABLE evaluation_personnel (
            id SERIAL PRIMARY KEY,
            utilisateur_id UUID NOT NULL,
            evaluateur_id UUID NOT NULL,
            date_evaluation DATE NOT NULL,
            periode VARCHAR(50) NOT NULL,
            annee_evaluation INTEGER,
            
            -- Notes sur 5
            note_globale DECIMAL(3,2) CHECK (note_globale >= 0 AND note_globale <= 5),
            competences_techniques DECIMAL(3,2) CHECK (competences_techniques >= 0 AND competences_techniques <= 5),
            competences_relationnelles DECIMAL(3,2) CHECK (competences_relationnelles >= 0 AND competences_relationnelles <= 5),
            assiduite DECIMAL(3,2) CHECK (assiduite >= 0 AND assiduite <= 5),
            initiative DECIMAL(3,2) CHECK (initiative >= 0 AND initiative <= 5),
            
            -- Commentaires
            commentaires TEXT,
            objectifs_atteints TEXT,
            axes_amelioration TEXT,
            auto_evaluation TEXT,
            date_auto_evaluation TIMESTAMP,
            
            -- Statut
            statut VARCHAR(50) DEFAULT 'planifiee' CHECK (statut IN ('planifiee', 'en_cours', 'auto_evalue', 'terminee')),
            
            -- Audit
            cree_par INTEGER,
            cree_le TIMESTAMP DEFAULT NOW(),
            modifie_le TIMESTAMP DEFAULT NOW()
          )
        `);
        console.log('✅ Table créée\n');

        // Créer les index
        console.log('3. Création des index...');
        await client.query(`CREATE INDEX idx_eval_utilisateur ON evaluation_personnel(utilisateur_id)`);
        await client.query(`CREATE INDEX idx_eval_evaluateur ON evaluation_personnel(evaluateur_id)`);
        await client.query(`CREATE INDEX idx_eval_statut ON evaluation_personnel(statut)`);
        await client.query(`CREATE INDEX idx_eval_annee ON evaluation_personnel(annee_evaluation)`);
        await client.query(`CREATE INDEX idx_eval_date ON evaluation_personnel(date_evaluation)`);
        console.log('✅ Index créés\n');

        // Ajouter un commentaire
        await client.query(`
          COMMENT ON TABLE evaluation_personnel IS 
          'Évaluations annuelles du personnel - Gestion des performances et compétences'
        `);

        console.log('✅ SUCCÈS pour ' + tenant.nom + '\n');
        successCount++;

      } catch (error) {
        console.log(`❌ ERREUR pour ${tenant.nom}: ${error.message}\n`);
        errorCount++;
      }
    }

    console.log('============================================================');
    console.log('📊 RÉSUMÉ');
    console.log('============================================================');
    console.log(`✅ Succès: ${successCount}/${tenantsResult.rows.length}`);
    console.log(`❌ Erreurs: ${errorCount}/${tenantsResult.rows.length}`);
    console.log('============================================================\n');

    if (successCount === tenantsResult.rows.length) {
      console.log('🎉 Toutes les tables ont été corrigées avec succès!\n');
      console.log('📋 Modifications:');
      console.log('   - utilisateur_id: INTEGER → UUID');
      console.log('   - evaluateur_id: INTEGER → UUID\n');
      console.log('🚀 La page EvaluationsPage devrait maintenant fonctionner!\n');
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('✓ Connexion fermée');
  }
}

fixEvaluationTable();

// Made with Bob
