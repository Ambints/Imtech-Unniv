-- =============================================================================
-- MIGRATION : Ajout des tables pédagogiques au tenant
-- Tables : referentiel_competences, sujet_examen, proces_verbal
-- À exécuter sur le schéma tenant_ispm (ou autre schéma tenant)
-- =============================================================================

-- Définir le schéma (modifier selon le tenant)
SET search_path TO tenant_ispm, public;

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

-- =============================================================================
-- INDEX DE PERFORMANCE
-- =============================================================================

-- Index pour referentiel_competences
CREATE INDEX IF NOT EXISTS idx_referentiel_parcours ON referentiel_competences(parcours_id);
CREATE INDEX IF NOT EXISTS idx_referentiel_statut ON referentiel_competences(statut);
CREATE INDEX IF NOT EXISTS idx_referentiel_created ON referentiel_competences(created_at);

-- Index pour sujet_examen
CREATE INDEX IF NOT EXISTS idx_sujet_session ON sujet_examen(session_examen_id);
CREATE INDEX IF NOT EXISTS idx_sujet_enseignant ON sujet_examen(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_sujet_statut ON sujet_examen(statut);
CREATE INDEX IF NOT EXISTS idx_sujet_date ON sujet_examen(date_soumission);

-- Index pour proces_verbal
CREATE INDEX IF NOT EXISTS idx_pv_parcours ON proces_verbal(parcours_id);
CREATE INDEX IF NOT EXISTS idx_pv_session ON proces_verbal(session_examen_id);
CREATE INDEX IF NOT EXISTS idx_pv_annee ON proces_verbal(annee_academique_id);
CREATE INDEX IF NOT EXISTS idx_pv_statut ON proces_verbal(statut);
CREATE INDEX IF NOT EXISTS idx_pv_date ON proces_verbal(date_deliberation);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Fonction de mise à jour automatique
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour les nouvelles tables
DROP TRIGGER IF EXISTS trg_updated_at ON referentiel_competences;
CREATE TRIGGER trg_updated_at
    BEFORE UPDATE ON referentiel_competences
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at ON sujet_examen;
CREATE TRIGGER trg_updated_at
    BEFORE UPDATE ON sujet_examen
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at ON proces_verbal;
CREATE TRIGGER trg_updated_at
    BEFORE UPDATE ON proces_verbal
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- VÉRIFICATION
-- =============================================================================

SELECT 'Tables créées avec succès:' as message;
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'tenant_ispm' 
AND table_name IN ('referentiel_competences', 'sujet_examen', 'proces_verbal')
ORDER BY table_name, ordinal_position;
