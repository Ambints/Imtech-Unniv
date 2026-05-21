const { Client } = require('pg');

async function addSampleSalles() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '2007',
    database: 'Imtech_SaaS'
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const schema = 'tenant_test';
    
    console.log(`📝 Adding sample salles to ${schema}...\n`);

    // Check current count
    const beforeCount = await client.query(`SELECT COUNT(*) as count FROM ${schema}.salle`);
    console.log(`Current number of salles: ${beforeCount.rows[0].count}`);

    // Insert sample salles
    const salles = [
      { nom: 'Salle A101', code: 'A101', capacite: 30, type_salle: 'cours', etage: 1 },
      { nom: 'Salle A102', code: 'A102', capacite: 30, type_salle: 'cours', etage: 1 },
      { nom: 'Salle A103', code: 'A103', capacite: 35, type_salle: 'cours', etage: 1 },
      { nom: 'Salle B201', code: 'B201', capacite: 40, type_salle: 'cours', etage: 2 },
      { nom: 'Salle B202', code: 'B202', capacite: 40, type_salle: 'cours', etage: 2 },
      { nom: 'Amphithéâtre 1', code: 'AMPHI1', capacite: 150, type_salle: 'amphitheatre', etage: 0 },
      { nom: 'Amphithéâtre 2', code: 'AMPHI2', capacite: 200, type_salle: 'amphitheatre', etage: 0 },
      { nom: 'Labo Informatique 1', code: 'LAB-INFO1', capacite: 25, type_salle: 'salle_info', etage: 2 },
      { nom: 'Labo Informatique 2', code: 'LAB-INFO2', capacite: 25, type_salle: 'salle_info', etage: 2 },
      { nom: 'Laboratoire Chimie', code: 'LAB-CHIM', capacite: 20, type_salle: 'laboratoire', etage: 3 },
      { nom: 'Laboratoire Physique', code: 'LAB-PHYS', capacite: 20, type_salle: 'laboratoire', etage: 3 },
      { nom: 'Salle de Réunion 1', code: 'REUNION1', capacite: 15, type_salle: 'salle_reunion', etage: 1 },
      { nom: 'Salle de Réunion 2', code: 'REUNION2', capacite: 20, type_salle: 'salle_reunion', etage: 2 },
      { nom: 'Bibliothèque', code: 'BIBLIO', capacite: 50, type_salle: 'bibliotheque', etage: 1 }
    ];

    let inserted = 0;
    let skipped = 0;

    for (const salle of salles) {
      try {
        // Check if salle with this code already exists
        const existing = await client.query(
          `SELECT id FROM ${schema}.salle WHERE code = $1`,
          [salle.code]
        );

        if (existing.rows.length > 0) {
          console.log(`⏭️  Skipped: ${salle.nom} (${salle.code}) - already exists`);
          skipped++;
        } else {
          await client.query(
            `INSERT INTO ${schema}.salle (nom, code, capacite, type_salle, etage, disponible, equipements)
             VALUES ($1, $2, $3, $4, $5, true, '{}'::jsonb)`,
            [salle.nom, salle.code, salle.capacite, salle.type_salle, salle.etage]
          );
          console.log(`✅ Added: ${salle.nom} (${salle.code}) - ${salle.capacite} places`);
          inserted++;
        }
      } catch (error) {
        console.error(`❌ Error adding ${salle.nom}:`, error.message);
      }
    }

    // Check final count
    const afterCount = await client.query(`SELECT COUNT(*) as count FROM ${schema}.salle`);
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Inserted: ${inserted} salles`);
    console.log(`   - Skipped: ${skipped} salles (already existed)`);
    console.log(`   - Total salles in database: ${afterCount.rows[0].count}`);

    // Show all salles
    console.log(`\n📋 All salles in ${schema}:`);
    const allSalles = await client.query(
      `SELECT nom, code, capacite, type_salle, etage, disponible 
       FROM ${schema}.salle 
       ORDER BY type_salle, nom`
    );
    
    allSalles.rows.forEach(s => {
      const status = s.disponible ? '✅' : '❌';
      console.log(`   ${status} ${s.nom} (${s.code}): ${s.capacite} places, ${s.type_salle}, étage ${s.etage}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

addSampleSalles();

// Made with Bob
