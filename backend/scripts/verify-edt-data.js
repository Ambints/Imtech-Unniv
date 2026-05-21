const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007',
});

async function verifyEDTData() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    await client.query('SET search_path TO tenant_test');

    const result = await client.query(`
      SELECT 
        e.date_seance, 
        e.heure_debut, 
        e.heure_fin, 
        s.nom as salle, 
        ue.intitule as ue, 
        ens.nom || ' ' || ens.prenom as enseignant, 
        e.type_seance,
        p.nom as parcours
      FROM emploi_du_temps e 
      LEFT JOIN salle s ON s.id = e.salle_id 
      LEFT JOIN affectation_cours ac ON ac.id = e.affectation_id 
      LEFT JOIN unite_enseignement ue ON ue.id = ac.ue_id 
      LEFT JOIN enseignant ens ON ens.id = ac.enseignant_id
      LEFT JOIN parcours p ON p.id = ue.parcours_id
      ORDER BY e.date_seance, e.heure_debut 
      LIMIT 10
    `);

    console.log('📅 Emploi du temps créé (10 premières séances):');
    console.log('='.repeat(120));
    result.rows.forEach(row => {
      const date = row.date_seance.toISOString().split('T')[0];
      console.log(`${date} ${row.heure_debut}-${row.heure_fin} | ${row.salle?.padEnd(20)} | ${row.ue} (${row.type_seance}) | ${row.enseignant} | ${row.parcours || 'N/A'}`);
    });
    console.log('='.repeat(120));
    console.log(`\n✅ Total: ${result.rows.length} séances affichées\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyEDTData();

// Made with Bob
