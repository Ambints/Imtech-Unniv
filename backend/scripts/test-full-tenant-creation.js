const { Client } = require('pg');
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');
require('dotenv').config();

async function testFullTenantCreation() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'imtech_university',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  const testSlug = 'test-university';
  const testSchemaName = `tenant_${testSlug.replace(/-/g, '_')}`;

  try {
    await client.connect();
    console.log('✅ Connexion PostgreSQL établie\n');

    console.log('🎓 ========================================');
    console.log('🎓 TEST DE CRÉATION COMPLÈTE D\'UNIVERSITÉ');
    console.log('🎓 ========================================');
    console.log(`📝 Slug: ${testSlug}`);
    console.log(`🗄️  Schéma: ${testSchemaName}\n`);

    // ÉTAPE 1: Nettoyage préalable
    console.log('🧹 ÉTAPE 1: Nettoyage préalable');
    console.log('─────────────────────────────────────────');
    try {
      await client.query(`DROP SCHEMA IF EXISTS "${testSchemaName}" CASCADE`);
      console.log(`✅ Schéma ${testSchemaName} nettoyé\n`);
    } catch (error) {
      console.log(`⚠️  Erreur de nettoyage (ignorée): ${error.message}\n`);
    }

    // ÉTAPE 2: Création du schéma
    console.log('📦 ÉTAPE 2: Création du schéma');
    console.log('─────────────────────────────────────────');
    await client.query(`CREATE SCHEMA "${testSchemaName}"`);
    console.log(`✅ Schéma ${testSchemaName} créé`);

    // Vérification
    const schemaCheck = await client.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name = $1
    `, [testSchemaName]);
    
    if (schemaCheck.rows.length === 0) {
      throw new Error('❌ Le schéma n\'a pas été créé correctement');
    }
    console.log(`✅ Schéma vérifié dans information_schema\n`);

    // ÉTAPE 3: Vérification des extensions
    console.log('🔌 ÉTAPE 3: Vérification des extensions');
    console.log('─────────────────────────────────────────');
    const extensions = await client.query(`
      SELECT extname FROM pg_extension
      WHERE extname IN ('uuid-ossp', 'pgcrypto')
    `);
    console.log(`✅ ${extensions.rows.length}/2 extensions trouvées`);
    extensions.rows.forEach(ext => console.log(`   - ${ext.extname}`));
    console.log('');

    // ÉTAPE 4: Lecture du fichier SQL
    console.log('📄 ÉTAPE 4: Lecture du fichier SQL');
    console.log('─────────────────────────────────────────');
    const sqlPath = join(__dirname, '../src/tenants/tenant-schema.sql');
    console.log(`📂 Chemin: ${sqlPath}`);
    
    if (!existsSync(sqlPath)) {
      throw new Error(`❌ Fichier SQL introuvable: ${sqlPath}`);
    }
    console.log(`✅ Fichier trouvé`);
    
    const sqlScript = readFileSync(sqlPath, 'utf-8');
    const sqlLines = sqlScript.split('\n').length;
    console.log(`✅ Fichier lu: ${sqlLines} lignes\n`);

    // ÉTAPE 5: Définir le search_path
    console.log('🔧 ÉTAPE 5: Configuration du search_path');
    console.log('─────────────────────────────────────────');
    await client.query(`SET search_path TO "${testSchemaName}"`);
    console.log(`✅ search_path défini sur ${testSchemaName}\n`);

    // ÉTAPE 6: Parser et exécuter le SQL
    console.log('⚙️  ÉTAPE 6: Exécution du script SQL');
    console.log('─────────────────────────────────────────');
    const statements = parseSqlStatements(sqlScript);
    console.log(`📊 ${statements.length} instructions SQL à exécuter`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await client.query(stmt);
        successCount++;
        
        // Log progression tous les 20 statements
        if ((i + 1) % 20 === 0) {
          console.log(`   ⏳ ${i + 1}/${statements.length} instructions exécutées...`);
        }
      } catch (error) {
        errorCount++;
        const errorInfo = {
          index: i + 1,
          message: error.message,
          sql: stmt.substring(0, 100) + '...'
        };
        errors.push(errorInfo);
        
        // Ne pas logger les erreurs "already exists"
        if (!error.message.includes('already exists') && 
            !error.message.includes('existe déjà')) {
          console.log(`   ⚠️  Erreur ${i + 1}: ${error.message.substring(0, 80)}`);
        }
      }
    }
    
    console.log(`✅ Exécution terminée: ${successCount} réussies, ${errorCount} erreurs\n`);

    // ÉTAPE 7: Vérification des tables créées
    console.log('🔍 ÉTAPE 7: Vérification des tables');
    console.log('─────────────────────────────────────────');
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = $1
      ORDER BY table_name
    `, [testSchemaName]);
    
    console.log(`✅ ${tables.rows.length} tables créées:`);
    
    // Tables essentielles à vérifier
    const requiredTables = [
      'utilisateur', 'annee_academique', 'departement', 'parcours',
      'unite_enseignement', 'etudiant', 'inscription', 'note',
      'session_jwt', 'batiment', 'salle'
    ];
    
    const missingTables = [];
    for (const table of requiredTables) {
      const found = tables.rows.find(t => t.table_name === table);
      if (found) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} (MANQUANTE)`);
        missingTables.push(table);
      }
    }
    
    if (missingTables.length > 0) {
      console.log(`\n⚠️  ${missingTables.length} table(s) essentielle(s) manquante(s)`);
    }
    console.log('');

    // ÉTAPE 8: Test d'insertion de données
    console.log('💾 ÉTAPE 8: Test d\'insertion de données');
    console.log('─────────────────────────────────────────');
    
    try {
      // Insérer une année académique
      await client.query(`
        INSERT INTO annee_academique (libelle, date_debut, date_fin, active)
        VALUES ('2025-2026', '2025-09-01', '2026-07-31', TRUE)
      `);
      console.log('✅ Année académique insérée');
      
      // Insérer un utilisateur admin
      await client.query(`
        INSERT INTO utilisateur (email, password_hash, nom, prenom, role, actif, email_verifie)
        VALUES (
          'admin@test.edu',
          public.crypt('Test@1234', public.gen_salt('bf')),
          'Admin',
          'Test',
          'admin',
          TRUE,
          TRUE
        )
      `);
      console.log('✅ Utilisateur admin inséré');
      
      // Insérer un département
      await client.query(`
        INSERT INTO departement (code, nom)
        VALUES ('TEST', 'Département Test')
      `);
      console.log('✅ Département inséré');
      
      console.log('✅ Toutes les insertions de test réussies\n');
    } catch (error) {
      console.log(`❌ Erreur lors de l'insertion: ${error.message}\n`);
    }

    // ÉTAPE 9: Statistiques finales
    console.log('📊 ÉTAPE 9: Statistiques finales');
    console.log('─────────────────────────────────────────');
    
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = $1) as total_tables,
        (SELECT COUNT(*) FROM utilisateur) as total_users,
        (SELECT COUNT(*) FROM annee_academique) as total_years,
        (SELECT COUNT(*) FROM departement) as total_departments
    `, [testSchemaName]);
    
    console.log(`📊 Tables: ${stats.rows[0].total_tables}`);
    console.log(`👥 Utilisateurs: ${stats.rows[0].total_users}`);
    console.log(`📅 Années académiques: ${stats.rows[0].total_years}`);
    console.log(`🏢 Départements: ${stats.rows[0].total_departments}`);
    console.log('');

    // ÉTAPE 10: Rapport d'erreurs
    if (errors.length > 0) {
      console.log('⚠️  ÉTAPE 10: Rapport d\'erreurs');
      console.log('─────────────────────────────────────────');
      console.log(`${errors.length} erreur(s) détectée(s):\n`);
      
      errors.slice(0, 10).forEach(err => {
        console.log(`❌ Instruction ${err.index}:`);
        console.log(`   Message: ${err.message}`);
        console.log(`   SQL: ${err.sql}\n`);
      });
      
      if (errors.length > 10) {
        console.log(`... et ${errors.length - 10} autres erreurs\n`);
      }
    }

    // RÉSULTAT FINAL
    console.log('🎉 ========================================');
    console.log('🎉 TEST TERMINÉ');
    console.log('🎉 ========================================');
    console.log(`✅ Schéma créé: ${testSchemaName}`);
    console.log(`✅ Tables créées: ${tables.rows.length}`);
    console.log(`✅ Instructions réussies: ${successCount}/${statements.length}`);
    console.log(`${missingTables.length === 0 ? '✅' : '⚠️'} Tables essentielles: ${missingTables.length === 0 ? 'Toutes présentes' : missingTables.length + ' manquantes'}`);
    console.log('🎉 ========================================\n');

    // NETTOYAGE
    console.log('🧹 Nettoyage du schéma de test...');
    await client.query(`SET search_path TO public`);
    await client.query(`DROP SCHEMA IF EXISTS "${testSchemaName}" CASCADE`);
    console.log('✅ Schéma de test supprimé\n');

  } catch (error) {
    console.error('\n❌ ========================================');
    console.error('❌ ERREUR CRITIQUE');
    console.error('❌ ========================================');
    console.error(`Message: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error('❌ ========================================\n');
  } finally {
    await client.end();
  }
}

