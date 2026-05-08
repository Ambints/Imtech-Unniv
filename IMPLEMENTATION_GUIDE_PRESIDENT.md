# Guide d'Implémentation - Module Président de l'Université

## 📋 Vue d'ensemble

Ce guide fournit un plan d'implémentation étape par étape pour ajouter toutes les fonctionnalités du rôle **Président de l'Université** au système existant.

## 🎯 Objectifs

1. Améliorer le rôle `president` existant dans chaque tenant
2. Ajouter 10 nouvelles tables pour gérer les fonctionnalités avancées
3. Créer les services, contrôleurs et DTOs nécessaires
4. Développer les interfaces frontend
5. Assurer la sécurité et la traçabilité de toutes les actions

## 📊 Résumé de l'Architecture

### Architecture Actuelle
- **Multi-tenant** : Chaque université a son propre schéma PostgreSQL (`tenant_xxx`)
- **Super Admin** : Table `public.super_admin` - Gère toutes les universités
- **Utilisateurs Tenant** : Table `tenant_xxx.utilisateur` - Utilisateurs par université
- **Rôle President** : ✅ Existe déjà dans l'enum mais avec fonctionnalités limitées

### Architecture Cible
- **Rôle President amélioré** avec 10 nouvelles tables
- **Nouvelles fonctionnalités** :
  - Signature électronique (diplômes, conventions)
  - Validation de parcours (ouverture/fermeture)
  - Gestion des conventions avec l'Église/Diocèses
  - Délégation de signatures
  - Validation de recrutements stratégiques
  - Validation d'investissements majeurs
  - Arbitrage de discipline
  - Gestion du calendrier académique
  - Définition de politiques académiques
  - Suivi de KPIs stratégiques

## 🗓️ Plan d'Implémentation (4 Phases)

### Phase 1 : Base de Données et Entités (Semaine 1-2)
### Phase 2 : Backend - Services et API (Semaine 3-4)
### Phase 3 : Frontend - Interfaces Utilisateur (Semaine 5-6)
### Phase 4 : Tests et Documentation (Semaine 7-8)

---

## 📅 PHASE 1 : Base de Données et Entités

### Étape 1.1 : Créer le fichier de migration SQL

**Fichier** : `backend/src/tenants/migrations/add-president-tables.sql`

```sql
-- =============================================================================
-- MIGRATION : Ajout des tables pour le module President
-- Date : 2026-05-05
-- Description : Ajoute 10 nouvelles tables pour les fonctionnalités du President
-- =============================================================================

-- 1. Table signature_electronique
CREATE TABLE IF NOT EXISTS signature_electronique (
    -- [Voir TECHNICAL_SPEC_PRESIDENT.md pour le schéma complet]
);

-- 2. Table validation_parcours
CREATE TABLE IF NOT EXISTS validation_parcours (
    -- [Voir TECHNICAL_SPEC_PRESIDENT.md pour le schéma complet]
);

-- 3. Table convention_partenariat
CREATE TABLE IF NOT EXISTS convention_partenariat (
    -- [Voir TECHNICAL_SPEC_PRESIDENT.md pour le schéma complet]
);

-- 4. Table delegation_signature
CREATE TABLE IF NOT EXISTS delegation_signature (
    -- [Voir TECHNICAL_SPEC_PRESIDENT.md pour le schéma complet]
);

-- 5. Table validation_recrutement
CREATE TABLE IF NOT EXISTS validation_recrutement (
    -- [Voir TECHNICAL_SPEC_PRESIDENT.md pour le schéma complet]
);

-- 6. Table validation_investissement
CREATE TABLE IF NOT EXISTS validation_investissement (
    -- [Voir TECHNICAL_SPEC_PRESIDENT.md pour le schéma complet]
);

-- 7. Table arbitrage_discipline
CREATE TABLE IF NOT EXISTS arbitrage_discipline (
    -- [Voir TECHNICAL_SPEC_PRESIDENT.md pour le schéma complet]
);

-- 8. Table validation_calendrier
CREATE TABLE IF NOT EXISTS validation_calendrier (
    -- [Voir TECHNICAL_SPEC_PRESIDENT.md pour le schéma complet]
);

-- 9. Table politique_academique
CREATE TABLE IF NOT EXISTS politique_academique (
    -- [Voir TECHNICAL_SPEC_PRESIDENT.md pour le schéma complet]
);

-- 10. Table kpi_strategique
CREATE TABLE IF NOT EXISTS kpi_strategique (
    -- [Voir TECHNICAL_SPEC_PRESIDENT.md pour le schéma complet]
);

-- 11. Table audit_president
CREATE TABLE IF NOT EXISTS audit_president (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID NOT NULL REFERENCES utilisateur(id),
    action VARCHAR(100) NOT NULL,
    entite VARCHAR(50) NOT NULL,
    entite_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    date_action TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_utilisateur ON audit_president(utilisateur_id);
CREATE INDEX idx_audit_action ON audit_president(action);
CREATE INDEX idx_audit_date ON audit_president(date_action);
```

