const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2007'
});

async function applyProfesseurTables() {
  try {
    console.log('🚀 Application des tables pour portail professeur...\n');
    
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'add-professeur-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Récupérer tous les tenants
    const tenantsResult = await pool.query('SELECT id, schema_name, nom FROM tenants ORDER BY nom');
    
    if (tenantsResult.rows.length === 0) {
      console.log('❌ Aucun tenant trouvé');
      await pool.end();
      return;
    }
    
    console.log(`📋 ${tenantsResult.rows.length} tenant(s) trouvé(s)\n`);
    
    for (const tenant of tenantsResult.rows) {
      console.log(`\n🏫 Traitement: ${tenant.nom} (${tenant.schema_name})`);
      
      try {
        // Définir le search_path pour ce tenant
        await pool.query(`SET search_path TO ${tenant.schema_name}, public`);
        
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
        `, [tenant.schema_name]);
        
        console.log(`   📊 Tables créées (${tablesResult.rows.length}/6):`);
        tablesResult.rows.forEach(t => {
          console.log(`      - ${t.table_name}`);
        });
        
      } catch (error) {
        console.error(`   ❌ Erreur pour ${tenant.nom}:`, error.message);
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
