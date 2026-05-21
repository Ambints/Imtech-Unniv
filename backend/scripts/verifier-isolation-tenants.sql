-- =============================================================================
-- Script de vérification de l'isolation des données entre tenants
-- =============================================================================
-- Ce script vérifie que chaque tenant a bien ses propres données isolées
-- =============================================================================

\echo '============================================================================='
\echo 'VÉRIFICATION DE L''ISOLATION DES DONNÉES ENTRE TENANTS'
\echo '============================================================================='
\echo ''

-- Vérifier les utilisateurs dans tenant_test
\echo '--- TENANT_TEST : Utilisateurs ---'
SELECT 
    COUNT(*) as total_utilisateurs,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN role = 'etudiant' THEN 1 END) as etudiants,
    COUNT(CASE WHEN role = 'enseignant' THEN 1 END) as enseignants
FROM tenant_test.utilisateur;

\echo ''
\echo 'Liste des utilisateurs dans tenant_test:'
SELECT id, nom, prenom, email, role, actif
FROM tenant_test.utilisateur
ORDER BY role, nom
LIMIT 10;

\echo ''
\echo '--- TENANT_ISPM : Utilisateurs ---'
SELECT 
    COUNT(*) as total_utilisateurs,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN role = 'etudiant' THEN 1 END) as etudiants,
    COUNT(CASE WHEN role = 'enseignant' THEN 1 END) as enseignants
FROM tenant_ispm.utilisateur;

\echo ''
\echo 'Liste des utilisateurs dans tenant_ispm:'
SELECT id, nom, prenom, email, role, actif
FROM tenant_ispm.utilisateur
ORDER BY role, nom
LIMIT 10;

\echo ''
\echo '============================================================================='
\echo 'VÉRIFICATION DES EMAILS UNIQUES PAR TENANT'
\echo '============================================================================='

\echo ''
\echo 'Emails en doublon entre tenant_test et tenant_ispm:'
SELECT 
    t1.email,
    'tenant_test' as tenant1,
    'tenant_ispm' as tenant2,
    t1.nom || ' ' || t1.prenom as utilisateur_test,
    t2.nom || ' ' || t2.prenom as utilisateur_ispm
FROM tenant_test.utilisateur t1
INNER JOIN tenant_ispm.utilisateur t2 ON t1.email = t2.email
ORDER BY t1.email;

\echo ''
\echo '============================================================================='
\echo 'VÉRIFICATION DES TABLES DANS PUBLIC (NE DEVRAIT PAS CONTENIR DE DONNÉES)'
\echo '============================================================================='

\echo ''
\echo 'Utilisateurs dans le schéma public (devrait être vide):'
SELECT COUNT(*) as count_public_users
FROM public.utilisateur
WHERE TRUE;

\echo ''
\echo 'Si count > 0, voici les utilisateurs dans public:'
SELECT id, nom, prenom, email, role
FROM public.utilisateur
LIMIT 10;

\echo ''
\echo '============================================================================='
\echo 'RÉSUMÉ DE L''ISOLATION'
\echo '============================================================================='

SELECT 
    'tenant_test' as tenant,
    (SELECT COUNT(*) FROM tenant_test.utilisateur) as utilisateurs,
    (SELECT COUNT(*) FROM tenant_test.etudiant) as etudiants,
    (SELECT COUNT(*) FROM tenant_test.parcours) as parcours,
    (SELECT COUNT(*) FROM tenant_test.departement) as departements
UNION ALL
SELECT 
    'tenant_ispm' as tenant,
    (SELECT COUNT(*) FROM tenant_ispm.utilisateur) as utilisateurs,
    (SELECT COUNT(*) FROM tenant_ispm.etudiant) as etudiants,
    (SELECT COUNT(*) FROM tenant_ispm.parcours) as parcours,
    (SELECT COUNT(*) FROM tenant_ispm.departement) as departements
UNION ALL
SELECT 
    'public (devrait être 0)' as tenant,
    (SELECT COUNT(*) FROM public.utilisateur WHERE TRUE) as utilisateurs,
    0 as etudiants,
    0 as parcours,
    0 as departements;

\echo ''
\echo '============================================================================='
\echo 'FIN DE LA VÉRIFICATION'
\echo '============================================================================='

-- Made with Bob
