-- =============================================================================
-- DIAGNOSTIC COMPLET - PROBLÈMES DE CRÉATION D'UTILISATEURS
-- =============================================================================

\echo '============================================='
\echo 'DIAGNOSTIC DES PROBLÈMES DE CRÉATION UTILISATEURS'
\echo '============================================='
\echo ''

-- =============================================================================
-- 1. VÉRIFIER LA TABLE SUPER_ADMIN
-- =============================================================================
\echo '1. STRUCTURE DE LA TABLE super_admin'
\echo '-------------------------------------'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'super_admin'
ORDER BY ordinal_position;

\echo ''
\echo '2. CONTENU DE LA TABLE super_admin'
\echo '-----------------------------------'
SELECT 
    id,
    email,
    nom,
    prenom,
    actif,
    password_reset_required,
    created_at,
    derniere_connexion
FROM public.super_admin
ORDER BY created_at DESC;

\echo ''
\echo '3. CONTRAINTES SUR super_admin'
\echo '-------------------------------'
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.super_admin'::regclass;

-- =============================================================================
-- 2. VÉRIFIER LES TABLES UTILISATEUR DANS LES TENANTS
-- =============================================================================
\echo ''
\echo '4. LISTE DES TENANTS ACTIFS'
\echo '----------------------------'
SELECT 
    id,
    nom,
    slug,
    schema_name,
    actif,
    created_at
FROM public.tenant
WHERE actif = true
ORDER BY created_at DESC;

\echo ''
\echo '5. STRUCTURE DE LA TABLE utilisateur (tenant_ispm)'
\echo '---------------------------------------------------'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'tenant_ispm' 
  AND table_name = 'utilisateur'
ORDER BY ordinal_position;

\echo ''
\echo '6. CONTRAINTES CHECK SUR utilisateur.role'
\echo '------------------------------------------'
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'tenant_ispm.utilisateur'::regclass
  AND contype = 'c';

\echo ''
\echo '7. STATISTIQUES DES UTILISATEURS PAR TENANT'
\echo '--------------------------------------------'
DO $$
DECLARE
    tenant_rec RECORD;
    user_count INTEGER;
    role_stats TEXT;
