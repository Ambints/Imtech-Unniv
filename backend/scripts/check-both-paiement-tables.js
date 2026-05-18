const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007',
});

async function checkBothTables() {
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données\n');

    const tenantSchemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);

    for (const schema of tenantSchemas.rows) {
      const schemaName = schema.schema_name;
      console.log(`\n${'='.repeat(70)}`);
      console.log(`🏢 SCHÉMA: ${schemaName}`);
      console.log('='.repeat(70));

      // Table paiement_inscription
      console.log('\n📋 TABLE: paiement_inscription');
      console.log('-'.repeat(70));
      
      const piExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 AND table_name = 'paiement_inscription'
        )
      `, [schemaName]);

      if (piExists.rows[0].exists) {
        const piCount = await client.query(`
          SELECT COUNT(*) as total,
                 COUNT(CASE WHEN statut = 'en_attente' THEN 1 END) as en_attente,
                 COUNT(CASE WHEN statut = 'valide' THEN 1 END) as valide,
                 COUNT(CASE WHEN statut = 'rejete' THEN 1 END) as rejete,
                 COALESCE(SUM(montant), 0) as total_montant
          FROM ${schemaName}.paiement_inscription
        `);
        
        const stats = piCount.rows[0];
        console.log(`  Total: ${stats.total}`);
        console.log(`  En attente: ${stats.en_attente}`);
        console.log(`  Validés: ${stats.valide}`);
        console.log(`  Rejetés: ${stats.rejete}`);
        console.log(`  Montant total: ${stats.total_montant} Ar`);

        if (parseInt(stats.total) > 0) {
          const recent = await client.query(`
            SELECT id, etudiant_id, montant, mode_paiement, statut, 
                   reference_paiement, date_soumission
            FROM ${schemaName}.paiement_inscription
            ORDER BY date_soumission DESC
            LIMIT 3
          `);
          
          console.log('\n  📝 Derniers paiements:');
          recent.rows.forEach((p, i) => {
            console.log(`    ${i + 1}. ${p.montant} Ar - ${p.mode_paiement} - ${p.statut}`);
            console.log(`       Ref: ${p.reference_paiement}`);
            console.log(`       Date: ${p.date_soumission}`);
          });
        }
      } else {
        console.log('  ❌ Table n\'existe pas');
      }

      // Table paiement
      console.log('\n\n💰 TABLE: paiement');
      console.log('-'.repeat(70));
      
      const pExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 AND table_name = 'paiement'
        )
      `, [schemaName]);

      if (pExists.rows[0].exists) {
        const pCount = await client.query(`
          SELECT COUNT(*) as total,
                 COUNT(CASE WHEN statut = 'valide' THEN 1 END) as valide,
                 COALESCE(SUM(montant), 0) as total_montant,
                 COUNT(CASE WHEN DATE(date_paiement) = CURRENT_DATE THEN 1 END) as aujourd_hui
          FROM ${schemaName}.paiement
        `);
        
        const stats = pCount.rows[0];
        console.log(`  Total: ${stats.total}`);
        console.log(`  Validés: ${stats.valide}`);
        console.log(`  Aujourd'hui: ${stats.aujourd_hui}`);
        console.log(`  Montant total: ${stats.total_montant} Ar`);

        if (parseInt(stats.total) > 0) {
          const recent = await client.query(`
            SELECT id, inscription_id, montant, mode_paiement, statut, 
                   reference, date_paiement
            FROM ${schemaName}.paiement
            ORDER BY date_paiement DESC
            LIMIT 3
          `);
          
          console.log('\n  📝 Derniers paiements:');
          recent.rows.forEach((p, i) => {
            console.log(`    ${i + 1}. ${p.montant} Ar - ${p.mode_paiement} - ${p.statut}`);
            console.log(`       Ref: ${p.reference}`);
            console.log(`       Date: ${p.date_paiement}`);
          });
        }
      } else {
        console.log('  ❌ Table n\'existe pas');
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Vérification terminée');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

checkBothTables();

// Made with Bob
