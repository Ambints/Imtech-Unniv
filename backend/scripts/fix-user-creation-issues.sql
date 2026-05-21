-- =============================================================================
-- CORRECTION DES PROBLÈMES DE CRÉATION D'UTILISATEURS
-- =============================================================================

\echo '============================================='
\echo 'CORRECTION DES PROBLÈMES DE CRÉATION UTILISATEURS'
\echo '============================================='
\echo ''

-- =============================================================================
-- 1. VÉRIFIER ET CRÉER LA TABLE super_admin SI NÉCESSAIRE
-- =============================================================================
\echo '1. Vérification de la table super_admin'
\echo '----------------------------------------'

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'super_admin'
    ) THEN
        CREATE TABLE public.super_admin (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            nom VARCHAR(100) NOT NULL,
            prenom VARCHAR(100) NOT NULL,
            actif BOOLEAN DEFAULT true,
            derniere_connexion TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            password_reset_required BOOLEAN DEFAULT false,
            last_password_reset TIMESTAMPTZ
        );
        RAISE NOTICE '✅ Table super_admin créée';
    ELSE
        RAISE NOTICE '✅ Table super_admin existe déjà';
    END IF;
END $$;

-- Vérifier les colonnes manquantes dans super_admin
DO $$
BEGIN
    -- Ajouter password_reset_required si manquante
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'super_admin' 
          AND column_name = 'password_reset_required'
    ) THEN
        ALTER TABLE public.super_admin 
        ADD COLUMN password_reset_required BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ Colonne password_reset_required ajoutée à super_admin';
    END IF;
    
    -- Ajouter last_password_reset si manquante
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'super_admin' 
          AND column_name = 'last_password_reset'
    ) THEN
        ALTER TABLE public.super_admin 
        ADD COLUMN last_password_reset TIMESTAMPTZ;
        RAISE NOTICE '✅ Colonne last_password_reset ajoutée à super_admin';
    END IF;
END $$;

-- =============================================================================
-- 2. AJOUTER LES COLONNES MANQUANTES AUX SCHÉMAS TENANT
-- =============================================================================
\echo ''
\echo '2. Ajout des colonnes password_reset aux schémas tenant'
\echo '--------------------------------------------------------'

DO $$
DECLARE
    tenant_rec RECORD;
    col_added BOOLEAN := false;
