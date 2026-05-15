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
    console.log('\n🔄 MIGRATION: Renommer "professeur" en "enseignant"\n');

    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'rename-professeur-to-enseignant.sql');
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

        // Compter les utilisateurs avec role='professeur' AVANT
        const beforeCount = await pool.query(`
          SELECT COUNT(*) as count 
          FROM utilisateur 
          WHERE role = 'professeur'
        `);
        
        console.log(`  📊 Utilisateurs avec role='professeur': ${beforeCount.rows[0].count}`);

        if (beforeCount.rows[0].count > 0) {
          // Appliquer la migration
          await pool.query(`
            UPDATE utilisateur 
            SET role = 'enseignant' 
            WHERE role = 'professeur'
          `);

          // Vérifier APRÈS
          const afterCount = await pool.query(`
            SELECT COUNT(*) as count 
            FROM utilisateur 
            WHERE role = 'enseignant'
          `);

          console.log(`  ✅ Migration effectuée: ${beforeCount.rows[0].count} utilisateur(s) mis à jour`);
          console.log(`  📊 Utilisateurs avec role='enseignant': ${afterCount.rows[0].count}`);
        } else {
          console.log(`  ⚠️  Aucun utilisateur avec role='professeur' trouvé`);
        }

      } catch (error) {
        console.error(`  ❌ Erreur: ${error.message}`);
      }

      console.log('');
    }

    await pool.end();
    console.log('✅ Migration base de données terminée!\n');
    
    console.log('📝 PROCHAINES ÉTAPES:');
    console.log('   1. Mettre à jour le code backend (controllers, services, guards)');
    console.log('   2. Mettre à jour le code frontend (routes, composants, labels)');
    console.log('   3. Mettre à jour les enums (roles.enum.ts)');
    console.log('   4. Tester la connexion avec le nouveau rôle "enseignant"\n');

  } catch (error) {
    console.error('❌ Erreur fatale:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

// Made with Bob
