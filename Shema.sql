/* 
Partie 1 — Schéma Public (SaaS) : tables tenant, domaine, plan_abonnement, abonnement, super_admin. C'est le niveau Super-Admin qui provisionne chaque université avec son isolement PostgreSQL.
Partie 2 — Schéma Tenant (par université) : 44 tables réparties en 8 modules fonctionnels — Authentification (JWT/sessions), Structure académique (parcours, UE, EC, calendrier), Étudiants & inscriptions, Enseignants & cours, Emplois du temps & salles, Notes & scolarité (avec verrouillage post-délibération et hachage SHA-512 des diplômes), Financier (paiements multicanaux, budget, dépenses), RH, Logistique & maintenance, Communication.
Partie 3 — 27 index sur toutes les colonnes critiques (recherches fréquentes par matricule, email, date, statut, etc.).
Partie 4 — Triggers & fonctions :

updated_at automatique sur toutes les tables clés
Alerte stock avec notification automatique au responsable logistique
Blocage de modification d'une note verrouillée après délibération
Génération automatique du numéro de reçu (RECU-YYYYMMDD-XXXXXX)
Notification étudiant à chaque paiement enregistré

Partie 5 — Seed Data : plans SaaS, tenant démo, 7 utilisateurs, départements, parcours, salles, stocks et session d'examen.
Partie 6 — 5 vues : KPI Président, état paiements par étudiant, absences/assiduité, moyennes UE et moyennes semestrielles.
*/


-- =============================================================================
-- IMTECH UNIVERSITY - Script SQL Complet
-- Architecture Multi-Tenant (django-tenants / PostgreSQL)
-- =============================================================================



