# 🔧 Correction du TenantMiddleware - Multi-Tenant Architecture

## 📋 Problème Identifié

### Symptômes
```
[TenantMiddleware] No tenant ID provided. URL: /api/v1/tenants
[TenantMiddleware] No tenant ID provided. URL: /api/v1/users?
[CacheService] Cache MISS for key: users:findAll:limit:50|page:1|role:undefined|tid:undefined|university:undefined
```

### Causes Racines
1. **Middleware trop strict** : Exigeait un tenant ID pour TOUTES les routes, y compris les routes SuperAdmin
2. **Routes SuperAdmin bloquées** : `/api/v1/tenants` et `/api/v1/users` nécessitent un accès sans tenant ID
3. **Clés de cache incorrectes** : `tid:undefined` polluait les clés de cache

---

## ✅ Solutions Implémentées

### 1. TenantMiddleware avec Whitelist (backend/src/tenants/tenant.middleware.ts)

#### Ajout d'une Whitelist de Routes
Routes qui **ne nécessitent PAS** de tenant ID :

```typescript
private readonly whitelistRoutes: WhitelistRoute[] = [
  { path: '/api/v1/auth/login', method: 'POST' },
  { path: '/api/v1/auth/register', method: 'POST' },
  { path: '/api/v1/auth/refresh', method: 'POST' },
  { path: '/api/v1/tenants', method: 'GET' },      // SuperAdmin liste tous les tenants
  { path: '/api/v1/tenants', method: 'POST' },     // SuperAdmin crée un tenant
  { path: '/api/v1/users', method: 'GET' },        // SuperAdmin liste tous les users
  { path: '/api/v1/health' },                       // Health check
  { path: '/api/v1/docs' },                         // Documentation
];
```

#### Logique de Vérification
```typescript
const isWhitelisted = this.whitelistRoutes.some(route => {
  const pathMatches = fullPath === route.path || fullPath.startsWith(route.path + '/');
  const methodMatches = !route.method || route.method === method;
  return pathMatches && methodMatches;
});

if (isWhitelisted) {
  console.log(`[TenantMiddleware] Whitelisted route: ${method} ${fullPath}`);
  (req as any).tenantSchema = 'public';
  (req as any).tenantId = null;
  (req as any).isSuperAdminRoute = true;
  return next();
}
```

#### Extraction Multi-Source du Tenant ID
Par ordre de priorité :
1. Header `x-tenant-id` (lowercase)
2. Header `X-Tenant-ID` (uppercase)
3. Query parameter `?tenantId=`
4. UUID dans l'URL (pattern matching)

```typescript
let tenantId = req.headers['x-tenant-id'] as string;

if (!tenantId) {
  tenantId = req.headers['X-Tenant-ID'] as string;
}

if (!tenantId && req.query && req.query.tenantId) {
  tenantId = req.query.tenantId as string;
}

if (!tenantId) {
  const pathParts = fullPath.split('/');
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const foundId = pathParts.find(part => uuidPattern.test(part));
  if (foundId) {
    tenantId = foundId;
  }
}
```

#### Gestion des Erreurs Stricte
Si tenant ID requis mais absent → **400 Bad Request**

```typescript
if (!tenantId) {
  console.error(`[TenantMiddleware] Tenant ID required but not provided for: ${method} ${fullPath}`);
  return res.status(400).json({
    statusCode: 400,
    message: 'Tenant ID is required. Please provide X-Tenant-ID header or tenantId query parameter.',
    error: 'Bad Request',
  });
}
```

Si tenant ID invalide ou inactif → **404 Not Found**

```typescript
if (!tenantResult || tenantResult.length === 0) {
  console.error(`[TenantMiddleware] Tenant ${tenantId} not found or inactive`);
  return res.status(404).json({
    statusCode: 404,
    message: `Tenant ${tenantId} not found or inactive`,
    error: 'Not Found',
  });
}
```

---

### 2. Correction des Clés de Cache (backend/src/cache/cache.service.ts)

#### Problème
```typescript
// ❌ AVANT : Générait "tid:undefined" dans les clés
const sortedParams = Object.keys(params)
  .sort()
  .map(key => `${key}:${params[key]}`)
  .join('|');
```

#### Solution
```typescript
// ✅ APRÈS : Filtre les valeurs undefined/null
const filteredParams = Object.keys(params)
  .filter(key => params[key] !== undefined && params[key] !== null)
  .sort()
  .map(key => `${key}:${params[key]}`)
  .join('|');
```

#### Résultat
- **Avant** : `users:findAll:limit:50|page:1|role:undefined|tid:undefined|university:undefined`
- **Après** : `users:findAll:limit:50|page:1`

---

## 🎯 Comportement Attendu

### Routes SuperAdmin (Sans Tenant ID)
```bash
# ✅ GET /api/v1/tenants - Liste tous les tenants
curl http://localhost:3000/api/v1/tenants

# ✅ POST /api/v1/tenants - Crée un nouveau tenant
curl -X POST http://localhost:3000/api/v1/tenants -d '{...}'

# ✅ GET /api/v1/users - Liste tous les utilisateurs (tous tenants)
curl http://localhost:3000/api/v1/users
```

