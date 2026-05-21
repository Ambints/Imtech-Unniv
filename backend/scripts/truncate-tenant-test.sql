-- =============================================================================
-- SCRIPT DE VIDAGE COMPLET DU SCHÉMA TENANT_TEST
-- ATTENTION: Ce script supprime TOUTES les données du schéma tenant_test
-- =============================================================================

SET search_path TO tenant_test, public;

-- Désactiver temporairement les contraintes de clés étrangères
SET session_replication_role = 'replica';

DO $$
DECLARE
    r RECORD;
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'DÉBUT DU VIDAGE DU SCHÉMA tenant_test';
    RAISE NOTICE '=============================================';
    
    -- Vider toutes les tables du schéma tenant_test
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'tenant_test'
        AND tablename NOT IN ('niveau_etude')  -- Garder les données de référence
        ORDER BY tablename
    ) LOOP
        EXECUTE 'TRUNCATE TABLE tenant_test.' || quote_ident(r.tablename) || ' CASCADE';
        RAISE NOTICE 'Table vidée: %', r.tablename;
    END LOOP;
    
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'VIDAGE TERMINÉ';
    RAISE NOTICE '=============================================';
END $$;

-- Réactiver les contraintes de clés étrangères
SET session_replication_role = 'origin';

-- Vérification: Compter les enregistrements restants
DO $$
DECLARE
    r RECORD;
    total_count INTEGER := 0;
    table_count INTEGER;
BEGIN
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'VÉRIFICATION DES TABLES';
    RAISE NOTICE '=============================================';
    
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'tenant_test'
        ORDER BY tablename
    ) LOOP
        EXECUTE 'SELECT COUNT(*) FROM tenant_test.' || quote_ident(r.tablename) INTO table_count;
        IF table_count > 0 THEN
            RAISE NOTICE 'Table %: % enregistrements', r.tablename, table_count;
            total_count := total_count + table_count;
        END IF;
    END LOOP;
    
    RAISE NOTICE '=============================================';
    RAISE NOTICE 'Total enregistrements restants: %', total_count;
    RAISE NOTICE '=============================================';
END $$;

-- Made with Bob
