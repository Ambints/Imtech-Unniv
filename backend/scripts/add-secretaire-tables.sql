-- =============================================================================
-- MIGRATION : Ajout des tables et colonnes pour le module Secrétaire
-- Colonne : secretaire_id dans parcours
-- Tables  : convocation, dossier_etudiant
-- À exécuter sur le schéma tenant (ex: tenant_ispm)
-- =============================================================================

-- Définir le schéma (modifier selon le tenant)
SET search_path TO tenant_ispm, public;

-- =============================================================================
-- 1. AJOUT DE LA COLONNE secretaire_id À LA TABLE parcours
-- =============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'tenant_ispm' 
        AND table_name = 'parcours' 
        AND column_name = 'secretaire_id'
    ) THEN
        ALTER TABLE parcours ADD COLUMN secretaire_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL;
        RAISE NOTICE 'Colonne secretaire_id ajoutée à la table parcours';
    ELSE
        RAISE NOTICE 'La colonne secretaire_id existe déjà dans la table parcours';
    END IF;
END $$;

-- Index pour la recherche rapide par secrétaire
CREATE INDEX IF NOT EXISTS idx_parcours_secretaire ON parcours(secretaire_id);

-- =============================================================================
-- 2. CRÉATION DE LA TABLE absence_enseignant
-- =============================================================================

