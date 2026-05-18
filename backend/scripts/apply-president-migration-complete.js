/**
 * Script pour appliquer TOUTES les migrations du module président à tous les tenants
 * Inclut: tables, colonnes, statuts diplôme et index de performance
 * Usage: node backend/scripts/apply-president-migration-complete.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la connexion
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2007',
};

async function applyAllMigrations() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connecté à la base de données');

    // Liste des migrations à appliquer dans l'ordre
    const migrations = [
      {
        name: '001_add_president_tables.sql',
        description: 'Création des tables et colonnes de base'
      },
      {
        name: '002_add_diplome_statut_and_indexes.sql',
        description: 'Ajout des statuts diplôme et index de performance'
      }
    ];

    // Récupérer tous les schémas tenant
    const result = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);

    const tenantSchemas = result.rows.map(row => row.schema_name);
    console.log(`\n📋 ${tenantSchemas.length} schémas tenant trouvés:`, tenantSchemas.join(', '));

    // Appliquer chaque migration à chaque tenant
    for (const migration of migrations) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`📦 Migration: ${migration.name}`);
      console.log(`   ${migration.description}`);
      console.log('='.repeat(70));

      // Lire le fichier de migration
      const migrationPath = path.join(__dirname, '../src/president/migrations', migration.name);
      
      if (!fs.existsSync(migrationPath)) {
        console.error(`❌ Fichier de migration non trouvé: ${migrationPath}`);
        continue;
      }

      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

      // Appliquer à chaque tenant
      for (const schema of tenantSchemas) {
        process.stdout.write(`   🔄 ${schema}... `);
        
        try {
          // Remplacer {schema} par le nom du schéma tenant
          const tenantSQL = migrationSQL.replace(/{schema}/g, schema);
          
          // Exécuter la migration
          await client.query(tenantSQL);
          
          console.log('✅');
        } catch (error) {
          console.log(`❌ ${error.message}`);
          // Continuer avec les autres tenants même en cas d'erreur
        }
      }
    }

    // Vérifications post-migration
    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 VÉRIFICATIONS POST-MIGRATION');
    console.log('='.repeat(70));

    for (const schema of tenantSchemas) {
      console.log(`\n🔍 ${schema}:`);

      // Vérifier les tables créées
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = $1 
        AND table_name IN ('convention', 'delegation_signature', 'conseil_discipline')
        ORDER BY table_name
      `, [schema]);
      
      const tables = tablesResult.rows.map(row => row.table_name);
      console.log(`   Tables: ${tables.join(', ') || '❌ Aucune'}`);

      // Vérifier les colonnes ajoutées à contrat_personnel
      const colsContratResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = $1 
        AND table_name = 'contrat_personnel'
        AND column_name IN ('statut_validation', 'valide_par', 'commentaire_president')
        ORDER BY column_name
      `, [schema]);
      
      const colsContrat = colsContratResult.rows.map(row => row.column_name);
      console.log(`   Colonnes contrat_personnel: ${colsContrat.join(', ') || '❌ Aucune'}`);

      // Vérifier les colonnes ajoutées à diplome
      const colsDiplomeResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = $1 
        AND table_name = 'diplome'
        AND column_name IN ('signe_president', 'signature_hash', 'date_signature_president')
        ORDER BY column_name
      `, [schema]);
      
      const colsDiplome = colsDiplomeResult.rows.map(row => row.column_name);
      console.log(`   Colonnes diplome: ${colsDiplome.join(', ') || '❌ Aucune'}`);

      // Vérifier la contrainte diplome.statut
      const constraintResult = await client.query(`
        SELECT pg_get_constraintdef(oid) as definition
        FROM pg_constraint
        WHERE conname = 'diplome_statut_check'
        AND connamespace = $1::regnamespace
      `, [schema]);

      if (constraintResult.rows.length > 0) {
        const def = constraintResult.rows[0].definition;
        const hasPretSignature = def.includes('pret_signature');
        const hasSigne = def.includes('signe');
        console.log(`   Statut diplome: ${hasPretSignature && hasSigne ? '✅ pret_signature, signe' : '⚠️  Incomplet'}`);
      } else {
        console.log(`   Statut diplome: ❌ Contrainte non trouvée`);
      }

      // Compter les index créés
      const indexResult = await client.query(`
        SELECT COUNT(*) as count
        FROM pg_indexes
        WHERE schemaname = $1
        AND indexname LIKE 'idx_%president%'
           OR indexname LIKE 'idx_%validation%'
           OR indexname LIKE 'idx_%signer%'
           OR indexname LIKE 'idx_%actif%'
      `, [schema]);

      const indexCount = parseInt(indexResult.rows[0].count);
      console.log(`   Index de performance: ${indexCount} créés`);
    }

    // Vérifier la table audit_log dans public
    console.log('\n🔍 Schéma public:');
    const auditCheck = await client.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_log'
      ) as exists
    `);
    
    if (auditCheck.rows[0].exists) {
      // Compter les colonnes
      const colsAuditResult = await client.query(`
        SELECT COUNT(*) as count
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'audit_log'
      `);
      console.log(`   Table audit_log: ✅ (${colsAuditResult.rows[0].count} colonnes)`);
    } else {
      console.log('   Table audit_log: ❌ Non trouvée');
    }

    // Résumé final
    console.log(`\n${'='.repeat(70)}`);
    console.log('✅ MIGRATION COMPLÈTE TERMINÉE AVEC SUCCÈS!');
    console.log('='.repeat(70));
    console.log('\n📝 Prochaines étapes:');
    console.log('   1. Vérifier les logs ci-dessus pour détecter d\'éventuelles erreurs');
    console.log('   2. Mettre à jour president.service.ts avec les requêtes SQL corrigées');
    console.log('   3. Adapter les types TypeScript (number → string pour UUID)');
    console.log('   4. Tester les endpoints avec Postman/Insomnia');
    console.log('\n📚 Documentation:');
    console.log('   - backend/src/president/SCHEMA_ANALYSIS.md');
    console.log('   - backend/src/president/IMPLEMENTATION_GUIDE.md');

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'application des migrations:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Exécuter les migrations
applyAllMigrations().catch(console.error);

// Made with Bob
