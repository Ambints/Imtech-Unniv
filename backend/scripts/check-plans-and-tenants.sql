-- Script de diagnostic pour vérifier les plans et les tenants

-- 1. Vérifier si la table plan_abonnement existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'plan_abonnement'
        ) 
        THEN '✓ Table plan_abonnement existe'
        ELSE '✗ Table plan_abonnement N''EXISTE PAS - Exécutez create-plan-table.sql'
    END as status_table;

-- 2. Si la table existe, afficher les plans disponibles
SELECT 
    '=== PLANS DISPONIBLES ===' as section,
    nom,
    prix_mensuel,
    max_utilisateurs,
    max_etudiants,
    actif
FROM public.plan_abonnement
WHERE EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'plan_abonnement'
);

-- 3. Afficher les tenants et leurs plans
SELECT 
    '=== TENANTS ET LEURS PLANS ===' as section,
    nom as tenant_name,
    slug,
    plan_abonnement,
    max_utilisateurs,
    actif
FROM public.tenant
ORDER BY created_at DESC;

-- 4. Vérifier si le tenant "test" a des étudiants
SELECT 
    '=== ÉTUDIANTS DANS TENANT_TEST ===' as section,
    COUNT(*) as nombre_etudiants,
    COUNT(*) FILTER (WHERE actif = true) as etudiants_actifs
FROM tenant_test.etudiant
WHERE EXISTS (
    SELECT FROM information_schema.schemata 
    WHERE schema_name = 'tenant_test'
);

-- 5. Recommandations
SELECT 
    '=== RECOMMANDATIONS ===' as section,
    CASE 
        WHEN NOT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'plan_abonnement'
        )
        THEN 'URGENT: Exécutez le script create-plan-table.sql'
        WHEN (SELECT COUNT(*) FROM public.plan_abonnement) = 0
        THEN 'URGENT: La table plan_abonnement est vide, réexécutez create-plan-table.sql'
        WHEN (SELECT plan_abonnement FROM public.tenant WHERE slug = 'test') IS NULL
        THEN 'Mettez à jour le plan du tenant test: UPDATE public.tenant SET plan_abonnement = ''basic'' WHERE slug = ''test'';'
        ELSE 'Tout semble OK - Redémarrez le backend'
    END as action_requise;

-- Made with Bob
