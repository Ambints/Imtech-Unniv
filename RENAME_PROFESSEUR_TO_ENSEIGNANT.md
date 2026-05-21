# 🔄 MIGRATION: Renommer "professeur" en "enseignant"

## 📋 OBJECTIF
Standardiser la terminologie en utilisant uniquement **"enseignant"** au lieu de "professeur" dans toute l'application.

## ✅ ÉTAPE 1 : Base de Données (À EXÉCUTER EN PREMIER)

### Commande
```bash
node backend/scripts/apply-rename-professeur-to-enseignant.js
```

### Ce que fait le script
- Met à jour `role = 'professeur'` → `role = 'enseignant'` dans la table `utilisateur`
- Applique la modification à tous les tenants
- Affiche les statistiques avant/après

---

## 📝 ÉTAPE 2 : Fichiers Backend à Modifier

### 1. Enum des Rôles (PRIORITÉ HAUTE)
**Fichier** : `backend/src/common/enums/roles.enum.ts`
```typescript
// AVANT
PROFESSEUR = 'professeur',

// APRÈS
ENSEIGNANT = 'enseignant',
```

### 2. Controllers (14 fichiers)

#### `backend/src/portail/professeur.controller.ts`
- Renommer le fichier en `enseignant.controller.ts`
- Renommer la classe `PortailProfesseurController` → `PortailEnseignantController`
- Changer `@Roles('professeur', ...)` → `@Roles('enseignant', ...)`
- Changer `@Controller('portail/professeur')` → `@Controller('portail/enseignant')`
- Changer `@ApiTags('Portail Professeur')` → `@ApiTags('Portail Enseignant')`

#### `backend/src/portail/professeur.service.ts`
- Renommer le fichier en `enseignant.service.ts`
- Renommer la classe `PortailProfesseurService` → `PortailEnseignantService`
- Renommer `genererQRProfesseur` → `genererQREnseignant`

#### `backend/src/portail/portail.module.ts`
```typescript
// AVANT
import { PortailProfesseurController } from './professeur.controller';
import { PortailProfesseurService } from './professeur.service';

// APRÈS
import { PortailEnseignantController } from './enseignant.controller';
import { PortailEnseignantService } from './enseignant.service';
```

#### `backend/src/portail/portail-permissions.controller.ts`
```typescript
// Ligne 52
professeur: [] → enseignant: []

// Lignes 76, 120, 158
if (!['etudiant', 'parent', 'professeur'].includes(type))
→ if (!['etudiant', 'parent', 'enseignant'].includes(type))
```

#### `backend/src/pedagogique/pedagogique.controller.ts`
```typescript
// Remplacer toutes les occurrences
@Roles(UserRole.PROFESSEUR, ...) → @Roles(UserRole.ENSEIGNANT, ...)
```

#### `backend/src/logistics/logistics.controller.ts`
```typescript
// Lignes 17, 97, 104
@Roles('logistique', 'admin', 'secretaire', 'professeur')
→ @Roles('logistique', 'admin', 'secretaire', 'enseignant')
```

#### `backend/src/examens/examens.controller.ts`
```typescript
// Lignes 17, 24
@Roles('professeur', ...) → @Roles('enseignant', ...)
```

#### `backend/src/communication/communication.controller.ts`
```typescript
// Lignes 268, 281
@Roles('communication', 'admin', 'professeur', ...)
→ @Roles('communication', 'admin', 'enseignant', ...)
```

#### `backend/src/academic/academic.controller.ts`
```typescript
// Ligne 206
@ApiOperation({ summary: 'Liste des enseignants (professeurs)' })
→ @ApiOperation({ summary: 'Liste des enseignants' })
```

### 3. Services (4 fichiers)

#### `backend/src/tenants/tenants.service.ts`
```typescript
// Ligne 419
WHERE role = 'professeur' AND actif = true
→ WHERE role = 'enseignant' AND actif = true
```

#### `backend/src/dashboard/president.service.ts`
```typescript
// Lignes 26-27
WHERE role = 'professeur' AND actif = true
→ WHERE role = 'enseignant' AND actif = true

WHERE role NOT IN ('etudiant', 'parent', 'professeur')
→ WHERE role NOT IN ('etudiant', 'parent', 'enseignant')
```

#### `backend/src/academic/academic.service.ts`
```typescript
// Lignes 515, 521
// Enseignants (Utilisateurs avec rôle professeur)
→ // Enseignants (Utilisateurs avec rôle enseignant)

WHERE role = 'professeur' AND actif = true
→ WHERE role = 'enseignant' AND actif = true
```

#### `backend/src/admin/admin.service.ts`
```typescript
// Lignes 77, 243
WHERE role = 'professeur' AND actif = true
→ WHERE role = 'enseignant' AND actif = true

COUNT(CASE WHEN role = 'professeur' THEN 1 END)
→ COUNT(CASE WHEN role = 'enseignant' THEN 1 END)
```

---

## 📝 ÉTAPE 3 : Fichiers Frontend à Modifier

### Rechercher dans frontend/src
```bash
# Chercher tous les fichiers contenant "professeur"
grep -r "professeur" frontend/src --include="*.tsx" --include="*.ts"
```

