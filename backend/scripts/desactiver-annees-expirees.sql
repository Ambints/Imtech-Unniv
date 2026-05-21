-- =============================================================================
-- Script de désactivation automatique des années académiques expirées
-- =============================================================================
-- Ce script désactive automatiquement toutes les années académiques dont la
-- date de fin est dépassée, pour tous les tenants.
-- 
-- Utilisation:
-- 1. Exécuter manuellement: psql -U postgres -d imtech_saas -f desactiver-annees-expirees.sql
-- 2. Automatiser avec cron (Linux/Mac):
--    0 2 * * * psql -U postgres -d imtech_saas -f /path/to/desactiver-annees-expirees.sql
-- 3. Automatiser avec Task Scheduler (Windows)
-- =============================================================================

DO $$
DECLARE
    tenant_record RECORD;
    annees_desactivees INTEGER := 0;
    total_annees INTEGER := 0;
BEGIN
    RAISE NOTICE 'Début de la désactivation des années académiques expirées...';
    RAISE NOTICE 'Date actuelle: %', CURRENT_DATE;
    RAISE NOTICE '';

    -- Parcourir tous les tenants actifs
    FOR tenant_record IN 
        SELECT id, name, schema_name 
        FROM public.tenant 
        WHERE active = true
        ORDER BY name
    LOOP
        RAISE NOTICE 'Traitement du tenant: % (schema: %)', tenant_record.name, tenant_record.schema_name;
        
        -- Désactiver les années expirées pour ce tenant
        EXECUTE format('
            UPDATE %I.annee_academique
            SET active = false
            WHERE date_fin < CURRENT_DATE
              AND active = true
            RETURNING id, libelle, date_fin
        ', tenant_record.schema_name)
        INTO STRICT annees_desactivees;
        
        IF annees_desactivees > 0 THEN
            RAISE NOTICE '  ✓ % année(s) académique(s) désactivée(s)', annees_desactivees;
            total_annees := total_annees + annees_desactivees;
        ELSE
            RAISE NOTICE '  ✓ Aucune année expirée à désactiver';
        END IF;
        
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'Résumé: % année(s) académique(s) désactivée(s) au total', total_annees;
    RAISE NOTICE '=============================================================================';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERREUR: %', SQLERRM;
        RAISE EXCEPTION 'Échec de la désactivation des années académiques';
END $$;

-- Afficher un rapport détaillé des années académiques par tenant
DO $$
DECLARE
    tenant_record RECORD;
    annee_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
    RAISE NOTICE 'RAPPORT DES ANNÉES ACADÉMIQUES PAR TENANT';
    RAISE NOTICE '=============================================================================';
    
    FOR tenant_record IN 
        SELECT id, name, schema_name 
        FROM public.tenant 
        WHERE active = true
        ORDER BY name
    LOOP
        RAISE NOTICE '';
        RAISE NOTICE 'Tenant: %', tenant_record.name;
        RAISE NOTICE '-----------------------------------------------------------------------------';
        
        FOR annee_record IN 
            EXECUTE format('
                SELECT 
                    libelle,
                    date_debut,
                    date_fin,
                    active,
                    CASE 
                        WHEN date_fin < CURRENT_DATE THEN ''Expirée''
                        WHEN date_debut > CURRENT_DATE THEN ''Future''
                        ELSE ''En cours''
                    END as statut
                FROM %I.annee_academique
                ORDER BY date_debut DESC
            ', tenant_record.schema_name)
        LOOP
            RAISE NOTICE '  % | % à % | Actif: % | Statut: %',
                annee_record.libelle,
                annee_record.date_debut,
                annee_record.date_fin,
                annee_record.active,
                annee_record.statut;
        END LOOP;
        
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=============================================================================';
END $$;

-- Made with Bob
