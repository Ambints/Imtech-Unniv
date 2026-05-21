# Guide de Correction de l'Isolation des Tenants

## Problème Identifié

Lors de la création de contrats dans le module RH, les utilisateurs de tous les tenants sont visibles au lieu de voir uniquement les utilisateurs du tenant actuel.

## Cause

La requête SQL dans `backend/src/rh/rh.service.ts` n'utilisait pas explicitement le schéma du tenant, permettant à PostgreSQL de récupérer les données d'autres tenants.

---

## Solution Appliquée

### 1. Modification du Service RH

**Fichier:** `backend/src/rh/rh.service.ts`

La méthode `getUtilisateurs()` a été modifiée pour utiliser explicitement le schéma du tenant :

```typescript
async getUtilisateurs(): Promise<any[]> {
  this.logger.log(`[getUtilisateurs] Fetching users from schema: ${this.tenantSchema}`);
  const result = await this.query(`
    SELECT id, nom, prenom, email, role, actif
    FROM "${this.tenantSchema}".utilisateur
    ORDER BY nom, prenom
  `);
  this.logger.log(`[getUtilisateurs] Found ${result.length} users in schema ${this.tenantSchema}`);
  return this.toCamelCase(result);
}
```

**Changements clés:**
- ✅ Ajout du préfixe de schéma : `"${this.tenantSchema}".utilisateur`
- ✅ Ajout de logs pour le débogage
- ✅ Garantit l'isolation des données

---

## Étapes pour Appliquer la Correction

### 1. Redémarrer le Backend

**IMPORTANT:** Les modifications ne prendront effet qu'après le redémarrage du serveur backend.

```bash
# Arrêter le serveur (Ctrl+C dans le terminal)
# Puis redémarrer
cd backend
npm run start:dev
```

### 2. Vérifier l'Isolation

Exécutez le script de vérification :

```bash
psql -U postgres -d imtech_saas -f backend/scripts/verifier-isolation-tenants.sql
```

Ce script affichera :
- Le nombre d'utilisateurs par tenant
- Les emails en doublon entre tenants (ne devrait pas exister)
- Les données dans le schéma public (devrait être vide)

### 3. Tester dans l'Interface

1. **Se connecter à tenant_test**
   - Aller sur `localhost:3000/admin/rh`
   - Cliquer sur "Nouveau Contrat"
   - Vérifier que seuls les utilisateurs de tenant_test apparaissent

2. **Se connecter à tenant_ispm**
   - Aller sur `localhost:3000/admin/rh`
   - Cliquer sur "Nouveau Contrat"
   - Vérifier que seuls les utilisateurs de tenant_ispm apparaissent

---

## Vérification des Logs

Après redémarrage, vérifiez les logs du backend :

```
[RHService] [getUtilisateurs] Fetching users from schema: tenant_test
[RHService] [getUtilisateurs] Found 5 users in schema tenant_test
```

Si vous voyez `schema: public` ou un mauvais schéma, le problème persiste.

---

## Autres Endroits à Vérifier

Si le problème persiste, vérifiez ces autres services qui utilisent la table `utilisateur` :

### 1. Service Academic
**Fichier:** `backend/src/academic/academic.service.ts`

```typescript
// Ligne 252-254 - Vérifier que c'est bien dans le schéma tenant
const existingUser = await this.dataSource.query(
  `SELECT id FROM "${this.tenantSchema}".utilisateur WHERE email = $1`,
  [email]
);
```

### 2. Service Dashboard
**Fichier:** `backend/src/dashboard/president.service.ts`

```typescript
// Ligne 26-27 - Ajouter le schéma
this.dataSource.query(`SELECT COUNT(*) as count FROM "${schemaName}".utilisateur WHERE role = 'enseignant' AND actif = true`)
```

### 3. Service Communication
**Fichier:** `backend/src/communication/communication.service.ts`

```typescript
// Ligne 294-296 - Ajouter le schéma
SELECT DISTINCT u.id, u.email, u.telephone
FROM "${schemaName}".utilisateur u
JOIN "${schemaName}".inscription i ON i.etudiant_id = u.id
```

---

## Commandes Utiles

### Vérifier manuellement l'isolation

```sql
-- Compter les utilisateurs par tenant
SELECT 'tenant_test' as tenant, COUNT(*) FROM tenant_test.utilisateur
UNION ALL
SELECT 'tenant_ispm' as tenant, COUNT(*) FROM tenant_ispm.utilisateur;

-- Voir les utilisateurs d'un tenant spécifique
SELECT id, nom, prenom, email, role 
FROM tenant_test.utilisateur 
ORDER BY nom;

-- Vérifier qu'il n'y a pas de données dans public
SELECT COUNT(*) FROM public.utilisateur;
```

### Nettoyer les données du schéma public (si nécessaire)

```sql
-- ATTENTION: Ceci supprime les données du schéma public
-- À n'exécuter que si vous êtes sûr
DELETE FROM public.utilisateur WHERE TRUE;
```

---

## Checklist de Vérification

- [ ] Code modifié dans `backend/src/rh/rh.service.ts`
- [ ] Backend redémarré
- [ ] Script de vérification exécuté
- [ ] Test dans l'interface pour tenant_test
- [ ] Test dans l'interface pour tenant_ispm
- [ ] Logs vérifiés (bon schéma utilisé)
- [ ] Aucun utilisateur d'autres tenants visible

---

## En Cas de Problème Persistant

### 1. Vérifier le Middleware Tenant

**Fichier:** `backend/src/middleware/tenant.middleware.ts`

Assurez-vous que le middleware définit correctement `request.tenantSchema`.

### 2. Vérifier les Headers HTTP

Dans les outils de développement du navigateur (F12), onglet Network :
- Vérifier que le header `X-Tenant-Id` est présent
- Vérifier que sa valeur correspond au tenant actuel

### 3. Activer les Logs SQL

Dans `backend/src/app.module.ts`, activer les logs TypeORM :

```typescript
TypeOrmModule.forRoot({
  // ...
  logging: true, // Activer temporairement
  logger: 'advanced-console',
})
```

Cela affichera toutes les requêtes SQL exécutées.

---

## Prévention Future

Pour éviter ce problème à l'avenir :

1. **Toujours utiliser le schéma explicite** dans les requêtes SQL
2. **Tester avec plusieurs tenants** lors du développement
3. **Utiliser le script de vérification** régulièrement
4. **Ajouter des tests automatisés** pour l'isolation des données

---

## Support

Si le problème persiste après avoir suivi ce guide :

1. Vérifier les logs du backend
2. Exécuter le script de vérification
3. Vérifier les headers HTTP
4. Consulter la documentation PostgreSQL sur les schémas

---

**Date de création:** 2026-05-19  
**Version:** 1.0  
**Auteur:** Bob - Assistant IA