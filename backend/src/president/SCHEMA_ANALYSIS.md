# Analyse du Schéma BD.sql pour le Module Président

## Tables Existantes dans BD.sql

### ✅ Tables Présentes
1. **etudiant** - Table des étudiants (id: uuid, matricule, nom, prenom, statut: actif/inactif)
2. **contrat_personnel** - Contrats du personnel (id: uuid, type_contrat: CDI/CDD/vacataire, poste, salaire_brut, actif)
3. **depense** - Dépenses (id: uuid, montant, statut: en_attente/approuve/paye/rejete, approuve_par)
4. **diplome** - Diplômes (id: uuid, statut: en_attente/delivre/retire/annule, type_diplome, numero_diplome, hash_integrite)
5. **incident_disciplinaire** - Incidents (id: uuid, statut: ouvert/en_cours/clos/arbitrage, type_incident, sanction)
6. **conseil_discipline** - Conseils de discipline (id: uuid, statut: convoque/tenu/reporte/annule, decision, justification_decision)
7. **parcours** - Parcours académiques (id: uuid, niveau: Licence/Master/Doctorat, actif, responsable_id)
8. **calendrier_academique** - Calendrier (id: uuid, type_evenement: rentree/cours/vacances/examens/deliberation/ceremonie/pastoral)
9. **paiement** - Paiements (id: uuid, montant, statut, date_paiement)
10. **echeancier** - Échéanciers de paiement (id: uuid, montant_restant, statut)
11. **annee_academique** - Années académiques (id: uuid, annee_debut, annee_fin, actif)
12. **utilisateur** - Utilisateurs (id: uuid, nom, prenom, role, email)
13. **inscription** - Inscriptions étudiants (id: uuid, statut: en_attente/validee/annulee)
14. **conge_personnel** - Congés du personnel (id: uuid, statut: demande/approuve/refuse)
15. **deliberation** - Délibérations (id: uuid, statut: planifiee/en_cours/terminee, validee_par)

### ❌ Tables Manquantes (à créer)

