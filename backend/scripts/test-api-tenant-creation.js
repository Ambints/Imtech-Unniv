const axios = require('axios');
const { Client } = require('pg');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testApiTenantCreation() {
  console.log('🧪 ========================================');
  console.log('🧪 TEST DE CRÉATION VIA L\'API');
  console.log('🧪 ========================================\n');

  // Étape 1: Vérifier que le backend est en cours d'exécution
  console.log('📡 ÉTAPE 1: Vérification du backend');
  console.log('─────────────────────────────────────────');
  console.log(`URL: ${API_URL}`);
  
  try {
    const healthCheck = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    console.log('✅ Backend en cours d\'exécution\n');
  } catch (error) {
    console.log('❌ Backend non accessible');
    console.log('   Assurez-vous que le backend est démarré avec: npm run start:dev');
    console.log('   Erreur:', error.message);
    return;
  }

  // Étape 2: Se connecter en tant que super_admin
  console.log('🔐 ÉTAPE 2: Connexion super_admin');
  console.log('─────────────────────────────────────────');
  
  let token;
  try {
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'super@admin.com',
      password: 'Super@1234'
    });
    
    token = loginResponse.data.access_token;
    console.log('✅ Connexion réussie');
    console.log(`   Token: ${token.substring(0, 20)}...\n`);
  } catch (error) {
    console.log('❌ Échec de connexion');
    console.log('   Vérifiez les identifiants super_admin');
    console.log('   Erreur:', error.response?.data?.message || error.message);
    return;
  }

  // Étape 3: Vérifier les tenants existants AVANT création
  console.log('📋 ÉTAPE 3: Tenants existants (AVANT)');
  console.log('─────────────────────────────────────────');
  
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'imtech_university',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });
  
  await client.connect();
  
  const schemasBefore = await client.query(`
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name LIKE 'tenant_%'
    ORDER BY schema_name
  `);
  
  console.log(`✅ ${schemasBefore.rows.length} schéma(s) tenant trouvé(s):`);
  schemasBefore.rows.forEach(row => console.log(`   - ${row.schema_name}`));
  console.log('');

  // Étape 4: Créer un nouveau tenant via l'API
  console.log('🎓 ÉTAPE 4: Création d\'un nouveau tenant');
  console.log('─────────────────────────────────────────');
  
  const testTenantData = {
    nom: 'Université de Test API',
    slug: 'test-api-' + Date.now(),
    slogan: 'Test via API',
    pays: 'Madagascar',
    typeEtablissement: 'Université',
    couleurPrincipale: '#1e40af',
    couleurSecondaire: '#3b82f6'
  };
  
  console.log(`📝 Données du tenant:`);
  console.log(`   Nom: ${testTenantData.nom}`);
  console.log(`   Slug: ${testTenantData.slug}`);
  
  let createdTenant;
  try {
    console.log('\n🚀 Envoi de la requête POST /tenants...');
    const createResponse = await axios.post(
      `${API_URL}/tenants`,
      testTenantData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 secondes pour la création
      }
    );
    
    createdTenant = createResponse.data;
    console.log('✅ Réponse API reçue');
    console.log(`   ID: ${createdTenant.id}`);
    console.log(`   Schéma: ${createdTenant.schemaName}`);
    console.log(`   Actif: ${createdTenant.actif}\n`);
  } catch (error) {
    console.log('❌ Échec de création via API');
    console.log('   Status:', error.response?.status);
    console.log('   Message:', error.response?.data?.message || error.message);
    console.log('   Détails:', JSON.stringify(error.response?.data, null, 2));
    
    // Vérifier quand même si le schéma a été créé
    console.log('\n🔍 Vérification dans PostgreSQL...');
    const schemasAfterError = await client.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name LIKE 'tenant_%'
      ORDER BY schema_name
    `);
    
    const newSchemas = schemasAfterError.rows.filter(
      row => !schemasBefore.rows.find(before => before.schema_name === row.schema_name)
    );
    
    if (newSchemas.length > 0) {
      console.log('⚠️  Un schéma a été créé malgré l\'erreur:');
      newSchemas.forEach(row => console.log(`   - ${row.schema_name}`));
    } else {
      console.log('❌ Aucun nouveau schéma créé');
    }
    
    await client.end();
    return;
  }

  // Étape 5: Vérifier que le schéma a été créé dans PostgreSQL
  console.log('🔍 ÉTAPE 5: Vérification dans PostgreSQL');
  console.log('─────────────────────────────────────────');
  
  const schemasAfter = await client.query(`
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name LIKE 'tenant_%'
    ORDER BY schema_name
  `);
  
  const newSchemas = schemasAfter.rows.filter(
    row => !schemasBefore.rows.find(before => before.schema_name === row.schema_name)
  );
  
  if (newSchemas.length === 0) {
    console.log('❌ PROBLÈME: Aucun nouveau schéma créé dans PostgreSQL !');
    console.log('   L\'API a répondu avec succès mais le schéma n\'existe pas.');
    console.log('   Cela indique un problème dans TenantCreationService.\n');
  } else {
    console.log(`✅ ${newSchemas.length} nouveau(x) schéma(s) créé(s):`);
    newSchemas.forEach(row => console.log(`   - ${row.schema_name}`));
    
    // Vérifier les tables dans le nouveau schéma
    const expectedSchema = `tenant_${testTenantData.slug.replace(/-/g, '_')}`;
    const tables = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = $1
    `, [expectedSchema]);
    
    console.log(`\n📊 Tables dans ${expectedSchema}: ${tables.rows[0].count}`);
    
    if (parseInt(tables.rows[0].count) < 50) {
      console.log('⚠️  Nombre de tables insuffisant (attendu: ~65)');
    } else {
      console.log('✅ Nombre de tables correct');
    }
  }
  console.log('');

  // Étape 6: Vérifier dans la table tenant
  console.log('📋 ÉTAPE 6: Vérification dans la table tenant');
  console.log('─────────────────────────────────────────');
  
  const tenantRecord = await client.query(`
    SELECT id, nom, slug, schema_name, actif
    FROM tenant
    WHERE slug = $1
  `, [testTenantData.slug]);
  
  if (tenantRecord.rows.length === 0) {
    console.log('❌ Enregistrement non trouvé dans la table tenant');
  } else {
    const record = tenantRecord.rows[0];
    console.log('✅ Enregistrement trouvé:');
    console.log(`   ID: ${record.id}`);
    console.log(`   Nom: ${record.nom}`);
    console.log(`   Slug: ${record.slug}`);
    console.log(`   Schéma: ${record.schema_name}`);
    console.log(`   Actif: ${record.actif}`);
  }
  console.log('');

  // Étape 7: Nettoyer (optionnel)
  console.log('🧹 ÉTAPE 7: Nettoyage');
  console.log('─────────────────────────────────────────');
  console.log('Voulez-vous supprimer le tenant de test ?');
  console.log('(Exécutez manuellement si nécessaire)');
  console.log(`DELETE FROM tenant WHERE slug = '${testTenantData.slug}';`);
  console.log(`DROP SCHEMA IF EXISTS tenant_${testTenantData.slug.replace(/-/g, '_')} CASCADE;`);
  console.log('');

  await client.end();

  // Résumé final
  console.log('🎉 ========================================');
  console.log('🎉 RÉSUMÉ DU TEST');
  console.log('🎉 ========================================');
  console.log(`✅ Backend: Accessible`);
  console.log(`✅ Authentification: Réussie`);
  console.log(`${createdTenant ? '✅' : '❌'} Création API: ${createdTenant ? 'Réussie' : 'Échouée'}`);
  console.log(`${newSchemas.length > 0 ? '✅' : '❌'} Schéma PostgreSQL: ${newSchemas.length > 0 ? 'Créé' : 'Non créé'}`);
  console.log('🎉 ========================================\n');
}

testApiTenantCreation().catch(console.error);

// Made with Bob
