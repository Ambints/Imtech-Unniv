const { Client } = require('pg');
require('dotenv').config();

async function createSampleDepenses() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'imtech_university',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const schema = 'tenant_test';
    await client.query(`SET search_path TO ${schema}, public`);

    // Get active annee_academique
    const anneeResult = await client.query(`
      SELECT id, libelle FROM annee_academique WHERE active = TRUE LIMIT 1
    `);

    if (anneeResult.rows.length === 0) {
      console.error('❌ No active annee_academique found!');
      process.exit(1);
    }

    const anneeId = anneeResult.rows[0].id;
    console.log(`📅 Using annee_academique: ${anneeResult.rows[0].libelle} (${anneeId})\n`);

    // Get an economat user
    const userResult = await client.query(`
      SELECT id FROM utilisateur WHERE role = 'economat' LIMIT 1
    `);

    let userId = null;
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
      console.log(`👤 Using user: ${userId}\n`);
    } else {
      console.log('⚠️  No economat user found, creating depenses without user reference\n');
    }

    // Sample depenses data
    const depenses = [
      {
        libelle: 'Achat de fournitures de bureau',
        montant: 150000,
        categorie: 'fonctionnement',
        fournisseur: 'Papeterie Centrale',
        numero_facture: 'FC-2024-001',
        statut: 'en_attente',
        observations: 'Fournitures pour le semestre'
      },
      {
        libelle: 'Maintenance ordinateurs salle informatique',
        montant: 500000,
        categorie: 'equipement',
        fournisseur: 'Tech Solutions',
        numero_facture: 'FC-2024-002',
        statut: 'approuve',
        observations: 'Réparation de 10 ordinateurs'
      },
      {
        libelle: 'Salaire enseignant vacataire - Janvier',
        montant: 800000,
        categorie: 'personnel',
        fournisseur: null,
        numero_facture: null,
        statut: 'paye',
        observations: 'Paiement mensuel'
      },
      {
        libelle: 'Achat de projecteurs',
        montant: 1200000,
        categorie: 'equipement',
        fournisseur: 'Électronique Pro',
        numero_facture: 'FC-2024-003',
        statut: 'en_attente',
        observations: '3 projecteurs pour les salles de cours'
      },
      {
        libelle: 'Frais de nettoyage - Trimestre 1',
        montant: 300000,
        categorie: 'fonctionnement',
        fournisseur: 'Clean Services',
        numero_facture: 'FC-2024-004',
        statut: 'approuve',
        observations: 'Contrat trimestriel'
      }
    ];

    console.log('📝 Creating sample depenses in tenant_test...\n');

    for (const depense of depenses) {
      const query = `
        INSERT INTO depense (
          annee_academique_id, libelle, montant, categorie,
          fournisseur, numero_facture, statut, observations,
          demande_par, date_depense
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)
        RETURNING id, libelle, montant, statut
      `;

      const values = [
        anneeId,
        depense.libelle,
        depense.montant,
        depense.categorie,
        depense.fournisseur,
        depense.numero_facture,
        depense.statut,
        depense.observations,
        userId
      ];

      const result = await client.query(query, values);
      const created = result.rows[0];
      
      console.log(`✅ Created: ${created.libelle}`);
      console.log(`   Montant: ${created.montant} MGA`);
      console.log(`   Statut: ${created.statut}\n`);
    }

    // Display summary
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE statut = 'en_attente') as en_attente,
        COUNT(*) FILTER (WHERE statut = 'approuve') as approuve,
        COUNT(*) FILTER (WHERE statut = 'paye') as paye,
        COUNT(*) FILTER (WHERE statut = 'rejete') as rejete,
        SUM(montant) as montant_total
      FROM depense
      WHERE annee_academique_id = $1
    `, [anneeId]);

    const stats = statsResult.rows[0];
    console.log('📊 Summary for tenant_test:');
    console.log(`   Total depenses: ${stats.total}`);
    console.log(`   En attente: ${stats.en_attente}`);
    console.log(`   Approuvées: ${stats.approuve}`);
    console.log(`   Payées: ${stats.paye}`);
    console.log(`   Rejetées: ${stats.rejete}`);
    console.log(`   Montant total: ${stats.montant_total} MGA\n`);

    console.log('✅ Sample depenses created successfully in tenant_test!\n');
    console.log('🔄 Now refresh the frontend page to see the data.\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createSampleDepenses();

// Made with Bob