### Étape 1.2 : Mettre à jour le schéma tenant principal

**Fichier** : `backend/src/tenants/tenant-schema.sql`

Ajouter les nouvelles tables à la fin du fichier existant.

### Étape 1.3 : Créer les entités TypeORM

**Structure des dossiers** :
```
backend/src/president/
├── entities/
│   ├── index.ts
│   ├── signature-electronique.entity.ts
│   ├── validation-parcours.entity.ts
│   ├── convention-partenariat.entity.ts
│   ├── delegation-signature.entity.ts
│   ├── validation-recrutement.entity.ts
│   ├── validation-investissement.entity.ts
│   ├── arbitrage-discipline.entity.ts
│   ├── validation-calendrier.entity.ts
│   ├── politique-academique.entity.ts
│   └── kpi-strategique.entity.ts
```

**Exemple** : `signature-electronique.entity.ts`
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity({ name: 'signature_electronique' })
export class SignatureElectronique {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'type_document', length: 50 })
  typeDocument: 'diplome' | 'convention' | 'decision' | 'attestation' | 'autre';

  @Column({ name: 'document_id', type: 'uuid' })
  documentId: string;

  @Column({ name: 'reference_document', length: 100, nullable: true })
  referenceDocument: string;

  @Column({ name: 'signataire_id', type: 'uuid' })
  signataireId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'signataire_id' })
  signataire: User;

  @Column({ name: 'signature_hash', type: 'text' })
  signatureHash: string;

  @Column({ name: 'date_signature', type: 'timestamptz' })
  dateSignature: Date;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ length: 20, default: 'valide' })
  statut: 'valide' | 'revoque' | 'expire';

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### Étape 1.4 : Créer le fichier index pour les entités

**Fichier** : `backend/src/president/entities/index.ts`
```typescript
export * from './signature-electronique.entity';
export * from './validation-parcours.entity';
export * from './convention-partenariat.entity';
export * from './delegation-signature.entity';
export * from './validation-recrutement.entity';
export * from './validation-investissement.entity';
export * from './arbitrage-discipline.entity';
export * from './validation-calendrier.entity';
export * from './politique-academique.entity';
export * from './kpi-strategique.entity';
```

### Étape 1.5 : Mettre à jour app.module.ts

**Fichier** : `backend/src/app.module.ts`

Ajouter les nouvelles entités dans la configuration TypeORM :

```typescript
import {
  SignatureElectronique,
  ValidationParcours,
  ConventionPartenariat,
  DelegationSignature,
  ValidationRecrutement,
  ValidationInvestissement,
  ArbitrageDiscipline,
  ValidationCalendrier,
  PolitiqueAcademique,
  KpiStrategique,
} from './president/entities';

// Dans TypeOrmModule.forRoot (tenant connection)
entities: [
  // ... entités existantes
  SignatureElectronique,
  ValidationParcours,
  ConventionPartenariat,
  DelegationSignature,
  ValidationRecrutement,
  ValidationInvestissement,
  ArbitrageDiscipline,
  ValidationCalendrier,
  PolitiqueAcademique,
  KpiStrategique,
],
```

