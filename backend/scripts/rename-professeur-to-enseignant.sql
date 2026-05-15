-- ============================================================================
-- MIGRATION: Renommer 'professeur' en 'enseignant' partout
-- OBJECTIF: Standardiser la terminologie dans toute l'application
-- ============================================================================

-- 1. Mettre à jour le rôle dans la table utilisateur
UPDATE utilisateur 
SET role = 'enseignant' 
WHERE role = 'professeur';

-- 2. Vérifier le résultat
SELECT role, COUNT(*) as count 
FROM utilisateur 
WHERE role = 'enseignant'
GROUP BY role;

-- Note: Les autres occurrences sont dans le code frontend/backend
-- et seront mises à jour séparément

-- Made with Bob
