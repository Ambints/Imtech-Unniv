const { Pool } = require('pg');

// Configuration de la base de données (même configuration que app.module.ts)
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'imtech_university',
  password: 'password',
  port: 5432,
  // Ajout d'options pour éviter les problèmes d'encodage
  encoding: 'utf8',
  client_encoding: 'UTF8'
});

async function checkTenantTable() {
  try {
    console.log('🔍 Vérification de la table public.tenant...');
    
    // Vérifier si la table existe
    const tableExistsQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'tenant'
    `;
    
    const tableExistsResult = await pool.query(tableExistsQuery);
    
    if (tableExistsResult.rows.length === 0) {
      console.log('❌ La table public.tenant n\'existe pas');
      return;
    }
    
    console.log('✅ La table public.tenant existe');
    
    // Compter le nombre de tenants
    const countQuery = 'SELECT COUNT(*) as count FROM public.tenant';
    const countResult = await pool.query(countQuery);
    const tenantCount = parseInt(countResult.rows[0].count);
    
    console.log(`📊 Nombre de tenants dans la table: ${tenantCount}`);
    
    if (tenantCount === 0) {
      console.log('⚠️ Aucun tenant trouvé dans la table');
      return;
    }
    
    // Afficher tous les tenants
    const selectAllQuery = 'SELECT * FROM public.tenant ORDER BY created_at DESC';
    const tenantsResult = await pool.query(selectAllQuery);
    
    console.log('\n📋 Liste des tenants:');
    console.log('=====================================');
    
    tenantsResult.rows.forEach((tenant, index) => {
      console.log(`\n🏫 Tenant #${index + 1}:`);
      console.log(`   ID: ${tenant.id}`);
      console.log(`   Nom: ${tenant.nom}`);
      console.log(`   Slug: ${tenant.slug}`);
      console.log(`   Schéma: ${tenant.schema_name}`);
      console.log(`   Actif: ${tenant.actif ? '✅' : '❌'}`);
      console.log(`   Créé le: ${tenant.created_at}`);
      console.log(`   Pays: ${tenant.pays || 'N/A'}`);
      console.log(`   Type: ${tenant.type_etablissement || 'N/A'}`);
      
      if (tenant.slogan) {
        console.log(`   Slogan: ${tenant.slogan}`);
      }
      
      if (tenant.logo_url) {
        console.log(`   Logo: ${tenant.logo_url.substring(0, 50)}...`);
      }
    });
    
    console.log('\n=====================================');
    console.log(`✅ Vérification terminée - ${tenantCount} tenant(s) trouvé(s)`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    await pool.end();
  }
}

// Exécuter la vérification
checkTenantTable();