#### 1. **convention** (Conventions partenariats)
```sql
CREATE TABLE {schema}.convention (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    intitule VARCHAR(300) NOT NULL,
    partenaire VARCHAR(200) NOT NULL,
    type_partenaire VARCHAR(50) NOT NULL CHECK (type_partenaire IN ('eglise', 'diocese', 'etat', 'entreprise', 'universite', 'ong')),
    objet_convention TEXT NOT NULL,
    date_signature DATE,
    date_debut_effet DATE NOT NULL,
    date_fin_effet DATE,
    montant_engagement NUMERIC(15,2),
    document_url VARCHAR(500),
    statut VARCHAR(30) DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'signee', 'active', 'expiree', 'resiliee')),
    signe_president BOOLEAN DEFAULT FALSE,
    signature_hash VARCHAR(128),
    representant_partenaire VARCHAR(200),
    remarques TEXT,
    cree_par UUID NOT NULL,
    signe_par UUID,
    date_signature_president TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. **delegation_signature** (Délégations de signature)
```sql
CREATE TABLE {schema}.delegation_signature (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    delegant_id UUID NOT NULL, -- ID du président
    delegataire_id UUID NOT NULL, -- ID du secrétaire général
    types_actes TEXT[] NOT NULL, -- ['attestation_scolarite', 'convocation', 'certificat']
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    conditions TEXT,
    statut VARCHAR(20) DEFAULT 'active' CHECK (statut IN ('active', 'revoquee', 'expiree')),
    date_revocation TIMESTAMP,
    revoque_par UUID,
    motif_revocation TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT delegation_dates_check CHECK (date_fin > date_debut)
);
```

#### 3. **audit_log** (Table publique - déjà existante normalement)
Si absente, créer dans le schéma public:
```sql
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_schema VARCHAR(100) NOT NULL,
    utilisateur_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entite VARCHAR(100) NOT NULL,
    entite_id UUID,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_user ON public.audit_log(tenant_schema, utilisateur_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_log(created_at DESC);
```

## Adaptations Nécessaires

### 1. Champs manquants dans les tables existantes

#### Table `contrat_personnel`
- ✅ Tous les champs nécessaires sont présents
- Besoin d'ajouter des champs pour validation président:
```sql
ALTER TABLE {schema}.contrat_personnel 
ADD COLUMN IF NOT EXISTS statut_validation VARCHAR(30) DEFAULT 'en_attente' 
    CHECK (statut_validation IN ('en_attente', 'en_attente_president', 'valide_president', 'rejete_president'));
ADD COLUMN IF NOT EXISTS valide_par UUID;
ADD COLUMN IF NOT EXISTS valide_le TIMESTAMP;
ADD COLUMN IF NOT EXISTS commentaire_president TEXT;
ADD COLUMN IF NOT EXISTS conditions_speciales TEXT;
```

#### Table `depense`
- ✅ Champs présents: statut, approuve_par, date_approbation
- Besoin d'ajouter un seuil pour validation présidentielle:
```sql
ALTER TABLE {schema}.depense
ADD COLUMN IF NOT EXISTS necessite_validation_president BOOLEAN 
    GENERATED ALWAYS AS (montant >= 1000000) STORED;
ADD COLUMN IF NOT EXISTS commentaire_validation TEXT;
```

#### Table `diplome`
- ❌ Manque les champs de signature président:
```sql
ALTER TABLE {schema}.diplome
ADD COLUMN IF NOT EXISTS signe_president BOOLEAN DEFAULT FALSE;
ADD COLUMN IF NOT EXISTS date_signature_president TIMESTAMP;
ADD COLUMN IF NOT EXISTS signature_hash VARCHAR(128);
ADD COLUMN IF NOT EXISTS mention_speciale TEXT;
-- Modifier le statut pour inclure 'pret_signature' et 'signe'
-- Actuellement: en_attente, delivre, retire, annule, remplace
```

#### Table `conseil_discipline`
- ✅ Présente dans tenant_universite_d_antsiranana
- ❌ Absente dans tenant_ispm - à créer:
```sql
CREATE TABLE tenant_ispm.conseil_discipline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    etudiant_id UUID NOT NULL REFERENCES tenant_ispm.etudiant(id),
    date_conseil TIMESTAMP NOT NULL,
    motif_convocation TEXT NOT NULL,
    incidents_lies JSONB DEFAULT '[]',
    membres_presents JSONB DEFAULT '[]',
    deliberation TEXT,
    decision VARCHAR(100) CHECK (decision IN ('aucune_sanction', 'avertissement', 'blame', 'exclusion_temporaire', 'exclusion_definitive', 'renvoi')),
    justification_decision TEXT,
    droit_appel BOOLEAN DEFAULT TRUE,
    delai_appel_jours INTEGER DEFAULT 15,
    statut VARCHAR(50) DEFAULT 'convoque' CHECK (statut IN ('convoque', 'en_attente_president', 'tenu', 'tranche', 'reporte', 'annule')),
    proces_verbal_url TEXT,
    parent_present BOOLEAN DEFAULT FALSE,
    decision_president VARCHAR(100),
    motivation_president TEXT,
    duree_suspension_jours INTEGER,
    statue_par UUID,
    statue_le TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Table `calendrier_academique`
- ✅ Structure de base présente
- Besoin d'ajouter validation:
```sql
ALTER TABLE {schema}.calendrier_academique
ADD COLUMN IF NOT EXISTS statut VARCHAR(30) DEFAULT 'en_attente_validation' 
    CHECK (statut IN ('en_attente_validation', 'valide', 'modifie', 'annule'));
ADD COLUMN IF NOT EXISTS valide_par UUID;
ADD COLUMN IF NOT EXISTS date_validation TIMESTAMP;
ADD COLUMN IF NOT EXISTS commentaire_validation TEXT;
```

#### Table `parcours`
- ✅ Champ `actif` présent
- Besoin d'ajouter historique:
```sql
ALTER TABLE {schema}.parcours
ADD COLUMN IF NOT EXISTS date_ouverture DATE;
ADD COLUMN IF NOT EXISTS date_fermeture DATE;
ADD COLUMN IF NOT EXISTS motif_fermeture TEXT;
ADD COLUMN IF NOT EXISTS ferme_par UUID;
```

### 2. Différences de types de données

| Table | Champ | BD.sql | Service actuel | Action |
|-------|-------|--------|----------------|--------|
| etudiant | id | UUID | number | ✅ Adapter service pour UUID |
| contrat_personnel | id | UUID | number | ✅ Adapter service pour UUID |
| depense | id | UUID | number | ✅ Adapter service pour UUID |
| diplome | id | UUID | number | ✅ Adapter service pour UUID |
| utilisateur | id | UUID | number | ✅ Adapter service pour UUID |

**Tous les IDs sont des UUID dans BD.sql, pas des integers!**

### 3. Noms de colonnes différents

| Table | Service actuel | BD.sql | Action |
|-------|---------------|--------|--------|
| etudiant | statut | actif (boolean) | ✅ Utiliser `actif = true` au lieu de `statut = 'actif'` |
| diplome | statut | statut | ✅ OK mais valeurs: en_attente/delivre/retire/annule |

## Résumé des Actions Requises

### Migrations SQL à créer:
1. ✅ Créer table `convention`
2. ✅ Créer table `delegation_signature`
3. ✅ Créer table `conseil_discipline` dans tenant_ispm
4. ✅ ALTER TABLE `contrat_personnel` - ajouter champs validation
5. ✅ ALTER TABLE `depense` - ajouter champs validation président
6. ✅ ALTER TABLE `diplome` - ajouter champs signature président
7. ✅ ALTER TABLE `calendrier_academique` - ajouter champs validation
8. ✅ ALTER TABLE `parcours` - ajouter historique ouverture/fermeture

### Adaptations du service:
1. ✅ Remplacer tous les `number` par `string` (UUID) dans les interfaces
2. ✅ Adapter les requêtes SQL pour utiliser UUID au lieu d'integers
3. ✅ Corriger `etudiant.statut = 'actif'` → `etudiant.actif = true`
4. ✅ Adapter les valeurs d'enum selon BD.sql
5. ✅ Utiliser les bons noms de colonnes

### DTOs à vérifier:
- ✅ ValidateRecruitmentDto - OK
- ✅ ValidateInvestmentDto - OK
- ✅ SignDiplomaDto - OK
- ✅ SignConventionDto - OK
- ✅ ArbitrateDisciplineDto - Adapter décisions selon BD.sql
- ✅ ValidateParcoursDto - OK
- ✅ ValidateCalendarDto - OK
- ✅ DelegateSignatureDto - OK