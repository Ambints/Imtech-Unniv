# 🔗 SYSTÈME DE LIAISON PARENT-ENFANT

## 📋 Vue d'ensemble

Le système actuel utilise **UNIQUEMENT les tables existantes** sans modification de la base de données. La liaison parent-enfant se fait via les champs existants dans la table `etudiant`.

## 🗄️ Structure de la Base de Données

### Table `utilisateur` (dans chaque schéma tenant)
```sql
CREATE TABLE tenant_ispm.utilisateur (
    id UUID PRIMARY KEY,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    telephone VARCHAR(20),
    role VARCHAR(50), -- 'parent', 'etudiant', 'admin', etc.
    mot_de_passe VARCHAR(255),
    actif BOOLEAN DEFAULT true,
    ...
);
```

### Table `etudiant` (dans chaque schéma tenant)
```sql
CREATE TABLE tenant_ispm.etudiant (
    id UUID PRIMARY KEY,
    utilisateur_id UUID, -- Lien vers utilisateur si l'étudiant a un compte
    matricule VARCHAR(30),
    nom VARCHAR(100),
    prenom VARCHAR(100),
    email VARCHAR(254),
    
    -- 🔑 CHAMPS CLÉS POUR LA LIAISON PARENT-ENFANT
    nom_parent VARCHAR(200),        -- Nom complet du parent
    email_parent VARCHAR(254),      -- Email du parent (CLÉ PRINCIPALE)
    telephone_parent VARCHAR(30),   -- Téléphone du parent (CLÉ SECONDAIRE)
    
    date_naissance DATE,
    ...
);
```

## 🔍 Comment Identifier la Relation Parent-Enfant

### Méthode 1 : Via l'Email (RECOMMANDÉE)

**Principe :** Un parent (utilisateur avec role='parent') est lié à un étudiant si son email correspond à `etudiant.email_parent`.

```sql
-- Vérifier si A (parent) est le parent de B (étudiant)
SELECT 1 
FROM tenant_ispm.utilisateur parent
JOIN tenant_ispm.etudiant enfant ON enfant.email_parent = parent.email
WHERE parent.id = 'UUID_PARENT_A'
  AND enfant.id = 'UUID_ETUDIANT_B'
  AND parent.role = 'parent';

-- Si cette requête retourne une ligne, alors A est le parent de B
```

**Exemple concret :**
```sql
-- Parent : Marie Dupont (marie.dupont@email.com)
INSERT INTO tenant_ispm.utilisateur (nom, prenom, email, role, ...)
VALUES ('Dupont', 'Marie', 'marie.dupont@email.com', 'parent', ...);

-- Enfant : Paul Dupont
INSERT INTO tenant_ispm.etudiant (nom, prenom, email_parent, ...)
VALUES ('Dupont', 'Paul', 'marie.dupont@email.com', ...);

-- Liaison : marie.dupont@email.com = marie.dupont@email.com ✅
```

### Méthode 2 : Via le Téléphone (ALTERNATIVE)

**Principe :** Si l'email n'est pas disponible, on peut utiliser le numéro de téléphone.

```sql
-- Vérifier via téléphone
SELECT 1 
FROM tenant_ispm.utilisateur parent
JOIN tenant_ispm.etudiant enfant ON enfant.telephone_parent = parent.telephone
WHERE parent.id = 'UUID_PARENT_A'
  AND enfant.id = 'UUID_ETUDIANT_B'
  AND parent.role = 'parent';
```

### Méthode 3 : Combinée (PLUS ROBUSTE)

**Principe :** Vérifier par email OU téléphone pour plus de flexibilité.

```sql
-- Vérification combinée (utilisée dans le code)
SELECT 1 
FROM tenant_ispm.utilisateur parent
JOIN tenant_ispm.etudiant enfant ON (
    enfant.email_parent = parent.email 
    OR enfant.telephone_parent = parent.telephone
)
WHERE parent.id = 'UUID_PARENT_A'
  AND enfant.id = 'UUID_ETUDIANT_B'
  AND parent.role = 'parent';
```

## 💻 Implémentation dans le Code

### Service Backend (parent.service.enhanced.ts)

