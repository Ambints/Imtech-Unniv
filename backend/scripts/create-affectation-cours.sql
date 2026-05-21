-- Script pour créer une affectation de cours (UE) à un enseignant
-- Cela permettra de voir les cours dans "Mes Cours" du portail enseignant

-- ============================================
-- ÉTAPE 1: Vérifier les données existantes
-- ============================================

-- 1.1 Trouver votre enseignant
SELECT 
    e.id as enseignant_id,
    e.nom,
    e.prenom,
    u.email,
    u.role
FROM tenant_test.enseignant e
JOIN tenant_test.utilisateur u ON u.id = e.utilisateur_id
WHERE u.actif = TRUE
ORDER BY e.nom, e.prenom;

-- 1.2 Lister toutes les UE (Unités d'Enseignement = Cours)
SELECT 
    ue.id as ue_id,
    ue.code,
    ue.intitule,
    ue.credits_ects,
    ue.semestre,
    ue.annee_niveau,
    p.nom as parcours_nom,
    p.code as parcours_code
FROM tenant_test.unite_enseignement ue
LEFT JOIN tenant_test.parcours p ON p.id = ue.parcours_id
WHERE ue.actif = TRUE
ORDER BY ue.code;

-- 1.3 Trouver l'année académique active
SELECT 
    id as annee_academique_id,
    libelle,
    date_debut,
    date_fin,
    active
FROM tenant_test.annee_academique
WHERE active = TRUE;

-- 1.4 Vérifier les affectations existantes
SELECT 
    ac.id,
    e.nom || ' ' || e.prenom as enseignant,
    ue.code || ' - ' || ue.intitule as cours,
    ac.type_seance,
    ac.volume_prevu,
    ac.volume_realise,
    aa.libelle as annee
FROM tenant_test.affectation_cours ac
JOIN tenant_test.enseignant e ON e.id = ac.enseignant_id
JOIN tenant_test.unite_enseignement ue ON ue.id = ac.ue_id
JOIN tenant_test.annee_academique aa ON aa.id = ac.annee_academique_id
ORDER BY e.nom, ue.code;

-- ============================================
-- ÉTAPE 2: Créer une affectation
-- ============================================

-- IMPORTANT: Remplacez les valeurs ci-dessous avec les IDs trouvés à l'étape 1

-- Exemple d'insertion (MODIFIER LES VALEURS):
/*
INSERT INTO tenant_test.affectation_cours (
    enseignant_id,
    ue_id,
    annee_academique_id,
    type_seance,
    volume_prevu,
    volume_realise,
    created_at
) VALUES (
    'REMPLACER_PAR_ID_ENSEIGNANT',  -- ID de l'enseignant (étape 1.1)
    'REMPLACER_PAR_ID_UE',           -- ID de l'UE (étape 1.2)
    'REMPLACER_PAR_ID_ANNEE',        -- ID de l'année académique (étape 1.3)
    'CM',                             -- Type: 'CM', 'TD' ou 'TP'
    30,                               -- Volume prévu en heures
    0,                                -- Volume réalisé (commence à 0)
    NOW()
);
*/

-- ============================================
-- ÉTAPE 3: Vérifier que l'affectation a été créée
-- ============================================

-- Relancer la requête 1.4 pour voir la nouvelle affectation

-- ============================================
-- EXEMPLE COMPLET (si vous avez les IDs)
-- ============================================

-- Si par exemple:
-- - enseignant_id = 'abc123...'
-- - ue_id = 'def456...'
-- - annee_academique_id = 'ghi789...'

-- Alors la commande serait:
/*
INSERT INTO tenant_test.affectation_cours (
    enseignant_id,
    ue_id,
    annee_academique_id,
    type_seance,
    volume_prevu,
    volume_realise,
    created_at
) VALUES (
    'abc123...',
    'def456...',
    'ghi789...',
    'CM',
    30,
    0,
    NOW()
);
*/

-- ============================================
-- NOTES IMPORTANTES
-- ============================================

-- 1. Une affectation lie un ENSEIGNANT à une UE pour une ANNÉE ACADÉMIQUE donnée
-- 2. Le type_seance peut être:
--    - 'CM' = Cours Magistral
--    - 'TD' = Travaux Dirigés
--    - 'TP' = Travaux Pratiques
-- 3. Un même enseignant peut avoir plusieurs affectations pour la même UE
--    (par exemple: CM + TD pour le même cours)
-- 4. Le volume_prevu est en heures
-- 5. Le volume_realise sera mis à jour au fur et à mesure des séances

-- ============================================
-- DÉPANNAGE
-- ============================================

-- Si "Mes Cours" est toujours vide après création:
-- 1. Vérifiez que l'utilisateur connecté correspond bien à l'enseignant
-- 2. Vérifiez que l'année académique est active
-- 3. Vérifiez les logs du backend pour voir s'il y a des erreurs
-- 4. Rafraîchissez la page du portail enseignant

-- Made with Bob
