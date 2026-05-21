-- ============================================================================
-- PHASE 2 : MISE À JOUR TENANT-SCHEMA.SQL + TABLES MANQUANTES
-- ============================================================================
-- Date: 2026-05-18
-- Durée estimée: 4 heures
-- Impact: IMPORTANT - Garantit cohérence nouveaux tenants
-- ============================================================================

-- Ce script ajoute les tables et colonnes manquantes au schéma de création
-- À intégrer dans backend/src/tenants/tenant-schema.sql

-- ============================================================================
-- PARTIE 1 : CRÉATION TABLE CONVENTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS convention (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    intitule VARCHAR(300) NOT NULL,
    partenaire VARCHAR(200) NOT NULL,
    type_partenaire VARCHAR(50) NOT NULL,
    objet_convention TEXT NOT NULL,
    date_signature DATE,
    date_debut_effet DATE NOT NULL,
    date_fin_effet DATE,
    montant_engagement NUMERIC(15,2),
    document_url VARCHAR(500),
    statut VARCHAR(30) DEFAULT 'en_attente',
    signe_president BOOLEAN DEFAULT FALSE,
    signature_hash VARCHAR(128),
    representant_partenaire VARCHAR(200),
    remarques TEXT,
    cree_par UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    signe_par UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_signature_president TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT convention_type_partenaire_check 
        CHECK (type_partenaire IN ('eglise', 'diocese', 'etat', 'entreprise', 'universite', 'ong')),
    CONSTRAINT convention_statut_check 
        CHECK (statut IN ('en_attente', 'signee', 'active', 'expiree', 'resiliee')),
    CONSTRAINT convention_dates_check 
        CHECK (date_fin_effet IS NULL OR date_fin_effet > date_debut_effet)
);

CREATE INDEX IF NOT EXISTS idx_convention_statut ON convention(statut);
CREATE INDEX IF NOT EXISTS idx_convention_type_partenaire ON convention(type_partenaire);
CREATE INDEX IF NOT EXISTS idx_convention_signe_president ON convention(signe_president) WHERE signe_president = FALSE;

COMMENT ON TABLE convention IS 'Conventions et partenariats signés par le président';

-- ============================================================================
-- PARTIE 2 : CRÉATION TABLE DELEGATION_SIGNATURE
-- ============================================================================

CREATE TABLE IF NOT EXISTS delegation_signature (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delegant_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    delegataire_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    types_actes TEXT[] NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    conditions TEXT,
    statut VARCHAR(20) DEFAULT 'active',
    date_revocation TIMESTAMP,
    revoque_par UUID REFERENCES utilisateur(id),
    motif_revocation TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT delegation_statut_check 
        CHECK (statut IN ('active', 'revoquee', 'expiree')),
    CONSTRAINT delegation_dates_check 
        CHECK (date_fin > date_debut),
    CONSTRAINT delegation_types_actes_check 
        CHECK (array_length(types_actes, 1) > 0)
);

CREATE INDEX IF NOT EXISTS idx_delegation_delegataire ON delegation_signature(delegataire_id);
CREATE INDEX IF NOT EXISTS idx_delegation_statut ON delegation_signature(statut);
CREATE INDEX IF NOT EXISTS idx_delegation_dates ON delegation_signature(date_debut, date_fin);

COMMENT ON TABLE delegation_signature IS 'Délégations de signature du président au secrétariat général';

-- ============================================================================
-- PARTIE 3 : CRÉATION TABLE CONSEIL_DISCIPLINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS conseil_discipline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    etudiant_id UUID NOT NULL REFERENCES etudiant(id) ON DELETE RESTRICT,
    date_conseil TIMESTAMP NOT NULL,
    motif_convocation TEXT NOT NULL,
    incidents_lies JSONB DEFAULT '[]'::jsonb,
    membres_presents JSONB DEFAULT '[]'::jsonb,
    deliberation TEXT,
    decision VARCHAR(100),
    justification_decision TEXT,
    droit_appel BOOLEAN DEFAULT TRUE,
    delai_appel_jours INTEGER DEFAULT 15,
    statut VARCHAR(50) DEFAULT 'convoque',
    proces_verbal_url TEXT,
    parent_present BOOLEAN DEFAULT FALSE,
    decision_president VARCHAR(100),
    motivation_president TEXT,
    duree_suspension_jours INTEGER,
    statue_par UUID REFERENCES utilisateur(id),
    statue_le TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT conseil_discipline_decision_check 
        CHECK (decision IN ('aucune_sanction', 'avertissement', 'blame', 'exclusion_temporaire', 'exclusion_definitive', 'renvoi')),
    CONSTRAINT conseil_discipline_statut_check 
        CHECK (statut IN ('convoque', 'en_attente_president', 'tenu', 'tranche', 'reporte', 'annule')),
    CONSTRAINT conseil_discipline_decision_president_check 
        CHECK (decision_president IN ('avertissement', 'suspension_temporaire', 'exclusion_definitive', 'classement_sans_suite'))
);

