const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function fixTenantSchema() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'Imtech_SaaS',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2007',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à la base de données');

    // 1. Vérifier si le tenant existe
    const tenantResult = await client.query(`
      SELECT id, slug, schema_name
      FROM public.tenant
      WHERE slug = 'saint-paul' OR schema_name = 'univ_demo'
    `);

    if (tenantResult.rows.length === 0) {
      console.log('❌ Le tenant univ_demo n\'existe pas');
      console.log('Créez d\'abord le tenant via l\'interface Super Admin');
      return;
    }

    const tenant = tenantResult.rows[0];
    const schemaName = tenant.schema_name;
    console.log(`✅ Tenant trouvé: ${tenant.slug} (schema: ${schemaName})`);

    // 2. Vérifier si le schéma existe
    const schemaCheck = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = $1
    `, [schemaName]);

    if (schemaCheck.rows.length === 0) {
      console.log(`⚠️  Le schéma ${schemaName} n'existe pas. Création...`);
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
      console.log(`✅ Schéma ${schemaName} créé`);
    } else {
      console.log(`✅ Le schéma ${schemaName} existe`);
    }

    // 3. Vérifier si la table utilisateur existe
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1 AND table_name = 'utilisateur'
    `, [schemaName]);

    if (tableCheck.rows.length === 0) {
      console.log(`⚠️  La table utilisateur n'existe pas dans ${schemaName}`);
      console.log('📝 Création des tables du tenant...');

      // Lire le fichier SQL du schéma tenant
      const sqlPath = path.join(__dirname, '../src/tenants/tenant-schema.sql');
      let sql = fs.readFileSync(sqlPath, 'utf8');

      // Remplacer les CREATE TABLE IF NOT EXISTS par des CREATE TABLE
      // et exécuter dans le schéma du tenant
      await client.query(`SET search_path TO "${schemaName}"`);

      // Créer les extensions
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
      await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

      // Exécuter le script SQL
      await client.query(sql);

      console.log(`✅ Tables créées dans le schéma ${schemaName}`);
    } else {
      console.log(`✅ La table utilisateur existe dans ${schemaName}`);
    }

    // 4. Vérifier les utilisateurs existants
    const usersResult = await client.query(`
      SELECT id, email, nom, prenom, role, actif 
      FROM "${schemaName}".utilisateur 
      LIMIT 5
    `);

    console.log(`\n📊 Utilisateurs dans ${schemaName}:`);
    if (usersResult.rows.length === 0) {
      console.log('   Aucun utilisateur trouvé');
    } else {
      usersResult.rows.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - ${user.actif ? 'Actif' : 'Inactif'}`);
      });
    }

    // 5. Vérifier les parcours
    const parcoursResult = await client.query(`
      SELECT id, code, nom, responsable_id 
      FROM "${schemaName}".parcours 
      LIMIT 5
    `);

    console.log(`\n📚 Parcours dans ${schemaName}:`);
    if (parcoursResult.rows.length === 0) {
      console.log('   Aucun parcours trouvé');
    } else {
      parcoursResult.rows.forEach(parcours => {
        console.log(`   - ${parcours.code}: ${parcours.nom} (RP: ${parcours.responsable_id || 'Non assigné'})`);
      });
    }

    console.log('\n✅ Vérification terminée');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

// Exécuter
fixTenantSchema().catch(console.error);

// Made with Bob
