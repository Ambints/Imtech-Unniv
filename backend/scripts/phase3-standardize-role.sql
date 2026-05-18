-- ============================================================================
-- PHASE 3 : STANDARDISATION RÔLE + MIGRATION DONNÉES
-- ============================================================================
-- Date: 2026-05-18
-- Durée estimée: 3 heures
-- Impact: MODÉRÉ - Standardise 'enseignant' vs 'professeur'
-- ============================================================================

-- Ce script standardise le rôle 'professeur' en 'enseignant' partout
-- Remplacer {schema} par le nom du schéma tenant

-- ============================================================================
-- PARTIE 1 : MISE À JOUR CONTRAINTE UTILISATEUR.ROLE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== PARTIE 1 : Mise à jour contrainte role ===';
    
    -- Supprimer l'ancienne contrainte
    ALTER TABLE {schema}.utilisateur 
    DROP CONSTRAINT IF EXISTS utilisateur_role_check;
    
    -- Ajouter la nouvelle contrainte (avec 'enseignant')
    ALTER TABLE {schema}.utilisateur 
    ADD CONSTRAINT utilisateur_role_check 
    CHECK (role IN (
        'president', 'resp_pedagogique', 'secretaire_parcours',
        'surveillant_general', 'scolarite', 'rh',
        'economat', 'caissier', 'communication',
        'logistique', 'entretien', 'admin',
        'etudiant', 'parent', 'enseignant'  -- ✅ Standardisé
    ));
    
    RAISE NOTICE '✓ Contrainte utilisateur.role mise à jour';
END $$;

-- ============================================================================
-- PARTIE 2 : MIGRATION DONNÉES UTILISATEUR
-- ============================================================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    RAISE NOTICE '=== PARTIE 2 : Migration données utilisateur ===';
    
    -- Compter les utilisateurs avec rôle 'professeur'
    SELECT COUNT(*) INTO v_count
    FROM {schema}.utilisateur 
    WHERE role = 'professeur';
    
    RAISE NOTICE 'Utilisateurs avec rôle "professeur": %', v_count;
    
    -- Mettre à jour vers 'enseignant'
    IF v_count > 0 THEN
        UPDATE {schema}.utilisateur 
        SET role = 'enseignant' 
        WHERE role = 'professeur';
        
        RAISE NOTICE '✓ % utilisateur(s) migré(s) vers "enseignant"', v_count;
    ELSE
        RAISE NOTICE '✓ Aucune migration nécessaire';
    END IF;
END $$;

-- ============================================================================
-- PARTIE 3 : MISE À JOUR CONTRAINTE ANNONCE.CIBLE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== PARTIE 3 : Mise à jour contrainte annonce.cible ===';
    
    -- Vérifier si la table annonce existe
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = '{schema}' 
        AND table_name = 'annonce'
    ) THEN
        -- Supprimer l'ancienne contrainte
        ALTER TABLE {schema}.annonce 
        DROP CONSTRAINT IF EXISTS annonce_cible_check;
        
        -- Ajouter la nouvelle contrainte (avec 'enseignants')
        ALTER TABLE {schema}.annonce 
        ADD CONSTRAINT annonce_cible_check 
        CHECK (cible IN ('tous', 'etudiants', 'parents', 'enseignants', 'personnel', 'parcours'));
        
        RAISE NOTICE '✓ Contrainte annonce.cible mise à jour';
    ELSE
        RAISE NOTICE '⚠ Table annonce n''existe pas';
    END IF;
END $$;

-- ============================================================================
-- PARTIE 4 : MIGRATION DONNÉES ANNONCE
-- ============================================================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    RAISE NOTICE '=== PARTIE 4 : Migration données annonce ===';
    
    -- Vérifier si la table annonce existe
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = '{schema}' 
        AND table_name = 'annonce'
    ) THEN
        -- Compter les annonces avec cible 'professeurs'
        EXECUTE format('SELECT COUNT(*) FROM %I.annonce WHERE cible = $1', '{schema}')
        INTO v_count
        USING 'professeurs';
        
        RAISE NOTICE 'Annonces avec cible "professeurs": %', v_count;
        
        -- Mettre à jour vers 'enseignants'
        IF v_count > 0 THEN
            EXECUTE format('UPDATE %I.annonce SET cible = $1 WHERE cible = $2', '{schema}')
            USING 'enseignants', 'professeurs';
            
            RAISE NOTICE '✓ % annonce(s) migrée(s) vers "enseignants"', v_count;
        ELSE
            RAISE NOTICE '✓ Aucune migration nécessaire';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- PARTIE 5 : MISE À JOUR VUE VUE_KPI_PRESIDENT
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '=== PARTIE 5 : Mise à jour vue_kpi_president ===';
    
    -- Recréer la vue avec 'enseignant'
    DROP VIEW IF EXISTS {schema}.vue_kpi_president;
    
    CREATE VIEW {schema}.vue_kpi_president AS
    SELECT
        (SELECT COUNT(*) FROM {schema}.etudiant WHERE actif = TRUE) AS total_etudiants,
        (SELECT COUNT(*) FROM {schema}.inscription i
         JOIN {schema}.annee_academique aa ON aa.id = i.annee_academique_id
         WHERE aa.active = TRUE AND i.statut = 'validee') AS etudiants_inscrits_annee,
        (SELECT COUNT(*) FROM {schema}.utilisateur 
         WHERE role = 'enseignant' AND actif = TRUE) AS total_enseignants,  -- ✅ Corrigé
        (SELECT COUNT(*) FROM {schema}.utilisateur 
         WHERE role NOT IN ('etudiant', 'parent', 'enseignant') AND actif = TRUE) AS total_personnel,
        (SELECT COALESCE(SUM(p.montant), 0)
         FROM {schema}.paiement p
         JOIN {schema}.inscription i ON p.inscription_id = i.id
         JOIN {schema}.annee_academique aa ON aa.id = i.annee_academique_id
         WHERE aa.active = TRUE AND p.statut = 'valide') AS recettes_annee,
        (SELECT COALESCE(SUM(montant), 0)
         FROM {schema}.depense WHERE statut = 'paye'
         AND date_depense >= DATE_TRUNC('month', NOW())) AS depenses_mois,
        (SELECT COUNT(*) FROM {schema}.ticket_maintenance 
         WHERE statut IN ('ouvert', 'en_cours')) AS tickets_maintenance_ouverts,
        (SELECT COUNT(*) FROM {schema}.stock 
         WHERE quantite_stock <= seuil_alerte) AS alertes_stock;
    
    RAISE NOTICE '✓ Vue vue_kpi_president recréée';