```typescript
private async verifierLienParentEnfant(
  parentUserId: string, 
  etudiantId: string, 
  schemaName: string
): Promise<void> {
  // 1. Récupérer les coordonnées du parent
  const parent = await this.dataSource.query(`
    SELECT email, telephone 
    FROM ${schemaName}.utilisateur 
    WHERE id = $1 AND role = 'parent'
  `, [parentUserId]);

  if (!parent.length) {
    throw new ForbiddenException('Utilisateur parent non trouvé');
  }

  // 2. Vérifier la liaison avec l'étudiant
  const lien = await this.dataSource.query(`
    SELECT 1 
    FROM ${schemaName}.etudiant e
    WHERE e.id = $1 AND (
      e.email_parent = $2           -- Vérification par email
      OR e.telephone_parent = $3    -- OU par téléphone
      OR e.email_parent ILIKE $4    -- OU email partiel (flexible)
    )
  `, [
    etudiantId, 
    parent[0].email, 
    parent[0].telephone, 
    `%${parent[0].email}%`
  ]);

  // 3. Si aucune liaison trouvée, refuser l'accès
  if (!lien.length) {
    throw new ForbiddenException(
      'Vous n\'êtes pas autorisé à consulter les informations de cet étudiant'
    );
  }
}
```

### Récupérer tous les enfants d'un parent

```typescript
async getEnfants(parentUserId: string, schemaName: string): Promise<any[]> {
  // 1. Récupérer les coordonnées du parent
  const parent = await this.dataSource.query(`
    SELECT email, telephone 
    FROM ${schemaName}.utilisateur 
    WHERE id = $1 AND role = 'parent'
  `, [parentUserId]);

  // 2. Trouver tous les étudiants liés
  const enfants = await this.dataSource.query(`
    SELECT 
      e.id,
      e.nom,
      e.prenom,
      e.matricule,
      e.photo_url,
      p.nom as parcours,
      i.annee_niveau
    FROM ${schemaName}.etudiant e
    LEFT JOIN ${schemaName}.inscription i ON i.etudiant_id = e.id 
      AND i.statut = 'validee'
    LEFT JOIN ${schemaName}.parcours p ON p.id = i.parcours_id
    WHERE (
      e.email_parent = $1           -- Liaison par email
      OR e.telephone_parent = $2    -- OU par téléphone
    )
    AND e.actif = true
    ORDER BY e.nom, e.prenom
  `, [parent[0].email, parent[0].telephone]);

  return enfants;
}
```

## 📊 Exemples Pratiques

### Exemple 1 : Un parent, un enfant

```sql
-- Parent
INSERT INTO tenant_ispm.utilisateur (id, nom, prenom, email, role)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Dupont', 
  'Marie', 
  'marie.dupont@email.com', 
  'parent'
);

-- Enfant
INSERT INTO tenant_ispm.etudiant (id, nom, prenom, email_parent)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'Dupont', 
  'Paul', 
  'marie.dupont@email.com'  -- ✅ Liaison
);

-- Vérification
SELECT 
  p.nom as parent_nom,
  e.nom as enfant_nom
FROM tenant_ispm.utilisateur p
JOIN tenant_ispm.etudiant e ON e.email_parent = p.email
WHERE p.id = '550e8400-e29b-41d4-a716-446655440001';

-- Résultat : Marie Dupont -> Paul Dupont ✅
```

### Exemple 2 : Un parent, plusieurs enfants

```sql
-- Parent
INSERT INTO tenant_ispm.utilisateur (id, nom, prenom, email, role)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Rakoto', 
  'Jean', 
  'jean.rakoto@email.com', 
  'parent'
);

-- Enfant 1
INSERT INTO tenant_ispm.etudiant (id, nom, prenom, email_parent)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'Rakoto', 
  'Miora', 
  'jean.rakoto@email.com'  -- ✅ Liaison
);

-- Enfant 2
INSERT INTO tenant_ispm.etudiant (id, nom, prenom, email_parent)
VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  'Rakoto', 
  'Toky', 
  'jean.rakoto@email.com'  -- ✅ Liaison
);

-- Vérification : Tous les enfants de Jean
SELECT 
  e.nom,
  e.prenom
FROM tenant_ispm.etudiant e
WHERE e.email_parent = 'jean.rakoto@email.com';

-- Résultat :
-- Miora Rakoto ✅
-- Toky Rakoto ✅
```

### Exemple 3 : Deux parents, un enfant (cas rare)

```sql
-- Parent 1 (père)
INSERT INTO tenant_ispm.utilisateur (id, nom, prenom, email, role)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Rasoamanana', 
  'Pierre', 
  'pierre.rasoamanana@email.com', 
  'parent'
);

-- Parent 2 (mère)
INSERT INTO tenant_ispm.utilisateur (id, nom, prenom, email, role)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'Rasoamanana', 
  'Sophie', 
  'sophie.rasoamanana@email.com', 
  'parent'
);

-- Enfant (lié au père via email_parent)
INSERT INTO tenant_ispm.etudiant (id, nom, prenom, email_parent, telephone_parent)
VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  'Rasoamanana', 
  'Lova', 
  'pierre.rasoamanana@email.com',  -- ✅ Lié au père
  '+261340000003'                   -- Téléphone (peut être celui de la mère)
);

-- Note : Dans ce cas, seul le père peut accéder via email
-- Pour permettre l'accès à la mère, il faudrait :
-- 1. Utiliser un email commun (ex: parents.rasoamanana@email.com)
-- 2. Ou mettre l'email de la mère dans email_parent
-- 3. Ou utiliser la table parent_etudiant (optionnelle, voir plus bas)
```

