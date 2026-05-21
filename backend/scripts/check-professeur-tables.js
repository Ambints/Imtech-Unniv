const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'imtech_university',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function checkProfesseurTables() {
  try {
    // Trouver un tenant
    const tenantResult = await pool.query(
      'SELECT id, schema_name, nom FROM tenants WHERE nom ILIKE $1 LIMIT 1',
      ['%ISPM%']
    );
    
    if (tenantResult.rows.length === 0) {
      console.log('❌ Aucun tenant trouvé');
      await pool.end();
      return;
    }
    
    const tenant = tenantResult.rows[0];
    console.log('✅ Tenant:', tenant.nom, '(' + tenant.schema_name + ')');
    
    // Tables nécessaires pour le portail professeur
    const requiredTables = [
      'enseignant',
      'affectation_cours',
      'support_cours',
      'presence',
      'emploi_du_temps',
      'sujet_examen',
      'stage',
      'demande_ressource',
      'message',
      'fiche_suivi_stage',
      'evaluation_soutenance',
      'reservation_salle'
    ];
    
    console.log('\n📋 Vérification des tables pour portail professeur:\n');
    
    for (const tableName of requiredTables) {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = $1 AND table_name = $2
        )
      `, [tenant.schema_name, tableName]);
      
      const exists = result.rows[0].exists;
      console.log(`  ${exists ? '✅' : '❌'} ${tableName}`);
      
      // Si la table existe, afficher sa structure
      if (exists) {
        const columns = await pool.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = $1 AND table_name = $2
          ORDER BY ordinal_position
        `, [tenant.schema_name, tableName]);
        
        console.log(`     Colonnes (${columns.rows.length}):`);
        columns.rows.slice(0, 5).forEach(col => {
          console.log(`       - ${col.column_name} (${col.data_type})`);
        });
        if (columns.rows.length > 5) {
          console.log(`       ... et ${columns.rows.length - 5} autres colonnes`);
        }
      }
    }
    
    // Vérifier si des utilisateurs ont le rôle professeur
    console.log('\n👥 Utilisateurs avec rôle professeur:');
    const profs = await pool.query(`
      SELECT id, email, nom, prenom, role
      FROM ${tenant.schema_name}.utilisateur
      WHERE role ILIKE '%prof%' OR role = 'professeur'
    `);
    
    if (profs.rows.length > 0) {
      profs.rows.forEach(p => {
        console.log(`  - ${p.email} (${p.role})`);
      });
    } else {
      console.log('  ❌ Aucun utilisateur professeur trouvé');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await pool.end();
  }
}

checkProfesseurTables();

// Made with Bob
