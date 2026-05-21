-- =============================================================================
-- MODULE SCOLARITÉ ET NOTES - Migration SQL Complémentaire
-- Architecture Multi-Tenant IMTECH University
-- =============================================================================

-- Extension pour le hachage SHA-512
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Table : Deliberation (Gestion des délibérations de jury)
-- -----------------------------------------------------------------------------
CREATE TABLE deliberation (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_examen_id       UUID        NOT NULL REFERENCES session_examen(id) ON DELETE RESTRICT,
    parcours_id             UUID        NOT NULL REFERENCES parcours(id) ON DELETE RESTRICT,
    semestre                SMALLINT    NOT NULL,
    annee_niveau            SMALLINT    NOT NULL,
    date_deliberation       DATE        NOT NULL,
    president_jury_id       UUID        NOT NULL REFERENCES utilisateur(id),
    membres_jury            UUID[]      DEFAULT '{}', -- Tableau des IDs des membres du jury
    statut                  VARCHAR(20) NOT NULL DEFAULT 'planifiee'
                            CHECK (statut IN ('planifiee', 'en_cours', 'terminee', 'annulee')),
    observations_generales  TEXT,
    rapport_deliberation    TEXT,       -- Rapport détaillé de la délibération
    validee_par             UUID        REFERENCES utilisateur(id),
    date_validation         TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (session_examen_id, parcours_id, semestre, annee_niveau)
);

-- -----------------------------------------------------------------------------
-- Table : ResultatSemestre (Résultats consolidés par semestre)
-- -----------------------------------------------------------------------------
CREATE TABLE resultat_semestre (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id             UUID        NOT NULL REFERENCES etudiant(id) ON DELETE RESTRICT,
    inscription_id          UUID        NOT NULL REFERENCES inscription(id) ON DELETE RESTRICT,
    semestre                SMALLINT    NOT NULL,
    annee_niveau            SMALLINT    NOT NULL,
    moyenne_generale        DECIMAL(5,2),
    total_credits_ects      SMALLINT,
    credits_acquis          SMALLINT    DEFAULT 0,
    credits_manquants       SMALLINT    DEFAULT 0,
    nombre_ues              SMALLINT    DEFAULT 0,
    nombre_ues_validees     SMALLINT    DEFAULT 0,
    statut                  VARCHAR(20) NOT NULL DEFAULT 'en_cours'
                            CHECK (statut IN ('en_cours', 'valide', 'ajourne', 'redoublement')),
    mention                 VARCHAR(30),
    deliberation_id         UUID        REFERENCES deliberation(id),
    classement              SMALLINT,   -- Classement dans la promotion
    effectif_promotion      SMALLINT,   -- Effectif total de la promotion
    date_validation         TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (etudiant_id, inscription_id, semestre, annee_niveau)
);

