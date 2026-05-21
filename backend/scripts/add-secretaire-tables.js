#!/usr/bin/env node
/**
 * Script de migration pour ajouter les tables et colonnes du module Secrétaire
 * - Ajoute la colonne secretaire_id à la table parcours
 * - Crée les tables convocation et dossier_etudiant
 *
 * Usage: node add-secretaire-tables.js <tenant_slug>
 * Exemple: node add-secretaire-tables.js ispm
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '2007',
};

async function runMigration() {
  const tenantSlug = process.argv[2];

  if (!tenantSlug) {
    console.error('❌ Usage: node add-secretaire-tables.js <tenant_slug>');
    console.error('   Exemple: node add-secretaire-tables.js ispm');
    process.exit(1);
  }

  const schemaName = `tenant_${tenantSlug}`;
  console.log(`🚀 Démarrage de la migration pour le tenant: ${schemaName}`);

  const client = new Client(DB_CONFIG);

  try {
    await client.connect();
    console.log('✅ Connecté à la base de données');

    // Vérifier si le schéma existe
    const schemaCheck = await client.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1`,
      [schemaName]
    );

    if (schemaCheck.rows.length === 0) {
      console.error(`❌ Le schéma ${schemaName} n'existe pas!`);
      process.exit(1);
    }

    console.log(`✅ Schéma ${schemaName} trouvé`);

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'add-secretaire-tables.sql');
    let sql = fs.readFileSync(sqlFile, 'utf8');

    // Remplacer le schéma dans le SQL
    sql = sql.replace(/tenant_ispm/g, schemaName);
    sql = sql.replace(/SET search_path TO ${schemaName}, public;/g, `SET search_path TO "${schemaName}", public;`);

    // Exécuter le SQL
    console.log('📝 Exécution des migrations...');
    await client.query(sql);

    console.log('✅ Migration terminée avec succès!');
    console.log('');
    console.log('📋 Résumé des changements:');
    console.log('   - Colonne secretaire_id ajoutée à la table parcours');
    console.log('   - Table absence_enseignant créée');
    console.log('   - Table rattrapage créée');
    console.log('   - Table note_derogatoire créée');
    console.log('   - Table demande_etudiant créée');
    console.log('   - Table convocation créée');
    console.log('   - Table dossier_etudiant créée');
    console.log('   - Index et triggers créés');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
