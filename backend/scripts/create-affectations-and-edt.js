const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007',
});

async function createAffectationsAndEDT() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const tenantSchema = 'tenant_test';
    await client.query(`SET search_path TO ${tenantSchema}`);
    console.log(`✅ Using schema: ${tenantSchema}\n`);

    // Récupérer année académique
    const anneeAcademique = await client.query(`SELECT id, libelle as nom FROM ${tenantSchema}.annee_academique WHERE active = true LIMIT 1`);
    if (anneeAcademique.rows.length === 0) {
      console.log('❌ Aucune année académique active');
      return;
    }
    const anneeAcademiqueId = anneeAcademique.rows[0].id;
    console.log(`✅ Année académique: ${anneeAcademique.rows[0].nom}`);

    // Récupérer parcours
    const parcours = await client.query(`SELECT id, nom FROM ${tenantSchema}.parcours LIMIT 3`);
    console.log(`✅ Found ${parcours.rows.length} parcours`);

    // Récupérer UEs
    const ues = await client.query(`SELECT id, intitule, parcours_id, enseignant_id FROM ${tenantSchema}.unite_enseignement LIMIT 10`);
    console.log(`✅ Found ${ues.rows.length} UEs`);

    // Récupérer enseignants
    const enseignants = await client.query(`SELECT id, nom, prenom FROM ${tenantSchema}.enseignant LIMIT 5`);
    console.log(`✅ Found ${enseignants.rows.length} enseignants`);

    // Récupérer salles
    const salles = await client.query(`SELECT id, nom FROM ${tenantSchema}.salle LIMIT 5`);
    console.log(`✅ Found ${salles.rows.length} salles\n`);

    if (ues.rows.length === 0 || enseignants.rows.length === 0) {
      console.log('❌ Pas assez de données (UEs ou enseignants)');
      return;
    }

    console.log('--- Creating Affectations ---');
    const affectations = [];
    
    for (let i = 0; i < Math.min(5, ues.rows.length); i++) {
      const ue = ues.rows[i];
      const enseignant = enseignants.rows[i % enseignants.rows.length];
      
      try {
        const result = await client.query(`
          INSERT INTO ${tenantSchema}.affectation_cours 
          (ue_id, enseignant_id, parcours_id, annee_academique_id, volume_cm, volume_td, volume_tp)
          VALUES ($1, $2, $3, $4, 20, 20, 10)
          RETURNING id
        `, [ue.id, enseignant.id, ue.parcours_id, anneeAcademiqueId]);
        
        affectations.push({
          id: result.rows[0].id,
          ue_intitule: ue.intitule,
          enseignant: `${enseignant.prenom} ${enseignant.nom}`
        });
        console.log(`✅ Affectation: ${ue.intitule} → ${enseignant.prenom} ${enseignant.nom}`);
      } catch (error) {
        console.log(`⚠️  Erreur affectation: ${error.message}`);
      }
    }

    if (affectations.length === 0) {
      console.log('❌ Aucune affectation créée');
      return;
    }

    console.log(`\n--- Creating Emploi du Temps (${affectations.length} affectations) ---`);
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi

    const horaires = [
      { debut: '08:00:00', fin: '10:00:00' },
      { debut: '10:15:00', fin: '12:15:00' },
      { debut: '14:00:00', fin: '16:00:00' },
      { debut: '16:15:00', fin: '18:15:00' },
    ];

    const typeSeances = ['CM', 'TD', 'TP'];
    let count = 0;

    // Créer des séances pour la semaine
    for (let jour = 0; jour < 5; jour++) {
      const dateSeance = new Date(startOfWeek);
      dateSeance.setDate(startOfWeek.getDate() + jour);
      const dateStr = dateSeance.toISOString().split('T')[0];

      const nbSeances = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < nbSeances && i < horaires.length; i++) {
        const affectation = affectations[count % affectations.length];
        const salle = salles.rows[count % salles.rows.length];
        const horaire = horaires[i];
        const typeSeance = typeSeances[count % typeSeances.length];

        try {
          await client.query(`
            INSERT INTO ${tenantSchema}.emploi_du_temps 
            (annee_academique_id, affectation_id, salle_id, date_seance, heure_debut, heure_fin, type_seance, statut)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'planifie')
          `, [anneeAcademiqueId, affectation.id, salle.id, dateStr, horaire.debut, horaire.fin, typeSeance]);

          console.log(`✅ ${dateStr} ${horaire.debut}: ${affectation.ue_intitule} (${typeSeance}) - ${salle.nom}`);
          count++;
        } catch (error) {
          console.log(`⚠️  ${dateStr}: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ ${affectations.length} affectations et ${count} séances créées!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createAffectationsAndEDT();

// Made with Bob
