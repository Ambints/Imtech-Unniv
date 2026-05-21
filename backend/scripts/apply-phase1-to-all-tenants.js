/**
 * ============================================================================
 * SCRIPT D'APPLICATION PHASE 1 À TOUS LES TENANTS
 * ============================================================================
 * Applique automatiquement les corrections critiques à tous les schémas tenant
 * Date: 2026-05-18
 * ============================================================================
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la connexion
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password',
});

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Récupère tous les schémas tenant
 */
async function getTenantSchemas() {
  const query = `
    SELECT schema_name 
    FROM information_schema.schemata 
    WHERE schema_name LIKE 'tenant_%'
    ORDER BY schema_name;
  `;
  
  const result = await pool.query(query);
  return result.rows.map(row => row.schema_name);
}

/**
 * Lit le script SQL de la phase 1
 */
function readPhase1Script() {
  const scriptPath = path.join(__dirname, 'phase1-fix-critical-issues.sql');
  return fs.readFileSync(scriptPath, 'utf8');
}

/**
 * Applique le script à un schéma tenant
 */
async function applyToTenant(schema, sqlScript) {
  log(`\n${'='.repeat(70)}`, 'cyan');
  log(`Traitement du schéma: ${schema}`, 'bright');
  log('='.repeat(70), 'cyan');
  
  try {
    // Remplacer {schema} par le nom du schéma
    const tenantScript = sqlScript.replace(/{schema}/g, schema);
    
    // Exécuter le script
    await pool.query(tenantScript);
    
    log(`✓ ${schema} : Migration réussie`, 'green');
    return { schema, success: true, error: null };
    
  } catch (error) {
    log(`✗ ${schema} : Erreur`, 'red');
    log(`  ${error.message}`, 'red');
    return { schema, success: false, error: error.message };
  }
}

/**
 * Vérifie les résultats de la migration
 */
async function verifyMigration(schema) {
  const checks = [];
  
  try {
    // Vérifier contrainte diplome
    const constraintCheck = await pool.query(`
      SELECT COUNT(*) as count
      FROM pg_constraint 
      WHERE conname = 'diplome_statut_check'
      AND connamespace = $1::regnamespace
    `, [schema]);
    
    checks.push({
      name: 'Contrainte diplome_statut_check',
      passed: constraintCheck.rows[0].count > 0
    });
    
    // Vérifier colonne signe_president
    const columnCheck = await pool.query(`
      SELECT COUNT(*) as count
      FROM information_schema.columns
      WHERE table_schema = $1
      AND table_name = 'diplome'
      AND column_name = 'signe_president'
    `, [schema]);
    
    checks.push({
      name: 'Colonne signe_president',
      passed: columnCheck.rows[0].count > 0
    });
    
    // Vérifier index paiement
    const indexCheck = await pool.query(`
      SELECT COUNT(*) as count
      FROM pg_indexes
      WHERE schemaname = $1
      AND indexname = 'idx_paiement_date_mode'
    `, [schema]);
    
    checks.push({
      name: 'Index idx_paiement_date_mode',
      passed: indexCheck.rows[0].count > 0
    });
    
    return checks;
    
  } catch (error) {
    log(`Erreur lors de la vérification de ${schema}: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Affiche un résumé des résultats
 */
function displaySummary(results) {
  log('\n' + '='.repeat(70), 'cyan');
  log('RÉSUMÉ DE LA MIGRATION PHASE 1', 'bright');
  log('='.repeat(70), 'cyan');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  log(`\nTotal schémas traités: ${results.length}`, 'bright');
  log(`✓ Réussis: ${successful}`, 'green');
  if (failed > 0) {
    log(`✗ Échoués: ${failed}`, 'red');
  }
  
  // Détails des échecs
  if (failed > 0) {
    log('\nDétails des échecs:', 'yellow');
    results
      .filter(r => !r.success)
      .forEach(r => {
        log(`  • ${r.schema}: ${r.error}`, 'red');
      });
  }
  
  log('\n' + '='.repeat(70), 'cyan');
}

/**
 * Fonction principale
 */
async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║  PHASE 1 : CORRECTION PROBLÈMES CRITIQUES                 ║', 'bright');
  log('║  Application automatique à tous les tenants               ║', 'bright');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  try {
    // 1. Récupérer les schémas tenant
    log('\n1. Récupération des schémas tenant...', 'blue');
    const schemas = await getTenantSchemas();
    log(`   Trouvé ${schemas.length} schéma(s) tenant`, 'green');
    schemas.forEach(s => log(`   • ${s}`, 'cyan'));
    
    // 2. Lire le script SQL
    log('\n2. Lecture du script SQL...', 'blue');
    const sqlScript = readPhase1Script();
    log('   ✓ Script chargé', 'green');
    
    // 3. Confirmer l'exécution
    log('\n⚠️  ATTENTION: Cette opération va modifier la base de données', 'yellow');
    log('   Appuyez sur Ctrl+C pour annuler, ou attendez 5 secondes...', 'yellow');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 4. Appliquer à chaque tenant
    log('\n3. Application des corrections...', 'blue');
    const results = [];
    
    for (const schema of schemas) {
      const result = await applyToTenant(schema, sqlScript);
      results.push(result);
      
      // Vérifier la migration
      if (result.success) {
        const checks = await verifyMigration(schema);
        checks.forEach(check => {
          const status = check.passed ? '✓' : '✗';
          const color = check.passed ? 'green' : 'red';
          log(`  ${status} ${check.name}`, color);
        });
      }
    }
    
    // 5. Afficher le résumé
    displaySummary(results);
    
    // 6. Recommandations
    log('\nPROCHAINES ÉTAPES:', 'bright');
    log('  1. Vérifier les logs ci-dessus', 'cyan');
    log('  2. Tester les fonctionnalités critiques', 'cyan');
    log('  3. Exécuter Phase 2 (mise à jour tenant-schema.sql)', 'cyan');
    log('  4. Redémarrer l\'application backend', 'cyan');
    
  } catch (error) {
    log(`\n✗ Erreur fatale: ${error.message}`, 'red');
    log(error.stack, 'red');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Gestion des erreurs non capturées
process.on('unhandledRejection', (error) => {
  log(`\n✗ Erreur non gérée: ${error.message}`, 'red');
  log(error.stack, 'red');
  process.exit(1);
});

// Exécution
if (require.main === module) {
  main().catch(error => {
    log(`\n✗ Erreur: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main, getTenantSchemas, applyToTenant };

// Made with Bob
