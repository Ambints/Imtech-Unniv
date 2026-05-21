# 🔧 FIX - Erreur 400 Bad Request sur `/president/dashboard/kpi`

## 🚨 Problème

**Erreur**: `400 Bad Request` lors de l'appel à `GET /president/dashboard/kpi?anneeId=...`

**Log Backend**:
```
[Nest] 18644  - 17/05/2026, 23:14:35     LOG [TenantMiddleware] Tenant ID: eaceef7f-...
GET /api/v1/president/dashboard/kpi?anneeId=1 400 - - 15.625 ms
```

## 🔍 Diagnostic

### Cause Racine
Le frontend envoie `anneeId=1` (number) alors que le backend attend un **UUID valide** (string format UUID).

### Validation Backend
```typescript
// president.controller.ts ligne 52
@Query('anneeId', ParseUUIDPipe) anneeId: string
```

`ParseUUIDPipe` rejette toute valeur qui n'est pas un UUID valide (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

### Valeur Envoyée
- ❌ `anneeId=1` → Rejeté (pas un UUID)
- ✅ `anneeId=550e8400-e29b-41d4-a716-446655440000` → Accepté

## ✅ Solutions

### Solution 1: Passer un UUID Valide depuis le Frontend (RECOMMANDÉ)

Le frontend doit récupérer l'UUID de l'année académique active depuis l'API ou le store.

**Exemple de correction dans le composant Dashboard**:

```typescript
// DashboardPage.tsx
import { useKpiDashboard } from '../hooks/useKpiDashboard';
import { useAnneeAcademiqueActive } from '@/hooks/useAnneeAcademique'; // À créer

export function DashboardPage() {
  // Récupérer l'année académique active (UUID)
  const { data: anneeActive } = useAnneeAcademiqueActive();
  
  // Passer l'UUID au hook KPI
  const { data: kpi, isLoading, error } = useKpiDashboard(anneeActive?.id);
  
  if (!anneeActive) {
    return <div>Chargement de l'année académique...</div>;
  }
  
  if (isLoading) {
    return <div>Chargement des KPI...</div>;
  }
  
  if (error) {
    return <div>Erreur: {error.message}</div>;
  }
  
  return (
    <div>
      <h1>Dashboard - Année {anneeActive.libelle}</h1>
      {/* Afficher les KPI */}
    </div>
  );
}
```

**Hook pour récupérer l'année académique active**:

```typescript
// hooks/useAnneeAcademique.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface AnneeAcademique {
  id: string; // UUID
  libelle: string;
  date_debut: string;
  date_fin: string;
  active: boolean;
}

export function useAnneeAcademiqueActive() {
  return useQuery({
    queryKey: ['annee-academique', 'active'],
    queryFn: async () => {
      const response = await axios.get<AnneeAcademique>(
        '/api/v1/annee-academique/active'
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### Solution 2: Endpoint Backend pour Récupérer l'Année Active

Si l'endpoint `/annee-academique/active` n'existe pas, créer un service simple:

```typescript
// backend/src/annee-academique/annee-academique.controller.ts
@Get('active')
async getAnneeActive(@Req() req: RequestWithTenant) {
  const result = await this.dataSource.query(
    `SELECT id, libelle, date_debut, date_fin, active
     FROM ${req.tenantSchema}.annee_academique
     WHERE active = true
     LIMIT 1`
  );
  
  if (!result || result.length === 0) {
    throw new NotFoundException('Aucune année académique active');
  }
  
  return result[0];
}
```

### Solution 3: Valeur par Défaut Temporaire (POUR DEBUG UNIQUEMENT)

Si vous voulez tester rapidement, utilisez un UUID hardcodé:

```typescript
// DashboardPage.tsx - TEMPORAIRE
const TEMP_ANNEE_ID = '550e8400-e29b-41d4-a716-446655440000'; // Remplacer par un vrai UUID de votre DB

const { data: kpi } = useKpiDashboard(TEMP_ANNEE_ID);
```

Pour trouver un UUID valide dans votre base:

```sql
-- Exécuter dans psql
SELECT id, libelle, active 
FROM tenant_ispm.annee_academique 
WHERE active = true;
```

### Solution 4: Modifier le Backend pour Accepter "active" (ALTERNATIVE)

Si vous voulez permettre `anneeId=active` pour récupérer l'année active automatiquement:

```typescript
// president.controller.ts
@Get('dashboard/kpi')
async getKpiDashboard(
  @Req() req: any,
  @Query('anneeId') anneeIdOrActive: string // Pas de ParseUUIDPipe
) {
  let anneeId: string;
  
  if (anneeIdOrActive === 'active') {
    // Récupérer l'année active
    const result = await this.dataSource.query(
      `SELECT id FROM ${req.tenantSchema}.annee_academique WHERE active = true LIMIT 1`
    );
    if (!result || result.length === 0) {
      throw new NotFoundException('Aucune année académique active');
    }
    anneeId = result[0].id;
  } else {
    // Valider que c'est un UUID
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(anneeIdOrActive)) {
      throw new BadRequestException('anneeId doit être un UUID valide ou "active"');
    }
    anneeId = anneeIdOrActive;
  }
  
  return this.presidentService.getKpiDashboard(req.tenantSchema, anneeId);
}
```

Puis côté frontend:

```typescript
const { data: kpi } = useKpiDashboard('active');
```

## 🎯 Recommandation

**Utiliser la Solution 1** : Récupérer l'année académique active via un hook dédié et passer son UUID au dashboard.

C'est la solution la plus propre et maintenable:
- ✅ Respecte le typage UUID partout
- ✅ Permet de changer d'année facilement (dropdown)
- ✅ Cohérent avec l'architecture multi-tenant
- ✅ Pas de valeurs magiques ("active")

## 📝 Checklist de Correction

- [ ] Créer `useAnneeAcademiqueActive()` hook
- [ ] Créer endpoint backend `/annee-academique/active` si nécessaire
- [ ] Modifier `DashboardPage.tsx` pour utiliser l'UUID de l'année active
- [ ] Tester avec un UUID valide
- [ ] Vérifier que le 400 est résolu
- [ ] Ajouter un fallback si aucune année active

## 🧪 Test Rapide

```bash
# 1. Récupérer un UUID d'année académique valide
psql -d Imtech_SaaS -c "SELECT id FROM tenant_ispm.annee_academique WHERE active = true;"

# 2. Tester l'endpoint avec curl
curl -X GET "http://localhost:4000/api/v1/president/dashboard/kpi?anneeId=<UUID_ICI>" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "X-Tenant-ID: <TENANT_UUID>"

# 3. Vérifier la réponse (devrait être 200 OK)
```

---

*Document créé le 17 Mai 2026 par Bob*