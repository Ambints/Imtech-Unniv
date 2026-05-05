const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'imtech_university',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function fixAdminTenantAssociation() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Recherche des utilisateurs admin sans tenantId...\n');
    
    // 1. Lister tous les tenants disponibles
    const tenantsResult = await client.query(`
      SELECT id, nom, slug, schema_name as "schemaName"
      FROM public.tenant
      WHERE actif = true
      ORDER BY created_at DESC
    `);
    
    console.log('📋 Universités disponibles:');
    tenantsResult.rows.forEach((tenant, idx) => {
      console.log(`  ${idx + 1}. ${tenant.nom} (${tenant.slug}) - ID: ${tenant.id}`);
    });
    console.log('');
    
    // 2. Pour chaque tenant, vérifier les utilisateurs admin sans tenantId
    for (const tenant of tenantsResult.rows) {
      console.log(`\n🔍 Vérification du schéma: ${tenant.schemaName}`);
      
      // Vérifier si le schéma existe
      const schemaCheck = await client.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name = $1
      `, [tenant.schemaName]);
      
      if (schemaCheck.rows.length === 0) {
        console.log(`  ⚠️  Schéma ${tenant.schemaName} n'existe pas, ignoré`);
        continue;
      }
      
      // Vérifier si la colonne tenant_id existe
      const columnCheck = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = $1
        AND table_name = 'utilisateur'
        AND column_name = 'tenant_id'
      `, [tenant.schemaName]);
      
      if (columnCheck.rows.length === 0) {
        console.log(`  🔧 Ajout de la colonne tenant_id...`);
        await client.query(`
          ALTER TABLE ${tenant.schemaName}.utilisateur
          ADD COLUMN IF NOT EXISTS tenant_id UUID
        `);
        console.log(`  ✅ Colonne tenant_id ajoutée`);
      }
      
      // Chercher les utilisateurs admin dans ce schéma
      const usersResult = await client.query(`
        SELECT id, email, prenom, nom, role, tenant_id as "tenantId"
        FROM ${tenant.schemaName}.utilisateur
        WHERE role IN ('admin', 'president')
      `);
      
      if (usersResult.rows.length === 0) {
        console.log(`  ℹ️  Aucun admin/president trouvé`);
        continue;
      }
      
      console.log(`  👥 Utilisateurs admin/president trouvés: ${usersResult.rows.length}`);
      
      // Mettre à jour ceux qui n'ont pas de tenantId
      for (const user of usersResult.rows) {
        if (!user.tenantId) {
          console.log(`    ⚠️  ${user.prenom} ${user.nom} (${user.email}) - tenantId manquant`);
          console.log(`    🔧 Mise à jour avec tenantId: ${tenant.id}`);
          
          await client.query(`
            UPDATE ${tenant.schemaName}.utilisateur
            SET tenant_id = $1
            WHERE id = $2
          `, [tenant.id, user.id]);
          
          console.log(`    ✅ Mis à jour avec succès`);
        } else {
          console.log(`    ✓ ${user.prenom} ${user.nom} (${user.email}) - tenantId OK: ${user.tenantId}`);
        }
      }
    }
    
    console.log('\n✅ Vérification et correction terminées!');
    console.log('\n💡 Les utilisateurs doivent se reconnecter pour obtenir un nouveau token avec le tenantId.');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

fixAdminTenantAssociation();

// Made with Bob