BEGIN
    FOR tenant_rec IN 
        SELECT id, nom, schema_name 
        FROM public.tenant 
        WHERE actif = true AND schema_name IS NOT NULL
    LOOP
        BEGIN
            -- Compter les utilisateurs
            EXECUTE format('SELECT COUNT(*) FROM %I.utilisateur', tenant_rec.schema_name)
            INTO user_count;
            
            -- Statistiques par rôle
            EXECUTE format('
                SELECT string_agg(role || '': '' || count, '', '')
                FROM (
                    SELECT role, COUNT(*)::text as count
                    FROM %I.utilisateur
                    GROUP BY role
                    ORDER BY role
                ) sub
            ', tenant_rec.schema_name)
            INTO role_stats;
            
            RAISE NOTICE 'Tenant: % (%) - Total: % utilisateurs - Rôles: %', 
                tenant_rec.nom, 
                tenant_rec.schema_name, 
                user_count,
                COALESCE(role_stats, 'aucun');
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erreur pour tenant %: %', tenant_rec.schema_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- =============================================================================
-- 3. VÉRIFIER LES PERMISSIONS ET GUARDS
-- =============================================================================
\echo ''
\echo '8. VÉRIFIER LES RÔLES VALIDES DANS LE SYSTÈME'
\echo '----------------------------------------------'
\echo 'Rôles autorisés dans la contrainte CHECK:'
\echo '  - president, resp_pedagogique, secretaire_parcours'
\echo '  - surveillant_general, scolarite, rh'
\echo '  - economat, caissier, communication'
\echo '  - logistique, entretien, admin'
\echo '  - etudiant, parent, enseignant'
\echo ''
\echo 'Rôle super_admin: Stocké dans public.super_admin (table séparée)'

-- =============================================================================
-- 4. TESTS DE CRÉATION
-- =============================================================================
\echo ''
\echo '9. TEST DE CRÉATION D''UN SUPER ADMIN'
\echo '--------------------------------------'
DO $$
DECLARE
    test_email TEXT := 'test_superadmin_' || floor(random() * 10000) || '@test.com';
    test_id UUID;
BEGIN
    -- Tenter de créer un super admin
    INSERT INTO public.super_admin (email, password_hash, nom, prenom, actif, password_reset_required)
    VALUES (test_email, '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'Test', 'SuperAdmin', true, true)
    RETURNING id INTO test_id;
    
    RAISE NOTICE '✅ Super admin créé avec succès: % (ID: %)', test_email, test_id;
    
    -- Nettoyer
    DELETE FROM public.super_admin WHERE id = test_id;
    RAISE NOTICE '🧹 Super admin de test supprimé';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erreur lors de la création du super admin: %', SQLERRM;
END $$;

\echo ''
\echo '10. TEST DE CRÉATION D''UN UTILISATEUR TENANT'
\echo '----------------------------------------------'
DO $$
DECLARE
    test_email TEXT := 'test_user_' || floor(random() * 10000) || '@test.com';
    test_id UUID;
    tenant_schema TEXT;
BEGIN
    -- Récupérer le premier tenant actif
    SELECT schema_name INTO tenant_schema
    FROM public.tenant
    WHERE actif = true AND schema_name IS NOT NULL
    LIMIT 1;
    
    IF tenant_schema IS NULL THEN
        RAISE NOTICE '⚠️  Aucun tenant actif trouvé pour le test';
        RETURN;
    END IF;
    
    -- Tenter de créer un utilisateur
    EXECUTE format('
        INSERT INTO %I.utilisateur (email, password_hash, nom, prenom, role, actif, email_verifie, password_reset_required)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
    ', tenant_schema)
    USING test_email, '$2b$12$LCKBXLvVkM1hEQq8OpGWu.KH2UV4PQDH843MA7NAK7IdUkX1DymFW', 'Test', 'User', 'admin', true, true, true
    INTO test_id;
    
    RAISE NOTICE '✅ Utilisateur créé avec succès dans %: % (ID: %)', tenant_schema, test_email, test_id;
    
    -- Nettoyer
    EXECUTE format('DELETE FROM %I.utilisateur WHERE id = $1', tenant_schema)
    USING test_id;
    RAISE NOTICE '🧹 Utilisateur de test supprimé';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erreur lors de la création de l''utilisateur: %', SQLERRM;
END $$;

-- =============================================================================
-- 5. VÉRIFIER LES COLONNES MANQUANTES
-- =============================================================================
\echo ''
\echo '11. VÉRIFIER LES COLONNES password_reset_required ET last_password_reset'
\echo '-------------------------------------------------------------------------'
DO $$
DECLARE
    tenant_rec RECORD;
    has_reset_required BOOLEAN;
    has_last_reset BOOLEAN;
BEGIN
    FOR tenant_rec IN 
        SELECT nom, schema_name 
        FROM public.tenant 
        WHERE actif = true AND schema_name IS NOT NULL
    LOOP
        -- Vérifier password_reset_required
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = tenant_rec.schema_name 
              AND table_name = 'utilisateur' 
              AND column_name = 'password_reset_required'
        ) INTO has_reset_required;
        
        -- Vérifier last_password_reset
        SELECT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = tenant_rec.schema_name 
              AND table_name = 'utilisateur' 
              AND column_name = 'last_password_reset'
        ) INTO has_last_reset;
        
        IF NOT has_reset_required OR NOT has_last_reset THEN
            RAISE NOTICE '⚠️  Tenant %: password_reset_required=%, last_password_reset=%', 
                tenant_rec.nom, has_reset_required, has_last_reset;
        ELSE
            RAISE NOTICE '✅ Tenant %: Toutes les colonnes présentes', tenant_rec.nom;
        END IF;
    END LOOP;
END $$;

\echo ''
\echo '============================================='
\echo 'FIN DU DIAGNOSTIC'
\echo '============================================='

-- Made with Bob
