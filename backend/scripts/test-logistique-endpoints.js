const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007',
});

async function testLogistiqueEndpoints() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const tenantSchema = 'tenant_test';
    await client.query(`SET search_path TO ${tenantSchema}`);
    console.log(`✅ Using schema: ${tenantSchema}\n`);

    // Test 1: Dashboard data
    console.log('--- Testing Dashboard Data ---');
    const dashboard = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM ${tenantSchema}.ticket_maintenance WHERE statut IN ('ouvert', 'en_cours')) as tickets_ouverts,
        (SELECT COUNT(*) FROM ${tenantSchema}.stock WHERE quantite_stock <= seuil_alerte) as articles_alerte,
        (SELECT COUNT(*) FROM ${tenantSchema}.salle WHERE disponible = true) as salles_disponibles,
        (SELECT COUNT(*) FROM ${tenantSchema}.batiment WHERE actif = true) as total_batiments
    `);
    console.log('Dashboard:', dashboard.rows[0]);

    // Test 2: Bâtiments
    console.log('\n--- Testing Bâtiments ---');
    const batiments = await client.query(`
      SELECT b.id, b.nom, b.code,
        COUNT(s.id)::int AS nb_salles
      FROM ${tenantSchema}.batiment b
      LEFT JOIN ${tenantSchema}.salle s ON s.batiment_id = b.id
      GROUP BY b.id
      ORDER BY b.nom
      LIMIT 3
    `);
    console.log(`Found ${batiments.rows.length} bâtiments:`);
    batiments.rows.forEach(b => console.log(`  - ${b.nom} (${b.code}): ${b.nb_salles} salles`));

    // Test 3: Salles
    console.log('\n--- Testing Salles ---');
    const salles = await client.query(`
      SELECT s.id, s.nom, s.code, s.capacite, s.type_salle, s.disponible,
        b.nom AS batiment_nom
      FROM ${tenantSchema}.salle s
      LEFT JOIN ${tenantSchema}.batiment b ON b.id = s.batiment_id
      ORDER BY s.nom
      LIMIT 5
    `);
    console.log(`Found ${salles.rows.length} salles:`);
    salles.rows.forEach(s => console.log(`  - ${s.nom} (${s.code}): ${s.capacite} places, ${s.type_salle}, ${s.disponible ? 'Disponible' : 'Indisponible'}`));

    // Test 4: Stock
    console.log('\n--- Testing Stock ---');
    const stock = await client.query(`
      SELECT id, reference, libelle, categorie, quantite_stock, seuil_alerte,
        CASE WHEN quantite_stock <= seuil_alerte THEN true ELSE false END AS en_alerte
      FROM ${tenantSchema}.stock
      ORDER BY categorie, libelle
    `);
    console.log(`Found ${stock.rows.length} articles in stock:`);
    stock.rows.forEach(s => console.log(`  - ${s.libelle} (${s.reference}): ${s.quantite_stock} ${s.categorie} ${s.en_alerte ? '⚠️ ALERTE' : '✅'}`));

    // Test 5: Tickets
    console.log('\n--- Testing Tickets ---');
    const tickets = await client.query(`
      SELECT t.id, t.titre, t.type_maintenance, t.priorite, t.statut,
        b.nom AS batiment_nom, s.nom AS salle_nom
      FROM ${tenantSchema}.ticket_maintenance t
      LEFT JOIN ${tenantSchema}.batiment b ON b.id = t.batiment_id
      LEFT JOIN ${tenantSchema}.salle s ON s.id = t.salle_id
      ORDER BY t.date_signalement DESC
    `);
    console.log(`Found ${tickets.rows.length} tickets:`);
    tickets.rows.forEach(t => console.log(`  - ${t.titre}: ${t.type_maintenance}, ${t.priorite}, ${t.statut}`));

    // Test 6: Planning Entretien
    console.log('\n--- Testing Planning Entretien ---');
    const planning = await client.query(`
      SELECT pe.id, pe.zone, pe.type_nettoyage, pe.jour_semaine, pe.heure_debut, pe.actif,
        s.nom AS salle_nom, b.nom AS batiment_nom
      FROM ${tenantSchema}.planning_entretien pe
      LEFT JOIN ${tenantSchema}.salle s ON s.id = pe.salle_id
      LEFT JOIN ${tenantSchema}.batiment b ON b.id = pe.batiment_id
      ORDER BY pe.jour_semaine, pe.heure_debut
    `);
    console.log(`Found ${planning.rows.length} planning entries:`);
    planning.rows.forEach(p => console.log(`  - ${p.zone}: ${p.type_nettoyage}, Jour ${p.jour_semaine}, ${p.heure_debut}, ${p.actif ? 'Actif' : 'Inactif'}`));

    // Test 7: Rapports Entretien
    console.log('\n--- Testing Rapports Entretien ---');
    const rapports = await client.query(`
      SELECT re.id, re.date_realisation, re.statut,
        pe.zone, pe.type_nettoyage
      FROM ${tenantSchema}.rapport_entretien re
      LEFT JOIN ${tenantSchema}.planning_entretien pe ON pe.id = re.planning_id
      ORDER BY re.date_realisation DESC
    `);
    console.log(`Found ${rapports.rows.length} rapports:`);
    rapports.rows.forEach(r => console.log(`  - ${r.zone} (${r.type_nettoyage}): ${r.date_realisation}, ${r.statut}`));

    // Test 8: Réservations
    console.log('\n--- Testing Réservations ---');
    const reservations = await client.query(`
      SELECT r.id, r.titre, r.date_reservation, r.heure_debut, r.heure_fin, r.statut,
        s.nom AS salle_nom
      FROM ${tenantSchema}.reservation_salle r
      JOIN ${tenantSchema}.salle s ON s.id = r.salle_id
      ORDER BY r.date_reservation DESC
    `);
    console.log(`Found ${reservations.rows.length} réservations:`);
    reservations.rows.forEach(r => console.log(`  - ${r.titre}: ${r.salle_nom}, ${r.date_reservation}, ${r.heure_debut}-${r.heure_fin}, ${r.statut}`));

    // Test 9: Demandes Ressource
    console.log('\n--- Testing Demandes Ressource ---');
    const demandes = await client.query(`
      SELECT dr.id, dr.type_ressource, dr.date_souhaitee, dr.statut, dr.motif
      FROM ${tenantSchema}.demande_ressource dr
      ORDER BY dr.date_souhaitee
    `);
    console.log(`Found ${demandes.rows.length} demandes ressource:`);
    demandes.rows.forEach(d => console.log(`  - ${d.type_ressource}: ${d.motif}, ${d.date_souhaitee}, ${d.statut}`));

    // Test 10: Mouvements Stock
    console.log('\n--- Testing Mouvements Stock ---');
    const mouvements = await client.query(`
      SELECT ms.id, ms.type_mouvement, ms.quantite, ms.motif,
        s.libelle AS article
      FROM ${tenantSchema}.mouvement_stock ms
      JOIN ${tenantSchema}.stock s ON s.id = ms.stock_id
      ORDER BY ms.date_mouvement DESC
      LIMIT 5
    `);
    console.log(`Found ${mouvements.rows.length} mouvements (last 5):`);
    mouvements.rows.forEach(m => console.log(`  - ${m.article}: ${m.type_mouvement} ${m.quantite}, ${m.motif}`));

    console.log('\n✅ All logistique data verified successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - ${batiments.rows.length} bâtiments`);
    console.log(`  - ${salles.rows.length} salles (showing first 5)`);
    console.log(`  - ${stock.rows.length} articles in stock`);
    console.log(`  - ${tickets.rows.length} tickets`);
    console.log(`  - ${planning.rows.length} planning entries`);
    console.log(`  - ${rapports.rows.length} rapports`);
    console.log(`  - ${reservations.rows.length} réservations`);
    console.log(`  - ${demandes.rows.length} demandes ressource`);
    console.log(`  - ${mouvements.rows.length} mouvements (last 5)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

testLogistiqueEndpoints();

// Made with Bob
