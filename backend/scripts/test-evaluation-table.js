const { Client } = require('pg');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
};

async function testEvaluationTable() {
  const client = new Client(config);

  try {
    console.log('🔍 Test de la table evaluation_personnel\n');
    await client.connect();
    console.log('✓ Connexion établie\n');

    // Récupérer les tenants
    const tenantsResult = await client.query(`
      SELECT id, nom, schema_name FROM public.tenant WHERE actif = true
    `);

    for (const tenant of tenantsResult.rows) {
      console.log('============================================================');
      console.log(`🏢 Tenant: ${tenant.nom}`);
      console.log(`📂 Schéma: ${tenant.schema_name}`);
      console.log('============================================================\n');

      // Définir le search_path
      await client.query(`SET search_path TO "${tenant.schema_name}", public`);

      // Test 1: Vérifier si la table existe
      console.log('Test 1: Vérification existence table...');
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = $1 AND table_name = 'evaluation_personnel'
        ) as exists
      `, [tenant.schema_name]);
      
      if (tableCheck.rows[0].exists) {
        console.log('✅ Table evaluation_personnel existe\n');
      } else {
        console.log('❌ Table evaluation_personnel N\'EXISTE PAS\n');
        continue;
      }

      // Test 2: Vérifier les colonnes
      console.log('Test 2: Liste des colonnes...');
      const columnsResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = $1 AND table_name = 'evaluation_personnel'
        ORDER BY ordinal_position
      `, [tenant.schema_name]);
      
      console.log(`Colonnes trouvées (${columnsResult.rows.length}):`);
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})`);
      });
      console.log('');

      // Test 3: Compter les enregistrements
      console.log('Test 3: Comptage des enregistrements...');
      const countResult = await client.query(`SELECT COUNT(*) as count FROM evaluation_personnel`);
      console.log(`✅ ${countResult.rows[0].count} enregistrement(s)\n`);

      // Test 4: Tester la requête du service
      console.log('Test 4: Test de la requête du service...');
      try {
        const testQuery = `
          SELECT 
            ep.*,
            u.nom as utilisateur_nom,
            u.prenom as utilisateur_prenom,
            ev.nom as evaluateur_nom,
            ev.prenom as evaluateur_prenom
          FROM evaluation_personnel ep
          LEFT JOIN utilisateur u ON u.id = ep.utilisateur_id
          LEFT JOIN utilisateur ev ON ev.id = ep.evaluateur_id
          WHERE 1=1
          ORDER BY ep.date_evaluation DESC
        `;
        const result = await client.query(testQuery);
        console.log(`✅ Requête réussie! ${result.rows.length} résultat(s)\n`);
      } catch (error) {
        console.log(`❌ Erreur requête: ${error.message}\n`);
        console.log('Stack:', error.stack, '\n');
      }

      console.log('');
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('✓ Connexion fermée');
  }
}

testEvaluationTable();

// Made with Bob
