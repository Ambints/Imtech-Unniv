const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '2007',
  database: 'Imtech_SaaS'
});

(async () => {
  try {
    console.log('\n🚀 MIGRATION: Ajout enseignant_id à unite_enseignement\n');
    console.log('📋 RÈGLE MÉTIER: Une UE = Un seul professeur responsable\n');

    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'add-enseignant-to-ue.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Récupérer les schémas tenants
    const schemas = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);

    console.log(`✅ ${schemas.rows.length} schéma(s) tenant trouvé(s)\n`);

    // Appliquer la migration à chaque schéma
    for (const schema of schemas.rows) {
      const schemaName = schema.schema_name;
      console.log(`📦 Traitement: ${schemaName}`);

      try {
        // Définir le search_path
        await pool.query(`SET search_path TO ${schemaName}, public`);

        // Vérifier si la colonne existe déjà
        const columnExists = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = '${schemaName}' 
            AND table_name = 'unite_enseignement'
            AND column_name = 'enseignant_id'
          )
        `);

        if (columnExists.rows[0].exists) {
          console.log(`  ⚠️  Colonne enseignant_id existe déjà`);
        } else {
          // Appliquer le SQL
          await pool.query(sqlContent);
          console.log(`  ✅ Colonne enseignant_id ajoutée`);
        }

        // Compter les UE
        const ueCount = await pool.query(`
          SELECT COUNT(*) as count FROM unite_enseignement
        `);
        console.log(`  📊 ${ueCount.rows[0].count} UE(s) dans ce schéma`);

        // Compter les enseignants
        const ensCount = await pool.query(`
          SELECT COUNT(*) as count FROM enseignant
        `);
        console.log(`  👨‍🏫 ${ensCount.rows[0].count} enseignant(s) disponible(s)`);

      } catch (error) {
        console.error(`  ❌ Erreur: ${error.message}`);
      }

      console.log('');
    }

    await pool.end();
    console.log('✅ Migration terminée avec succès!\n');
    console.log('📝 PROCHAINES ÉTAPES:');
    console.log('   1. Assigner un enseignant_id à chaque UE via l\'interface Admin');
    console.log('   2. Ou utiliser un script pour assigner automatiquement\n');

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

// Made with Bob
