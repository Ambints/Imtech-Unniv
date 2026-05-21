# 📝 DÉTAILS FRONTEND : Renommer "professeur" en "enseignant"

## 🎯 FICHIERS FRONTEND À MODIFIER (11 fichiers)

### 1. Types (PRIORITÉ HAUTE) ⭐
**Fichier** : `frontend/src/types/index.ts`
```typescript
// Ligne 6
| 'etudiant' | 'parent' | 'professeur';
→ | 'etudiant' | 'parent' | 'enseignant';
```

---

### 2. Composant Principal - Portail Enseignant ⭐⭐⭐
**Fichier** : `frontend/src/pages/portals/ProfesseurPortal.tsx`

#### Actions à effectuer :
1. **Renommer le fichier** : `ProfesseurPortal.tsx` → `EnseignantPortal.tsx`
2. **Renommer l'export** (ligne 70) : 
   ```typescript
   export const ProfesseurPortal: React.FC = () => {
   → export const EnseignantPortal: React.FC = () => {
   ```

3. **Modifier les URLs API** (7 occurrences) :
   - Ligne 128: `/portail/professeur/mes-cours` → `/portail/enseignant/mes-cours`
   - Ligne 137: `/portail/professeur/mes-stats` → `/portail/enseignant/mes-stats`
   - Ligne 146: `/portail/professeur/sessions-evaluation` → `/portail/enseignant/sessions-evaluation`
   - Ligne 155: `/portail/professeur/mes-etudiants/` → `/portail/enseignant/mes-etudiants/`
   - Ligne 164: `/portail/professeur/supports-cours` → `/portail/enseignant/supports-cours`
   - Ligne 173: `/portail/professeur/mes-demandes-ressources` → `/portail/enseignant/mes-demandes-ressources`

4. **Modifier les chemins de navigation** (6 occurrences) :
   - Ligne 352: `/portail/professeur/saisie-notes/` → `/portail/enseignant/saisie-notes/`
   - Ligne 410: `/portail/professeur/presences/` → `/portail/enseignant/presences/`
   - Ligne 534: `/portail/professeur/upload-ressource` → `/portail/enseignant/upload-ressource`
   - Ligne 610: `/portail/professeur/nouvelle-demande` → `/portail/enseignant/nouvelle-demande`

5. **Modifier le titre** (ligne 697) :
   ```typescript
   Portail Professeur
   → Portail Enseignant
   ```

6. **Modifier les onglets** (lignes 742-747) :
   ```typescript
   { key: 'cours', label: 'Mes Cours', icon: <BookText size={16} />, path: '/portail/professeur' },
   { key: 'notes', label: 'Saisie Notes', icon: <Pencil size={16} />, path: '/portail/professeur/notes' },
   { key: 'presences', label: 'Présences', icon: <CheckSquare size={16} />, path: '/portail/professeur/presences' },
   { key: 'etudiants', label: 'Étudiants', icon: <GraduationCap size={16} />, path: '/portail/professeur/etudiants' },
   { key: 'ressources', label: 'Ressources', icon: <Folder size={16} />, path: '/portail/professeur/ressources' },
   { key: 'demandes', label: 'Demandes', icon: <FlaskConical size={16} />, path: '/portail/professeur/demandes' }
   
   → Remplacer tous les '/portail/professeur' par '/portail/enseignant'
   ```

---

### 3. Routes de l'Application ⭐⭐⭐
**Fichier** : `frontend/src/App.tsx`

