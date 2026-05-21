#!/usr/bin/env node

/**
 * Script d'application de la migration des colonnes PV à un tenant spécifique
 * Usage: node apply-pv-migration-to-tenant.js <tenant_id>
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration - À ADAPTER selon votre environnement
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'imtech_university',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

async function getTenantSchema(client, tenantId) {
  const result = await client.query(
    'SELECT schema_name FROM public.tenants WHERE id = $1',
    [tenantId]
  );
  if (result.rows.length === 0) {
    throw new Error(`Tenant ${tenantId} non trouvé`);
  }
  return result.rows[0].schema_name;
}

async function applyMigrationToSchema(client, schemaName) {
  const sqlFile = path.join(__dirname, 'add-pv-transmission-columns.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  
  // Remplacer le nom de la table par le nom qualifié avec le schéma
  const schemaSql = sql.replace(/proces_verbal/g, `"${schemaName}".proces_verbal`);
  
  console.log(`[${schemaName}] Application de la migration...`);
  
  try {
    await client.query(schemaSql);
    console.log(`[${schemaName}] ✅ Migration appliquée avec succès`);
    return true;
  } catch (error) {
    console.error(`[${schemaName}] ❌ Erreur: ${error.message}`);
    return false;
  }
}

async function main() {
  const tenantId = process.argv[2];
  
  if (!tenantId) {
    console.error('Usage: node apply-pv-migration-to-tenant.js <tenant_id>');
    console.error('Exemple: node apply-pv-migration-to-tenant.js eaceef7f-dd73-46bd-9d77-231896181cca');
    process.exit(1);
  }

  const client = new Client(DB_CONFIG);
  
  try {
    await client.connect();
    console.log(`🔌 Connecté à la base de données ${DB_CONFIG.database}`);
    
    // Récupérer le schéma du tenant
    const schemaName = await getTenantSchema(client, tenantId);
    console.log(`\n📋 Tenant: ${tenantId}`);
    console.log(`📁 Schéma: ${schemaName}\n`);
    
    // Appliquer la migration
    const success = await applyMigrationToSchema(client, schemaName);
    
    if (success) {
      console.log('\n✅ Migration terminée avec succès');
      console.log('\nColonnes ajoutées:');
      console.log('  - transmis_a_scolarite (BOOLEAN, DEFAULT FALSE)');
      console.log('  - date_transmission_scolarite (TIMESTAMP WITH TIME ZONE, NULLABLE)');
      console.log('  - transmis_par (UUID, NULLABLE)');
      console.log('\nIndex créés:');
      console.log('  - idx_proces_verbal_transmis_a_scolarite');
      console.log('  - idx_proces_verbal_parcours_transmis');
    } else {
      console.error('\n❌ La migration a échoué');
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`\n❌ Erreur: ${error.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