-- =============================================================================
-- PARTIE 1 : SCHÉMA PUBLIC (Super-Administration SaaS)
-- Contient la gestion des universités clientes et des abonnements
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Table : Tenant (Universités clientes)
-- -----------------------------------------------------------------------------
CREATE TABLE public.tenant (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    schema_name         VARCHAR(63)  NOT NULL UNIQUE,  -- Nom du schéma PostgreSQL isolé
    nom                 VARCHAR(200) NOT NULL,
    slug                VARCHAR(100) NOT NULL UNIQUE,   -- Sous-domaine : slug.imtech.edu
    slogan              VARCHAR(255),
    logo_url            VARCHAR(500),
    couleur_principale  VARCHAR(7)   DEFAULT '#1a7a4a', -- Hex White Label
    couleur_secondaire  VARCHAR(7)   DEFAULT '#1565c0',
    couleur_accent      VARCHAR(7)   DEFAULT '#e65100',
    couleur_texte       VARCHAR(7)   DEFAULT '#ffffff',
    entete_document     TEXT,                           -- HTML de l'en-tête des documents officiels
    adresse             TEXT,
    pays                VARCHAR(100) DEFAULT 'Madagascar',
    telephone           VARCHAR(30),
    email_contact       VARCHAR(200),
    site_web            VARCHAR(300),
    type_etablissement  VARCHAR(50)  DEFAULT 'catholique',
    actif               BOOLEAN      DEFAULT TRUE,
    -- Champs d'abonnement
    plan_abonnement     VARCHAR(20)  DEFAULT 'basic',      -- basic, standard, premium, enterprise
    statut_abonnement   VARCHAR(20)  DEFAULT 'active',     -- active, expired, suspended
    date_debut_abonnement DATE,
    date_fin_abonnement   DATE,
    prix_mensuel        DECIMAL(10,2) DEFAULT 50000,
    max_utilisateurs    INTEGER      DEFAULT 100,
    created_at          TIMESTAMPTZ  DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Domaine (Domaines/sous-domaines liés à un tenant)
-- -----------------------------------------------------------------------------
CREATE TABLE public.domaine (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id   UUID        NOT NULL REFERENCES public.tenant(id) ON DELETE CASCADE,
    domaine     VARCHAR(253) NOT NULL UNIQUE,
    is_primary  BOOLEAN     DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Plan d'abonnement SaaS
-- -----------------------------------------------------------------------------
CREATE TABLE public.plan_abonnement (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom                 VARCHAR(100) NOT NULL,          -- Ex: Starter, Pro, Enterprise
    description         TEXT,
    prix_mensuel        DECIMAL(10,2) NOT NULL,
    max_etudiants       INTEGER,                        -- NULL = illimité
    max_utilisateurs    INTEGER,
    fonctionnalites     JSONB        DEFAULT '{}',      -- Fonctionnalités activées
    actif               BOOLEAN      DEFAULT TRUE,
    created_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Abonnement (Lien tenant ↔ plan)
-- -----------------------------------------------------------------------------
CREATE TABLE public.abonnement (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id       UUID        NOT NULL REFERENCES public.tenant(id) ON DELETE CASCADE,
    plan_id         UUID        NOT NULL REFERENCES public.plan_abonnement(id),
    date_debut      DATE        NOT NULL DEFAULT CURRENT_DATE,
    date_fin        DATE,
    statut          VARCHAR(20) NOT NULL DEFAULT 'actif'
                    CHECK (statut IN ('actif', 'suspendu', 'expire', 'essai')),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Super-Administrateur
-- -----------------------------------------------------------------------------
CREATE TABLE public.super_admin (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(254) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    nom             VARCHAR(100) NOT NULL,
    prenom          VARCHAR(100) NOT NULL,
    actif           BOOLEAN      DEFAULT TRUE,
    derniere_connexion TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);




-- =============================================================================
-- PARTIE 2 : SCHÉMA TENANT (Par université)
-- Toutes les tables ci-dessous sont créées dans chaque schéma isolé
-- Ex : schema "univ_saint_paul", "univ_notre_dame", etc.
-- =============================================================================

-- Pour les tests, on crée un schéma exemple
CREATE SCHEMA IF NOT EXISTS univ_demo;
SET search_path TO univ_demo;

-- =============================================================================
-- MODULE : AUTHENTIFICATION & UTILISATEURS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table : Utilisateur (Compte de connexion unifié pour tous les rôles)
-- -----------------------------------------------------------------------------
CREATE TABLE utilisateur (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    token_reset         VARCHAR(255),
    token_reset_expiry  TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Session JWT (Gestion des refresh tokens)
-- -----------------------------------------------------------------------------
CREATE TABLE session_jwt (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- -----------------------------------------------------------------------------
-- Table : Annee Academique
-- -----------------------------------------------------------------------------
CREATE TABLE annee_academique (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    libelle         VARCHAR(20) NOT NULL UNIQUE, -- Ex: 2025-2026
    date_debut      DATE        NOT NULL,
    date_fin        DATE        NOT NULL,
    active          BOOLEAN     DEFAULT FALSE,   -- Une seule active à la fois
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Departement / Faculté
-- -----------------------------------------------------------------------------
CREATE TABLE departement (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(20) NOT NULL UNIQUE,
    nom             VARCHAR(200) NOT NULL,
    description     TEXT,
    responsable_id  UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    actif           BOOLEAN     DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Parcours (Licence, Master, Doctorat)
-- -----------------------------------------------------------------------------
CREATE TABLE parcours (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    departement_id      UUID        NOT NULL REFERENCES departement(id) ON DELETE RESTRICT,
    code                VARCHAR(30) NOT NULL UNIQUE,
    nom                 VARCHAR(200) NOT NULL,
    niveau              VARCHAR(20) NOT NULL CHECK (niveau IN ('Licence', 'Master', 'Doctorat', 'BTS', 'DUT')),
    duree_annees        SMALLINT    NOT NULL DEFAULT 3,
    responsable_id      UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    description         TEXT,
    actif               BOOLEAN     DEFAULT TRUE,
    annee_ouverture     INTEGER,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Unité d'Enseignement (UE)
-- -----------------------------------------------------------------------------
CREATE TABLE unite_enseignement (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcours_id     UUID        NOT NULL REFERENCES parcours(id) ON DELETE RESTRICT,
    code            VARCHAR(30) NOT NULL,
    intitule        VARCHAR(200) NOT NULL,
    credits_ects    SMALLINT    NOT NULL DEFAULT 3,
    coefficient     DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    volume_cm       SMALLINT    DEFAULT 0,  -- Cours Magistral (heures)
    volume_td       SMALLINT    DEFAULT 0,  -- Travaux Dirigés (heures)
    volume_tp       SMALLINT    DEFAULT 0,  -- Travaux Pratiques (heures)
    semestre        SMALLINT    NOT NULL CHECK (semestre BETWEEN 1 AND 12),
    annee_niveau    SMALLINT    NOT NULL CHECK (annee_niveau BETWEEN 1 AND 8),
    type_ue         VARCHAR(20) DEFAULT 'obligatoire' CHECK (type_ue IN ('obligatoire', 'optionnel', 'libre')),
    actif           BOOLEAN     DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (parcours_id, code)
);

-- -----------------------------------------------------------------------------
-- Table : Element Constitutif (EC - sous-matière d'une UE)
-- -----------------------------------------------------------------------------
CREATE TABLE element_constitutif (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    ue_id           UUID        NOT NULL REFERENCES unite_enseignement(id) ON DELETE CASCADE,
    code            VARCHAR(30) NOT NULL,
    intitule        VARCHAR(200) NOT NULL,
    coefficient     DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    actif           BOOLEAN     DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (ue_id, code)
);

-- -----------------------------------------------------------------------------
-- Table : Calendrier Académique
-- -----------------------------------------------------------------------------
CREATE TABLE calendrier_academique (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    evenement           VARCHAR(200) NOT NULL,
    type_evenement      VARCHAR(50) NOT NULL
                        CHECK (type_evenement IN (
                            'rentree', 'cours', 'vacances', 'examens',
                            'deliberation', 'ceremonie', 'pastoral', 'autre'
                        )),
    date_debut          DATE        NOT NULL,
    date_fin            DATE        NOT NULL,
    parcours_id         UUID        REFERENCES parcours(id),  -- NULL = tous parcours
    description         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- MODULE : ÉTUDIANTS & INSCRIPTIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table : Étudiant (Profil complet)
-- -----------------------------------------------------------------------------
CREATE TABLE etudiant (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- -----------------------------------------------------------------------------
-- Table : Inscription (Annuelle par parcours)
-- -----------------------------------------------------------------------------
CREATE TABLE inscription (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- -----------------------------------------------------------------------------
-- Table : Enseignant (Profil pédagogique)
-- -----------------------------------------------------------------------------
CREATE TABLE enseignant (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    utilisateur_id      UUID        UNIQUE REFERENCES utilisateur(id) ON DELETE SET NULL,
    matricule           VARCHAR(30) NOT NULL UNIQUE,
    nom                 VARCHAR(100) NOT NULL,
    prenom              VARCHAR(100) NOT NULL,
    titre               VARCHAR(50),  -- Dr, Pr, M., Mme
    grade               VARCHAR(50),  -- Maître de conférence, Professeur agrégé...
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

-- -----------------------------------------------------------------------------
-- Table : Affectation Cours (Enseignant → UE/EC)
-- -----------------------------------------------------------------------------
CREATE TABLE affectation_cours (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- -----------------------------------------------------------------------------
-- Table : Bâtiment
-- -----------------------------------------------------------------------------
CREATE TABLE batiment (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom         VARCHAR(100) NOT NULL,
    code        VARCHAR(20) UNIQUE,
    adresse     TEXT,
    actif       BOOLEAN     DEFAULT TRUE
);

-- -----------------------------------------------------------------------------
-- Table : Salle
-- -----------------------------------------------------------------------------
CREATE TABLE salle (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    batiment_id     UUID        REFERENCES batiment(id) ON DELETE SET NULL,
    nom             VARCHAR(100) NOT NULL,
    code            VARCHAR(20) UNIQUE,
    capacite        SMALLINT    NOT NULL,
    type_salle      VARCHAR(30) NOT NULL DEFAULT 'cours'
                    CHECK (type_salle IN ('cours', 'amphitheatre', 'laboratoire', 'salle_info', 'salle_reunion', 'bibliotheque')),
    equipements     JSONB       DEFAULT '{}', -- {"projecteur": true, "climatisation": true, ...}
    disponible      BOOLEAN     DEFAULT TRUE,
    etage           SMALLINT    DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Emploi du Temps (Séance planifiée)
-- -----------------------------------------------------------------------------
CREATE TABLE emploi_du_temps (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    CHECK (heure_fin > heure_debut)
);

-- =============================================================================
-- MODULE : ASSIDUITÉ & DISCIPLINE
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table : Présence / Absence
-- -----------------------------------------------------------------------------
CREATE TABLE presence (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- -----------------------------------------------------------------------------
-- Table : Incident Disciplinaire
-- -----------------------------------------------------------------------------
CREATE TABLE incident_disciplinaire (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id),
    date_incident       DATE        NOT NULL DEFAULT CURRENT_DATE,
    type_incident       VARCHAR(50) NOT NULL
                        CHECK (type_incident IN ('retard', 'absentéisme', 'incivilite', 'triche', 'violence', 'autre')),
    description         TEXT        NOT NULL,
    sanction            VARCHAR(100),
    duree_sanction      INTEGER,    -- En jours
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

-- -----------------------------------------------------------------------------
-- Table : Session d'Examen
-- -----------------------------------------------------------------------------
CREATE TABLE session_examen (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    libelle             VARCHAR(100) NOT NULL, -- Ex: Session 1 - Semestre 1
    type_session        VARCHAR(20) NOT NULL DEFAULT 'normale'
                        CHECK (type_session IN ('normale', 'rattrapage', 'deuxieme_chance')),
    semestre            SMALLINT    NOT NULL,
    date_debut          DATE,
    date_fin            DATE,
    statut              VARCHAR(20) DEFAULT 'planifie'
                        CHECK (statut IN ('planifie', 'en_cours', 'cloturee', 'deliberee')),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Note (Résultat d'évaluation)
-- -----------------------------------------------------------------------------
CREATE TABLE note (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    hash_integrite      VARCHAR(128), -- SHA-512 de (etudiant_id || valeur || session_id)
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

-- -----------------------------------------------------------------------------
-- Vue : Moyenne par UE et par étudiant
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Vue : Moyenne générale par étudiant par semestre
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Table : Procès-Verbal de Délibération
-- -----------------------------------------------------------------------------
CREATE TABLE pv_deliberation (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id          UUID        NOT NULL REFERENCES session_examen(id),
    parcours_id         UUID        NOT NULL REFERENCES parcours(id),
    annee_niveau        SMALLINT    NOT NULL,
    date_deliberation   DATE        NOT NULL DEFAULT CURRENT_DATE,
    president_jury      UUID        NOT NULL REFERENCES utilisateur(id),
    membres_jury        JSONB       DEFAULT '[]', -- Liste des UUID membres
    statut              VARCHAR(20) DEFAULT 'brouillon'
                        CHECK (statut IN ('brouillon', 'signe', 'transmis', 'archive')),
    fichier_pv_url      VARCHAR(500),
    hash_pv             VARCHAR(128),
    observations        TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Résultat Final de Délibération (par étudiant)
-- -----------------------------------------------------------------------------
CREATE TABLE resultat_deliberation (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- -----------------------------------------------------------------------------
-- Table : Diplôme (Archivage officiel avec hachage)
-- -----------------------------------------------------------------------------
CREATE TABLE diplome (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    hash_document       VARCHAR(128) NOT NULL, -- SHA-512 du fichier PDF généré
    signe_par           UUID        NOT NULL REFERENCES utilisateur(id), -- Président
    signature_url       VARCHAR(500),
    date_signature      TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (etudiant_id, type_diplome, parcours_id)
);

-- =============================================================================
-- MODULE : FINANCIER (Caisse & Économat)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Table : Grille Tarifaire (Frais de scolarité par parcours)
-- -----------------------------------------------------------------------------
CREATE TABLE grille_tarifaire (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    parcours_id         UUID        NOT NULL REFERENCES parcours(id),
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    annee_niveau        SMALLINT,   -- NULL = tous niveaux
    montant_total       DECIMAL(12,2) NOT NULL,
    nb_tranches         SMALLINT    DEFAULT 1,
    description         TEXT,
    actif               BOOLEAN     DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (parcours_id, annee_academique_id, annee_niveau)
);

-- -----------------------------------------------------------------------------
-- Table : Échéancier (Plan de paiement par inscription)
-- -----------------------------------------------------------------------------
CREATE TABLE echeancier (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    inscription_id  UUID        NOT NULL REFERENCES inscription(id) ON DELETE CASCADE,
    num_tranche     SMALLINT    NOT NULL,
    montant_du      DECIMAL(12,2) NOT NULL,
    date_echeance   DATE        NOT NULL,
    statut          VARCHAR(20) DEFAULT 'en_attente'
                    CHECK (statut IN ('en_attente', 'paye', 'en_retard', 'annule')),
    UNIQUE (inscription_id, num_tranche)
);

-- -----------------------------------------------------------------------------
-- Table : Paiement (Enregistrement de chaque transaction)
-- -----------------------------------------------------------------------------
CREATE TABLE paiement (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    inscription_id      UUID        NOT NULL REFERENCES inscription(id) ON DELETE RESTRICT,
    echeancier_id       UUID        REFERENCES echeancier(id),
    montant             DECIMAL(12,2) NOT NULL CHECK (montant > 0),
    mode_paiement       VARCHAR(20) NOT NULL
                        CHECK (mode_paiement IN ('especes', 'cheque', 'virement', 'carte_bancaire', 'mobile_money')),
    date_paiement       TIMESTAMPTZ DEFAULT NOW(),
    reference           VARCHAR(100) UNIQUE, -- Numéro de référence bancaire
    numero_recu         VARCHAR(50) NOT NULL UNIQUE,
    recu_url            VARCHAR(500),
    caissier_id         UUID        NOT NULL REFERENCES utilisateur(id),
    statut              VARCHAR(20) DEFAULT 'valide'
                        CHECK (statut IN ('valide', 'annule', 'rembourse', 'en_attente')),
    motif_annulation    TEXT,
    observations        TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Budget (Par département / exercice)
-- -----------------------------------------------------------------------------
CREATE TABLE budget (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    departement_id      UUID        REFERENCES departement(id),
    categorie           VARCHAR(100) NOT NULL, -- Ressources humaines, Investissements...
    montant_prevu       DECIMAL(15,2) NOT NULL,
    montant_realise     DECIMAL(15,2) DEFAULT 0,
    description         TEXT,
    created_by          UUID        REFERENCES utilisateur(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Dépense / Achat
-- -----------------------------------------------------------------------------
CREATE TABLE depense (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- -----------------------------------------------------------------------------
-- Table : Contrat Personnel
-- -----------------------------------------------------------------------------
CREATE TABLE contrat_personnel (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    utilisateur_id      UUID        NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    type_contrat        VARCHAR(30) NOT NULL
                        CHECK (type_contrat IN ('CDI', 'CDD', 'vacataire', 'stagiaire', 'benevolat')),
    poste               VARCHAR(200) NOT NULL,
    departement_id      UUID        REFERENCES departement(id),
    date_debut          DATE        NOT NULL,
    date_fin            DATE,       -- NULL si CDI
    salaire_brut        DECIMAL(12,2),
    salaire_net         DECIMAL(12,2),
    volume_horaire_hebdo SMALLINT,
    actif               BOOLEAN     DEFAULT TRUE,
    fichier_contrat_url VARCHAR(500),
    observations        TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Congé / Absence Personnel
-- -----------------------------------------------------------------------------
CREATE TABLE conge_personnel (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- -----------------------------------------------------------------------------
-- Table : Fiche de Paie
-- -----------------------------------------------------------------------------
CREATE TABLE fiche_paie (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- -----------------------------------------------------------------------------
-- Table : Ticket de Maintenance
-- -----------------------------------------------------------------------------
CREATE TABLE ticket_maintenance (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- -----------------------------------------------------------------------------
-- Table : Réservation de Salle (hors cours)
-- -----------------------------------------------------------------------------
CREATE TABLE reservation_salle (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- -----------------------------------------------------------------------------
-- Table : Stock (Inventaire des consommables et matériels)
-- -----------------------------------------------------------------------------
CREATE TABLE stock (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference           VARCHAR(50) NOT NULL UNIQUE,
    libelle             VARCHAR(200) NOT NULL,
    categorie           VARCHAR(50) NOT NULL
                        CHECK (categorie IN ('bureau', 'nettoyage', 'informatique', 'pedagogique', 'energie', 'autre')),
    unite               VARCHAR(20) NOT NULL, -- Kg, L, Pièce, Rame...
    quantite_stock      DECIMAL(10,2) NOT NULL DEFAULT 0,
    seuil_alerte        DECIMAL(10,2) NOT NULL DEFAULT 0,
    prix_unitaire       DECIMAL(10,2),
    fournisseur         VARCHAR(200),
    emplacement         VARCHAR(100),
    derniere_mise_a_jour TIMESTAMPTZ DEFAULT NOW(),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Mouvement de Stock
-- -----------------------------------------------------------------------------
CREATE TABLE mouvement_stock (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_id            UUID        NOT NULL REFERENCES stock(id),
    type_mouvement      VARCHAR(20) NOT NULL
                        CHECK (type_mouvement IN ('entree', 'sortie', 'ajustement')),
    quantite            DECIMAL(10,2) NOT NULL,
    motif               VARCHAR(200),
    reference_doc       VARCHAR(100),
    utilisateur_id      UUID        REFERENCES utilisateur(id),
    date_mouvement      TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Planning Entretien / Nettoyage
-- -----------------------------------------------------------------------------
CREATE TABLE planning_entretien (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    salle_id            UUID        REFERENCES salle(id),
    batiment_id         UUID        REFERENCES batiment(id),
    zone                VARCHAR(200), -- Si ni salle ni bâtiment
    type_nettoyage      VARCHAR(50) NOT NULL
                        CHECK (type_nettoyage IN ('quotidien', 'hebdomadaire', 'mensuel', 'apres_evenement', 'desinfection')),
    responsable_id      UUID        REFERENCES utilisateur(id),
    jour_semaine        SMALLINT    CHECK (jour_semaine BETWEEN 1 AND 7), -- 1=Lundi
    heure_debut         TIME,
    duree_minutes       SMALLINT,
    actif               BOOLEAN     DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Rapport d'Entretien (Trace de réalisation)
-- -----------------------------------------------------------------------------
CREATE TABLE rapport_entretien (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- -----------------------------------------------------------------------------
-- Table : Annonce / Actualité
-- -----------------------------------------------------------------------------
CREATE TABLE annonce (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    titre               VARCHAR(300) NOT NULL,
    contenu             TEXT        NOT NULL,
    type_annonce        VARCHAR(30) DEFAULT 'information'
                        CHECK (type_annonce IN ('information', 'urgent', 'evenement', 'resultat', 'pastoral', 'fermeture')),
    cible               VARCHAR(20) DEFAULT 'tous'
                        CHECK (cible IN ('tous', 'etudiants', 'parents', 'professeurs', 'personnel', 'parcours')),
    parcours_id         UUID        REFERENCES parcours(id),  -- Si cible = 'parcours'
    publie              BOOLEAN     DEFAULT FALSE,
    date_publication    TIMESTAMPTZ,
    date_expiration     TIMESTAMPTZ,
    auteur_id           UUID        NOT NULL REFERENCES utilisateur(id),
    photo_url           VARCHAR(500),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : Notification (Alertes individuelles)
-- -----------------------------------------------------------------------------
CREATE TABLE notification (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- -----------------------------------------------------------------------------
-- Table : Messagerie Interne (Fil de discussion)
-- -----------------------------------------------------------------------------
CREATE TABLE message (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    expediteur_id       UUID        NOT NULL REFERENCES utilisateur(id),
    destinataire_id     UUID        NOT NULL REFERENCES utilisateur(id),
    sujet               VARCHAR(300),
    contenu             TEXT        NOT NULL,
    lu                  BOOLEAN     DEFAULT FALSE,
    lu_at               TIMESTAMPTZ,
    parent_id           UUID        REFERENCES message(id), -- Pour les réponses
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PARTIE 3 : INDEX DE PERFORMANCE
-- =============================================================================

-- Authentification
CREATE INDEX idx_utilisateur_email ON utilisateur(email);
CREATE INDEX idx_utilisateur_role ON utilisateur(role);
CREATE INDEX idx_session_jwt_token ON session_jwt(refresh_token);
CREATE INDEX idx_session_jwt_user ON session_jwt(utilisateur_id);

-- Étudiants
CREATE INDEX idx_etudiant_matricule ON etudiant(matricule);
CREATE INDEX idx_etudiant_nom ON etudiant(nom, prenom);
CREATE INDEX idx_inscription_etudiant ON inscription(etudiant_id);
CREATE INDEX idx_inscription_parcours_annee ON inscription(parcours_id, annee_academique_id);

-- Notes
CREATE INDEX idx_note_etudiant ON note(etudiant_id);
CREATE INDEX idx_note_session ON note(session_id);
CREATE INDEX idx_note_ue ON note(ue_id);
CREATE INDEX idx_note_ec ON note(ec_id);
CREATE INDEX idx_note_verrouille ON note(verrouille);

-- Présences
CREATE INDEX idx_presence_etudiant ON presence(etudiant_id);
CREATE INDEX idx_presence_seance ON presence(seance_id);
CREATE INDEX idx_presence_statut ON presence(statut);

-- Emploi du temps
CREATE INDEX idx_edt_date ON emploi_du_temps(date_seance);
CREATE INDEX idx_edt_salle ON emploi_du_temps(salle_id);
CREATE INDEX idx_edt_affectation ON emploi_du_temps(affectation_id);

-- Paiements
CREATE INDEX idx_paiement_inscription ON paiement(inscription_id);
CREATE INDEX idx_paiement_date ON paiement(date_paiement);
CREATE INDEX idx_paiement_statut ON paiement(statut);
CREATE INDEX idx_echeancier_statut ON echeancier(statut);

-- Notifications
CREATE INDEX idx_notification_user ON notification(utilisateur_id, lue);
CREATE INDEX idx_annonce_publie ON annonce(publie, date_publication);

-- Maintenance
CREATE INDEX idx_ticket_statut ON ticket_maintenance(statut, priorite);
CREATE INDEX idx_stock_seuil ON stock(quantite_stock, seuil_alerte);

-- =============================================================================
-- PARTIE 4 : TRIGGERS & FONCTIONS
-- =============================================================================

-- Trigger : Mise à jour automatique du champ updated_at
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
        'ticket_maintenance', 'contrat_personnel', 'annonce', 'presence', 'depense', 'budget'
    ]
    LOOP
        EXECUTE format(
            'CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()', t
        );
    END LOOP;
END $$;

-- Trigger : Alerte stock bas
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

CREATE TRIGGER trg_alerte_stock
AFTER INSERT OR UPDATE ON stock
FOR EACH ROW EXECUTE FUNCTION trigger_alerte_stock();

-- Trigger : Blocage saisie note si verrouillée
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

CREATE TRIGGER trg_note_verrouille
BEFORE UPDATE ON note
FOR EACH ROW EXECUTE FUNCTION trigger_note_verrouille();

-- Trigger : Génération automatique numéro de reçu
CREATE OR REPLACE FUNCTION trigger_numero_recu()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_recu IS NULL OR NEW.numero_recu = '' THEN
        NEW.numero_recu = 'RECU-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('seq_recu')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS seq_recu START 1 INCREMENT 1;
CREATE TRIGGER trg_numero_recu
BEFORE INSERT ON paiement
FOR EACH ROW EXECUTE FUNCTION trigger_numero_recu();

-- Trigger : Notification paiement reçu à l'étudiant
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

CREATE TRIGGER trg_notif_paiement
AFTER INSERT ON paiement
FOR EACH ROW EXECUTE FUNCTION trigger_notification_paiement();

-- =============================================================================
-- PARTIE 5 : DONNÉES INITIALES (Seed Data)
-- =============================================================================

-- Plan SaaS (schéma public)
SET search_path TO public;

INSERT INTO public.plan_abonnement (nom, description, prix_mensuel, max_etudiants, max_utilisateurs)
VALUES
    ('Starter',    'Jusqu''à 500 étudiants, fonctionnalités essentielles',        150.00,  500,   50),
    ('Pro',        'Jusqu''à 2000 étudiants, toutes fonctionnalités',             350.00, 2000,  200),
    ('Enterprise', 'Étudiants illimités, White Label complet, support prioritaire', 750.00, NULL, NULL);

-- Tenant exemple
INSERT INTO public.tenant (schema_name, nom, slug, slogan, couleur_principale, couleur_secondaire, pays)
VALUES
    ('univ_demo', 'Université Catholique Saint-Paul', 'saint-paul', 'Science & Foi au service de l''Homme', '#1a7a4a', '#1565c0', 'Madagascar');

INSERT INTO public.domaine (tenant_id, domaine, is_primary)
SELECT id, 'saint-paul.imtech.edu', TRUE FROM public.tenant WHERE slug = 'saint-paul';

INSERT INTO public.abonnement (tenant_id, plan_id, statut)
SELECT t.id, p.id, 'actif'
FROM public.tenant t, public.plan_abonnement p
WHERE t.slug = 'saint-paul' AND p.nom = 'Pro';

-- Données du tenant demo
SET search_path TO univ_demo;

-- Année académique
INSERT INTO annee_academique (libelle, date_debut, date_fin, active)
VALUES ('2025-2026', '2025-09-01', '2026-07-31', TRUE);

-- Départements
INSERT INTO departement (code, nom) VALUES
    ('INFO', 'Département Informatique et Numérique'),
    ('GESTION', 'Département Gestion et Commerce'),
    ('DROIT', 'Département Droit et Sciences Politiques'),
    ('THEO', 'Département Théologie et Sciences Religieuses'),
    ('LETTRES', 'Département Lettres et Sciences Humaines');

-- Parcours exemple
INSERT INTO parcours (departement_id, code, nom, niveau, duree_annees)
SELECT d.id, 'LI3', 'Licence Informatique', 'Licence', 3
FROM departement d WHERE d.code = 'INFO';

INSERT INTO parcours (departement_id, code, nom, niveau, duree_annees)
SELECT d.id, 'MII', 'Master Ingénierie Informatique', 'Master', 2
FROM departement d WHERE d.code = 'INFO';

INSERT INTO parcours (departement_id, code, nom, niveau, duree_annees)
SELECT d.id, 'LGC', 'Licence Gestion et Commerce', 'Licence', 3
FROM departement d WHERE d.code = 'GESTION';

-- Utilisateurs système (mot de passe fictif hashé)
INSERT INTO utilisateur (email, password_hash, nom, prenom, role) VALUES
    ('president@saint-paul.edu',   crypt('Admin@1234', gen_salt('bf')), 'RAKOTO',    'Jean',    'president'),
    ('admin@saint-paul.edu',       crypt('Admin@1234', gen_salt('bf')), 'ADMIN',     'Système', 'admin'),
    ('scolarite@saint-paul.edu',   crypt('Admin@1234', gen_salt('bf')), 'RASOAMANA', 'Hery',    'scolarite'),
    ('economat@saint-paul.edu',    crypt('Admin@1234', gen_salt('bf')), 'ANDRIA',    'Nirina',  'economat'),
    ('caissier@saint-paul.edu',    crypt('Admin@1234', gen_salt('bf')), 'RABE',      'Lanto',   'caissier'),
    ('rh@saint-paul.edu',          crypt('Admin@1234', gen_salt('bf')), 'RAVAO',     'Soa',     'rh'),
    ('logistique@saint-paul.edu',  crypt('Admin@1234', gen_salt('bf')), 'RAJON',     'Tovo',    'logistique');

-- Bâtiments et salles
INSERT INTO batiment (nom, code) VALUES
    ('Bloc A - Sciences', 'BLOCA'),
    ('Bloc B - Administration', 'BLOCB'),
    ('Amphithéâtre Central', 'AMPHI');

INSERT INTO salle (batiment_id, nom, code, capacite, type_salle)
SELECT b.id, 'Amphi A1', 'A1', 300, 'amphitheatre'
FROM batiment b WHERE b.code = 'AMPHI';

INSERT INTO salle (batiment_id, nom, code, capacite, type_salle)
SELECT b.id, 'Salle Info 101', 'SI101', 40, 'salle_info'
FROM batiment b WHERE b.code = 'BLOCA';

INSERT INTO salle (batiment_id, nom, code, capacite, type_salle)
SELECT b.id, 'Salle Cours 201', 'SC201', 60, 'cours'
FROM batiment b WHERE b.code = 'BLOCA';

-- Stocks de base
INSERT INTO stock (reference, libelle, categorie, unite, quantite_stock, seuil_alerte) VALUES
    ('PAP-A4-001', 'Ramettes papier A4 (500 feuilles)',   'bureau',    'Rame',  50,  10),
    ('NET-SAVON-001', 'Savon liquide mains (5L)',         'nettoyage', 'Bidon', 20,   5),
    ('NET-JAVEL-001', 'Javel concentrée (20L)',           'nettoyage', 'Bidon', 15,   3),
    ('INF-CARTOUCHE-001', 'Cartouche imprimante HP 304',  'informatique', 'Pièce', 10, 2),
    ('BUR-STYLO-001', 'Stylos billes bleus (boîte 50)',   'bureau',    'Boite',  8,   2);

-- Session d'examen
INSERT INTO session_examen (annee_academique_id, libelle, type_session, semestre, date_debut, date_fin, statut)
SELECT aa.id, 'Session 1 - Semestre 1 2025/2026', 'normale', 1, '2026-01-15', '2026-01-31', 'planifie'
FROM annee_academique aa WHERE aa.libelle = '2025-2026';

-- =============================================================================
-- PARTIE 6 : VUES UTILITAIRES
-- =============================================================================

-- Vue : Tableau de bord du Président (KPI globaux)
-- =============================================================================
-- PARTIE 6 : VUES UTILITAIRES (CORRIGÉES)
-- =============================================================================

-- 1. Vue : Tableau de bord du Président (KPI globaux)
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

-- 2. Vue : État des paiements par étudiant (Correction p.nom)
CREATE OR REPLACE VIEW vue_paiement_etudiant AS
SELECT
    e.id                 AS etudiant_id,
    e.matricule,
    e.nom || ' ' || e.prenom AS etudiant_nom,
    p.nom                AS parcours, -- Correction ici : p.nom au lieu de p.libelle
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

-- 3. Vue : Absences par étudiant (résumé)
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
-- FIN DU SCRIPT
-- IMTECH UNIVERSITY v1.0 - Schéma complet généré
-- =============================================================================