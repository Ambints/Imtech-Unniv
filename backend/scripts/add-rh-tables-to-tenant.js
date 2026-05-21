const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'imtech_university',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function addRHTablesToTenant(schemaName) {
  console.log(`\n📋 Ajout des tables RH au schéma: ${schemaName}`);
  
  try {
    // Set search path
    await client.query(`SET search_path TO "${schemaName}", public`);
    
    // Check if tables already exist
    const checkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1 
      AND table_name IN ('contrat_personnel', 'conge_personnel', 'fiche_paie', 
                         'heure_complementaire', 'evaluation_personnel', 
                         'declaration_sociale', 'recrutement')
    `, [schemaName]);
    
    if (checkTables.rows.length > 0) {
      console.log(`✅ Tables RH déjà présentes:`, checkTables.rows.map(r => r.table_name).join(', '));
      return;
    }
    
    console.log('📝 Création des tables RH...');
    
    // Create RH tables
    await client.query(`
      -- Table contrat_personnel
      CREATE TABLE IF NOT EXISTS contrat_personnel (
        id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        utilisateur_id      UUID        NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
        type_contrat        VARCHAR(30) NOT NULL
                            CHECK (type_contrat IN ('CDI', 'CDD', 'vacataire', 'stagiaire', 'benevolat')),
        poste               VARCHAR(200) NOT NULL,
        departement_id      UUID        REFERENCES departement(id),
        date_debut          DATE        NOT NULL,
        date_fin            DATE,
        salaire_brut        DECIMAL(12,2),
        salaire_net         DECIMAL(12,2),
        volume_horaire_hebdo SMALLINT,
        actif               BOOLEAN     DEFAULT TRUE,
        fichier_contrat_url VARCHAR(500),
        observations        TEXT,
        created_at          TIMESTAMPTZ DEFAULT NOW(),
        updated_at          TIMESTAMPTZ DEFAULT NOW()
      );

      -- Table conge_personnel
      CREATE TABLE IF NOT EXISTS conge_personnel (
        id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        utilisateur_id      UUID        NOT NULL REFERENCES utilisateur(id),
        type_conge          VARCHAR(50) NOT NULL
                            CHECK (type_conge IN ('annuel', 'maladie', 'maternite', 'paternite', 'sans_solde', 'autre')),
        date_debut          DATE        NOT NULL,
        date_fin            DATE        NOT NULL,
        nb_jours            SMALLINT    GENERATED ALWAYS AS (date_fin - date_debut + 1) STORED,
        motif               TEXT,
        statut              VARCHAR(20) DEFAULT 'demande'
                            CHECK (statut IN ('demande', 'approuve', 'refuse', 'annule')),
        approuve_par        UUID        REFERENCES utilisateur(id),
        date_approbation    TIMESTAMPTZ,
        created_at          TIMESTAMPTZ DEFAULT NOW()
      );

      -- Table fiche_paie
      CREATE TABLE IF NOT EXISTS fiche_paie (
        id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        contrat_id          UUID        NOT NULL REFERENCES contrat_personnel(id),
        annee               SMALLINT    NOT NULL,
        mois                SMALLINT    NOT NULL CHECK (mois BETWEEN 1 AND 12),
        salaire_brut        DECIMAL(12,2) NOT NULL,
        cotisations         DECIMAL(12,2) DEFAULT 0,
        primes              DECIMAL(12,2) DEFAULT 0,
        retenues            DECIMAL(12,2) DEFAULT 0,
        net_a_payer         DECIMAL(12,2) NOT NULL,
        heures_supp         DECIMAL(6,2) DEFAULT 0,
        montant_heures_supp DECIMAL(12,2) DEFAULT 0,
        statut              VARCHAR(20) DEFAULT 'brouillon'
                            CHECK (statut IN ('brouillon', 'valide', 'paye')),
        fichier_url         VARCHAR(500),
        created_at          TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (contrat_id, annee, mois)
      );

      -- Table heure_complementaire (pour les enseignants vacataires)
      CREATE TABLE IF NOT EXISTS heure_complementaire (
        id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        enseignant_id       UUID        NOT NULL REFERENCES enseignant(id),
        date_travail        DATE        NOT NULL,
        nb_heures           DECIMAL(5,2) NOT NULL,
        taux_horaire        DECIMAL(10,2) NOT NULL,
        motif               VARCHAR(200),
        statut              VARCHAR(20) DEFAULT 'saisie'
                            CHECK (statut IN ('saisie', 'valide', 'paye')),
        valide_par          UUID        REFERENCES utilisateur(id),
        date_validation     TIMESTAMPTZ,
        created_at          TIMESTAMPTZ DEFAULT NOW()
      );

      -- Table evaluation_personnel
      CREATE TABLE IF NOT EXISTS evaluation_personnel (
        id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        utilisateur_id      UUID        NOT NULL REFERENCES utilisateur(id),
        evaluateur_id       UUID        NOT NULL REFERENCES utilisateur(id),
        annee_evaluation    SMALLINT    NOT NULL,
        date_evaluation     DATE        NOT NULL,
        objectifs           TEXT,
        competences         TEXT,
        auto_evaluation     JSONB,
        date_auto_evaluation TIMESTAMPTZ,
        appreciation        TEXT,
        points_forts        TEXT,
        axes_amelioration   TEXT,
        note_globale        DECIMAL(3,1),
        statut              VARCHAR(20) DEFAULT 'en_cours'
                            CHECK (statut IN ('en_cours', 'auto_evalue', 'finalise')),
        date_finalisation   TIMESTAMPTZ,
        created_at          TIMESTAMPTZ DEFAULT NOW()
      );

      -- Table declaration_sociale
      CREATE TABLE IF NOT EXISTS declaration_sociale (
        id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        type_declaration        VARCHAR(50) NOT NULL,
        periode_debut           DATE        NOT NULL,
        periode_fin             DATE        NOT NULL,
        organisme               VARCHAR(100) NOT NULL,
        montant_total_cotisations DECIMAL(15,2) NOT NULL,
        nb_salaries             SMALLINT    NOT NULL,
        statut                  VARCHAR(20) DEFAULT 'preparation'
                                CHECK (statut IN ('preparation', 'transmis', 'valide')),
        fichier_export_url      VARCHAR(500),
        created_at              TIMESTAMPTZ DEFAULT NOW()
      );

      -- Table recrutement
      CREATE TABLE IF NOT EXISTS recrutement (
        id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
        poste               VARCHAR(200) NOT NULL,
        type_contrat        VARCHAR(30) NOT NULL,
        departement_id      UUID        REFERENCES departement(id),
        nb_postes           SMALLINT    DEFAULT 1,
        date_cloture        DATE,
        description         TEXT,
        statut              VARCHAR(20) DEFAULT 'ouvert'
                            CHECK (statut IN ('ouvert', 'en_cours', 'clos', 'pourvus')),
        created_at          TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_contrat_utilisateur ON contrat_personnel(utilisateur_id);
      CREATE INDEX IF NOT EXISTS idx_contrat_actif ON contrat_personnel(actif);
      CREATE INDEX IF NOT EXISTS idx_conge_utilisateur ON conge_personnel(utilisateur_id);
      CREATE INDEX IF NOT EXISTS idx_conge_statut ON conge_personnel(statut);
      CREATE INDEX IF NOT EXISTS idx_fiche_paie_contrat ON fiche_paie(contrat_id);
      CREATE INDEX IF NOT EXISTS idx_heure_comp_enseignant ON heure_complementaire(enseignant_id);
      CREATE INDEX IF NOT EXISTS idx_heure_comp_statut ON heure_complementaire(statut);
    `);
    
    console.log('✅ Tables RH créées avec succès!');
    
  } catch (error) {
    console.error(`❌ Erreur lors de la création des tables RH:`, error.message);
    throw error;
  }
}

async function main() {
  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL');
    
    // Get all tenant schemas
    const result = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name LIKE 'tenant_%' OR schema_name LIKE 'univ_%'
      ORDER BY schema_name
    `);
    
    if (result.rows.length === 0) {
      console.log('⚠️  Aucun schéma tenant trouvé');
      return;
    }
    
    console.log(`\n📊 ${result.rows.length} schéma(s) tenant trouvé(s)`);
    
    for (const row of result.rows) {
      await addRHTablesToTenant(row.schema_name);
    }
    
    console.log('\n✅ Migration terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();

// Made with Bob
