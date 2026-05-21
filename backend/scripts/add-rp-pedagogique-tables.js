/**
 * Script de migration : Ajout des tables pédagogiques au tenant existant
 * Tables : referentiel_competences, sujet_examen, proces_verbal
 */

const { Client } = require('pg');

const SQL_SCRIPT = `
-- =============================================================================
-- MODULE : PEDAGOGIQUE - RÉFÉRENTIELS & EXAMENS
-- =============================================================================

-- Référentiel de compétences par parcours
CREATE TABLE IF NOT EXISTS referentiel_competences (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    parcours_id         UUID        NOT NULL REFERENCES parcours(id) ON DELETE CASCADE,
    code                VARCHAR(30) NOT NULL,
    intitule            VARCHAR(200) NOT NULL,
    description         TEXT,
    niveau              VARCHAR(20) CHECK (niveau IN ('Licence', 'Master', 'Doctorat', 'BTS', 'DUT')),
    competences         JSONB       DEFAULT '[]',
    valide_par          UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_validation     TIMESTAMPTZ,
    statut              VARCHAR(20) DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'valide', 'archive')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Sujets d'examens avec workflow de validation
CREATE TABLE IF NOT EXISTS sujet_examen (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_examen_id   UUID        NOT NULL,
    ue_id               UUID        REFERENCES unite_enseignement(id) ON DELETE SET NULL,
    ec_id               UUID        REFERENCES element_constitutif(id) ON DELETE SET NULL,
    enseignant_id       UUID        NOT NULL REFERENCES utilisateur(id),
    titre               VARCHAR(300) NOT NULL,
    description         TEXT,
    fichier_url         VARCHAR(500),
    duree_minutes       SMALLINT    DEFAULT 120,
    bareme_total        DECIMAL(5,2) DEFAULT 20.0,
    statut              VARCHAR(20) DEFAULT 'soumis' CHECK (statut IN ('soumis', 'en_relecture', 'valide', 'rejete')),
    soumis_par          UUID        NOT NULL REFERENCES utilisateur(id),
    date_soumission     TIMESTAMPTZ DEFAULT NOW(),
    relu_par            UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_relecture      TIMESTAMPTZ,
    valide_par          UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_validation     TIMESTAMPTZ,
    commentaires        TEXT,
    motif_rejet         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Procès-verbaux de délibération
CREATE TABLE IF NOT EXISTS proces_verbal (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_examen_id   UUID        NOT NULL,
    parcours_id         UUID        NOT NULL REFERENCES parcours(id) ON DELETE CASCADE,
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    numero              VARCHAR(50) NOT NULL UNIQUE,
    date_deliberation   DATE        NOT NULL,
    membres_jury        JSONB       DEFAULT '[]',
    resultats           JSONB       DEFAULT '[]',
    nb_admis            INTEGER     DEFAULT 0,
    nb_ajournes         INTEGER     DEFAULT 0,
    nb_absents          INTEGER     DEFAULT 0,
    taux_reussite       DECIMAL(5,2) DEFAULT 0,
    observations        TEXT,
    fichier_url         VARCHAR(500),
    statut              VARCHAR(20) DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'valide', 'archive')),
    redige_par          UUID        NOT NULL REFERENCES utilisateur(id),
    valide_par          UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_validation     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les tables pédagogiques
CREATE INDEX IF NOT EXISTS idx_referentiel_parcours ON referentiel_competences(parcours_id);
CREATE INDEX IF NOT EXISTS idx_referentiel_statut ON referentiel_competences(statut);
CREATE INDEX IF NOT EXISTS idx_referentiel_created ON referentiel_competences(created_at);

CREATE INDEX IF NOT EXISTS idx_sujet_session ON sujet_examen(session_examen_id);
CREATE INDEX IF NOT EXISTS idx_sujet_enseignant ON sujet_examen(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_sujet_statut ON sujet_examen(statut);
CREATE INDEX IF NOT EXISTS idx_sujet_date ON sujet_examen(date_soumission);

CREATE INDEX IF NOT EXISTS idx_pv_parcours ON proces_verbal(parcours_id);
CREATE INDEX IF NOT EXISTS idx_pv_session ON proces_verbal(session_examen_id);
CREATE INDEX IF NOT EXISTS idx_pv_annee ON proces_verbal(annee_academique_id);
CREATE INDEX IF NOT EXISTS idx_pv_statut ON proces_verbal(statut);
CREATE INDEX IF NOT EXISTS idx_pv_date ON proces_verbal(date_deliberation);

-- Trigger updated_at pour les nouvelles tables
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'referentiel_competences', 'sujet_examen', 'proces_verbal'
    ]
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_updated_at ON %I;
             CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()', t, t
        );
    END LOOP;
END $$;
`;

async function addPedagogiqueTables() {
  const tenantSchema = process.argv[2] || 'tenant_ispm';
  
  console.log(`[Migration] Ajout des tables pédagogiques au schéma: ${tenantSchema}`);
  
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'imtech_university',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('[Migration] Connecté à la base de données');

    // Vérifier que le schéma existe
    const schemaCheck = await client.query(
      'SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1',
      [tenantSchema]
    );
    
    if (schemaCheck.rows.length === 0) {
      console.error(`[Migration] ERREUR: Le schéma ${tenantSchema} n'existe pas!`);
      process.exit(1);
    }

    // Définir le search_path
    await client.query(`SET search_path TO ${tenantSchema}, public`);
    console.log(`[Migration] Search path défini: ${tenantSchema}`);

    // Exécuter le script SQL
    console.log('[Migration] Création des tables...');
    await client.query(SQL_SCRIPT);
    
    // Vérifier les tables créées
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = '${tenantSchema}' 
      AND table_name IN ('referentiel_competences', 'sujet_examen', 'proces_verbal')
    `);
    
    console.log('[Migration] Tables créées/vérifiées:');
    tablesCheck.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    console.log('[Migration] ✅ Tables pédagogiques ajoutées avec succès!');
    
  } catch (error) {
    console.error('[Migration] ❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addPedagogiqueTables();
