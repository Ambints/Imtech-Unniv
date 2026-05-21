# Fix Economat - Suivi des Dépenses (500 Error)

## Problème Initial
L'endpoint `/api/v1/economat/depenses` retournait une erreur 500 (Internal Server Error) empêchant l'affichage de la page "Suivi des Dépenses".

## Cause Racine Identifiée

### Problème Principal: ValidationPipe Silencieux
Le frontend envoyait les paramètres de pagination comme **strings** dans l'URL:
```
/api/v1/economat/depenses?page=1&limit=10
```

Mais le DTO `DepenseFiltersDto` attendait des **numbers** sans transformation:
```typescript
@IsOptional()
page?: number;

@IsOptional()
limit?: number;
```

**Résultat**: La ValidationPipe rejetait silencieusement la requête AVANT même d'entrer dans la méthode du controller, causant l'erreur 500.

### Problème Secondaire: Colonne Manquante
La table `depense` n'avait pas la colonne `updated_at` requise par les requêtes SQL.

## Solutions Appliquées

### 1. Ajout de la Colonne `updated_at`

**Fichier**: `backend/migrations/add-updated-at-to-depense.sql`
```sql
-- Ajouter la colonne updated_at à la table depense
ALTER TABLE depense 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Créer un trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_depense_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_depense_updated_at ON depense;
CREATE TRIGGER trigger_update_depense_updated_at
    BEFORE UPDATE ON depense
    FOR EACH ROW
    EXECUTE FUNCTION update_depense_updated_at();
```

**Exécution**: Migration appliquée sur `tenant_test` et `tenant_ispm`

### 2. Mise à Jour du Schema Tenant

**Fichiers modifiés**:
- `tenant-schema.sql` (racine)
- `backend/src/tenants/tenant-schema.sql`

Ajout de la colonne dans la définition de la table:
```sql
CREATE TABLE depense (
    -- ... autres colonnes ...
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- ... contraintes ...
);
```

### 3. Fix du DTO avec Transformation

**Fichier**: `backend/src/economat/dto/filters.dto.ts`

**Avant**:
```typescript
@IsOptional()
page?: number;

@IsOptional()
limit?: number;
```

**Après**:
```typescript
import { Type } from 'class-transformer';

@IsNumber()
@Min(1)
@Type(() => Number)
@IsOptional()
page?: number;

@IsNumber()
@Min(1)
@Type(() => Number)
@IsOptional()
limit?: number;
```

**Explication**:
- `@Type(() => Number)`: Transforme automatiquement les strings en numbers
- `@IsNumber()`: Valide que c'est bien un nombre
- `@Min(1)`: Assure que la valeur est >= 1

### 4. Vérification du ValidationPipe Global

**Fichier**: `backend/src/main.ts`

Le ValidationPipe global était déjà correctement configuré:
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,  // ✅ Active la transformation
    transformOptions: {
      enableImplicitConversion: true,  // ✅ Conversion implicite activée
    },
  }),
);
```

## Structure de la Table `depense`

```sql
CREATE TABLE depense (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    libelle VARCHAR(255) NOT NULL,
    montant DECIMAL(15,2) NOT NULL,
    date_depense DATE NOT NULL DEFAULT CURRENT_DATE,
    fournisseur VARCHAR(255),
    numero_facture VARCHAR(100),
    categorie VARCHAR(100),
    statut VARCHAR(50) DEFAULT 'en_attente',
    demandeur_id UUID REFERENCES utilisateur(id),
    approbateur_id UUID REFERENCES utilisateur(id),
    date_approbation TIMESTAMP,
    motif_decision TEXT,
    facture_url TEXT,
    observations TEXT,
    annee_academique_id UUID REFERENCES annee_academique(id),
    budget_id UUID REFERENCES budget(id),
    valide_par_president BOOLEAN DEFAULT FALSE,
    date_validation_president TIMESTAMP,
    date_paiement TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Données de Test Créées

**Script**: `backend/scripts/create-sample-depenses.js`

Créé 5 dépenses dans `tenant_test` et 7 dans `tenant_ispm` avec différents statuts:
- En attente
- Approuvé
- Payé
- Rejeté

## Vérifications Effectuées

### 1. Structure de la Base de Données
✅ Colonne `updated_at` présente dans les deux tenants
✅ Trigger de mise à jour automatique créé
✅ Données de test insérées avec succès

### 2. Requêtes SQL
✅ Query COUNT fonctionne
✅ Query STATS fonctionne
✅ Query principale avec pagination fonctionne en SQL direct

### 3. Code Backend
✅ Service `economat.service.ts` correctement implémenté
✅ Controller `economat.controller.ts` avec les bonnes routes
✅ DTO avec transformation des types

## Prochaines Étapes

1. **Redémarrer le backend** pour que les changements du DTO prennent effet
2. **Tester l'endpoint** depuis le frontend
3. **Vérifier les logs** pour confirmer que la méthode `getDepenses` est bien appelée

## Commandes de Test

### Test Direct de l'Endpoint
```bash
curl -X GET "http://localhost:4000/api/v1/economat/depenses?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Tenant-Id: tenant_test"
```

### Vérification des Données
```sql
-- Dans tenant_test
SET search_path TO tenant_test;
SELECT COUNT(*) FROM depense;
SELECT * FROM depense ORDER BY date_depense DESC LIMIT 5;
```

## Résumé des Fichiers Modifiés

1. ✅ `backend/src/economat/dto/filters.dto.ts` - Ajout de la transformation des types
2. ✅ `backend/migrations/add-updated-at-to-depense.sql` - Migration de la colonne
3. ✅ `tenant-schema.sql` - Mise à jour du schéma
4. ✅ `backend/src/tenants/tenant-schema.sql` - Mise à jour du schéma

## Conclusion

Le problème était causé par une **validation stricte des types** dans le DTO qui rejetait silencieusement les requêtes avec des paramètres de pagination en string. La solution consiste à utiliser le décorateur `@Type(() => Number)` de `class-transformer` pour transformer automatiquement les query parameters en nombres avant la validation.

**Status**: ✅ Fix appliqué, en attente de redémarrage du backend pour test final.