-- -----------------------------------------------------------------------------  
-- Table : ResultatUE (Résultats par Unité d'Enseignement)
-- -----------------------------------------------------------------------------
CREATE TABLE resultat_ue (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id             UUID        NOT NULL REFERENCES etudiant(id) ON DELETE RESTRICT,
    ue_id                   UUID        NOT NULL REFERENCES unite_enseignement(id) ON DELETE RESTRICT,
    resultat_semestre_id    UUID        NOT NULL REFERENCES resultat_semestre(id) ON DELETE RESTRICT,
    moyenne_ue              DECIMAL(5,2),
    credits_ects            SMALLINT,
    credits_acquis          BOOLEAN     DEFAULT FALSE,
    statut                  VARCHAR(20) NOT NULL DEFAULT 'en_cours'
                            CHECK (statut IN ('en_cours', 'valide', 'ajourne', 'compense')),
    compensation_ue_id      UUID        REFERENCES unite_enseignement(id), -- UE compensée
    date_validation         TIMESTAMPTZ,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (etudiant_id, ue_id, resultat_semestre_id)
);

-- -----------------------------------------------------------------------------
-- Table : Diplome (Gestion des diplômes et suppléments)
-- -----------------------------------------------------------------------------
CREATE TABLE diplome (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id             UUID        NOT NULL REFERENCES etudiant(id) ON DELETE RESTRICT,
    inscription_id          UUID        NOT NULL REFERENCES inscription(id) ON DELETE RESTRICT,
    parcours_id             UUID        NOT NULL REFERENCES parcours(id) ON DELETE RESTRICT,
    type_diplome            VARCHAR(50) NOT NULL
                            CHECK (type_diplome IN ('licence', 'master', 'doctorat', 'bts', 'dut', 'certificat')),
    mention_generale        VARCHAR(30),
    moyenne_finale          DECIMAL(5,2),
    total_credits_ects      SMALLINT,
    date_obtention          DATE,
    lieu_obtention          VARCHAR(200),
    numero_diplome          VARCHAR(50) UNIQUE,
    hash_integrite          VARCHAR(128), -- SHA-512 pour vérification authenticité
    qr_code_url             VARCHAR(500),
    statut                  VARCHAR(20) NOT NULL DEFAULT 'en_attente'
                            CHECK (statut IN ('en_attente', 'delivre', 'retire', 'annule', 'remplace')),
    delivre_par             UUID        NOT NULL REFERENCES utilisateur(id),
    date_delivrance         DATE,
    date_retrait            DATE,
    observations            TEXT,
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : SuplementDiplome (Supplément au diplôme - Diploma Supplement)
-- -----------------------------------------------------------------------------
CREATE TABLE suplement_diplome (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    diplome_id              UUID        NOT NULL REFERENCES diplome(id) ON DELETE RESTRICT,
    langue                  VARCHAR(10) DEFAULT 'FR',
    
    -- Informations sur le titulaire
    identite_titulaire      JSONB,      -- Nom, prénoms, date/lieu de naissance
    
    -- Informations sur le diplôme
    nom_diplome             VARCHAR(200) NOT NULL,
    domaine_etudes         VARCHAR(200),
    objectifs               TEXT,
    niveau_qualification    VARCHAR(100),
    duree_etudes            VARCHAR(50),
    
    -- Informations sur l'établissement
    nom_etablissement       VARCHAR(200) NOT NULL,
    statut_etablissement    VARCHAR(100),
    langue_enseignement     VARCHAR(50),
    
    -- Détails du programme
    details_programme       JSONB,      -- UE, EC, crédits par semestre
    
    -- Résultats détaillés
    resultats_detailles     JSONB,      -- Notes par UE/EC par semestre
    
    -- Compétences acquises
    competences             JSONB,
    
    -- Informations sur le système national
    systeme_educatif        JSONB,
    
    -- Informations complémentaires
    stage                   JSONB,      -- Stages effectués
    projet                 JSONB,      -- Projets académiques
    
    -- Certification
    certifie_par            UUID        REFERENCES utilisateur(id),
    date_certification      TIMESTAMPTZ DEFAULT NOW(),
    hash_integrite          VARCHAR(128), -- SHA-512 du document
    
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : TransfertEtudiant (Gestion des transferts et équivalences)
-- -----------------------------------------------------------------------------
CREATE TABLE transfert_etudiant (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id             UUID        NOT NULL REFERENCES etudiant(id) ON DELETE RESTRICT,
    etablissement_origine   VARCHAR(200) NOT NULL,
    pays_origine            VARCHAR(100),
    diplome_origine         VARCHAR(200),
    annee_obtention_origine INTEGER,
    parcours_destination_id UUID        NOT NULL REFERENCES parcours(id) ON DELETE RESTRICT,
    niveau_destination      SMALLINT    NOT NULL,
    
    -- Documents fournis
    releves_notes_origine   TEXT[],     -- URLs des relevés de notes
    attestations_origine    TEXT[],     -- URLs des attestations
    programme_origine       TEXT,       -- Description du programme d'origine
    
    -- Décision d'équivalence
    decision_equivalence    VARCHAR(20) NOT NULL DEFAULT 'en_attente'
                            CHECK (decision_equivalence IN ('en_attente', 'acceptee', 'refusee', 'complementaire')),
    credits_reconnus        SMALLINT    DEFAULT 0,
    ues_validees            UUID[],     -- IDs des UE validées par équivalence
    conditions_complementaires TEXT,
    
    -- Validation
    valide_par               UUID        REFERENCES utilisateur(id),
    date_validation         TIMESTAMPTZ,
    observations            TEXT,
    
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : ArchiveScolarite (Archivage officiel des documents)
-- -----------------------------------------------------------------------------
CREATE TABLE archive_scolarite (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    etudiant_id             UUID        NOT NULL REFERENCES etudiant(id) ON DELETE RESTRICT,
    type_document           VARCHAR(50) NOT NULL
                            CHECK (type_document IN (
                                'releve_notes', 'attestation_reussite', 'diplome',
                                'suplement_diplome', 'certificat_scolarite', 'transcript'
                            )),
    titre_document          VARCHAR(200) NOT NULL,
    annee_academique        VARCHAR(20) NOT NULL,
    semestre                SMALLINT,
    
    -- Fichiers archivés
    fichier_original_url    VARCHAR(500),
    fichier_pdf_url         VARCHAR(500),
    hash_integrite          VARCHAR(128), -- SHA-512 pour vérification
    
    -- Métadonnées
    format                  VARCHAR(20) DEFAULT 'PDF',
    taille_octets           BIGINT,
    langue                  VARCHAR(10) DEFAULT 'FR',
    
    -- Contrôle d'accès
    acces_public            BOOLEAN     DEFAULT FALSE,
    date_limite_acces       DATE,
    
    -- Archivage
    archive_par             UUID        NOT NULL REFERENCES utilisateur(id),
    date_archivage          TIMESTAMPTZ DEFAULT NOW(),
    duree_conservation      INTEGER     DEFAULT 10, -- années
    
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- Table : VerrouillageNotes (Gestion du verrouillage des notes post-délibération)
-- -----------------------------------------------------------------------------
CREATE TABLE verrouillage_notes (
    id                      UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    deliberation_id         UUID        NOT NULL REFERENCES deliberation(id) ON DELETE RESTRICT,
    etudiant_id             UUID        NOT NULL REFERENCES etudiant(id) ON DELETE RESTRICT,
    session_examen_id       UUID        NOT NULL REFERENCES session_examen(id),
    
    -- Verrouillage
    statut                  VARCHAR(20) NOT NULL DEFAULT 'deverrouille'
                            CHECK (statut IN ('deverrouille', 'verrouille', 'modification_autorisee')),
    date_verrouillage       TIMESTAMPTZ,
    verrouille_par          UUID        REFERENCES utilisateur(id),
    
    -- Autorisations exceptionnelles
    autorisation_modif      BOOLEAN     DEFAULT FALSE,
    motif_autorisation      TEXT,
    autorise_par            UUID        REFERENCES utilisateur(id),
    date_autorisation       TIMESTAMPTZ,
    date_fin_autorisation   DATE,
    
    -- Historique
    historique_modifs      JSONB       DEFAULT '[]',
    
    created_at              TIMESTAMPTZ DEFAULT NOW(),
    updated_at              TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (deliberation_id, etudiant_id, session_examen_id)
);

-- -----------------------------------------------------------------------------
-- Index pour optimisation des performances
-- -----------------------------------------------------------------------------

-- Index sur les tables de résultats
CREATE INDEX idx_resultat_semestre_etudiant ON resultat_semestre(etudiant_id);
CREATE INDEX idx_resultat_semestre_inscription ON resultat_semestre(inscription_id);
CREATE INDEX idx_resultat_semestre_statut ON resultat_semestre(statut);
CREATE INDEX idx_resultat_semestre_deliberation ON resultat_semestre(deliberation_id);

CREATE INDEX idx_resultat_ue_etudiant ON resultat_ue(etudiant_id);
CREATE INDEX idx_resultat_ue_ue ON resultat_ue(ue_id);
CREATE INDEX idx_resultat_ue_statut ON resultat_ue(statut);

-- Index sur les diplômes
CREATE INDEX idx_diplome_etudiant ON diplome(etudiant_id);
CREATE INDEX idx_diplome_parcours ON diplome(parcours_id);
CREATE INDEX idx_diplome_statut ON diplome(statut);
CREATE INDEX idx_diplome_numero ON diplome(numero_diplome);

-- Index sur les délibérations
CREATE INDEX idx_deliberation_session ON deliberation(session_examen_id);
CREATE INDEX idx_deliberation_parcours ON deliberation(parcours_id);
CREATE INDEX idx_deliberation_statut ON deliberation(statut);

-- Index sur les transferts
CREATE INDEX idx_transfert_etudiant ON transfert_etudiant(etudiant_id);
CREATE INDEX idx_transfert_decision ON transfert_etudiant(decision_equivalence);

-- Index sur les archives
CREATE INDEX idx_archive_etudiant ON archive_scolarite(etudiant_id);
CREATE INDEX idx_archive_type ON archive_scolarite(type_document);
CREATE INDEX idx_archive_annee ON archive_scolarite(annee_academique);

-- Index sur les verrouillages
CREATE INDEX idx_verrouillage_etudiant ON verrouillage_notes(etudiant_id);
CREATE INDEX idx_verrouillage_session ON verrouillage_notes(session_examen_id);
CREATE INDEX idx_verrouillage_statut ON verrouillage_notes(statut);

-- -----------------------------------------------------------------------------
-- Triggers et fonctions pour la gestion automatique
-- -----------------------------------------------------------------------------

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Application du trigger sur toutes les tables créées
CREATE TRIGGER update_deliberation_updated_at BEFORE UPDATE ON deliberation 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resultat_semestre_updated_at BEFORE UPDATE ON resultat_semestre 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resultat_ue_updated_at BEFORE UPDATE ON resultat_ue 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diplome_updated_at BEFORE UPDATE ON diplome 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suplement_diplome_updated_at BEFORE UPDATE ON suplement_diplome 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transfert_etudiant_updated_at BEFORE UPDATE ON transfert_etudiant 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_archive_scolarite_updated_at BEFORE UPDATE ON archive_scolarite 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verrouillage_notes_updated_at BEFORE UPDATE ON verrouillage_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour empêcher la modification des notes verrouillées
CREATE OR REPLACE FUNCTION check_note_verrouillee()
RETURNS TRIGGER AS $$
BEGIN
    -- Vérifier si la note est verrouillée
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
$$ language 'plpgsql';

-- Application du trigger sur la table des notes
CREATE TRIGGER prevent_locked_note_modification 
    BEFORE UPDATE OR DELETE ON note 
    FOR EACH ROW EXECUTE FUNCTION check_note_verrouillee();

-- -----------------------------------------------------------------------------
-- Fonctions de calcul des moyennes et statistiques
-- -----------------------------------------------------------------------------

-- Fonction pour calculer la moyenne d'un étudiant pour un semestre
CREATE OR REPLACE FUNCTION calculer_moyenne_semestre(
    p_etudiant_id UUID,
    p_inscription_id UUID,
    p_semestre SMALLINT,
    p_annee_niveau SMALLINT
)
RETURNS DECIMAL(5,2) AS $$
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
$$ LANGUAGE plpgsql;

-- Fonction pour calculer les crédits ECTS acquis
CREATE OR REPLACE FUNCTION calculer_credits_acquis(
    p_etudiant_id UUID,
    p_inscription_id UUID,
    p_semestre SMALLINT,
    p_annee_niveau SMALLINT
)
RETURNS SMALLINT AS $$
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
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Vues pour les rapports et statistiques
-- -----------------------------------------------------------------------------

-- Vue des résultats consolidés par étudiant
CREATE VIEW vue_resultats_etudiants AS
SELECT 
    e.id AS etudiant_id,
    e.matricule,
    e.nom,
    e.prenoms,
    p.code AS parcours_code,
    p.nom AS parcours_nom,
    i.annee_niveau,
    rs.semestre,
    rs.moyenne_generale,
    rs.total_credits_ects,
    rs.credits_acquis,
    rs.statut AS statut_semestre,
    rs.mention,
    rs.classement,
    rs.effectif_promotion
FROM etudiant e
JOIN inscription i ON e.id = i.etudiant_id
JOIN parcours p ON i.parcours_id = p.id
LEFT JOIN resultat_semestre rs ON i.id = rs.inscription_id
WHERE i.statut = 'validee'
ORDER BY p.code, i.annee_niveau, rs.semestre, rs.classement;

-- Vue des statistiques de délibération
CREATE VIEW vue_statistiques_deliberation AS
SELECT 
    d.id AS deliberation_id,
    d.date_deliberation,
    p.code AS parcours_code,
    p.nom AS parcours_nom,
    d.semestre,
    d.annee_niveau,
    COUNT(rs.id) AS nombre_etudiants,
    COUNT(CASE WHEN rs.statut = 'valide' THEN 1 END) AS admis,
    COUNT(CASE WHEN rs.statut = 'ajourne' THEN 1 END) AS ajournes,
    COUNT(CASE WHEN rs.statut = 'redoublement' THEN 1 END) AS redoublants,
    ROUND(AVG(rs.moyenne_generale), 2) AS moyenne_promotion,
    MAX(rs.moyenne_generale) AS moyenne_max,
    MIN(rs.moyenne_generale) AS moyenne_min
FROM deliberation d
JOIN parcours p ON d.parcours_id = p.id
JOIN session_examen se ON d.session_examen_id = se.id
LEFT JOIN resultat_semestre rs ON d.id = rs.deliberation_id
GROUP BY d.id, p.code, p.nom, d.semestre, d.annee_niveau, d.date_deliberation
ORDER BY d.date_deliberation DESC;

COMMENT ON TABLE deliberation IS 'Gestion des délibérations de jury pour validation des résultats';
COMMENT ON TABLE resultat_semestre IS 'Résultats consolidés par semestre pour chaque étudiant';
COMMENT ON TABLE resultat_ue IS 'Résultats détaillés par Unité dEnseignement';
COMMENT ON TABLE diplome IS 'Gestion des diplômes délivrés par l établissement';
COMMENT ON TABLE suplement_diplome IS 'Supplément au diplôme (Diploma Supplement) selon standards européens';
COMMENT ON TABLE transfert_etudiant IS 'Gestion des transferts et équivalences détudiants';
COMMENT ON TABLE archive_scolarite IS 'Archivage officiel des documents de scolarité';
COMMENT ON TABLE verrouillage_notes IS 'Contrôle d accès et verrouillage des notes après délibération';
