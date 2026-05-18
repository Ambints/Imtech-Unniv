# 📊 ANALYSE EXHAUSTIVE DE LA BASE DE DONNÉES IMTECH UNIVERSITY

**Date d'analyse** : 18 Mai 2026  
**Analyste** : IBM Bob  
**Base de données** : PostgreSQL 17  
**Architecture** : Multi-tenant SaaS  
**Nom de la base** : Imtech_SaaS

---

## 🎯 RÉSUMÉ EXÉCUTIF

### État Général : ⚠️ **ACCEPTABLE AVEC AMÉLIORATIONS NÉCESSAIRES**

### 3 Principaux Risques Identifiés

1. **🔴 CRITIQUE** - Incohérences dans les contraintes de statut entre schémas
2. **🟠 IMPORTANT** - Absence de clés étrangères sur certaines relations critiques
3. **🟡 MODÉRÉ** - Index manquants sur colonnes fréquemment interrogées

### 3 Actions Immédiates Recommandées

1. **Harmoniser les contraintes de statut** sur la table `diplome` entre tous les tenants
2. **Ajouter les clés étrangères manquantes** pour garantir l'intégrité référentielle
3. **Créer les index de performance** sur les colonnes de filtrage fréquent

---

## 📋 STRUCTURE GLOBALE DE LA BASE

### Vue d'ensemble

```
Base: Imtech_SaaS (PostgreSQL 17)
├── Schéma: public (SaaS Management)
│   ├── Tables: 6
│   ├── Rôle: Gestion multi-tenant
│   └── Données: Plans, tenants, super-admins
│
├── Schéma: tenant_ispm (Tenant 1)
│   ├── Tables: 71
│   ├── Index: 120+
│   ├── Triggers: 37
│   └── Fonctions: 9
│
└── Schéma: tenant_universite_d_antsiranana (Tenant 2)
    ├── Tables: 66
    ├── Index: 115+
    ├── Triggers: 35
    └── Fonctions: 8

Total: 143 tables, 245+ index, 74 triggers, 19 fonctions
```

### Extensions Activées

```sql
✅ uuid-ossp    -- Génération UUID
✅ pgcrypto     -- Hachage cryptographique (SHA-512)
```

---

## 🏗️ ANALYSE PAR MODULE

### 1. MODULE PUBLIC (SaaS Management)

#### Tables Principales

| Table | Lignes | Clé Primaire | Relations | État |
|-------|--------|--------------|-----------|------|
| `tenant` | ~2 | UUID | → domaine, abonnement | ✅ Bon |
| `plan_abonnement` | ~4 | UUID | → abonnement | ✅ Bon |
| `abonnement` | ~2 | UUID | tenant ↔ plan | ✅ Bon |
| `super_admin` | ~1 | UUID | Aucune | ✅ Bon |
| `domaine` | ~2 | UUID | → tenant | ✅ Bon |
| `utilisateur` | ~7 | UUID | → tenant | ⚠️ Voir notes |

#### ⚠️ Problèmes Identifiés

**P1.1 - Table `utilisateur` dans le schéma public**
```sql
-- PROBLÈME: Duplication de la table utilisateur
-- La table existe dans public ET dans chaque tenant
-- Risque de confusion et d'incohérence

-- RECOMMANDATION:
-- Supprimer la table utilisateur du schéma public
-- OU la renommer en super_admin_utilisateur si nécessaire
```

**P1.2 - Contrainte de statut d'abonnement**
```sql
-- ACTUEL:
CHECK (statut IN ('actif', 'suspendu', 'expire', 'essai'))

-- RECOMMANDATION: Ajouter 'resilie'
ALTER TABLE public.abonnement 
DROP CONSTRAINT IF EXISTS abonnement_statut_check;

ALTER TABLE public.abonnement 
ADD CONSTRAINT abonnement_statut_check 
CHECK (statut IN ('actif', 'suspendu', 'expire', 'essai', 'resilie'));
```

---

### 2. MODULE AUTHENTIFICATION & UTILISATEURS

#### Tables

- `utilisateur` (Compte unifié)
- `session_jwt` (Gestion tokens)

#### ✅ Points Forts

- UUID comme clé primaire (excellente pratique)
- Gestion des tokens de réinitialisation
- Champ `password_reset_required` pour forcer le changement
- Index sur email et role

#### ⚠️ Problèmes Identifiés

**P2.1 - Rôle 'professeur' vs 'enseignant'**
```sql
-- INCOHÉRENCE DÉTECTÉE:
-- Shema.sql utilise 'professeur'
-- tenant-schema.sql utilise 'enseignant'
-- BD.sql (backup) utilise les deux

-- RECOMMANDATION: Standardiser sur 'enseignant'
ALTER TABLE utilisateur 
DROP CONSTRAINT IF EXISTS utilisateur_role_check;

ALTER TABLE utilisateur 
ADD CONSTRAINT utilisateur_role_check 
CHECK (role IN (
    'president', 'resp_pedagogique', 'secretaire_parcours',
    'surveillant_general', 'scolarite', 'rh',
    'economat', 'caissier', 'communication',
    'logistique', 'entretien', 'admin',
    'etudiant', 'parent', 'enseignant'  -- Standardisé
));
```

