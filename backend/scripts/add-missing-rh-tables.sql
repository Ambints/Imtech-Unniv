-- =============================================================================
-- Script pour ajouter les tables RH manquantes au schéma tenant
-- Tables: recrutement, heure_complementaire, evaluation_personnel, declaration_sociale
-- =============================================================================

-- Table pour gérer les heures complémentaires des enseignants
CREATE TABLE IF NOT EXISTS heure_complementaire (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    enseignant_id       UUID        NOT NULL REFERENCES enseignant(id) ON DELETE CASCADE,
    date_travail        DATE        NOT NULL,
    nb_heures           DECIMAL(5,2) NOT NULL CHECK (nb_heures > 0),
    taux_horaire        DECIMAL(10,2) NOT NULL CHECK (taux_horaire > 0),
    motif               TEXT,
    statut              VARCHAR(20) DEFAULT 'saisie'
                        CHECK (statut IN ('saisie', 'valide', 'refuse', 'paye')),
    valide_par          UUID        REFERENCES utilisateur(id),
    date_validation     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_heure_comp_enseignant ON heure_complementaire(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_heure_comp_date ON heure_complementaire(date_travail);
CREATE INDEX IF NOT EXISTS idx_heure_comp_statut ON heure_complementaire(statut);

-- Table pour les évaluations annuelles du personnel
CREATE TABLE IF NOT EXISTS evaluation_personnel (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id      UUID        NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    evaluateur_id       UUID        NOT NULL REFERENCES utilisateur(id),
    annee_evaluation    SMALLINT    NOT NULL,
    date_evaluation     TIMESTAMPTZ DEFAULT NOW(),
    objectifs           JSONB,
    competences         JSONB,
    auto_evaluation     JSONB,
    date_auto_evaluation TIMESTAMPTZ,
    appreciation        TEXT,
    points_forts        TEXT,
    axes_amelioration   TEXT,
    note_globale        DECIMAL(3,1) CHECK (note_globale >= 0 AND note_globale <= 5),
    statut              VARCHAR(20) DEFAULT 'en_cours'
                        CHECK (statut IN ('en_cours', 'auto_evalue', 'finalise', 'archive')),
    date_finalisation   TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (utilisateur_id, annee_evaluation)
);

CREATE INDEX IF NOT EXISTS idx_eval_utilisateur ON evaluation_personnel(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_eval_annee ON evaluation_personnel(annee_evaluation);
CREATE INDEX IF NOT EXISTS idx_eval_statut ON evaluation_personnel(statut);

-- Table pour les déclarations sociales (URSSAF, MSA, etc.)
CREATE TABLE IF NOT EXISTS declaration_sociale (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    type_declaration        VARCHAR(50) NOT NULL
                            CHECK (type_declaration IN ('URSSAF', 'MSA', 'retraite', 'prevoyance', 'mutuelle', 'autre')),
    periode_debut           DATE        NOT NULL,
    periode_fin             DATE        NOT NULL,
    organisme               VARCHAR(200) NOT NULL,
    montant_total_cotisations DECIMAL(12,2) NOT NULL DEFAULT 0,
    nb_salaries             SMALLINT    NOT NULL DEFAULT 0,
    statut                  VARCHAR(20) DEFAULT 'preparation'
                            CHECK (statut IN ('preparation', 'validee', 'transmise', 'payee')),
    date_transmission       TIMESTAMPTZ,
    date_paiement           TIMESTAMPTZ,
    fichier_export_url      VARCHAR(500),
    observations            TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decl_sociale_type ON declaration_sociale(type_declaration);
CREATE INDEX IF NOT EXISTS idx_decl_sociale_periode ON declaration_sociale(periode_debut, periode_fin);
CREATE INDEX IF NOT EXISTS idx_decl_sociale_statut ON declaration_sociale(statut);

-- Table pour gérer les processus de recrutement
CREATE TABLE IF NOT EXISTS recrutement (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    poste               VARCHAR(200) NOT NULL,
    type_contrat        VARCHAR(30) NOT NULL
                        CHECK (type_contrat IN ('CDI', 'CDD', 'vacataire', 'stagiaire')),
    departement_id      UUID        REFERENCES departement(id),
    description         TEXT,
    competences_requises TEXT,
    nb_postes           SMALLINT    NOT NULL DEFAULT 1 CHECK (nb_postes > 0),
    date_ouverture      DATE        DEFAULT CURRENT_DATE,
    date_cloture        DATE,
    salaire_min         DECIMAL(12,2),
    salaire_max         DECIMAL(12,2),
    statut              VARCHAR(20) DEFAULT 'ouvert'
                        CHECK (statut IN ('ouvert', 'en_cours', 'cloture', 'pourvu', 'annule')),
    responsable_id      UUID        REFERENCES utilisateur(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recrutement_statut ON recrutement(statut);
CREATE INDEX IF NOT EXISTS idx_recrutement_departement ON recrutement(departement_id);
CREATE INDEX IF NOT EXISTS idx_recrutement_date_cloture ON recrutement(date_cloture);

-- Table pour les candidatures aux recrutements
CREATE TABLE IF NOT EXISTS candidature (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    recrutement_id      UUID        NOT NULL REFERENCES recrutement(id) ON DELETE CASCADE,
    nom                 VARCHAR(100) NOT NULL,
    prenom              VARCHAR(100) NOT NULL,
    email               VARCHAR(254) NOT NULL,
    telephone           VARCHAR(30),
    cv_url              VARCHAR(500),
    lettre_motivation_url VARCHAR(500),
    statut              VARCHAR(20) DEFAULT 'recue'
                        CHECK (statut IN ('recue', 'preselectionne', 'entretien', 'retenu', 'refuse')),
    notes_evaluation    TEXT,
    date_entretien      TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidature_recrutement ON candidature(recrutement_id);
CREATE INDEX IF NOT EXISTS idx_candidature_statut ON candidature(statut);
CREATE INDEX IF NOT EXISTS idx_candidature_email ON candidature(email);

-- Triggers pour mise à jour automatique de updated_at
CREATE TRIGGER update_heure_complementaire_updated_at
    BEFORE UPDATE ON heure_complementaire
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evaluation_personnel_updated_at
    BEFORE UPDATE ON evaluation_personnel
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_declaration_sociale_updated_at
    BEFORE UPDATE ON declaration_sociale
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recrutement_updated_at
    BEFORE UPDATE ON recrutement
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidature_updated_at
    BEFORE UPDATE ON candidature
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ajouter les permissions pour les nouvelles tables dans la table permission_portail (si elle existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permission_portail') THEN
        INSERT INTO permission_portail (code, libelle, description, module, created_at)
        VALUES
            ('rh.heures_complementaires.view', 'Voir heures complémentaires', 'Consulter les heures complémentaires', 'rh', NOW()),
            ('rh.heures_complementaires.create', 'Créer heures complémentaires', 'Saisir des heures complémentaires', 'rh', NOW()),
            ('rh.heures_complementaires.validate', 'Valider heures complémentaires', 'Valider les heures complémentaires', 'rh', NOW()),
            ('rh.evaluations.view', 'Voir évaluations', 'Consulter les évaluations du personnel', 'rh', NOW()),
            ('rh.evaluations.create', 'Créer évaluations', 'Créer des évaluations', 'rh', NOW()),
            ('rh.evaluations.finalize', 'Finaliser évaluations', 'Finaliser les évaluations', 'rh', NOW()),
            ('rh.declarations.view', 'Voir déclarations sociales', 'Consulter les déclarations sociales', 'rh', NOW()),
            ('rh.declarations.create', 'Créer déclarations', 'Créer des déclarations sociales', 'rh', NOW()),
            ('rh.recrutements.view', 'Voir recrutements', 'Consulter les recrutements', 'rh', NOW()),
            ('rh.recrutements.create', 'Créer recrutements', 'Lancer des recrutements', 'rh', NOW()),
            ('rh.candidatures.view', 'Voir candidatures', 'Consulter les candidatures', 'rh', NOW()),
            ('rh.candidatures.manage', 'Gérer candidatures', 'Gérer les candidatures', 'rh', NOW())
        ON CONFLICT (code) DO NOTHING;
    END IF;
END $$;

-- Made with Bob
