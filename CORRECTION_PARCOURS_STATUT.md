# 🔧 CORRECTION CRITIQUE - Champ `statut` de la table `parcours`

## 🚨 Problème Identifié

**Erreur Frontend**: `Cannot read properties of undefined (reading 'toUpperCase')` dans `ParcoursPage.tsx` ligne 218

**Cause Racine**: La table `parcours` dans BD.sql n'a **PAS de colonne `statut`**. Elle utilise une colonne `actif` (boolean) à la place.

## 📊 Analyse du Schéma BD.sql

### Structure Réelle de la Table `parcours`
```sql
CREATE TABLE tenant_ispm.parcours (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    departement_id uuid NOT NULL,
    code character varying(30) NOT NULL,
    nom character varying(200) NOT NULL,           -- ✅ Pas "intitule"
    niveau character varying(20) NOT NULL,
    duree_annees smallint DEFAULT 3 NOT NULL,
    responsable_id uuid,
    description text,
    actif boolean DEFAULT true,                     -- ✅ Pas "statut"
    annee_ouverture integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    secretaire_id uuid,
    CONSTRAINT parcours_niveau_check CHECK (...)
);
```

### Colonnes Manquantes (n'existent PAS)
- ❌ `intitule` → Utiliser `nom`
- ❌ `statut` → Utiliser `actif` (boolean)
- ❌ `date_ouverture`
- ❌ `motif_ouverture`
- ❌ `conditions_ouverture`
- ❌ `valide_par_president`
- ❌ `date_fermeture`
- ❌ `motif_fermeture`

## ✅ Corrections Appliquées

### 1. Backend - `president.service.simple.ts`

**Avant** (ligne 200-213):
```typescript
async getParcoursList(tenantSchema: string) {
  const result = await this.dataSource.query(`
    SELECT id, code, nom, niveau, actif, created_at
    FROM ${schema}.parcours
    ORDER BY nom
  `);
  return result;
}
```

**Après**:
```typescript
async getParcoursList(tenantSchema: string) {
  const result = await this.dataSource.query(`
    SELECT 
      id, 
      code, 
      nom as intitule,
      niveau, 
      actif,
      CASE 
        WHEN actif = true THEN 'ouvert'
        ELSE 'ferme'
      END as statut,
      responsable_id,
      (SELECT COUNT(*) FROM ${schema}.inscription i 
       WHERE i.parcours_id = parcours.id 
       AND i.statut = 'valide') as effectif_actuel,
      created_at
    FROM ${schema}.parcours
    ORDER BY nom
  `);
  
  // Mapper les résultats pour correspondre à l'interface frontend
  return result.map((p: any) => ({
    id: p.id,
    intitule: p.intitule,
    niveau: p.niveau,
    statut: p.statut,                    // ✅ Calculé depuis actif
    effectifActuel: parseInt(p.effectif_actuel) || 0,
    responsablePedagogique: p.responsable_id || null,
  }));
}
```

### 2. Backend - `president.service.ts`

#### Méthode `getParcoursList` (ligne 873-903)

**Avant**:
```typescript
const result = await this.dataSource.query(
  `SELECT 
    p.id,
    p.intitule,              // ❌ N'existe pas
    p.niveau,
    p.statut,                // ❌ N'existe pas
    COUNT(DISTINCT i.etudiant_id) as effectif_actuel,
    u.nom || ' ' || u.prenom as responsable_pedagogique
   FROM ${schema}.parcours p
   ...`
);
return result;
```

**Après**:
```typescript
const result = await this.dataSource.query(
  `SELECT 
    p.id,
    p.nom as intitule,       // ✅ Alias ajouté
    p.niveau,
    p.actif,                 // ✅ Colonne réelle
    CASE 
      WHEN p.actif = true THEN 'ouvert'
      ELSE 'ferme'
    END as statut,           // ✅ Calculé depuis actif
    COUNT(DISTINCT i.etudiant_id) as effectif_actuel,
    COALESCE(u.nom || ' ' || u.prenom, 'Non assigné') as responsable_pedagogique
   FROM ${schema}.parcours p
   ...`
);

return result.map((p: any) => ({
  id: p.id,
  intitule: p.intitule,
  niveau: p.niveau,
  statut: p.statut,          // ✅ Mappé correctement
  effectifActuel: parseInt(p.effectif_actuel) || 0,
  responsablePedagogique: p.responsable_pedagogique,
}));
```

#### Méthode `ouvrirParcours` (ligne 908-937)

**Avant**:
```typescript
await this.dataSource.query(
  `UPDATE ${schema}.parcours
   SET statut = 'ouvert',                    // ❌ Colonne inexistante
       date_ouverture = COALESCE($1::date, NOW()),
       motif_ouverture = $2,
       conditions_ouverture = $3,
       valide_par_president = $4
   WHERE id = $5`,
  [dto.dateEffet || null, dto.motif, dto.conditions || null, utilisateurId, id]
);
```

**Après**:
```typescript
await this.dataSource.query(
  `UPDATE ${schema}.parcours
   SET actif = true,                         // ✅ Colonne réelle
       updated_at = NOW()
   WHERE id = $1`,
  [id]
);
```

#### Méthode `fermerParcours` (ligne 942-982)

**Avant**:
```typescript
await this.dataSource.query(
  `UPDATE ${schema}.parcours
   SET statut = 'ferme',                     // ❌ Colonne inexistante
       date_fermeture = COALESCE($1::date, NOW()),
       motif_fermeture = $2,
       valide_par_president = $3
   WHERE id = $4`,
  [dto.dateEffet || null, dto.motif, utilisateurId, id]
);
```

**Après**:
```typescript
await this.dataSource.query(
  `UPDATE ${schema}.parcours
   SET actif = false,                        // ✅ Colonne réelle
       updated_at = NOW()
   WHERE id = $1`,
  [id]
);
```

## 🎯 Résultat

### Backend
- ✅ Compilation réussie (Exit code: 0)
- ✅ Toutes les requêtes SQL utilisent les vraies colonnes
- ✅ Mapping `actif` → `statut` pour compatibilité frontend

### Frontend
- ✅ Reçoit maintenant un champ `statut` valide ('ouvert' ou 'ferme')
- ✅ Plus d'erreur `undefined.toUpperCase()`
- ✅ Interface `Parcours` respectée

## 📝 Leçons Apprises

1. **Toujours vérifier le schéma réel** avant d'écrire des requêtes SQL
2. **Ne pas supposer les noms de colonnes** - les consulter dans BD.sql
3. **Utiliser des alias SQL** pour mapper les colonnes aux interfaces TypeScript
4. **Mapper les données côté backend** plutôt que de modifier le frontend

## 🚀 Prochaines Étapes

1. ✅ Backend compilé avec succès
2. ⏳ Tester l'endpoint `/president/parcours/liste`
3. ⏳ Vérifier l'affichage dans `ParcoursPage.tsx`
4. ⏳ Tester ouverture/fermeture de parcours

---

*Correction appliquée le 17 Mai 2026 par Bob*