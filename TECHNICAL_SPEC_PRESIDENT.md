# Spécifications Techniques - Module Président de l'Université

## 📋 Table des Matières

1. [Schéma de Base de Données](#schéma-de-base-de-données)
2. [Entités TypeORM](#entités-typeorm)
3. [DTOs et Validation](#dtos-et-validation)
4. [Services et Logique Métier](#services-et-logique-métier)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Sécurité et Permissions](#sécurité-et-permissions)

---

## 🗄️ Schéma de Base de Données

### 1. Table `signature_electronique`

**Description** : Stocke toutes les signatures électroniques effectuées par le President

```sql
CREATE TABLE signature_electronique (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_document VARCHAR(50) NOT NULL CHECK (type_document IN ('diplome', 'convention', 'decision', 'attestation', 'autre')),
    document_id UUID NOT NULL,
    reference_document VARCHAR(100), -- Numéro de référence du document
    signataire_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    signature_hash TEXT NOT NULL, -- Hash SHA-256 du document signé
    certificat_signature TEXT, -- Certificat numérique (optionnel)
    date_signature TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    localisation VARCHAR(100), -- Lieu de signature
    statut VARCHAR(20) DEFAULT 'valide' CHECK (statut IN ('valide', 'revoque', 'expire')),
    raison_revocation TEXT,
    date_revocation TIMESTAMPTZ,
    metadata JSONB, -- Informations supplémentaires (ex: nom étudiant pour diplôme)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_signature_type_document ON signature_electronique(type_document);
CREATE INDEX idx_signature_signataire ON signature_electronique(signataire_id);
CREATE INDEX idx_signature_date ON signature_electronique(date_signature);
CREATE INDEX idx_signature_statut ON signature_electronique(statut);
```

### 2. Table `validation_parcours`

**Description** : Gère les validations d'ouverture/fermeture de parcours académiques

```sql
CREATE TABLE validation_parcours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcours_id UUID NOT NULL REFERENCES parcours(id) ON DELETE RESTRICT,
    type_action VARCHAR(30) NOT NULL CHECK (type_action IN ('ouverture', 'fermeture', 'modification', 'suspension')),
    demandeur_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    validateur_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_demande TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    date_validation TIMESTAMPTZ,
    statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuve', 'rejete', 'en_revision')),
    motif_demande TEXT NOT NULL,
    commentaire_validateur TEXT,
    justificatifs JSONB, -- URLs des documents justificatifs
    impact_analyse TEXT, -- Analyse d'impact (effectifs, finances, etc.)
    date_effet DATE, -- Date d'effet de la décision
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_validation_parcours_statut ON validation_parcours(statut);
CREATE INDEX idx_validation_parcours_validateur ON validation_parcours(validateur_id);
CREATE INDEX idx_validation_parcours_date ON validation_parcours(date_demande);
```

### 3. Table `convention_partenariat`

**Description** : Gère les conventions avec l'Église, diocèses et autres partenaires

```sql
CREATE TABLE convention_partenariat (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_convention VARCHAR(50) UNIQUE NOT NULL,
    titre VARCHAR(255) NOT NULL,
    type_partenaire VARCHAR(50) NOT NULL CHECK (type_partenaire IN ('eglise', 'diocese', 'congregation', 'universite', 'entreprise', 'ong', 'autre')),
    nom_partenaire VARCHAR(255) NOT NULL,
    contact_partenaire VARCHAR(255),
    email_partenaire VARCHAR(254),
    telephone_partenaire VARCHAR(30),
    objet_convention TEXT NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE,
    duree_mois INT,
    montant_engagement DECIMAL(15,2),
    devise VARCHAR(10) DEFAULT 'MGA',
    document_url TEXT, -- URL du document PDF
    document_hash TEXT, -- Hash du document original
    statut VARCHAR(30) DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'en_attente_signature', 'signe', 'actif', 'expire', 'resilie')),
    signataire_president_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_signature_president TIMESTAMPTZ,
    signataire_partenaire VARCHAR(255),
    date_signature_partenaire DATE,
    conditions_particulieres TEXT,
    clauses_resiliation TEXT,
    renouvellement_auto BOOLEAN DEFAULT FALSE,
    responsable_suivi_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_convention_type ON convention_partenariat(type_partenaire);
CREATE INDEX idx_convention_statut ON convention_partenariat(statut);
CREATE INDEX idx_convention_president ON convention_partenariat(signataire_president_id);
CREATE INDEX idx_convention_dates ON convention_partenariat(date_debut, date_fin);
```

### 4. Table `delegation_signature`

**Description** : Gère les délégations de signature du President au Secrétaire Général

```sql
CREATE TABLE delegation_signature (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_delegation VARCHAR(50) UNIQUE NOT NULL,
    delegant_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT, -- Le President
    delegataire_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT, -- Secrétaire Général
    type_document VARCHAR(50) NOT NULL, -- Type de documents délégués
    portee_delegation TEXT NOT NULL, -- Description de la portée
    date_debut DATE NOT NULL,
    date_fin DATE,
    actif BOOLEAN DEFAULT TRUE,
    conditions TEXT, -- Conditions et limites de la délégation
    montant_max_autorise DECIMAL(15,2), -- Montant max pour validations financières
    niveaux_autorises VARCHAR(100), -- Ex: "Licence,Master" pour parcours
    raison_delegation TEXT,
    document_delegation_url TEXT, -- Document officiel de délégation
    date_revocation TIMESTAMPTZ,
    raison_revocation TEXT,
    notifications_activees BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_delegation_delegant ON delegation_signature(delegant_id);
CREATE INDEX idx_delegation_delegataire ON delegation_signature(delegataire_id);
CREATE INDEX idx_delegation_actif ON delegation_signature(actif);
CREATE INDEX idx_delegation_dates ON delegation_signature(date_debut, date_fin);
```

### 5. Table `validation_recrutement`

**Description** : Gère les validations de recrutements stratégiques

```sql
CREATE TABLE validation_recrutement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_dossier VARCHAR(50) UNIQUE NOT NULL,
    candidat_nom VARCHAR(100) NOT NULL,
    candidat_prenom VARCHAR(100) NOT NULL,
    candidat_email VARCHAR(254),
    candidat_telephone VARCHAR(30),
    poste VARCHAR(100) NOT NULL,
    departement_id UUID REFERENCES departement(id) ON DELETE SET NULL,
    type_contrat VARCHAR(30) NOT NULL CHECK (type_contrat IN ('cdi', 'cdd', 'vacation', 'stage')),
    type_recrutement VARCHAR(30) NOT NULL CHECK (type_recrutement IN ('strategique', 'standard', 'urgent')),
    niveau_poste VARCHAR(30) CHECK (niveau_poste IN ('direction', 'cadre', 'employe', 'enseignant_titulaire', 'enseignant_vacataire')),
    demandeur_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    validateur_rh_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_validation_rh TIMESTAMPTZ,
    validateur_president_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_validation_president TIMESTAMPTZ,
    statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide_rh', 'approuve', 'rejete', 'en_revision')),
    priorite VARCHAR(20) DEFAULT 'normale' CHECK (priorite IN ('haute', 'normale', 'basse')),
    salaire_propose DECIMAL(12,2) NOT NULL,
    devise VARCHAR(10) DEFAULT 'MGA',
    date_prise_fonction DATE,
    justification TEXT NOT NULL,
    competences_requises TEXT,
    cv_url TEXT,
    lettre_motivation_url TEXT,
    diplomes_urls JSONB,
    commentaire_rh TEXT,
    commentaire_president TEXT,
    decision_finale TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recrutement_statut ON validation_recrutement(statut);
CREATE INDEX idx_recrutement_type ON validation_recrutement(type_recrutement);
CREATE INDEX idx_recrutement_validateur ON validation_recrutement(validateur_president_id);
CREATE INDEX idx_recrutement_departement ON validation_recrutement(departement_id);
```

### 6. Table `validation_investissement`

**Description** : Gère les validations d'investissements majeurs

```sql
CREATE TABLE validation_investissement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_projet VARCHAR(50) UNIQUE NOT NULL,
    titre VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    categorie VARCHAR(50) NOT NULL CHECK (categorie IN ('infrastructure', 'equipement', 'informatique', 'mobilier', 'vehicule', 'autre')),
    sous_categorie VARCHAR(100),
    montant DECIMAL(15,2) NOT NULL,
    devise VARCHAR(10) DEFAULT 'MGA',
    departement_beneficiaire_id UUID REFERENCES departement(id) ON DELETE SET NULL,
    demandeur_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    validateur_economat_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_validation_economat TIMESTAMPTZ,
    validateur_president_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_validation_president TIMESTAMPTZ,
    statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'valide_economat', 'approuve', 'rejete', 'en_revision', 'en_cours', 'termine')),
    priorite VARCHAR(20) DEFAULT 'normale' CHECK (priorite IN ('haute', 'normale', 'basse')),
    urgence BOOLEAN DEFAULT FALSE,
    justification TEXT NOT NULL,
    impact_attendu TEXT,
    alternatives_etudiees TEXT,
    source_financement VARCHAR(100), -- Budget, subvention, partenariat, etc.
    devis_urls JSONB, -- URLs des devis
    cahier_charges_url TEXT,
    date_debut_prevue DATE,
    date_fin_prevue DATE,
    duree_mois INT,
    fournisseur_propose VARCHAR(255),
    commentaire_economat TEXT,
    commentaire_president TEXT,
    decision_finale TEXT,
    conditions_approbation TEXT,
    suivi_realisation JSONB, -- Étapes de réalisation
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_investissement_statut ON validation_investissement(statut);
CREATE INDEX idx_investissement_categorie ON validation_investissement(categorie);
CREATE INDEX idx_investissement_validateur ON validation_investissement(validateur_president_id);
CREATE INDEX idx_investissement_montant ON validation_investissement(montant);
CREATE INDEX idx_investissement_priorite ON validation_investissement(priorite);
```

### 7. Table `arbitrage_discipline`

**Description** : Gère les arbitrages finaux des conseils de discipline

```sql
CREATE TABLE arbitrage_discipline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_arbitrage VARCHAR(50) UNIQUE NOT NULL,
    incident_id UUID NOT NULL REFERENCES incident(id) ON DELETE RESTRICT,
    etudiant_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    conseil_discipline_date DATE,
    membres_conseil JSONB, -- Liste des membres du conseil
    decision_conseil TEXT, -- Décision initiale du conseil
    sanction_proposee VARCHAR(50),
    appel_demande BOOLEAN DEFAULT FALSE,
    motif_appel TEXT,
    date_appel TIMESTAMPTZ,
    arbitre_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT, -- Le President
    date_arbitrage TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    decision_arbitrale TEXT NOT NULL,
    sanction_finale VARCHAR(50) CHECK (sanction_finale IN ('aucune', 'avertissement', 'blame', 'exclusion_temporaire', 'exclusion_definitive', 'autre')),
    duree_exclusion_jours INT,
    conditions_reintegration TEXT,
    commentaire_president TEXT,
    statut VARCHAR(20) DEFAULT 'definitif' CHECK (statut IN ('definitif', 'en_appel', 'annule')),
    notification_envoyee BOOLEAN DEFAULT FALSE,
    date_notification TIMESTAMPTZ,
    document_decision_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_arbitrage_incident ON arbitrage_discipline(incident_id);
CREATE INDEX idx_arbitrage_arbitre ON arbitrage_discipline(arbitre_id);
CREATE INDEX idx_arbitrage_statut ON arbitrage_discipline(statut);
CREATE INDEX idx_arbitrage_date ON arbitrage_discipline(date_arbitrage);
```

### 8. Table `validation_calendrier`

**Description** : Gère les validations du calendrier académique

```sql
CREATE TABLE validation_calendrier (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    annee_academique_id UUID NOT NULL REFERENCES annee_academique(id) ON DELETE RESTRICT,
    type_calendrier VARCHAR(30) NOT NULL CHECK (type_calendrier IN ('general', 'examens', 'vacances', 'evenements')),
    proposeur_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    date_proposition TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    validateur_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    date_validation TIMESTAMPTZ,
    statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'approuve', 'rejete', 'en_revision')),
    version INT DEFAULT 1,
    calendrier_data JSONB NOT NULL, -- Structure du calendrier
    commentaire_proposeur TEXT,
    commentaire_validateur TEXT,
    modifications_demandees TEXT,
    date_rentree DATE,
    date_fin_cours DATE,
    periodes_examens JSONB,
    periodes_vacances JSONB,
    evenements_importants JSONB,
    document_calendrier_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendrier_annee ON validation_calendrier(annee_academique_id);
CREATE INDEX idx_calendrier_validateur ON validation_calendrier(validateur_id);
CREATE INDEX idx_calendrier_statut ON validation_calendrier(statut);
CREATE INDEX idx_calendrier_type ON validation_calendrier(type_calendrier);
```

### 9. Table `politique_academique`

**Description** : Définit les politiques académiques et spirituelles de l'université

```sql
CREATE TABLE politique_academique (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titre VARCHAR(255) NOT NULL,
    type_politique VARCHAR(50) NOT NULL CHECK (type_politique IN ('academique', 'spirituelle', 'pastorale', 'administrative', 'financiere')),
    description TEXT NOT NULL,
    objectifs TEXT,
    principes_directeurs TEXT,
    date_adoption DATE NOT NULL,
    date_revision DATE,
    date_expiration DATE,
    auteur_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
    validateur_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    statut VARCHAR(30) DEFAULT 'brouillon' CHECK (statut IN ('brouillon', 'en_revision', 'approuve', 'actif', 'archive')),
    version VARCHAR(20) NOT NULL,
    document_url TEXT,
    domaines_application JSONB, -- Départements, parcours concernés
    indicateurs_suivi JSONB, -- KPIs pour suivre l'application
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_politique_type ON politique_academique(type_politique);
CREATE INDEX idx_politique_statut ON politique_academique(statut);
CREATE INDEX idx_politique_validateur ON politique_academique(validateur_id);
```

### 10. Table `kpi_strategique`

**Description** : Stocke les KPIs stratégiques définis par le President

```sql
CREATE TABLE kpi_strategique (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(100) NOT NULL,
    categorie VARCHAR(50) NOT NULL CHECK (categorie IN ('academique', 'financier', 'rh', 'pastoral', 'infrastructure', 'qualite')),
    description TEXT,
    formule_calcul TEXT, -- Comment le KPI est calculé
    unite_mesure VARCHAR(30), -- %, nombre, montant, etc.
    valeur_cible DECIMAL(15,2) NOT NULL,
    valeur_actuelle DECIMAL(15,2),
    seuil_alerte DECIMAL(15,2), -- Valeur déclenchant une alerte
    frequence_mesure VARCHAR(30) CHECK (frequence_mesure IN ('quotidien', 'hebdomadaire', 'mensuel', 'trimestriel', 'annuel')),
    responsable_suivi_id UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
    actif BOOLEAN DEFAULT TRUE,
    date_debut DATE NOT NULL,
    date_fin DATE,
    historique_valeurs JSONB, -- Historique des valeurs
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kpi_categorie ON kpi_strategique(categorie);
CREATE INDEX idx_kpi_actif ON kpi_strategique(actif);
CREATE INDEX idx_kpi_responsable ON kpi_strategique(responsable_suivi_id);
```

---

## 📦 Entités TypeORM

### Structure des Fichiers

```
backend/src/president/
├── entities/
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

### Exemple d'Entité : SignatureElectronique

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

  @Column({ name: 'certificat_signature', type: 'text', nullable: true })
  certificatSignature: string;

  @Column({ name: 'date_signature', type: 'timestamptz' })
  dateSignature: Date;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ length: 100, nullable: true })
  localisation: string;

  @Column({ length: 20, default: 'valide' })
  statut: 'valide' | 'revoque' | 'expire';

  @Column({ name: 'raison_revocation', type: 'text', nullable: true })
  raisonRevocation: string;

  @Column({ name: 'date_revocation', type: 'timestamptz', nullable: true })
  dateRevocation: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

---

## 📝 DTOs et Validation

### Structure des DTOs

```
backend/src/president/dto/
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

### Exemple de DTO : CreateSignatureDto

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

---

## 🔧 Services et Logique Métier

### Structure des Services

```
backend/src/president/
├── president.module.ts
├── president.controller.ts
├── president.service.ts
└── services/
    ├── signature.service.ts
    ├── validation.service.ts
    ├── convention.service.ts
    ├── delegation.service.ts
    ├── arbitrage.service.ts
    └── kpi.service.ts
```

### Exemple de Service : SignatureService

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  /**
   * Créer une signature électronique
   */
  async createSignature(
    dto: CreateSignatureDto,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<SignatureElectronique> {
    // Générer le hash de signature
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

  /**
   * Vérifier une signature
   */
  async verifySignature(signatureId: string): Promise<boolean> {
    const signature = await this.signatureRepo.findOne({ where: { id: signatureId } });
    
    if (!signature) {
      throw new NotFoundException('Signature non trouvée');
    }

    if (signature.statut !== 'valide') {
      return false;
    }

    // Vérifier l'intégrité du hash
    const expectedHash = this.generateSignatureHash(signature.documentId, signature.signataireId);
    return signature.signatureHash === expectedHash;
  }

  /**
   * Révoquer une signature
   */
  async revokeSignature(signatureId: string, raison: string): Promise<SignatureElectronique> {
    const signature = await this.signatureRepo.findOne({ where: { id: signatureId } });
    
    if (!signature) {
      throw new NotFoundException('Signature non trouvée');
    }

    signature.statut = 'revoque';
    signature.raisonRevocation = raison;
    signature.dateRevocation = new Date();

    return this.signatureRepo.save(signature);
  }

  /**
   * Générer un hash de signature
   */
  private generateSignatureHash(documentId: string, userId: string): string {
    const data = `${documentId}:${userId}:${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Obtenir l'historique des signatures
   */
  async getSignatureHistory(userId: string, limit: number = 50): Promise<SignatureElectronique[]> {
    return this.signatureRepo.find({
      where: { signataireId: userId },
      order: { dateSignature: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtenir les signatures en attente
   */
  async getPendingSignatures(typeDocument?: string): Promise<any[]> {
    // Cette méthode devra interroger les tables appropriées
    // pour trouver les documents en attente de signature
    // (diplômes, conventions, etc.)
    return [];
  }
}
```

---

## 🌐 API Endpoints

### Routes Principales

#### Dashboard et KPIs
- `GET /api/president/dashboard` - Dashboard complet avec tous les KPIs
- `GET /api/president/kpi` - Liste des KPIs stratégiques
- `GET /api/president/kpi/:id` - Détails d'un KPI
- `POST /api/president/kpi` - Créer un nouveau KPI
- `PUT /api/president/kpi/:id` - Mettre à jour un KPI
- `GET /api/president/stats/overview` - Vue d'ensemble des statistiques

#### Signatures Électroniques
- `GET /api/president/signatures` - Liste des signatures
- `GET /api/president/signatures/pending` - Signatures en attente
- `POST /api/president/signatures/diplomas/:id` - Signer un diplôme
- `POST /api/president/signatures/conventions/:id` - Signer une convention
- `GET /api/president/signatures/:id/verify` - Vérifier une signature
- `POST /api/president/signatures/:id/revoke` - Révoquer une signature
- `GET /api/president/signatures/history` - Historique des signatures

#### Validations de Parcours
- `GET /api/president/validations/parcours` - Parcours à valider
- `GET /api/president/validations/parcours/:id` - Détails d'une demande
- `POST /api/president/validations/parcours/:id/approve` - Approuver
- `POST /api/president/validations/parcours/:id/reject` - Rejeter
- `POST /api/president/validations/parcours/:id/request-revision` - Demander révision

#### Conventions et Partenariats
- `GET /api/president/conventions` - Liste des conventions
- `GET /api/president/conventions/:id` - Détails d'une convention
- `POST /api/president/conventions` - Créer une convention
- `PUT /api/president/conventions/:id` - Modifier une convention
- `POST /api/president/conventions/:id/sign` - Signer une convention
- `GET /api/president/conventions/expiring` - Conventions arrivant à expiration

#### Délégations de Signature
- `GET /api/president/delegations` - Liste des délégations
- `GET /api/president/delegations/active` - Délégations actives
- `POST /api/president/delegations` - Créer une délégation
- `PUT /api/president/delegations/:id` - Modifier une délégation
- `POST /api/president/delegations/:id/revoke` - Révoquer une délégation

#### Validations RH
- `GET /api/president/validations/recrutements` - Recrutements à valider
- `GET /api/president/validations/recrutements/:id` - Détails
- `POST /api/president/validations/recrutements/:id/approve` - Approuver
- `POST /api/president/validations/recrutements/:id/reject` - Rejeter

#### Validations Investissements
- `GET /api/president/validations/investissements` - Investissements à valider
- `GET /api/president/validations/investissements/:id` - Détails
- `POST /api/president/validations/investissements/:id/approve` - Approuver
- `POST /api/president/validations/investissements/:id/reject` - Rejeter

#### Arbitrage Discipline
- `GET /api/president/arbitrages` - Liste des arbitrages
- `GET /api/president/arbitrages/pending` - Arbitrages en attente
- `GET /api/president/arbitrages/:id` - Détails d'un arbitrage
- `POST /api/president/arbitrages` - Créer un arbitrage
- `PUT /api/president/arbitrages/:id` - Modifier un arbitrage

#### Calendrier Académique
- `GET /api/president/calendar/academic` - Calendrier académique
- `GET /api/president/calendar/validations` - Validations de calendrier
- `POST /api/president/calendar/validate/:id` - Valider un calendrier
- `PUT /api/president/calendar/:id` - Modifier le calendrier

#### Politiques Académiques
- `GET /api/president/policies` - Liste des politiques
- `GET /api/president/policies/:id` - Détails d'une politique
- `POST /api/president/policies` - Créer une politique
- `PUT /api/president/policies/:id` - Modifier une politique
- `POST /api/president/policies/:id/approve` - Approuver une politique

---

## 🎨 Frontend Components

### Pages Principales

#### 1. PresidentDashboard.tsx (Amélioration)
```typescript
// Sections du dashboard
- En-tête avec photo et informations du President
- KPIs Cards (6-8 indicateurs clés)
- Graphiques interactifs (Chart.js ou Recharts)
- Actions rapides avec badges de notifications
- Timeline des activités récentes
- Alertes et notifications importantes
```

#### 2. SignatureElectronique.tsx
```typescript
// Fonctionnalités
- Onglets : Diplômes / Conventions / Autres documents
- Liste des documents en attente de signature
- Prévisualisation PDF
- Bouton de signature avec confirmation
- Historique des signatures
- Recherche et filtres
```

#### 3. ValidationParcours.tsx
```typescript
// Fonctionnalités
- Liste des demandes d'ouverture/fermeture
- Détails de chaque demande (justification, impact)
- Boutons : Approuver / Rejeter / Demander révision
- Historique des validations
- Statistiques des parcours
```

#### 4. GestionConventions.tsx
```typescript
// Fonctionnalités
- Liste des conventions (actives, expirées, en attente)
- Formulaire de création de convention
- Détails de chaque convention
- Signature électronique
- Alertes pour conventions arrivant à expiration
- Export PDF
```

#### 5. ValidationRecrutements.tsx
```typescript
// Fonctionnalités
- Liste des recrutements stratégiques
- Détails du candidat (CV, diplômes)
- Informations sur le poste
- Validation en deux étapes (RH puis President)
- Commentaires et décision
```

#### 6. ValidationInvestissements.tsx
```typescript
// Fonctionnalités
- Liste des investissements à valider
- Détails du projet (devis, justification)
- Analyse d'impact
- Validation avec conditions
- Suivi de réalisation
```

#### 7. ArbitrageDiscipline.tsx
```typescript
// Fonctionnalités
- Liste des cas en arbitrage
- Détails de l'incident
- Décision du conseil de discipline
- Formulaire d'arbitrage
- Décision finale et sanction
```

#### 8. GestionDelegations.tsx
```typescript
// Fonctionnalités
- Liste des délégations actives
- Création de nouvelle délégation
- Modification des conditions
- Révocation de délégation
- Historique
```

#### 9. CalendrierAcademique.tsx
```typescript
// Fonctionnalités
- Vue calendrier annuel
- Périodes importantes (rentrée, examens, vacances)
- Validation du calendrier
- Modification des dates
- Export PDF
```

### Composants Réutilisables

```
frontend/src/components/president/
├── KPICard.tsx - Carte d'affichage de KPI
├── SignatureWidget.tsx - Widget de signature
├── ValidationCard.tsx - Carte de validation
├── ConventionCard.tsx - Carte de convention
├── DelegationManager.tsx - Gestionnaire de délégations
├── ArbitragePanel.tsx - Panneau d'arbitrage
├── DocumentPreview.tsx - Prévisualisation de documents
├── ApprovalButtons.tsx - Boutons d'approbation/rejet
└── ActivityTimeline.tsx - Timeline d'activités
```

---

## 🔒 Sécurité et Permissions

### Décorateur de Permissions

```typescript
// backend/src/auth/president-permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';

export enum PresidentPermission {
  SIGN_DIPLOMAS = 'sign_diplomas',
  SIGN_CONVENTIONS = 'sign_conventions',
  VALIDATE_PROGRAMS = 'validate_programs',
  VALIDATE_RECRUITMENT = 'validate_recruitment',
  VALIDATE_INVESTMENTS = 'validate_investments',
  ARBITRATE_DISCIPLINE = 'arbitrate_discipline',
  DELEGATE_SIGNATURES = 'delegate_signatures',
  MANAGE_CALENDAR = 'manage_calendar',
  DEFINE_POLICIES = 'define_policies',
  VIEW_ALL_KPI = 'view_all_kpi',
}

export const RequirePresidentPermission = (...permissions: PresidentPermission[]) =>
  SetMetadata('president_permissions', permissions);
```

### Guard de Permissions

```typescript
// backend/src/auth/president-permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PresidentPermission } from './president-permissions.decorator';

@Injectable()
export class PresidentPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<PresidentPermission[]>(
      'president_permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Vérifier si l'utilisateur est President
    if (user.role !== 'president') {
      return false;
    }

    // Vérifier les délégations si applicable
    // ...

    return true;
  }
}
```

### Utilisation dans les Contrôleurs

```typescript
@Controller('president/signatures')
@UseGuards(JwtAuthGuard, RolesGuard, PresidentPermissionsGuard)
@Roles('president')
export class SignatureController {
  @Post('diplomas/:id')
  @RequirePresidentPermission(PresidentPermission.SIGN_DIPLOMAS)
  async signDiploma(@Param('id') id: string, @CurrentUser() user: any) {
    // ...
  }
}
```

---

## 📊 Audit et Traçabilité

### Table d'Audit

```sql
CREATE TABLE audit_president (
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

### Service d'Audit

```typescript
@Injectable()
export class AuditService {
  async logAction(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    details: any,
    ipAddress: string,
  ): Promise<void> {
    // Enregistrer l'action dans la table d'audit
  }
}
```

---

## 🧪 Tests

### Tests Unitaires

```typescript
describe('SignatureService', () => {
  it('should create a signature', async () => {
    // Test de création de signature
  });

  it('should verify a signature', async () => {
    // Test de vérification
  });

  it('should revoke a signature', async () => {
    // Test de révocation
  });
});
```

### Tests d'Intégration

```typescript
describe('President API', () => {
  it('POST /president/signatures/diplomas/:id should sign a diploma', async () => {
    // Test d'intégration
  });
});
```

---

## 📚 Documentation

### Swagger/OpenAPI

Toutes les routes doivent être documentées avec Swagger :

```typescript
@ApiTags('President - Signatures')
@ApiBearerAuth()
@ApiOperation({ summary: 'Signer un diplôme électroniquement' })
@ApiResponse({ status: 200, description: 'Diplôme signé avec succès' })
@ApiResponse({ status: 404, description: 'Diplôme non trouvé' })
```

---

**Date de création** : 2026-05-05  
**Version** : 1.0  
**Auteur** : Équipe de développement ImTech