CREATE INDEX IF NOT EXISTS idx_conseil_discipline_etudiant ON conseil_discipline(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_conseil_discipline_statut ON conseil_discipline(statut);
CREATE INDEX IF NOT EXISTS idx_conseil_discipline_date ON conseil_discipline(date_conseil);

COMMENT ON TABLE conseil_discipline IS 'Conseils de discipline nécessitant arbitrage présidentiel';

-- ============================================================================
-- PARTIE 4 : CRÉATION TABLE ABSENCE_ENSEIGNANT
-- ============================================================================

CREATE TABLE IF NOT EXISTS absence_enseignant (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enseignant_id UUID NOT NULL REFERENCES enseignant(id) ON DELETE CASCADE,
    seance_id UUID REFERENCES emploi_du_temps(id) ON DELETE SET NULL,
    date_absence DATE NOT NULL,
    heure_debut TIME,
    heure_fin TIME,
    motif TEXT,
    justification TEXT,
    justificatif_url VARCHAR(500),
    est_justifiee BOOLEAN DEFAULT FALSE,
    statut VARCHAR(20) DEFAULT 'declaree',
    declaree_par UUID REFERENCES utilisateur(id),
    validee_par UUID REFERENCES utilisateur(id),
    date_validation TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT absence_enseignant_statut_check 
        CHECK (statut IN ('declaree', 'justifiee', 'injustifiee', 'validee'))
);

CREATE INDEX IF NOT EXISTS idx_absence_enseignant ON absence_enseignant(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_absence_date ON absence_enseignant(date_absence);
CREATE INDEX IF NOT EXISTS idx_absence_statut ON absence_enseignant(statut);

COMMENT ON TABLE absence_enseignant IS 'Gestion des absences des enseignants';

-- ============================================================================
-- PARTIE 5 : CRÉATION TABLE RATTRAPAGE
-- ============================================================================

CREATE TABLE IF NOT EXISTS rattrapage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    absence_id UUID NOT NULL REFERENCES absence_enseignant(id) ON DELETE CASCADE,
    enseignant_id UUID NOT NULL REFERENCES enseignant(id) ON DELETE RESTRICT,
    salle_id UUID REFERENCES salle(id) ON DELETE SET NULL,
    date_rattrapage DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    observations TEXT,
    statut VARCHAR(20) DEFAULT 'planifie',
    remplaceur_id UUID REFERENCES enseignant(id) ON DELETE SET NULL,
    planifie_par UUID NOT NULL REFERENCES utilisateur(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT rattrapage_statut_check 
        CHECK (statut IN ('planifie', 'effectue', 'annule'))
);

CREATE INDEX IF NOT EXISTS idx_rattrapage_absence ON rattrapage(absence_id);
CREATE INDEX IF NOT EXISTS idx_rattrapage_date ON rattrapage(date_rattrapage);

COMMENT ON TABLE rattrapage IS 'Planification des cours de rattrapage';

-- ============================================================================
-- PARTIE 6 : AJOUT INDEX SECONDAIRES
-- ============================================================================

-- Index pour inscriptions actives
CREATE INDEX IF NOT EXISTS idx_inscription_actif_parcours 
ON inscription(parcours_id, annee_academique_id) 
WHERE statut = 'validee';

-- Index pour incidents disciplinaires
CREATE INDEX IF NOT EXISTS idx_incident_statut_date 
ON incident_disciplinaire(statut, date_incident DESC) 
WHERE statut IN ('ouvert', 'en_cours', 'arbitrage');

-- Index pour notifications
CREATE INDEX IF NOT EXISTS idx_notification_lue 
ON notification(utilisateur_id, lue, created_at DESC);

-- Index pour messages
CREATE INDEX IF NOT EXISTS idx_message_lu 
ON message(destinataire_id, lu, created_at DESC);

-- ============================================================================
-- PARTIE 7 : TRIGGERS POUR NOUVELLES TABLES
-- ============================================================================

-- Trigger updated_at pour convention
DROP TRIGGER IF EXISTS update_convention_updated_at ON convention;
CREATE TRIGGER update_convention_updated_at 
BEFORE UPDATE ON convention 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger updated_at pour delegation_signature
DROP TRIGGER IF EXISTS update_delegation_updated_at ON delegation_signature;
CREATE TRIGGER update_delegation_updated_at 
BEFORE UPDATE ON delegation_signature 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger updated_at pour conseil_discipline
DROP TRIGGER IF EXISTS update_conseil_discipline_updated_at ON conseil_discipline;
CREATE TRIGGER update_conseil_discipline_updated_at 
BEFORE UPDATE ON conseil_discipline 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger updated_at pour absence_enseignant
DROP TRIGGER IF EXISTS update_absence_enseignant_updated_at ON absence_enseignant;
CREATE TRIGGER update_absence_enseignant_updated_at 
BEFORE UPDATE ON absence_enseignant 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger updated_at pour rattrapage
DROP TRIGGER IF EXISTS update_rattrapage_updated_at ON rattrapage;
CREATE TRIGGER update_rattrapage_updated_at 
BEFORE UPDATE ON rattrapage 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FIN PHASE 2
-- ============================================================================

-- INSTRUCTIONS:
-- 1. Copier ce contenu dans backend/src/tenants/tenant-schema.sql
-- 2. Placer après la section "MODULE : COMMUNICATION"
-- 3. Avant la section "INDEX DE PERFORMANCE"
-- 4. Tester la création d'un nouveau tenant
-- 5. Vérifier que toutes les tables sont créées

-- Made with ❤️ by IBM Bob

-- Made with Bob
