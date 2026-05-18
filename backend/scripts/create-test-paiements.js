const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007',
});

async function createTestPaiements() {
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données\n');

    // Trouver le schéma ISPM
    const schemaName = 'tenant_ispm';
    
    console.log(`🔍 Création de paiements de test dans: ${schemaName}\n`);

    // Trouver un utilisateur caissier ou admin
    const caissierResult = await client.query(`
      SELECT id, nom, prenom, role
      FROM ${schemaName}.utilisateur
      WHERE role IN ('caissier', 'admin')
      LIMIT 1
    `);

    if (caissierResult.rows.length === 0) {
      console.log('❌ Aucun caissier/admin trouvé. Création impossible.');
      return;
    }

    const caissier = caissierResult.rows[0];
    console.log(`👤 Caissier trouvé: ${caissier.nom} ${caissier.prenom} (${caissier.role})`);
    console.log(`   ID: ${caissier.id}\n`);

    // Vérifier s'il y a des inscriptions
    const inscriptions = await client.query(`
      SELECT i.id, e.nom, e.prenom, e.matricule
      FROM ${schemaName}.inscription i
      JOIN ${schemaName}.etudiant e ON e.id = i.etudiant_id
      LIMIT 5
    `);

    if (inscriptions.rows.length === 0) {
      console.log('❌ Aucune inscription trouvée. Impossible de créer des paiements.');
      return;
    }

    console.log(`📋 ${inscriptions.rows.length} inscription(s) trouvée(s)\n`);

    // Créer 3 paiements de test pour aujourd'hui
    const paiementsTest = [
      { montant: 500000, mode: 'mobile_money', motif: 'Frais d\'inscription' },
      { montant: 250000, mode: 'especes', motif: 'Frais de scolarité - 1er versement' },
      { montant: 150000, mode: 'virement', motif: 'Frais de bibliothèque' }
    ];

    console.log('💰 Création des paiements de test...\n');

    // Désactiver temporairement les triggers
    await client.query(`ALTER TABLE ${schemaName}.paiement DISABLE TRIGGER ALL`);

    for (let i = 0; i < Math.min(paiementsTest.length, inscriptions.rows.length); i++) {
      const inscription = inscriptions.rows[i];
      const paiement = paiementsTest[i];
      const reference = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      await client.query(`
        INSERT INTO ${schemaName}.paiement (
          id, inscription_id, montant, mode_paiement, date_paiement,
          reference, numero_recu, statut, observations, caissier_id, created_at
        ) VALUES (
          gen_random_uuid(),
          $1,
          $2,
          $3,
          CURRENT_TIMESTAMP,
          $4,
          $4,
          'valide',
          $5,
          $6,
          CURRENT_TIMESTAMP
        )
      `, [inscription.id, paiement.montant, paiement.mode, reference, paiement.motif, caissier.id]);

      console.log(`✅ Paiement créé:`);
      console.log(`   Étudiant: ${inscription.nom} ${inscription.prenom} (${inscription.matricule})`);
      console.log(`   Montant: ${paiement.montant.toLocaleString()} Ar`);
      console.log(`   Mode: ${paiement.mode}`);
      console.log(`   Référence: ${reference}`);
      console.log(`   Motif: ${paiement.motif}\n`);
    }

    // Réactiver les triggers
    await client.query(`ALTER TABLE ${schemaName}.paiement ENABLE TRIGGER ALL`);
    console.log('✅ Triggers réactivés\n');

    // Vérifier les paiements créés
    const verification = await client.query(`
      SELECT COUNT(*) as total,
             SUM(montant) as total_montant,
             COUNT(CASE WHEN DATE(date_paiement) = CURRENT_DATE THEN 1 END) as aujourd_hui
      FROM ${schemaName}.paiement
    `);

    const stats = verification.rows[0];
    console.log('\n📊 STATISTIQUES APRÈS CRÉATION:');
    console.log('='.repeat(50));
    console.log(`Total paiements: ${stats.total}`);
    console.log(`Paiements aujourd'hui: ${stats.aujourd_hui}`);
    console.log(`Montant total: ${parseInt(stats.total_montant).toLocaleString()} Ar`);
    console.log('='.repeat(50));

    console.log('\n✅ Paiements de test créés avec succès!');
    console.log('🔄 Actualisez le dashboard pour voir les données.');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

createTestPaiements();

// Made with Bob
