# 📧 Guide de Modification - Méthode Email Seul

## ✅ Modifications Appliquées

Le code a été modifié pour utiliser **UNIQUEMENT la Méthode 1 (email)** pour la liaison parent-enfant.

## 🔧 Changements Effectués

### 1. Fonction `verifierLienParentEnfant` (Lignes 30-59)

**AVANT (Méthode combinée) :**
```typescript
private async verifierLienParentEnfant(...): Promise<void> {
  // Récupérait email ET téléphone
  const parent = await this.dataSource.query(`
    SELECT email, telephone FROM ${schemaName}.utilisateur 
    WHERE id = $1 AND role = 'parent'
  `, [parentUserId]);

  // Vérifiait par email OU téléphone OU pattern
  const lien = await this.dataSource.query(`
    SELECT 1 FROM ${schemaName}.etudiant e
    WHERE e.id = $1 AND (
      e.email_parent = $2 
      OR e.telephone_parent = $3
      OR e.email_parent ILIKE $4
    )
  `, [etudiantId, parent[0].email, parent[0].telephone, `%${parent[0].email}%`]);
}
```

**APRÈS (Méthode email seul) :**
```typescript
private async verifierLienParentEnfant(...): Promise<void> {
  // 1. Récupère UNIQUEMENT l'email du parent
  const parent = await this.dataSource.query(`
    SELECT email FROM ${schemaName}.utilisateur 
    WHERE id = $1 AND role = 'parent'
  `, [parentUserId]);

  // 2. Vérifie UNIQUEMENT par email (égalité stricte)
  const lien = await this.dataSource.query(`
    SELECT 1 FROM ${schemaName}.etudiant e
    WHERE e.id = $1 AND e.email_parent = $2
  `, [etudiantId, parent[0].email]);
}
```

### 2. Fonction `getEnfants` (Lignes 74-115)

**AVANT (Méthode combinée) :**
```typescript
async getEnfants(parentUserId: string, schemaName: string): Promise<any[]> {
  // Récupérait email ET téléphone
  const parent = await this.dataSource.query(`
    SELECT email, telephone FROM ${schemaName}.utilisateur 
    WHERE id = $1 AND role = 'parent'
  `, [parentUserId]);

  // Filtrait par email OU téléphone
  const enfants = await this.dataSource.query(`
    SELECT ...
    FROM ${schemaName}.etudiant e
    ...
    WHERE (e.email_parent = $1 OR e.telephone_parent = $2)
      AND e.actif = true
    ORDER BY e.nom, e.prenom
  `, [parent[0].email, parent[0].telephone]);
}
```

**APRÈS (Méthode email seul) :**
```typescript
async getEnfants(parentUserId: string, schemaName: string): Promise<any[]> {
  // 1. Récupère UNIQUEMENT l'email du parent
  const parent = await this.dataSource.query(`
    SELECT email FROM ${schemaName}.utilisateur 
    WHERE id = $1 AND role = 'parent'
  `, [parentUserId]);

  // 2. Filtre UNIQUEMENT par email
  const enfants = await this.dataSource.query(`
    SELECT ...
    FROM ${schemaName}.etudiant e
    ...
    WHERE e.email_parent = $1
      AND e.actif = true
    ORDER BY e.nom, e.prenom
  `, [parent[0].email]);
}
```

## 📊 Résumé des Changements

| Élément | Avant | Après |
|---------|-------|-------|
| **Requête parent** | `SELECT email, telephone` | `SELECT email` |
| **Condition vérification** | `email_parent = $2 OR telephone_parent = $3 OR ILIKE $4` | `email_parent = $2` |
| **Paramètres SQL vérification** | `[etudiantId, email, telephone, pattern]` (4 params) | `[etudiantId, email]` (2 params) |
| **Condition enfants** | `WHERE (email_parent = $1 OR telephone_parent = $2)` | `WHERE email_parent = $1` |
| **Paramètres SQL enfants** | `[email, telephone]` (2 params) | `[email]` (1 param) |

## ✅ Avantages de la Méthode Email Seul

