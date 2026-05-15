const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'imtech_university',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

async function checkRP1Role() {
  try {
    // Trouver le tenant ISPM
    const tenantResult = await pool.query(
      'SELECT id, schema_name FROM tenants WHERE nom ILIKE $1',
      ['%ISPM%']
    );
    
    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant ISPM non trouvé');
      await pool.end();
      return;
    }
    
    const tenant = tenantResult.rows[0];
    console.log('✅ Tenant trouvé:', tenant.schema_name);
    
    // Chercher l'utilisateur RP1
    const userResult = await pool.query(
      `SELECT id, email, nom, prenom, role FROM ${tenant.schema_name}.utilisateur WHERE email = $1`,
      ['rp1@ispm.mg']
    );
    
    if (userResult.rows.length > 0) {
      console.log('\n📋 Utilisateur RP1:');
      console.log(JSON.stringify(userResult.rows[0], null, 2));
      console.log('\n🔍 Rôle actuel:', userResult.rows[0].role);
    } else {
      console.log('❌ Utilisateur RP1 non trouvé');
    }
    
    // Lister tous les utilisateurs avec un rôle contenant 'rp' ou 'resp'
    console.log('\n📋 Tous les utilisateurs RP/Responsable:');
    const allRPResult = await pool.query(
      `SELECT id, email, nom, prenom, role FROM ${tenant.schema_name}.utilisateur 
       WHERE role ILIKE '%rp%' OR role ILIKE '%resp%' OR role ILIKE '%pedagogique%'`
    );
    
    if (allRPResult.rows.length > 0) {
      allRPResult.rows.forEach(user => {
        console.log(`  - ${user.email}: role="${user.role}"`);
      });
    } else {
      console.log('  Aucun utilisateur RP trouvé');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    await pool.end();
  }
}

checkRP1Role();

// Made with Bob
