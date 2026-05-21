const fs = require('fs');
const path = require('path');

console.log('🚀 Génération du tenant-schema.sql depuis tenant_ispm.sql...\n');

// Lire le fichier tenant_ispm.sql
const ispmPath = path.join(__dirname, '../../tenant_ispm.sql');
const outputPath = path.join(__dirname, '../src/tenants/tenant-schema.sql');

if (!fs.existsSync(ispmPath)) {
  console.error('❌ Fichier tenant_ispm.sql introuvable à:', ispmPath);
  process.exit(1);
}

const content = fs.readFileSync(ispmPath, 'utf-8');
console.log(`✅ Fichier tenant_ispm.sql lu (${content.length} caractères)\n`);

// Extraire uniquement les instructions de structure (pas les INSERT/COPY)
const lines = content.split('\n');
const structureLines = [];
let inCopyBlock = false;
let inInsertBlock = false;
let skipUntilSemicolon = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  // Ignorer les commentaires de pg_dump
  if (line.startsWith('--') && (
    line.includes('PostgreSQL database dump') ||
    line.includes('Dumped from') ||
    line.includes('Dumped by') ||
    line.includes('Started on') ||
    line.includes('Completed on') ||
    line.includes('Name:') ||
    line.includes('Type:') ||
    line.includes('Schema:') ||
    line.includes('Owner:')
  )) {
    continue;
  }
  
  // Détecter le début d'un bloc COPY
  if (line.startsWith('COPY ')) {
    inCopyBlock = true;
    continue;
  }
  
  // Détecter la fin d'un bloc COPY
  if (inCopyBlock && line === '\\.') {
    inCopyBlock = false;
    continue;
  }
  
  // Ignorer les lignes dans un bloc COPY
  if (inCopyBlock) {
    continue;
  }
  
  // Ignorer les INSERT INTO
  if (line.startsWith('INSERT INTO ')) {
    skipUntilSemicolon = true;
    continue;
  }
  
  // Si on skip jusqu'au point-virgule
  if (skipUntilSemicolon) {
    if (line.endsWith(';')) {
      skipUntilSemicolon = false;
    }
    continue;
  }
  
  // Ignorer les commandes SET spécifiques à pg_dump
  if (line.startsWith('SET ') || line.startsWith('SELECT pg_catalog.')) {
    continue;
  }
  
  // Remplacer tenant_ispm par le placeholder {SCHEMA_NAME}
  let processedLine = lines[i].replace(/tenant_ispm\./g, '{SCHEMA_NAME}.');
  processedLine = processedLine.replace(/SCHEMA tenant_ispm/g, 'SCHEMA {SCHEMA_NAME}');
  processedLine = processedLine.replace(/"tenant_ispm"/g, '"{SCHEMA_NAME}"');
  
  structureLines.push(processedLine);
}

// Générer le contenu final
let finalContent = structureLines.join('\n');

// Nettoyer les lignes vides multiples
finalContent = finalContent.replace(/\n{3,}/g, '\n\n');

// Ajouter un header
const header = `-- =====================================================
-- SCRIPT DE CRÉATION DE SCHÉMA TENANT
-- Généré automatiquement depuis tenant_ispm
-- Date: ${new Date().toISOString()}
-- =====================================================
-- 
-- Ce script crée la structure complète d'un tenant (université)
-- avec toutes les tables, contraintes, index, fonctions et triggers
-- 
-- Usage: Remplacer {SCHEMA_NAME} par le nom du schéma cible
-- =====================================================

`;

finalContent = header + finalContent;

// Écrire le fichier
fs.writeFileSync(outputPath, finalContent, 'utf-8');

console.log(`✅ Nouveau tenant-schema.sql généré avec succès!`);
console.log(`📁 Emplacement: ${outputPath}`);
console.log(`📊 Taille: ${finalContent.length} caractères\n`);

// Compter les éléments
const createTableCount = (finalContent.match(/CREATE TABLE/gi) || []).length;
const createIndexCount = (finalContent.match(/CREATE (?:UNIQUE )?INDEX/gi) || []).length;
const createFunctionCount = (finalContent.match(/CREATE (?:OR REPLACE )?FUNCTION/gi) || []).length;
const createTriggerCount = (finalContent.match(/CREATE TRIGGER/gi) || []).length;
const alterTableCount = (finalContent.match(/ALTER TABLE/gi) || []).length;

console.log('📊 Statistiques:');
console.log(`   - Tables: ${createTableCount}`);
console.log(`   - Index: ${createIndexCount}`);
console.log(`   - Fonctions: ${createFunctionCount}`);
console.log(`   - Triggers: ${createTriggerCount}`);
console.log(`   - ALTER TABLE: ${alterTableCount}`);
console.log('\n✅ Terminé!');

// Made with Bob
