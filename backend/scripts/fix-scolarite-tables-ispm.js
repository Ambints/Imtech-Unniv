const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function fixScolariteTables() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'imtech_university',
  });

  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL');

    const schemaName = 'tenant_ispm';
    
    console.log(`\n🔧 Nettoyage et recréation des tables scolarité dans ${schemaName}`);

    // Définir le search_path
    await client.query(`SET search_path TO "${schemaName}", public`);
    
    // Supprimer les triggers d'abord
    console.log('🗑️  Suppression des anciennes tables et triggers...');
    await client.query(`
      DROP TRIGGER IF EXISTS prevent_locked_note_modification ON tenant_ispm.note;
      DROP TRIGGER IF EXISTS check_note_verrouillage ON tenant_ispm.note;
    `);
    console.log('   ✅ Triggers supprimés');
    
    // Supprimer les tables existantes dans le bon ordre (dépendances)
    const tablesToDrop = [
      'verrouillage_notes',
      'archive_scolarite',
      'suplement_diplome',
      'diplome',
      'transfert_etudiant',
      'resultat_ue',
      'resultat_semestre',
      'deliberation'
    ];
    
    for (const table of tablesToDrop) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`   ✅ ${table} supprimée`);
      } catch (error) {
        console.log(`   ⚠️  ${table}: ${error.message}`);
      }
    }

    // Lire et exécuter le script SQL (sans les vues)
    console.log('\n📄 Application du script scolarité...');
    const sqlPath = path.join(__dirname, '../src/scolarite/migrations/001_add_scolarite_tables.sql');
    let sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Supprimer les sections de vues qui causent des erreurs
    const viewsStartIndex = sqlContent.indexOf('-- Vues pour les rapports');
    if (viewsStartIndex > 0) {
      sqlContent = sqlContent.substring(0, viewsStartIndex);
      console.log('   ⚠️  Vues SQL ignorées (incompatibilité de schéma)');
    }
    
    // Exécuter le script
    try {
      await client.query(sqlContent);
      console.log('✅ Tables scolarité créées avec succès');
    } catch (error) {
      console.error('❌ Erreur SQL:', error.message);
      throw error;
    }
    
    // Vérifier les tables créées
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1 
      AND table_name IN ('deliberation', 'diplome', 'verrouillage_notes')
      ORDER BY table_name
    `, [schemaName]);
    
    console.log('\n✅ Tables vérifiées:');
    result.rows.forEach(row => console.log(`   - ${row.table_name}`));
    
    console.log('\n🎉 Migration terminée avec succès!');
    console.log('   Redémarrez le serveur NestJS maintenant.');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixScolariteTables();

// Made with Bob
