-- =============================================================================
-- SCHÉMA TENANT - Template pour création automatique d'un nouveau tenant
-- Version unifiée COMPLÈTE (79 tables)
-- =============================================================================
-- Ce template sert à créer la structure complète pour chaque nouveau tenant
-- dans une architecture multi-tenant (SaaS).
-- =============================================================================

-- Les extensions sont créées au niveau public par le service
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- =============================================================================

-- =============================================================================
-- FONCTIONS UTILITAIRES GLOBALES
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_numero_recu()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_recu IS NULL OR NEW.numero_recu = '' THEN
        NEW.numero_recu = 'RECU-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('seq_recu')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_notification_paiement()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
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

CREATE OR REPLACE FUNCTION check_note_verrouillee()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM verrouillage_notes vn 
        WHERE vn.etudiant_id = NEW.etudiant_id 
        AND vn.session_examen_id = NEW.session_id 
        AND vn.statut = 'verrouille'
        AND (vn.autorisation_modif IS FALSE OR vn.date_fin_autorisation < CURRENT_DATE)
    ) THEN
        RAISE EXCEPTION 'Impossible de modifier une note verrouillée après délibération';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculer_moyenne_semestre(
    p_etudiant_id UUID, 
    p_inscription_id UUID, 
    p_semestre SMALLINT, 
    p_annee_niveau SMALLINT
) RETURNS NUMERIC
LANGUAGE plpgsql AS $$
DECLARE
    v_moyenne DECIMAL(5,2);
BEGIN
    SELECT COALESCE(
        SUM(n.valeur * ec.coefficient) / SUM(ec.coefficient), 
        0
    ) INTO v_moyenne
    FROM note n
    JOIN element_constitutif ec ON n.ec_id = ec.id
    JOIN unite_enseignement ue ON ec.ue_id = ue.id
    WHERE n.etudiant_id = p_etudiant_id
    AND ue.semestre = p_semestre
    AND ue.annee_niveau = p_annee_niveau
    AND n.absence_justifiee = FALSE;
    
    RETURN ROUND(v_moyenne, 2);
END;
$$;

CREATE OR REPLACE FUNCTION calculer_credits_acquis(
    p_etudiant_id UUID, 
    p_inscription_id UUID, 
    p_semestre SMALLINT, 
    p_annee_niveau SMALLINT
) RETURNS SMALLINT
LANGUAGE plpgsql AS $$
DECLARE
    v_credits_acquis SMALLINT;
BEGIN
    SELECT COALESCE(SUM(ue.credits_ects), 0) INTO v_credits_acquis
    FROM resultat_ue ru
    JOIN unite_enseignement ue ON ru.ue_id = ue.id
    JOIN resultat_semestre rs ON ru.resultat_semestre_id = rs.id
    WHERE ru.etudiant_id = p_etudiant_id
    AND rs.inscription_id = p_inscription_id
    AND rs.semestre = p_semestre
    AND rs.annee_niveau = p_annee_niveau
    AND ru.statut = 'valide';
    
    RETURN v_credits_acquis;
END;
$$;

CREATE OR REPLACE FUNCTION update_paiement_inscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SÉQUENCES
-- =============================================================================

CREATE SEQUENCE IF NOT EXISTS seq_recu START 1 INCREMENT 1;

-- =============================================================================
-- NIVEAU 0 : TABLES SANS DÉPENDANCES
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
    tenant_id           UUID,
    parcours_assignes   JSONB        DEFAULT '[]',
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

