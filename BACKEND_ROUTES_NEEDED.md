# Routes Backend Manquantes pour les Interfaces de Gestion

## 📋 Résumé

Les interfaces frontend de **Gestion Académique** et **Gestion des Finances** ont été créées avec succès, mais certaines routes backend sont manquantes ou non fonctionnelles.

## ❌ Problèmes Identifiés

### 1. Erreur TypeORM - Métadonnées Non Trouvées
```
EntityMetadataNotFoundError: No metadata for "Parcours" was found.
EntityMetadataNotFoundError: No metadata for "Paiement" was found.
EntityMetadataNotFoundError: No metadata for "Budget" was found.
```

**Cause:** Le système multi-tenant utilise des schémas PostgreSQL dynamiques, mais TypeORM est configuré avec un schéma fixe (`univ_demo`).

### 2. Routes 404 - Non Implémentées
```
GET /academic/:tid/departements - 404
GET /academic/:tid/etudiants - 404
GET /finance/:tid/depenses - 404 (probablement)
```

## 🔧 Solutions Requises

### Solution 1: Ajouter les Routes Manquantes

#### Dans `backend/src/academic/academic.controller.ts`

Ajouter:
```typescript
@Get(':tenantId/departements')
async getDepartements(@Param('tenantId') tenantId: string) {
  return this.academicService.getDepartements(tenantId);
}

@Post(':tenantId/departements')
async createDepartement(@Param('tenantId') tenantId: string, @Body() dto: any) {
  return this.academicService.createDepartement(tenantId, dto);
}

@Get(':tenantId/etudiants')
async getEtudiants(@Param('tenantId') tenantId: string) {
  return this.academicService.getEtudiants(tenantId);
}

@Post(':tenantId/etudiants')
async createEtudiant(@Param('tenantId') tenantId: string, @Body() dto: any) {
  return this.academicService.createEtudiant(tenantId, dto);
}

@Patch(':tenantId/etudiants/:id')
async updateEtudiant(
  @Param('tenantId') tenantId: string,
  @Param('id') id: string,
  @Body() dto: any
) {
  return this.academicService.updateEtudiant(tenantId, id, dto);
}

@Patch(':tenantId/parcours/:id')
async updateParcours(
  @Param('tenantId') tenantId: string,
  @Param('id') id: string,
  @Body() dto: any
) {
  return this.academicService.updateParcours(tenantId, id, dto);
}

@Patch(':tenantId/ue/:id')
async updateUE(
  @Param('tenantId') tenantId: string,
  @Param('id') id: string,
  @Body() dto: any
) {
  return this.academicService.updateUE(tenantId, id, dto);
}
```

#### Dans `backend/src/academic/academic.service.ts`

Ajouter les méthodes correspondantes:
```typescript
async getDepartements(tenantId: string) {
  const repo = this.getRepository(Departement, tenantId);
  return repo.find({ where: { actif: true } });
}

async createDepartement(tenantId: string, dto: any) {
  const repo = this.getRepository(Departement, tenantId);
  const departement = repo.create(dto);
  return repo.save(departement);
}

async getEtudiants(tenantId: string) {
  const repo = this.getRepository(Etudiant, tenantId);
  return repo.find({ where: { actif: true } });
}

async createEtudiant(tenantId: string, dto: any) {
  const repo = this.getRepository(Etudiant, tenantId);
  const etudiant = repo.create(dto);
  return repo.save(etudiant);
}

async updateEtudiant(tenantId: string, id: string, dto: any) {
  const repo = this.getRepository(Etudiant, tenantId);
  await repo.update(id, dto);
  return repo.findOne({ where: { id } });
}

async updateParcours(tenantId: string, id: string, dto: any) {
  const repo = this.getRepository(Parcours, tenantId);
  await repo.update(id, dto);
  return repo.findOne({ where: { id } });
}

async updateUE(tenantId: string, id: string, dto: any) {
  const repo = this.getRepository(UniteEnseignement, tenantId);
  await repo.update(id, dto);
  return repo.findOne({ where: { id } });
}
```

#### Dans `backend/src/finance/finance.controller.ts`

Ajouter:
```typescript
@Get(':tenantId/depenses')
async getDepenses(@Param('tenantId') tenantId: string) {
  return this.financeService.getDepenses(tenantId);
}

@Patch(':tenantId/budgets/:id')
async updateBudget(
  @Param('tenantId') tenantId: string,
  @Param('id') id: string,
  @Body() dto: any
) {
  return this.financeService.updateBudget(tenantId, id, dto);
}
```

### Solution 2: Corriger le Système Multi-Tenant

