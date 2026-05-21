-- ============================================================================
-- PHASE 1 : CORRECTION DES PROBLÈMES CRITIQUES + FK + INDEX PRIORITAIRES
-- ============================================================================
-- Date: 2026-05-18
-- Durée estimée: 2-3 heures
-- Impact: CRITIQUE - À exécuter en priorité
-- ============================================================================

-- Ce script doit être exécuté pour CHAQUE schéma tenant
-- Remplacer {schema} par le nom du schéma (ex: tenant_ispm)

-- ============================================================================
-- PARTIE 1 : HARMONISATION CONTRAINTES STATUT DIPLÔME
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== PARTIE 1 : Harmonisation statut diplôme ===';
    
    -- 1.1 Supprimer l'ancienne contrainte
    RAISE NOTICE 'Suppression ancienne contrainte...';
    ALTER TABLE {schema}.diplome 
    DROP CONSTRAINT IF EXISTS diplome_statut_check;
    
    -- 1.2 Ajouter la nouvelle contrainte (7 statuts)
    RAISE NOTICE 'Ajout nouvelle contrainte avec 7 statuts...';
    ALTER TABLE {schema}.diplome 
    ADD CONSTRAINT diplome_statut_check 
    CHECK (statut IN (
        'en_attente',      -- Diplôme en attente de génération
        'pret_signature',  -- Diplôme généré, prêt pour signature président
        'signe',           -- Diplôme signé par le président
        'delivre',         -- Diplôme délivré à l'étudiant
        'retire',          -- Diplôme retiré par l'étudiant
        'annule',          -- Diplôme annulé
        'remplace'         -- Diplôme remplacé par un nouveau
    ));
    
    -- 1.3 Ajouter les colonnes manquantes pour signature président
    RAISE NOTICE 'Ajout colonnes signature président...';
    ALTER TABLE {schema}.diplome
    ADD COLUMN IF NOT EXISTS signe_president BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS date_signature_president TIMESTAMP,
    ADD COLUMN IF NOT EXISTS signature_hash VARCHAR(128),
    ADD COLUMN IF NOT EXISTS mention_speciale TEXT;
    
    -- 1.4 Créer l'index pour diplômes à signer
    RAISE NOTICE 'Création index diplômes à signer...';
    CREATE INDEX IF NOT EXISTS idx_diplome_signe_president 
    ON {schema}.diplome(signe_president) 
    WHERE signe_president = FALSE;
    
    -- 1.5 Mettre à jour les statuts existants si nécessaire
    RAISE NOTICE 'Mise à jour statuts existants...';
    UPDATE {schema}.diplome 
    SET statut = 'pret_signature' 
    WHERE statut = 'en_attente' 
    AND fichier_url IS NOT NULL;
    
    RAISE NOTICE '✓ Partie 1 terminée avec succès';
END $$;