1. **Plus simple** - Une seule condition de vérification
2. **Plus rapide** - Moins de comparaisons SQL (1 au lieu de 3)
3. **Plus sûr** - Pas de confusion avec les numéros de téléphone
4. **Standard** - L'email est unique et stable
5. **Moins de paramètres** - Requêtes SQL plus légères

## 🔍 Comment Ça Fonctionne Maintenant

### Vérification Parent-Enfant

```sql
-- Un parent A est lié à un étudiant B si et seulement si :
SELECT 1 
FROM tenant_ispm.utilisateur A
JOIN tenant_ispm.etudiant B ON B.email_parent = A.email
WHERE A.id = 'UUID_PARENT'
  AND B.id = 'UUID_ETUDIANT'
  AND A.role = 'parent';

-- Si cette requête retourne une ligne : Accès autorisé ✅
-- Si elle ne retourne rien : Accès refusé ❌
```

### Exemple Concret

```sql
-- 1. Parent Marie Dupont
INSERT INTO tenant_ispm.utilisateur (nom, prenom, email, role)
VALUES ('Dupont', 'Marie', 'marie.dupont@email.com', 'parent');

-- 2. Enfant Paul Dupont
INSERT INTO tenant_ispm.etudiant (nom, prenom, email_parent)
VALUES ('Dupont', 'Paul', 'marie.dupont@email.com');

-- 3. Vérification
-- marie.dupont@email.com = marie.dupont@email.com ✅
-- Marie peut accéder aux informations de Paul
```

## ⚠️ Points d'Attention

### 1. Email Parent Obligatoire

Tous les étudiants doivent avoir un `email_parent` renseigné :

```sql
-- Vérifier les étudiants sans email parent
SELECT id, nom, prenom, matricule
FROM tenant_ispm.etudiant
WHERE email_parent IS NULL OR email_parent = ''
  AND actif = true;

-- Mettre à jour si nécessaire
UPDATE tenant_ispm.etudiant
SET email_parent = 'parent@email.com'
WHERE id = 'UUID_ETUDIANT';
```

### 2. Correspondance Exacte

L'email du parent dans `utilisateur.email` doit correspondre **exactement** à `etudiant.email_parent` :

```sql
-- ✅ BON
utilisateur.email = 'marie.dupont@email.com'
etudiant.email_parent = 'marie.dupont@email.com'

-- ❌ MAUVAIS (ne fonctionnera pas)
utilisateur.email = 'marie.dupont@email.com'
etudiant.email_parent = 'Marie.Dupont@email.com'  -- Casse différente

-- ❌ MAUVAIS (ne fonctionnera pas)
utilisateur.email = 'marie.dupont@email.com'
etudiant.email_parent = 'marie.dupont@gmail.com'  -- Domaine différent
```

### 3. Emails Uniques

Chaque parent doit avoir un email unique :

```sql
-- Vérifier les doublons
SELECT email, COUNT(*) as nb_comptes
FROM tenant_ispm.utilisateur
WHERE role = 'parent'
GROUP BY email
HAVING COUNT(*) > 1;
```

## 🧪 Tests à Effectuer

### Test 1 : Vérification de la liaison

```bash
# 1. Créer un parent
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Marie",
    "email": "marie.dupont@test.com",
    "password": "Parent123!",
    "role": "parent"
  }'

# 2. Lier un étudiant
psql -U postgres -d imtech_saas -c "
  UPDATE tenant_ispm.etudiant
  SET email_parent = 'marie.dupont@test.com'
  WHERE matricule = 'ETU001';
"

# 3. Se connecter en tant que parent
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "marie.dupont@test.com",
    "password": "Parent123!"
  }'

# 4. Récupérer la liste des enfants
curl http://localhost:3000/api/v1/portail/parent/enfants \
  -H "Authorization: Bearer TOKEN"

# Résultat attendu : Liste contenant l'étudiant ETU001 ✅
```

### Test 2 : Accès non autorisé

```bash
# 1. Essayer d'accéder aux infos d'un étudiant non lié
curl http://localhost:3000/api/v1/portail/parent/enfants/UUID_AUTRE_ETUDIANT/dashboard \
  -H "Authorization: Bearer TOKEN"

# Résultat attendu : 403 Forbidden ❌
# Message : "Vous n'êtes pas autorisé à consulter les informations de cet étudiant"
```

