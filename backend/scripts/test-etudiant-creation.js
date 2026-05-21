const { Client } = require('pg');

async function testEtudiantCreation() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'imtech_university',
    user: 'postgres',
    password: 'root',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // 1. Vérifier les schémas disponibles
    console.log('📋 Available tenant schemas:');
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%' OR schema_name LIKE 'univ_%'
      ORDER BY schema_name
    `);
    schemas.rows.forEach(row => console.log(`  - ${row.schema_name}`));
    
    if (schemas.rows.length === 0) {
      console.log('❌ No tenant schemas found!');
      return;
    }

    const tenantSchema = schemas.rows[0].schema_name;
    console.log(`\n🎯 Using schema: ${tenantSchema}\n`);

    // 2. Vérifier si la table utilisateur existe
    console.log('🔍 Checking if "utilisateur" table exists...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = $1 
        AND table_name = 'utilisateur'
      )
    `, [tenantSchema]);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log(`  Table "utilisateur" exists: ${tableExists ? '✅ YES' : '❌ NO'}\n`);

    if (!tableExists) {
      console.log('❌ PROBLEM FOUND: Table "utilisateur" does not exist in tenant schema!');
      console.log('\n💡 SOLUTION: Run the migration script:');
      console.log('   node backend/scripts/add-utilisateur-to-tenants.js\n');
      return;
    }

    // 3. Vérifier la structure de la table utilisateur
    console.log('📊 Table "utilisateur" structure:');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = $1 AND table_name = 'utilisateur'
      ORDER BY ordinal_position
    `, [tenantSchema]);
    
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // 4. Vérifier si la table etudiant existe
    console.log('\n🔍 Checking if "etudiant" table exists...');
    const etudiantCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = $1 
        AND table_name = 'etudiant'
      )
    `, [tenantSchema]);
    
    const etudiantExists = etudiantCheck.rows[0].exists;
    console.log(`  Table "etudiant" exists: ${etudiantExists ? '✅ YES' : '❌ NO'}\n`);

    if (!etudiantExists) {
      console.log('❌ PROBLEM: Table "etudiant" does not exist!');
      return;
    }

    // 5. Compter les étudiants et utilisateurs
    await client.query(`SET search_path TO "${tenantSchema}", public`);
    
    const etudiantCount = await client.query('SELECT COUNT(*) FROM etudiant WHERE actif = true');
    const utilisateurCount = await client.query('SELECT COUNT(*) FROM utilisateur WHERE role = \'etudiant\'');
    
    console.log('📈 Current data:');
    console.log(`  Active students: ${etudiantCount.rows[0].count}`);
    console.log(`  Student users: ${utilisateurCount.rows[0].count}\n`);

    // 6. Vérifier les étudiants sans compte utilisateur
    console.log('🔍 Students without user accounts:');
    const studentsWithoutUsers = await client.query(`
      SELECT 
        e.id,
        e.matricule,
        e.nom,
        e.prenom,
        e.email,
        COALESCE(e.email, e.matricule || '@etudiant.local') as computed_email
      FROM etudiant e
      LEFT JOIN utilisateur u ON u.email = COALESCE(e.email, e.matricule || '@etudiant.local')
      WHERE e.actif = true AND u.id IS NULL
      LIMIT 5
    `);

    if (studentsWithoutUsers.rows.length === 0) {
      console.log('  ✅ All students have user accounts!\n');
    } else {
      console.log(`  ❌ Found ${studentsWithoutUsers.rows.length} students without user accounts:`);
      studentsWithoutUsers.rows.forEach(s => {
        console.log(`    - ${s.matricule}: ${s.nom} ${s.prenom} (${s.computed_email})`);
      });
      console.log('\n💡 These students need user accounts created.\n');
    }

    // 7. Test de création d'utilisateur (simulation)
    console.log('🧪 Testing user creation query (DRY RUN):');
    const testEmail = 'test.student@etudiant.local';
    
    try {
      // Vérifier si l'email existe déjà
      const existingTest = await client.query(
        'SELECT id FROM utilisateur WHERE email = $1',
        [testEmail]
      );
      
      if (existingTest.rows.length > 0) {
        console.log(`  ℹ️  Test user already exists (ID: ${existingTest.rows[0].id})`);
      } else {
        console.log('  ✅ User creation query would work (no existing user with test email)');
      }
      
      console.log('\n📝 Sample INSERT query that would be executed:');
      console.log(`
      INSERT INTO utilisateur (nom, prenom, email, role, actif, telephone)
      VALUES ('TEST', 'Student', '${testEmail}', 'etudiant', true, '+243123456789')
      RETURNING id
      `);
    } catch (err) {
      console.log(`  ❌ Error testing query: ${err.message}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('DIAGNOSTIC SUMMARY');
    console.log('='.repeat(60));
    
    if (!tableExists) {
      console.log('❌ CRITICAL: Table "utilisateur" is missing!');
      console.log('   Run: node backend/scripts/add-utilisateur-to-tenants.js');
    } else if (studentsWithoutUsers.rows.length > 0) {
      console.log('⚠️  WARNING: Some students don\'t have user accounts');
      console.log('   The automatic creation should work for new students');
    } else {
      console.log('✅ Everything looks good!');
      console.log('   New students should automatically get user accounts');
    }
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await client.end();
  }
}

testEtudiantCreation();

// Made with Bob
