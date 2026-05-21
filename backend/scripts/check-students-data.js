const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'imtech_university',
  user: 'postgres',
  password: 'root'
});

async function checkStudents() {
  try {
    await client.connect();
    console.log('✅ Connected to database');
    
    // Set schema to ispm tenant
    await client.query('SET search_path TO ispm');
    console.log('✅ Schema set to ispm');
    
    // Check if etudiant table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'ispm' 
        AND table_name = 'etudiant'
      );
    `);
    console.log('Table etudiant exists:', tableCheck.rows[0].exists);
    
    // Count students
    const countResult = await client.query('SELECT COUNT(*) FROM etudiant');
    console.log('Total students in etudiant table:', countResult.rows[0].count);
    
    // Check active students
    const activeCount = await client.query('SELECT COUNT(*) FROM etudiant WHERE actif = true');
    console.log('Active students (actif=true):', activeCount.rows[0].count);
    
    // Get sample students
    const sampleStudents = await client.query('SELECT id, matricule, nom, prenom, actif FROM etudiant LIMIT 5');
    console.log('\nSample students:');
    sampleStudents.rows.forEach(s => {
      console.log(`  - ${s.matricule}: ${s.nom} ${s.prenom} (actif: ${s.actif})`);
    });
    
    // Get parcours ID
    const parcoursResult = await client.query(`SELECT id, code, nom FROM parcours LIMIT 5`);
    console.log('\nAvailable parcours:');
    parcoursResult.rows.forEach(p => console.log(`  - ${p.code}: ${p.nom} (ID: ${p.id})`));
    
    // Check inscriptions
    const inscriptionCount = await client.query('SELECT COUNT(*) FROM inscription');
    console.log('\nTotal inscriptions:', inscriptionCount.rows[0].count);
    
    // Check students with inscriptions for a specific parcours
    if (parcoursResult.rows.length > 0) {
      const parcoursId = parcoursResult.rows[0].id;
      console.log(`\nChecking students for parcours: ${parcoursResult.rows[0].code} (${parcoursId})`);
      
      const studentsInParcours = await client.query(`
        SELECT e.id, e.matricule, e.nom, e.prenom, e.actif
        FROM etudiant e
        INNER JOIN inscription i ON e.id = i.etudiant_id
        WHERE i.parcours_id = $1
        LIMIT 10
      `, [parcoursId]);
      console.log(`Students in parcours ${parcoursResult.rows[0].code}:`, studentsInParcours.rows.length);
      studentsInParcours.rows.forEach(s => {
        console.log(`  - ${s.matricule}: ${s.nom} ${s.prenom} (actif: ${s.actif})`);
      });
      
      // Check what the API query would return
      console.log('\n--- Testing API Query ---');
      const apiQuery = await client.query(`
        SELECT e.* FROM etudiant e
        INNER JOIN inscription i ON e.id = i.etudiant_id
        WHERE i.parcours_id = $1 AND e.actif = true
      `, [parcoursId]);
      console.log(`API would return ${apiQuery.rows.length} students`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
  }
}

checkStudents();

// Made with Bob
