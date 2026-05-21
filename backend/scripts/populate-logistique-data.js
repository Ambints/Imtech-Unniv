const { Client } = require('pg');

async function populateLogistiqueData() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'Imtech_SaaS',
    user: 'postgres',
    password: '2007',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const tenantId = '324746c0-67d0-4d87-b9d6-1af7d149599b';
    
    // Get tenant schema
    const tenantResult = await client.query(
      'SELECT schema_name FROM tenant WHERE id = $1',
      [tenantId]
    );
    
    if (tenantResult.rows.length === 0) {
      console.log('❌ Tenant not found');
      return;
    }

    const schema = tenantResult.rows[0].schema_name;
    console.log(`✅ Using schema: ${schema}`);

    // Set search path
    await client.query(`SET search_path TO ${schema}, public`);

    // Get a user ID for created_by fields
    const userResult = await client.query('SELECT id FROM utilisateur LIMIT 1');
    const userId = userResult.rows[0]?.id;

    if (!userId) {
      console.log('❌ No user found in database');
      return;
    }

    console.log(`✅ Using user ID: ${userId}`);

    // 1. Add stock items
    console.log('\n--- Adding Stock Items ---');
    const stockItems = [
      { reference: 'PROD-001', libelle: 'Papier A4', categorie: 'bureau', unite: 'ramette', quantite: 50, seuil: 20, prix: 3.50, fournisseur: 'Bureau Plus' },
      { reference: 'PROD-002', libelle: 'Marqueurs', categorie: 'bureau', unite: 'boîte', quantite: 15, seuil: 10, prix: 8.00, fournisseur: 'Bureau Plus' },
      { reference: 'PROD-003', libelle: 'Cahiers', categorie: 'pedagogique', unite: 'unité', quantite: 5, seuil: 15, prix: 2.50, fournisseur: 'Papeterie Centrale' },
      { reference: 'CLEAN-001', libelle: 'Détergent', categorie: 'nettoyage', unite: 'litre', quantite: 25, seuil: 10, prix: 5.00, fournisseur: 'CleanPro' },
      { reference: 'CLEAN-002', libelle: 'Balais', categorie: 'nettoyage', unite: 'unité', quantite: 8, seuil: 5, prix: 12.00, fournisseur: 'CleanPro' },
      { reference: 'INFO-001', libelle: 'Câbles HDMI', categorie: 'informatique', unite: 'unité', quantite: 12, seuil: 8, prix: 15.00, fournisseur: 'TechStore' },
      { reference: 'ENERGY-001', libelle: 'Ampoules LED', categorie: 'energie', unite: 'unité', quantite: 30, seuil: 15, prix: 8.50, fournisseur: 'ElectroPro' },
    ];

    for (const item of stockItems) {
      try {
        await client.query(
          `INSERT INTO stock (reference, libelle, categorie, unite, quantite_stock, seuil_alerte, prix_unitaire, fournisseur, emplacement)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (reference) DO NOTHING`,
          [item.reference, item.libelle, item.categorie, item.unite, item.quantite, item.seuil, item.prix, item.fournisseur, 'Magasin Principal']
        );
        console.log(`✅ Added stock: ${item.libelle}`);
      } catch (err) {
        console.log(`⚠️  Stock ${item.libelle}: ${err.message}`);
      }
    }

    // 2. Add tickets
    console.log('\n--- Adding Maintenance Tickets ---');
    const salles = await client.query('SELECT id FROM salle LIMIT 3');
    const batiments = await client.query('SELECT id FROM batiment LIMIT 1');

    if (salles.rows.length > 0) {
      const tickets = [
        { titre: 'Réparation climatisation', type: 'urgence', priorite: 'urgente', salle_id: salles.rows[0].id },
        { titre: 'Changement ampoules', type: 'preventive', priorite: 'normale', salle_id: salles.rows[1]?.id },
        { titre: 'Fuite d\'eau', type: 'urgence', priorite: 'haute', batiment_id: batiments.rows[0]?.id },
        { titre: 'Vérification extincteurs', type: 'preventive', priorite: 'normale', batiment_id: batiments.rows[0]?.id },
        { titre: 'Réparation porte', type: 'curative', priorite: 'basse', salle_id: salles.rows[2]?.id },
      ];

      for (const ticket of tickets) {
        try {
          await client.query(
            `INSERT INTO ticket_maintenance (titre, description, type_maintenance, priorite, statut, signale_par, salle_id, batiment_id, date_signalement)
             VALUES ($1, $2, $3, $4, 'ouvert', $5, $6, $7, NOW())`,
            [ticket.titre, `Description: ${ticket.titre}`, ticket.type, ticket.priorite, userId, ticket.salle_id, ticket.batiment_id]
          );
          console.log(`✅ Added ticket: ${ticket.titre}`);
        } catch (err) {
          console.log(`⚠️  Ticket ${ticket.titre}: ${err.message}`);
        }
      }
    }

    // 3. Add planning entretien
    console.log('\n--- Adding Planning Entretien ---');
    if (salles.rows.length > 0) {
      const plannings = [
        { zone: 'Salles de cours', type: 'quotidien', jour: 1, heure: '08:00', duree: 60, salle_id: salles.rows[0].id },
        { zone: 'Couloirs', type: 'quotidien', jour: 2, heure: '07:00', duree: 90, batiment_id: batiments.rows[0]?.id },
        { zone: 'Toilettes', type: 'quotidien', jour: 3, heure: '09:00', duree: 45, batiment_id: batiments.rows[0]?.id },
      ];

      for (const planning of plannings) {
        try {
          await client.query(
            `INSERT INTO planning_entretien (zone, type_nettoyage, jour_semaine, heure_debut, duree_minutes, actif, salle_id, batiment_id, responsable_id)
             VALUES ($1, $2, $3, $4, $5, true, $6, $7, $8)`,
            [planning.zone, planning.type, planning.jour, planning.heure, planning.duree, planning.salle_id, planning.batiment_id, userId]
          );
          console.log(`✅ Added planning: ${planning.zone} - ${planning.type}`);
        } catch (err) {
          console.log(`⚠️  Planning ${planning.zone}: ${err.message}`);
        }
      }
    }

    // 4. Add rapports entretien
    console.log('\n--- Adding Rapports Entretien ---');
    const planningIds = await client.query('SELECT id FROM planning_entretien LIMIT 2');
    
    if (planningIds.rows.length > 0) {
      const statuts = ['realise', 'partiel'];
      for (let i = 0; i < planningIds.rows.length; i++) {
        const planning = planningIds.rows[i];
        try {
          await client.query(
            `INSERT INTO rapport_entretien (planning_id, realise_par, date_realisation, heure_debut, heure_fin, statut, observations)
             VALUES ($1, $2, CURRENT_DATE - ${i}, '08:00', '09:00', $3, 'Nettoyage effectué correctement')`,
            [planning.id, userId, statuts[i]]
          );
          console.log(`✅ Added rapport for planning ${planning.id}`);
        } catch (err) {
          console.log(`⚠️  Rapport: ${err.message}`);
        }
      }
    }

    // 5. Add reservations
    console.log('\n--- Adding Reservations ---');
    if (salles.rows.length > 0) {
      const reservations = [
        { titre: 'Réunion pédagogique', date: '2026-05-25', debut: '14:00', fin: '16:00', statut: 'en_attente', salle_id: salles.rows[0].id },
        { titre: 'Conférence', date: '2026-05-26', debut: '10:00', fin: '12:00', statut: 'approuvee', salle_id: salles.rows[1]?.id },
      ];

      for (const res of reservations) {
        try {
          await client.query(
            `INSERT INTO reservation_salle (salle_id, titre, description, date_reservation, heure_debut, heure_fin, statut, demande_par)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [res.salle_id, res.titre, `Description: ${res.titre}`, res.date, res.debut, res.fin, res.statut, userId]
          );
          console.log(`✅ Added reservation: ${res.titre}`);
        } catch (err) {
          console.log(`⚠️  Reservation ${res.titre}: ${err.message}`);
        }
      }
    }

    // 6. Add demandes ressource
    console.log('\n--- Adding Demandes Ressource ---');
    const demandes = [
      { type: 'materiel', date: '2026-05-28', debut: '09:00', fin: '11:00', motif: 'Besoin de projecteur', participants: 30 },
      { type: 'salle', date: '2026-05-29', debut: '14:00', fin: '17:00', motif: 'Examen blanc', participants: 50 },
    ];

    for (const demande of demandes) {
      try {
        await client.query(
          `INSERT INTO demande_ressource (type_ressource, date_souhaitee, heure_debut, heure_fin, motif, nb_participants, statut, demandeur_id)
           VALUES ($1, $2, $3, $4, $5, $6, 'soumise', $7)`,
          [demande.type, demande.date, demande.debut, demande.fin, demande.motif, demande.participants, userId]
        );
        console.log(`✅ Added demande: ${demande.motif}`);
      } catch (err) {
        console.log(`⚠️  Demande ${demande.motif}: ${err.message}`);
      }
    }

    console.log('\n✅ All logistique data populated successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

populateLogistiqueData();

// Made with Bob