### ✅ Checklist Phase 1
- [ ] Créer le fichier de migration SQL
- [ ] Mettre à jour tenant-schema.sql
- [ ] Créer les 10 entités TypeORM
- [ ] Créer le fichier index.ts
- [ ] Mettre à jour app.module.ts
- [ ] Tester la création des tables dans un schéma tenant de test

---

## 📅 PHASE 2 : Backend - Services et API

### Étape 2.1 : Créer les DTOs

**Structure** :
```
backend/src/president/dto/
├── index.ts
├── signature/
│   ├── create-signature.dto.ts
│   ├── verify-signature.dto.ts
│   └── revoke-signature.dto.ts
├── validation/
│   ├── validate-parcours.dto.ts
│   ├── validate-recrutement.dto.ts
│   ├── validate-investissement.dto.ts
│   └── validate-calendrier.dto.ts
├── convention/
│   ├── create-convention.dto.ts
│   ├── update-convention.dto.ts
│   └── sign-convention.dto.ts
├── delegation/
│   ├── create-delegation.dto.ts
│   ├── update-delegation.dto.ts
│   └── revoke-delegation.dto.ts
└── arbitrage/
    └── create-arbitrage.dto.ts
```

**Exemple** : `create-signature.dto.ts`
```typescript
import { IsEnum, IsUUID, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSignatureDto {
  @ApiProperty({ enum: ['diplome', 'convention', 'decision', 'attestation', 'autre'] })
  @IsEnum(['diplome', 'convention', 'decision', 'attestation', 'autre'])
  typeDocument: string;

  @ApiProperty({ description: 'ID du document à signer' })
  @IsUUID()
  documentId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  referenceDocument?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  localisation?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}
```

### Étape 2.2 : Créer les Services

**Structure** :
```
backend/src/president/services/
├── signature.service.ts
├── validation.service.ts
├── convention.service.ts
├── delegation.service.ts
├── arbitrage.service.ts
├── kpi.service.ts
└── audit.service.ts
```

**Exemple** : `signature.service.ts`
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignatureElectronique } from '../entities/signature-electronique.entity';
import { CreateSignatureDto } from '../dto/signature/create-signature.dto';
import * as crypto from 'crypto';

@Injectable()
export class SignatureService {
  constructor(
    @InjectRepository(SignatureElectronique)
    private signatureRepo: Repository<SignatureElectronique>,
  ) {}