CREATE TABLE IF NOT EXISTS annee_academique (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    libelle         VARCHAR(20) NOT NULL UNIQUE,
    date_debut      DATE        NOT NULL,
    date_fin        DATE        NOT NULL,
    active          BOOLEAN     DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS niveau_etude (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) NOT NULL UNIQUE,
    libelle         VARCHAR(255) NOT NULL,
    description     TEXT,
    ordre           INTEGER     NOT NULL,
    type_diplome    VARCHAR(50) CHECK (type_diplome IN ('Licence', 'Master', 'Doctorat', 'BTS', 'DUT', 'Autre')),
    actif           BOOLEAN     DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO niveau_etude (code, libelle, description, ordre, type_diplome) VALUES
    ('L1', 'L1 - 1ère année', 'Première année de Licence', 1, 'Licence'),
    ('L2', 'L2 - 2ème année', 'Deuxième année de Licence', 2, 'Licence'),
    ('L3', 'L3 - 3ème année', 'Troisième année de Licence', 3, 'Licence'),
    ('M1', 'M1 - 1ère année Master', 'Première année de Master', 4, 'Master'),
    ('M2', 'M2 - 2ème année Master', 'Deuxième année de Master', 5, 'Master')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS batiment (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nom         VARCHAR(100) NOT NULL,
    code        VARCHAR(20) UNIQUE,
    adresse     TEXT,
    actif       BOOLEAN     DEFAULT TRUE
);

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

INSERT INTO permissions_portail (type_portail, permission_key, permission_label, actif, description) VALUES
('etudiant', 'emploi_du_temps', 'Consulter emploi du temps', true, 'Accès à l''emploi du temps personnel'),
('etudiant', 'supports_cours', 'Télécharger supports de cours', true, 'Téléchargement des documents pédagogiques'),
('etudiant', 'notes', 'Consulter les notes', true, 'Consultation des notes et bulletins'),
('etudiant', 'paiements', 'Suivi des paiements', true, 'Consultation de l''état des paiements'),
('etudiant', 'absences', 'Justificatif d''absence', true, 'Soumission de justificatifs d''absence'),
('etudiant', 'attestations', 'Télécharger attestations', true, 'Téléchargement d''attestations diverses'),
('etudiant', 'inscription_examens', 'Inscription aux examens', true, 'Inscription en ligne aux sessions d''examens'),
('etudiant', 'paiement_en_ligne', 'Paiement en ligne', true, 'Effectuer des paiements en ligne'),
('parent', 'suivi_academique', 'Suivi académique', true, 'Suivi de la scolarité de l''enfant'),
('parent', 'suivi_financier', 'Suivi financier', true, 'Consultation des frais et paiements'),
('parent', 'bulletins', 'Visualisation bulletins', true, 'Accès aux bulletins de notes'),
('parent', 'absences', 'Suivi absences/retards', true, 'Consultation des absences et retards'),
('parent', 'paiement_frais', 'Paiement frais scolarité', true, 'Paiement en ligne des frais'),
('parent', 'autorisation_sortie', 'Autorisation sortie', true, 'Gestion des autorisations de sortie'),
('parent', 'messagerie', 'Messagerie', true, 'Communication avec l''administration'),
('parent', 'notifications', 'Notifications', true, 'Réception de notifications'),
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
-- NIVEAU 1 : TABLES DÉPENDANT DU NIVEAU 0
-- =============================================================================

CREATE TABLE IF NOT EXISTS departement (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) NOT NULL UNIQUE,
    nom             VARCHAR(200) NOT NULL,
    description     TEXT,
    responsable_id  UUID        REFERENCES utilisateur(id) ON DELETE SET NULL,
    actif           BOOLEAN     DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
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

-- =============================================================================
-- NIVEAU 2 : TABLES DÉPENDANT DU NIVEAU 1
-- =============================================================================

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
    date_ouverture      DATE,
    motif_ouverture     TEXT,
    conditions_ouverture TEXT,
    date_fermeture      DATE,
    motif_fermeture     TEXT,
    valide_par_president UUID,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS grille_tarifaire (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    parcours_id         UUID        NOT NULL REFERENCES parcours(id),
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    annee_niveau        SMALLINT,
    montant_total       DECIMAL(12,2) NOT NULL,
    montant_inscription DECIMAL(12,2) DEFAULT 0,
    montant_scolarite   DECIMAL(12,2) DEFAULT 0,
    nb_tranches         SMALLINT    DEFAULT 1,
    date_limite_paiement DATE,
    modalites_paiement  JSONB,
    description         TEXT,
    actif               BOOLEAN     DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (parcours_id, annee_academique_id, annee_niveau)
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
    valide_par          UUID,
    valide_le           TIMESTAMPTZ,
    commentaire_president TEXT,
    conditions_speciales TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS convention (
    id                  SERIAL      PRIMARY KEY,
    intitule            VARCHAR(255) NOT NULL,
    partenaire          VARCHAR(255) NOT NULL,
    type_partenaire     VARCHAR(50) NOT NULL CHECK (type_partenaire IN ('eglise', 'diocese', 'etat', 'entreprise', 'universite')),
    objet_convention    TEXT NOT NULL,
    date_proposee       DATE NOT NULL,
    document_url        TEXT,
    statut              VARCHAR(50) DEFAULT 'en_attente_signature' NOT NULL CHECK (statut IN ('en_attente_signature', 'signee', 'rejetee', 'expiree')),
    signe_president     BOOLEAN DEFAULT FALSE,
    date_signature      TIMESTAMPTZ,
    signature_hash      VARCHAR(255),
    representant_partenaire VARCHAR(255),
    date_effet          DATE,
    remarques_president TEXT,
    cree_par            INTEGER,
    cree_le             TIMESTAMPTZ DEFAULT NOW(),
    modifie_le          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS delegation_signature (
    id                  SERIAL      PRIMARY KEY,
    delegataire_id      INTEGER NOT NULL,
    types_actes         TEXT[] NOT NULL,
    date_debut          DATE NOT NULL,
    date_fin            DATE NOT NULL,
    conditions          TEXT,
    revoquee            BOOLEAN DEFAULT FALSE,
    revoquee_le         TIMESTAMPTZ,
    revoquee_par        INTEGER,
    cree_par            INTEGER NOT NULL,
    cree_le             TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_dates CHECK (date_fin > date_debut)
);

-- =============================================================================
-- NIVEAU 3 : UNITÉS D'ENSEIGNEMENT ET ÉLÉMENTS CONSTITUTIFS
-- =============================================================================

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

COMMENT ON COLUMN unite_enseignement.enseignant_id IS 'enseignant responsable de l''UE. RÈGLE MÉTIER: Une UE ne peut avoir qu''un seul enseignant responsable.';

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

-- =============================================================================
-- NIVEAU 4 : AFFECTATIONS, EXAMENS, PAIEMENTS
-- =============================================================================

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
    type_paiement       VARCHAR(50),
    cloture_caisse_id   UUID,
    details_paiement    JSONB,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS paiement_inscription (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    inscription_id      UUID        NOT NULL REFERENCES inscription(id) ON DELETE CASCADE,
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE CASCADE,
    montant             DECIMAL(10,2) NOT NULL CHECK (montant > 0),
    methode_paiement    VARCHAR(50) NOT NULL CHECK (methode_paiement IN ('virement', 'mobile_money', 'especes', 'cheque', 'carte_bancaire')),
    reference_paiement  VARCHAR(255) NOT NULL UNIQUE,
    date_paiement       TIMESTAMPTZ NOT NULL,
    preuve_url          TEXT,
    statut              VARCHAR(50) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide', 'rejete')),
    valide_par          UUID        REFERENCES utilisateur(id),
    date_validation     TIMESTAMPTZ,
    note_validation     TEXT,
    motif_rejet         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_validation CHECK (
        ((statut = 'valide' AND valide_par IS NOT NULL AND date_validation IS NOT NULL) OR
         (statut = 'rejete' AND valide_par IS NOT NULL AND date_validation IS NOT NULL AND motif_rejet IS NOT NULL) OR
         (statut = 'en_attente' AND valide_par IS NULL AND date_validation IS NULL))
    )
);

COMMENT ON TABLE paiement_inscription IS 'Paiements d''inscription soumis par les étudiants en attente de validation';
COMMENT ON COLUMN paiement_inscription.methode_paiement IS 'virement, mobile_money, especes, cheque, carte_bancaire';
COMMENT ON COLUMN paiement_inscription.reference_paiement IS 'Numéro de transaction ou référence du paiement';
COMMENT ON COLUMN paiement_inscription.preuve_url IS 'URL de la capture d''écran ou preuve de paiement';

CREATE TABLE IF NOT EXISTS frais_inscription (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    parcours_id             UUID        NOT NULL REFERENCES parcours(id) ON DELETE RESTRICT,
    annee_academique_id     UUID        NOT NULL REFERENCES annee_academique(id) ON DELETE RESTRICT,
    montant_inscription     DECIMAL(10,2) NOT NULL DEFAULT 0,
    montant_scolarite       DECIMAL(10,2) DEFAULT 0,
    montant_total           DECIMAL(10,2) NOT NULL,
    description             TEXT,
    actif                   BOOLEAN     DEFAULT TRUE,
    date_limite_paiement    DATE,
    modalites_paiement      JSONB       DEFAULT '{"especes": true, "cheque": true, "virement": true, "carte_bancaire": true, "echelonnement": false}',
    cree_par                UUID        REFERENCES utilisateur(id),
    modifie_par             UUID        REFERENCES utilisateur(id),
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (parcours_id, annee_academique_id)
);

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

-- =============================================================================
-- NIVEAU 5 : EMPLOIS DU TEMPS, NOTES, PRÉSENCES
-- =============================================================================

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
    fichier_correction_url VARCHAR(500),
    date_depot_correction TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

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

-- =============================================================================
-- MODULE : RÉSULTATS ACADÉMIQUES, DÉLIBÉRATIONS
-- =============================================================================

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

CREATE TABLE IF NOT EXISTS deliberation (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_examen_id   UUID        NOT NULL,
    parcours_id         UUID        NOT NULL REFERENCES parcours(id) ON DELETE RESTRICT,
    semestre            SMALLINT    NOT NULL,
    annee_niveau        SMALLINT    NOT NULL,
    date_deliberation   DATE        NOT NULL,
    president_jury_id   UUID        NOT NULL REFERENCES utilisateur(id),
    membres_jury        UUID[]      DEFAULT '{}',
    statut              VARCHAR(20) DEFAULT 'planifiee' NOT NULL CHECK (statut IN ('planifiee', 'en_cours', 'terminee', 'annulee')),
    observations_generales TEXT,
    rapport_deliberation TEXT,
    validee_par         UUID        REFERENCES utilisateur(id),
    date_validation     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (session_examen_id, parcours_id, semestre, annee_niveau)
);

CREATE TABLE IF NOT EXISTS resultat_semestre (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE RESTRICT,
    inscription_id      UUID        NOT NULL REFERENCES inscription(id) ON DELETE RESTRICT,
    semestre            SMALLINT    NOT NULL,
    annee_niveau        SMALLINT    NOT NULL,
    moyenne_generale    DECIMAL(5,2),
    total_credits_ects  SMALLINT,
    credits_acquis      SMALLINT    DEFAULT 0,
    credits_manquants   SMALLINT    DEFAULT 0,
    nombre_ues          SMALLINT    DEFAULT 0,
    nombre_ues_validees SMALLINT    DEFAULT 0,
    statut              VARCHAR(20) DEFAULT 'en_cours' NOT NULL CHECK (statut IN ('en_cours', 'valide', 'ajourne', 'redoublement')),
    mention             VARCHAR(30),
    deliberation_id     UUID        REFERENCES deliberation(id),
    classement          SMALLINT,
    effectif_promotion  SMALLINT,
    date_validation     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (etudiant_id, inscription_id, semestre, annee_niveau)
);

CREATE TABLE IF NOT EXISTS resultat_ue (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE RESTRICT,
    ue_id               UUID        NOT NULL REFERENCES unite_enseignement(id) ON DELETE RESTRICT,
    resultat_semestre_id UUID       NOT NULL REFERENCES resultat_semestre(id) ON DELETE RESTRICT,
    moyenne_ue          DECIMAL(5,2),
    credits_ects        SMALLINT,
    credits_acquis      BOOLEAN     DEFAULT FALSE,
    statut              VARCHAR(20) DEFAULT 'en_cours' NOT NULL CHECK (statut IN ('en_cours', 'valide', 'ajourne', 'compense')),
    compensation_ue_id  UUID        REFERENCES unite_enseignement(id),
    date_validation     TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (etudiant_id, ue_id, resultat_semestre_id)
);

CREATE TABLE IF NOT EXISTS verrouillage_notes (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    deliberation_id     UUID        NOT NULL REFERENCES deliberation(id) ON DELETE RESTRICT,
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE RESTRICT,
    session_examen_id   UUID        NOT NULL REFERENCES session_examen(id),
    statut              VARCHAR(20) DEFAULT 'deverrouille' NOT NULL CHECK (statut IN ('deverrouille', 'verrouille', 'modification_autorisee')),
    date_verrouillage   TIMESTAMPTZ,
    verrouille_par      UUID        REFERENCES utilisateur(id),
    autorisation_modif  BOOLEAN     DEFAULT FALSE,
    motif_autorisation  TEXT,
    autorise_par        UUID        REFERENCES utilisateur(id),
    date_autorisation   TIMESTAMPTZ,
    date_fin_autorisation DATE,
    historique_modifs   JSONB       DEFAULT '[]',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (deliberation_id, etudiant_id, session_examen_id)
);

-- =============================================================================
-- MODULE : STAGES, SOUTENANCES
-- =============================================================================

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

CREATE TABLE IF NOT EXISTS evaluation_soutenance (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    soutenance_id       UUID        NOT NULL REFERENCES soutenance(id) ON DELETE CASCADE,
    evaluateur_id       UUID        NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    note                DECIMAL(5,2) NOT NULL CHECK (note >= 0 AND note <= 20),
    appreciation        TEXT,
    date_evaluation     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (soutenance_id, evaluateur_id)
);

-- =============================================================================
-- MODULE : FINANCES (BUDGET, DÉPENSES, RH)
-- =============================================================================

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

-- =============================================================================
-- MODULE : DIVERS (DEMANDES, CONVOCATIONS, ETC.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS calendrier_academique (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    annee_academique_id UUID        NOT NULL REFERENCES annee_academique(id),
    evenement           VARCHAR(200) NOT NULL,
    type_evenement      VARCHAR(50) NOT NULL
                        CHECK (type_evenement IN ('rentree', 'cours', 'vacances', 'examens', 'deliberation', 'ceremonie', 'pastoral', 'autre')),
    date_debut          DATE        NOT NULL,
    date_fin            DATE        NOT NULL,
    parcours_id         UUID        REFERENCES parcours(id),
    description         TEXT,
    valide_par_president UUID,
    valide_le           TIMESTAMPTZ,
    commentaire_president TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
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

-- =============================================================================
-- MODULE : COMMUNICATION
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

CREATE TABLE IF NOT EXISTS message_enseignant (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    enseignant_id       UUID        NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    sujet               VARCHAR(255) NOT NULL,
    contenu             TEXT        NOT NULL,
    type_message        VARCHAR(50) NOT NULL CHECK (type_message IN ('direct', 'classe', 'parcours')),
    etudiant_id         UUID        REFERENCES etudiant(id) ON DELETE CASCADE,
    classe_id           UUID,
    parcours_id         UUID        REFERENCES parcours(id) ON DELETE SET NULL,
    niveau_id           UUID        REFERENCES niveau_etude(id) ON DELETE SET NULL,
    nombre_destinataires INTEGER     DEFAULT 0,
    date_envoi          TIMESTAMPTZ  DEFAULT CURRENT_TIMESTAMP,
    statut              VARCHAR(50) DEFAULT 'envoye' CHECK (statut IN ('envoye', 'lu', 'archive')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE message_enseignant IS 'Messages envoyés par les enseignants aux étudiants';
COMMENT ON COLUMN message_enseignant.type_message IS 'Type: direct (1 étudiant), classe (tous étudiants classe), parcours (filtré par parcours/niveau)';

CREATE TABLE IF NOT EXISTS message_destinataire (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id          UUID        NOT NULL REFERENCES message_enseignant(id) ON DELETE CASCADE,
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE CASCADE,
    lu                  BOOLEAN     DEFAULT FALSE,
    date_lecture        TIMESTAMPTZ,
    UNIQUE (message_id, etudiant_id)
);

COMMENT ON TABLE message_destinataire IS 'Destinataires individuels des messages avec statut de lecture';

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
-- MODULE : PÉDAGOGIQUE - RÉFÉRENTIELS & PROCÈS-VERBAUX
-- =============================================================================

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
    transmis_a_scolarite BOOLEAN    DEFAULT FALSE,
    date_transmission_scolarite TIMESTAMPTZ,
    transmis_par        VARCHAR(255),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- MODULE : SURVEILLANCE & DISCIPLINE
-- =============================================================================

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

COMMENT ON TABLE pointage_qr IS 'QR codes générés pour l''appel numérique';
COMMENT ON TABLE presence_surveillance IS 'Enregistrement des présences avec validation surveillant';
COMMENT ON TABLE alerte_discipline IS 'Alertes automatiques remontées au secrétariat';
COMMENT ON TABLE configuration_examen IS 'Configuration des salles d''examen et placement des étudiants';

-- =============================================================================
-- MODULE : ENCADREMENT
-- =============================================================================

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

-- =============================================================================
-- MODULE : ARCHIVES, ATTESTATIONS, DIPLÔMES
-- =============================================================================

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
    signe_president     BOOLEAN     DEFAULT FALSE,
    mention_speciale    TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (etudiant_id, type_diplome, parcours_id)
);

CREATE TABLE IF NOT EXISTS archive_scolarite (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE RESTRICT,
    type_document       VARCHAR(50) NOT NULL CHECK (type_document IN (
        'releve_notes', 'attestation_reussite', 'diplome', 
        'suplement_diplome', 'certificat_scolarite', 'transcript'
    )),
    titre_document      VARCHAR(200) NOT NULL,
    annee_academique    VARCHAR(20) NOT NULL,
    semestre            SMALLINT,
    fichier_original_url VARCHAR(500),
    fichier_pdf_url     VARCHAR(500),
    hash_integrite      VARCHAR(128),
    format              VARCHAR(20) DEFAULT 'PDF',
    taille_octets       BIGINT,
    langue              VARCHAR(10) DEFAULT 'FR',
    acces_public        BOOLEAN     DEFAULT FALSE,
    date_limite_acces   DATE,
    archive_par         UUID        NOT NULL REFERENCES utilisateur(id),
    date_archivage      TIMESTAMPTZ DEFAULT NOW(),
    duree_conservation  INTEGER     DEFAULT 10,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attestation (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id),
    inscription_id      UUID        REFERENCES inscription(id),
    type_attestation    VARCHAR(50) NOT NULL CHECK (type_attestation IN (
        'scolarite', 'reussite', 'inscription', 'preinscription', 'stage', 'autre'
    )),
    numero_attestation  VARCHAR(100) NOT NULL,
    annee_academique_id UUID        REFERENCES annee_academique(id),
    motif               TEXT,
    observations        TEXT,
    statut              VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'validee', 'refusee', 'annulee')),
    genere_par          UUID,
    date_generation     TIMESTAMPTZ DEFAULT NOW(),
    fichier_url         VARCHAR(500),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    date_emission       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suplement_diplome (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    diplome_id          UUID        NOT NULL REFERENCES diplome(id) ON DELETE RESTRICT,
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id),
    parcours_suivi      TEXT,
    competences_acquises TEXT,
    stages_effectues    TEXT,
    projets_realises    TEXT,
    activites_extra     TEXT,
    langues_maitrisees  JSONB,
    certifications      JSONB,
    mobilite_internationale TEXT,
    systeme_notation    TEXT,
    echelle_ects        TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transfert_etudiant (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    etudiant_id         UUID        NOT NULL REFERENCES etudiant(id) ON DELETE RESTRICT,
    parcours_origine_id UUID        NOT NULL REFERENCES parcours(id),
    parcours_destination_id UUID    REFERENCES parcours(id),
    etablissement_destination VARCHAR(200),
    type_transfert      VARCHAR(50) NOT NULL CHECK (type_transfert IN ('interne', 'externe', 'reorientation')),
    motif               TEXT,
    date_demande        DATE        DEFAULT CURRENT_DATE,
    statut              VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuve', 'refuse', 'annule')),
    traite_par          UUID,
    date_traitement     TIMESTAMPTZ,
    observations        TEXT,
    documents_fournis   JSONB,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()

-- =============================================================================
-- TABLE : CONFIGURATION DES MOYENS DE PAIEMENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS configuration_paiement (
    id                          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id                   UUID        NOT NULL,
    type_paiement               VARCHAR(50) NOT NULL CHECK (type_paiement IN ('bank', 'mobile_money', 'cash')),
    nom_affichage               VARCHAR(255) NOT NULL,
    numero_compte               VARCHAR(100),
    nom_banque                  VARCHAR(255),
    nom_titulaire               VARCHAR(255),
    numero_telephone            VARCHAR(20),
    nom_service                 VARCHAR(100),
    instructions_supplementaires TEXT,
    est_actif                   BOOLEAN     DEFAULT TRUE,
    ordre_affichage             INTEGER     DEFAULT 0,
    created_at                  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at                  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_config_paiement_tenant FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);

COMMENT ON TABLE configuration_paiement IS 'Configuration des moyens de paiement disponibles pour les inscriptions';
COMMENT ON COLUMN configuration_paiement.type_paiement IS 'Type de paiement: bank, mobile_money, cash';
COMMENT ON COLUMN configuration_paiement.est_actif IS 'Indique si ce moyen de paiement est actuellement disponible';
COMMENT ON COLUMN configuration_paiement.ordre_affichage IS 'Ordre d''affichage dans l''interface (plus petit = affiché en premier)';

-- =============================================================================
-- INDEX DE PERFORMANCE
-- =============================================================================

-- Index utilisateur
CREATE INDEX IF NOT EXISTS idx_utilisateur_email ON utilisateur(email);
CREATE INDEX IF NOT EXISTS idx_utilisateur_role ON utilisateur(role);
CREATE INDEX IF NOT EXISTS idx_utilisateur_tenant_id ON utilisateur(tenant_id);
CREATE INDEX IF NOT EXISTS idx_utilisateur_actif ON utilisateur(actif);
CREATE INDEX IF NOT EXISTS idx_utilisateur_password_reset ON utilisateur(password_reset_required);
CREATE INDEX IF NOT EXISTS idx_utilisateur_last_password_reset ON utilisateur(last_password_reset);

-- Index session
CREATE INDEX IF NOT EXISTS idx_session_jwt_token ON session_jwt(refresh_token);
CREATE INDEX IF NOT EXISTS idx_session_jwt_user ON session_jwt(utilisateur_id);

-- Index structure académique
CREATE INDEX IF NOT EXISTS idx_niveau_etude_ordre ON niveau_etude(ordre) WHERE actif = TRUE;
CREATE INDEX IF NOT EXISTS idx_niveau_etude_code ON niveau_etude(code);
CREATE INDEX IF NOT EXISTS idx_parcours_secretaire ON parcours(secretaire_id);
CREATE INDEX IF NOT EXISTS idx_secretaire_parcours_secretaire ON secretaire_parcours(secretaire_id) WHERE actif = TRUE;
CREATE INDEX IF NOT EXISTS idx_secretaire_parcours_parcours ON secretaire_parcours(parcours_id) WHERE actif = TRUE;

-- Index UE et EC
CREATE INDEX IF NOT EXISTS idx_unite_enseignement_parcours ON unite_enseignement(parcours_id);
CREATE INDEX IF NOT EXISTS idx_ue_enseignant ON unite_enseignement(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_element_constitutif_ue ON element_constitutif(ue_id);

-- Index étudiants et inscriptions
CREATE INDEX IF NOT EXISTS idx_etudiant_matricule ON etudiant(matricule);
CREATE INDEX IF NOT EXISTS idx_etudiant_nom ON etudiant(nom, prenom);
CREATE INDEX IF NOT EXISTS idx_inscription_etudiant ON inscription(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_inscription_parcours_annee ON inscription(parcours_id, annee_academique_id);

-- Index notes
CREATE INDEX IF NOT EXISTS idx_note_etudiant ON note(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_note_session ON note(session_id);
CREATE INDEX IF NOT EXISTS idx_note_ue ON note(ue_id);
CREATE INDEX IF NOT EXISTS idx_note_ec ON note(ec_id);
CREATE INDEX IF NOT EXISTS idx_note_verrouille ON note(verrouille);

-- Index présence
CREATE INDEX IF NOT EXISTS idx_presence_etudiant ON presence(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_presence_seance ON presence(seance_id);
CREATE INDEX IF NOT EXISTS idx_presence_statut ON presence(statut);

-- Index EDT
CREATE INDEX IF NOT EXISTS idx_emploi_du_temps_date ON emploi_du_temps(date_seance);
CREATE INDEX IF NOT EXISTS idx_edt_salle ON emploi_du_temps(salle_id);
CREATE INDEX IF NOT EXISTS idx_edt_affectation ON emploi_du_temps(affectation_id);

-- Index paiements
CREATE INDEX IF NOT EXISTS idx_paiement_inscription ON paiement(inscription_id);
CREATE INDEX IF NOT EXISTS idx_paiement_date ON paiement(date_paiement);
CREATE INDEX IF NOT EXISTS idx_paiement_statut ON paiement(statut);
CREATE INDEX IF NOT EXISTS idx_echeancier_statut ON echeancier(statut);
CREATE INDEX IF NOT EXISTS idx_paiement_inscription_inscription ON paiement_inscription(inscription_id);
CREATE INDEX IF NOT EXISTS idx_paiement_inscription_etudiant ON paiement_inscription(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_paiement_inscription_statut ON paiement_inscription(statut);

-- Index configuration paiement
CREATE INDEX IF NOT EXISTS idx_config_paiement_tenant ON configuration_paiement(tenant_id);
CREATE INDEX IF NOT EXISTS idx_config_paiement_type ON configuration_paiement(type_paiement);
CREATE INDEX IF NOT EXISTS idx_config_paiement_actif ON configuration_paiement(est_actif);
CREATE INDEX IF NOT EXISTS idx_config_paiement_ordre ON configuration_paiement(ordre_affichage);
CREATE INDEX IF NOT EXISTS idx_cloture_caisse_date ON cloture_caisse(date_cloture);
CREATE INDEX IF NOT EXISTS idx_cloture_caisse_caissier ON cloture_caisse(caissier_id);
CREATE INDEX IF NOT EXISTS idx_frais_inscription_parcours ON frais_inscription(parcours_id);
CREATE INDEX IF NOT EXISTS idx_frais_inscription_annee_academique ON frais_inscription(annee_academique_id);

-- Index notifications
CREATE INDEX IF NOT EXISTS idx_notification_user ON notification(utilisateur_id, lue);
CREATE INDEX IF NOT EXISTS idx_annonce_publie ON annonce(publie, date_publication);

-- Index logistique
CREATE INDEX IF NOT EXISTS idx_ticket_statut ON ticket_maintenance(statut, priorite);
CREATE INDEX IF NOT EXISTS idx_stock_seuil ON stock(quantite_stock, seuil_alerte);

-- Index RH
CREATE INDEX IF NOT EXISTS idx_contrat_personnel_utilisateur ON contrat_personnel(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_conge_personnel_utilisateur ON conge_personnel(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_fiche_paie_contrat ON fiche_paie(contrat_id);
CREATE INDEX IF NOT EXISTS idx_heure_comp_enseignant ON heure_complementaire(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_eval_utilisateur ON evaluation_personnel(utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_eval_annee ON evaluation_personnel(annee_evaluation);
CREATE INDEX IF NOT EXISTS idx_decl_sociale_type ON declaration_sociale(type_declaration);
CREATE INDEX IF NOT EXISTS idx_decl_sociale_periode ON declaration_sociale(periode_debut, periode_fin);
CREATE INDEX IF NOT EXISTS idx_recrutement_statut ON recrutement(statut);
CREATE INDEX IF NOT EXISTS idx_candidature_recrutement ON candidature(recrutement_id);

-- Index tables secrétaire
CREATE INDEX IF NOT EXISTS idx_absence_enseignant ON absence_enseignant(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_absence_date ON absence_enseignant(date_absence);
CREATE INDEX IF NOT EXISTS idx_rattrapage_absence ON rattrapage(absence_id);
CREATE INDEX IF NOT EXISTS idx_note_derog_etudiant ON note_derogatoire(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_demande_etudiant ON demande_etudiant(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_convocation_etudiant ON convocation(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_convocation_session ON convocation(session_examen_id);
CREATE INDEX IF NOT EXISTS idx_dossier_etudiant_id ON dossier_etudiant(etudiant_id);

-- Index tables pédagogiques avancées
CREATE INDEX IF NOT EXISTS idx_referentiel_parcours ON referentiel_competences(parcours_id);
CREATE INDEX IF NOT EXISTS idx_sujet_session ON sujet_examen(session_examen_id);
CREATE INDEX IF NOT EXISTS idx_sujet_enseignant ON sujet_examen(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_pv_parcours ON proces_verbal(parcours_id);
CREATE INDEX IF NOT EXISTS idx_pv_session ON proces_verbal(session_examen_id);

-- Index tables résultats académiques
CREATE INDEX IF NOT EXISTS idx_deliberation_parcours ON deliberation(parcours_id);
CREATE INDEX IF NOT EXISTS idx_resultat_semestre_etudiant ON resultat_semestre(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_resultat_semestre_inscription ON resultat_semestre(inscription_id);
CREATE INDEX IF NOT EXISTS idx_resultat_ue_etudiant ON resultat_ue(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_resultat_ue_ue ON resultat_ue(ue_id);
CREATE INDEX IF NOT EXISTS idx_verrouillage_etudiant ON verrouillage_notes(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_verrouillage_session ON verrouillage_notes(session_examen_id);

-- Index tables support enseignant
CREATE INDEX IF NOT EXISTS idx_support_cours_ec ON support_cours(ec_id);
CREATE INDEX IF NOT EXISTS idx_support_cours_auteur ON support_cours(auteur_id);
CREATE INDEX IF NOT EXISTS idx_stage_etudiant ON stage(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_stage_encadrant ON stage(encadrant_id);
CREATE INDEX IF NOT EXISTS idx_soutenance_stage ON soutenance(stage_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_soutenance ON evaluation_soutenance(soutenance_id);
CREATE INDEX IF NOT EXISTS idx_demande_ressource_demandeur ON demande_ressource(demandeur_id);

-- Index tables archives et attestations
CREATE INDEX IF NOT EXISTS idx_archive_etudiant ON archive_scolarite(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_attestation_etudiant ON attestation(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_diplome_etudiant ON diplome(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_diplome_numero ON diplome(numero_diplome);
CREATE INDEX IF NOT EXISTS idx_suplement_diplome_diplome ON suplement_diplome(diplome_id);
CREATE INDEX IF NOT EXISTS idx_transfert_etudiant_etudiant ON transfert_etudiant(etudiant_id);

-- Index tables surveillance
CREATE INDEX IF NOT EXISTS idx_pointage_qr_seance ON pointage_qr(seance_id);
CREATE INDEX IF NOT EXISTS idx_pointage_qr_etudiant ON pointage_qr(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_presence_surveillance_etudiant ON presence_surveillance(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_presence_surveillance_seance ON presence_surveillance(seance_id);
CREATE INDEX IF NOT EXISTS idx_alerte_discipline_etudiant ON alerte_discipline(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_configuration_examen_session ON configuration_examen(session_examen_id);

-- Index tables encadrement
CREATE INDEX IF NOT EXISTS idx_suivi_moral_etudiant ON suivi_moral(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_autorisation_etudiant ON autorisation_sortie(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_rapport_conduite_etudiant ON rapport_conduite(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_conseil_discipline_etudiant ON conseil_discipline(etudiant_id);

-- Index tables conventions et délégations
CREATE INDEX IF NOT EXISTS idx_convention_statut ON convention(statut);
CREATE INDEX IF NOT EXISTS idx_delegation_delegataire ON delegation_signature(delegataire_id);
CREATE INDEX IF NOT EXISTS idx_delegation_dates ON delegation_signature(date_debut, date_fin);

-- Index tables messages
CREATE INDEX IF NOT EXISTS idx_message_enseignant_id ON message_enseignant(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_message_date ON message_enseignant(date_envoi);
CREATE INDEX IF NOT EXISTS idx_destinataire_message ON message_destinataire(message_id);
CREATE INDEX IF NOT EXISTS idx_destinataire_etudiant ON message_destinataire(etudiant_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Trigger pour updated_at sur toutes les tables principales
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'utilisateur', 'parcours', 'inscription', 'enseignant', 'niveau_etude',
        'affectation_cours', 'emploi_du_temps', 'note', 'pv_deliberation',
        'ticket_maintenance', 'contrat_personnel', 'annonce', 'presence', 'depense', 'budget',
        'referentiel_competences', 'sujet_examen', 'proces_verbal',
        'absence_enseignant', 'rattrapage', 'note_derogatoire', 'demande_etudiant',
        'convocation', 'dossier_etudiant', 'support_cours', 'stage', 'soutenance',
        'demande_ressource', 'archive_scolarite', 'attestation', 'suplement_diplome',
        'transfert_etudiant', 'deliberation', 'resultat_semestre', 'resultat_ue',
        'verrouillage_notes', 'pointage_qr', 'presence_surveillance', 'alerte_discipline',
        'configuration_examen', 'suivi_moral', 'autorisation_sortie', 'rapport_conduite',
        'conseil_discipline', 'convention', 'delegation_signature', 'evaluation_personnel',
        'declaration_sociale', 'heure_complementaire', 'recrutement', 'candidature',
        'unite_enseignement', 'element_constitutif', 'secretaire_parcours'
    ]
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_updated_at ON %I;
             CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()', t, t
        );
    END LOOP;
END $$;

-- Triggers spécifiques
DROP TRIGGER IF EXISTS trg_numero_recu ON paiement;
CREATE TRIGGER trg_numero_recu BEFORE INSERT ON paiement FOR EACH ROW EXECUTE FUNCTION trigger_numero_recu();

DROP TRIGGER IF EXISTS trg_notif_paiement ON paiement;
CREATE TRIGGER trg_notif_paiement AFTER INSERT ON paiement FOR EACH ROW EXECUTE FUNCTION trigger_notification_paiement();

DROP TRIGGER IF EXISTS trg_alerte_stock ON stock;
CREATE TRIGGER trg_alerte_stock AFTER INSERT OR UPDATE ON stock FOR EACH ROW EXECUTE FUNCTION trigger_alerte_stock();

DROP TRIGGER IF EXISTS trg_note_verrouille ON note;
CREATE TRIGGER trg_note_verrouille BEFORE UPDATE ON note FOR EACH ROW EXECUTE FUNCTION trigger_note_verrouille();

DROP TRIGGER IF EXISTS prevent_locked_note_modification ON note;
CREATE TRIGGER prevent_locked_note_modification BEFORE DELETE OR UPDATE ON note FOR EACH ROW EXECUTE FUNCTION check_note_verrouillee();

DROP TRIGGER IF EXISTS trigger_update_paiement_inscription_updated_at ON paiement_inscription;
CREATE TRIGGER trigger_update_paiement_inscription_updated_at BEFORE UPDATE ON paiement_inscription FOR EACH ROW EXECUTE FUNCTION update_paiement_inscription_updated_at();

-- Trigger pour configuration_paiement
CREATE TRIGGER trigger_config_paiement_updated_at
    BEFORE UPDATE ON configuration_paiement
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VUES ANALYTIQUES
-- =============================================================================

CREATE OR REPLACE VIEW vue_moyenne_ue AS
SELECT
    n.etudiant_id,
    ec.ue_id,
    n.session_id,
    ROUND(SUM(n.valeur * ec.coefficient) / NULLIF(SUM(ec.coefficient), 0), 2) AS moyenne_ue,
    COUNT(n.id) AS nb_notes,
    BOOL_AND(n.verrouille) AS toutes_verrouillees
FROM note n
JOIN element_constitutif ec ON n.ec_id = ec.id
GROUP BY n.etudiant_id, ec.ue_id, n.session_id;

CREATE OR REPLACE VIEW vue_moyenne_semestre AS
SELECT
    mue.etudiant_id,
    ue.semestre,
    mue.session_id,
    ROUND(SUM(mue.moyenne_ue * ue.coefficient) / NULLIF(SUM(ue.coefficient), 0), 2) AS moyenne_semestre,
    SUM(CASE WHEN mue.moyenne_ue >= 10 THEN ue.credits_ects ELSE 0 END) AS credits_valides,
    SUM(ue.credits_ects) AS credits_total
FROM vue_moyenne_ue mue
JOIN unite_enseignement ue ON mue.ue_id = ue.id
GROUP BY mue.etudiant_id, ue.semestre, mue.session_id;

CREATE OR REPLACE VIEW vue_kpi_president AS
SELECT
    (SELECT COUNT(*) FROM etudiant WHERE actif = TRUE) AS total_etudiants,
    (SELECT COUNT(*) FROM inscription i
     JOIN annee_academique aa ON aa.id = i.annee_academique_id
     WHERE aa.active = TRUE AND i.statut = 'validee') AS etudiants_inscrits_annee,
    (SELECT COUNT(*) FROM utilisateur WHERE role = 'enseignant' AND actif = TRUE) AS total_enseignants,
    (SELECT COUNT(*) FROM utilisateur WHERE role NOT IN ('etudiant', 'parent', 'enseignant') AND actif = TRUE) AS total_personnel,
    (SELECT COALESCE(SUM(p.montant), 0)
     FROM paiement p
     JOIN inscription i ON p.inscription_id = i.id
     JOIN annee_academique aa ON aa.id = i.annee_academique_id
     WHERE aa.active = TRUE AND p.statut = 'valide') AS recettes_annee,
    (SELECT COALESCE(SUM(montant), 0)
     FROM depense WHERE statut = 'paye'
     AND date_depense >= DATE_TRUNC('month', NOW())) AS depenses_mois,
    (SELECT COUNT(*) FROM ticket_maintenance WHERE statut IN ('ouvert', 'en_cours')) AS tickets_maintenance_ouverts,
    (SELECT COUNT(*) FROM stock WHERE quantite_stock <= seuil_alerte) AS alertes_stock;

CREATE OR REPLACE VIEW vue_paiement_etudiant AS
SELECT
    e.id AS etudiant_id,
    e.matricule,
    e.nom || ' ' || e.prenom AS etudiant_nom,
    p.nom AS parcours,
    aa.libelle AS annee,
    gt.montant_total AS montant_du,
    COALESCE(SUM(pay.montant) FILTER (WHERE pay.statut = 'valide'), 0) AS montant_paye,
    gt.montant_total - COALESCE(SUM(pay.montant) FILTER (WHERE pay.statut = 'valide'), 0) AS solde,
    CASE
        WHEN gt.montant_total - COALESCE(SUM(pay.montant) FILTER (WHERE pay.statut = 'valide'), 0) <= 0 THEN 'solde'
        WHEN COALESCE(SUM(pay.montant) FILTER (WHERE pay.statut = 'valide'), 0) > 0 THEN 'partiel'
        ELSE 'impaye'
    END AS statut_paiement
FROM etudiant e
JOIN inscription i ON e.id = i.etudiant_id
JOIN parcours p ON p.id = i.parcours_id
JOIN annee_academique aa ON aa.id = i.annee_academique_id
LEFT JOIN grille_tarifaire gt ON gt.parcours_id = i.parcours_id
    AND gt.annee_academique_id = i.annee_academique_id
    AND (gt.annee_niveau = i.annee_niveau OR gt.annee_niveau IS NULL)
LEFT JOIN paiement pay ON pay.inscription_id = i.id
WHERE aa.active = TRUE
GROUP BY e.id, e.matricule, e.nom, e.prenom, p.nom, aa.libelle, gt.montant_total;

CREATE OR REPLACE VIEW vue_absences_etudiant AS
SELECT
    e.id AS etudiant_id,
    e.matricule,
    e.nom || ' ' || e.prenom AS etudiant_nom,
    COUNT(pr.id) AS total_seances,
    COUNT(pr.id) FILTER (WHERE pr.statut = 'absent') AS absences_total,
    COUNT(pr.id) FILTER (WHERE pr.statut = 'absent' AND pr.justifie = TRUE) AS absences_justifiees,
    COUNT(pr.id) FILTER (WHERE pr.statut = 'absent' AND pr.justifie = FALSE) AS absences_injustifiees,
    COUNT(pr.id) FILTER (WHERE pr.statut = 'retard') AS retards,
    ROUND(100.0 * COUNT(pr.id) FILTER (WHERE pr.statut = 'present') / NULLIF(COUNT(pr.id), 0), 1) AS taux_assiduite
FROM etudiant e
JOIN presence pr ON e.id = pr.etudiant_id
GROUP BY e.id, e.matricule, e.nom, e.prenom;

CREATE OR REPLACE VIEW vue_frais_inscription_actifs AS
SELECT 
    fi.*,
    p.code as parcours_code,
    p.nom as parcours_nom,
    d.nom as departement_nom,
    aa.libelle as annee_academique,
    aa.date_debut as annee_debut,
    aa.date_fin as annee_fin,
    COUNT(DISTINCT i.id) as nb_inscriptions,
    COALESCE(SUM(pa.montant), 0) as total_encaisse
FROM frais_inscription fi
JOIN parcours p ON p.id = fi.parcours_id
LEFT JOIN departement d ON d.id = p.departement_id
JOIN annee_academique aa ON aa.id = fi.annee_academique_id
LEFT JOIN inscription i ON i.parcours_id = fi.parcours_id AND i.annee_academique_id = fi.annee_academique_id
LEFT JOIN paiement pa ON pa.inscription_id = i.id AND pa.statut = 'valide'
WHERE fi.actif = true
GROUP BY fi.id, p.code, p.nom, d.nom, aa.libelle, aa.date_debut, aa.date_fin;

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

CREATE OR REPLACE VIEW vue_statistiques_paiement_parcours AS
SELECT 
    p.code as parcours_code,
    p.nom as parcours_nom,
    aa.date_debut as annee_debut,
    aa.date_fin as annee_fin,
    COUNT(DISTINCT pa.inscription_id) as nb_etudiants_payants,
    COUNT(DISTINCT i.id) as nb_etudiants_inscrits,
    COALESCE(SUM(pa.montant), 0) as total_encaisse,
    COALESCE(AVG(pa.montant), 0) as montant_moyen,
    COUNT(*) as nb_transactions
FROM parcours p
JOIN inscription i ON i.parcours_id = p.id
JOIN annee_academique aa ON aa.id = i.annee_academique_id
LEFT JOIN paiement pa ON pa.inscription_id = i.id AND pa.statut = 'valide'
GROUP BY p.id, p.code, p.nom, aa.date_debut, aa.date_fin
ORDER BY total_encaisse DESC;

-- Vue pour les moyens de paiement actifs
CREATE OR REPLACE VIEW vue_moyens_paiement_actifs AS
SELECT
    id,
    tenant_id,
    type_paiement,
    nom_affichage,
    ordre_affichage,
    nom_banque,
    numero_compte,
    nom_titulaire,
    nom_service,
    numero_telephone,
    instructions_supplementaires
FROM configuration_paiement
WHERE est_actif = TRUE
ORDER BY ordre_affichage ASC, nom_affichage ASC;

COMMENT ON VIEW vue_moyens_paiement_actifs IS 'Vue des moyens de paiement actifs triés par ordre d''affichage';

-- =============================================================================
-- COMMENTAIRES FINAUX
-- =============================================================================

COMMENT ON TABLE frais_inscription IS 'Configuration des frais d''inscription et de scolarité par parcours et année académique';
COMMENT ON TABLE cloture_caisse IS 'Clôture journalière de caisse avec réconciliation bancaire';
COMMENT ON TABLE archive_scolarite IS 'Archivage sécurisé des documents de scolarité avec hash d''intégrité';
COMMENT ON TABLE attestation IS 'Gestion des attestations étudiants (scolarité, réussite, inscription, etc.)';
COMMENT ON TABLE deliberation IS 'Délibérations académiques par parcours et semestre';
COMMENT ON TABLE resultat_ue IS 'Résultats détaillés par UE pour chaque étudiant';
COMMENT ON TABLE resultat_semestre IS 'Résultats semestriels avec décision et mention';
COMMENT ON TABLE verrouillage_notes IS 'Verrouillage des saisies de notes par UE et semestre';
COMMENT ON TABLE configuration_paiement IS 'Configuration des moyens de paiement (Mobile Money, virements bancaires, etc.) pour les inscriptions';
COMMENT ON TABLE suplement_diplome IS 'Supplément au diplôme avec compétences et parcours détaillé';
COMMENT ON TABLE transfert_etudiant IS 'Gestion des transferts et réorientations d''étudiants';
COMMENT ON TABLE paiement_inscription IS 'Suivi des paiements d''inscription par étudiant';