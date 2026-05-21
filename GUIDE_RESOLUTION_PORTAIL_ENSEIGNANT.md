# Guide de Résolution - Portail Enseignant Vide

## 🔴 Problème Actuel

Le portail enseignant affiche "0 Mes Cours" et génère des erreurs 500 sur les endpoints:
- `/api/v1/portail/enseignant/mes-cours` → 500
- `/api/v1/portail/enseignant/mes-stats` → 500
- `/api/v1/portail/enseignant/sessions-evaluation` → 500

## 🔍 Diagnostic

### Cause Principale
Les erreurs 500 indiquent que le backend ne peut pas récupérer les données. Cela peut être dû à:

1. **Pas d'enregistrement enseignant** pour l'utilisateur connecté
2. **Pas d'affectation de cours** (table `affectation_cours` vide)
3. **Tables manquantes** dans le schéma tenant

## ✅ Solution Étape par Étape

### Étape 1: Vérifier que l'enseignant existe

```sql
-- Connectez-vous à votre base de données et exécutez:
SELECT 
    u.id as utilisateur_id,
    u.email,
    u.nom as user_nom,
    u.prenom as user_prenom,
    u.role,
    e.id as enseignant_id,
    e.nom as ens_nom,
    e.prenom as ens_prenom,
    e.actif
FROM tenant_test.utilisateur u
LEFT JOIN tenant_test.enseignant e ON e.utilisateur_id = u.id
WHERE u.email = 'VOTRE_EMAIL@example.com';  -- Remplacer par votre email
```

**Résultat attendu:**
- Si `enseignant_id` est NULL → **Problème: l'enseignant n'existe pas**
- Si `enseignant_id` existe → Passez à l'étape 2

**Si l'enseignant n'existe pas, créez-le:**
```sql
INSERT INTO tenant_test.enseignant (
    utilisateur_id,
    nom,
    prenom,
    matricule,
    statut,
    actif,
    created_at
)
SELECT 
    id,
    nom,
    prenom,
    'ENS' || LPAD(NEXTVAL('tenant_test.seq_matricule_enseignant')::TEXT, 6, '0'),
    'permanent',
    TRUE,
    NOW()
FROM tenant_test.utilisateur
WHERE email = 'VOTRE_EMAIL@example.com'  -- Remplacer
AND role = 'enseignant';
```

### Étape 2: Vérifier les UE (Unités d'Enseignement)

```sql
-- Lister toutes les UE disponibles
SELECT 
    ue.id,
    ue.code,
    ue.intitule,
    ue.credits_ects,
    ue.semestre,
    ue.annee_niveau,
    p.nom as parcours_nom,
    ue.actif
FROM tenant_test.unite_enseignement ue
LEFT JOIN tenant_test.parcours p ON p.id = ue.parcours_id
WHERE ue.actif = TRUE
ORDER BY ue.code;
```

**Si aucune UE n'existe, créez-en une:**
```sql
-- D'abord, trouvez un parcours
SELECT id, code, nom FROM tenant_test.parcours WHERE actif = TRUE LIMIT 1;

-- Créez une UE
INSERT INTO tenant_test.unite_enseignement (
    parcours_id,
    code,
    intitule,
    credits_ects,
    coefficient,
    volume_cm,
    volume_td,
    volume_tp,
    semestre,
    annee_niveau,
    type_ue,
    actif,
    created_at
) VALUES (
    'ID_DU_PARCOURS',  -- Remplacer par l'ID du parcours
    'UE101',
    'Introduction à l''Informatique',
    6,
    1,
    30,
    15,
    15,
    1,
    1,
    'obligatoire',
    TRUE,
    NOW()
);
```

### Étape 3: Vérifier l'année académique active

```sql
SELECT 
    id,
    libelle,
    date_debut,
    date_fin,
    active
FROM tenant_test.annee_academique
WHERE active = TRUE;
```

**Si aucune année n'est active, activez-en une:**
```sql
-- Désactiver toutes les années
UPDATE tenant_test.annee_academique SET active = FALSE;

-- Activer l'année en cours
UPDATE tenant_test.annee_academique 
SET active = TRUE 
WHERE libelle LIKE '%2025-2026%'  -- Ajustez selon votre année
LIMIT 1;

-- Ou créez une nouvelle année
INSERT INTO tenant_test.annee_academique (
    libelle,
    date_debut,
    date_fin,
    active,
    created_at
) VALUES (
    '2025-2026',
    '2025-09-01',
    '2026-06-30',
    TRUE,
    NOW()
);
```

