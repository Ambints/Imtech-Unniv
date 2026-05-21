-- =============================================================================
-- SCRIPT: Assignation d'un secrétaire à un parcours
-- =============================================================================
-- Usage: Remplacer les variables et exécuter dans le schéma du tenant
-- =============================================================================

-- Variables à remplacer:
-- :parcours_id -> ID du parcours (ex: '6f304665-ae9d-4e18-adac-6ba54938c2a2')
-- :secretaire_id -> ID de l'utilisateur secrétaire

-- Vérifier le parcours actuel
SELECT 
    id, 
    code, 
    nom, 
    niveau, 
    secretaire_id as "secretaire actuel"
FROM parcours 
WHERE id = :parcours_id;

-- Assigner le secrétaire au parcours
UPDATE parcours 
SET secretaire_id = :secretaire_id
WHERE id = :parcours_id;

-- Vérifier la mise à jour
SELECT 
    p.id, 
    p.code, 
    p.nom, 
    p.niveau,
    p.secretaire_id,
    u.email as "email secretaire",
    u.nom as "nom secretaire",
    u.prenom as "prenom secretaire"
FROM parcours p
LEFT JOIN utilisateur u ON u.id = p.secretaire_id
WHERE p.id = :parcours_id;

-- Lister tous les parcours avec leur secrétaire
SELECT 
    p.id, 
    p.code, 
    p.nom, 
    p.niveau,
    p.secretaire_id,
    CASE 
        WHEN p.secretaire_id IS NULL THEN 'Non assigné'
        ELSE u.prenom || ' ' || u.nom || ' (' || u.email || ')'
    END as "secretaire"
FROM parcours p
LEFT JOIN utilisateur u ON u.id = p.secretaire_id
ORDER BY p.nom;