  async createSignature(
    dto: CreateSignatureDto,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<SignatureElectronique> {
    const signatureHash = this.generateSignatureHash(dto.documentId, userId);

    const signature = this.signatureRepo.create({
      ...dto,
      signataireId: userId,
      signatureHash,
      dateSignature: new Date(),
      ipAddress,
      userAgent,
      statut: 'valide',
    });

    return this.signatureRepo.save(signature);
  }

  async verifySignature(signatureId: string): Promise<boolean> {
    const signature = await this.signatureRepo.findOne({ where: { id: signatureId } });
    
    if (!signature) {
      throw new NotFoundException('Signature non trouvée');
    }

    if (signature.statut !== 'valide') {
      return false;
    }

    const expectedHash = this.generateSignatureHash(signature.documentId, signature.signataireId);
    return signature.signatureHash === expectedHash;
  }

  private generateSignatureHash(documentId: string, userId: string): string {
    const data = `${documentId}:${userId}:${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async getPendingSignatures(userId: string): Promise<any[]> {
    // Implémenter la logique pour récupérer les documents en attente
    return [];
  }

  async getSignatureHistory(userId: string, limit: number = 50): Promise<SignatureElectronique[]> {
    return this.signatureRepo.find({
      where: { signataireId: userId },
      order: { dateSignature: 'DESC' },
      take: limit,
    });
  }
}
```

### Étape 2.3 : Créer le service principal President

**Fichier** : `backend/src/president/president.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { SignatureService } from './services/signature.service';
import { ValidationService } from './services/validation.service';
import { ConventionService } from './services/convention.service';
import { DelegationService } from './services/delegation.service';
import { ArbitrageService } from './services/arbitrage.service';
import { KpiService } from './services/kpi.service';

@Injectable()
export class PresidentService {
  constructor(
    private signatureService: SignatureService,
    private validationService: ValidationService,
    private conventionService: ConventionService,
    private delegationService: DelegationService,
    private arbitrageService: ArbitrageService,
    private kpiService: KpiService,
  ) {}

  // Méthodes qui orchestrent les différents services
  async getDashboard(userId: string): Promise<any> {
    const [
      pendingSignatures,
      pendingValidations,
      pendingArbitrages,
      kpis,
    ] = await Promise.all([
      this.signatureService.getPendingSignatures(userId),
      this.validationService.getPendingValidations(),
      this.arbitrageService.getPendingArbitrages(),
      this.kpiService.getAllKpis(),
    ]);

    return {
      pendingSignatures,
      pendingValidations,
      pendingArbitrages,
      kpis,
    };
  }
}
```

### Étape 2.4 : Créer les Contrôleurs

**Structure** :
```
backend/src/president/controllers/
├── signature.controller.ts
├── validation.controller.ts
├── convention.controller.ts
├── delegation.controller.ts
├── arbitrage.controller.ts
└── kpi.controller.ts
```

**Exemple** : `signature.controller.ts`
```typescript
import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { SignatureService } from '../services/signature.service';
import { CreateSignatureDto } from '../dto/signature/create-signature.dto';
import { CurrentUser } from '../../auth/current-user.decorator';

@ApiTags('President - Signatures Électroniques')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('president')
@Controller('president/signatures')
export class SignatureController {
  constructor(private signatureService: SignatureService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Obtenir les signatures en attente' })
  async getPendingSignatures(@CurrentUser() user: any) {
    return this.signatureService.getPendingSignatures(user.sub);
  }

  @Post('diplomas/:id')
  @ApiOperation({ summary: 'Signer un diplôme' })
  async signDiploma(
    @Param('id') id: string,
    @Body() dto: CreateSignatureDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    return this.signatureService.createSignature(
      { ...dto, documentId: id, typeDocument: 'diplome' },
      user.sub,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Historique des signatures' })
  async getHistory(@CurrentUser() user: any) {
    return this.signatureService.getSignatureHistory(user.sub);
  }

  @Get(':id/verify')
  @ApiOperation({ summary: 'Vérifier une signature' })
  async verifySignature(@Param('id') id: string) {
    return this.signatureService.verifySignature(id);
  }
}
```

### Étape 2.5 : Créer le contrôleur principal

**Fichier** : `backend/src/president/president.controller.ts`
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PresidentService } from './president.service';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('President - Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('president')
@Controller('president')
export class PresidentController {
  constructor(private presidentService: PresidentService) {}

  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    return this.presidentService.getDashboard(user.sub);
  }
}
```

### Étape 2.6 : Créer le module President

**Fichier** : `backend/src/president/president.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PresidentController } from './president.controller';
import { PresidentService } from './president.service';
import { SignatureController } from './controllers/signature.controller';
import { ValidationController } from './controllers/validation.controller';
import { ConventionController } from './controllers/convention.controller';
import { DelegationController } from './controllers/delegation.controller';
import { ArbitrageController } from './controllers/arbitrage.controller';
import { KpiController } from './controllers/kpi.controller';
import { SignatureService } from './services/signature.service';
import { ValidationService } from './services/validation.service';
import { ConventionService } from './services/convention.service';
import { DelegationService } from './services/delegation.service';
import { ArbitrageService } from './services/arbitrage.service';
import { KpiService } from './services/kpi.service';
import { AuditService } from './services/audit.service';
import * as entities from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature(Object.values(entities), 'tenant'),
  ],
  controllers: [
    PresidentController,
    SignatureController,
    ValidationController,
    ConventionController,
    DelegationController,
    ArbitrageController,
    KpiController,
  ],
  providers: [
    PresidentService,
    SignatureService,
    ValidationService,
    ConventionService,
    DelegationService,
    ArbitrageService,
    KpiService,
    AuditService,
  ],
  exports: [PresidentService],
})
export class PresidentModule {}
```

### Étape 2.7 : Mettre à jour app.module.ts

**Fichier** : `backend/src/app.module.ts`

Ajouter le PresidentModule :
```typescript
import { PresidentModule } from './president/president.module';

