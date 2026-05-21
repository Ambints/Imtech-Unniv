const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'Imtech_SaaS',
  user: 'postgres',
  password: '2007',
});

async function setupCompleteEDT() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    const tenantSchema = 'tenant_test';
    const tenantId = '324746c0-67d0-4d87-b9d6-1af7d149599b';
    await client.query(`SET search_path TO ${tenantSchema}`);
    console.log(`✅ Using schema: ${tenantSchema}\n`);

    // Récupérer année académique
    const anneeAcademique = await client.query(`SELECT id, libelle FROM ${tenantSchema}.annee_academique WHERE active = true LIMIT 1`);
    if (anneeAcademique.rows.length === 0) {
      console.log('❌ Aucune année académique active');
      return;
    }
    const anneeAcademiqueId = anneeAcademique.rows[0].id;
    console.log(`✅ Année académique: ${anneeAcademique.rows[0].libelle}`);

    // Récupérer un département
    const departement = await client.query(`SELECT id, nom FROM ${tenantSchema}.departement LIMIT 1`);
    const departementId = departement.rows.length > 0 ? departement.rows[0].id : null;
    console.log(`✅ Département: ${departement.rows.length > 0 ? departement.rows[0].nom : 'Aucun'}`);

    // Créer des enseignants avec utilisateurs et contrats
    console.log('\n--- Creating Enseignants with Contracts ---');
    const timestamp = Date.now();
    const enseignants = [
      { nom: 'Dupont', prenom: 'Jean', titre: 'Dr', grade: 'Maître de conférences', specialite: 'Informatique', email: `jean.dupont.${timestamp}@test.com` },
      { nom: 'Martin', prenom: 'Marie', titre: 'Pr', grade: 'Professeur', specialite: 'Mathématiques', email: `marie.martin.${timestamp}@test.com` },
      { nom: 'Bernard', prenom: 'Pierre', titre: 'Dr', grade: 'Maître assistant', specialite: 'Physique', email: `pierre.bernard.${timestamp}@test.com` },
      { nom: 'Dubois', prenom: 'Sophie', titre: 'Dr', grade: 'Maître de conférences', specialite: 'Chimie', email: `sophie.dubois.${timestamp}@test.com` },
      { nom: 'Thomas', prenom: 'Luc', titre: 'Pr', grade: 'Professeur', specialite: 'Biologie', email: `luc.thomas.${timestamp}@test.com` },
    ];

    const enseignantIds = [];
    // Utiliser un password_hash simple pour les tests (à hasher correctement en production)
    const simplePasswordHash = '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNO'; // Hash bcrypt factice

    for (const ens of enseignants) {
      try {
        // Créer utilisateur
        const userResult = await client.query(`
          INSERT INTO ${tenantSchema}.utilisateur
          (tenant_id, nom, prenom, email, password_hash, role, actif, email_verifie)
          VALUES ($1, $2, $3, $4, $5, 'enseignant', true, true)
          RETURNING id
        `, [tenantId, ens.nom, ens.prenom, ens.email, simplePasswordHash]);
        
        const utilisateurId = userResult.rows[0].id;

        // Créer enseignant
        const ensResult = await client.query(`
          INSERT INTO ${tenantSchema}.enseignant
          (utilisateur_id, matricule, nom, prenom, titre, grade, specialite, type_contrat, departement_id, email, telephone, actif)
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'permanent', $8, $9, '+261340000000', true)
          RETURNING id
        `, [utilisateurId, `ENS${Date.now()}${Math.floor(Math.random()*1000)}`, ens.nom, ens.prenom, ens.titre, ens.grade, ens.specialite, departementId, ens.email]);
        
        const enseignantId = ensResult.rows[0].id;

        // Créer contrat CDI
        const dateDebut = new Date();
        dateDebut.setMonth(dateDebut.getMonth() - 6); // Contrat commencé il y a 6 mois
        
        await client.query(`
          INSERT INTO ${tenantSchema}.contrat_personnel 
          (utilisateur_id, type_contrat, poste, departement_id, date_debut, date_fin, salaire_brut, salaire_net, volume_horaire_hebdo, actif)
          VALUES ($1, 'CDI', $2, $3, $4, NULL, 2500000, 2000000, 40, true)
        `, [utilisateurId, `${ens.grade} - ${ens.specialite}`, departementId, dateDebut.toISOString().split('T')[0]]);

        enseignantIds.push({ id: enseignantId, nom: `${ens.prenom} ${ens.nom}`, specialite: ens.specialite });
        console.log(`✅ ${ens.titre} ${ens.prenom} ${ens.nom} (${ens.specialite}) - CDI créé`);
      } catch (error) {
        console.log(`⚠️  Erreur pour ${ens.prenom} ${ens.nom}: ${error.message}`);
      }
    }

    if (enseignantIds.length === 0) {
      console.log('❌ Aucun enseignant créé');
      return;
    }

    // Récupérer parcours et UEs
    const parcours = await client.query(`SELECT id, nom FROM ${tenantSchema}.parcours LIMIT 3`);
    const ues = await client.query(`SELECT id, intitule, parcours_id FROM ${tenantSchema}.unite_enseignement LIMIT 10`);
    const salles = await client.query(`SELECT id, nom FROM ${tenantSchema}.salle LIMIT 5`);

    console.log(`\n✅ Found ${parcours.rows.length} parcours, ${ues.rows.length} UEs, ${salles.rows.length} salles`);

    if (ues.rows.length === 0) {
      console.log('❌ Aucune UE trouvée');
      return;
    }

    // Créer affectations (une par type de séance)
    console.log('\n--- Creating Affectations ---');
    const affectations = [];
    const typeSeances = ['CM', 'TD', 'TP'];
    
    for (let i = 0; i < Math.min(ues.rows.length, enseignantIds.length); i++) {
      const ue = ues.rows[i];
      const enseignant = enseignantIds[i % enseignantIds.length];
      
      // Créer une affectation pour chaque type de séance
      for (const typeSeance of typeSeances) {
        try {
          const volumePrevu = typeSeance === 'CM' ? 20 : (typeSeance === 'TD' ? 20 : 10);
          const result = await client.query(`
            INSERT INTO ${tenantSchema}.affectation_cours
            (ue_id, enseignant_id, annee_academique_id, type_seance, volume_prevu, volume_realise)
            VALUES ($1, $2, $3, $4, $5, 0)
            RETURNING id
          `, [ue.id, enseignant.id, anneeAcademiqueId, typeSeance, volumePrevu]);
          
          affectations.push({
            id: result.rows[0].id,
            ue_intitule: ue.intitule,
            enseignant: enseignant.nom,
            type_seance: typeSeance
          });
          console.log(`✅ ${ue.intitule} (${typeSeance}) → ${enseignant.nom}`);
        } catch (error) {
          console.log(`⚠️  ${ue.intitule} (${typeSeance}): ${error.message}`);
        }
      }
    }

    if (affectations.length === 0) {
      console.log('❌ Aucune affectation créée');
      return;
    }

    // Créer emploi du temps
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

    let count = 0;

    for (let jour = 0; jour < 5; jour++) {
      const dateSeance = new Date(startOfWeek);
      dateSeance.setDate(startOfWeek.getDate() + jour);
      const dateStr = dateSeance.toISOString().split('T')[0];

      const nbSeances = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < nbSeances && i < horaires.length; i++) {
        const affectation = affectations[count % affectations.length];
        const salle = salles.rows[count % salles.rows.length];
        const horaire = horaires[i];

        try {
          await client.query(`
            INSERT INTO ${tenantSchema}.emploi_du_temps
            (annee_academique_id, affectation_id, salle_id, date_seance, heure_debut, heure_fin, type_seance, statut)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'planifie')
          `, [anneeAcademiqueId, affectation.id, salle.id, dateStr, horaire.debut, horaire.fin, affectation.type_seance]);

          console.log(`✅ ${dateStr} ${horaire.debut}: ${affectation.ue_intitule} (${affectation.type_seance}) - ${salle.nom}`);
          count++;
        } catch (error) {
          console.log(`⚠️  ${dateStr}: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ Setup complet terminé!`);
    console.log(`   - ${enseignantIds.length} enseignants CDI créés`);
    console.log(`   - ${affectations.length} affectations créées`);
    console.log(`   - ${count} séances d'emploi du temps créées`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

setupCompleteEDT();

// Made with Bob
