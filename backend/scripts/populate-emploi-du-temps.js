const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007',
});

async function populateEmploiDuTemps() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const tenantSchema = 'tenant_test';
    await client.query(`SET search_path TO ${tenantSchema}`);
    console.log(`✅ Using schema: ${tenantSchema}\n`);

    // Récupérer les IDs nécessaires
    const anneeAcademique = await client.query(`SELECT id FROM ${tenantSchema}.annee_academique WHERE active = true LIMIT 1`);
    if (anneeAcademique.rows.length === 0) {
      console.log('❌ Aucune année académique active trouvée');
      return;
    }
    const anneeAcademiqueId = anneeAcademique.rows[0].id;
    console.log(`✅ Année académique ID: ${anneeAcademiqueId}`);

    // Récupérer des salles
    const salles = await client.query(`SELECT id, nom FROM ${tenantSchema}.salle LIMIT 5`);
    console.log(`✅ Found ${salles.rows.length} salles`);

    // Récupérer des affectations de cours
    const affectations = await client.query(`
      SELECT ac.id
      FROM ${tenantSchema}.affectation_cours ac
      LIMIT 5
    `);
    console.log(`✅ Found ${affectations.rows.length} affectations\n`);

    if (affectations.rows.length === 0) {
      console.log('⚠️  Aucune affectation de cours trouvée. Création de séances sans affectation...');
    }

    // Créer des séances pour la semaine en cours
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi

    console.log('--- Adding Emploi du Temps ---');
    
    const horaires = [
      { debut: '08:00:00', fin: '10:00:00' },
      { debut: '10:15:00', fin: '12:15:00' },
      { debut: '14:00:00', fin: '16:00:00' },
      { debut: '16:15:00', fin: '18:15:00' },
    ];

    const typeSeances = ['CM', 'TD', 'TP'];
    let count = 0;

    // Créer des séances pour chaque jour de la semaine
    for (let jour = 0; jour < 5; jour++) { // Lundi à Vendredi
      const dateSeance = new Date(startOfWeek);
      dateSeance.setDate(startOfWeek.getDate() + jour);
      const dateStr = dateSeance.toISOString().split('T')[0];

      // 2-3 séances par jour
      const nbSeances = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < nbSeances && i < horaires.length; i++) {
        const salle = salles.rows[count % salles.rows.length];
        const horaire = horaires[i];
        const typeSeance = typeSeances[count % typeSeances.length];
        const affectationId = affectations.rows.length > 0 ? affectations.rows[count % affectations.rows.length].id : null;

        try {
          await client.query(`
            INSERT INTO ${tenantSchema}.emploi_du_temps
            (annee_academique_id, affectation_id, salle_id, date_seance, heure_debut, heure_fin, type_seance, statut)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'planifie')
          `, [anneeAcademiqueId, affectationId, salle.id, dateStr, horaire.debut, horaire.fin, typeSeance]);

          console.log(`✅ ${dateStr} ${horaire.debut}-${horaire.fin}: ${typeSeance} - ${salle.nom}`);
          count++;
        } catch (error) {
          console.log(`⚠️  Erreur pour ${dateStr}: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ ${count} séances d'emploi du temps créées!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

populateEmploiDuTemps();

// Made with Bob