#### Modifications :
```typescript
// Ligne 39 - Import
import { ProfesseurPortal } from './pages/portals/ProfesseurPortal';
→ import { EnseignantPortal } from './pages/portals/EnseignantPortal';

// Ligne 176 - Mapping des rôles
professeur: '/portail/professeur',
→ enseignant: '/portail/enseignant',

// Lignes 331-336 - Routes (7 routes à modifier)
<Route path="/portail/professeur" element={<Wrapped><ProfesseurPortal /></Wrapped>} />
<Route path="/portail/professeur/notes" element={<Wrapped><ProfesseurPortal /></Wrapped>} />
<Route path="/portail/professeur/presences" element={<Wrapped><ProfesseurPortal /></Wrapped>} />
<Route path="/portail/professeur/etudiants" element={<Wrapped><ProfesseurPortal /></Wrapped>} />
<Route path="/portail/professeur/ressources" element={<Wrapped><ProfesseurPortal /></Wrapped>} />
<Route path="/portail/professeur/demandes" element={<Wrapped><ProfesseurPortal /></Wrapped>} />

→ Remplacer par :

<Route path="/portail/enseignant" element={<Wrapped><EnseignantPortal /></Wrapped>} />
<Route path="/portail/enseignant/notes" element={<Wrapped><EnseignantPortal /></Wrapped>} />
<Route path="/portail/enseignant/presences" element={<Wrapped><EnseignantPortal /></Wrapped>} />
<Route path="/portail/enseignant/etudiants" element={<Wrapped><EnseignantPortal /></Wrapped>} />
<Route path="/portail/enseignant/ressources" element={<Wrapped><EnseignantPortal /></Wrapped>} />
<Route path="/portail/enseignant/demandes" element={<Wrapped><EnseignantPortal /></Wrapped>} />
```

---

### 4. Sidebar Navigation ⭐⭐
**Fichier** : `frontend/src/components/layout/Sidebar.tsx`

#### Modifications :
```typescript
// Lignes 128-135 - Menu professeur → enseignant
professeur: [
  { label: 'Mes Cours', icon: <BookText size={18} />, path: '/portail/professeur' },
  { label: 'Saisie des Notes', icon: <Pencil size={18} />, path: '/portail/professeur/notes' },
  { label: 'Présences Étudiants', icon: <CheckSquare size={18} />, path: '/portail/professeur/presences' },
  { label: 'Mes Étudiants', icon: <GradCap size={18} />, path: '/portail/professeur/etudiants' },
  { label: 'Ressources Pédagogiques', icon: <Folder size={18} />, path: '/portail/professeur/ressources' },
  { label: 'Demandes Matériel', icon: <FlaskConical size={18} />, path: '/portail/professeur/demandes' },
],

→ Remplacer par :

enseignant: [
  { label: 'Mes Cours', icon: <BookText size={18} />, path: '/portail/enseignant' },
  { label: 'Saisie des Notes', icon: <Pencil size={18} />, path: '/portail/enseignant/notes' },
  { label: 'Présences Étudiants', icon: <CheckSquare size={18} />, path: '/portail/enseignant/presences' },
  { label: 'Mes Étudiants', icon: <GradCap size={18} />, path: '/portail/enseignant/etudiants' },
  { label: 'Ressources Pédagogiques', icon: <Folder size={18} />, path: '/portail/enseignant/ressources' },
  { label: 'Demandes Matériel', icon: <FlaskConical size={18} />, path: '/portail/enseignant/demandes' },
],

// Ligne 143 - Labels des rôles
entretien: 'Service Entretien', etudiant: 'Étudiant', parent: 'Parent', professeur: 'Professeur',
→ entretien: 'Service Entretien', etudiant: 'Étudiant', parent: 'Parent', enseignant: 'Enseignant',

// Ligne 299 - Vérification des chemins
item.path === '/portail/professeur' ||
→ item.path === '/portail/enseignant' ||
```

---

### 5. Page de Connexion ⭐
**Fichier** : `frontend/src/pages/auth/LoginPage.tsx`

```typescript
// Ligne 15
etudiant: '/portail/etudiant', parent: '/portail/parent', professeur: '/portail/professeur',
→ etudiant: '/portail/etudiant', parent: '/portail/parent', enseignant: '/portail/enseignant',
```

---

### 6. Dashboard Admin ⭐⭐
**Fichier** : `frontend/src/pages/admin/AdminDashboard.tsx`

```typescript
// Ligne 59 - État initial
professeur: []
→ enseignant: []

// Ligne 1221 - Portails disponibles
{ type: 'professeur', label: 'Portail Professeur', icon: UserCog, color: 'warning' }
→ { type: 'enseignant', label: 'Portail Enseignant', icon: UserCog, color: 'warning' }

// Ligne 1298 - Labels des rôles
professeur: 'Professeur'
→ enseignant: 'Enseignant'

// Ligne 1308 - Couleurs des badges
professeur: 'secondary'
→ enseignant: 'secondary'

// Ligne 1506 - Options du formulaire
<option value="professeur">Professeur</option>
→ <option value="enseignant">Enseignant</option>
```

---