## 🔐 Sécurité et Vérifications

### Vérification à chaque requête

```typescript
// Avant toute opération, vérifier le lien
await this.verifierLienParentEnfant(parentUserId, etudiantId, schemaName);

// Si la vérification échoue :
// - ForbiddenException est levée
// - L'accès est refusé
// - Aucune donnée n'est exposée
```

### Isolation Multi-tenant

```typescript
// Chaque requête utilise le schéma du tenant
const schemaName = req.tenantSchema; // Ex: 'tenant_ispm'

// Les données sont isolées par schéma PostgreSQL
// Un parent de tenant_ispm ne peut PAS voir les étudiants de tenant_universite
```

## 📝 Procédure de Liaison

### Étape 1 : Créer le compte parent

```sql
INSERT INTO tenant_ispm.utilisateur (
  nom, prenom, email, telephone, role, mot_de_passe, actif
) VALUES (
  'Dupont', 
  'Marie', 
  'marie.dupont@email.com',
  '+261340000001',
  'parent',
  '$2b$10$...', -- Hash bcrypt
  true
);
```

### Étape 2 : Lier l'étudiant au parent

```sql
UPDATE tenant_ispm.etudiant
SET 
  nom_parent = 'Marie Dupont',
  email_parent = 'marie.dupont@email.com',
  telephone_parent = '+261340000001'
WHERE id = 'UUID_ETUDIANT'
  OR matricule = 'MATRICULE_ETUDIANT';
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
```

## 🎯 Avantages de ce Système

### ✅ Avantages

1. **Aucune modification de BD** - Utilise les champs existants
2. **Simple** - Liaison directe via email/téléphone
3. **Performant** - Index sur email_parent
4. **Flexible** - Support email OU téléphone
5. **Multi-enfants** - Un parent peut avoir plusieurs enfants
6. **Sécurisé** - Vérification à chaque requête

### ⚠️ Limitations

1. **Un seul email parent** - Difficile de gérer 2 parents séparés
2. **Pas de métadonnées** - Pas de type de relation (père/mère/tuteur)
3. **Pas d'historique** - Pas de date de début/fin de relation
4. **Pas de permissions granulaires** - Tous les parents ont les mêmes droits

## 🚀 Solution Avancée (Optionnelle)

Si vous avez besoin de fonctionnalités avancées (2 parents, permissions granulaires, etc.), vous pouvez créer une table de liaison :

```sql
CREATE TABLE tenant_ispm.parent_etudiant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES utilisateur(id),
    etudiant_id UUID REFERENCES etudiant(id),
    lien_parente VARCHAR(50), -- 'pere', 'mere', 'tuteur'
    acces_notes BOOLEAN DEFAULT true,
    acces_finances BOOLEAN DEFAULT true,
    priorite_contact SMALLINT DEFAULT 1,
    actif BOOLEAN DEFAULT true,
    UNIQUE(parent_id, etudiant_id)
);
```

Mais **ce n'est pas nécessaire** pour le système actuel qui fonctionne parfaitement avec les champs existants !

## 📚 Résumé

**Question :** Comment savoir si A est le parent de B ?

**Réponse :**
```sql
-- A est le parent de B si :
SELECT 1 
FROM tenant_ispm.utilisateur A
JOIN tenant_ispm.etudiant B ON (
    B.email_parent = A.email 
    OR B.telephone_parent = A.telephone
)
WHERE A.id = 'UUID_A'
  AND B.id = 'UUID_B'
  AND A.role = 'parent';

-- Si cette requête retourne une ligne : A est le parent de B ✅
-- Si elle ne retourne rien : A n'est PAS le parent de B ❌
```

**En code TypeScript :**
```typescript
const isParent = await this.verifierLienParentEnfant(
  parentUserId,  // A
  etudiantId,    // B
  schemaName
);
// Lève une exception si A n'est pas le parent de B
```

---

**Date :** 18 Mai 2026  
**Version :** 1.0.0  
**Système :** Utilise UNIQUEMENT les tables existantes ✅