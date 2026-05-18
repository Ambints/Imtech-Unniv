-- ======================================================================
-- MIGRATION: Ajout des tables manquantes pour le module Président
-- Date: 2026-05-17
-- Description: Crée les tables convention, delegation_signature et 
--              conseil_discipline (pour tenant_ispm), et ajoute les 
--              colonnes manquantes aux tables existantes
-- ======================================================================

-- Note: Ce script doit être exécuté pour chaque schéma tenant
-- Remplacer {schema} par le nom du schéma tenant (ex: tenant_ispm)

-- ======================================================================
-- 1. CRÉATION DE LA TABLE CONVENTION
-- ======================================================================

CREATE TABLE IF NOT EXISTS {schema}.convention (
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
    cree_par UUID NOT NULL,
    signe_par UUID,
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

CREATE INDEX IF NOT EXISTS idx_convention_statut ON {schema}.convention(statut);
CREATE INDEX IF NOT EXISTS idx_convention_type_partenaire ON {schema}.convention(type_partenaire);
CREATE INDEX IF NOT EXISTS idx_convention_signe_president ON {schema}.convention(signe_president) WHERE signe_president = FALSE;

COMMENT ON TABLE {schema}.convention IS 'Conventions et partenariats signés par le président';
COMMENT ON COLUMN {schema}.convention.type_partenaire IS 'Type de partenaire: eglise, diocese, etat, entreprise, universite, ong';
COMMENT ON COLUMN {schema}.convention.statut IS 'Statut: en_attente, signee, active, expiree, resiliee';

-- ======================================================================
-- 2. CRÉATION DE LA TABLE DELEGATION_SIGNATURE
-- ======================================================================

CREATE TABLE IF NOT EXISTS {schema}.delegation_signature (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delegant_id UUID NOT NULL,
    delegataire_id UUID NOT NULL,
    types_actes TEXT[] NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    conditions TEXT,
    statut VARCHAR(20) DEFAULT 'active',
    date_revocation TIMESTAMP,
    revoque_par UUID,
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

CREATE INDEX IF NOT EXISTS idx_delegation_delegataire ON {schema}.delegation_signature(delegataire_id);
CREATE INDEX IF NOT EXISTS idx_delegation_statut ON {schema}.delegation_signature(statut);
CREATE INDEX IF NOT EXISTS idx_delegation_dates ON {schema}.delegation_signature(date_debut, date_fin);

COMMENT ON TABLE {schema}.delegation_signature IS 'Délégations de signature du président au secrétariat général';
COMMENT ON COLUMN {schema}.delegation_signature.types_actes IS 'Types d''actes délégués: attestation_scolarite, convocation, certificat, etc.';
COMMENT ON COLUMN {schema}.delegation_signature.statut IS 'Statut: active, revoquee, expiree';

-- ======================================================================
-- 3. CRÉATION DE LA TABLE CONSEIL_DISCIPLINE (si absente)
-- ======================================================================

CREATE TABLE IF NOT EXISTS {schema}.conseil_discipline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    etudiant_id UUID NOT NULL,
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
    statue_par UUID,
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

CREATE INDEX IF NOT EXISTS idx_conseil_discipline_etudiant ON {schema}.conseil_discipline(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_conseil_discipline_statut ON {schema}.conseil_discipline(statut);
CREATE INDEX IF NOT EXISTS idx_conseil_discipline_date ON {schema}.conseil_discipline(date_conseil);

COMMENT ON TABLE {schema}.conseil_discipline IS 'Conseils de discipline nécessitant arbitrage présidentiel';
COMMENT ON COLUMN {schema}.conseil_discipline.statut IS 'Statut: convoque, en_attente_president, tenu, tranche, reporte, annule';

-- ======================================================================
-- 4. AJOUT DE COLONNES À LA TABLE CONTRAT_PERSONNEL
-- ======================================================================

ALTER TABLE {schema}.contrat_personnel 
ADD COLUMN IF NOT EXISTS statut_validation VARCHAR(30) DEFAULT 'en_attente';

ALTER TABLE {schema}.contrat_personnel 
ADD COLUMN IF NOT EXISTS valide_par UUID;

ALTER TABLE {schema}.contrat_personnel 
ADD COLUMN IF NOT EXISTS valide_le TIMESTAMP;

ALTER TABLE {schema}.contrat_personnel 
ADD COLUMN IF NOT EXISTS commentaire_president TEXT;

ALTER TABLE {schema}.contrat_personnel 
ADD COLUMN IF NOT EXISTS conditions_speciales TEXT;

-- Ajouter la contrainte si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'contrat_personnel_statut_validation_check'
    ) THEN
        ALTER TABLE {schema}.contrat_personnel 
        ADD CONSTRAINT contrat_personnel_statut_validation_check 
        CHECK (statut_validation IN ('en_attente', 'en_attente_president', 'valide_president', 'rejete_president'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contrat_statut_validation ON {schema}.contrat_personnel(statut_validation);

COMMENT ON COLUMN {schema}.contrat_personnel.statut_validation IS 'Statut de validation: en_attente, en_attente_president, valide_president, rejete_president';

-- ======================================================================
-- 5. AJOUT DE COLONNES À LA TABLE DEPENSE
-- ======================================================================

ALTER TABLE {schema}.depense
ADD COLUMN IF NOT EXISTS necessite_validation_president BOOLEAN 
    GENERATED ALWAYS AS (montant >= 1000000) STORED;

ALTER TABLE {schema}.depense
ADD COLUMN IF NOT EXISTS commentaire_validation TEXT;

CREATE INDEX IF NOT EXISTS idx_depense_validation_president ON {schema}.depense(necessite_validation_president) 
    WHERE necessite_validation_president = TRUE;

COMMENT ON COLUMN {schema}.depense.necessite_validation_president IS 'TRUE si montant >= 1 000 000 Ar (validation présidentielle requise)';

-- ======================================================================
-- 6. AJOUT DE COLONNES À LA TABLE DIPLOME
-- ======================================================================

ALTER TABLE {schema}.diplome
ADD COLUMN IF NOT EXISTS signe_president BOOLEAN DEFAULT FALSE;

ALTER TABLE {schema}.diplome
ADD COLUMN IF NOT EXISTS date_signature_president TIMESTAMP;

ALTER TABLE {schema}.diplome
ADD COLUMN IF NOT EXISTS signature_hash VARCHAR(128);

ALTER TABLE {schema}.diplome
ADD COLUMN IF NOT EXISTS mention_speciale TEXT;

CREATE INDEX IF NOT EXISTS idx_diplome_signe_president ON {schema}.diplome(signe_president) 
    WHERE signe_president = FALSE;

COMMENT ON COLUMN {schema}.diplome.signe_president IS 'Indique si le diplôme a été signé par le président';
COMMENT ON COLUMN {schema}.diplome.signature_hash IS 'Hash de la signature numérique du président';

-- ======================================================================
-- 7. AJOUT DE COLONNES À LA TABLE CALENDRIER_ACADEMIQUE
-- ======================================================================

ALTER TABLE {schema}.calendrier_academique
ADD COLUMN IF NOT EXISTS statut VARCHAR(30) DEFAULT 'en_attente_validation';

ALTER TABLE {schema}.calendrier_academique
ADD COLUMN IF NOT EXISTS valide_par UUID;

ALTER TABLE {schema}.calendrier_academique
ADD COLUMN IF NOT EXISTS date_validation TIMESTAMP;

ALTER TABLE {schema}.calendrier_academique
ADD COLUMN IF NOT EXISTS commentaire_validation TEXT;

-- Ajouter la contrainte si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'calendrier_academique_statut_check'
    ) THEN
        ALTER TABLE {schema}.calendrier_academique 
        ADD CONSTRAINT calendrier_academique_statut_check 
        CHECK (statut IN ('en_attente_validation', 'valide', 'modifie', 'annule'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_calendrier_statut ON {schema}.calendrier_academique(statut);

COMMENT ON COLUMN {schema}.calendrier_academique.statut IS 'Statut: en_attente_validation, valide, modifie, annule';

-- ======================================================================
-- 8. AJOUT DE COLONNES À LA TABLE PARCOURS
-- ======================================================================

ALTER TABLE {schema}.parcours
ADD COLUMN IF NOT EXISTS date_ouverture DATE;

ALTER TABLE {schema}.parcours
ADD COLUMN IF NOT EXISTS date_fermeture DATE;

ALTER TABLE {schema}.parcours
ADD COLUMN IF NOT EXISTS motif_fermeture TEXT;

ALTER TABLE {schema}.parcours
ADD COLUMN IF NOT EXISTS ferme_par UUID;

COMMENT ON COLUMN {schema}.parcours.date_ouverture IS 'Date d''ouverture du parcours par décision présidentielle';
COMMENT ON COLUMN {schema}.parcours.date_fermeture IS 'Date de fermeture du parcours par décision présidentielle';

-- ======================================================================
-- 9. CRÉATION DE LA TABLE AUDIT_LOG (schéma public)
-- ======================================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_schema VARCHAR(100) NOT NULL,
    utilisateur_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entite VARCHAR(100) NOT NULL,
    entite_id UUID,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_user ON public.audit_log(tenant_schema, utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_entite ON public.audit_log(entite, entite_id);

COMMENT ON TABLE public.audit_log IS 'Journal d''audit des actions des utilisateurs (tous tenants)';
COMMENT ON COLUMN public.audit_log.tenant_schema IS 'Schéma tenant concerné (ex: tenant_ispm)';
COMMENT ON COLUMN public.audit_log.role IS 'Rôle de l''utilisateur (ex: president, directeur, etc.)';

-- ======================================================================
-- FIN DE LA MIGRATION
-- ======================================================================

-- Pour appliquer cette migration à un tenant spécifique:
-- 1. Remplacer {schema} par le nom du tenant (ex: tenant_ispm)
-- 2. Exécuter le script SQL
-- 
-- Exemple:
-- psql -d Imtech_SaaS -c "$(sed 's/{schema}/tenant_ispm/g' 001_add_president_tables.sql)"

-- Made with Bob