-- ============================================================================
-- PARTIE 2 : AJOUT COLONNES MANQUANTES CRITIQUES
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== PARTIE 2 : Ajout colonnes manquantes ===';
    
    -- 2.1 Table contrat_personnel (validation président)
    RAISE NOTICE 'Mise à jour table contrat_personnel...';
    ALTER TABLE {schema}.contrat_personnel 
    ADD COLUMN IF NOT EXISTS statut_validation VARCHAR(30) DEFAULT 'en_attente',
    ADD COLUMN IF NOT EXISTS valide_par UUID REFERENCES {schema}.utilisateur(id),
    ADD COLUMN IF NOT EXISTS valide_le TIMESTAMP,
    ADD COLUMN IF NOT EXISTS commentaire_president TEXT,
    ADD COLUMN IF NOT EXISTS conditions_speciales TEXT;
    
    -- Ajouter contrainte si elle n'existe pas
    DO $inner$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'contrat_personnel_statut_validation_check'
            AND connamespace = '{schema}'::regnamespace
        ) THEN
            ALTER TABLE {schema}.contrat_personnel 
            ADD CONSTRAINT contrat_personnel_statut_validation_check 
            CHECK (statut_validation IN ('en_attente', 'en_attente_president', 
                                         'valide_president', 'rejete_president'));
        END IF;
    END $inner$;
    
    CREATE INDEX IF NOT EXISTS idx_contrat_statut_validation 
    ON {schema}.contrat_personnel(statut_validation);
    
    -- 2.2 Table depense (validation président)
    RAISE NOTICE 'Mise à jour table depense...';
    ALTER TABLE {schema}.depense
    ADD COLUMN IF NOT EXISTS necessite_validation_president BOOLEAN 
        GENERATED ALWAYS AS (montant >= 1000000) STORED;
    
    ALTER TABLE {schema}.depense
    ADD COLUMN IF NOT EXISTS commentaire_validation TEXT;
    
    CREATE INDEX IF NOT EXISTS idx_depense_validation_president 
    ON {schema}.depense(necessite_validation_president) 
    WHERE necessite_validation_president = TRUE;
    
    -- 2.3 Table calendrier_academique (validation président)
    RAISE NOTICE 'Mise à jour table calendrier_academique...';
    ALTER TABLE {schema}.calendrier_academique
    ADD COLUMN IF NOT EXISTS statut VARCHAR(30) DEFAULT 'en_attente_validation',
    ADD COLUMN IF NOT EXISTS valide_par UUID REFERENCES {schema}.utilisateur(id),
    ADD COLUMN IF NOT EXISTS date_validation TIMESTAMP,
    ADD COLUMN IF NOT EXISTS commentaire_validation TEXT;
    
    -- Ajouter contrainte si elle n'existe pas
    DO $inner$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'calendrier_academique_statut_check'
            AND connamespace = '{schema}'::regnamespace
        ) THEN
            ALTER TABLE {schema}.calendrier_academique 
            ADD CONSTRAINT calendrier_academique_statut_check 
            CHECK (statut IN ('en_attente_validation', 'valide', 'modifie', 'annule'));
        END IF;
    END $inner$;
    
    CREATE INDEX IF NOT EXISTS idx_calendrier_statut 
    ON {schema}.calendrier_academique(statut);
    
    -- 2.4 Table parcours (ouverture/fermeture)
    RAISE NOTICE 'Mise à jour table parcours...';
    ALTER TABLE {schema}.parcours
    ADD COLUMN IF NOT EXISTS date_ouverture DATE,
    ADD COLUMN IF NOT EXISTS date_fermeture DATE,
    ADD COLUMN IF NOT EXISTS motif_fermeture TEXT,
    ADD COLUMN IF NOT EXISTS ferme_par UUID REFERENCES {schema}.utilisateur(id);
    
    RAISE NOTICE '✓ Partie 2 terminée avec succès';
END $$;

-- ============================================================================
-- PARTIE 3 : AJOUT CLÉS ÉTRANGÈRES MANQUANTES
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== PARTIE 3 : Ajout clés étrangères ===';
    
    -- 3.1 Vérifier si la table convention existe
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = '{schema}' 
        AND table_name = 'convention'
    ) THEN
        RAISE NOTICE 'Ajout FK sur table convention...';
        
        -- FK cree_par
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'fk_convention_cree_par'
            AND connamespace = '{schema}'::regnamespace
        ) THEN
            ALTER TABLE {schema}.convention
            ADD CONSTRAINT fk_convention_cree_par 
            FOREIGN KEY (cree_par) REFERENCES {schema}.utilisateur(id) ON DELETE RESTRICT;
        END IF;
        
        -- FK signe_par
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'fk_convention_signe_par'
            AND connamespace = '{schema}'::regnamespace
        ) THEN
            ALTER TABLE {schema}.convention
            ADD CONSTRAINT fk_convention_signe_par 
            FOREIGN KEY (signe_par) REFERENCES {schema}.utilisateur(id) ON DELETE SET NULL;
        END IF;
    ELSE
        RAISE NOTICE 'Table convention n''existe pas encore (sera créée en Phase 2)';
    END IF;
    
    RAISE NOTICE '✓ Partie 3 terminée avec succès';
END $$;

