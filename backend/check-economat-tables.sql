-- Script pour vérifier l'existence des tables Économat dans le schéma tenant
-- Exécuter avec: psql -U postgres -d imtech_university -f check-economat-tables.sql

\echo '========================================='
\echo 'Vérification des tables Économat'
\echo '========================================='
\echo ''

-- Définir le schéma tenant
SET search_path TO tenant_test, public;

\echo 'Schéma actuel:'
SELECT current_schema();
\echo ''

\echo '1. Table BUDGET:'
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'tenant_test' 
    AND table_name = 'budget'
) as budget_exists;

\echo ''
\echo '2. Table DEPENSE:'
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'tenant_test' 
    AND table_name = 'depense'
) as depense_exists;

\echo ''
\echo '3. Table PAIEMENT:'
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'tenant_test' 
    AND table_name = 'paiement'
) as paiement_exists;

\echo ''
\echo '4. Table ECHEANCIER:'
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'tenant_test' 
    AND table_name = 'echeancier'
) as echeancier_exists;

\echo ''
\echo '5. Table GRILLE_TARIFAIRE:'
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'tenant_test' 
    AND table_name = 'grille_tarifaire'
) as grille_tarifaire_exists;

\echo ''
\echo '6. Table INSCRIPTION:'
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'tenant_test' 
    AND table_name = 'inscription'
) as inscription_exists;

\echo ''
\echo '7. Table DEPARTEMENT:'
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'tenant_test' 
    AND table_name = 'departement'
) as departement_exists;

\echo ''
\echo '8. Table ANNEE_ACADEMIQUE:'
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'tenant_test' 
    AND table_name = 'annee_academique'
) as annee_academique_exists;

\echo ''
\echo '========================================='
\echo 'Résumé des tables dans tenant_test:'
\echo '========================================='
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'tenant_test' 
AND table_name IN ('budget', 'depense', 'paiement', 'echeancier', 'grille_tarifaire', 'inscription', 'departement', 'annee_academique')
ORDER BY table_name;

\echo ''
\echo '========================================='
\echo 'Comptage des données:'
\echo '========================================='

\echo 'Budget:'
SELECT COUNT(*) as nb_budgets FROM budget;

\echo 'Dépenses:'
SELECT COUNT(*) as nb_depenses FROM depense;

\echo 'Paiements:'
SELECT COUNT(*) as nb_paiements FROM paiement;

\echo 'Inscriptions:'
SELECT COUNT(*) as nb_inscriptions FROM inscription;

\echo 'Départements:'
SELECT COUNT(*) as nb_departements FROM departement;

\echo 'Années académiques:'
SELECT COUNT(*) as nb_annees FROM annee_academique;

\echo ''
\echo '========================================='
\echo 'Fin de la vérification'
\echo '========================================='

-- Made with Bob
