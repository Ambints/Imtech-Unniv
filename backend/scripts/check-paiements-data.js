const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007',
});

async function checkPaiements() {
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données\n');

    // Vérifier les paiements dans le schéma tenant
    const tenantSchemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);

    console.log(`📊 Schémas tenant trouvés: ${tenantSchemas.rows.length}\n`);

    for (const schema of tenantSchemas.rows) {
      const schemaName = schema.schema_name;
      console.log(`\n🔍 Vérification du schéma: ${schemaName}`);
      console.log('='.repeat(60));

      // Vérifier si la table paiement existe
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_name = 'paiement'
        )
      `, [schemaName]);

      if (!tableExists.rows[0].exists) {
        console.log('❌ Table paiement n\'existe pas dans ce schéma');
        continue;
      }

      // Compter les paiements
      const countResult = await client.query(`
        SELECT COUNT(*) as total FROM ${schemaName}.paiement
      `);
      console.log(`📝 Nombre total de paiements: ${countResult.rows[0].total}`);

      // Paiements du jour
      const todayResult = await client.query(`
        SELECT COUNT(*) as today, 
               COALESCE(SUM(montant), 0) as total_montant
        FROM ${schemaName}.paiement
        WHERE DATE(date_paiement) = CURRENT_DATE
      `);
      console.log(`📅 Paiements aujourd'hui: ${todayResult.rows[0].today}`);
      console.log(`💰 Montant total aujourd'hui: ${todayResult.rows[0].total_montant} Ar`);

      // Derniers paiements
      const recentResult = await client.query(`
        SELECT id, inscription_id, montant, mode_paiement, 
               statut, date_paiement, created_at
        FROM ${schemaName}.paiement
        ORDER BY created_at DESC
        LIMIT 5
      `);

      if (recentResult.rows.length > 0) {
        console.log('\n📋 Derniers paiements:');
        recentResult.rows.forEach((p, i) => {
          console.log(`  ${i + 1}. ID: ${p.id}`);
          console.log(`     Inscription: ${p.inscription_id}`);
          console.log(`     Montant: ${p.montant} Ar`);
          console.log(`     Mode: ${p.mode_paiement}`);
          console.log(`     Statut: ${p.statut}`);
          console.log(`     Date: ${p.date_paiement}`);
          console.log('');
        });
      } else {
        console.log('\n⚠️  Aucun paiement trouvé');
      }

      // Vérifier la structure de la table
      const columnsResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = $1 
        AND table_name = 'paiement'
        ORDER BY ordinal_position
      `, [schemaName]);

      console.log('\n📐 Structure de la table paiement:');
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

checkPaiements();

// Made with Bob