@Module({
  imports: [
    // ... autres modules
    PresidentModule,
  ],
})
export class AppModule {}
```

### ✅ Checklist Phase 2
- [ ] Créer tous les DTOs avec validation
- [ ] Créer les 7 services spécialisés
- [ ] Créer le service principal PresidentService
- [ ] Créer les 6 contrôleurs spécialisés
- [ ] Créer le contrôleur principal PresidentController
- [ ] Créer le PresidentModule
- [ ] Mettre à jour app.module.ts
- [ ] Tester les endpoints avec Postman/Insomnia

---

## 📅 PHASE 3 : Frontend - Interfaces Utilisateur

### Étape 3.1 : Créer les types TypeScript

**Fichier** : `frontend/src/types/president.ts`
```typescript
export interface Signature {
  id: string;
  typeDocument: 'diplome' | 'convention' | 'decision' | 'attestation' | 'autre';
  documentId: string;
  referenceDocument?: string;
  dateSignature: string;
  statut: 'valide' | 'revoque' | 'expire';
  metadata?: any;
}

export interface ValidationParcours {
  id: string;
  parcoursId: string;
  typeAction: 'ouverture' | 'fermeture' | 'modification' | 'suspension';
  statut: 'en_attente' | 'approuve' | 'rejete' | 'en_revision';
  motifDemande: string;
  dateValidation?: string;
}

export interface Convention {
  id: string;
  numeroConvention: string;
  titre: string;
  typePartenaire: string;
  nomPartenaire: string;
  dateDebut: string;
  dateFin?: string;
  statut: string;
}

// ... autres interfaces
```

### Étape 3.2 : Créer les services API

**Fichier** : `frontend/src/api/president.ts`
```typescript
import { apiClient } from './client';

