const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function fixPermissionsConstraint() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'Imtech_SaaS',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL\n');

    // Récupérer tous les schémas tenant
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);

    console.log(`📊 ${schemas.rows.length} schémas tenant trouvés\n`);

    for (const schema of schemas.rows) {
      const schemaName = schema.schema_name;
      console.log(`\n🔧 Traitement de ${schemaName}:`);

      // ÉTAPE 1: Vérifier la contrainte actuelle
      const constraintCheck = await client.query(`
        SELECT conname, pg_get_constraintdef(oid) as definition
        FROM pg_constraint
        WHERE conrelid = '${schemaName}.permissions_portail'::regclass
        AND contype = 'c'
        AND conname LIKE '%type_portail%'
      `);

      if (constraintCheck.rows.length > 0) {
        const constraint = constraintCheck.rows[0];
        console.log(`   📋 Contrainte actuelle: ${constraint.conname}`);
        console.log(`   📝 Définition: ${constraint.definition}`);

        // ÉTAPE 2: Supprimer l'ancienne contrainte
        console.log(`   🗑️  Suppression de la contrainte...`);
        await client.query(`
          ALTER TABLE ${schemaName}.permissions_portail
          DROP CONSTRAINT IF EXISTS ${constraint.conname}
        `);
        console.log(`   ✅ Contrainte supprimée`);
      }

      // ÉTAPE 3: Migrer les données de "professeur" vers "enseignant"
      const countBefore = await client.query(`
        SELECT COUNT(*) as count
        FROM ${schemaName}.permissions_portail
        WHERE type_portail = 'professeur'
      `);

      const professeurCount = parseInt(countBefore.rows[0].count);
      console.log(`   📊 ${professeurCount} permissions "professeur" trouvées`);

      if (professeurCount > 0) {
        await client.query(`
          UPDATE ${schemaName}.permissions_portail
          SET type_portail = 'enseignant'
          WHERE type_portail = 'professeur'
        `);
        console.log(`   ✅ ${professeurCount} permissions migrées vers "enseignant"`);
      }

      // ÉTAPE 4: Créer la nouvelle contrainte avec "enseignant"
      console.log(`   🔧 Création de la nouvelle contrainte...`);
      await client.query(`
        ALTER TABLE ${schemaName}.permissions_portail
        ADD CONSTRAINT permissions_portail_type_portail_check
        CHECK (type_portail IN ('etudiant', 'parent', 'enseignant'))
      `);
      console.log(`   ✅ Nouvelle contrainte créée avec "enseignant"`);

      // ÉTAPE 5: Vérifier le résultat
      const finalCount = await client.query(`
        SELECT type_portail, COUNT(*) as count
        FROM ${schemaName}.permissions_portail
        GROUP BY type_portail
        ORDER BY type_portail
      `);

      console.log(`   📊 Répartition finale:`);
      finalCount.rows.forEach(row => {
        console.log(`      - ${row.type_portail}: ${row.count} permissions`);
      });
    }

    console.log(`\n\n🎉 Migration terminée avec succès !`);
    console.log(`✅ Contraintes mises à jour dans tous les tenants`);
    console.log(`✅ Toutes les permissions "professeur" migrées vers "enseignant"`);

  } catch (error) {
    console.error('\n❌ Erreur lors de la migration:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixPermissionsConstraint();

// Made with Bob
