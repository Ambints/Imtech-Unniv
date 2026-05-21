require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function applySurveillanceTables() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2007',
    database: process.env.DB_NAME || 'Imtech_SaaS',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à la base de données');

    // Récupérer tous les tenants - essayer différentes requêtes
    let tenants = [];
    try {
      const tenantsResult = await client.query('SELECT id, nom, schema_name FROM tenants WHERE actif = true');
      tenants = tenantsResult.rows;
    } catch (error) {
      console.log('⚠️  Table tenants non trouvée dans public, essai avec tenant...');
      try {
        const tenantsResult = await client.query('SELECT id, nom, schema_name FROM tenant WHERE actif = true');
        tenants = tenantsResult.rows;
      } catch (error2) {
        console.log('⚠️  Utilisation du schéma tenant_ispm directement');
        tenants = [{ id: 'eaceef7f-dd73-46bd-9d77-231896181cca', nom: 'ISPM', schema_name: 'tenant_ispm' }];
      }
    }

    console.log(`📋 ${tenants.length} tenant(s) trouvé(s)`);

    // Lire le script SQL
    const sqlScript = fs.readFileSync(
      path.join(__dirname, 'add-surveillance-tables.sql'),
      'utf8'
    );

    // Appliquer le script à chaque tenant
    for (const tenant of tenants) {
      console.log(`\n🔄 Traitement du tenant: ${tenant.nom} (${tenant.schema_name})`);
      
      try {
        // Définir le search_path pour le schéma du tenant
        await client.query(`SET search_path TO ${tenant.schema_name}, public`);
        
        // Exécuter le script SQL
        await client.query(sqlScript);
        
        console.log(`✅ Tables de surveillance ajoutées pour ${tenant.nom}`);
      } catch (error) {
        console.error(`❌ Erreur pour ${tenant.nom}:`, error.message);
      }
    }

    console.log('\n✅ Migration terminée!');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Exécuter le script
applySurveillanceTables();

// Made with Bob
