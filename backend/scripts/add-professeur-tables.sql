-- =============================================================================
-- TABLES MANQUANTES POUR LE PORTAIL PROFESSEUR
-- =============================================================================

-- Table: support_cours (ressources pédagogiques)
CREATE TABLE IF NOT EXISTS support_cours (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    titre               VARCHAR(300) NOT NULL,
    description         TEXT,
    type_fichier        VARCHAR(50) NOT NULL CHECK (type_fichier IN ('pdf', 'docx', 'pptx', 'xlsx', 'zip', 'video', 'autre')),
    fichier_url         VARCHAR(500) NOT NULL,
    taille_fichier      BIGINT,
    ec_id               UUID        REFERENCES element_constitutif(id) ON DELETE CASCADE,
    auteur_id           UUID        NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    date_depot          TIMESTAMPTZ DEFAULT NOW(),
    partage_parcours_ids UUID[]     DEFAULT '{}',
    date_partage        TIMESTAMPTZ,
    nb_telechargements  INTEGER     DEFAULT 0,
    actif               BOOLEAN     DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_cours_ec ON support_cours(ec_id);
CREATE INDEX IF NOT EXISTS idx_support_cours_auteur ON support_cours(auteur_id);
CREATE INDEX IF NOT EXISTS idx_support_cours_date ON support_cours(date_depot);

-- Table: stage (stages et mémoires)
CREATE TABLE IF NOT EXISTS stage (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE CASCADE,
    parcours_id         UUID        NOT NULL REFERENCES parcours(id) ON DELETE RESTRICT,
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    type_stage          VARCHAR(30) NOT NULL CHECK (type_stage IN ('stage', 'memoire', 'projet_fin_etude', 'these')),
    titre               VARCHAR(500) NOT NULL,
    entreprise          VARCHAR(300),
    lieu                VARCHAR(300),
    encadrant_id        UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    rapporteur_id       UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_debut          DATE        NOT NULL,
    date_fin            DATE        NOT NULL,
    duree_mois          SMALLINT,
    statut              VARCHAR(30) DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'termine', 'abandonne', 'valide')),
    note_finale         DECIMAL(5,2),
    appreciation        TEXT,
    fichier_rapport_url VARCHAR(500),
    date_soutenance     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    CHECK (date_fin > date_debut)
);

CREATE INDEX IF NOT EXISTS idx_stage_etudiant ON stage(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_stage_encadrant ON stage(encadrant_id);
CREATE INDEX IF NOT EXISTS idx_stage_rapporteur ON stage(rapporteur_id);
CREATE INDEX IF NOT EXISTS idx_stage_statut ON stage(statut);

-- Table: fiche_suivi_stage
CREATE TABLE IF NOT EXISTS fiche_suivi_stage (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id            UUID        NOT NULL REFERENCES stage(id) ON DELETE CASCADE,
    date_rencontre      DATE        NOT NULL,
    travail_effectue    TEXT        NOT NULL,
    observations        TEXT,
    note_avancement     DECIMAL(5,2) CHECK (note_avancement >= 0 AND note_avancement <= 20),
    auteur_id           UUID        NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fiche_suivi_stage ON fiche_suivi_stage(stage_id);
CREATE INDEX IF NOT EXISTS idx_fiche_suivi_date ON fiche_suivi_stage(date_rencontre);

-- Table: soutenance
CREATE TABLE IF NOT EXISTS soutenance (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id            UUID        NOT NULL UNIQUE REFERENCES stage(id) ON DELETE CASCADE,
    date_soutenance     TIMESTAMPTZ NOT NULL,
    salle_id            UUID        REFERENCES salle(id) ON DELETE SET NULL,
    president_jury_id   UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    membres_jury        JSONB       DEFAULT '[]',
    duree_minutes       SMALLINT    DEFAULT 60,
    statut              VARCHAR(30) DEFAULT 'planifie' CHECK (statut IN ('planifie', 'realise', 'annule')),
    note_finale         DECIMAL(5,2),
    mention             VARCHAR(30) CHECK (mention IN ('passable', 'assez_bien', 'bien', 'tres_bien', 'excellent')),
    observations        TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_soutenance_stage ON soutenance(stage_id);
CREATE INDEX IF NOT EXISTS idx_soutenance_date ON soutenance(date_soutenance);
CREATE INDEX IF NOT EXISTS idx_soutenance_statut ON soutenance(statut);

-- Table: evaluation_soutenance
CREATE TABLE IF NOT EXISTS evaluation_soutenance (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    soutenance_id       UUID        NOT NULL REFERENCES soutenance(id) ON DELETE CASCADE,
    evaluateur_id       UUID        NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    note                DECIMAL(5,2) NOT NULL CHECK (note >= 0 AND note <= 20),
    appreciation        TEXT,
    date_evaluation     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(soutenance_id, evaluateur_id)
);

CREATE INDEX IF NOT EXISTS idx_evaluation_soutenance ON evaluation_soutenance(soutenance_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_evaluateur ON evaluation_soutenance(evaluateur_id);

-- Table: demande_ressource (demandes de matériel, salles, etc.)
CREATE TABLE IF NOT EXISTS demande_ressource (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    type_ressource      VARCHAR(50) NOT NULL CHECK (type_ressource IN ('salle', 'materiel', 'laboratoire', 'equipement', 'autre')),
    date_souhaitee      DATE        NOT NULL,
    heure_debut         TIME,
    heure_fin           TIME,
    motif               TEXT        NOT NULL,
    nb_participants     SMALLINT,
    materiel_requis     TEXT,
    demandeur_id        UUID        NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    statut              VARCHAR(30) DEFAULT 'soumise' CHECK (statut IN ('soumise', 'en_cours', 'approuvee', 'rejetee', 'livree')),
    traite_par          UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_traitement     TIMESTAMPTZ,
    commentaire_rejet   TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demande_ressource_demandeur ON demande_ressource(demandeur_id);
CREATE INDEX IF NOT EXISTS idx_demande_ressource_statut ON demande_ressource(statut);
CREATE INDEX IF NOT EXISTS idx_demande_ressource_date ON demande_ressource(date_souhaitee);

-- Ajout de colonnes manquantes à sujet_examen
ALTER TABLE sujet_examen 
ADD COLUMN IF NOT EXISTS fichier_correction_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS date_depot_correction TIMESTAMPTZ;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_support_cours_updated_at ON support_cours;
CREATE TRIGGER update_support_cours_updated_at
BEFORE UPDATE ON support_cours
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stage_updated_at ON stage;
CREATE TRIGGER update_stage_updated_at
BEFORE UPDATE ON stage
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_soutenance_updated_at ON soutenance;
CREATE TRIGGER update_soutenance_updated_at
BEFORE UPDATE ON soutenance
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_demande_ressource_updated_at ON demande_ressource;
CREATE TRIGGER update_demande_ressource_updated_at
BEFORE UPDATE ON demande_ressource
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Made with Bob