// Parser SQL (copié du service)
function parseSqlStatements(script) {
  const statements = [];
  let current = '';
  let inBlockComment = false;
  let inLineComment = false;
  let inDollarQuote = false;
  let dollarTag = '';

  for (let i = 0; i < script.length; i++) {
    const char = script[i];
    const nextChar = script[i + 1] || '';

    // Commentaire bloc
    if (!inBlockComment && !inLineComment && !inDollarQuote && char === '/' && nextChar === '*') {
      inBlockComment = true;
      i++;
      continue;
    }

    if (inBlockComment && char === '*' && nextChar === '/') {
      inBlockComment = false;
      i++;
      continue;
    }

    if (inBlockComment || inLineComment) {
      if (inLineComment && char === '\n') {
        inLineComment = false;
      }
      continue;
    }

    // Commentaire ligne
    if (!inDollarQuote && char === '-' && nextChar === '-') {
      inLineComment = true;
      i++;
      continue;
    }

    // Dollar quote
    if (!inDollarQuote && char === '$') {
      const remaining = script.substring(i);
      const match = remaining.match(/^\$(\w*)\$/);
      if (match) {
        inDollarQuote = true;
        dollarTag = match[1];
        current += match[0];
        i += match[0].length - 1;
        continue;
      }
    }

    if (inDollarQuote && char === '$') {
      const endTag = `$${dollarTag}$`;
      const remaining = script.substring(i);
      if (remaining.startsWith(endTag)) {
        inDollarQuote = false;
        current += endTag;
        i += endTag.length - 1;
        continue;
      }
    }

    // Point-virgule
    if (!inDollarQuote && char === ';') {
      const trimmed = current.trim();
      if (trimmed) {
        statements.push(trimmed + ';');
      }
      current = '';
      continue;
    }

    current += char;
  }

  const trimmed = current.trim();
  if (trimmed) {
    statements.push(trimmed + (trimmed.endsWith(';') ? '' : ';'));
  }

  return statements.filter(s => s.length > 0 && !s.startsWith('--'));
}

testFullTenantCreation();

// Made with Bob