### Fichiers à modifier (estimé)

1. **Routes** : `frontend/src/App.tsx`
   - `/portail/professeur` → `/portail/enseignant`

2. **Composants** : `frontend/src/pages/portals/ProfesseurPortal.tsx`
   - Renommer en `EnseignantPortal.tsx`
   - Changer tous les labels "Professeur" → "Enseignant"

3. **Sidebar** : `frontend/src/components/layout/Sidebar.tsx`
   - Changer les labels et chemins

4. **Types** : `frontend/src/types/index.ts`
   - `role: 'professeur'` → `role: 'enseignant'`

5. **Store** : `frontend/src/store/authStore.ts`
   - Vérifier les rôles

---

## 📊 RÉSUMÉ DES MODIFICATIONS

### Backend
- ✅ 1 enum à modifier
- ✅ 2 fichiers à renommer (controller + service)
- ✅ 14 controllers à modifier
- ✅ 4 services à modifier
- ✅ 1 module à modifier

### Frontend
- ✅ Routes à modifier
- ✅ Composants à renommer
- ✅ Labels UI à changer
- ✅ Types à mettre à jour

### Base de Données
- ✅ Script de migration créé
- ✅ Applique à tous les tenants

---

## 🚀 ORDRE D'EXÉCUTION

### 1. Base de Données (5 min)
```bash
node backend/scripts/apply-rename-professeur-to-enseignant.js
```

### 2. Backend - Enum (CRITIQUE)
Modifier `backend/src/common/enums/roles.enum.ts` en premier

### 3. Backend - Renommer fichiers
```bash
cd backend/src/portail
mv professeur.controller.ts enseignant.controller.ts
mv professeur.service.ts enseignant.service.ts
```

### 4. Backend - Modifier contenu
Utiliser "Find & Replace" dans VS Code :
- `professeur` → `enseignant`
- `Professeur` → `Enseignant`
- `PROFESSEUR` → `ENSEIGNANT`

### 5. Frontend - Renommer fichiers
```bash
cd frontend/src/pages/portals
mv ProfesseurPortal.tsx EnseignantPortal.tsx
```

### 6. Frontend - Modifier contenu
Utiliser "Find & Replace" dans VS Code :
- `professeur` → `enseignant`
- `Professeur` → `Enseignant`
- `/portail/professeur` → `/portail/enseignant`

### 7. Tester
```bash
# Backend
npm run start:dev

# Frontend
npm run dev

# Tester la connexion avec un compte enseignant
```

---

## ⚠️ POINTS D'ATTENTION

1. **Enum en premier** : Modifier `roles.enum.ts` avant tout le reste
2. **Imports** : Vérifier tous les imports après renommage
3. **Routes** : Mettre à jour les routes frontend ET backend
4. **Guards** : Vérifier que les guards utilisent le nouveau rôle
5. **Tests** : Mettre à jour les tests si existants

---

## ✅ CHECKLIST

### Base de Données
- [ ] Exécuter `apply-rename-professeur-to-enseignant.js`
- [ ] Vérifier que tous les utilisateurs ont `role = 'enseignant'`

### Backend
- [ ] Modifier `roles.enum.ts`
- [ ] Renommer `professeur.controller.ts` → `enseignant.controller.ts`
- [ ] Renommer `professeur.service.ts` → `enseignant.service.ts`
- [ ] Modifier `portail.module.ts`
- [ ] Modifier tous les `@Roles('professeur')` → `@Roles('enseignant')`
- [ ] Modifier toutes les requêtes SQL `role = 'professeur'`
- [ ] Vérifier les imports

### Frontend
- [ ] Renommer `ProfesseurPortal.tsx` → `EnseignantPortal.tsx`
- [ ] Modifier `App.tsx` (routes)
- [ ] Modifier `Sidebar.tsx` (labels et chemins)
- [ ] Modifier les types
- [ ] Changer tous les labels UI
- [ ] Vérifier les imports

### Tests
- [ ] Tester la connexion avec un compte enseignant
- [ ] Tester l'accès au portail enseignant
- [ ] Tester les permissions
- [ ] Vérifier les logs (pas d'erreur "professeur")

---

## 📝 COMMANDES UTILES

```bash
# Chercher toutes les occurrences de "professeur" dans le backend
grep -r "professeur" backend/src --include="*.ts" | wc -l

# Chercher toutes les occurrences de "professeur" dans le frontend
grep -r "professeur" frontend/src --include="*.tsx" --include="*.ts" | wc -l

# Remplacer dans tous les fichiers (avec sed)
find backend/src -name "*.ts" -exec sed -i 's/professeur/enseignant/g' {} +
find frontend/src -name "*.tsx" -name "*.ts" -exec sed -i 's/professeur/enseignant/g' {} +
```

---

## 🎯 RÉSULTAT ATTENDU

Après cette migration :
- ✅ Tous les utilisateurs auront `role = 'enseignant'`
- ✅ Toutes les routes utiliseront `/portail/enseignant`
- ✅ Tous les labels afficheront "Enseignant"
- ✅ Le code sera cohérent et standardisé
- ✅ Pas de référence à "professeur" dans le code

**Durée estimée** : 2-3 heures pour tout modifier et tester