const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2007',
});

async function applyMessagerieToTenants() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Récupération de tous les tenants...');
    
    const tenantsResult = await client.query(`
      SELECT id, nom, schema_name 
      FROM public.tenant 
      WHERE actif = true
      ORDER BY nom
    `);
    
    console.log(`✅ ${tenantsResult.rows.length} tenant(s) trouvé(s)\n`);
    
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'create-messagerie-tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    for (const tenant of tenantsResult.rows) {
      console.log(`📧 Application de la messagerie pour: ${tenant.nom} (${tenant.schema_name})`);
      
      try {
        // Définir le search_path pour ce tenant
        await client.query(`SET search_path TO "${tenant.schema_name}", public`);
        
        // Exécuter le script SQL
        await client.query(sql);
        
        console.log(`   ✅ Tables de messagerie créées avec succès`);
        
        // Vérifier les tables créées
        const tablesResult = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = $1 
          AND table_name IN ('message_enseignant', 'message_destinataire')
          ORDER BY table_name
        `, [tenant.schema_name]);
        
        console.log(`   📊 Tables créées: ${tablesResult.rows.map(r => r.table_name).join(', ')}`);
        
      } catch (error) {
        console.error(`   ❌ Erreur pour ${tenant.nom}:`, error.message);
      }
      
      console.log('');
    }
    
    // Réinitialiser le search_path
    await client.query(`SET search_path TO public`);
    
    console.log('✅ Migration de la messagerie terminée pour tous les tenants');
    
  } catch (error) {
    console.error('❌ Erreur globale:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter le script
applyMessagerieToTenants()
  .then(() => {
    console.log('\n🎉 Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
  });

// Made with Bob
