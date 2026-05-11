const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyScolariteTablesToTenant() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'imtech_university',
  });

  console.log(`🔌 Connexion à: ${process.env.DB_NAME} sur ${process.env.DB_HOST}:${process.env.DB_PORT}`);

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL');

    // Récupérer tous les tenants (sans filtre statut si la colonne n'existe pas)
    const tenantsResult = await client.query('SELECT id, nom FROM public.tenant');
    const tenants = tenantsResult.rows;

    console.log(`📋 ${tenants.length} tenant(s) trouvé(s)`);

    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, '../src/scolarite/migrations/001_add_scolarite_tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    for (const tenant of tenants) {
      const schemaName = `tenant_${tenant.nom.toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
      
      console.log(`\n🔧 Application des tables scolarité pour: ${tenant.nom} (${schemaName})`);

      try {
        // Définir le search_path
        await client.query(`SET search_path TO "${schemaName}", public`);
        
        // Exécuter le script SQL
        await client.query(sqlContent);
        
        console.log(`✅ Tables scolarité créées avec succès pour ${tenant.nom}`);
      } catch (error) {
        console.error(`❌ Erreur pour ${tenant.nom}:`, error.message);
        // Continuer avec les autres tenants même en cas d'erreur
      }
    }

    console.log('\n✅ Migration terminée pour tous les tenants');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Exécuter le script
applyScolariteTablesToTenant();

// Made with Bob