CREATE TABLE IF NOT EXISTS absence_enseignant (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    enseignant_id       UUID        NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    seance_id           UUID        REFERENCES emploi_du_temps(id) ON DELETE SET NULL,
    date_absence        DATE        NOT NULL,
    heure_debut         TIME,
    heure_fin           TIME,
    motif               VARCHAR(100) NOT NULL,
    justification       TEXT,
    justificatif_url    VARCHAR(500),
    est_justifiee       BOOLEAN     DEFAULT FALSE,
    statut              VARCHAR(20) DEFAULT 'declaree',
    declaree_par        UUID        NOT NULL REFERENCES utilisateur(id),
    validee_par         UUID        REFERENCES utilisateur(id),
    date_validation     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_absence_enseignant ON absence_enseignant(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_absence_date ON absence_enseignant(date_absence);
CREATE INDEX IF NOT EXISTS idx_absence_statut ON absence_enseignant(statut);

-- =============================================================================
-- 3. CRÉATION DE LA TABLE rattrapage
-- =============================================================================

CREATE TABLE IF NOT EXISTS rattrapage (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    absence_id          UUID        NOT NULL REFERENCES absence_enseignant(id) ON DELETE CASCADE,
    salle_id            UUID        REFERENCES salle(id) ON DELETE SET NULL,
    date_rattrapage     DATE        NOT NULL,
    heure_debut         TIME        NOT NULL,
    heure_fin           TIME        NOT NULL,
    observations        TEXT,
    statut              VARCHAR(20) DEFAULT 'planifie',
    remplaceur_id       UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    planifie_par        UUID        NOT NULL REFERENCES utilisateur(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rattrapage_absence ON rattrapage(absence_id);
CREATE INDEX IF NOT EXISTS idx_rattrapage_date ON rattrapage(date_rattrapage);

-- =============================================================================
-- 4. CRÉATION DE LA TABLE note_derogatoire
-- =============================================================================

CREATE TABLE IF NOT EXISTS note_derogatoire (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE CASCADE,
    ec_id               UUID        REFERENCES element_constitutif(id) ON DELETE SET NULL,
    ue_id               UUID        REFERENCES unite_enseignement(id) ON DELETE SET NULL,
    session_examen_id   UUID        REFERENCES session_examen(id) ON DELETE SET NULL,
    valeur              DECIMAL(5,2) NOT NULL,
    motif_derogation    TEXT        NOT NULL,
    type_derogation     VARCHAR(50) DEFAULT 'cas_particulier',
    est_derogatoire     BOOLEAN     DEFAULT TRUE,
    soumis_a_scolarite  BOOLEAN     DEFAULT FALSE,
    valide_par_scolarite UUID       REFERENCES utilisateur(id),
    date_validation_scolarite TIMESTAMPTZ,
    statut              VARCHAR(20) DEFAULT 'proposee',
    saisie_par          UUID        NOT NULL REFERENCES utilisateur(id),
    valide_par          UUID        REFERENCES utilisateur(id),
    date_saisie         TIMESTAMPTZ DEFAULT NOW(),
    observations        TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_note_derog_etudiant ON note_derogatoire(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_note_derog_statut ON note_derogatoire(statut);

-- =============================================================================
-- 5. CRÉATION DE LA TABLE demande_etudiant
-- =============================================================================

CREATE TABLE IF NOT EXISTS demande_etudiant (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE CASCADE,
    type_demande        VARCHAR(50) NOT NULL,
    description         TEXT        NOT NULL,
    justification       TEXT,
    piece_jointe_url    VARCHAR(500),
    date_soumission     DATE        NOT NULL DEFAULT CURRENT_DATE,
    statut              VARCHAR(20) DEFAULT 'soumise',
    reponse             TEXT,
    traite_par          UUID        REFERENCES utilisateur(id),
    date_traitement     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_demande_etudiant ON demande_etudiant(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_demande_statut ON demande_etudiant(statut);

-- Triggers pour updated_at sur les nouvelles tables
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_updated_at ON absence_enseignant;
CREATE TRIGGER trg_updated_at
    BEFORE UPDATE ON absence_enseignant
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at ON rattrapage;
CREATE TRIGGER trg_updated_at
    BEFORE UPDATE ON rattrapage
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at ON note_derogatoire;
CREATE TRIGGER trg_updated_at
    BEFORE UPDATE ON note_derogatoire
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_updated_at ON demande_etudiant;
CREATE TRIGGER trg_updated_at
    BEFORE UPDATE ON demande_etudiant
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- 6. CRÉATION DE LA TABLE convocation
-- =============================================================================

CREATE TABLE IF NOT EXISTS convocation (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        REFERENCES etudiant(id) ON DELETE CASCADE,
    session_examen_id   UUID        REFERENCES session_examen(id) ON DELETE CASCADE,
    soutenance_id       UUID,       -- Référence optionnelle vers une table soutenance si elle existe
    type                VARCHAR(50) NOT NULL CHECK (type IN ('examen', 'rattrapage', 'soutenance', 'reunion', 'conseil_discipline', 'autre')),
    libelle             VARCHAR(200) NOT NULL,
    message             TEXT,
    date_convocation    DATE        NOT NULL,
    heure_convocation   TIME,
    lieu                VARCHAR(200),
    salle_id            UUID        REFERENCES salle(id) ON DELETE SET NULL,
    statut              VARCHAR(20) DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'envoyee', 'lue', 'confirme', 'annule')),
    date_envoi          TIMESTAMPTZ,
    date_lecture        TIMESTAMPTZ,
    date_confirmation   TIMESTAMPTZ,
    genere_par          UUID        NOT NULL REFERENCES utilisateur(id),
    fichier_url         VARCHAR(500),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les convocations
CREATE INDEX IF NOT EXISTS idx_convocation_etudiant ON convocation(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_convocation_session ON convocation(session_examen_id);
CREATE INDEX IF NOT EXISTS idx_convocation_statut ON convocation(statut);
CREATE INDEX IF NOT EXISTS idx_convocation_date ON convocation(date_convocation);
CREATE INDEX IF NOT EXISTS idx_convocation_genere ON convocation(genere_par);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trg_updated_at ON convocation;
CREATE TRIGGER trg_updated_at
    BEFORE UPDATE ON convocation
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- 7. CRÉATION DE LA TABLE dossier_etudiant
-- =============================================================================

CREATE TABLE IF NOT EXISTS dossier_etudiant (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE CASCADE,
    type_document       VARCHAR(50) NOT NULL CHECK (type_document IN (
        'certificat_scolarite', 'attestation_inscription', 'releve_notes', 
        'copie_diplome', 'carte_etudiant', 'certificat_medical', 
        'piece_identite', 'photo', 'autre'
    )),
    libelle             VARCHAR(200) NOT NULL,
    fichier_url         VARCHAR(500) NOT NULL,
    reference           VARCHAR(100),
    date_demande        DATE,
    date_delivrance     DATE,
    statut              VARCHAR(20) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'en_preparation', 'delivre', 'refuse', 'archive')),
    motif_refus         TEXT,
    demande_par         UUID        REFERENCES utilisateur(id),
    traite_par          UUID        REFERENCES utilisateur(id),
    est_archive         BOOLEAN     DEFAULT FALSE,
    date_archivage      DATE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les dossiers
CREATE INDEX IF NOT EXISTS idx_dossier_etudiant_id ON dossier_etudiant(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_dossier_type ON dossier_etudiant(type_document);
CREATE INDEX IF NOT EXISTS idx_dossier_statut ON dossier_etudiant(statut);
CREATE INDEX IF NOT EXISTS idx_dossier_archive ON dossier_etudiant(est_archive);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trg_updated_at ON dossier_etudiant;
CREATE TRIGGER trg_updated_at
    BEFORE UPDATE ON dossier_etudiant
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- =============================================================================
-- VÉRIFICATION
-- =============================================================================

SELECT 'Migration terminée avec succès:' as message;

SELECT 'Colonnes de la table parcours:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'tenant_ispm' 
AND table_name = 'parcours' 
ORDER BY ordinal_position;

SELECT 'Tables créées:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'tenant_ispm' 
AND table_name IN ('absence_enseignant', 'rattrapage', 'note_derogatoire', 'demande_etudiant', 'convocation', 'dossier_etudiant');
