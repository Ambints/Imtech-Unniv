const { Client } = require('pg');

async function linkSallesToBatiments() {
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
    
    // Get batiments
    const batiments = await client.query(`SELECT id, nom, code FROM ${schema}.batiment ORDER BY code`);
    console.log('📋 Bâtiments disponibles:');
    batiments.rows.forEach((b, i) => {
      console.log(`  ${i + 1}. ${b.nom} (${b.code}) - ID: ${b.id}`);
    });
    
    const blocA = batiments.rows.find(b => b.code === 'BLOCA');
    const blocB = batiments.rows.find(b => b.code === 'BLOCB');
    const amphi = batiments.rows.find(b => b.code === 'AMPHI');
    
    console.log('\n📝 Mise à jour des salles avec leurs bâtiments...\n');
    
    // Update existing salles to link them to batiments
    const updates = [
      // Bloc A - Sciences
      { code: 'A101', batiment_id: blocA?.id, nom: 'Salle A101' },
      { code: 'A102', batiment_id: blocA?.id, nom: 'Salle A102' },
      { code: 'A103', batiment_id: blocA?.id, nom: 'Salle A103' },
      { code: 'LAB-INFO1', batiment_id: blocA?.id, nom: 'Labo Informatique 1' },
      { code: 'LAB-INFO2', batiment_id: blocA?.id, nom: 'Labo Informatique 2' },
      { code: 'LAB-CHIM', batiment_id: blocA?.id, nom: 'Laboratoire Chimie' },
      { code: 'LAB-PHYS', batiment_id: blocA?.id, nom: 'Laboratoire Physique' },
      
      // Bloc B - Administration
      { code: 'B201', batiment_id: blocB?.id, nom: 'Salle B201' },
      { code: 'B202', batiment_id: blocB?.id, nom: 'Salle B202' },
      { code: 'REUNION1', batiment_id: blocB?.id, nom: 'Salle de Réunion 1' },
      { code: 'REUNION2', batiment_id: blocB?.id, nom: 'Salle de Réunion 2' },
      { code: 'BIBLIO', batiment_id: blocB?.id, nom: 'Bibliothèque' },
      
      // Amphithéâtre Central
      { code: 'AMPHI1', batiment_id: amphi?.id, nom: 'Amphithéâtre 1' },
      { code: 'AMPHI2', batiment_id: amphi?.id, nom: 'Amphithéâtre 2' },
    ];
    
    let updated = 0;
    let notFound = 0;
    
    for (const update of updates) {
      if (!update.batiment_id) {
        console.log(`⚠️  Bâtiment non trouvé pour ${update.code}`);
        notFound++;
        continue;
      }
      
      const result = await client.query(
        `UPDATE ${schema}.salle 
         SET batiment_id = $1 
         WHERE code = $2
         RETURNING id, nom, code`,
        [update.batiment_id, update.code]
      );
      
      if (result.rows.length > 0) {
        console.log(`✅ ${update.nom} (${update.code}) → lié au bâtiment`);
        updated++;
      } else {
        console.log(`⏭️  Salle ${update.code} non trouvée`);
        notFound++;
      }
    }
    
    console.log(`\n📊 Résumé:`);
    console.log(`   - Salles mises à jour: ${updated}`);
    console.log(`   - Salles non trouvées: ${notFound}`);
    
    // Show salles by batiment
    console.log('\n📋 Salles par bâtiment:\n');
    
    for (const batiment of batiments.rows) {
      const salles = await client.query(
        `SELECT nom, code, capacite, type_salle, etage 
         FROM ${schema}.salle 
         WHERE batiment_id = $1 
         ORDER BY etage, code`,
        [batiment.id]
      );
      
      console.log(`${batiment.nom} (${batiment.code}):`);
      if (salles.rows.length === 0) {
        console.log('  (Aucune salle)');
      } else {
        salles.rows.forEach(s => {
          console.log(`  - ${s.nom} (${s.code}): ${s.capacite} places, ${s.type_salle}, étage ${s.etage}`);
        });
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

linkSallesToBatiments();

// Made with Bob