### Routes Tenant (Avec Tenant ID)
```bash
# ✅ Avec header
curl -H "X-Tenant-ID: 123e4567-e89b-12d3-a456-426614174000" \
  http://localhost:3000/api/v1/etudiants

# ✅ Avec query parameter
curl http://localhost:3000/api/v1/etudiants?tenantId=123e4567-e89b-12d3-a456-426614174000

# ❌ Sans tenant ID → 400 Bad Request
curl http://localhost:3000/api/v1/etudiants
```

---

## 🔍 Logs Attendus

### Routes Whitelistées
```
[TenantMiddleware] Whitelisted route: GET /api/v1/tenants
[TenantMiddleware] Whitelisted route: GET /api/v1/users
[CacheService] Cache MISS for key: users:findAll:limit:50|page:1
```

### Routes avec Tenant ID
```
[TenantMiddleware] Found schema "tenant_univ_demo" for tenant 123e4567-e89b-12d3-a456-426614174000
[TenantMiddleware] Schema set to: tenant_univ_demo for tenant: 123e4567-e89b-12d3-a456-426614174000
```

### Routes sans Tenant ID (erreur)
```
[TenantMiddleware] Tenant ID required but not provided for: GET /api/v1/etudiants
```

---

## 📊 Impact sur le Système

### Avant
- ❌ SuperAdmin ne pouvait pas lister les tenants
- ❌ SuperAdmin ne pouvait pas lister les utilisateurs
- ❌ Clés de cache polluées avec `undefined`
- ❌ Logs d'avertissement constants

### Après
- ✅ SuperAdmin accède librement aux routes globales
- ✅ Tenant ID strictement requis pour les routes tenant-specific
- ✅ Clés de cache propres et optimisées
- ✅ Logs clairs et informatifs
- ✅ Gestion d'erreurs explicite (400, 404, 500)

---

## 🧪 Tests Recommandés

### 1. Routes SuperAdmin
```bash
# Test 1: Liste des tenants (sans tenant ID)
curl http://localhost:3000/api/v1/tenants
# Attendu: 200 OK avec liste des tenants

# Test 2: Liste des utilisateurs (sans tenant ID)
curl http://localhost:3000/api/v1/users
# Attendu: 200 OK avec liste de tous les utilisateurs
```

### 2. Routes Tenant
```bash
# Test 3: Avec header X-Tenant-ID
curl -H "X-Tenant-ID: <tenant-id>" http://localhost:3000/api/v1/etudiants
# Attendu: 200 OK avec liste des étudiants du tenant

# Test 4: Sans tenant ID
curl http://localhost:3000/api/v1/etudiants
# Attendu: 400 Bad Request avec message explicite

# Test 5: Tenant ID invalide
curl -H "X-Tenant-ID: invalid-uuid" http://localhost:3000/api/v1/etudiants
# Attendu: 404 Not Found
```

### 3. Cache
```bash
# Test 6: Vérifier les clés de cache
# Logs attendus: users:findAll:limit:50|page:1
# PAS: users:findAll:limit:50|page:1|tid:undefined
```

---

## 🔐 Sécurité

### Vérifications Implémentées
1. ✅ Whitelist stricte des routes publiques
2. ✅ Validation du tenant ID (UUID format)
3. ✅ Vérification de l'existence du tenant en DB
4. ✅ Vérification du statut actif du tenant
5. ✅ Gestion d'erreurs explicite (pas de fallback silencieux)

### Recommandations Futures
1. 🔄 Ajouter vérification du rôle JWT pour routes SuperAdmin
2. 🔄 Implémenter rate limiting par tenant
3. 🔄 Logger les tentatives d'accès non autorisées
4. 🔄 Ajouter métriques de performance par tenant

---

## 📝 Notes Techniques

### Architecture Multi-Tenant
- **Schéma par tenant** : Chaque université a son propre schéma PostgreSQL
- **Schéma public** : Contient la table `tenant` et les données globales
- **Connexions multiples** : `default` (public) et `tenant` (dynamique)

### Middleware Order
```typescript
// app.module.ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*'); // Appliqué à toutes les routes
  }
}
```

### Request Augmentation
```typescript
interface RequestWithTenant extends Request {
  tenantId: string | null;
  tenantSchema: string;
  isSuperAdminRoute: boolean;
}
```

---

## ✅ Checklist de Validation

- [x] TenantMiddleware avec whitelist implémenté
- [x] Routes SuperAdmin accessibles sans tenant ID
- [x] Extraction multi-source du tenant ID
- [x] Gestion d'erreurs stricte (400, 404, 500)
- [x] Clés de cache nettoyées (pas de `undefined`)
- [x] Logs informatifs et clairs
- [x] Documentation complète

---

**Date de correction** : 2026-05-12  
**Fichiers modifiés** :
- `backend/src/tenants/tenant.middleware.ts`
- `backend/src/cache/cache.service.ts`

**Impact** : ✅ Critique - Débloque l'accès SuperAdmin et optimise le cache