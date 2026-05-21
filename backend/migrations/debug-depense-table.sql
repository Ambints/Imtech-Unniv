-- Debug script to check depense table structure and data
-- Run this to understand what's causing the 500 error

SET search_path TO tenant_324746c0_67d0_4d87_b9d6_1af7d149599b, public;

-- 1. Show table structure
\echo '========================================='
\echo '1. DEPENSE TABLE STRUCTURE'
\echo '========================================='
\d depense

-- 2. Check if related tables exist
\echo ''
\echo '========================================='
\echo '2. RELATED TABLES CHECK'
\echo '========================================='

\echo 'Budget table:'
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'tenant_324746c0_67d0_4d87_b9d6_1af7d149599b'
    AND table_name = 'budget'
) as budget_exists;

\echo 'Utilisateur table:'
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'tenant_324746c0_67d0_4d87_b9d6_1af7d149599b'
    AND table_name = 'utilisateur'
) as utilisateur_exists;

\echo 'Annee_academique table:'
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'tenant_324746c0_67d0_4d87_b9d6_1af7d149599b'
    AND table_name = 'annee_academique'
) as annee_academique_exists;

-- 3. Check data counts
\echo ''
\echo '========================================='
\echo '3. DATA COUNTS'
\echo '========================================='

\echo 'Depenses count:'
SELECT COUNT(*) as nb_depenses FROM depense;

\echo 'Active annee_academique:'
SELECT id, libelle, active FROM annee_academique WHERE active = TRUE;

-- 4. Try the actual query from the service
\echo ''
\echo '========================================='
\echo '4. TEST ACTUAL QUERY (with LIMIT 1)'
\echo '========================================='

SELECT 
    d.id, d.libelle, d.montant, d.date_depense, d.fournisseur,
    d.numero_facture, d.statut, d.categorie, d.facture_url,
    d.observations, d.date_approbation,
    b.categorie as budget_categorie,
    u1.nom as demandeur, u2.nom as approbateur,
    aa.libelle as annee
FROM depense d
LEFT JOIN budget b ON d.budget_id = b.id
LEFT JOIN utilisateur u1 ON d.demande_par = u1.id
LEFT JOIN utilisateur u2 ON d.approuve_par = u2.id
JOIN annee_academique aa ON d.annee_academique_id = aa.id
WHERE aa.active = TRUE
ORDER BY d.date_depense DESC, d.created_at DESC
LIMIT 1;

-- 5. Check for NULL annee_academique_id
\echo ''
\echo '========================================='
\echo '5. CHECK FOR PROBLEMATIC DATA'
\echo '========================================='

\echo 'Depenses with NULL annee_academique_id:'
SELECT COUNT(*) FROM depense WHERE annee_academique_id IS NULL;

\echo 'Depenses with invalid annee_academique_id:'
SELECT COUNT(*) 
FROM depense d
WHERE NOT EXISTS (
    SELECT 1 FROM annee_academique aa WHERE aa.id = d.annee_academique_id
);

-- Made with Bob