const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'imtech_saas',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function addPermissionsTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Ajout de la table permissions_portail aux tenants existants...\n');
    
    // Récupérer tous les tenants
    const tenantsResult = await client.query(
      'SELECT id, nom, schema_name FROM public.tenant WHERE actif = true'
    );
    
    const tenants = tenantsResult.rows;
    console.log(`📋 ${tenants.length} tenant(s) trouvé(s)\n`);
    
    for (const tenant of tenants) {
      console.log(`\n🎓 Traitement: ${tenant.nom} (${tenant.schema_name})`);
      
      try {
        // Créer la table permissions_portail
        await client.query(`
          CREATE TABLE IF NOT EXISTS ${tenant.schema_name}.permissions_portail (
            id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
            type_portail        VARCHAR(20) NOT NULL CHECK (type_portail IN ('etudiant', 'parent', 'professeur')),
            permission_key      VARCHAR(100) NOT NULL,
            permission_label    VARCHAR(200) NOT NULL,
            actif               BOOLEAN     DEFAULT TRUE,
            description         TEXT,
            created_at          TIMESTAMPTZ DEFAULT NOW(),
            updated_at          TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE (type_portail, permission_key)
          );
        `);
        console.log('  ✅ Table permissions_portail créée');
        
        // Insérer les permissions par défaut
        await client.query(`
          INSERT INTO ${tenant.schema_name}.permissions_portail (type_portail, permission_key, permission_label, actif, description) VALUES
          -- Portail Étudiant
          ('etudiant', 'emploi_du_temps', 'Consulter emploi du temps', true, 'Accès à l''emploi du temps personnel'),
          ('etudiant', 'supports_cours', 'Télécharger supports de cours', true, 'Téléchargement des documents pédagogiques'),
          ('etudiant', 'notes', 'Consulter les notes', true, 'Consultation des notes et bulletins'),
          ('etudiant', 'paiements', 'Suivi des paiements', true, 'Consultation de l''état des paiements'),
          ('etudiant', 'absences', 'Justificatif d''absence', true, 'Soumission de justificatifs d''absence'),
          ('etudiant', 'attestations', 'Télécharger attestations', true, 'Téléchargement d''attestations diverses'),
          ('etudiant', 'inscription_examens', 'Inscription aux examens', true, 'Inscription en ligne aux sessions d''examens'),
          ('etudiant', 'paiement_en_ligne', 'Paiement en ligne', true, 'Effectuer des paiements en ligne'),
          
          -- Portail Parent
          ('parent', 'suivi_academique', 'Suivi académique', true, 'Suivi de la scolarité de l''enfant'),
          ('parent', 'suivi_financier', 'Suivi financier', true, 'Consultation des frais et paiements'),
          ('parent', 'bulletins', 'Visualisation bulletins', true, 'Accès aux bulletins de notes'),
          ('parent', 'absences', 'Suivi absences/retards', true, 'Consultation des absences et retards'),
          ('parent', 'paiement_frais', 'Paiement frais scolarité', true, 'Paiement en ligne des frais'),
          ('parent', 'autorisation_sortie', 'Autorisation sortie', true, 'Gestion des autorisations de sortie'),
          ('parent', 'messagerie', 'Messagerie', true, 'Communication avec l''administration'),
          ('parent', 'notifications', 'Notifications', true, 'Réception de notifications'),
          
          -- Portail Professeur
          ('professeur', 'publier_cours', 'Publier supports de cours', true, 'Publication de documents pédagogiques'),
          ('professeur', 'saisie_notes', 'Saisie des notes', true, 'Saisie et modification des notes'),
          ('professeur', 'pointage_presences', 'Pointage présences', true, 'Gestion des présences étudiants'),
          ('professeur', 'depot_sujets', 'Dépôt sujets examens', true, 'Dépôt des sujets d''examens'),
          ('professeur', 'listes_etudiants', 'Consultation listes étudiants', true, 'Accès aux listes d''étudiants'),
          ('professeur', 'demande_ressources', 'Demande ressources', true, 'Demande de ressources pédagogiques'),
          ('professeur', 'messagerie_etudiants', 'Messagerie étudiants', true, 'Communication avec les étudiants'),
          ('professeur', 'signature_presence', 'Signature présence', true, 'Signature électronique de présence')
          ON CONFLICT (type_portail, permission_key) DO NOTHING;
        `);
        console.log('  ✅ Permissions par défaut insérées');
        
      } catch (error) {
        console.error(`  ❌ Erreur pour ${tenant.nom}:`, error.message);
      }
    }
    
    console.log('\n✅ Migration terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addPermissionsTable();

// Made with Bob
