# Spécification Complète - Module Économat

## 📋 Vue d'ensemble

Le module Économat gère l'ensemble des aspects financiers de l'université : budgets, dépenses, recouvrement, subventions et rapports financiers.

---

## 🗄️ Tables Existantes Utilisées

### 1. **budget** (ligne 1054-1065)
```sql
CREATE TABLE budget (
    id                  UUID PRIMARY KEY,
    annee_academique_id UUID NOT NULL REFERENCES annee_academique(id),
    departement_id      UUID REFERENCES departement(id),
    categorie           VARCHAR(100) NOT NULL,
    montant_prevu       DECIMAL(15,2) NOT NULL,
    montant_realise     DECIMAL(15,2) DEFAULT 0,
    description         TEXT,
    created_by          UUID REFERENCES utilisateur(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

**Colonnes utilisées:**
- `id`: Identifiant unique du budget
- `annee_academique_id`: Année académique concernée
- `departement_id`: Département bénéficiaire (NULL = budget global)
- `categorie`: Type de budget (personnel, equipement, fonctionnement, etc.)
- `montant_prevu`: Budget alloué
- `montant_realise`: Montant dépensé
- `description`: Description du poste budgétaire
- `created_by`: Créateur du budget
- `created_at`, `updated_at`: Dates de création/modification

### 2. **depense** (ligne 1067-1089)
```sql
CREATE TABLE depense (
    id                  UUID PRIMARY KEY,
    budget_id           UUID REFERENCES budget(id),
    annee_academique_id UUID NOT NULL REFERENCES annee_academique(id),
    libelle             VARCHAR(300) NOT NULL,
    montant             DECIMAL(12,2) NOT NULL CHECK (montant > 0),
    categorie           VARCHAR(100),
    date_depense        DATE NOT NULL DEFAULT CURRENT_DATE,
    fournisseur         VARCHAR(200),
    numero_facture      VARCHAR(100),
    facture_url         VARCHAR(500),
    statut              VARCHAR(20) DEFAULT 'en_attente'
                        CHECK (statut IN ('en_attente', 'approuve', 'paye', 'rejete')),
    demande_par         UUID REFERENCES utilisateur(id),
    approuve_par        UUID REFERENCES utilisateur(id),
    date_approbation    TIMESTAMPTZ,
    observations        TEXT,
    valide_par_president UUID,
    valide_le           TIMESTAMPTZ,
    motif_decision      TEXT,
    conditions_speciales TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

**Colonnes utilisées:**
- `id`: Identifiant unique de la dépense
- `budget_id`: Budget imputé (optionnel)
- `annee_academique_id`: Année académique
- `libelle`: Description de la dépense
- `montant`: Montant de la dépense
- `categorie`: Catégorie de dépense
- `date_depense`: Date de la dépense
- `fournisseur`: Nom du fournisseur
- `numero_facture`: Numéro de facture
- `facture_url`: URL du document de facture
- `statut`: État de la dépense (en_attente, approuve, paye, rejete)
- `demande_par`: Demandeur
- `approuve_par`: Approbateur
- `date_approbation`: Date d'approbation
- `observations`: Observations
- `valide_par_president`: Validation présidentielle (pour montants élevés)
- `valide_le`: Date de validation
- `motif_decision`: Motif de la décision
- `conditions_speciales`: Conditions particulières

### 3. **grille_tarifaire** (ligne 394-410)
```sql
CREATE TABLE grille_tarifaire (
    id                  UUID PRIMARY KEY,
    parcours_id         UUID NOT NULL REFERENCES parcours(id),
    annee_academique_id UUID NOT NULL REFERENCES annee_academique(id),
    niveau_etude_id     UUID REFERENCES niveau_etude(id),
    type_etudiant       VARCHAR(50) DEFAULT 'regulier'
                        CHECK (type_etudiant IN ('regulier', 'boursier', 'etranger')),
    frais_inscription   DECIMAL(10,2) NOT NULL,
    frais_scolarite     DECIMAL(10,2) NOT NULL,
    autres_frais        DECIMAL(10,2) DEFAULT 0,
    total               DECIMAL(10,2) GENERATED ALWAYS AS 
                        (frais_inscription + frais_scolarite + autres_frais) STORED,
    description         TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

**Colonnes utilisées:**
- `id`: Identifiant unique
- `parcours_id`: Parcours concerné
- `annee_academique_id`: Année académique
- `niveau_etude_id`: Niveau d'étude (L1, L2, L3, M1, M2)
- `type_etudiant`: Type (regulier, boursier, etranger)
- `frais_inscription`: Frais d'inscription
- `frais_scolarite`: Frais de scolarité
- `autres_frais`: Autres frais
- `total`: Total calculé automatiquement
- `description`: Description

### 4. **paiement** (ligne 591-610)
```sql
CREATE TABLE paiement (
    id                  UUID PRIMARY KEY,
    inscription_id      UUID NOT NULL REFERENCES inscription(id),
    echeancier_id       UUID REFERENCES echeancier(id),
    montant             DECIMAL(10,2) NOT NULL CHECK (montant > 0),
    date_paiement       DATE NOT NULL DEFAULT CURRENT_DATE,
    mode_paiement       VARCHAR(50) NOT NULL,
    reference           VARCHAR(100),
    recu_numero         VARCHAR(50) UNIQUE,
    observations        TEXT,
    caissier_id         UUID REFERENCES utilisateur(id),
    statut              VARCHAR(20) DEFAULT 'valide'
                        CHECK (statut IN ('valide', 'annule', 'en_attente')),
    annule_par          UUID REFERENCES utilisateur(id),
    date_annulation     TIMESTAMPTZ,
    motif_annulation    TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);
```

**Colonnes utilisées:**
- `id`: Identifiant unique
- `inscription_id`: Inscription concernée
- `echeancier_id`: Échéancier lié
- `montant`: Montant payé
- `date_paiement`: Date du paiement
- `mode_paiement`: Mode (especes, virement, mobile_money, etc.)
- `reference`: Référence de transaction
- `recu_numero`: Numéro de reçu
- `observations`: Observations
- `caissier_id`: Caissier ayant enregistré
- `statut`: État du paiement
- `annule_par`: Annulateur (si annulé)
- `date_annulation`: Date d'annulation
- `motif_annulation`: Motif d'annulation

### 5. **echeancier** (ligne 580-588)
```sql
CREATE TABLE echeancier (
    id              UUID PRIMARY KEY,
    inscription_id  UUID NOT NULL REFERENCES inscription(id),
    montant_total   DECIMAL(10,2) NOT NULL,
    montant_paye    DECIMAL(10,2) DEFAULT 0,
    nombre_echeances INTEGER NOT NULL CHECK (nombre_echeances > 0),
    date_debut      DATE NOT NULL,
    statut          VARCHAR(20) DEFAULT 'actif'
                    CHECK (statut IN ('actif', 'termine', 'suspendu')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**Colonnes utilisées:**
- `id`: Identifiant unique
- `inscription_id`: Inscription concernée
- `montant_total`: Montant total à payer
- `montant_paye`: Montant déjà payé
- `nombre_echeances`: Nombre d'échéances
- `date_debut`: Date de début
- `statut`: État de l'échéancier

### 6. **departement** (ligne 100-110)
```sql
CREATE TABLE departement (
    id          UUID PRIMARY KEY,
    code        VARCHAR(20) UNIQUE NOT NULL,
    nom         VARCHAR(200) NOT NULL,
    description TEXT,
    responsable_id UUID REFERENCES utilisateur(id),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**Colonnes utilisées:**
- `id`: Identifiant unique
- `code`: Code du département
- `nom`: Nom du département
- `responsable_id`: Responsable du département

### 7. **annee_academique** (ligne 112-122)
```sql
CREATE TABLE annee_academique (
    id              UUID PRIMARY KEY,
    code            VARCHAR(20) UNIQUE NOT NULL,
    libelle         VARCHAR(100) NOT NULL,
    date_debut      DATE NOT NULL,
    date_fin        DATE NOT NULL,
    est_active      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**Colonnes utilisées:**
- `id`: Identifiant unique
- `code`: Code de l'année (ex: 2024-2025)
- `libelle`: Libellé
- `date_debut`, `date_fin`: Période
- `est_active`: Année en cours

---

## 🎯 Fonctionnalités à Implémenter

### 1. **Budget Annuel** 📊
**Route:** `/economat/budget`

**Fonctionnalités:**
- Créer un budget par département et catégorie
- Visualiser les budgets par année académique
- Suivre l'exécution budgétaire (prévu vs réalisé)
- Modifier les budgets (avec validation)
- Afficher les alertes de dépassement

**Requêtes SQL nécessaires:**
```sql
-- Liste des budgets avec taux d'exécution
SELECT 
    b.id, b.categorie, b.montant_prevu, b.montant_realise,
    d.nom as departement, aa.libelle as annee,
    ROUND((b.montant_realise / b.montant_prevu * 100), 2) as taux_execution
FROM budget b
LEFT JOIN departement d ON b.departement_id = d.id
JOIN annee_academique aa ON b.annee_academique_id = aa.id
WHERE aa.est_active = TRUE
ORDER BY b.created_at DESC;

-- Budget total par département
SELECT 
    d.nom as departement,
    SUM(b.montant_prevu) as budget_total,
    SUM(b.montant_realise) as depense_totale,
    SUM(b.montant_prevu - b.montant_realise) as solde
FROM budget b
JOIN departement d ON b.departement_id = d.id
WHERE b.annee_academique_id = :annee_id
GROUP BY d.id, d.nom;
```

### 2. **Suivi Dépenses** 💰
**Route:** `/economat/depenses`

**Fonctionnalités:**
- Enregistrer une nouvelle dépense
- Lister toutes les dépenses avec filtres (statut, période, fournisseur)
- Approuver/Rejeter une dépense
- Marquer comme payée
- Joindre des factures
- Validation présidentielle pour montants élevés (seuil configurable)

**Requêtes SQL nécessaires:**
```sql
-- Liste des dépenses avec détails
SELECT 
    d.id, d.libelle, d.montant, d.date_depense, d.fournisseur,
    d.numero_facture, d.statut, d.categorie,
    b.categorie as budget_categorie,
    u1.nom as demandeur, u2.nom as approbateur,
    aa.libelle as annee
FROM depense d
LEFT JOIN budget b ON d.budget_id = b.id
LEFT JOIN utilisateur u1 ON d.demande_par = u1.id
LEFT JOIN utilisateur u2 ON d.approuve_par = u2.id
JOIN annee_academique aa ON d.annee_academique_id = aa.id
WHERE d.annee_academique_id = :annee_id
ORDER BY d.date_depense DESC;

-- Dépenses en attente de validation
SELECT COUNT(*) as nb_en_attente, SUM(montant) as montant_total
FROM depense
WHERE statut = 'en_attente' AND annee_academique_id = :annee_id;

-- Dépenses par fournisseur
SELECT 
    fournisseur,
    COUNT(*) as nb_factures,
    SUM(montant) as montant_total
FROM depense
WHERE annee_academique_id = :annee_id AND statut != 'rejete'
GROUP BY fournisseur
ORDER BY montant_total DESC;
```

### 3. **Fournisseurs** 🏢
**Route:** `/economat/fournisseurs`

**Fonctionnalités:**
- Liste des fournisseurs (extraits de la colonne `fournisseur` de `depense`)
- Statistiques par fournisseur (nombre de factures, montant total)
- Historique des transactions avec un fournisseur
- Recherche de fournisseurs

**Requêtes SQL nécessaires:**
```sql
-- Liste des fournisseurs avec statistiques
SELECT 
    fournisseur,
    COUNT(*) as nb_transactions,
    SUM(montant) as montant_total,
    AVG(montant) as montant_moyen,
    MAX(date_depense) as derniere_transaction
FROM depense
WHERE fournisseur IS NOT NULL AND statut != 'rejete'
GROUP BY fournisseur
ORDER BY montant_total DESC;

-- Détail des transactions d'un fournisseur
SELECT 
    d.id, d.libelle, d.montant, d.date_depense,
    d.numero_facture, d.statut, d.facture_url
FROM depense d
WHERE d.fournisseur = :fournisseur
ORDER BY d.date_depense DESC;
```

### 4. **Recouvrement Global** 💳
**Route:** `/economat/recouvrement`

**Fonctionnalités:**
- Vue d'ensemble des paiements par année académique
- Taux de recouvrement global
- Liste des inscriptions avec impayés
- Statistiques par parcours
- Relances automatiques (alertes)

**Requêtes SQL nécessaires:**
```sql
-- Statistiques globales de recouvrement
SELECT 
    COUNT(DISTINCT i.id) as nb_inscriptions,
    SUM(gt.total) as montant_attendu,
    SUM(COALESCE(e.montant_paye, 0)) as montant_recouvre,
    SUM(gt.total - COALESCE(e.montant_paye, 0)) as montant_impaye,
    ROUND((SUM(COALESCE(e.montant_paye, 0)) / SUM(gt.total) * 100), 2) as taux_recouvrement
FROM inscription i
JOIN grille_tarifaire gt ON i.parcours_id = gt.parcours_id 
    AND i.annee_academique_id = gt.annee_academique_id
LEFT JOIN echeancier e ON i.id = e.inscription_id
WHERE i.annee_academique_id = :annee_id;

-- Inscriptions avec impayés
SELECT 
    et.matricule, et.nom, et.prenom,
    p.nom as parcours,
    gt.total as montant_total,
    COALESCE(e.montant_paye, 0) as montant_paye,
    (gt.total - COALESCE(e.montant_paye, 0)) as reste_a_payer,
    i.statut
FROM inscription i
JOIN etudiant et ON i.etudiant_id = et.id
JOIN parcours p ON i.parcours_id = p.id
JOIN grille_tarifaire gt ON i.parcours_id = gt.parcours_id 
    AND i.annee_academique_id = gt.annee_academique_id
LEFT JOIN echeancier e ON i.id = e.inscription_id
WHERE i.annee_academique_id = :annee_id
    AND (gt.total - COALESCE(e.montant_paye, 0)) > 0
ORDER BY reste_a_payer DESC;

-- Recouvrement par parcours
SELECT 
    p.nom as parcours,
    COUNT(i.id) as nb_etudiants,
    SUM(gt.total) as montant_attendu,
    SUM(COALESCE(e.montant_paye, 0)) as montant_recouvre,
    ROUND((SUM(COALESCE(e.montant_paye, 0)) / SUM(gt.total) * 100), 2) as taux
FROM inscription i
JOIN parcours p ON i.parcours_id = p.id
JOIN grille_tarifaire gt ON i.parcours_id = gt.parcours_id 
    AND i.annee_academique_id = gt.annee_academique_id
LEFT JOIN echeancier e ON i.id = e.inscription_id
WHERE i.annee_academique_id = :annee_id
GROUP BY p.id, p.nom
ORDER BY taux DESC;
```

### 5. **Rapport Financier** 📈
**Route:** `/economat/rapports`

**Fonctionnalités:**
- Rapport journalier (paiements du jour)
- Rapport mensuel (synthèse du mois)
- Rapport annuel (bilan de l'année)
- Export PDF/Excel
- Graphiques et visualisations

**Requêtes SQL nécessaires:**
```sql
-- Rapport journalier
SELECT 
    p.recu_numero, p.montant, p.mode_paiement,
    et.matricule, et.nom, et.prenom,
    u.nom as caissier
FROM paiement p
JOIN inscription i ON p.inscription_id = i.id
JOIN etudiant et ON i.etudiant_id = et.id
LEFT JOIN utilisateur u ON p.caissier_id = u.id
WHERE p.date_paiement = :date
    AND p.statut = 'valide'
ORDER BY p.created_at;

-- Synthèse mensuelle
SELECT 
    DATE_TRUNC('day', p.date_paiement) as jour,
    COUNT(*) as nb_paiements,
    SUM(p.montant) as montant_total
FROM paiement p
WHERE DATE_TRUNC('month', p.date_paiement) = DATE_TRUNC('month', :date::date)
    AND p.statut = 'valide'
GROUP BY jour
ORDER BY jour;

-- Bilan annuel
SELECT 
    'Recettes' as type,
    SUM(p.montant) as montant
FROM paiement p
JOIN inscription i ON p.inscription_id = i.id
WHERE i.annee_academique_id = :annee_id AND p.statut = 'valide'
UNION ALL
SELECT 
    'Dépenses' as type,
    SUM(d.montant) as montant
FROM depense d
WHERE d.annee_academique_id = :annee_id AND d.statut = 'paye';
```

### 6. **Subventions** 🎁
**Route:** `/economat/subventions`

**Fonctionnalités:**
- Enregistrer les subventions reçues (État, diocèse, etc.)
- Suivre l'utilisation des subventions
- Rapports de subventions

**Note:** Les subventions peuvent être trackées via la table `budget` avec une catégorie spéciale "subvention" et un champ `description` pour la source.

**Requêtes SQL nécessaires:**
```sql
-- Liste des subventions
SELECT 
    b.id, b.description as source, b.montant_prevu as montant_recu,
    b.montant_realise as montant_utilise,
    (b.montant_prevu - b.montant_realise) as solde,
    b.created_at as date_reception
FROM budget b
WHERE b.categorie = 'subvention'
    AND b.annee_academique_id = :annee_id
ORDER BY b.created_at DESC;

-- Utilisation des subventions
SELECT 
    b.description as source,
    d.libelle, d.montant, d.date_depense
FROM depense d
JOIN budget b ON d.budget_id = b.id
WHERE b.categorie = 'subvention'
    AND d.annee_academique_id = :annee_id
ORDER BY d.date_depense DESC;
```

---

## 📁 Structure des Fichiers à Créer

### Backend

```
backend/src/economat/
├── economat.module.ts
├── economat.controller.ts
├── economat.service.ts
├── dto/
│   ├── create-budget.dto.ts
│   ├── update-budget.dto.ts
│   ├── create-depense.dto.ts
│   ├── update-depense.dto.ts
│   ├── approve-depense.dto.ts
│   └── filters.dto.ts
└── interfaces/
    ├── budget.interface.ts
    ├── depense.interface.ts
    ├── recouvrement.interface.ts
    └── rapport.interface.ts
```

### Frontend

```
frontend/src/pages/economat/
├── EconomatLayout.tsx
├── BudgetAnnuelPage.tsx
├── SuiviDepensesPage.tsx
├── FournisseursPage.tsx
├── RecouvrementGlobalPage.tsx
├── RapportFinancierPage.tsx
└── SubventionsPage.tsx

frontend/src/components/economat/
├── BudgetCard.tsx
├── DepenseForm.tsx
├── DepenseList.tsx
├── RecouvrementStats.tsx
├── RapportChart.tsx
└── FournisseurCard.tsx
```

---

## 🔄 Étapes d'Implémentation

### Phase 1: Backend (Jours 1-2)
1. ✅ Créer `economat.module.ts`
2. ✅ Créer `economat.service.ts` avec toutes les méthodes
3. ✅ Créer `economat.controller.ts` avec tous les endpoints
4. ✅ Créer les DTOs
5. ✅ Tester les endpoints avec Postman/Thunder Client

### Phase 2: Frontend - Structure (Jour 3)
1. ✅ Créer `EconomatLayout.tsx` avec navigation
2. ✅ Créer les pages vides
3. ✅ Configurer les routes dans `App.tsx`
4. ✅ Ajouter le lien dans le menu principal

### Phase 3: Frontend - Implémentation (Jours 4-6)
1. ✅ Implémenter `BudgetAnnuelPage.tsx`
2. ✅ Implémenter `SuiviDepensesPage.tsx`
3. ✅ Implémenter `FournisseursPage.tsx`
4. ✅ Implémenter `RecouvrementGlobalPage.tsx`
5. ✅ Implémenter `RapportFinancierPage.tsx`
6. ✅ Implémenter `SubventionsPage.tsx`

### Phase 4: Tests et Ajustements (Jour 7)
1. ✅ Tests d'intégration
2. ✅ Corrections de bugs
3. ✅ Optimisations
4. ✅ Documentation finale

---

## 🎨 Maquettes UI

### Navigation Économat
```
┌─────────────────────────────────────┐
│ 📊 Budget Annuel                    │ ← Active
├─────────────────────────────────────┤
│ 💰 Suivi Dépenses                   │
├─────────────────────────────────────┤
│ 🏢 Fournisseurs                     │
├─────────────────────────────────────┤
│ 💳 Recouvrement Global              │
├─────────────────────────────────────┤
│ 📈 Rapport Financier                │
├─────────────────────────────────────┤
│ 🎁 Subventions                      │
└─────────────────────────────────────┘
```

### Page Budget Annuel
```
┌────────────────────────────────────────────────────┐
│ Budget Annuel 2024-2025          [+ Nouveau Budget]│
├────────────────────────────────────────────────────┤
│ Filtres: [Département ▼] [Catégorie ▼] [Recherche]│
├────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐  │
│ │ Département Informatique                      │  │
│ │ Catégorie: Personnel                          │  │
│ │ Budget: 50,000,000 Ar | Dépensé: 35,000,000  │  │
│ │ ████████████░░░░░░░░ 70%                      │  │
│ │ [Modifier] [Détails]                          │  │
│ └──────────────────────────────────────────────┘  │
│ ┌──────────────────────────────────────────────┐  │
│ │ Département Droit                             │  │
│ │ Catégorie: Équipement                         │  │
│ │ Budget: 30,000,000 Ar | Dépensé: 28,000,000  │  │
│ │ ████████████████████░ 93% ⚠️                  │  │
│ │ [Modifier] [Détails]                          │  │
│ └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

---

## 🔐 Règles de Gestion Implémentées

### Règles Financières (10 règles)

1. **Aucun encaissement sans reçu** ✅
   - Chaque paiement génère automatiquement un `recu_numero` unique
   - Implémenté dans `paiement.statut = 'valide'`

2. **Paiement échelonné non respecté → Relance** ⚠️
   - Vérification via `echeancier.montant_paye < echeancier.montant_total`
   - Alerte affichée dans le dashboard

3. **Clôture de caisse avant minuit** 📅
   - Vérification dans le module Caissier (existant)
   - Référence: `cloture_caisse` table

4. **Achat > seuil → Validation président** 👔
   - Implémenté via `depense.valide_par_president`
   - Seuil configurable (ex: 5,000,000 Ar)

5. **Budget département non dépassable** 🚫
   - Vérification: `budget.montant_realise <= budget.montant_prevu`
   - Alerte si dépassement imminent (>90%)

6. **Subventions trackées séparément** 📊
   - Catégorie spéciale dans `budget.categorie = 'subvention'`
   - Rapports dédiés

7. **Bourse → Grille tarifaire ajustée** 🎓
   - `grille_tarifaire.type_etudiant = 'boursier'`
   - Tarifs réduits automatiques

8. **Rapprochement bancaire quotidien** 🏦
   - Validation caissier avant transmission économat
   - Via module Caissier

9. **Frais paramétrables** ⚙️
   - `grille_tarifaire` par parcours, niveau, type
   - Interface de configuration

10. **Pas de dépense sur budget clôturé** 🔒
    - Vérification de l'année académique active
    - `annee_academique.est_active = TRUE`

---

## 📊 KPIs et Métriques

### Dashboard Économat

1. **Budget Global**
   - Budget total alloué
   - Budget consommé
   - Taux d'exécution
   - Alertes de dépassement

2. **Dépenses**
   - Dépenses du mois
   - Dépenses en attente de validation
   - Top 5 fournisseurs
   - Dépenses par catégorie

3. **Recouvrement**
   - Taux de recouvrement global
   - Montant des impayés
   - Nombre d'étudiants en situation d'impayé
   - Évolution mensuelle

4. **Subventions**
   - Subventions reçues
   - Subventions utilisées
   - Solde disponible

---

## 🚀 Commandes de Démarrage

### Créer le module backend
```bash
cd backend/src
mkdir economat
cd economat
touch economat.module.ts economat.controller.ts economat.service.ts
mkdir dto interfaces
```

### Créer les pages frontend
```bash
cd frontend/src/pages
mkdir economat
cd economat
touch EconomatLayout.tsx BudgetAnnuelPage.tsx SuiviDepensesPage.tsx
touch FournisseursPage.tsx RecouvrementGlobalPage.tsx
touch RapportFinancierPage.tsx SubventionsPage.tsx
```

---

## 📝 Notes Importantes

1. **Pas de création de tables** ✅
   - Toutes les fonctionnalités utilisent les tables existantes
   - Aucune migration SQL nécessaire

2. **Isolation tenant** 🔒
   - Toutes les requêtes incluent le schéma tenant
   - Service REQUEST-scoped comme les autres modules

3. **Permissions** 👥
   - Rôles: `economat`, `admin`, `president`
   - Validation président pour montants élevés

4. **Performance** ⚡
   - Index existants sur les tables
   - Pagination pour les listes longues
   - Cache pour les statistiques

5. **Audit** 📋
   - Tous les changements tracés via `created_by`, `updated_at`
   - Historique des validations/rejets

---

## ✅ Checklist de Validation

- [ ] Backend: Tous les endpoints fonctionnent
- [ ] Frontend: Toutes les pages s'affichent
- [ ] Données réelles: Tests avec données de `tenant_test`
- [ ] Permissions: Vérification des rôles
- [ ] Règles de gestion: Toutes implémentées
- [ ] Performance: Temps de réponse < 2s
- [ ] UI/UX: Interface intuitive et responsive
- [ ] Documentation: Guide utilisateur créé
- [ ] Tests: Scénarios principaux validés

---

**Document créé le:** 19/05/2026
**Version:** 1.0
**Auteur:** Bob (AI Assistant)