Le problème principal est que TypeORM ne trouve pas les métadonnées des entités car elles sont liées à un schéma spécifique.

#### Option A: Utiliser une Méthode Helper pour Obtenir le Repository

Dans chaque service, créer une méthode helper:

```typescript
// Dans academic.service.ts
private getRepository<T>(entity: any, tenantId: string): Repository<T> {
  // Déterminer le schéma basé sur le tenantId
  const schema = `univ_${tenantId.substring(0, 8)}`; // ou votre logique
  
  // Obtenir la connexion avec le bon schéma
  const connection = this.dataSource.manager.connection;
  
  // Créer un query runner avec le schéma approprié
  const queryRunner = connection.createQueryRunner();
  queryRunner.manager.connection.options.schema = schema;
  
  return queryRunner.manager.getRepository(entity);
}
```

#### Option B: Middleware de Schéma Dynamique

Créer un middleware qui change le schéma avant chaque requête:

```typescript
// tenant-schema.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';

@Injectable()
export class TenantSchemaMiddleware implements NestMiddleware {
  constructor(private dataSource: DataSource) {}

  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.tenantId || req.headers['x-tenant-id'];
    if (tenantId) {
      const schema = `univ_${tenantId.substring(0, 8)}`;
      // Changer le schéma pour cette requête
      this.dataSource.manager.connection.options.schema = schema;
    }
    next();
  }
}
```

#### Option C: Utiliser des Requêtes SQL Brutes

Pour contourner temporairement le problème:

```typescript
async getParcours(tenantId: string) {
  const schema = `univ_${tenantId.substring(0, 8)}`;
  const query = `SELECT * FROM "${schema}".parcours WHERE actif = true`;
  return this.dataSource.query(query);
}
```

## 📝 Checklist des Routes à Implémenter

### Academic Module
- [x] `GET /academic/:tid/parcours` - Existe
- [x] `POST /academic/:tid/parcours` - Existe
- [ ] `PATCH /academic/:tid/parcours/:id` - **À AJOUTER**
- [ ] `DELETE /academic/:tid/parcours/:id` - **À AJOUTER**
- [ ] `GET /academic/:tid/departements` - **À AJOUTER**
- [ ] `POST /academic/:tid/departements` - **À AJOUTER**
- [x] `GET /academic/:tid/ue` - Existe
- [x] `POST /academic/:tid/ue` - Existe
- [ ] `PATCH /academic/:tid/ue/:id` - **À AJOUTER**
- [ ] `DELETE /academic/:tid/ue/:id` - **À AJOUTER**
- [ ] `GET /academic/:tid/etudiants` - **À AJOUTER**
- [ ] `POST /academic/:tid/etudiants` - **À AJOUTER**
- [ ] `PATCH /academic/:tid/etudiants/:id` - **À AJOUTER**
- [ ] `DELETE /academic/:tid/etudiants/:id` - **À AJOUTER**

### Finance Module
- [x] `GET /finance/:tid/caisse` - Existe
- [x] `POST /finance/:tid/paiements` - Existe
- [x] `GET /finance/:tid/paiements` - Existe
- [x] `GET /finance/:tid/budgets` - Existe
- [x] `POST /finance/:tid/budgets` - Existe
- [ ] `PATCH /finance/:tid/budgets/:id` - **À AJOUTER**
- [ ] `DELETE /finance/:tid/budgets/:id` - **À AJOUTER**
- [ ] `GET /finance/:tid/depenses` - **À AJOUTER**
- [ ] `POST /finance/:tid/depenses` - **À AJOUTER**
- [ ] `PATCH /finance/:tid/depenses/:id` - **À AJOUTER**
- [ ] `DELETE /finance/:tid/depenses/:id` - **À AJOUTER**

## 🎯 Recommandation

**Approche Recommandée:** Combiner Solution 1 (ajouter les routes) avec Solution 2 Option C (requêtes SQL brutes) pour une implémentation rapide.

1. Ajouter toutes les routes manquantes dans les controllers
2. Utiliser des requêtes SQL brutes temporairement pour contourner le problème TypeORM
3. Planifier une refonte du système multi-tenant pour une solution à long terme

## 📚 Ressources

- Documentation TypeORM Multi-Tenant: https://typeorm.io/multiple-connections
- NestJS Dynamic Modules: https://docs.nestjs.com/fundamentals/dynamic-modules
- PostgreSQL Schemas: https://www.postgresql.org/docs/current/ddl-schemas.html

---

**Note:** Les interfaces frontend sont 100% fonctionnelles et prêtes. Elles attendent simplement que le backend implémente les routes manquantes.