### Test 3 : Email manquant

```bash
# 1. Créer un étudiant sans email_parent
psql -U postgres -d imtech_saas -c "
  INSERT INTO tenant_ispm.etudiant (nom, prenom, email_parent)
  VALUES ('Test', 'Etudiant', NULL);
"

# 2. Essayer de récupérer les enfants
curl http://localhost:3000/api/v1/portail/parent/enfants \
  -H "Authorization: Bearer TOKEN"

# Résultat attendu : L'étudiant n'apparaît PAS dans la liste ✅
```

## 📝 Procédure de Liaison Parent-Enfant

### Étape 1 : Créer le compte parent

```sql
INSERT INTO tenant_ispm.utilisateur (
  id,
  nom,
  prenom,
  email,
  role,
  mot_de_passe,
  actif
) VALUES (
  gen_random_uuid(),
  'Dupont',
  'Marie',
  'marie.dupont@email.com',
  'parent',
  '$2b$10$...', -- Hash bcrypt du mot de passe
  true
);
```

### Étape 2 : Lier l'étudiant au parent

```sql
UPDATE tenant_ispm.etudiant
SET 
  nom_parent = 'Marie Dupont',
  email_parent = 'marie.dupont@email.com'
WHERE matricule = 'ETU001';
```

### Étape 3 : Vérifier la liaison

```sql
SELECT 
  u.nom as parent_nom,
  u.email as parent_email,
  e.nom as enfant_nom,
  e.prenom as enfant_prenom,
  e.matricule
FROM tenant_ispm.utilisateur u
JOIN tenant_ispm.etudiant e ON e.email_parent = u.email
WHERE u.role = 'parent'
  AND u.email = 'marie.dupont@email.com';

-- Résultat attendu :
-- parent_nom | parent_email              | enfant_nom | enfant_prenom | matricule
-- Dupont     | marie.dupont@email.com    | Dupont     | Paul          | ETU001
```

## 🔄 Migration depuis la Méthode Combinée

Si vous aviez des données utilisant le téléphone, voici comment migrer :

```sql
-- 1. Identifier les liaisons par téléphone uniquement
SELECT 
  e.id,
  e.nom,
  e.prenom,
  e.telephone_parent,
  u.nom as parent_nom,
  u.email as parent_email
FROM tenant_ispm.etudiant e
JOIN tenant_ispm.utilisateur u ON u.telephone = e.telephone_parent
WHERE e.email_parent IS NULL
  AND u.role = 'parent';

-- 2. Mettre à jour avec l'email du parent
UPDATE tenant_ispm.etudiant e
SET email_parent = u.email
FROM tenant_ispm.utilisateur u
WHERE u.telephone = e.telephone_parent
  AND e.email_parent IS NULL
  AND u.role = 'parent';

-- 3. Vérifier qu'il n'y a plus de liaisons manquantes
SELECT COUNT(*) as nb_sans_email_parent
FROM tenant_ispm.etudiant
WHERE (email_parent IS NULL OR email_parent = '')
  AND actif = true;
```

## 📚 Documentation Associée

- **SYSTEME_LIAISON_PARENT_ENFANT.md** - Explication complète du système
- **IMPLEMENTATION_PORTAIL_PARENT_COMPLETE.md** - Documentation technique
- **GUIDE_DEPLOIEMENT_PORTAIL_PARENT.md** - Guide de déploiement

## 🎯 Résumé

✅ **Modifications appliquées avec succès**

Le système utilise maintenant **UNIQUEMENT l'email** pour la liaison parent-enfant :
- Plus simple et plus rapide
- Moins de paramètres SQL
- Vérification stricte par égalité d'email
- Pas de confusion avec les numéros de téléphone

**Formule de vérification :**
```
Parent A peut accéder à Étudiant B 
⟺ 
utilisateur.email (A) = etudiant.email_parent (B)
```

---

**Date :** 18 Mai 2026  
**Version :** 2.0.0 (Méthode Email Seul)  
**Fichier modifié :** `backend/src/portail/parent.service.enhanced.ts`