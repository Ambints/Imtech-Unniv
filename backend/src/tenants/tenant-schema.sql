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
                            'etudiant', 'parent', 'professeur'
                        )),
    actif               BOOLEAN      DEFAULT TRUE,
    email_verifie       BOOLEAN      DEFAULT FALSE,
    derniere_connexion  TIMESTAMPTZ,
    token_reset         TEXT,
    token_reset_expiry  TIMESTAMPTZ,
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
    actif           BOOLEAN     DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (parcours_id, code)
);

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
    created_at          TIMESTAMPTZ DEFAULT NOW()
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
                        CHECK (cible IN ('tous', 'etudiants', 'parents', 'professeurs', 'personnel', 'parcours')),
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
    type_portail        VARCHAR(20) NOT NULL CHECK (type_portail IN ('etudiant', 'parent', 'professeur')),
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
    (SELECT COUNT(*) FROM utilisateur WHERE role = 'professeur' AND actif = TRUE) AS total_enseignants,
    (SELECT COUNT(*) FROM utilisateur WHERE role NOT IN ('etudiant', 'parent', 'professeur') AND actif = TRUE) AS total_personnel,
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

-- Made with Bob - Surveillance & Encadrement Module Added
-- Enhanced with Caisse Module - Frais d'inscription & Payment Management