### Étape 4: Créer l'affectation de cours

```sql
-- Récupérez les IDs nécessaires des étapes précédentes, puis:
INSERT INTO tenant_test.affectation_cours (
    enseignant_id,
    ue_id,
    annee_academique_id,
    type_seance,
    volume_prevu,
    volume_realise,
    created_at
) VALUES (
    'ID_ENSEIGNANT',      -- De l'étape 1
    'ID_UE',              -- De l'étape 2
    'ID_ANNEE_ACADEMIQUE', -- De l'étape 3
    'CM',                 -- Type: CM, TD ou TP
    30,                   -- Volume prévu en heures
    0,                    -- Volume réalisé (commence à 0)
    NOW()
);
```

### Étape 5: Vérifier l'affectation

```sql
SELECT 
    ac.id,
    e.nom || ' ' || e.prenom as enseignant,
    ue.code || ' - ' || ue.intitule as cours,
    ac.type_seance,
    ac.volume_prevu,
    aa.libelle as annee
FROM tenant_test.affectation_cours ac
JOIN tenant_test.enseignant e ON e.id = ac.enseignant_id
JOIN tenant_test.unite_enseignement ue ON ue.id = ac.ue_id
JOIN tenant_test.annee_academique aa ON aa.id = ac.annee_academique_id
WHERE e.utilisateur_id = (
    SELECT id FROM tenant_test.utilisateur 
    WHERE email = 'VOTRE_EMAIL@example.com'
);
```

### Étape 6: Rafraîchir le portail

1. Rafraîchissez la page du portail enseignant (F5)
2. Vérifiez que "Mes Cours" affiche maintenant 1 cours
3. Les erreurs 500 devraient disparaître

## 🔧 Script SQL Complet

Un script complet est disponible dans:
**`backend/scripts/create-affectation-cours.sql`**

Ce script contient toutes les requêtes nécessaires avec des commentaires détaillés.

## 📊 Vérification des Logs Backend

Si les erreurs persistent, vérifiez les logs du terminal backend pour voir l'erreur exacte:

```bash
# Dans le terminal où tourne le backend
# Cherchez les lignes contenant "Error" ou "error"
```

Les erreurs courantes:
- `relation "tenant_test.enseignant" does not exist` → Table manquante
- `null value in column "enseignant_id"` → Enseignant non trouvé
- `no rows returned` → Aucune affectation trouvée

## 🎯 Résumé

Pour que "Mes Cours" fonctionne, vous devez avoir:

1. ✅ Un enregistrement dans `utilisateur` (avec role='enseignant')
2. ✅ Un enregistrement dans `enseignant` (lié à l'utilisateur)
3. ✅ Au moins une `unite_enseignement` (UE/cours)
4. ✅ Une `annee_academique` active
5. ✅ Une `affectation_cours` (lien enseignant ↔ UE ↔ année)

## 📝 Modifications Effectuées

### Portail Enseignant Nettoyé
- ❌ Supprimé: Création de Cours
- ❌ Supprimé: Ressources Pédagogiques
- ❌ Supprimé: Demandes Matériel
- ✅ Conservé: Mes Cours, Saisie Notes, Présences, Étudiants

### Backend RH
- ✅ Méthodes d'affectation de cours déjà implémentées dans `rh.service.ts`
- ⏳ Endpoints RH à ajouter (prochaine étape)
- ⏳ Interface RH à créer (prochaine étape)

## 🆘 Besoin d'Aide?

Si après avoir suivi toutes ces étapes le problème persiste:

1. Vérifiez que vous êtes connecté avec le bon compte
2. Vérifiez que le schéma tenant est correct (`tenant_test`)
3. Vérifiez les logs du backend pour l'erreur exacte
4. Assurez-vous que toutes les tables existent dans le schéma tenant

## 🚀 Prochaines Étapes

Une fois que "Mes Cours" fonctionne:

1. Implémenter l'interface RH pour gérer les affectations
2. Ajouter les endpoints dans `rh.controller.ts`
3. Créer `AffectationCoursPage.tsx`
4. Mettre à jour la navigation RH