export const presidentApi = {
  // Dashboard
  getDashboard: () => apiClient.get('/president/dashboard'),
  
  // Signatures
  getPendingSignatures: () => apiClient.get('/president/signatures/pending'),
  signDiploma: (id: string, data: any) => apiClient.post(`/president/signatures/diplomas/${id}`, data),
  signConvention: (id: string, data: any) => apiClient.post(`/president/signatures/conventions/${id}`, data),
  getSignatureHistory: () => apiClient.get('/president/signatures/history'),
  
  // Validations
  getPendingValidations: () => apiClient.get('/president/validations/parcours'),
  validateParcours: (id: string, decision: any) => apiClient.post(`/president/validations/parcours/${id}/approve`, decision),
  
  // Conventions
  getConventions: () => apiClient.get('/president/conventions'),
  createConvention: (data: any) => apiClient.post('/president/conventions', data),
  
  // Délégations
  getDelegations: () => apiClient.get('/president/delegations'),
  createDelegation: (data: any) => apiClient.post('/president/delegations', data),
  
  // Arbitrages
  getPendingArbitrages: () => apiClient.get('/president/arbitrages/pending'),
  createArbitrage: (data: any) => apiClient.post('/president/arbitrages', data),
};
```

### Étape 3.3 : Améliorer le Dashboard President

**Fichier** : `frontend/src/pages/president/PresidentDashboard.tsx`

Améliorer le dashboard existant avec :
- Appels API réels
- Affichage des KPIs dynamiques
- Badges de notifications
- Graphiques interactifs

### Étape 3.4 : Créer les nouvelles pages

**Pages à créer** :
1. `SignatureElectronique.tsx` - Gestion des signatures
2. `ValidationParcours.tsx` - Validation des parcours
3. `GestionConventions.tsx` - Gestion des conventions
4. `ValidationRecrutements.tsx` - Validation des recrutements
5. `ValidationInvestissements.tsx` - Validation des investissements
6. `ArbitrageDiscipline.tsx` - Arbitrage de discipline
7. `GestionDelegations.tsx` - Gestion des délégations
8. `CalendrierAcademique.tsx` - Gestion du calendrier

### Étape 3.5 : Créer les composants réutilisables

**Composants** :
```
frontend/src/components/president/
├── KPICard.tsx
├── SignatureWidget.tsx
├── ValidationCard.tsx
├── ConventionCard.tsx
├── DelegationManager.tsx
├── ArbitragePanel.tsx
├── DocumentPreview.tsx
└── ApprovalButtons.tsx
```

### Étape 3.6 : Mettre à jour le routing

**Fichier** : `frontend/src/App.tsx`

Ajouter les routes pour les nouvelles pages President.

### ✅ Checklist Phase 3
- [ ] Créer les types TypeScript
- [ ] Créer les services API
- [ ] Améliorer le dashboard President
- [ ] Créer les 8 nouvelles pages
- [ ] Créer les composants réutilisables
- [ ] Mettre à jour le routing
- [ ] Tester toutes les interfaces

---

## 📅 PHASE 4 : Tests et Documentation

### Étape 4.1 : Tests Unitaires Backend

Créer des tests pour chaque service :
```typescript
describe('SignatureService', () => {
  it('should create a signature', async () => {
    // Test
  });
  
  it('should verify a signature', async () => {
    // Test
  });
});
```

### Étape 4.2 : Tests d'Intégration

Tester les endpoints API complets.

### Étape 4.3 : Tests Frontend

Tester les composants React avec Jest et React Testing Library.

### Étape 4.4 : Documentation API

Vérifier que tous les endpoints sont documentés avec Swagger.

### Étape 4.5 : Manuel Utilisateur

Créer un manuel utilisateur pour le President.

### ✅ Checklist Phase 4
- [ ] Tests unitaires backend (80%+ coverage)
- [ ] Tests d'intégration
- [ ] Tests frontend
- [ ] Documentation API complète
- [ ] Manuel utilisateur
- [ ] Guide de déploiement

---

## 🚀 Déploiement

### Étape 1 : Migration de la Base de Données

```bash
# Exécuter la migration sur chaque schéma tenant
node backend/scripts/migrate-president-tables.js
```

### Étape 2 : Déploiement Backend

```bash
cd backend
npm run build
pm2 restart imtech-backend
```

### Étape 3 : Déploiement Frontend

```bash
cd frontend
npm run build
# Déployer sur le serveur web
```

### Étape 4 : Vérification

- [ ] Vérifier que toutes les tables sont créées
- [ ] Tester la connexion en tant que President
- [ ] Vérifier toutes les fonctionnalités
- [ ] Vérifier les logs d'audit

---

## 📊 Métriques de Succès

### Fonctionnalités
- ✅ Signature électronique opérationnelle
- ✅ Validation de parcours fonctionnelle
- ✅ Gestion des conventions active
- ✅ Délégation de signatures implémentée
- ✅ Validation RH et investissements opérationnelle
- ✅ Arbitrage de discipline fonctionnel
- ✅ Calendrier académique géré
- ✅ Dashboard avec KPIs en temps réel

### Performance
- Temps de réponse API < 500ms
- Chargement des pages < 2s
- 99.9% de disponibilité

### Sécurité
- Toutes les actions tracées dans l'audit
- Signatures cryptographiquement sécurisées
- Permissions correctement appliquées

---

## 🆘 Support et Maintenance

### Contacts
- **Équipe Backend** : backend@imtech.com
- **Équipe Frontend** : frontend@imtech.com
- **Support** : support@imtech.com

### Ressources
- Documentation API : https://api.imtech.com/docs
- Wiki : https://wiki.imtech.com
- Issues : https://github.com/imtech/university/issues

---

**Date de création** : 2026-05-05  
**Version** : 1.0  
**Auteur** : Équipe de développement ImTech