-- ============================================================================
-- PARTIE 4 : CRÉATION INDEX PRIORITAIRES (HAUTE PRIORITÉ)
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== PARTIE 4 : Création index prioritaires ===';
    
    -- 4.1 Index paiement (stats financières)
    RAISE NOTICE 'Index paiement...';
    CREATE INDEX IF NOT EXISTS idx_paiement_date_mode 
    ON {schema}.paiement(date_paiement DESC, mode_paiement) 
    WHERE statut = 'valide';
    
    -- 4.2 Index presence (rapports assiduité)
    RAISE NOTICE 'Index presence...';
    CREATE INDEX IF NOT EXISTS idx_presence_date_statut 
    ON {schema}.presence(date_seance, statut) 
    INCLUDE (etudiant_id);
    
    -- 4.3 Index note (bulletins)
    RAISE NOTICE 'Index note...';
    CREATE INDEX IF NOT EXISTS idx_note_session_etudiant 
    ON {schema}.note(session_id, etudiant_id) 
    INCLUDE (valeur, verrouille);
    
    RAISE NOTICE '✓ Partie 4 terminée avec succès';
END $$;

-- ============================================================================
-- PARTIE 5 : ANALYSE ET STATISTIQUES
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== PARTIE 5 : Mise à jour statistiques ===';
    
    -- Analyser les tables modifiées
    ANALYZE {schema}.diplome;
    ANALYZE {schema}.contrat_personnel;
    ANALYZE {schema}.depense;
    ANALYZE {schema}.calendrier_academique;
    ANALYZE {schema}.parcours;
    ANALYZE {schema}.paiement;
    ANALYZE {schema}.presence;
    ANALYZE {schema}.note;
    
    RAISE NOTICE '✓ Partie 5 terminée avec succès';
END $$;

-- ============================================================================
-- VÉRIFICATIONS POST-MIGRATION
-- ============================================================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    RAISE NOTICE '=== VÉRIFICATIONS POST-MIGRATION ===';
    
    -- Vérifier contrainte diplome
    SELECT COUNT(*) INTO v_count
    FROM pg_constraint 
    WHERE conname = 'diplome_statut_check'
    AND connamespace = '{schema}'::regnamespace;
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ Contrainte diplome_statut_check OK';
    ELSE
        RAISE WARNING '✗ Contrainte diplome_statut_check MANQUANTE';
    END IF;
    
    -- Vérifier colonnes diplome
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_schema = '{schema}'
    AND table_name = 'diplome'
    AND column_name = 'signe_president';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ Colonne signe_president OK';
    ELSE
        RAISE WARNING '✗ Colonne signe_president MANQUANTE';
    END IF;
    
    -- Vérifier index
    SELECT COUNT(*) INTO v_count
    FROM pg_indexes
    WHERE schemaname = '{schema}'
    AND indexname = 'idx_paiement_date_mode';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ Index idx_paiement_date_mode OK';
    ELSE
        RAISE WARNING '✗ Index idx_paiement_date_mode MANQUANT';
    END IF;
    
    RAISE NOTICE '=== FIN VÉRIFICATIONS ===';
END $$;

-- ============================================================================
-- FIN PHASE 1
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ✓ PHASE 1 TERMINÉE AVEC SUCCÈS                           ║';
    RAISE NOTICE '║                                                            ║';
    RAISE NOTICE '║  Actions réalisées:                                       ║';
    RAISE NOTICE '║  • Harmonisation contraintes statut diplôme               ║';
    RAISE NOTICE '║  • Ajout colonnes manquantes critiques                    ║';
    RAISE NOTICE '║  • Ajout clés étrangères                                  ║';
    RAISE NOTICE '║  • Création index prioritaires                            ║';
    RAISE NOTICE '║                                                            ║';
    RAISE NOTICE '║  Prochaine étape: Phase 2 (tenant-schema.sql)            ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- INSTRUCTIONS D'EXÉCUTION
-- ============================================================================

-- Pour appliquer à un tenant spécifique:
-- 1. Remplacer {schema} par le nom du tenant (ex: tenant_ispm)
-- 2. Exécuter: psql -d Imtech_SaaS -f phase1-fix-critical-issues.sql
--
-- Pour appliquer à tous les tenants:
-- 1. Utiliser le script apply-phase1-to-all-tenants.js
--
-- Exemple manuel:
-- sed 's/{schema}/tenant_ispm/g' phase1-fix-critical-issues.sql | psql -d Imtech_SaaS

-- Made with ❤️ by IBM Bob

-- Made with Bob
