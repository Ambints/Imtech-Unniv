-- =============================================================================
-- SCHÉMA TENANT - Création automatique d'une nouvelle université
-- Ce script crée toutes les tables nécessaires pour un nouveau tenant
-- =============================================================================

-- Les extensions sont créées au niveau public par le service
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- =============================================================================
-- FONCTION UTILITAIRE : Mise à jour automatique de updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- MODULE : AUTHENTIFICATION & UTILISATEURS
-- =============================================================================

CREATE TABLE IF NOT EXISTS utilisateur (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(254) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    nom                 VARCHAR(100) NOT NULL,
    prenom              VARCHAR(100) NOT NULL,
    telephone           VARCHAR(30),
    photo_url           VARCHAR(500),
    role                VARCHAR(50)  NOT NULL
                        CHECK (role IN (
                            'president', 'resp_pedagogique', 'secretaire_parcours',
                            'surveillant_general', 'scolarite', 'rh',
                            'economat', 'caissier', 'communication',
                            'logistique', 'entretien', 'admin',
                            'etudiant', 'parent', 'enseignant'
                        )),
    actif               BOOLEAN      DEFAULT TRUE,
    email_verifie       BOOLEAN      DEFAULT FALSE,
    derniere_connexion  TIMESTAMPTZ,
    token_reset         TEXT,
    token_reset_expiry  TIMESTAMPTZ,
    password_reset_required BOOLEAN DEFAULT FALSE,
    last_password_reset TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_jwt (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id  UUID        NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    refresh_token   TEXT        NOT NULL UNIQUE,
    ip_address      INET,
    user_agent      TEXT,
    expires_at      TIMESTAMPTZ NOT NULL,
    revoque         BOOLEAN     DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- MODULE : STRUCTURE ACADÉMIQUE
-- =============================================================================

CREATE TABLE IF NOT EXISTS annee_academique (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    libelle         VARCHAR(20) NOT NULL UNIQUE,
    date_debut      DATE        NOT NULL,
    date_fin        DATE        NOT NULL,
    active          BOOLEAN     DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Table des niveaux d'études configurables par tenant
CREATE TABLE IF NOT EXISTS niveau_etude (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(10) NOT NULL UNIQUE,
    libelle         VARCHAR(100) NOT NULL,
    description     TEXT,
    ordre           SMALLINT    NOT NULL,
    type_diplome    VARCHAR(20) CHECK (type_diplome IN ('Licence', 'Master', 'Doctorat', 'BTS', 'DUT', 'Autre')),
    actif           BOOLEAN     DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour tri par ordre
CREATE INDEX IF NOT EXISTS idx_niveau_etude_ordre ON niveau_etude(ordre) WHERE actif = TRUE;

-- Données par défaut : niveaux standards
INSERT INTO niveau_etude (code, libelle, description, ordre, type_diplome) VALUES
    ('L1', 'L1 - 1ère année', 'Première année de Licence', 1, 'Licence'),
    ('L2', 'L2 - 2ème année', 'Deuxième année de Licence', 2, 'Licence'),
    ('L3', 'L3 - 3ème année', 'Troisième année de Licence', 3, 'Licence'),
    ('M1', 'M1 - 1ère année Master', 'Première année de Master', 4, 'Master'),
    ('M2', 'M2 - 2ème année Master', 'Deuxième année de Master', 5, 'Master')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS departement (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) NOT NULL UNIQUE,
    nom             VARCHAR(200) NOT NULL,
    description     TEXT,
    responsable_id  UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    actif           BOOLEAN     DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parcours (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    departement_id      UUID        NOT NULL REFERENCES departement(id) ON DELETE RESTRICT,
    code                VARCHAR(30) NOT NULL UNIQUE,
    nom                 VARCHAR(200) NOT NULL,
    niveau              VARCHAR(20) NOT NULL CHECK (niveau IN ('Licence', 'Master', 'Doctorat', 'BTS', 'DUT')),
    duree_annees        SMALLINT    NOT NULL DEFAULT 3,
    responsable_id      UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    secretaire_id       UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    description         TEXT,
    actif               BOOLEAN     DEFAULT TRUE,
    annee_ouverture     INTEGER,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Table de liaison pour la gestion des secrétaires de parcours
CREATE TABLE IF NOT EXISTS secretaire_parcours (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    secretaire_id       UUID        NOT NULL,
    parcours_id         UUID        NOT NULL REFERENCES parcours(id) ON DELETE CASCADE,
    assigned_at         TIMESTAMPTZ DEFAULT NOW(),
    assigned_by         UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    actif               BOOLEAN     DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (secretaire_id, parcours_id, actif)
);

CREATE INDEX IF NOT EXISTS idx_secretaire_parcours_secretaire ON secretaire_parcours(secretaire_id) WHERE actif = TRUE;
CREATE INDEX IF NOT EXISTS idx_secretaire_parcours_parcours ON secretaire_parcours(parcours_id) WHERE actif = TRUE;

CREATE TABLE IF NOT EXISTS unite_enseignement (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    parcours_id     UUID        NOT NULL REFERENCES parcours(id) ON DELETE RESTRICT,
    code            VARCHAR(30) NOT NULL,
    intitule        VARCHAR(200) NOT NULL,
    credits_ects    SMALLINT    NOT NULL DEFAULT 3,
    coefficient     DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    volume_cm       SMALLINT    DEFAULT 0,
    volume_td       SMALLINT    DEFAULT 0,
    volume_tp       SMALLINT    DEFAULT 0,
    semestre        SMALLINT    NOT NULL CHECK (semestre BETWEEN 1 AND 12),
    annee_niveau    SMALLINT    NOT NULL CHECK (annee_niveau BETWEEN 1 AND 8),
    type_ue         VARCHAR(20) DEFAULT 'obligatoire' CHECK (type_ue IN ('obligatoire', 'optionnel', 'libre')),
    enseignant_id   UUID        REFERENCES enseignant(id) ON DELETE SET NULL,
    actif           BOOLEAN     DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (parcours_id, code)
);

-- Index pour améliorer les performances des requêtes par enseignant
CREATE INDEX IF NOT EXISTS idx_ue_enseignant ON unite_enseignement(enseignant_id);

-- Commentaire pour documenter la règle métier
COMMENT ON COLUMN unite_enseignement.enseignant_id IS
'enseignant responsable de l''UE. RÈGLE MÉTIER: Une UE ne peut avoir qu''un seul enseignant responsable.';

CREATE TABLE IF NOT EXISTS element_constitutif (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ue_id           UUID        NOT NULL REFERENCES unite_enseignement(id) ON DELETE CASCADE,
    code            VARCHAR(30) NOT NULL,
    intitule        VARCHAR(200) NOT NULL,
    coefficient     DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    actif           BOOLEAN     DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (ue_id, code)
);

CREATE TABLE IF NOT EXISTS calendrier_academique (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    evenement           VARCHAR(200) NOT NULL,
    type_evenement      VARCHAR(50) NOT NULL
                        CHECK (type_evenement IN (
                            'rentree', 'cours', 'vacances', 'examens',
                            'deliberation', 'ceremonie', 'pastoral', 'autre'
                        )),
    date_debut          DATE        NOT NULL,
    date_fin            DATE        NOT NULL,
    parcours_id         UUID        REFERENCES parcours(id),
    description         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- MODULE : ÉTUDIANTS & INSCRIPTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS etudiant (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id      UUID        UNIQUE REFERENCES utilisateur(id) ON DELETE SET NULL,
    matricule           VARCHAR(30) NOT NULL UNIQUE,
    nom                 VARCHAR(100) NOT NULL,
    prenom              VARCHAR(100) NOT NULL,
    date_naissance      DATE        NOT NULL,
    lieu_naissance      VARCHAR(100),
    sexe                CHAR(1)     CHECK (sexe IN ('M', 'F')),
    nationalite         VARCHAR(100) DEFAULT 'Malagasy',
    adresse             TEXT,
    telephone           VARCHAR(30),
    email               VARCHAR(254),
    nom_parent          VARCHAR(200),
    telephone_parent    VARCHAR(30),
    email_parent        VARCHAR(254),
    religion            VARCHAR(50),
    situation_familiale VARCHAR(30),
    photo_url           VARCHAR(500),
    dossier_medical_url VARCHAR(500),
    actif               BOOLEAN     DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inscription (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE RESTRICT,
    parcours_id         UUID        NOT NULL REFERENCES parcours(id) ON DELETE RESTRICT,
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    annee_niveau        SMALLINT    NOT NULL,
    type_inscription    VARCHAR(20) NOT NULL DEFAULT 'premiere'
                        CHECK (type_inscription IN ('premiere', 'reinscription', 'transfert', 'equivalence')),
    statut              VARCHAR(20) NOT NULL DEFAULT 'en_attente'
                        CHECK (statut IN ('en_attente', 'validee', 'annulee', 'abandonnee')),
    numero_carte        VARCHAR(30) UNIQUE,
    date_inscription    DATE        DEFAULT CURRENT_DATE,
    bourse              BOOLEAN     DEFAULT FALSE,
    type_bourse         VARCHAR(100),
    montant_bourse      DECIMAL(10,2),
    observations        TEXT,
    validee_par         UUID        REFERENCES utilisateur(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (etudiant_id, parcours_id, annee_academique_id)
);

-- =============================================================================
-- MODULE : ENSEIGNANTS & COURS
-- =============================================================================

CREATE TABLE IF NOT EXISTS enseignant (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id      UUID        UNIQUE REFERENCES utilisateur(id) ON DELETE SET NULL,
    matricule           VARCHAR(30) NOT NULL UNIQUE,
    nom                 VARCHAR(100) NOT NULL,
    prenom              VARCHAR(100) NOT NULL,
    titre               VARCHAR(50),
    grade               VARCHAR(50),
    specialite          VARCHAR(200),
    type_contrat        VARCHAR(20)  NOT NULL DEFAULT 'permanent'
                        CHECK (type_contrat IN ('permanent', 'vacataire', 'hdr', 'invite')),
    departement_id      UUID        REFERENCES departement(id),
    email               VARCHAR(254),
    telephone           VARCHAR(30),
    actif               BOOLEAN     DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affectation_cours (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    enseignant_id       UUID        NOT NULL REFERENCES enseignant(id) ON DELETE RESTRICT,
    ue_id               UUID        REFERENCES unite_enseignement(id) ON DELETE CASCADE,
    ec_id               UUID        REFERENCES element_constitutif(id) ON DELETE CASCADE,
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    type_seance         VARCHAR(10) NOT NULL DEFAULT 'CM'
                        CHECK (type_seance IN ('CM', 'TD', 'TP')),
    volume_prevu        SMALLINT    NOT NULL DEFAULT 0,
    volume_realise      SMALLINT    DEFAULT 0,
    valide_par          UUID        REFERENCES utilisateur(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    CHECK (ue_id IS NOT NULL OR ec_id IS NOT NULL)
);

-- =============================================================================
-- MODULE : EMPLOIS DU TEMPS & SALLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS batiment (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nom         VARCHAR(100) NOT NULL,
    code        VARCHAR(20) UNIQUE,
    adresse     TEXT,
    actif       BOOLEAN     DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS salle (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    batiment_id     UUID        REFERENCES batiment(id) ON DELETE SET NULL,
    nom             VARCHAR(100) NOT NULL,
    code            VARCHAR(20) UNIQUE,
    capacite        SMALLINT    NOT NULL,
    type_salle      VARCHAR(30) NOT NULL DEFAULT 'cours'
                    CHECK (type_salle IN ('cours', 'amphitheatre', 'laboratoire', 'salle_info', 'salle_reunion', 'bibliotheque')),
    equipements     JSONB       DEFAULT '{}',
    disponible      BOOLEAN     DEFAULT TRUE,
    etage           SMALLINT    DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS emploi_du_temps (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    affectation_id      UUID        NOT NULL REFERENCES affectation_cours(id) ON DELETE CASCADE,
    salle_id            UUID        REFERENCES salle(id) ON DELETE SET NULL,
    date_seance         DATE        NOT NULL,
    heure_debut         TIME        NOT NULL,
    heure_fin           TIME        NOT NULL,
    type_seance         VARCHAR(10) NOT NULL DEFAULT 'CM' CHECK (type_seance IN ('CM', 'TD', 'TP')),
    statut              VARCHAR(20) DEFAULT 'planifie'
                        CHECK (statut IN ('planifie', 'realise', 'annule', 'reporte')),
    motif_annulation    TEXT,
    created_by_id       UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    CHECK (heure_fin > heure_debut)
);

-- =============================================================================
-- MODULE : ASSIDUITÉ & DISCIPLINE
-- =============================================================================

CREATE TABLE IF NOT EXISTS presence (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE CASCADE,
    seance_id           UUID        NOT NULL REFERENCES emploi_du_temps(id) ON DELETE CASCADE,
    statut              VARCHAR(20) NOT NULL DEFAULT 'absent'
                        CHECK (statut IN ('present', 'absent', 'retard', 'excuse', 'sorti_tot')),
    heure_arrivee       TIME,
    justifie            BOOLEAN     DEFAULT FALSE,
    justificatif_url    VARCHAR(500),
    motif               TEXT,
    mode_pointage       VARCHAR(20) DEFAULT 'manuel'
                        CHECK (mode_pointage IN ('manuel', 'qr_code', 'badge', 'empreinte')),
    saisi_par           UUID        REFERENCES utilisateur(id),
    valide_par          UUID        REFERENCES utilisateur(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (etudiant_id, seance_id)
);

CREATE TABLE IF NOT EXISTS incident_disciplinaire (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id),
    date_incident       DATE        NOT NULL DEFAULT CURRENT_DATE,
    type_incident       VARCHAR(50) NOT NULL
                        CHECK (type_incident IN ('retard', 'absenteisme', 'incivilite', 'triche', 'violence', 'autre')),
    description         TEXT        NOT NULL,
    sanction            VARCHAR(100),
    duree_sanction      INTEGER,
    statut              VARCHAR(20) DEFAULT 'ouvert' CHECK (statut IN ('ouvert', 'en_cours', 'clos', 'arbitrage')),
    rapporte_par        UUID        NOT NULL REFERENCES utilisateur(id),
    arbitre_par         UUID        REFERENCES utilisateur(id),
    date_cloture        DATE,
    observations        TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- MODULE : NOTES & SCOLARITÉ
-- =============================================================================

CREATE TABLE IF NOT EXISTS session_examen (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    libelle             VARCHAR(100) NOT NULL,
    type_session        VARCHAR(20) NOT NULL DEFAULT 'normale'
                        CHECK (type_session IN ('normale', 'rattrapage', 'deuxieme_chance')),
    semestre            SMALLINT    NOT NULL,
    date_debut          DATE,
    date_fin            DATE,
    statut              VARCHAR(20) DEFAULT 'planifie'
                        CHECK (statut IN ('planifie', 'en_cours', 'cloturee', 'deliberee')),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS note (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE RESTRICT,
    ec_id               UUID        REFERENCES element_constitutif(id) ON DELETE RESTRICT,
    ue_id               UUID        REFERENCES unite_enseignement(id) ON DELETE RESTRICT,
    session_id          UUID        NOT NULL REFERENCES session_examen(id),
    valeur              DECIMAL(5,2) NOT NULL CHECK (valeur >= 0 AND valeur <= 20),
    type_evaluation     VARCHAR(30) DEFAULT 'examen_final'
                        CHECK (type_evaluation IN ('examen_final', 'controle_continu', 'tp', 'soutenance', 'stage')),
    absence_justifiee   BOOLEAN     DEFAULT FALSE,
    mention             VARCHAR(20) GENERATED ALWAYS AS (
                            CASE
                                WHEN valeur >= 16 THEN 'Très Bien'
                                WHEN valeur >= 14 THEN 'Bien'
                                WHEN valeur >= 12 THEN 'Assez Bien'
                                WHEN valeur >= 10 THEN 'Passable'
                                ELSE 'Insuffisant'
                            END
                        ) STORED,
    verrouille          BOOLEAN     DEFAULT FALSE,
    hash_integrite      VARCHAR(128),
    saisi_par           UUID        NOT NULL REFERENCES utilisateur(id),
    valide_par          UUID        REFERENCES utilisateur(id),
    date_saisie         TIMESTAMPTZ DEFAULT NOW(),
    date_verrouillage   TIMESTAMPTZ,
    observations        TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (etudiant_id, ec_id, session_id),
    CHECK (ec_id IS NOT NULL OR ue_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS pv_deliberation (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID        NOT NULL REFERENCES session_examen(id),
    parcours_id         UUID        NOT NULL REFERENCES parcours(id),
    annee_niveau        SMALLINT    NOT NULL,
    date_deliberation   DATE        NOT NULL DEFAULT CURRENT_DATE,
    president_jury      UUID        NOT NULL REFERENCES utilisateur(id),
    membres_jury        JSONB       DEFAULT '[]',
    statut              VARCHAR(20) DEFAULT 'brouillon'
                        CHECK (statut IN ('brouillon', 'signe', 'transmis', 'archive')),
    fichier_pv_url      VARCHAR(500),
    hash_pv             VARCHAR(128),
    observations        TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS resultat_deliberation (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    pv_id               UUID        NOT NULL REFERENCES pv_deliberation(id),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id),
    decision            VARCHAR(30) NOT NULL
                        CHECK (decision IN ('admis', 'ajourne', 'ajourné_rattrap', 'exclus', 'abandon')),
    credits_valides     SMALLINT    DEFAULT 0,
    mention_annee       VARCHAR(20),
    passage_annee_sup   BOOLEAN     DEFAULT FALSE,
    observations        TEXT,
    UNIQUE (pv_id, etudiant_id)
);

CREATE TABLE IF NOT EXISTS diplome (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE RESTRICT,
    parcours_id         UUID        NOT NULL REFERENCES parcours(id),
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    numero_diplome      VARCHAR(50) NOT NULL UNIQUE,
    type_diplome        VARCHAR(50) NOT NULL
                        CHECK (type_diplome IN ('Licence', 'Master', 'Doctorat', 'BTS', 'DUT', 'Certificat')),
    mention             VARCHAR(20),
    date_obtention      DATE        NOT NULL,
    moyenne_generale    DECIMAL(5,2),
    credits_obtenus     SMALLINT,
    fichier_url         VARCHAR(500),
    hash_document       VARCHAR(128) NOT NULL,
    signe_par           UUID        NOT NULL REFERENCES utilisateur(id),
    signature_url       VARCHAR(500),
    date_signature      TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (etudiant_id, type_diplome, parcours_id)
);

-- =============================================================================
-- MODULE : SECRÉTAIRE (GESTION PÉDAGOGIQUE)
-- =============================================================================

-- Absences des enseignants
CREATE TABLE IF NOT EXISTS absence_enseignant (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    enseignant_id       UUID        NOT NULL REFERENCES enseignant(id) ON DELETE CASCADE,
    seance_id           UUID        REFERENCES emploi_du_temps(id) ON DELETE SET NULL,
    date_absence        DATE        NOT NULL,
    heure_debut         TIME,
    heure_fin           TIME,
    motif               VARCHAR(100) NOT NULL CHECK (motif IN ('maladie', 'formation', 'congres', 'personnel', 'autre')),
    justification       TEXT,
    justificatif_url    VARCHAR(500),
    est_justifiee       BOOLEAN     DEFAULT FALSE,
    statut              VARCHAR(20) DEFAULT 'declaree' CHECK (statut IN ('declaree', 'validee', 'refusee')),
    declaree_par        UUID        NOT NULL REFERENCES utilisateur(id),
    validee_par         UUID        REFERENCES utilisateur(id),
    date_validation     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Rattrapages de cours
CREATE TABLE IF NOT EXISTS rattrapage (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    absence_id          UUID        NOT NULL REFERENCES absence_enseignant(id) ON DELETE CASCADE,
    salle_id            UUID        REFERENCES salle(id) ON DELETE SET NULL,
    date_rattrapage     DATE        NOT NULL,
    heure_debut         TIME        NOT NULL,
    heure_fin           TIME        NOT NULL,
    observations        TEXT,
    statut              VARCHAR(20) DEFAULT 'planifie' CHECK (statut IN ('planifie', 'effectue', 'annule')),
    remplaceur_id       UUID        REFERENCES enseignant(id) ON DELETE SET NULL,
    planifie_par        UUID        NOT NULL REFERENCES utilisateur(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Notes dérogatoires
CREATE TABLE IF NOT EXISTS note_derogatoire (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE CASCADE,
    ec_id               UUID        REFERENCES element_constitutif(id) ON DELETE SET NULL,
    ue_id               UUID        REFERENCES unite_enseignement(id) ON DELETE SET NULL,
    session_examen_id   UUID        REFERENCES session_examen(id) ON DELETE SET NULL,
    valeur              DECIMAL(5,2) NOT NULL CHECK (valeur >= 0 AND valeur <= 20),
    motif_derogation    TEXT        NOT NULL,
    type_derogation     VARCHAR(50) DEFAULT 'cas_particulier' CHECK (type_derogation IN ('cas_particulier', 'erreur_saisie', 'rattrapage_administratif', 'autre')),
    est_derogatoire     BOOLEAN     DEFAULT TRUE,
    soumis_a_scolarite  BOOLEAN     DEFAULT FALSE,
    valide_par_scolarite UUID       REFERENCES utilisateur(id),
    date_validation_scolarite TIMESTAMPTZ,
    statut              VARCHAR(20) DEFAULT 'proposee' CHECK (statut IN ('proposee', 'soumise', 'validee', 'refusee')),
    saisie_par          UUID        NOT NULL REFERENCES utilisateur(id),
    valide_par          UUID        REFERENCES utilisateur(id),
    date_saisie         TIMESTAMPTZ DEFAULT NOW(),
    observations        TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Demandes étudiantes
CREATE TABLE IF NOT EXISTS demande_etudiant (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE CASCADE,
    type_demande        VARCHAR(50) NOT NULL CHECK (type_demande IN (
        'certificat_scolarite', 'attestation', 'report_examen', 'dispense', 'changement_parcours', 'autre'
    )),
    description         TEXT        NOT NULL,
    justification       TEXT,
    piece_jointe_url    VARCHAR(500),
    date_soumission     DATE        NOT NULL DEFAULT CURRENT_DATE,
    statut              VARCHAR(20) DEFAULT 'soumise' CHECK (statut IN ('soumise', 'en_traitement', 'acceptee', 'refusee', 'completee')),
    reponse             TEXT,
    traite_par          UUID        REFERENCES utilisateur(id),
    date_traitement     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Convocations aux examens
CREATE TABLE IF NOT EXISTS convocation (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        REFERENCES etudiant(id) ON DELETE CASCADE,
    session_examen_id   UUID        REFERENCES session_examen(id) ON DELETE CASCADE,
    soutenance_id       UUID,
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

-- =============================================================================
-- MODULE : FINANCIER
-- =============================================================================

CREATE TABLE IF NOT EXISTS grille_tarifaire (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    parcours_id         UUID        NOT NULL REFERENCES parcours(id),
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    annee_niveau        SMALLINT,
    montant_total       DECIMAL(12,2) NOT NULL,
    nb_tranches         SMALLINT    DEFAULT 1,
    description         TEXT,
    actif               BOOLEAN     DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (parcours_id, annee_academique_id, annee_niveau)
);

CREATE TABLE IF NOT EXISTS echeancier (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    inscription_id  UUID        NOT NULL REFERENCES inscription(id) ON DELETE CASCADE,
    num_tranche     SMALLINT    NOT NULL,
    montant_du      DECIMAL(12,2) NOT NULL,
    date_echeance   DATE        NOT NULL,
    statut          VARCHAR(20) DEFAULT 'en_attente'
                    CHECK (statut IN ('en_attente', 'paye', 'en_retard', 'annule')),
    UNIQUE (inscription_id, num_tranche)
);

CREATE SEQUENCE IF NOT EXISTS seq_recu START 1 INCREMENT 1;

CREATE TABLE IF NOT EXISTS paiement (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    inscription_id      UUID        NOT NULL REFERENCES inscription(id) ON DELETE RESTRICT,
    echeancier_id       UUID        REFERENCES echeancier(id),
    montant             DECIMAL(12,2) NOT NULL CHECK (montant > 0),
    mode_paiement       VARCHAR(20) NOT NULL
                        CHECK (mode_paiement IN ('especes', 'cheque', 'virement', 'carte_bancaire', 'mobile_money')),
    date_paiement       TIMESTAMPTZ DEFAULT NOW(),
    reference           VARCHAR(100) UNIQUE,
    numero_recu         VARCHAR(50) NOT NULL UNIQUE,
    recu_url            VARCHAR(500),
    caissier_id         UUID        NOT NULL REFERENCES utilisateur(id),
    statut              VARCHAR(20) DEFAULT 'valide'
                        CHECK (statut IN ('valide', 'annule', 'rembourse', 'en_attente')),
    motif_annulation    TEXT,
    observations        TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    departement_id      UUID        REFERENCES departement(id),
    categorie           VARCHAR(100) NOT NULL,
    montant_prevu       DECIMAL(15,2) NOT NULL,
    montant_realise     DECIMAL(15,2) DEFAULT 0,
    description         TEXT,
    created_by          UUID        REFERENCES utilisateur(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS depense (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    budget_id           UUID        REFERENCES budget(id),
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    libelle             VARCHAR(300) NOT NULL,
    montant             DECIMAL(12,2) NOT NULL CHECK (montant > 0),
    categorie           VARCHAR(100),
    date_depense        DATE        NOT NULL DEFAULT CURRENT_DATE,
    fournisseur         VARCHAR(200),
    numero_facture      VARCHAR(100),
    facture_url         VARCHAR(500),
    statut              VARCHAR(20) DEFAULT 'en_attente'
                        CHECK (statut IN ('en_attente', 'approuve', 'paye', 'rejete')),
    demande_par         UUID        REFERENCES utilisateur(id),
    approuve_par        UUID        REFERENCES utilisateur(id),
    date_approbation    TIMESTAMPTZ,
    observations        TEXT,
    valide_par_president UUID,
    valide_le           TIMESTAMPTZ,
    motif_decision      TEXT,
    conditions_speciales TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- MODULE : RESSOURCES HUMAINES
-- =============================================================================

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


-- =============================================================================
-- MODULE : LOGISTIQUE & MAINTENANCE
-- =============================================================================

CREATE TABLE IF NOT EXISTS ticket_maintenance (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    batiment_id         UUID        REFERENCES batiment(id),
    salle_id            UUID        REFERENCES salle(id),
    titre               VARCHAR(200) NOT NULL,
    description         TEXT        NOT NULL,
    type_maintenance    VARCHAR(30) NOT NULL DEFAULT 'curative'
                        CHECK (type_maintenance IN ('preventive', 'curative', 'urgence')),
    priorite            VARCHAR(20) DEFAULT 'normale'
                        CHECK (priorite IN ('basse', 'normale', 'haute', 'urgente')),
    statut              VARCHAR(20) DEFAULT 'ouvert'
                        CHECK (statut IN ('ouvert', 'en_cours', 'resolu', 'ferme', 'annule')),
    signale_par         UUID        NOT NULL REFERENCES utilisateur(id),
    assigne_a           UUID        REFERENCES utilisateur(id),
    date_signalement    TIMESTAMPTZ DEFAULT NOW(),
    date_resolution     TIMESTAMPTZ,
    photos_url          JSONB       DEFAULT '[]',
    cout_reparation     DECIMAL(10,2),
    observations        TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservation_salle (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    salle_id            UUID        NOT NULL REFERENCES salle(id),
    titre               VARCHAR(200) NOT NULL,
    description         TEXT,
    date_reservation    DATE        NOT NULL,
    heure_debut         TIME        NOT NULL,
    heure_fin           TIME        NOT NULL,
    demande_par         UUID        NOT NULL REFERENCES utilisateur(id),
    approuve_par        UUID        REFERENCES utilisateur(id),
    statut              VARCHAR(20) DEFAULT 'en_attente'
                        CHECK (statut IN ('en_attente', 'approuvee', 'refusee', 'annulee')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    CHECK (heure_fin > heure_debut)
);

CREATE TABLE IF NOT EXISTS stock (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    reference           VARCHAR(50) NOT NULL UNIQUE,
    libelle             VARCHAR(200) NOT NULL,
    categorie           VARCHAR(50) NOT NULL
                        CHECK (categorie IN ('bureau', 'nettoyage', 'informatique', 'pedagogique', 'energie', 'autre')),
    unite               VARCHAR(20) NOT NULL,
    quantite_stock      DECIMAL(10,2) NOT NULL DEFAULT 0,
    seuil_alerte        DECIMAL(10,2) NOT NULL DEFAULT 0,
    prix_unitaire       DECIMAL(10,2),
    fournisseur         VARCHAR(200),
    emplacement         VARCHAR(100),
    derniere_mise_a_jour TIMESTAMPTZ DEFAULT NOW(),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mouvement_stock (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id            UUID        NOT NULL REFERENCES stock(id),
    type_mouvement      VARCHAR(20) NOT NULL
                        CHECK (type_mouvement IN ('entree', 'sortie', 'ajustement')),
    quantite            DECIMAL(10,2) NOT NULL,
    motif               VARCHAR(200),
    reference_doc       VARCHAR(100),
    utilisateur_id      UUID        REFERENCES utilisateur(id),
    date_mouvement      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS planning_entretien (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    salle_id            UUID        REFERENCES salle(id),
    batiment_id         UUID        REFERENCES batiment(id),
    zone                VARCHAR(200),
    type_nettoyage      VARCHAR(50) NOT NULL
                        CHECK (type_nettoyage IN ('quotidien', 'hebdomadaire', 'mensuel', 'apres_evenement', 'desinfection')),
    responsable_id      UUID        REFERENCES utilisateur(id),
    jour_semaine        SMALLINT    CHECK (jour_semaine BETWEEN 1 AND 7),
    heure_debut         TIME,
    duree_minutes       SMALLINT,
    actif               BOOLEAN     DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rapport_entretien (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    planning_id         UUID        REFERENCES planning_entretien(id),
    realise_par         UUID        NOT NULL REFERENCES utilisateur(id),
    date_realisation    DATE        NOT NULL DEFAULT CURRENT_DATE,
    heure_debut         TIME,
    heure_fin           TIME,
    statut              VARCHAR(20) DEFAULT 'realise'
                        CHECK (statut IN ('realise', 'partiel', 'non_realise')),
    observations        TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- MODULE : COMMUNICATION & NOTIFICATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS annonce (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    titre               VARCHAR(300) NOT NULL,
    contenu             TEXT        NOT NULL,
    type_annonce        VARCHAR(30) DEFAULT 'information'
                        CHECK (type_annonce IN ('information', 'urgent', 'evenement', 'resultat', 'pastoral', 'fermeture')),
    cible               VARCHAR(20) DEFAULT 'tous'
                        CHECK (cible IN ('tous', 'etudiants', 'parents', 'enseignants', 'personnel', 'parcours')),
    parcours_id         UUID        REFERENCES parcours(id),
    publie              BOOLEAN     DEFAULT FALSE,
    date_publication    TIMESTAMPTZ,
    date_expiration     TIMESTAMPTZ,
    auteur_id           UUID        NOT NULL REFERENCES utilisateur(id),
    photo_url           VARCHAR(500),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id      UUID        NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    titre               VARCHAR(200) NOT NULL,
    message             TEXT        NOT NULL,
    type_notification   VARCHAR(30) DEFAULT 'info'
                        CHECK (type_notification IN ('info', 'alerte', 'paiement', 'note', 'absence', 'discipline')),
    lue                 BOOLEAN     DEFAULT FALSE,
    lue_at              TIMESTAMPTZ,
    lien                VARCHAR(500),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    expediteur_id       UUID        NOT NULL REFERENCES utilisateur(id),
    destinataire_id     UUID        NOT NULL REFERENCES utilisateur(id),
    sujet               VARCHAR(300),
    contenu             TEXT        NOT NULL,
    lu                  BOOLEAN     DEFAULT FALSE,
    lu_at               TIMESTAMPTZ,
    parent_id           UUID        REFERENCES message(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- MODULE : PERMISSIONS PORTAILS
-- =============================================================================

CREATE TABLE IF NOT EXISTS permissions_portail (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    type_portail        VARCHAR(20) NOT NULL CHECK (type_portail IN ('etudiant', 'parent', 'enseignant')),
    permission_key      VARCHAR(100) NOT NULL,
    permission_label    VARCHAR(200) NOT NULL,
    actif               BOOLEAN     DEFAULT TRUE,
    description         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (type_portail, permission_key)
);

-- Insertion des permissions par défaut pour chaque portail
INSERT INTO permissions_portail (type_portail, permission_key, permission_label, actif, description) VALUES
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

-- Portail enseignant
('enseignant', 'publier_cours', 'Publier supports de cours', true, 'Publication de documents pédagogiques'),
('enseignant', 'saisie_notes', 'Saisie des notes', true, 'Saisie et modification des notes'),
('enseignant', 'pointage_presences', 'Pointage présences', true, 'Gestion des présences étudiants'),
('enseignant', 'depot_sujets', 'Dépôt sujets examens', true, 'Dépôt des sujets d''examens'),
('enseignant', 'listes_etudiants', 'Consultation listes étudiants', true, 'Accès aux listes d''étudiants'),
('enseignant', 'demande_ressources', 'Demande ressources', true, 'Demande de ressources pédagogiques'),
('enseignant', 'messagerie_etudiants', 'Messagerie étudiants', true, 'Communication avec les étudiants'),
('enseignant', 'signature_presence', 'Signature présence', true, 'Signature électronique de présence')
ON CONFLICT (type_portail, permission_key) DO NOTHING;

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

-- =============================================================================
-- INDEX DE PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_utilisateur_email ON utilisateur(email);
CREATE INDEX IF NOT EXISTS idx_utilisateur_role ON utilisateur(role);
CREATE INDEX IF NOT EXISTS idx_utilisateur_password_reset ON utilisateur(password_reset_required);
CREATE INDEX IF NOT EXISTS idx_utilisateur_last_password_reset ON utilisateur(last_password_reset);
CREATE INDEX IF NOT EXISTS idx_session_jwt_token ON session_jwt(refresh_token);
CREATE INDEX IF NOT EXISTS idx_session_jwt_user ON session_jwt(utilisateur_id);

CREATE INDEX IF NOT EXISTS idx_etudiant_matricule ON etudiant(matricule);
CREATE INDEX IF NOT EXISTS idx_etudiant_nom ON etudiant(nom, prenom);
CREATE INDEX IF NOT EXISTS idx_inscription_etudiant ON inscription(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_inscription_parcours_annee ON inscription(parcours_id, annee_academique_id);

CREATE INDEX IF NOT EXISTS idx_note_etudiant ON note(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_note_session ON note(session_id);
CREATE INDEX IF NOT EXISTS idx_note_ue ON note(ue_id);
CREATE INDEX IF NOT EXISTS idx_note_ec ON note(ec_id);
CREATE INDEX IF NOT EXISTS idx_note_verrouille ON note(verrouille);

CREATE INDEX IF NOT EXISTS idx_presence_etudiant ON presence(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_presence_seance ON presence(seance_id);
CREATE INDEX IF NOT EXISTS idx_presence_statut ON presence(statut);

CREATE INDEX IF NOT EXISTS idx_edt_date ON emploi_du_temps(date_seance);
CREATE INDEX IF NOT EXISTS idx_edt_salle ON emploi_du_temps(salle_id);
CREATE INDEX IF NOT EXISTS idx_edt_affectation ON emploi_du_temps(affectation_id);

CREATE INDEX IF NOT EXISTS idx_paiement_inscription ON paiement(inscription_id);
CREATE INDEX IF NOT EXISTS idx_paiement_date ON paiement(date_paiement);
CREATE INDEX IF NOT EXISTS idx_paiement_statut ON paiement(statut);
CREATE INDEX IF NOT EXISTS idx_echeancier_statut ON echeancier(statut);

CREATE INDEX IF NOT EXISTS idx_notification_user ON notification(utilisateur_id, lue);
CREATE INDEX IF NOT EXISTS idx_annonce_publie ON annonce(publie, date_publication);

CREATE INDEX IF NOT EXISTS idx_ticket_statut ON ticket_maintenance(statut, priorite);
CREATE INDEX IF NOT EXISTS idx_stock_seuil ON stock(quantite_stock, seuil_alerte);

-- Index pour les tables secrétaire
CREATE INDEX IF NOT EXISTS idx_absence_enseignant ON absence_enseignant(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_absence_date ON absence_enseignant(date_absence);
CREATE INDEX IF NOT EXISTS idx_absence_statut ON absence_enseignant(statut);

CREATE INDEX IF NOT EXISTS idx_rattrapage_absence ON rattrapage(absence_id);
CREATE INDEX IF NOT EXISTS idx_rattrapage_date ON rattrapage(date_rattrapage);

CREATE INDEX IF NOT EXISTS idx_note_derog_etudiant ON note_derogatoire(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_note_derog_statut ON note_derogatoire(statut);

CREATE INDEX IF NOT EXISTS idx_demande_etudiant ON demande_etudiant(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_demande_statut ON demande_etudiant(statut);

CREATE INDEX IF NOT EXISTS idx_convocation_etudiant ON convocation(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_convocation_session ON convocation(session_examen_id);
CREATE INDEX IF NOT EXISTS idx_convocation_statut ON convocation(statut);
CREATE INDEX IF NOT EXISTS idx_convocation_date ON convocation(date_convocation);
CREATE INDEX IF NOT EXISTS idx_convocation_genere ON convocation(genere_par);

CREATE INDEX IF NOT EXISTS idx_dossier_etudiant_id ON dossier_etudiant(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_dossier_type ON dossier_etudiant(type_document);
CREATE INDEX IF NOT EXISTS idx_dossier_statut ON dossier_etudiant(statut);
CREATE INDEX IF NOT EXISTS idx_dossier_archive ON dossier_etudiant(est_archive);

CREATE INDEX IF NOT EXISTS idx_parcours_secretaire ON parcours(secretaire_id);

-- =============================================================================
-- TRIGGERS & FONCTIONS
-- =============================================================================

-- Mise à jour automatique du champ updated_at
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
        'utilisateur', 'parcours', 'inscription', 'enseignant',
        'affectation_cours', 'emploi_du_temps', 'note', 'pv_deliberation',
        'ticket_maintenance', 'contrat_personnel', 'annonce', 'presence', 'depense', 'budget',
        'referentiel_competences', 'sujet_examen', 'proces_verbal',
        'absence_enseignant', 'rattrapage', 'note_derogatoire', 'demande_etudiant',
        'convocation', 'dossier_etudiant'
    ]
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_updated_at ON %I;
             CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()', t, t
        );
    END LOOP;
END $$;

-- Génération automatique du numéro de reçu
CREATE OR REPLACE FUNCTION trigger_numero_recu()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_recu IS NULL OR NEW.numero_recu = '' THEN
        NEW.numero_recu = 'RECU-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('seq_recu')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_numero_recu ON paiement;
CREATE TRIGGER trg_numero_recu
BEFORE INSERT ON paiement
FOR EACH ROW EXECUTE FUNCTION trigger_numero_recu();

-- Alerte stock bas
CREATE OR REPLACE FUNCTION trigger_alerte_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantite_stock <= NEW.seuil_alerte THEN
        INSERT INTO notification (utilisateur_id, titre, message, type_notification)
        SELECT u.id,
               'Alerte stock : ' || NEW.libelle,
               'Le stock de ' || NEW.libelle || ' est sous le seuil d''alerte (' || NEW.quantite_stock || ' ' || NEW.unite || ' restant(s)).',
               'alerte'
        FROM utilisateur u
        WHERE u.role IN ('logistique', 'admin') AND u.actif = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_alerte_stock ON stock;
CREATE TRIGGER trg_alerte_stock
AFTER INSERT OR UPDATE ON stock
FOR EACH ROW EXECUTE FUNCTION trigger_alerte_stock();

-- Blocage saisie note si verrouillée
CREATE OR REPLACE FUNCTION trigger_note_verrouille()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.verrouille = TRUE AND NEW.verrouille = TRUE THEN
        RAISE EXCEPTION 'Modification interdite : la note (%) est verrouillée après délibération.', OLD.id;
    END IF;
    IF NEW.verrouille = TRUE AND OLD.verrouille = FALSE THEN
        NEW.date_verrouillage = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_note_verrouille ON note;
CREATE TRIGGER trg_note_verrouille
BEFORE UPDATE ON note
FOR EACH ROW EXECUTE FUNCTION trigger_note_verrouille();

-- Notification paiement reçu à l'étudiant
CREATE OR REPLACE FUNCTION trigger_notification_paiement()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Récupération de l'ID utilisateur lié à l'étudiant inscrit
    SELECT e.utilisateur_id INTO v_user_id
    FROM inscription i
    JOIN etudiant e ON e.id = i.etudiant_id
    WHERE i.id = NEW.inscription_id;

    IF v_user_id IS NOT NULL THEN
        INSERT INTO notification (utilisateur_id, titre, message, type_notification)
        VALUES (
            v_user_id,
            'Paiement reçu',
            'Votre paiement de ' || NEW.montant || ' a été enregistré. Reçu N° ' || NEW.numero_recu,
            'paiement'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notif_paiement ON paiement;
CREATE TRIGGER trg_notif_paiement
AFTER INSERT ON paiement
FOR EACH ROW EXECUTE FUNCTION trigger_notification_paiement();

-- =============================================================================
-- VUES ANALYTIQUES
-- =============================================================================

-- Vue : Moyenne par UE et par étudiant
CREATE OR REPLACE VIEW vue_moyenne_ue AS
SELECT
    n.etudiant_id,
    ec.ue_id,
    n.session_id,
    ROUND(
        SUM(n.valeur * ec.coefficient) / NULLIF(SUM(ec.coefficient), 0),
        2
    ) AS moyenne_ue,
    COUNT(n.id)                         AS nb_notes,
    BOOL_AND(n.verrouille)              AS toutes_verrouillees
FROM note n
JOIN element_constitutif ec ON n.ec_id = ec.id
GROUP BY n.etudiant_id, ec.ue_id, n.session_id;

-- Vue : Moyenne générale par étudiant par semestre
CREATE OR REPLACE VIEW vue_moyenne_semestre AS
SELECT
    mue.etudiant_id,
    ue.semestre,
    mue.session_id,
    ROUND(
        SUM(mue.moyenne_ue * ue.coefficient) / NULLIF(SUM(ue.coefficient), 0),
        2
    ) AS moyenne_semestre,
    SUM(CASE WHEN mue.moyenne_ue >= 10 THEN ue.credits_ects ELSE 0 END) AS credits_valides,
    SUM(ue.credits_ects) AS credits_total
FROM vue_moyenne_ue mue
JOIN unite_enseignement ue ON mue.ue_id = ue.id
GROUP BY mue.etudiant_id, ue.semestre, mue.session_id;

-- Vue : Tableau de bord du Président (KPI globaux)
CREATE OR REPLACE VIEW vue_kpi_president AS
SELECT
    (SELECT COUNT(*) FROM etudiant WHERE actif = TRUE)                      AS total_etudiants,
    (SELECT COUNT(*) FROM inscription i
     JOIN annee_academique aa ON aa.id = i.annee_academique_id
     WHERE aa.active = TRUE AND i.statut = 'validee')                       AS etudiants_inscrits_annee,
    (SELECT COUNT(*) FROM utilisateur WHERE role = 'enseignant' AND actif = TRUE) AS total_enseignants,
    (SELECT COUNT(*) FROM utilisateur WHERE role NOT IN ('etudiant', 'parent', 'enseignant') AND actif = TRUE) AS total_personnel,
    (SELECT COALESCE(SUM(p.montant), 0)
     FROM paiement p
     JOIN inscription i ON p.inscription_id = i.id
     JOIN annee_academique aa ON aa.id = i.annee_academique_id
     WHERE aa.active = TRUE AND p.statut = 'valide')                        AS recettes_annee,
    (SELECT COALESCE(SUM(montant), 0)
     FROM depense WHERE statut = 'paye'
     AND date_depense >= DATE_TRUNC('month', NOW()))                        AS depenses_mois,
    (SELECT COUNT(*) FROM ticket_maintenance WHERE statut IN ('ouvert', 'en_cours')) AS tickets_maintenance_ouverts,
    (SELECT COUNT(*) FROM stock WHERE quantite_stock <= seuil_alerte)       AS alertes_stock;

-- Vue : État des paiements par étudiant
CREATE OR REPLACE VIEW vue_paiement_etudiant AS
SELECT
    e.id                 AS etudiant_id,
    e.matricule,
    e.nom || ' ' || e.prenom AS etudiant_nom,
    p.nom                AS parcours,
    aa.libelle           AS annee,
    gt.montant_total     AS montant_du,
    COALESCE(SUM(pay.montant) FILTER (WHERE pay.statut = 'valide'), 0) AS montant_paye,
    gt.montant_total - COALESCE(SUM(pay.montant) FILTER (WHERE pay.statut = 'valide'), 0) AS solde,
    CASE
        WHEN gt.montant_total - COALESCE(SUM(pay.montant) FILTER (WHERE pay.statut = 'valide'), 0) <= 0 THEN 'solde'
        WHEN COALESCE(SUM(pay.montant) FILTER (WHERE pay.statut = 'valide'), 0) > 0 THEN 'partiel'
        ELSE 'impaye'
    END AS statut_paiement
FROM etudiant e
JOIN inscription i       ON e.id = i.etudiant_id
JOIN parcours p        ON p.id = i.parcours_id
JOIN annee_academique aa ON aa.id = i.annee_academique_id
LEFT JOIN grille_tarifaire gt ON gt.parcours_id = i.parcours_id
    AND gt.annee_academique_id = i.annee_academique_id
    AND (gt.annee_niveau = i.annee_niveau OR gt.annee_niveau IS NULL)
LEFT JOIN paiement pay ON pay.inscription_id = i.id
WHERE aa.active = TRUE
GROUP BY e.id, e.matricule, e.nom, e.prenom, p.nom, aa.libelle, gt.montant_total;

-- Vue : Absences par étudiant (résumé)
CREATE OR REPLACE VIEW vue_absences_etudiant AS
SELECT
    e.id                 AS etudiant_id,
    e.matricule,
    e.nom || ' ' || e.prenom AS etudiant_nom,
    COUNT(pr.id)        AS total_seances,
    COUNT(pr.id) FILTER (WHERE pr.statut = 'absent') AS absences_total,
    COUNT(pr.id) FILTER (WHERE pr.statut = 'absent' AND pr.justifie = TRUE) AS absences_justifiees,
    COUNT(pr.id) FILTER (WHERE pr.statut = 'absent' AND pr.justifie = FALSE) AS absences_injustifiees,
    COUNT(pr.id) FILTER (WHERE pr.statut = 'retard') AS retards,
    ROUND(
        100.0 * COUNT(pr.id) FILTER (WHERE pr.statut = 'present') / NULLIF(COUNT(pr.id), 0),
        1
    ) AS taux_assiduite
FROM etudiant e
JOIN presence pr ON e.id = pr.etudiant_id
GROUP BY e.id, e.matricule, e.nom, e.prenom;


-- =============================================================================
-- MODULE : SURVEILLANCE & DISCIPLINE
-- =============================================================================

-- Table: pointage_qr
CREATE TABLE IF NOT EXISTS pointage_qr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seance_id UUID NOT NULL,
    etudiant_id UUID NOT NULL,
    code_qr VARCHAR(255) UNIQUE NOT NULL,
    date_generation TIMESTAMP DEFAULT NOW(),
    date_scan TIMESTAMP,
    scanne_par UUID,
    statut VARCHAR(50) DEFAULT 'scanne' CHECK (statut IN ('scanne', 'manuel', 'absent')),
    localisation_scan VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pointage_qr_seance ON pointage_qr(seance_id);
CREATE INDEX idx_pointage_qr_etudiant ON pointage_qr(etudiant_id);
CREATE INDEX idx_pointage_qr_code ON pointage_qr(code_qr);

-- Table: presence_surveillance
CREATE TABLE IF NOT EXISTS presence_surveillance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id UUID NOT NULL,
    seance_id UUID NOT NULL,
    date_pointage DATE DEFAULT CURRENT_DATE,
    heure_arrivee TIME,
    heure_depart TIME,
    statut VARCHAR(50) DEFAULT 'present' CHECK (statut IN ('present', 'absent', 'retard', 'sortie_anticipee')),
    justificatif_url TEXT,
    est_justifie BOOLEAN DEFAULT FALSE,
    justifie_par UUID,
    date_justification TIMESTAMP,
    mode_pointage VARCHAR(50) DEFAULT 'manuel' CHECK (mode_pointage IN ('qr', 'manuel', 'badge')),
    pointe_par UUID NOT NULL,
    observations TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_presence_etudiant ON presence_surveillance(etudiant_id);
CREATE INDEX idx_presence_seance ON presence_surveillance(seance_id);
CREATE INDEX idx_presence_date ON presence_surveillance(date_pointage);
CREATE INDEX idx_presence_statut ON presence_surveillance(statut);

-- Table: alerte_discipline
CREATE TABLE IF NOT EXISTS alerte_discipline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id UUID NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('absence_repetee', 'retard_cumule', 'sanction_grave', 'incident_critique')),
    message TEXT NOT NULL,
    statut VARCHAR(50) DEFAULT 'non_lue' CHECK (statut IN ('non_lue', 'lue', 'traitee')),
    generee_par UUID NOT NULL,
    destinataire_role VARCHAR(100) DEFAULT 'secretariat',
    date_lecture TIMESTAMP,
    traitee_par UUID,
    date_traitement TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alerte_etudiant ON alerte_discipline(etudiant_id);
CREATE INDEX idx_alerte_statut ON alerte_discipline(statut);
CREATE INDEX idx_alerte_type ON alerte_discipline(type);
CREATE INDEX idx_alerte_destinataire ON alerte_discipline(destinataire_role);

-- Table: configuration_examen
CREATE TABLE IF NOT EXISTS configuration_examen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_examen_id UUID NOT NULL,
    salle_id UUID NOT NULL,
    places_total INTEGER DEFAULT 0,
    places_attribuees INTEGER DEFAULT 0,
    plan_places JSONB DEFAULT '[]'::jsonb,
    surveillant_id UUID NOT NULL,
    statut VARCHAR(50) DEFAULT 'preparation' CHECK (statut IN ('preparation', 'en_cours', 'termine', 'incident')),
    rapport_incident TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_config_examen_session ON configuration_examen(session_examen_id);
CREATE INDEX idx_config_examen_salle ON configuration_examen(salle_id);
CREATE INDEX idx_config_examen_surveillant ON configuration_examen(surveillant_id);

-- =============================================================================
-- MODULE : ENCADREMENT
-- =============================================================================

-- Table: suivi_moral
CREATE TABLE IF NOT EXISTS suivi_moral (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id UUID NOT NULL,
    date_entretien DATE NOT NULL,
    sujet VARCHAR(255) NOT NULL,
    observations TEXT NOT NULL,
    recommandations TEXT,
    suivi_par UUID NOT NULL,
    parent_informe BOOLEAN DEFAULT FALSE,
    date_information_parent TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'cloture', 'suivi_requis')),
    prochain_rdv DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_suivi_moral_etudiant ON suivi_moral(etudiant_id);
CREATE INDEX idx_suivi_moral_date ON suivi_moral(date_entretien);
CREATE INDEX idx_suivi_moral_statut ON suivi_moral(statut);

-- Table: autorisation_sortie
CREATE TABLE IF NOT EXISTS autorisation_sortie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id UUID NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('sortie_anticipee', 'absence_prevue', 'sortie_exceptionnelle')),
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    motif TEXT NOT NULL,
    demande_par UUID NOT NULL,
    est_mineur BOOLEAN DEFAULT FALSE,
    autorisation_parentale_url TEXT,
    statut VARCHAR(50) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuvee', 'refusee', 'annulee')),
    validee_par UUID,
    date_validation TIMESTAMP,
    motif_refus TEXT,
    observations TEXT,
    sortie_effective BOOLEAN DEFAULT FALSE,
    heure_sortie TIME,
    heure_retour TIME,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_autorisation_etudiant ON autorisation_sortie(etudiant_id);
CREATE INDEX idx_autorisation_statut ON autorisation_sortie(statut);
CREATE INDEX idx_autorisation_dates ON autorisation_sortie(date_debut, date_fin);

-- Table: rapport_conduite
CREATE TABLE IF NOT EXISTS rapport_conduite (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id UUID NOT NULL,
    periode_debut DATE NOT NULL,
    periode_fin DATE NOT NULL,
    note_comportement DECIMAL(3,1) NOT NULL,
    note_assiduite DECIMAL(3,1) NOT NULL,
    note_discipline DECIMAL(3,1) NOT NULL,
    nombre_absences INTEGER DEFAULT 0,
    nombre_retards INTEGER DEFAULT 0,
    nombre_sanctions INTEGER DEFAULT 0,
    appreciation_generale TEXT NOT NULL,
    points_forts TEXT,
    points_amelioration TEXT,
    recommandations TEXT,
    redige_par UUID NOT NULL,
    valide_par UUID,
    statut VARCHAR(50) DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'valide', 'transmis_parents')),
    date_transmission TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rapport_conduite_etudiant ON rapport_conduite(etudiant_id);
CREATE INDEX idx_rapport_conduite_periode ON rapport_conduite(periode_debut, periode_fin);
CREATE INDEX idx_rapport_conduite_statut ON rapport_conduite(statut);

-- Table: conseil_discipline
CREATE TABLE IF NOT EXISTS conseil_discipline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id UUID NOT NULL,
    date_conseil TIMESTAMP NOT NULL,
    motif_convocation TEXT NOT NULL,
    incidents_lies JSONB DEFAULT '[]'::jsonb,
    membres_presents JSONB DEFAULT '[]'::jsonb,
    deliberation TEXT,
    decision VARCHAR(100) CHECK (decision IN ('aucune_sanction', 'avertissement', 'blame', 'exclusion_temporaire', 'exclusion_definitive', 'renvoi')),
    justification_decision TEXT,
    droit_appel BOOLEAN DEFAULT TRUE,
    delai_appel_jours INTEGER DEFAULT 15,
    statut VARCHAR(50) DEFAULT 'convoque' CHECK (statut IN ('convoque', 'tenu', 'reporte', 'annule')),
    proces_verbal_url TEXT,
    parent_present BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conseil_discipline_etudiant ON conseil_discipline(etudiant_id);
CREATE INDEX idx_conseil_discipline_date ON conseil_discipline(date_conseil);
CREATE INDEX idx_conseil_discipline_statut ON conseil_discipline(statut);

-- =============================================================================
-- TRIGGERS FOR SURVEILLANCE & ENCADREMENT TABLES
-- =============================================================================

-- Triggers pour updated_at
CREATE TRIGGER update_pointage_qr_updated_at BEFORE UPDATE ON pointage_qr FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_presence_surveillance_updated_at BEFORE UPDATE ON presence_surveillance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerte_discipline_updated_at BEFORE UPDATE ON alerte_discipline FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuration_examen_updated_at BEFORE UPDATE ON configuration_examen FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suivi_moral_updated_at BEFORE UPDATE ON suivi_moral FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_autorisation_sortie_updated_at BEFORE UPDATE ON autorisation_sortie FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rapport_conduite_updated_at BEFORE UPDATE ON rapport_conduite FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conseil_discipline_updated_at BEFORE UPDATE ON conseil_discipline FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS FOR SURVEILLANCE & ENCADREMENT TABLES
-- =============================================================================

COMMENT ON TABLE pointage_qr IS 'QR codes générés pour l''appel numérique';
COMMENT ON TABLE presence_surveillance IS 'Enregistrement des présences avec validation surveillant';
COMMENT ON TABLE alerte_discipline IS 'Alertes automatiques remontées au secrétariat';
COMMENT ON TABLE configuration_examen IS 'Configuration des salles d''examen et placement des étudiants';
COMMENT ON TABLE suivi_moral IS 'Suivi moral et comportemental des étudiants';
COMMENT ON TABLE autorisation_sortie IS 'Autorisations de sortie (mineurs et internes)';
COMMENT ON TABLE rapport_conduite IS 'Rapports de conduite périodiques';
COMMENT ON TABLE conseil_discipline IS 'Conseils de discipline et décisions';

-- =============================================================================
-- MODULE : CAISSIER (Gestion des frais d'inscription et paiements)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table : FraisInscription (Gestion des frais d'inscription par parcours)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS frais_inscription (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    parcours_id             UUID        NOT NULL REFERENCES parcours(id) ON DELETE RESTRICT,
    annee_academique_id     UUID        NOT NULL REFERENCES annee_academique(id) ON DELETE RESTRICT,
    montant_inscription    DECIMAL(10,2) NOT NULL DEFAULT 0,
    montant_scolarite      DECIMAL(10,2) DEFAULT 0,
    montant_total          DECIMAL(10,2) NOT NULL,
    description             TEXT,
    actif                   BOOLEAN     DEFAULT TRUE,
    date_limite_paiement   DATE,
    modalites_paiement     JSONB       DEFAULT '{"especes": true, "cheque": true, "virement": true, "carte_bancaire": true, "echelonnement": false}',
    cree_par               UUID        REFERENCES utilisateur(id),
    modifie_par             UUID        REFERENCES utilisateur(id),
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (parcours_id, annee_academique_id)
);

-- -----------------------------------------------------------------------------
-- Table : ClotureCaisse (Clôture journalière de caisse)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cloture_caisse (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    date_cloture            DATE        NOT NULL,
    caissier_id             UUID        NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    total_especes           DECIMAL(12,2) DEFAULT 0,
    total_cheques           DECIMAL(12,2) DEFAULT 0,
    total_virements         DECIMAL(12,2) DEFAULT 0,
    total_carte_bancaire    DECIMAL(12,2) DEFAULT 0,
    total_mobile_money      DECIMAL(12,2) DEFAULT 0,
    total_general           DECIMAL(12,2) DEFAULT 0,
    nombre_paiements        INT         DEFAULT 0,
    details_paiements       JSONB       DEFAULT '{"inscription": {"montant": 0, "nombre": 0}, "scolarite": {"montant": 0, "nombre": 0}, "autres": {"montant": 0, "nombre": 0}}',
    solde_banque_theorique  DECIMAL(12,2),
    solde_banque_reel       DECIMAL(12,2),
    ecart                   DECIMAL(12,2),
    motif_ecart             TEXT,
    valide                  BOOLEAN     DEFAULT FALSE,
    valide_par              UUID        REFERENCES utilisateur(id),
    date_validation         TIMESTAMPTZ,
    observations            TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (date_cloture, caissier_id)
);

-- -----------------------------------------------------------------------------
-- Ajout de colonnes à la table paiement existante
-- -----------------------------------------------------------------------------
ALTER TABLE paiement ADD COLUMN IF NOT EXISTS type_paiement VARCHAR(20) DEFAULT 'scolarite';
ALTER TABLE paiement ADD COLUMN IF NOT EXISTS cloture_caisse_id UUID REFERENCES cloture_caisse(id);
ALTER TABLE paiement ADD COLUMN IF NOT EXISTS details_paiement JSONB;

-- Contrainte pour le type de paiement
ALTER TABLE paiement ADD CONSTRAINT IF NOT EXISTS chk_type_paiement 
    CHECK (type_paiement IN ('inscription', 'scolarite', 'retard', 'autre', 'amende', 'divers'));

-- -----------------------------------------------------------------------------
-- Index pour optimisation des performances
-- -----------------------------------------------------------------------------
-- Index sur les frais d'inscription
CREATE INDEX IF NOT EXISTS idx_frais_inscription_parcours ON frais_inscription(parcours_id);
CREATE INDEX IF NOT EXISTS idx_frais_inscription_annee_academique ON frais_inscription(annee_academique_id);
CREATE INDEX IF NOT EXISTS idx_frais_inscription_actif ON frais_inscription(actif);
CREATE INDEX IF NOT EXISTS idx_frais_inscription_date_limite ON frais_inscription(date_limite_paiement);

-- Index sur les clôtures de caisse
CREATE INDEX IF NOT EXISTS idx_cloture_caisse_date ON cloture_caisse(date_cloture);
CREATE INDEX IF NOT EXISTS idx_cloture_caisse_caissier ON cloture_caisse(caissier_id);
CREATE INDEX IF NOT EXISTS idx_cloture_caisse_valide ON cloture_caisse(valide);

-- Index sur les paiements (nouvelles colonnes)
CREATE INDEX IF NOT EXISTS idx_paiement_type ON paiement(type_paiement);
CREATE INDEX IF NOT EXISTS idx_paiement_cloture ON paiement(cloture_caisse_id);

-- -----------------------------------------------------------------------------
-- Triggers et fonctions pour la gestion automatique
-- -----------------------------------------------------------------------------
-- Trigger pour mettre à jour automatiquement updated_at sur les nouvelles tables
CREATE TRIGGER IF NOT EXISTS update_frais_inscription_updated_at BEFORE UPDATE ON frais_inscription 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_cloture_caisse_updated_at BEFORE UPDATE ON cloture_caisse 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Vues pour les rapports et statistiques
-- -----------------------------------------------------------------------------
-- Vue des frais d'inscription actifs
CREATE OR REPLACE VIEW vue_frais_inscription_actifs AS
SELECT 
    fi.*,
    p.code as parcours_code,
    p.nom as parcours_nom,
    d.nom as departement_nom,
    aa.libelle as annee_academique,
    aa.annee_debut,
    aa.annee_fin,
    COUNT(DISTINCT i.id) as nb_inscriptions,
    COALESCE(SUM(pa.montant), 0) as total_encaisse
FROM frais_inscription fi
JOIN parcours p ON p.id = fi.parcours_id
LEFT JOIN departement d ON d.id = p.departement_id
JOIN annee_academique aa ON aa.id = fi.annee_academique_id
LEFT JOIN inscription i ON i.parcours_id = fi.parcours_id AND i.annee_academique_id = fi.annee_academique_id
LEFT JOIN paiement pa ON pa.inscription_id = i.id AND pa.statut = 'valide'
WHERE fi.actif = true
GROUP BY fi.id, p.code, p.nom, d.nom, aa.libelle, aa.annee_debut, aa.annee_fin;

-- Vue des résumés journaliers de caisse
CREATE OR REPLACE VIEW vue_resume_journalier_caisse AS
SELECT 
    DATE(p.date_paiement) as date,
    COUNT(*) as nb_transactions,
    COALESCE(SUM(p.montant), 0) as total_encaisse,
    COUNT(DISTINCT p.inscription_id) as nb_etudiants,
    COUNT(DISTINCT p.mode_paiement) as nb_modes_paiement,
    jsonb_object_agg(p.mode_paiement, jsonb_build_object(
        'montant', COALESCE(SUM(p.montant), 0),
        'nombre', COUNT(*)
    )) as repartition_modes
FROM paiement p
WHERE p.statut = 'valide'
GROUP BY DATE(p.date_paiement)
ORDER BY date DESC;

-- Vue des statistiques de paiement par parcours
CREATE OR REPLACE VIEW vue_statistiques_paiement_parcours AS
SELECT 
    p.code as parcours_code,
    p.nom as parcours_nom,
    aa.annee_debut,
    aa.annee_fin,
    COUNT(DISTINCT pa.inscription_id) as nb_etudiants_payants,
    COUNT(DISTINCT i.id) as nb_etudiants_inscrits,
    COALESCE(SUM(pa.montant), 0) as total_encaisse,
    COALESCE(AVG(pa.montant), 0) as montant_moyen,
    COUNT(*) as nb_transactions
FROM parcours p
JOIN inscription i ON i.parcours_id = p.id
JOIN annee_academique aa ON aa.id = i.annee_academique_id
LEFT JOIN paiement pa ON pa.inscription_id = i.id AND pa.statut = 'valide'
GROUP BY p.id, p.code, p.nom, aa.annee_debut, aa.annee_fin
ORDER BY total_encaisse DESC;

-- =============================================================================
-- MODULE : PORTAIL enseignant - Tables supplémentaires
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

-- Triggers pour updated_at des tables portail enseignant
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


-- -----------------------------------------------------------------------------
-- Commentaires sur les tables caisse
-- -----------------------------------------------------------------------------
COMMENT ON TABLE frais_inscription IS 'Configuration des frais d''inscription et de scolarité par parcours et année académique';
COMMENT ON TABLE cloture_caisse IS 'Clôture journalière de caisse avec réconciliation bancaire';
COMMENT ON COLUMN frais_inscription.montant_inscription IS 'Frais d''inscription obligatoires';
COMMENT ON COLUMN frais_inscription.montant_scolarite IS 'Frais de scolarité annuels';
COMMENT ON COLUMN frais_inscription.modalites_paiement IS 'Modes de paiement acceptés et options d''échelonnement';
COMMENT ON COLUMN frais_inscription.date_limite_paiement IS 'Date limite pour le paiement sans pénalités';
COMMENT ON COLUMN cloture_caisse.total_general IS 'Total général des encaissements de la journée';
COMMENT ON COLUMN cloture_caisse.details_paiements IS 'Répartition des encaissements par type de paiement';
COMMENT ON COLUMN cloture_caisse.ecart IS 'Écart entre solde théorique et solde bancaire réel';
COMMENT ON COLUMN cloture_caisse.valide IS 'Indique si la clôture a été validée par un superviseur';
-- -----------------------------------------------------------------------------
-- MESSAGERIE ENSEIGNANT - Tables pour communication enseignant-étudiants
-- -----------------------------------------------------------------------------

-- Table pour stocker les messages envoyés par les enseignants
CREATE TABLE IF NOT EXISTS message_enseignant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enseignant_id UUID NOT NULL,
    sujet VARCHAR(255) NOT NULL,
    contenu TEXT NOT NULL,
    type_message VARCHAR(50) NOT NULL CHECK (type_message IN ('direct', 'classe', 'parcours')),
    
    -- Pour message direct
    etudiant_id UUID,
    
    -- Pour message classe
    classe_id UUID,
    
    -- Pour message parcours
    parcours_id UUID,
    niveau_id UUID,
    
    -- Métadonnées
    nombre_destinataires INTEGER DEFAULT 0,
    date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(50) DEFAULT 'envoye' CHECK (statut IN ('envoye', 'lu', 'archive')),
    
    -- Contraintes
    CONSTRAINT fk_message_enseignant FOREIGN KEY (enseignant_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_etudiant FOREIGN KEY (etudiant_id) REFERENCES etudiant(id) ON DELETE CASCADE,
    CONSTRAINT fk_message_parcours FOREIGN KEY (parcours_id) REFERENCES parcours(id) ON DELETE SET NULL,
    CONSTRAINT fk_message_niveau FOREIGN KEY (niveau_id) REFERENCES niveau_etude(id) ON DELETE SET NULL
);

-- Table pour tracker les destinataires individuels et leur statut de lecture
CREATE TABLE IF NOT EXISTS message_destinataire (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    etudiant_id UUID NOT NULL,
    lu BOOLEAN DEFAULT FALSE,
    date_lecture TIMESTAMP,
    
    CONSTRAINT fk_destinataire_message FOREIGN KEY (message_id) REFERENCES message_enseignant(id) ON DELETE CASCADE,
    CONSTRAINT fk_destinataire_etudiant FOREIGN KEY (etudiant_id) REFERENCES etudiant(id) ON DELETE CASCADE,
    CONSTRAINT unique_message_etudiant UNIQUE (message_id, etudiant_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_message_enseignant_id ON message_enseignant(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_message_type ON message_enseignant(type_message);
CREATE INDEX IF NOT EXISTS idx_message_date ON message_enseignant(date_envoi);
CREATE INDEX IF NOT EXISTS idx_destinataire_message ON message_destinataire(message_id);
CREATE INDEX IF NOT EXISTS idx_destinataire_etudiant ON message_destinataire(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_destinataire_lu ON message_destinataire(lu);

-- Commentaires
COMMENT ON TABLE message_enseignant IS 'Messages envoyés par les enseignants aux étudiants';
COMMENT ON TABLE message_destinataire IS 'Destinataires individuels des messages avec statut de lecture';
COMMENT ON COLUMN message_enseignant.type_message IS 'Type: direct (1 étudiant), classe (tous étudiants classe), parcours (filtré par parcours/niveau)';
COMMENT ON COLUMN message_enseignant.nombre_destinataires IS 'Nombre total de destinataires du message';
COMMENT ON COLUMN message_destinataire.lu IS 'Indique si le message a été lu par l''étudiant';


-- Made with Bob - Surveillance & Encadrement Module Added
-- Enhanced with Caisse Module - Frais d'inscription & Payment Management


-- =============================================================================
-- TABLES MANQUANTES - ALIGNEMENT AVEC PRODUCTION
-- Ajouté le 2026-05-18
-- =============================================================================

-- Table: archive_scolarite
CREATE TABLE IF NOT EXISTS archive_scolarite (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    etudiant_id UUID NOT NULL REFERENCES etudiant(id),
    type_document VARCHAR(50) NOT NULL CHECK (type_document IN (
        'releve_notes', 'attestation_reussite', 'diplome', 
        'suplement_diplome', 'certificat_scolarite', 'transcript'
    )),
    titre_document VARCHAR(200) NOT NULL,
    annee_academique VARCHAR(20) NOT NULL,
    semestre SMALLINT,
    fichier_original_url VARCHAR(500),
    fichier_pdf_url VARCHAR(500),
    hash_integrite VARCHAR(128),
    format VARCHAR(20) DEFAULT 'PDF',
    taille_octets BIGINT,
    langue VARCHAR(10) DEFAULT 'FR',
    acces_public BOOLEAN DEFAULT FALSE,
    date_limite_acces DATE,
    archive_par UUID NOT NULL,
    date_archivage TIMESTAMPTZ DEFAULT NOW(),
    duree_conservation INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_archive_scolarite_etudiant ON archive_scolarite(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_archive_scolarite_type ON archive_scolarite(type_document);
CREATE INDEX IF NOT EXISTS idx_archive_scolarite_annee ON archive_scolarite(annee_academique);

-- Table: attestation
CREATE TABLE IF NOT EXISTS attestation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id UUID NOT NULL REFERENCES etudiant(id),
    inscription_id UUID REFERENCES inscription(id),
    type_attestation VARCHAR(50) NOT NULL CHECK (type_attestation IN (
        'scolarite', 'reussite', 'inscription', 'preinscription', 'stage', 'autre'
    )),
    numero_attestation VARCHAR(100) NOT NULL,
    annee_academique_id UUID REFERENCES annee_academique(id),
    motif TEXT,
    observations TEXT,
    statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN (
        'en_attente', 'validee', 'refusee', 'annulee'
    )),
    genere_par UUID,
    date_generation TIMESTAMP DEFAULT NOW(),
    fichier_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    date_emission TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attestation_etudiant ON attestation(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_attestation_numero ON attestation(numero_attestation);
CREATE INDEX IF NOT EXISTS idx_attestation_statut ON attestation(statut);
CREATE INDEX IF NOT EXISTS idx_attestation_type ON attestation(type_attestation);

-- Table: deliberation
CREATE TABLE IF NOT EXISTS deliberation (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    parcours_id UUID NOT NULL REFERENCES parcours(id),
    annee_academique_id UUID NOT NULL REFERENCES annee_academique(id),
    semestre SMALLINT NOT NULL,
    date_deliberation DATE NOT NULL,
    type_deliberation VARCHAR(50) DEFAULT 'ordinaire' CHECK (type_deliberation IN (
        'ordinaire', 'rattrapage', 'exceptionnelle'
    )),
    statut VARCHAR(30) DEFAULT 'planifiee' CHECK (statut IN (
        'planifiee', 'en_cours', 'terminee', 'annulee'
    )),
    president_jury_id UUID,
    secretaire_id UUID,
    membres_jury JSONB,
    observations TEXT,
    pv_genere BOOLEAN DEFAULT FALSE,
    pv_url VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliberation_parcours ON deliberation(parcours_id);
CREATE INDEX IF NOT EXISTS idx_deliberation_annee ON deliberation(annee_academique_id);
CREATE INDEX IF NOT EXISTS idx_deliberation_statut ON deliberation(statut);
CREATE INDEX IF NOT EXISTS idx_deliberation_date ON deliberation(date_deliberation);

-- Table: resultat_ue
CREATE TABLE IF NOT EXISTS resultat_ue (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    etudiant_id UUID NOT NULL REFERENCES etudiant(id),
    inscription_id UUID NOT NULL REFERENCES inscription(id),
    ue_id UUID NOT NULL REFERENCES unite_enseignement(id),
    semestre SMALLINT NOT NULL,
    moyenne NUMERIC(5,2),
    credits_obtenus INTEGER DEFAULT 0,
    statut VARCHAR(30) CHECK (statut IN ('valide', 'non_valide', 'en_cours', 'dispense')),
    session VARCHAR(20) DEFAULT 'normale' CHECK (session IN ('normale', 'rattrapage')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resultat_ue_etudiant ON resultat_ue(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_resultat_ue_inscription ON resultat_ue(inscription_id);
CREATE INDEX IF NOT EXISTS idx_resultat_ue_ue ON resultat_ue(ue_id);
CREATE INDEX IF NOT EXISTS idx_resultat_ue_semestre ON resultat_ue(semestre);

-- Table: resultat_semestre
CREATE TABLE IF NOT EXISTS resultat_semestre (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    etudiant_id UUID NOT NULL REFERENCES etudiant(id),
    inscription_id UUID NOT NULL REFERENCES inscription(id),
    semestre SMALLINT NOT NULL,
    moyenne_generale NUMERIC(5,2),
    credits_obtenus INTEGER DEFAULT 0,
    credits_requis INTEGER,
    decision VARCHAR(50) CHECK (decision IN (
        'admis', 'ajourné', 'redouble', 'exclu', 'en_attente'
    )),
    mention VARCHAR(50) CHECK (mention IN (
        'passable', 'assez_bien', 'bien', 'tres_bien', 'excellent', NULL
    )),
    rang INTEGER,
    effectif_classe INTEGER,
    deliberation_id UUID REFERENCES deliberation(id),
    observations TEXT,
    valide BOOLEAN DEFAULT FALSE,
    date_validation TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resultat_semestre_etudiant ON resultat_semestre(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_resultat_semestre_inscription ON resultat_semestre(inscription_id);
CREATE INDEX IF NOT EXISTS idx_resultat_semestre_deliberation ON resultat_semestre(deliberation_id);
CREATE INDEX IF NOT EXISTS idx_resultat_semestre_semestre ON resultat_semestre(semestre);

-- Table: verrouillage_notes
CREATE TABLE IF NOT EXISTS verrouillage_notes (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    ue_id UUID NOT NULL REFERENCES unite_enseignement(id),
    semestre SMALLINT NOT NULL,
    annee_academique_id UUID NOT NULL REFERENCES annee_academique(id),
    verrouille BOOLEAN DEFAULT FALSE,
    verrouille_par UUID,
    date_verrouillage TIMESTAMPTZ,
    motif TEXT,
    deverrouille_par UUID,
    date_deverrouillage TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verrouillage_notes_ue ON verrouillage_notes(ue_id);
CREATE INDEX IF NOT EXISTS idx_verrouillage_notes_annee ON verrouillage_notes(annee_academique_id);
CREATE INDEX IF NOT EXISTS idx_verrouillage_notes_semestre ON verrouillage_notes(semestre);
CREATE UNIQUE INDEX IF NOT EXISTS idx_verrouillage_notes_unique ON verrouillage_notes(ue_id, semestre, annee_academique_id);

-- Table: suplement_diplome
CREATE TABLE IF NOT EXISTS suplement_diplome (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    diplome_id UUID NOT NULL REFERENCES diplome(id),
    etudiant_id UUID NOT NULL REFERENCES etudiant(id),
    parcours_suivi TEXT,
    competences_acquises TEXT,
    stages_effectues TEXT,
    projets_realises TEXT,
    activites_extra TEXT,
    langues_maitrisees JSONB,
    certifications JSONB,
    mobilite_internationale TEXT,
    systeme_notation TEXT,
    echelle_ects TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suplement_diplome_diplome ON suplement_diplome(diplome_id);
CREATE INDEX IF NOT EXISTS idx_suplement_diplome_etudiant ON suplement_diplome(etudiant_id);

-- Table: transfert_etudiant
CREATE TABLE IF NOT EXISTS transfert_etudiant (
    id UUID PRIMARY KEY DEFAULT public.uuid_generate_v4(),
    etudiant_id UUID NOT NULL REFERENCES etudiant(id),
    parcours_origine_id UUID NOT NULL REFERENCES parcours(id),
    parcours_destination_id UUID REFERENCES parcours(id),
    etablissement_destination VARCHAR(200),
    type_transfert VARCHAR(50) NOT NULL CHECK (type_transfert IN (
        'interne', 'externe', 'reorientation'
    )),
    motif TEXT,
    date_demande DATE DEFAULT CURRENT_DATE,
    statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN (
        'en_attente', 'approuve', 'refuse', 'annule'
    )),
    traite_par UUID,
    date_traitement TIMESTAMPTZ,
    observations TEXT,
    documents_fournis JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transfert_etudiant_etudiant ON transfert_etudiant(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_transfert_etudiant_origine ON transfert_etudiant(parcours_origine_id);
CREATE INDEX IF NOT EXISTS idx_transfert_etudiant_statut ON transfert_etudiant(statut);
CREATE INDEX IF NOT EXISTS idx_transfert_etudiant_date ON transfert_etudiant(date_demande);

-- Table: paiement_inscription
CREATE TABLE IF NOT EXISTS paiement_inscription (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inscription_id UUID NOT NULL REFERENCES inscription(id),
    montant_total NUMERIC(10,2) NOT NULL,
    montant_paye NUMERIC(10,2) DEFAULT 0,
    montant_restant NUMERIC(10,2),
    statut VARCHAR(30) DEFAULT 'impaye' CHECK (statut IN (
        'impaye', 'partiel', 'complet', 'exonere'
    )),
    date_limite DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_paiement_inscription_inscription ON paiement_inscription(inscription_id);
CREATE INDEX IF NOT EXISTS idx_paiement_inscription_statut ON paiement_inscription(statut);
CREATE INDEX IF NOT EXISTS idx_paiement_inscription_date_limite ON paiement_inscription(date_limite);

-- =============================================================================
-- AJOUT DES COLONNES MANQUANTES DANS LES TABLES EXISTANTES
-- =============================================================================

-- Table utilisateur: ajout colonnes tenant_id et parcours_assignes
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'utilisateur' AND column_name = 'tenant_id') THEN
        ALTER TABLE utilisateur ADD COLUMN tenant_id VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'utilisateur' AND column_name = 'parcours_assignes') THEN
        ALTER TABLE utilisateur ADD COLUMN parcours_assignes JSONB;
    END IF;
END $$;

-- Table parcours: ajout colonnes de validation président
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parcours' AND column_name = 'date_ouverture') THEN
        ALTER TABLE parcours ADD COLUMN date_ouverture DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parcours' AND column_name = 'motif_ouverture') THEN
        ALTER TABLE parcours ADD COLUMN motif_ouverture TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parcours' AND column_name = 'conditions_ouverture') THEN
        ALTER TABLE parcours ADD COLUMN conditions_ouverture TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parcours' AND column_name = 'date_fermeture') THEN
        ALTER TABLE parcours ADD COLUMN date_fermeture DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parcours' AND column_name = 'motif_fermeture') THEN
        ALTER TABLE parcours ADD COLUMN motif_fermeture TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'parcours' AND column_name = 'valide_par_president') THEN
        ALTER TABLE parcours ADD COLUMN valide_par_president UUID;
    END IF;
END $$;

-- Table contrat_personnel: ajout colonnes de validation
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contrat_personnel' AND column_name = 'valide_par') THEN
        ALTER TABLE contrat_personnel ADD COLUMN valide_par UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contrat_personnel' AND column_name = 'valide_le') THEN
        ALTER TABLE contrat_personnel ADD COLUMN valide_le TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contrat_personnel' AND column_name = 'commentaire_president') THEN
        ALTER TABLE contrat_personnel ADD COLUMN commentaire_president TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'contrat_personnel' AND column_name = 'conditions_speciales') THEN
        ALTER TABLE contrat_personnel ADD COLUMN conditions_speciales TEXT;
    END IF;
END $$;

-- Table depense: ajout colonnes de validation président
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'depense' AND column_name = 'valide_par_president') THEN
        ALTER TABLE depense ADD COLUMN valide_par_president UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'depense' AND column_name = 'valide_le') THEN
        ALTER TABLE depense ADD COLUMN valide_le TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'depense' AND column_name = 'motif_decision') THEN
        ALTER TABLE depense ADD COLUMN motif_decision TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'depense' AND column_name = 'conditions_speciales') THEN
        ALTER TABLE depense ADD COLUMN conditions_speciales TEXT;
    END IF;
END $$;

-- Table calendrier_academique: ajout colonnes de validation président
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'calendrier_academique' AND column_name = 'valide_par_president') THEN
        ALTER TABLE calendrier_academique ADD COLUMN valide_par_president UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'calendrier_academique' AND column_name = 'valide_le') THEN
        ALTER TABLE calendrier_academique ADD COLUMN valide_le TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'calendrier_academique' AND column_name = 'commentaire_president') THEN
        ALTER TABLE calendrier_academique ADD COLUMN commentaire_president TEXT;
    END IF;
END $$;

-- Table grille_tarifaire: ajout colonnes de tarification
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grille_tarifaire' AND column_name = 'montant_inscription') THEN
        ALTER TABLE grille_tarifaire ADD COLUMN montant_inscription NUMERIC(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grille_tarifaire' AND column_name = 'montant_scolarite') THEN
        ALTER TABLE grille_tarifaire ADD COLUMN montant_scolarite NUMERIC(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grille_tarifaire' AND column_name = 'date_limite_paiement') THEN
        ALTER TABLE grille_tarifaire ADD COLUMN date_limite_paiement DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'grille_tarifaire' AND column_name = 'modalites_paiement') THEN
        ALTER TABLE grille_tarifaire ADD COLUMN modalites_paiement TEXT;
    END IF;
END $$;

-- Table paiement: ajout colonnes de détails
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'paiement' AND column_name = 'type_paiement') THEN
        ALTER TABLE paiement ADD COLUMN type_paiement VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'paiement' AND column_name = 'cloture_caisse_id') THEN
        ALTER TABLE paiement ADD COLUMN cloture_caisse_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'paiement' AND column_name = 'details_paiement') THEN
        ALTER TABLE paiement ADD COLUMN details_paiement JSONB;
    END IF;
END $$;

-- =============================================================================
-- COMMENTAIRES SUR LES NOUVELLES TABLES
-- =============================================================================

COMMENT ON TABLE archive_scolarite IS 'Archivage sécurisé des documents de scolarité avec hash d''intégrité';
COMMENT ON TABLE attestation IS 'Gestion des attestations étudiants (scolarité, réussite, inscription, etc.)';
COMMENT ON TABLE deliberation IS 'Délibérations académiques par parcours et semestre';
COMMENT ON TABLE resultat_ue IS 'Résultats détaillés par UE pour chaque étudiant';
COMMENT ON TABLE resultat_semestre IS 'Résultats semestriels avec décision et mention';
COMMENT ON TABLE verrouillage_notes IS 'Verrouillage des saisies de notes par UE et semestre';
COMMENT ON TABLE suplement_diplome IS 'Supplément au diplôme avec compétences et parcours détaillé';
COMMENT ON TABLE transfert_etudiant IS 'Gestion des transferts et réorientations d''étudiants';
COMMENT ON TABLE paiement_inscription IS 'Suivi des paiements d''inscription par étudiant';

-- =============================================================================
-- FIN DES AJOUTS - SCHEMA TENANT COMPLET
-- Total: 74 tables (63 originales + 9 nouvelles + 2 message_enseignant)
-- =============================================================================