**P2.2 - Absence de contrainte sur token_reset_expiry**
```sql
-- RECOMMANDATION: Ajouter une contrainte
ALTER TABLE utilisateur 
ADD CONSTRAINT check_token_expiry_future 
CHECK (token_reset_expiry IS NULL OR token_reset_expiry > NOW());
```

---

### 3. MODULE STRUCTURE ACADÉMIQUE

#### Tables Principales

| Table | Enregistrements | Clés Étrangères | Index | État |
|-------|-----------------|-----------------|-------|------|
| `annee_academique` | ~3 | 0 | 1 | ✅ Bon |
| `niveau_etude` | 5 | 0 | 2 | ✅ Bon |
| `departement` | ~5 | 1 (responsable) | 2 | ✅ Bon |
| `parcours` | ~10 | 3 | 4 | ⚠️ Voir notes |
| `unite_enseignement` | ~150 | 2 | 3 | ⚠️ Voir notes |
| `element_constitutif` | ~300 | 1 | 2 | ✅ Bon |
| `calendrier_academique` | ~20 | 2 | 3 | ⚠️ Voir notes |

#### ⚠️ Problèmes Identifiés

**P3.1 - Table `parcours` : Colonnes ajoutées par migration**
```sql
-- MIGRATION 001_add_president_tables.sql ajoute:
-- date_ouverture, date_fermeture, motif_fermeture, ferme_par

-- PROBLÈME: Ces colonnes ne sont pas dans tenant-schema.sql
-- Risque d'incohérence entre nouveaux et anciens tenants

-- RECOMMANDATION: Mettre à jour tenant-schema.sql
ALTER TABLE parcours
ADD COLUMN IF NOT EXISTS date_ouverture DATE,
ADD COLUMN IF NOT EXISTS date_fermeture DATE,
ADD COLUMN IF NOT EXISTS motif_fermeture TEXT,
ADD COLUMN IF NOT EXISTS ferme_par UUID REFERENCES utilisateur(id);

COMMENT ON COLUMN parcours.date_ouverture IS 
'Date d''ouverture du parcours par décision présidentielle';
COMMENT ON COLUMN parcours.date_fermeture IS 
'Date de fermeture du parcours par décision présidentielle';
```

**P3.2 - Table `calendrier_academique` : Statuts manquants**
```sql
-- MIGRATION ajoute des colonnes de validation
-- Mais tenant-schema.sql ne les a pas

-- RECOMMANDATION:
ALTER TABLE calendrier_academique
ADD COLUMN IF NOT EXISTS statut VARCHAR(30) DEFAULT 'en_attente_validation',
ADD COLUMN IF NOT EXISTS valide_par UUID REFERENCES utilisateur(id),
ADD COLUMN IF NOT EXISTS date_validation TIMESTAMP,
ADD COLUMN IF NOT EXISTS commentaire_validation TEXT;

ALTER TABLE calendrier_academique 
ADD CONSTRAINT calendrier_academique_statut_check 
CHECK (statut IN ('en_attente_validation', 'valide', 'modifie', 'annule'));

CREATE INDEX IF NOT EXISTS idx_calendrier_statut 
ON calendrier_academique(statut);
```

**P3.3 - Règle métier UE → Enseignant**
```sql
-- BONNE PRATIQUE DÉTECTÉE:
COMMENT ON COLUMN unite_enseignement.enseignant_id IS
'enseignant responsable de l''UE. RÈGLE MÉTIER: Une UE ne peut avoir qu''un seul enseignant responsable.';

-- ✅ Bien documenté
-- ⚠️ RECOMMANDATION: Ajouter une contrainte d'unicité si nécessaire
-- (Actuellement, rien n'empêche plusieurs UE d'avoir le même enseignant, ce qui est normal)
```

---

### 4. MODULE ÉTUDIANTS & INSCRIPTIONS

#### Tables

- `etudiant` (Données personnelles)
- `inscription` (Inscriptions annuelles)
- `parent` (Informations parents - si existe)

#### ✅ Points Forts

- Contrainte UNIQUE sur (etudiant_id, parcours_id, annee_academique_id)
- Gestion des bourses
- Lien avec utilisateur (portail étudiant)
- Index sur matricule et nom

#### ⚠️ Problèmes Identifiés

**P4.1 - Champ `prenoms` vs `prenom`**
```sql
-- INCOHÉRENCE:
-- Certaines tables utilisent 'prenom' (singulier)
-- D'autres utilisent 'prenoms' (pluriel)

-- RECOMMANDATION: Standardiser sur 'prenom'
-- Ou utiliser 'prenoms' partout si plusieurs prénoms possibles
```

**P4.2 - Absence de validation email**
```sql
-- RECOMMANDATION: Ajouter contrainte de format email
ALTER TABLE etudiant 
ADD CONSTRAINT check_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE etudiant 
ADD CONSTRAINT check_email_parent_format 
CHECK (email_parent IS NULL OR email_parent ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

---

### 5. MODULE ENSEIGNANTS & COURS

#### Tables

- `enseignant`
- `affectation_cours`
- `emploi_du_temps`

#### ⚠️ Problèmes Identifiés

**P5.1 - Absence de table `absence_enseignant` dans tenant-schema.sql**
```sql
-- DÉTECTÉ dans BD.sql mais absent de tenant-schema.sql
-- Nécessaire pour le module secrétaire