### 7. Gestion des Utilisateurs (Super Admin) ⭐
**Fichier** : `frontend/src/pages/super-admin/UserManagement.tsx`

```typescript
// Ligne 82 - Labels des rôles
professeur: 'Professeur'
→ enseignant: 'Enseignant'

// Ligne 323 - Options du formulaire
<option value="professeur">Professeur</option>
→ <option value="enseignant">Enseignant</option>
```

---

### 8. Page Présences (Surveillance)
**Fichier** : `frontend/src/pages/surveillance/PresencesPage.tsx`

```typescript
// Ligne 15 - Type de données
professeur: string;
→ enseignant: string;

// Ligne 235 - Affichage
👨‍🏫 {cours.professeur}
→ 👨‍🏫 {cours.enseignant}
```

---

### 9. Emploi du Temps (Surveillance)
**Fichier** : `frontend/src/pages/surveillance/EmploiDuTempsSurveillance.tsx`

```typescript
// Ligne 13 - Type de données
professeur: string;
→ enseignant: string;

// Lignes 71, 85, 99, 113, 127, 141, 155, 169, 183, 197 - Données mockées (10 occurrences)
professeur: 'Dr. KOUASSI',
professeur: 'Prof. DIALLO',
professeur: 'Dr. TRAORE',
// etc.
→ Remplacer tous par : enseignant: '...'

// Ligne 440 - Titre du tooltip
title={`${c.matiere} - ${c.professeur}`}
→ title={`${c.matiere} - ${c.enseignant}`}

// Ligne 524 - Label d'affichage
👨‍🏫 <strong>Professeur:</strong> {c.professeur}
→ 👨‍🏫 <strong>Enseignant:</strong> {c.enseignant}
```

---

### 10. Page RH
**Fichier** : `frontend/src/pages/rh/RHPage.tsx`

```typescript
// Ligne 52 - Données mockées
poste: 'Professeur Titulaire',
→ poste: 'Enseignant Titulaire',
```

---

### 11. Gestion Communication
**Fichier** : `frontend/src/pages/admin/GestionCommunicationPage.tsx`

```typescript
// Ligne 532 - Option de destinataire
<option value="professeurs">Professeurs</option>
→ <option value="enseignants">Enseignants</option>
```

---

### 12. Cours Étudiant
**Fichier** : `frontend/src/pages/portals/etudiant/CoursEtudiantPage.tsx`

```typescript
// Ligne 77 - Texte informatif
Consultez régulièrement cette section pour télécharger les documents partagés par vos professeurs.
→ Consultez régulièrement cette section pour télécharger les documents partagés par vos enseignants.
```

---

## 📊 RÉSUMÉ DES MODIFICATIONS FRONTEND

| Fichier | Priorité | Modifications | Type |
|---------|----------|---------------|------|
| `types/index.ts` | ⭐⭐⭐ | 1 ligne | Type |
| `ProfesseurPortal.tsx` | ⭐⭐⭐ | Renommer + 20+ lignes | Composant |
| `App.tsx` | ⭐⭐⭐ | Import + 8 routes | Routes |
| `Sidebar.tsx` | ⭐⭐ | Menu + labels | Navigation |
| `LoginPage.tsx` | ⭐ | 1 ligne | Redirection |
| `AdminDashboard.tsx` | ⭐⭐ | 5 occurrences | Admin |
| `UserManagement.tsx` | ⭐ | 2 occurrences | Super Admin |
| `PresencesPage.tsx` | ⭐ | 2 occurrences | Surveillance |
| `EmploiDuTempsSurveillance.tsx` | ⭐ | 13 occurrences | Surveillance |
| `RHPage.tsx` | ⭐ | 1 occurrence | RH |
| `GestionCommunicationPage.tsx` | ⭐ | 1 occurrence | Communication |
| `CoursEtudiantPage.tsx` | ⭐ | 1 occurrence | Portail Étudiant |

**Total** : 12 fichiers, ~55 modifications

---

## 🚀 ORDRE D'EXÉCUTION RECOMMANDÉ

### Phase 1 : Fichiers Critiques (Priorité ⭐⭐⭐)
1. `frontend/src/types/index.ts` - Type de base
2. Renommer `ProfesseurPortal.tsx` → `EnseignantPortal.tsx`
3. Modifier le contenu de `EnseignantPortal.tsx`
4. `frontend/src/App.tsx` - Routes et imports