BEGIN
    FOR tenant_rec IN 
        SELECT id, nom, schema_name 
        FROM public.tenant 
        WHERE actif = true AND schema_name IS NOT NULL
    LOOP
        col_added := false;
        
        BEGIN
            -- Vérifier si la table utilisateur existe
            IF EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = tenant_rec.schema_name 
                  AND table_name = 'utilisateur'
            ) THEN
                -- Ajouter password_reset_required si manquante
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = tenant_rec.schema_name 
                      AND table_name = 'utilisateur' 
                      AND column_name = 'password_reset_required'
                ) THEN
                    EXECUTE format('
                        ALTER TABLE %I.utilisateur 
                        ADD COLUMN password_reset_required BOOLEAN DEFAULT false
                    ', tenant_rec.schema_name);
                    RAISE NOTICE '  ✅ % - Ajouté password_reset_required', tenant_rec.nom;
                    col_added := true;
                END IF;
                
                -- Ajouter last_password_reset si manquante
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = tenant_rec.schema_name 
                      AND table_name = 'utilisateur' 
                      AND column_name = 'last_password_reset'
                ) THEN
                    EXECUTE format('
                        ALTER TABLE %I.utilisateur 
                        ADD COLUMN last_password_reset TIMESTAMPTZ
                    ', tenant_rec.schema_name);
                    RAISE NOTICE '  ✅ % - Ajouté last_password_reset', tenant_rec.nom;
                    col_added := true;
                END IF;
                
                IF NOT col_added THEN
                    RAISE NOTICE '  ✅ % - Toutes les colonnes présentes', tenant_rec.nom;
                END IF;
            ELSE
                RAISE NOTICE '  ⚠️  % - Table utilisateur n''existe pas', tenant_rec.nom;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '  ❌ % - Erreur: %', tenant_rec.nom, SQLERRM;
        END;
    END LOOP;
END $$;

-- =============================================================================
-- 3. VÉRIFIER LES CONTRAINTES CHECK SUR LE RÔLE
-- =============================================================================
\echo ''
\echo '3. Vérification des contraintes CHECK sur utilisateur.role'
\echo '-----------------------------------------------------------'

DO $$
DECLARE
    tenant_rec RECORD;
    constraint_def TEXT;
BEGIN
    FOR tenant_rec IN 
        SELECT nom, schema_name 
        FROM public.tenant 
        WHERE actif = true AND schema_name IS NOT NULL
    LOOP
        BEGIN
            -- Récupérer la définition de la contrainte CHECK sur role
            SELECT pg_get_constraintdef(oid) INTO constraint_def
            FROM pg_constraint
            WHERE conrelid = (tenant_rec.schema_name || '.utilisateur')::regclass
              AND contype = 'c'
              AND conname LIKE '%role%'
            LIMIT 1;
            
            IF constraint_def IS NOT NULL THEN
                -- Vérifier si 'admin' est dans la liste
                IF constraint_def LIKE '%admin%' THEN
                    RAISE NOTICE '  ✅ % - Contrainte role correcte', tenant_rec.nom;
                ELSE
                    RAISE NOTICE '  ⚠️  % - Contrainte role ne contient pas ''admin''', tenant_rec.nom;
                END IF;
            ELSE
                RAISE NOTICE '  ⚠️  % - Aucune contrainte CHECK sur role', tenant_rec.nom;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '  ⚠️  % - Impossible de vérifier la contrainte', tenant_rec.nom;
        END;
    END LOOP;
END $$;

-- =============================================================================
-- 4. CRÉER UN INDEX SUR email POUR AMÉLIORER LES PERFORMANCES
-- =============================================================================
\echo ''
\echo '4. Création d''index sur email pour les performances'
\echo '-----------------------------------------------------'

DO $$
DECLARE
    tenant_rec RECORD;
BEGIN
    FOR tenant_rec IN 
        SELECT nom, schema_name 
        FROM public.tenant 
        WHERE actif = true AND schema_name IS NOT NULL
    LOOP
        BEGIN
            -- Créer un index sur email si il n'existe pas
            IF NOT EXISTS (
                SELECT 1 FROM pg_indexes 
                WHERE schemaname = tenant_rec.schema_name 
                  AND tablename = 'utilisateur' 
                  AND indexname = 'idx_utilisateur_email'
            ) THEN
                EXECUTE format('
                    CREATE INDEX idx_utilisateur_email 
                    ON %I.utilisateur(email)
                ', tenant_rec.schema_name);
                RAISE NOTICE '  ✅ % - Index créé sur email', tenant_rec.nom;
            ELSE
                RAISE NOTICE '  ✅ % - Index existe déjà', tenant_rec.nom;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '  ❌ % - Erreur: %', tenant_rec.nom, SQLERRM;
        END;
    END LOOP;
END $$;

-- =============================================================================
-- 5. STATISTIQUES FINALES
-- =============================================================================
\echo ''
\echo '5. Statistiques finales'
\echo '-----------------------'

DO $$
DECLARE
    tenant_count INTEGER;
    superadmin_count INTEGER;
    total_users INTEGER := 0;
    tenant_rec RECORD;
    user_count INTEGER;
BEGIN
    -- Compter les tenants
    SELECT COUNT(*) INTO tenant_count
    FROM public.tenant
    WHERE actif = true;
    
    -- Compter les super admins
    SELECT COUNT(*) INTO superadmin_count
    FROM public.super_admin;
    
    -- Compter les utilisateurs par tenant
    FOR tenant_rec IN 
        SELECT nom, schema_name 
        FROM public.tenant 
        WHERE actif = true AND schema_name IS NOT NULL
    LOOP
        BEGIN
            EXECUTE format('SELECT COUNT(*) FROM %I.utilisateur', tenant_rec.schema_name)
            INTO user_count;
            total_users := total_users + user_count;
        EXCEPTION WHEN OTHERS THEN
            -- Ignorer les erreurs
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 Statistiques:';
    RAISE NOTICE '  - Tenants actifs: %', tenant_count;
    RAISE NOTICE '  - Super admins: %', superadmin_count;
    RAISE NOTICE '  - Utilisateurs tenant: %', total_users;
    RAISE NOTICE '  - Total utilisateurs: %', superadmin_count + total_users;
END $$;

\echo ''
\echo '============================================='
\echo 'CORRECTIONS TERMINÉES'
\echo '============================================='
\echo ''
\echo 'Prochaines étapes:'
\echo '1. Redémarrer le backend NestJS'
\echo '2. Tester la création d''un super admin'
\echo '3. Tester la création d''utilisateurs tenant'
\echo '4. Vérifier les filtres dans l''interface'

-- Made with Bob