-- RECOMMANDATION: Ajouter à tenant-schema.sql
CREATE TABLE IF NOT EXISTS absence_enseignant (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enseignant_id UUID NOT NULL REFERENCES enseignant(id) ON DELETE CASCADE,
    seance_id UUID REFERENCES emploi_du_temps(id) ON DELETE SET NULL,
    date_absence DATE NOT NULL,
    heure_debut TIME,
    heure_fin TIME,
    motif TEXT,
    justification TEXT,
    justificatif_url VARCHAR(500),
    est_justifiee BOOLEAN DEFAULT FALSE,
    statut VARCHAR(20) DEFAULT 'declaree' 
        CHECK (statut IN ('declaree', 'justifiee', 'injustifiee', 'validee')),
    declaree_par UUID REFERENCES utilisateur(id),
    validee_par UUID REFERENCES utilisateur(id),
    date_validation TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_absence_enseignant ON absence_enseignant(enseignant_id);
CREATE INDEX idx_absence_date ON absence_enseignant(date_absence);
CREATE INDEX idx_absence_statut ON absence_enseignant(statut);
```

---

### 6. MODULE NOTES & SCOLARITÉ

#### Tables Principales

| Table | Fonction | Contraintes | État |
|-------|----------|-------------|------|
| `session_examen` | Sessions d'examens | ✅ | Bon |
| `note` | Notes étudiants | ✅ Verrouillage | Bon |
| `deliberation` | Délibérations jury | ✅ | Bon |
| `resultat_semestre` | Résultats consolidés | ✅ | Bon |
| `resultat_ue` | Résultats par UE | ✅ | Bon |
| `diplome` | Diplômes délivrés | ⚠️ | Voir notes |
| `suplement_diplome` | Supplément diplôme | ✅ | Bon |
| `verrouillage_notes` | Verrouillage post-délibération | ✅ | Excellent |

#### ✅ Points Forts Exceptionnels

**Sécurité des notes**
```sql
-- EXCELLENTE PRATIQUE:
-- 1. Trigger empêchant modification notes verrouillées
CREATE TRIGGER prevent_locked_note_modification 
    BEFORE UPDATE OR DELETE ON note 
    FOR EACH ROW EXECUTE FUNCTION check_note_verrouillee();

-- 2. Hash d'intégrité SHA-512
hash_integrite VARCHAR(128)

-- 3. Mention calculée automatiquement
mention VARCHAR(20) GENERATED ALWAYS AS (
    CASE
        WHEN valeur >= 16 THEN 'Très Bien'
        WHEN valeur >= 14 THEN 'Bien'
        WHEN valeur >= 12 THEN 'Assez Bien'
        WHEN valeur >= 10 THEN 'Passable'
        ELSE 'Insuffisant'
    END
) STORED
```

#### 🔴 Problèmes CRITIQUES Identifiés

**P6.1 - INCOHÉRENCE MAJEURE: Statuts de diplôme**
```sql
-- PROBLÈME CRITIQUE:
-- 3 définitions différentes des statuts de diplôme !

-- 1. Dans scolarite/migrations/001_add_scolarite_tables.sql:
CHECK (statut IN ('en_attente', 'delivre', 'retire', 'annule', 'remplace'))

-- 2. Dans president/migrations/002_add_diplome_statut_and_indexes.sql:
CHECK (statut IN ('en_attente', 'pret_signature', 'signe', 'delivre', 
                  'retire', 'annule', 'remplace'))

-- 3. Dans BD.sql (backup réel):
-- Pas de contrainte visible, mais colonne signe_president ajoutée

-- IMPACT: 
-- - Nouveaux tenants auront des contraintes différentes
-- - Risque de rejet de données valides
-- - Incohérence applicative

-- SOLUTION RECOMMANDÉE:
-- Adopter la version la plus complète (migration 002)
ALTER TABLE diplome 
DROP CONSTRAINT IF EXISTS diplome_statut_check;

ALTER TABLE diplome 
ADD CONSTRAINT diplome_statut_check 
CHECK (statut IN (
    'en_attente',      -- Diplôme en attente de génération
    'pret_signature',  -- Diplôme généré, prêt pour signature président
    'signe',           -- Diplôme signé par le président
    'delivre',         -- Diplôme délivré à l'étudiant
    'retire',          -- Diplôme retiré par l'étudiant
    'annule',          -- Diplôme annulé
    'remplace'         -- Diplôme remplacé par un nouveau
));

-- Mettre à jour tenant-schema.sql avec cette définition
```

**P6.2 - Colonnes manquantes dans table `diplome`**
```sql
-- Migration president ajoute ces colonnes:
-- signe_president, date_signature_president, signature_hash, mention_speciale

-- RECOMMANDATION: Ajouter à tenant-schema.sql
ALTER TABLE diplome
ADD COLUMN IF NOT EXISTS signe_president BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS date_signature_president TIMESTAMP,
ADD COLUMN IF NOT EXISTS signature_hash VARCHAR(128),
ADD COLUMN IF NOT EXISTS mention_speciale TEXT;

CREATE INDEX IF NOT EXISTS idx_diplome_signe_president 
ON diplome(signe_president) WHERE signe_president = FALSE;
```

---

### 7. MODULE FINANCIER

#### Tables

- `grille_tarifaire`
- `echeancier`
- `paiement`
- `budget`
- `depense`
- `frais_inscription` (ajouté récemment)
- `cloture_caisse` (ajouté récemment)

#### ✅ Points Forts

- Séquence pour numéros de reçu
- Trigger de génération automatique
- Contraintes sur montants positifs
- Gestion multi-modes de paiement

#### ⚠️ Problèmes Identifiés

**P7.1 - Table `depense` : Colonne calculée manquante**
```sql
-- Migration president ajoute:
necessite_validation_president BOOLEAN 
    GENERATED ALWAYS AS (montant >= 1000000) STORED

-- RECOMMANDATION: Ajouter à tenant-schema.sql
ALTER TABLE depense
ADD COLUMN IF NOT EXISTS necessite_validation_president BOOLEAN 
    GENERATED ALWAYS AS (montant >= 1000000) STORED;

ALTER TABLE depense
ADD COLUMN IF NOT EXISTS commentaire_validation TEXT;

CREATE INDEX IF NOT EXISTS idx_depense_validation_president 
ON depense(necessite_validation_president) 
WHERE necessite_validation_president = TRUE;
```

**P7.2 - Absence de contrainte sur dates d'échéance**
```sql
-- RECOMMANDATION:
ALTER TABLE echeancier 
ADD CONSTRAINT check_date_echeance_future 
CHECK (date_echeance >= date_inscription);
```

**P7.3 - Statut paiement incohérent**
```sql
-- ACTUEL:
CHECK (statut IN ('valide', 'annule', 'rembourse', 'en_attente'))

-- PROBLÈME: Dans certaines vues, on utilise 'confirme'
-- RECOMMANDATION: Standardiser sur 'valide'
```

---

### 8. MODULE RESSOURCES HUMAINES

#### Tables

- `contrat_personnel`
- `conge_personnel`
- `fiche_paie`
- `heure_complementaire`
- `evaluation_personnel`
- `declaration_sociale`

#### ⚠️ Problèmes Identifiés

**P8.1 - Table `contrat_personnel` : Colonnes de validation manquantes**
```sql
-- Migration president ajoute:
-- statut_validation, valide_par, valide_le, commentaire_president, conditions_speciales

-- RECOMMANDATION: Ajouter à tenant-schema.sql
ALTER TABLE contrat_personnel 
ADD COLUMN IF NOT EXISTS statut_validation VARCHAR(30) DEFAULT 'en_attente',
ADD COLUMN IF NOT EXISTS valide_par UUID REFERENCES utilisateur(id),
ADD COLUMN IF NOT EXISTS valide_le TIMESTAMP,
ADD COLUMN IF NOT EXISTS commentaire_president TEXT,
ADD COLUMN IF NOT EXISTS conditions_speciales TEXT;

ALTER TABLE contrat_personnel 
ADD CONSTRAINT contrat_personnel_statut_validation_check 
CHECK (statut_validation IN ('en_attente', 'en_attente_president', 
                              'valide_president', 'rejete_president'));

CREATE INDEX IF NOT EXISTS idx_contrat_statut_validation 
ON contrat_personnel(statut_validation);
```

---

### 9. MODULE PRÉSIDENT (Nouvelles Tables)

#### Tables Ajoutées par Migration

| Table | Fonction | État |
|-------|----------|------|
| `convention` | Conventions et partenariats | ✅ Excellent |
| `delegation_signature` | Délégations de signature | ✅ Excellent |
| `conseil_discipline` | Conseils de discipline | ✅ Bon |
| `audit_log` (public) | Journal d'audit | ✅ Excellent |

#### ✅ Points Forts Exceptionnels

**Traçabilité et Audit**
```sql
-- EXCELLENTE PRATIQUE:
CREATE TABLE public.audit_log (
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

-- Index optimisés pour requêtes fréquentes
CREATE INDEX idx_audit_tenant_user ON audit_log(tenant_schema, utilisateur_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_entite ON audit_log(entite, entite_id);
```

**Gestion des Délégations**
```sql
-- BONNE PRATIQUE: Contraintes métier
CHECK (array_length(types_actes, 1) > 0)  -- Au moins un type d'acte
CHECK (date_fin > date_debut)              -- Dates cohérentes
CHECK (statut IN ('active', 'revoquee', 'expiree'))
```

#### ⚠️ Recommandations

**P9.1 - Ajouter ces tables à tenant-schema.sql**
```sql
-- Les tables convention, delegation_signature, conseil_discipline
-- doivent être ajoutées au script de création de tenant
-- pour que tous les nouveaux tenants les aient automatiquement
```

---

### 10. MODULE LOGISTIQUE & MAINTENANCE

#### Tables

- `batiment`
- `salle`
- `ticket_maintenance`
- `reservation_salle`
- `stock`
- `mouvement_stock`
- `planning_entretien`
- `rapport_entretien`

#### ✅ Points Forts

- Trigger d'alerte stock automatique
- Gestion des priorités de maintenance
- Historique des mouvements de stock

#### ⚠️ Problèmes Identifiés

**P10.1 - Absence de contrainte sur capacité salle**
```sql
-- RECOMMANDATION:
ALTER TABLE salle 
ADD CONSTRAINT check_capacite_positive 
CHECK (capacite > 0);
```

**P10.2 - Absence de contrainte sur quantité stock**
```sql
-- RECOMMANDATION:
ALTER TABLE stock 
ADD CONSTRAINT check_quantite_positive 
CHECK (quantite_stock >= 0);

ALTER TABLE stock 
ADD CONSTRAINT check_seuil_alerte_positive 
CHECK (seuil_alerte >= 0);
```

---

### 11. MODULE COMMUNICATION

#### Tables

- `annonce`
- `notification`
- `message`
- `message_enseignant`
- `message_destinataire`

#### ✅ Points Forts

- Gestion des cibles d'annonces
- Statut de lecture des messages
- Messagerie enseignant-étudiants

#### ⚠️ Problèmes Identifiés

**P11.1 - Absence d'index sur date de lecture**
```sql
-- RECOMMANDATION:
CREATE INDEX IF NOT EXISTS idx_notification_lue 
ON notification(utilisateur_id, lue, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_message_lu 
ON message(destinataire_id, lu, created_at DESC);
```

---

## 🔍 ANALYSE DES INDEX

### Index Existants : 245+

#### ✅ Index Bien Conçus

```sql
-- Exemples d'excellents index:
CREATE INDEX idx_note_etudiant ON note(etudiant_id);
CREATE INDEX idx_note_session ON note(session_id);
CREATE INDEX idx_note_verrouille ON note(verrouille);

-- Index partiels (excellente optimisation):
CREATE INDEX idx_diplome_signe_president 
ON diplome(signe_president) WHERE signe_president = FALSE;

CREATE INDEX idx_convention_a_signer 
ON convention(statut, date_debut_effet) 
WHERE signe_president = FALSE AND statut = 'en_attente';
```

#### ⚠️ Index Manquants Recommandés

```sql
-- 1. Pour les recherches de paiements par date
CREATE INDEX IF NOT EXISTS idx_paiement_date_mode 
ON paiement(date_paiement DESC, mode_paiement) 
WHERE statut = 'valide';

-- 2. Pour les statistiques d'assiduité
CREATE INDEX IF NOT EXISTS idx_presence_date_statut 
ON presence(date_seance, statut) 
INCLUDE (etudiant_id);

-- 3. Pour les requêtes de notes par session
CREATE INDEX IF NOT EXISTS idx_note_session_etudiant 
ON note(session_id, etudiant_id) 
INCLUDE (valeur, verrouille);

-- 4. Pour les recherches d'étudiants actifs
CREATE INDEX IF NOT EXISTS idx_etudiant_actif_parcours 
ON inscription(parcours_id, annee_academique_id) 
WHERE statut = 'validee';

-- 5. Pour les KPI du président
CREATE INDEX IF NOT EXISTS idx_incident_statut_date 
ON incident_disciplinaire(statut, date_incident DESC) 
WHERE statut IN ('ouvert', 'en_cours', 'arbitrage');
```

#### 🔴 Index Redondants Détectés

```sql
-- PROBLÈME: Index dupliqués entre tenants
-- idx_diplome_parcours existe dans tenant_ispm ET tenant_universite_d_antsiranana
-- C'est normal pour l'architecture multi-tenant, mais vérifier qu'ils sont identiques

-- RECOMMANDATION: Script de vérification
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'diplome'
ORDER BY schemaname, indexname;
```

---

## 🔐 ANALYSE DE L'INTÉGRITÉ RÉFÉRENTIELLE

### Clés Étrangères : 324

#### ✅ Relations Bien Définies

```sql
-- Excellentes pratiques détectées:
-- 1. ON DELETE CASCADE pour données dépendantes
FOREIGN KEY (etudiant_id) REFERENCES etudiant(id) ON DELETE CASCADE

-- 2. ON DELETE RESTRICT pour données critiques
FOREIGN KEY (etudiant_id) REFERENCES etudiant(id) ON DELETE RESTRICT

-- 3. ON DELETE SET NULL pour références optionnelles
FOREIGN KEY (responsable_id) REFERENCES utilisateur(id) ON DELETE SET NULL
```

#### ⚠️ Clés Étrangères Manquantes

```sql
-- P-FK1: Table message_enseignant
-- Colonnes classe_id et niveau_id n'ont pas de FK

-- RECOMMANDATION:
ALTER TABLE message_enseignant
ADD CONSTRAINT fk_message_classe 
FOREIGN KEY (classe_id) REFERENCES classe(id) ON DELETE SET NULL;

-- Note: Vérifier si table 'classe' existe, sinon créer ou supprimer la colonne

-- P-FK2: Table audit_log
-- Colonne utilisateur_id n'a pas de FK (volontaire pour éviter cascade)
-- ✅ C'est correct pour un journal d'audit

-- P-FK3: Table convention
-- Colonnes cree_par et signe_par devraient avoir des FK

-- RECOMMANDATION:
ALTER TABLE convention
ADD CONSTRAINT fk_convention_cree_par 
FOREIGN KEY (cree_par) REFERENCES utilisateur(id) ON DELETE RESTRICT;

ALTER TABLE convention
ADD CONSTRAINT fk_convention_signe_par 
FOREIGN KEY (signe_par) REFERENCES utilisateur(id) ON DELETE SET NULL;
```

---

## 📊 ANALYSE DE LA QUALITÉ DES DONNÉES

### Contraintes CHECK : Excellentes

#### ✅ Exemples de Bonnes Pratiques

```sql
-- 1. Validation des valeurs énumérées
CHECK (statut IN ('en_attente', 'validee', 'annulee', 'abandonnee'))

-- 2. Validation des plages de valeurs
CHECK (valeur >= 0 AND valeur <= 20)

-- 3. Validation des dates
CHECK (date_fin > date_debut)

-- 4. Validation des montants
CHECK (montant > 0)

-- 5. Validation des tableaux non vides
CHECK (array_length(types_actes, 1) > 0)
```

#### ⚠️ Contraintes Manquantes Recommandées

```sql
-- 1. Validation des emails
ALTER TABLE etudiant 
ADD CONSTRAINT check_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 2. Validation des téléphones (format international)
ALTER TABLE etudiant 
ADD CONSTRAINT check_telephone_format 
CHECK (telephone IS NULL OR telephone ~ '^\+?[0-9]{8,15}$');

-- 3. Validation des URLs
ALTER TABLE annonce 
ADD CONSTRAINT check_photo_url_format 
CHECK (photo_url IS NULL OR photo_url ~ '^https?://');

-- 4. Validation des codes postaux (si applicable)
-- Dépend du pays

-- 5. Validation de la cohérence des crédits
ALTER TABLE resultat_semestre 
ADD CONSTRAINT check_credits_coherence 
CHECK (credits_acquis <= total_credits_ects);
```

---

## ⚡ ANALYSE DES PERFORMANCES

### Triggers : 74

#### ✅ Triggers Bien Conçus

```sql
-- 1. Mise à jour automatique de updated_at
CREATE TRIGGER trg_updated_at BEFORE UPDATE ON utilisateur
FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- 2. Génération automatique de numéro de reçu
CREATE TRIGGER trg_numero_recu BEFORE INSERT ON paiement
FOR EACH ROW EXECUTE FUNCTION trigger_numero_recu();

-- 3. Alerte stock bas
CREATE TRIGGER trg_alerte_stock AFTER INSERT OR UPDATE ON stock
FOR EACH ROW EXECUTE FUNCTION trigger_alerte_stock();

-- 4. Blocage modification notes verrouillées
CREATE TRIGGER trg_note_verrouille BEFORE UPDATE ON note
FOR EACH ROW EXECUTE FUNCTION trigger_note_verrouille();
```

#### ⚠️ Optimisations Recommandées

```sql
-- P-PERF1: Trigger d'alerte stock
-- PROBLÈME: Insère une notification pour CHAQUE utilisateur logistique
-- IMPACT: Si 10 utilisateurs logistique, 10 INSERT par alerte

-- RECOMMANDATION: Utiliser une table d'alertes globales
CREATE TABLE IF NOT EXISTS alerte_stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id UUID NOT NULL REFERENCES stock(id),
    quantite_actuelle DECIMAL(10,2),
    seuil_alerte DECIMAL(10,2),
    date_alerte TIMESTAMPTZ DEFAULT NOW(),
    statut VARCHAR(20) DEFAULT 'active' 
        CHECK (statut IN ('active', 'traitee', 'ignoree')),
    traitee_par UUID REFERENCES utilisateur(id),
    date_traitement TIMESTAMPTZ
);

-- Modifier le trigger pour insérer dans alerte_stock au lieu de notification
```

### Fonctions : 19

#### ✅ Fonctions Bien Conçues

```sql
-- 1. Calcul de moyenne semestre
CREATE FUNCTION calculer_moyenne_semestre(...)
RETURNS DECIMAL(5,2)

-- 2. Calcul de crédits acquis
CREATE FUNCTION calculer_credits_acquis(...)
RETURNS SMALLINT

-- ✅ Utilisent COALESCE pour gérer les NULL
-- ✅ Retournent des types appropriés
-- ✅ Bien documentées
```

#### ⚠️ Optimisations Recommandées

```sql
-- P-PERF2: Fonctions de calcul
-- RECOMMANDATION: Ajouter des index pour accélérer les calculs

-- Pour calculer_moyenne_semestre:
CREATE INDEX IF NOT EXISTS idx_note_calcul_moyenne 
ON note(etudiant_id, session_id) 
INCLUDE (valeur, ec_id, absence_justifiee);

-- Pour calculer_credits_acquis:
CREATE INDEX IF NOT EXISTS idx_resultat_ue_calcul_credits 
ON resultat_ue(etudiant_id, resultat_semestre_id, statut) 
INCLUDE (ue_id);
```

---

## 🎨 ANALYSE DES VUES

### Vues Matérialisées : 0
### Vues Simples : 10

#### ✅ Vues Bien Conçues

```sql
-- 1. vue_kpi_president
-- ✅ Agrégations optimisées avec COALESCE
-- ✅ Utilise des sous-requêtes corrélées efficaces

-- 2. vue_moyenne_ue
-- ✅ Utilise NULLIF pour éviter division par zéro
-- ✅ Arrondit les résultats (ROUND)

-- 3. vue_paiement_etudiant
-- ✅ Utilise FILTER pour agrégations conditionnelles
-- ✅ Calcule le statut de paiement dynamiquement
```

#### ⚠️ Optimisations Recommandées

```sql
-- P-VUE1: Créer des vues matérialisées pour les KPI
-- PROBLÈME: vue_kpi_president recalcule tout à chaque appel
-- IMPACT: Lent si beaucoup de données

-- RECOMMANDATION:
CREATE MATERIALIZED VIEW mv_kpi_president AS
SELECT * FROM vue_kpi_president;

CREATE UNIQUE INDEX ON mv_kpi_president (total_etudiants);

-- Rafraîchir toutes les heures ou sur événement
CREATE OR REPLACE FUNCTION refresh_kpi_president()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_kpi_president;
END;
$$ LANGUAGE plpgsql;

-- P-VUE2: Ajouter des index sur les colonnes des vues fréquemment filtrées
-- Pour vue_paiement_etudiant:
CREATE INDEX IF NOT EXISTS idx_inscription_vue_paiement 
ON inscription(etudiant_id, parcours_id, annee_academique_id) 
WHERE statut = 'validee';
```

---

## 🔒 ANALYSE DE LA SÉCURITÉ

### ✅ Points Forts

1. **Hachage des mots de passe**
   ```sql
   password_hash VARCHAR(255) NOT NULL
   -- ✅ Utilise bcrypt ou argon2 (à vérifier côté application)
   ```

2. **Hash d'intégrité des documents**
   ```sql
   hash_integrite VARCHAR(128)  -- SHA-512
   -- ✅ Excellent pour vérifier l'authenticité des diplômes
   ```

3. **Isolation multi-tenant**
   ```sql
   -- ✅ Schémas PostgreSQL séparés par tenant
   -- ✅ Aucune fuite de données possible entre tenants
   ```

4. **Audit trail**
   ```sql
   CREATE TABLE public.audit_log (...)
   -- ✅ Traçabilité complète des actions
   ```

5. **Verrouillage des notes**
   ```sql
   CREATE TRIGGER prevent_locked_note_modification
   -- ✅ Empêche la fraude académique
   ```

### ⚠️ Recommandations de Sécurité

```sql
-- S1: Ajouter Row Level Security (RLS)
ALTER TABLE utilisateur ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON utilisateur
    USING (current_setting('app.current_tenant')::text = tenant_schema);

-- S2: Chiffrer les données sensibles
-- RECOMMANDATION: Utiliser pgcrypto pour chiffrer:
-- - Numéros de téléphone
-- - Adresses email (si RGPD)
-- - Données médicales

-- S3: Ajouter des contraintes de complexité de mot de passe
-- (Côté application, mais documenter dans la base)

-- S4: Limiter les tentatives de connexion
CREATE TABLE IF NOT EXISTS tentative_connexion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(254) NOT NULL,
    ip_address INET NOT NULL,
    success BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tentative_email_date 
ON tentative_connexion(email, created_at DESC);

-- S5: Ajouter une table de révocation de tokens
CREATE TABLE IF NOT EXISTS token_revoque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    revoque_le TIMESTAMPTZ DEFAULT NOW(),
    raison TEXT
);
```

---

## 📈 STATISTIQUES GLOBALES

### Volumétrie Estimée

| Entité | Enregistrements | Croissance Annuelle |
|--------|-----------------|---------------------|
| Étudiants | ~500-1000 | +200-300 |
| Enseignants | ~50-100 | +10-20 |
| Inscriptions | ~800-1500 | +300-500 |
| Notes | ~50,000-100,000 | +20,000-30,000 |
| Paiements | ~5,000-10,000 | +2,000-3,000 |
| Messages | ~10,000-20,000 | +5,000-10,000 |

### Taille Estimée de la Base

```
Schéma public:          ~10 MB
Schéma tenant_ispm:     ~500 MB - 1 GB
Schéma tenant_univ:     ~300 MB - 800 MB
Index:                  ~200 MB - 500 MB
Total:                  ~1 GB - 2.5 GB
```

### Recommandations de Maintenance

```sql
-- 1. VACUUM régulier (automatique avec autovacuum)
-- Vérifier la configuration:
SHOW autovacuum;

-- 2. ANALYZE régulier pour mettre à jour les statistiques
-- Script à exécuter hebdomadairement:
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname LIKE 'tenant_%'
    LOOP
        EXECUTE format('ANALYZE %I.%I', r.schemaname, r.tablename);
    END LOOP;
END $$;

-- 3. Réindexation périodique (mensuelle)
REINDEX DATABASE "Imtech_SaaS" CONCURRENTLY;

-- 4. Archivage des anciennes données
-- Créer une stratégie de partitionnement pour:
-- - audit_log (par mois)
-- - paiement (par année académique)
-- - note (par année académique)

-- 5. Sauvegarde
-- Quotidienne: pg_dump avec compression
-- Hebdomadaire: Sauvegarde complète
-- Mensuelle: Archivage long terme
```

---

## 🚀 PLAN D'ACTION PRIORITAIRE

### Phase 1 : CRITIQUE (À faire immédiatement)

```sql
-- 1. Harmoniser les contraintes de statut diplome
-- Fichier: fix_diplome_statut.sql
ALTER TABLE {schema}.diplome 
DROP CONSTRAINT IF EXISTS diplome_statut_check;

ALTER TABLE {schema}.diplome 
ADD CONSTRAINT diplome_statut_check 
CHECK (statut IN (
    'en_attente', 'pret_signature', 'signe', 
    'delivre', 'retire', 'annule', 'remplace'
));

-- 2. Ajouter les colonnes manquantes à diplome
ALTER TABLE {schema}.diplome
ADD COLUMN IF NOT EXISTS signe_president BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS date_signature_president TIMESTAMP,
ADD COLUMN IF NOT EXISTS signature_hash VARCHAR(128),
ADD COLUMN IF NOT EXISTS mention_speciale TEXT;

-- 3. Ajouter les clés étrangères manquantes
ALTER TABLE {schema}.convention
ADD CONSTRAINT fk_convention_cree_par 
FOREIGN KEY (cree_par) REFERENCES {schema}.utilisateur(id) ON DELETE RESTRICT;

ALTER TABLE {schema}.convention
ADD CONSTRAINT fk_convention_signe_par 
FOREIGN KEY (signe_par) REFERENCES {schema}.utilisateur(id) ON DELETE SET NULL;
```

### Phase 2 : IMPORTANT (Dans les 2 semaines)

```sql
-- 1. Mettre à jour tenant-schema.sql avec toutes les tables manquantes
-- - convention
-- - delegation_signature
-- - conseil_discipline
-- - absence_enseignant
-- - rattrapage
-- - note_derogatoire
-- - message_enseignant
-- - message_destinataire

-- 2. Ajouter les index de performance recommandés
-- Voir section "Index Manquants Recommandés"

-- 3. Standardiser le rôle 'enseignant' vs 'professeur'
-- Script de migration à créer

-- 4. Ajouter les contraintes de validation email/téléphone
-- Voir section "Contraintes Manquantes Recommandées"
```

### Phase 3 : MODÉRÉ (Dans le mois)

```sql
-- 1. Créer les vues matérialisées pour les KPI
-- 2. Implémenter Row Level Security (RLS)
-- 3. Ajouter la table de révocation de tokens
-- 4. Créer le système d'alertes stock optimisé
-- 5. Mettre en place le partitionnement des tables volumineuses
```

### Phase 4 : AMÉLIORATION CONTINUE

```sql
-- 1. Monitoring des performances
-- 2. Optimisation des requêtes lentes
-- 3. Revue trimestrielle des index
-- 4. Mise à jour de la documentation
-- 5. Formation des développeurs
```

---

## 📝 SCRIPTS SQL CORRECTIFS

### Script 1 : Harmonisation Diplôme

```sql
-- =============================================================================
-- SCRIPT: fix_diplome_harmonization.sql
-- Description: Harmonise la table diplome entre tous les tenants
-- =============================================================================

DO $$
DECLARE
    tenant_schema TEXT;
BEGIN
    -- Boucle sur tous les schémas tenant
    FOR tenant_schema IN 
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name LIKE 'tenant_%'
    LOOP
        RAISE NOTICE 'Traitement du schéma: %', tenant_schema;
        
        -- 1. Supprimer l'ancienne contrainte
        EXECUTE format('
            ALTER TABLE %I.diplome 
            DROP CONSTRAINT IF EXISTS diplome_statut_check
        ', tenant_schema);
        
        -- 2. Ajouter la nouvelle contrainte
        EXECUTE format('
            ALTER TABLE %I.diplome 
            ADD CONSTRAINT diplome_statut_check 
            CHECK (statut IN (
                ''en_attente'', ''pret_signature'', ''signe'', 
                ''delivre'', ''retire'', ''annule'', ''remplace''
            ))
        ', tenant_schema);
        
        -- 3. Ajouter les colonnes manquantes
        EXECUTE format('
            ALTER TABLE %I.diplome
            ADD COLUMN IF NOT EXISTS signe_president BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS date_signature_president TIMESTAMP,
            ADD COLUMN IF NOT EXISTS signature_hash VARCHAR(128),
            ADD COLUMN IF NOT EXISTS mention_speciale TEXT
        ', tenant_schema);
        
        -- 4. Créer l'index
        EXECUTE format('
            CREATE INDEX IF NOT EXISTS idx_diplome_signe_president 
            ON %I.diplome(signe_president) 
            WHERE signe_president = FALSE
        ', tenant_schema);
        
        -- 5. Mettre à jour les statuts existants si nécessaire
        EXECUTE format('
            UPDATE %I.diplome 
            SET statut = ''pret_signature'' 
            WHERE statut = ''en_attente'' 
            AND fichier_url IS NOT NULL
        ', tenant_schema);
        
        RAISE NOTICE 'Schéma % traité avec succès', tenant_schema;
    END LOOP;
    
    RAISE NOTICE 'Harmonisation terminée pour tous les tenants';
END $$;
```

### Script 2 : Ajout Index Performance

```sql
-- =============================================================================