### Phase 2 : Navigation (Priorité ⭐⭐)
5. `frontend/src/components/layout/Sidebar.tsx`
6. `frontend/src/pages/admin/AdminDashboard.tsx`

### Phase 3 : Autres Pages (Priorité ⭐)
7. `frontend/src/pages/auth/LoginPage.tsx`
8. `frontend/src/pages/super-admin/UserManagement.tsx`
9. Tous les autres fichiers avec données mockées

---

## ✅ CHECKLIST FRONTEND

### Fichiers Critiques
- [ ] Modifier `types/index.ts`
- [ ] Renommer `ProfesseurPortal.tsx` → `EnseignantPortal.tsx`
- [ ] Modifier export dans `EnseignantPortal.tsx`
- [ ] Modifier toutes les URLs API dans `EnseignantPortal.tsx`
- [ ] Modifier tous les chemins de navigation dans `EnseignantPortal.tsx`
- [ ] Modifier le titre dans `EnseignantPortal.tsx`
- [ ] Modifier les onglets dans `EnseignantPortal.tsx`
- [ ] Modifier import dans `App.tsx`
- [ ] Modifier mapping des rôles dans `App.tsx`
- [ ] Modifier toutes les routes dans `App.tsx`

### Navigation
- [ ] Modifier menu dans `Sidebar.tsx`
- [ ] Modifier labels des rôles dans `Sidebar.tsx`
- [ ] Modifier vérification des chemins dans `Sidebar.tsx`

### Pages Admin
- [ ] Modifier état initial dans `AdminDashboard.tsx`
- [ ] Modifier portails disponibles dans `AdminDashboard.tsx`
- [ ] Modifier labels des rôles dans `AdminDashboard.tsx`
- [ ] Modifier couleurs des badges dans `AdminDashboard.tsx`
- [ ] Modifier options du formulaire dans `AdminDashboard.tsx`
- [ ] Modifier labels dans `UserManagement.tsx`
- [ ] Modifier options dans `UserManagement.tsx`

### Autres Pages
- [ ] Modifier redirection dans `LoginPage.tsx`
- [ ] Modifier types dans `PresencesPage.tsx`
- [ ] Modifier affichage dans `PresencesPage.tsx`
- [ ] Modifier types dans `EmploiDuTempsSurveillance.tsx`
- [ ] Modifier données mockées dans `EmploiDuTempsSurveillance.tsx`
- [ ] Modifier titre dans `EmploiDuTempsSurveillance.tsx`
- [ ] Modifier label dans `EmploiDuTempsSurveillance.tsx`
- [ ] Modifier poste dans `RHPage.tsx`
- [ ] Modifier option dans `GestionCommunicationPage.tsx`
- [ ] Modifier texte dans `CoursEtudiantPage.tsx`

### Tests
- [ ] Compiler le frontend sans erreur
- [ ] Tester la navigation vers `/portail/enseignant`
- [ ] Vérifier que tous les liens fonctionnent
- [ ] Vérifier que les appels API utilisent les bonnes URLs
- [ ] Tester la connexion avec un compte enseignant

---

## 💡 COMMANDES UTILES

```bash
# Renommer le fichier
cd frontend/src/pages/portals
mv ProfesseurPortal.tsx EnseignantPortal.tsx

# Chercher toutes les occurrences restantes
grep -r "professeur" frontend/src --include="*.tsx" --include="*.ts"

# Compiler pour vérifier les erreurs
cd frontend
npm run build
```

---

## ⚠️ POINTS D'ATTENTION

1. **Renommer le fichier AVANT de modifier les imports** dans `App.tsx`
2. **Modifier le type dans `types/index.ts` EN PREMIER** pour éviter les erreurs TypeScript
3. **Vérifier tous les imports** après le renommage
4. **Tester la compilation** après chaque phase
5. **Ne pas oublier les données mockées** dans les pages de surveillance

---

## 🎯 RÉSULTAT ATTENDU

Après ces modifications :
- ✅ Le portail sera accessible via `/portail/enseignant`
- ✅ Tous les labels afficheront "Enseignant"
- ✅ Toutes les routes utiliseront le nouveau chemin
- ✅ Les appels API utiliseront les nouvelles URLs
- ✅ Le type TypeScript sera cohérent
- ✅ Aucune référence à "professeur" dans le frontend