const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'Imtech_SaaS',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const fs = require('fs');
const path = require('path');

async function applyBusinessRulesToTenant(client, schemaName) {
  console.log(`\n📋 Application des règles métier enseignants au schéma: ${schemaName}`);
  
  try {
    // Lire le fichier SQL
    const sqlFilePath = path.join(__dirname, 'add-enseignant-business-rules.sql');
    let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Remplacer les références de tables sans schéma par le schéma du tenant
    sqlContent = sqlContent.replace(/FROM enseignant/g, `FROM ${schemaName}.enseignant`);
    sqlContent = sqlContent.replace(/FROM contrat_personnel/g, `FROM ${schemaName}.contrat_personnel`);
    sqlContent = sqlContent.replace(/FROM affectation_cours/g, `FROM ${schemaName}.affectation_cours`);
    sqlContent = sqlContent.replace(/FROM departement/g, `FROM ${schemaName}.departement`);
    sqlContent = sqlContent.replace(/FROM unite_enseignement/g, `FROM ${schemaName}.unite_enseignement`);
    sqlContent = sqlContent.replace(/FROM parcours/g, `FROM ${schemaName}.parcours`);
    sqlContent = sqlContent.replace(/FROM annee_academique/g, `FROM ${schemaName}.annee_academique`);
    
    sqlContent = sqlContent.replace(/JOIN enseignant/g, `JOIN ${schemaName}.enseignant`);
    sqlContent = sqlContent.replace(/JOIN contrat_personnel/g, `JOIN ${schemaName}.contrat_personnel`);
    sqlContent = sqlContent.replace(/JOIN affectation_cours/g, `JOIN ${schemaName}.affectation_cours`);
    sqlContent = sqlContent.replace(/JOIN departement/g, `JOIN ${schemaName}.departement`);
    sqlContent = sqlContent.replace(/JOIN unite_enseignement/g, `JOIN ${schemaName}.unite_enseignement`);
    sqlContent = sqlContent.replace(/JOIN parcours/g, `JOIN ${schemaName}.parcours`);
    sqlContent = sqlContent.replace(/JOIN annee_academique/g, `JOIN ${schemaName}.annee_academique`);
    
    sqlContent = sqlContent.replace(/LEFT JOIN departement/g, `LEFT JOIN ${schemaName}.departement`);
    sqlContent = sqlContent.replace(/LEFT JOIN affectation_cours/g, `LEFT JOIN ${schemaName}.affectation_cours`);
    sqlContent = sqlContent.replace(/LEFT JOIN annee_academique/g, `LEFT JOIN ${schemaName}.annee_academique`);
    
    sqlContent = sqlContent.replace(/ON affectation_cours/g, `ON ${schemaName}.affectation_cours`);
    sqlContent = sqlContent.replace(/ALTER TABLE affectation_cours/g, `ALTER TABLE ${schemaName}.affectation_cours`);
    
    // Définir le search_path pour le schéma du tenant
    await client.query(`SET search_path TO ${schemaName}, public`);
    
    // Créer les fonctions dans le schéma du tenant
    console.log('  ✓ Création de la fonction check_enseignant_has_active_contract()...');
    await client.query(`
      CREATE OR REPLACE FUNCTION ${schemaName}.check_enseignant_has_active_contract()
      RETURNS TRIGGER AS $$
      DECLARE
          v_utilisateur_id UUID;
          v_has_active_contract BOOLEAN;
      BEGIN
          SELECT utilisateur_id INTO v_utilisateur_id
          FROM ${schemaName}.enseignant
          WHERE id = NEW.enseignant_id;
          
          SELECT EXISTS (
              SELECT 1
              FROM ${schemaName}.contrat_personnel cp
              WHERE cp.utilisateur_id = v_utilisateur_id
              AND cp.actif = TRUE
              AND cp.date_debut <= CURRENT_DATE
              AND (cp.date_fin IS NULL OR cp.date_fin >= CURRENT_DATE)
          ) INTO v_has_active_contract;
          
          IF NOT v_has_active_contract THEN
              RAISE EXCEPTION 'Impossible d''affecter cet enseignant : aucun contrat actif trouvé. L''enseignant doit avoir un contrat valide avant toute affectation.';
          END IF;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    console.log('  ✓ Création de la fonction check_ue_unique_per_enseignant()...');
    await client.query(`
      CREATE OR REPLACE FUNCTION ${schemaName}.check_ue_unique_per_enseignant()
      RETURNS TRIGGER AS $$
      DECLARE
          v_existing_count INTEGER;
      BEGIN
          IF NEW.ue_id IS NOT NULL THEN
              SELECT COUNT(*) INTO v_existing_count
              FROM ${schemaName}.affectation_cours ac
              WHERE ac.ue_id = NEW.ue_id
              AND ac.annee_academique_id = NEW.annee_academique_id
              AND ac.enseignant_id != NEW.enseignant_id
              AND ac.id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
              
              IF v_existing_count > 0 THEN
                  RAISE EXCEPTION 'Cette UE est déjà affectée à un autre enseignant pour cette année académique. Une UE ne peut être affectée qu''à un seul enseignant.';
              END IF;
          END IF;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    // Créer les vues
    console.log('  ✓ Création de la vue vue_enseignants_sans_affectation...');
    await client.query(`
      CREATE OR REPLACE VIEW ${schemaName}.vue_enseignants_sans_affectation AS
      SELECT 
          e.id AS enseignant_id,
          e.matricule,
          e.nom,
          e.prenom,
          e.titre,
          e.grade,
          e.specialite,
          e.departement_id,
          d.nom AS departement_nom,
          e.email,
          e.telephone,
          e.actif,
          EXISTS (
              SELECT 1
              FROM ${schemaName}.contrat_personnel cp
              WHERE cp.utilisateur_id = e.utilisateur_id
              AND cp.actif = TRUE
              AND cp.date_debut <= CURRENT_DATE
              AND (cp.date_fin IS NULL OR cp.date_fin >= CURRENT_DATE)
          ) AS a_contrat_actif,
          (
              SELECT COUNT(*)
              FROM ${schemaName}.affectation_cours ac
              JOIN ${schemaName}.annee_academique aa ON ac.annee_academique_id = aa.id
              WHERE ac.enseignant_id = e.id
              AND aa.active = TRUE
          ) AS nb_affectations_actives
      FROM ${schemaName}.enseignant e
      LEFT JOIN ${schemaName}.departement d ON e.departement_id = d.id
      WHERE e.actif = TRUE
      AND NOT EXISTS (
          SELECT 1
          FROM ${schemaName}.affectation_cours ac
          JOIN ${schemaName}.annee_academique aa ON ac.annee_academique_id = aa.id
          WHERE ac.enseignant_id = e.id
          AND aa.active = TRUE
      )
      ORDER BY e.nom, e.prenom;
    `);
    
    console.log('  ✓ Création de la vue vue_statistiques_affectation_enseignant...');
    await client.query(`
      CREATE OR REPLACE VIEW ${schemaName}.vue_statistiques_affectation_enseignant AS
      SELECT 
          e.id AS enseignant_id,
          e.matricule,
          e.nom || ' ' || e.prenom AS nom_complet,
          e.titre,
          e.grade,
          d.nom AS departement,
          EXISTS (
              SELECT 1
              FROM ${schemaName}.contrat_personnel cp
              WHERE cp.utilisateur_id = e.utilisateur_id
              AND cp.actif = TRUE
              AND cp.date_debut <= CURRENT_DATE
              AND (cp.date_fin IS NULL OR cp.date_fin >= CURRENT_DATE)
          ) AS a_contrat_actif,
          COUNT(DISTINCT ac.ue_id) AS nb_ue_affectees,
          COUNT(DISTINCT ac.ec_id) AS nb_ec_affectes,
          COALESCE(SUM(ac.volume_prevu), 0) AS volume_horaire_total,
          COALESCE(SUM(ac.volume_realise), 0) AS volume_horaire_realise,
          CASE 
              WHEN SUM(ac.volume_prevu) > 0 THEN
                  ROUND((SUM(ac.volume_realise)::NUMERIC / SUM(ac.volume_prevu)::NUMERIC) * 100, 2)
              ELSE 0
          END AS taux_realisation_pct,
          CASE 
              WHEN COUNT(ac.id) = 0 THEN 'Non affecté'
              WHEN COUNT(ac.id) > 0 THEN 'Affecté'
          END AS statut_affectation
      FROM ${schemaName}.enseignant e
      LEFT JOIN ${schemaName}.departement d ON e.departement_id = d.id
      LEFT JOIN ${schemaName}.affectation_cours ac ON e.id = ac.enseignant_id
      LEFT JOIN ${schemaName}.annee_academique aa ON ac.annee_academique_id = aa.id AND aa.active = TRUE
      WHERE e.actif = TRUE
      GROUP BY e.id, e.matricule, e.nom, e.prenom, e.titre, e.grade, d.nom, e.utilisateur_id
      ORDER BY statut_affectation, e.nom, e.prenom;
    `);
    
    console.log('  ✓ Création de la vue vue_affectations_ue_details...');
    await client.query(`
      CREATE OR REPLACE VIEW ${schemaName}.vue_affectations_ue_details AS
      SELECT 
          ac.id AS affectation_id,
          e.id AS enseignant_id,
          e.matricule AS enseignant_matricule,
          e.nom || ' ' || e.prenom AS enseignant_nom,
          e.titre,
          e.grade,
          ue.id AS ue_id,
          ue.code AS ue_code,
          ue.intitule AS ue_intitule,
          ue.credits_ects,
          p.code AS parcours_code,
          p.nom AS parcours_nom,
          aa.libelle AS annee_academique,
          ac.type_seance,
          ac.volume_prevu,
          ac.volume_realise,
          EXISTS (
              SELECT 1
              FROM ${schemaName}.contrat_personnel cp
              WHERE cp.utilisateur_id = e.utilisateur_id
              AND cp.actif = TRUE
              AND cp.date_debut <= CURRENT_DATE
              AND (cp.date_fin IS NULL OR cp.date_fin >= CURRENT_DATE)
          ) AS enseignant_a_contrat_actif
      FROM ${schemaName}.affectation_cours ac
      JOIN ${schemaName}.enseignant e ON ac.enseignant_id = e.id
      JOIN ${schemaName}.unite_enseignement ue ON ac.ue_id = ue.id
      JOIN ${schemaName}.parcours p ON ue.parcours_id = p.id
      JOIN ${schemaName}.annee_academique aa ON ac.annee_academique_id = aa.id
      WHERE ac.ue_id IS NOT NULL
      ORDER BY aa.libelle DESC, p.code, ue.code;
    `);
    
    // Créer les triggers
    console.log('  ✓ Création des triggers de validation...');
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_check_contract_before_affectation_insert ON ${schemaName}.affectation_cours;
      CREATE TRIGGER trigger_check_contract_before_affectation_insert
          BEFORE INSERT ON ${schemaName}.affectation_cours
          FOR EACH ROW
          EXECUTE FUNCTION ${schemaName}.check_enseignant_has_active_contract();
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_check_contract_before_affectation_update ON ${schemaName}.affectation_cours;
      CREATE TRIGGER trigger_check_contract_before_affectation_update
          BEFORE UPDATE ON ${schemaName}.affectation_cours
          FOR EACH ROW
          WHEN (OLD.enseignant_id IS DISTINCT FROM NEW.enseignant_id)
          EXECUTE FUNCTION ${schemaName}.check_enseignant_has_active_contract();
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_check_ue_unique_insert ON ${schemaName}.affectation_cours;
      CREATE TRIGGER trigger_check_ue_unique_insert
          BEFORE INSERT ON ${schemaName}.affectation_cours
          FOR EACH ROW
          EXECUTE FUNCTION ${schemaName}.check_ue_unique_per_enseignant();
    `);
    
    await client.query(`
      DROP TRIGGER IF EXISTS trigger_check_ue_unique_update ON ${schemaName}.affectation_cours;
      CREATE TRIGGER trigger_check_ue_unique_update
          BEFORE UPDATE ON ${schemaName}.affectation_cours
          FOR EACH ROW
          WHEN (OLD.ue_id IS DISTINCT FROM NEW.ue_id OR OLD.enseignant_id IS DISTINCT FROM NEW.enseignant_id)
          EXECUTE FUNCTION ${schemaName}.check_ue_unique_per_enseignant();
    `);
    
    // Ajouter la contrainte d'unicité
    console.log('  ✓ Ajout de la contrainte d\'unicité UE par année académique...');
    await client.query(`
      ALTER TABLE ${schemaName}.affectation_cours 
      DROP CONSTRAINT IF EXISTS unique_ue_per_annee_academique;
    `);
    
    await client.query(`
      ALTER TABLE ${schemaName}.affectation_cours 
      ADD CONSTRAINT unique_ue_per_annee_academique 
      UNIQUE (ue_id, annee_academique_id);
    `);
    
    console.log(`✅ Règles métier appliquées avec succès au schéma: ${schemaName}`);
    
  } catch (error) {
    console.error(`❌ Erreur lors de l'application des règles au schéma ${schemaName}:`, error.message);
    throw error;
  }
}

async function main() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Début de l\'application des règles métier enseignants...\n');
    
    // Récupérer tous les tenants
    const tenantsResult = await client.query(`
      SELECT schema_name, nom 
      FROM public.tenant 
      WHERE actif = true 
      ORDER BY schema_name
    `);
    
    console.log(`📊 ${tenantsResult.rows.length} tenant(s) trouvé(s)\n`);
    
    for (const tenant of tenantsResult.rows) {
      await applyBusinessRulesToTenant(client, tenant.schema_name);
    }
    
    console.log('\n✅ Migration terminée avec succès pour tous les tenants!');
    console.log('\n📋 Résumé des règles implémentées:');
    console.log('   1. ✓ Un enseignant doit avoir un contrat actif pour être affecté');
    console.log('   2. ✓ Une UE ne peut être affectée qu\'à un seul enseignant');
    console.log('   3. ✓ Vue des enseignants sans affectation créée');
    console.log('   4. ✓ Vues statistiques créées');
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();

// Made with Bob
