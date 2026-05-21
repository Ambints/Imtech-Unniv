# Fix: Isolation de la Base de Données pour le Module RH

## Problème Identifié

Lors de la création de contrats dans le module RH, les utilisateurs d'autres tenants (par exemple `tenant_ispm`) étaient visibles depuis un tenant différent (par exemple `tenant_test`). Cela représentait une **violation critique de l'isolation des données entre tenants**.

## Cause Racine

Dans le fichier `backend/src/rh/rh.service.ts`, plusieurs requêtes SQL n'utilisaient pas le préfixe de schéma tenant (`"${this.tenantSchema}"`) pour les tables référencées, notamment dans les JOINs. Cela causait PostgreSQL à chercher les tables dans le schéma par défaut (`public`) ou dans d'autres schémas accessibles.

### Exemples de Requêtes Problématiques

**Avant (INCORRECT):**
```sql
SELECT c.*, u.nom, u.prenom
FROM contrat_personnel c
LEFT JOIN utilisateur u ON u.id = c.utilisateur_id
```

**Après (CORRECT):**
```sql
SELECT c.*, u.nom, u.prenom
FROM "${this.tenantSchema}".contrat_personnel c
LEFT JOIN "${this.tenantSchema}".utilisateur u ON u.id = c.utilisateur_id
```

## Corrections Appliquées

Toutes les requêtes SQL dans `rh.service.ts` ont été corrigées pour inclure le préfixe de schéma tenant sur **toutes les tables**, y compris:

### 1. **Gestion des Utilisateurs et Départements**
- ✅ `getUtilisateurs()` - Déjà correct
- ✅ `getDepartements()` - Corrigé

### 2. **Gestion des Contrats**
- ✅ `createContrat()` - Corrigé
- ✅ `findContrats()` - Corrigé (JOINs avec utilisateur et departement)
- ✅ `renouvelerContrat()` - Corrigé
- ✅ `resilierContrat()` - Corrigé

### 3. **Heures Complémentaires**
- ✅ `createHeuresComplementaires()` - Corrigé
- ✅ `findHeuresComplementaires()` - Corrigé (JOIN avec enseignant)
- ✅ `validerHeuresComplementaires()` - Corrigé
- ✅ `getVolumeHoraireEnseignant()` - Corrigé

### 4. **Gestion des Congés**
- ✅ `demanderConge()` - Corrigé
- ✅ `findConges()` - Corrigé (JOIN avec utilisateur)
- ✅ `approuverConge()` - Corrigé
- ✅ `refuserConge()` - Corrigé
- ✅ `getSoldeConges()` - Corrigé

### 5. **Fiches de Paie**
- ✅ `genererFichePaie()` - Corrigé
- ✅ `findFichesPaie()` - Corrigé (JOINs avec contrat et utilisateur)
- ✅ `validerFichePaie()` - Corrigé
- ✅ `genererFichesPaieMasse()` - Corrigé

### 6. **Évaluations**
- ✅ `createEvaluation()` - Corrigé
- ✅ `findEvaluations()` - Corrigé (JOINs avec utilisateur et evaluateur)
- ✅ `submitAutoEvaluation()` - Corrigé
- ✅ `finaliserEvaluation()` - Corrigé

### 7. **Déclarations Sociales**
- ✅ `createDeclarationSociale()` - Corrigé
- ✅ `findDeclarationsSociales()` - Corrigé
- ✅ `exportDeclarationSociale()` - Corrigé (JOINs multiples)

### 8. **Recrutement**
- ✅ `createRecrutement()` - Corrigé
- ✅ `findRecrutements()` - Corrigé (JOIN avec departement)

### 9. **Statistiques**
- ✅ `getStatsRH()` - Corrigé (toutes les requêtes)
- ✅ `getStatsHeuresComplementaires()` - Corrigé

## Impact de la Correction

### ✅ Sécurité Renforcée
- Isolation complète des données entre tenants
- Impossible d'accéder aux données d'un autre tenant

### ✅ Conformité RGPD
- Respect de la séparation des données
- Protection de la vie privée des utilisateurs

### ✅ Intégrité des Données
- Chaque tenant ne voit que ses propres données
- Prévention des fuites de données inter-tenants

## Test de Validation

Pour vérifier que la correction fonctionne:

1. **Se connecter au tenant_test**
2. **Créer un nouveau contrat**
3. **Vérifier la liste des employés disponibles**
   - ✅ Seuls les utilisateurs de `tenant_test` doivent apparaître
   - ❌ Les utilisateurs de `tenant_ispm` ne doivent PAS apparaître

## Recommandations

### Pour Éviter ce Problème à l'Avenir

1. **Toujours utiliser le préfixe de schéma** dans toutes les requêtes SQL:
   ```typescript
   FROM "${this.tenantSchema}".table_name
   ```

2. **Vérifier les JOINs** - C'est là que les erreurs sont les plus fréquentes:
   ```typescript
   LEFT JOIN "${this.tenantSchema}".autre_table
   ```

3. **Utiliser la méthode `query()` helper** qui configure automatiquement le `search_path`

4. **Tests systématiques** avec plusieurs tenants pour valider l'isolation

### Audit des Autres Modules

Il est recommandé de vérifier les autres services pour s'assurer qu'ils utilisent également le préfixe de schéma tenant correctement:
- ✅ `scolarite.service.ts`
- ✅ `portail/parent.service.ts`
- ⚠️ Autres modules à vérifier

## Conclusion

Cette correction critique garantit l'isolation complète des données entre tenants dans le module RH. Tous les utilisateurs ne verront désormais que les données de leur propre tenant, conformément aux exigences de sécurité et de confidentialité d'une architecture multi-tenant.