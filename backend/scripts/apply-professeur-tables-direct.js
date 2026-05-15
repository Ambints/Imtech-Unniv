const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007'
});

async function applyProfesseurTables() {
  try {
    console.log('🚀 Application des tables pour portail professeur...\n');
    
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'add-professeur-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Liste des schémas tenant
    const tenantSchemas = ['tenant_ispm', 'tenant_universite_d_antsiranana'];
    
    console.log(`📋 ${tenantSchemas.length} schéma(s) tenant trouvé(s)\n`);
    
    for (const schema of tenantSchemas) {
      console.log(`\n🏫 Traitement: ${schema}`);
      
      try {
        // Définir le search_path pour ce tenant
        await pool.query(`SET search_path TO ${schema}, public`);
        
        // Exécuter le script SQL
        await pool.query(sqlContent);
        
        console.log(`   ✅ Tables créées avec succès`);
        
        // Vérifier les tables créées
        const tablesResult = await pool.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_name IN ('support_cours', 'stage', 'fiche_suivi_stage', 'soutenance', 'evaluation_soutenance', 'demande_ressource')
          ORDER BY table_name
        `, [schema]);
        
        console.log(`   📊 Tables créées (${tablesResult.rows.length}/6):`);
        tablesResult.rows.forEach(t => {
          console.log(`      - ${t.table_name}`);
        });
        
      } catch (error) {
        console.error(`   ❌ Erreur pour ${schema}:`, error.message);
      }
    }
    
    // Réinitialiser le search_path
    await pool.query('SET search_path TO public');
    
    console.log('\n✅ Migration terminée !');
    await pool.end();
    
  } catch (error) {
    console.error('❌ Erreur globale:', error.message);
    await pool.end();
    process.exit(1);
  }
}

applyProfesseurTables();

// Made with Bob