END $$;

-- ============================================================================
-- PARTIE 6 : MISE À JOUR PERMISSIONS PORTAIL
-- ============================================================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    RAISE NOTICE '=== PARTIE 6 : Mise à jour permissions portail ===';
    
    -- Vérifier si la table permissions_portail existe
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = '{schema}' 
        AND table_name = 'permissions_portail'
    ) THEN
        -- Compter les permissions avec type_portail 'professeur'
        EXECUTE format('SELECT COUNT(*) FROM %I.permissions_portail WHERE type_portail = $1', '{schema}')
        INTO v_count
        USING 'professeur';
        
        RAISE NOTICE 'Permissions avec type_portail "professeur": %', v_count;
        
        -- Mettre à jour vers 'enseignant'
        IF v_count > 0 THEN
            EXECUTE format('UPDATE %I.permissions_portail SET type_portail = $1 WHERE type_portail = $2', '{schema}')
            USING 'enseignant', 'professeur';
            
            RAISE NOTICE '✓ % permission(s) migrée(s) vers "enseignant"', v_count;
        ELSE
            RAISE NOTICE '✓ Aucune migration nécessaire';
        END IF;
        
        -- Mettre à jour la contrainte
        ALTER TABLE {schema}.permissions_portail 
        DROP CONSTRAINT IF EXISTS permissions_portail_type_portail_check;
        
        ALTER TABLE {schema}.permissions_portail 
        ADD CONSTRAINT permissions_portail_type_portail_check 
        CHECK (type_portail IN ('etudiant', 'parent', 'enseignant'));
        
        RAISE NOTICE '✓ Contrainte permissions_portail.type_portail mise à jour';
    ELSE
        RAISE NOTICE '⚠ Table permissions_portail n''existe pas';
    END IF;
END $$;

-- ============================================================================
-- PARTIE 7 : VÉRIFICATIONS POST-MIGRATION
-- ============================================================================

DO $$
DECLARE
    v_count INTEGER;
BEGIN
    RAISE NOTICE '=== PARTIE 7 : Vérifications ===';
    
    -- Vérifier qu'il ne reste plus de 'professeur'
    SELECT COUNT(*) INTO v_count
    FROM {schema}.utilisateur 
    WHERE role = 'professeur';
    
    IF v_count = 0 THEN
        RAISE NOTICE '✓ Aucun utilisateur avec rôle "professeur"';
    ELSE
        RAISE WARNING '✗ Il reste % utilisateur(s) avec rôle "professeur"', v_count;
    END IF;
    
    -- Vérifier les enseignants
    SELECT COUNT(*) INTO v_count
    FROM {schema}.utilisateur 
    WHERE role = 'enseignant';
    
    RAISE NOTICE '✓ Total enseignants: %', v_count;
    
    -- Vérifier les annonces
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = '{schema}' 
        AND table_name = 'annonce'
    ) THEN
        EXECUTE format('SELECT COUNT(*) FROM %I.annonce WHERE cible = $1', '{schema}')
        INTO v_count
        USING 'professeurs';
        
        IF v_count = 0 THEN
            RAISE NOTICE '✓ Aucune annonce avec cible "professeurs"';
        ELSE
            RAISE WARNING '✗ Il reste % annonce(s) avec cible "professeurs"', v_count;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- FIN PHASE 3
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ✓ PHASE 3 TERMINÉE AVEC SUCCÈS                           ║';
    RAISE NOTICE '║                                                            ║';
    RAISE NOTICE '║  Actions réalisées:                                       ║';
    RAISE NOTICE '║  • Standardisation rôle "enseignant"                      ║';
    RAISE NOTICE '║  • Migration données utilisateurs                         ║';
    RAISE NOTICE '║  • Mise à jour contraintes et vues                        ║';
    RAISE NOTICE '║                                                            ║';
    RAISE NOTICE '║  Prochaine étape: Phase 4 (Déploiement)                  ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
END $$;

-- Made with ❤️ by IBM Bob

-- Made with Bob
