const { Client } = require('pg');

async function checkUserEnseignantLink() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'imtech_university',
    user: 'postgres',
    password: 'root'
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    // Set schema
    await client.query('SET search_path TO tenant_test');

    // Check user-enseignant relationship
    const result = await client.query(`
      SELECT 
        u.id as user_id,
        u.email,
        u.role,
        e.id as enseignant_id,
        e.utilisateur_id,
        e.nom,
        e.prenom
      FROM users u
      LEFT JOIN enseignant e ON e.utilisateur_id = u.id
      WHERE u.role = 'enseignant'
      LIMIT 5
    `);

    console.log('User-Enseignant Relationship:');
    console.log('==============================\n');
    console.log(JSON.stringify(result.rows, null, 2));

    // Check if there are affectations for these enseignants
    if (result.rows.length > 0 && result.rows[0].enseignant_id) {
      const affectations = await client.query(`
        SELECT 
          ac.id,
          ac.enseignant_id,
          e.nom,
          e.prenom,
          e.utilisateur_id,
          ue.code as ue_code,
          ue.libelle as ue_libelle
        FROM affectation_cours ac
        JOIN enseignant e ON e.id = ac.enseignant_id
        LEFT JOIN unite_enseignement ue ON ue.id = ac.ue_id
        WHERE ac.enseignant_id = $1
        LIMIT 3
      `, [result.rows[0].enseignant_id]);

      console.log('\n\nAffectations for first enseignant:');
      console.log('===================================\n');
      console.log(JSON.stringify(affectations.rows, null, 2));
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUserEnseignantLink();

// Made with Bob
