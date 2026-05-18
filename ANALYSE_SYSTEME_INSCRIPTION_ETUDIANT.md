# 📋 Analyse du Système d'Inscription Étudiant

## 🎯 Vue d'ensemble

Basé sur l'analyse de **BD.sql**, le système d'inscription des étudiants utilise **deux tables principales** :
1. **`inscription`** - Gestion des inscriptions académiques
2. **`paiement_inscription`** - Gestion des paiements d'inscription

## 📊 Structure de la Base de Données

### 1. Table `inscription`

```sql
CREATE TABLE tenant_ispm.inscription (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    etudiant_id uuid NOT NULL,
    parcours_id uuid NOT NULL,
    annee_academique_id uuid NOT NULL,
    annee_niveau smallint NOT NULL,
    type_inscription character varying(20) DEFAULT 'premiere'::character varying NOT NULL,
    statut character varying(20) DEFAULT 'en_attente'::character varying NOT NULL,
    numero_carte character varying(30),
    date_inscription date DEFAULT CURRENT_DATE,
    bourse boolean DEFAULT false,
    type_bourse character varying(100),
    montant_bourse numeric(10,2),
    observations text,
    validee_par uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Contraintes
    CONSTRAINT inscription_statut_check CHECK (
        statut IN ('en_attente', 'validee', 'annulee', 'abandonnee')
    ),
    CONSTRAINT inscription_type_inscription_check CHECK (
        type_inscription IN ('premiere', 'reinscription', 'transfert', 'equivalence')
    )
);
```

#### Champs Clés

| Champ | Type | Description | Valeurs Possibles |
|-------|------|-------------|-------------------|
| `id` | UUID | Identifiant unique | Auto-généré |
| `etudiant_id` | UUID | Référence à l'étudiant | FK → etudiant(id) |
| `parcours_id` | UUID | Référence au parcours | FK → parcours(id) |
| `annee_academique_id` | UUID | Année académique | FK → annee_academique(id) |
| `annee_niveau` | SMALLINT | Niveau d'étude (1, 2, 3...) | 1-7 |
| `type_inscription` | VARCHAR(20) | Type d'inscription | 'premiere', 'reinscription', 'transfert', 'equivalence' |
| `statut` | VARCHAR(20) | Statut de l'inscription | 'en_attente', 'validee', 'annulee', 'abandonnee' |
| `numero_carte` | VARCHAR(30) | Numéro de carte étudiant | Optionnel |
| `date_inscription` | DATE | Date d'inscription | Par défaut: aujourd'hui |
| `bourse` | BOOLEAN | Étudiant boursier ? | true/false |
| `type_bourse` | VARCHAR(100) | Type de bourse | Optionnel |
| `montant_bourse` | NUMERIC(10,2) | Montant de la bourse | Optionnel |
| `observations` | TEXT | Notes/observations | Optionnel |
| `validee_par` | UUID | Qui a validé | FK → utilisateur(id) |

### 2. Table `paiement_inscription`

```sql
CREATE TABLE tenant_ispm.paiement_inscription (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    inscription_id uuid NOT NULL,
    etudiant_id uuid NOT NULL,
    montant numeric(10,2) NOT NULL,
    methode_paiement character varying(50) NOT NULL,
    reference_paiement character varying(255) NOT NULL,
    date_paiement timestamp without time zone NOT NULL,
    preuve_url text,
    statut character varying(50) DEFAULT 'en_attente'::character varying,
    valide_par uuid,
    date_validation timestamp without time zone,
    note_validation text,
    motif_rejet text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    
    -- Contraintes
    CONSTRAINT paiement_inscription_methode_paiement_check CHECK (
        methode_paiement IN ('virement', 'mobile_money', 'especes', 'cheque', 'carte_bancaire')
    ),
    CONSTRAINT paiement_inscription_montant_check CHECK (montant > 0),
    CONSTRAINT paiement_inscription_statut_check CHECK (
        statut IN ('en_attente', 'valide', 'rejete')
    ),
    CONSTRAINT check_validation CHECK (
        (statut = 'valide' AND valide_par IS NOT NULL AND date_validation IS NOT NULL) OR
        (statut = 'rejete' AND valide_par IS NOT NULL AND date_validation IS NOT NULL AND motif_rejet IS NOT NULL) OR
        (statut = 'en_attente' AND valide_par IS NULL AND date_validation IS NULL)
    )
);
```

#### Champs Clés

| Champ | Type | Description | Valeurs Possibles |
|-------|------|-------------|-------------------|
| `id` | UUID | Identifiant unique | Auto-généré |
| `inscription_id` | UUID | Référence à l'inscription | FK → inscription(id) |
| `etudiant_id` | UUID | Référence à l'étudiant | FK → etudiant(id) |
| `montant` | NUMERIC(10,2) | Montant payé | > 0 |
| `methode_paiement` | VARCHAR(50) | Méthode de paiement | 'virement', 'mobile_money', 'especes', 'cheque', 'carte_bancaire' |
| `reference_paiement` | VARCHAR(255) | Référence unique | Unique |
| `date_paiement` | TIMESTAMP | Date du paiement | Obligatoire |
| `preuve_url` | TEXT | URL de la preuve | Optionnel (pour paiement en ligne) |
| `statut` | VARCHAR(50) | Statut du paiement | 'en_attente', 'valide', 'rejete' |
| `valide_par` | UUID | Qui a validé | FK → utilisateur(id) |
| `date_validation` | TIMESTAMP | Date de validation | Optionnel |
| `note_validation` | TEXT | Note de validation | Optionnel |
| `motif_rejet` | TEXT | Motif de rejet | Obligatoire si rejeté |

## 🔄 Flux d'Inscription

### Scénario 1 : Inscription Locale (Au Secrétariat)

```
┌─────────────────────────────────────────────────────────────┐
│                    INSCRIPTION LOCALE                        │
└─────────────────────────────────────────────────────────────┘

1. ÉTUDIANT SE PRÉSENTE AU SECRÉTARIAT
   ↓
2. SECRÉTAIRE CRÉE L'INSCRIPTION
   INSERT INTO inscription (
     etudiant_id,
     parcours_id,
     annee_academique_id,
     annee_niveau,
     type_inscription,
     statut
   ) VALUES (
     'uuid_etudiant',
     'uuid_parcours',
     'uuid_annee_academique',
     1,
     'premiere',
     'en_attente'  ← Statut initial
   );
   ↓
3. ÉTUDIANT PAIE À LA CAISSE
   ↓
4. CAISSIER ENREGISTRE LE PAIEMENT
   INSERT INTO paiement_inscription (
     inscription_id,
     etudiant_id,
     montant,
     methode_paiement,
     reference_paiement,
     date_paiement,
     statut
   ) VALUES (
     'uuid_inscription',
     'uuid_etudiant',
     500000.00,
     'especes',  ← Paiement en espèces
     'REF-2026-001',
     NOW(),
     'valide'  ← Validé immédiatement
   );
   ↓
5. SECRÉTAIRE VALIDE L'INSCRIPTION
   UPDATE inscription
   SET statut = 'validee',
       validee_par = 'uuid_secretaire',
       numero_carte = 'CARD-2026-001'
   WHERE id = 'uuid_inscription';
   ↓
6. ✅ INSCRIPTION COMPLÈTE
   - Statut inscription: 'validee'
   - Statut paiement: 'valide'
   - Carte étudiant générée
```

### Scénario 2 : Inscription En Ligne (Portail Étudiant)

```
┌─────────────────────────────────────────────────────────────┐
│                    INSCRIPTION EN LIGNE                      │
└─────────────────────────────────────────────────────────────┘

1. ÉTUDIANT SE CONNECTE AU PORTAIL
   http://universite.com/portail/etudiant/inscription
   ↓
2. ÉTUDIANT REMPLIT LE FORMULAIRE
   - Sélectionne le parcours
   - Sélectionne l'année académique
   - Sélectionne le niveau
   ↓
3. SYSTÈME CRÉE L'INSCRIPTION
   INSERT INTO inscription (
     etudiant_id,
     parcours_id,
     annee_academique_id,
     annee_niveau,
     type_inscription,
     statut
   ) VALUES (
     'uuid_etudiant',
     'uuid_parcours',
     'uuid_annee_academique',
     1,
     'premiere',
     'en_attente'  ← En attente de paiement
   );
   ↓
4. ÉTUDIANT EFFECTUE LE PAIEMENT EN LIGNE
   - Mobile Money (Airtel, Orange, Mvola)
   - Virement bancaire
   - Carte bancaire
   ↓
5. ÉTUDIANT TÉLÉCHARGE LA PREUVE DE PAIEMENT
   ↓
6. SYSTÈME ENREGISTRE LE PAIEMENT
   INSERT INTO paiement_inscription (
     inscription_id,
     etudiant_id,
     montant,
     methode_paiement,
     reference_paiement,
     date_paiement,
     preuve_url,
     statut
   ) VALUES (
     'uuid_inscription',
     'uuid_etudiant',
     500000.00,
     'mobile_money',  ← Paiement en ligne
     'MM-2026-12345',
     NOW(),
     '/uploads/preuves/preuve_123.pdf',  ← Preuve uploadée
     'en_attente'  ← En attente de validation
   );
   ↓
7. CAISSIER/ADMIN VÉRIFIE LE PAIEMENT
   - Consulte la preuve
   - Vérifie la transaction
   ↓
8a. SI PAIEMENT VALIDE
    UPDATE paiement_inscription
    SET statut = 'valide',
        valide_par = 'uuid_caissier',
        date_validation = NOW(),
        note_validation = 'Paiement vérifié et validé'
    WHERE id = 'uuid_paiement';
    ↓
    UPDATE inscription
    SET statut = 'validee',
        validee_par = 'uuid_caissier'
    WHERE id = 'uuid_inscription';
    ↓
    ✅ INSCRIPTION VALIDÉE
    
8b. SI PAIEMENT INVALIDE
    UPDATE paiement_inscription
    SET statut = 'rejete',
        valide_par = 'uuid_caissier',
        date_validation = NOW(),
        motif_rejet = 'Preuve de paiement illisible'
    WHERE id = 'uuid_paiement';
    ↓
    ❌ PAIEMENT REJETÉ
    → Étudiant doit soumettre une nouvelle preuve
```

## 📝 Règles de Gestion

### Règle 1 : Statuts d'Inscription

| Statut | Description | Peut passer à |
|--------|-------------|---------------|
| `en_attente` | Inscription créée, en attente de validation | `validee`, `annulee` |
| `validee` | Inscription validée, paiement confirmé | `abandonnee` |
| `annulee` | Inscription annulée par l'administration | - |
| `abandonnee` | Étudiant a abandonné | - |

### Règle 2 : Statuts de Paiement

| Statut | Description | Conditions |
|--------|-------------|------------|
| `en_attente` | Paiement soumis, en attente de validation | `valide_par` = NULL, `date_validation` = NULL |
| `valide` | Paiement validé par un caissier/admin | `valide_par` ≠ NULL, `date_validation` ≠ NULL |
| `rejete` | Paiement rejeté | `valide_par` ≠ NULL, `date_validation` ≠ NULL, `motif_rejet` ≠ NULL |

### Règle 3 : Types d'Inscription

| Type | Description | Cas d'usage |
|------|-------------|-------------|
| `premiere` | Première inscription | Nouvel étudiant |
| `reinscription` | Réinscription | Étudiant qui passe au niveau supérieur |
| `transfert` | Transfert d'une autre université | Étudiant transféré |
| `equivalence` | Inscription avec équivalence | Étudiant avec diplôme équivalent |

### Règle 4 : Méthodes de Paiement

| Méthode | Description | Validation |
|---------|-------------|------------|
| `especes` | Paiement en espèces à la caisse | Immédiate |
| `mobile_money` | Airtel Money, Orange Money, Mvola | Manuelle (preuve requise) |
| `virement` | Virement bancaire | Manuelle (preuve requise) |
| `cheque` | Paiement par chèque | Manuelle (après encaissement) |
| `carte_bancaire` | Paiement par carte | Automatique (si gateway) |

## 🔍 Requêtes SQL Utiles

### Vérifier l'inscription d'un étudiant

```sql
SELECT 
  i.id,
  i.statut as statut_inscription,
  i.type_inscription,
  i.annee_niveau,
  p.nom as parcours,
  aa.libelle as annee_academique,
  pi.statut as statut_paiement,
  pi.montant,
  pi.methode_paiement,
  pi.date_paiement
FROM inscription i
JOIN parcours p ON p.id = i.parcours_id
JOIN annee_academique aa ON aa.id = i.annee_academique_id
LEFT JOIN paiement_inscription pi ON pi.inscription_id = i.id
WHERE i.etudiant_id = 'UUID_ETUDIANT'
  AND aa.active = true
ORDER BY i.created_at DESC;
```

### Lister les paiements en attente de validation

```sql
SELECT 
  pi.id,
  pi.reference_paiement,
  pi.montant,
  pi.methode_paiement,
  pi.date_paiement,
  pi.preuve_url,
  e.nom,
  e.prenom,
  e.matricule,
  p.nom as parcours
FROM paiement_inscription pi
JOIN etudiant e ON e.id = pi.etudiant_id
JOIN inscription i ON i.id = pi.inscription_id
JOIN parcours p ON p.id = i.parcours_id
WHERE pi.statut = 'en_attente'
ORDER BY pi.date_paiement ASC;
```

### Valider un paiement

```sql
-- 1. Valider le paiement
UPDATE paiement_inscription
SET 
  statut = 'valide',
  valide_par = 'UUID_CAISSIER',
  date_validation = NOW(),
  note_validation = 'Paiement vérifié et validé'
WHERE id = 'UUID_PAIEMENT';

-- 2. Valider l'inscription
UPDATE inscription
SET 
  statut = 'validee',
  validee_par = 'UUID_CAISSIER',
  numero_carte = 'CARD-2026-' || LPAD(nextval('seq_carte')::text, 6, '0')
WHERE id = (
  SELECT inscription_id 
  FROM paiement_inscription 
  WHERE id = 'UUID_PAIEMENT'
);
```

### Rejeter un paiement

```sql
UPDATE paiement_inscription
SET 
  statut = 'rejete',
  valide_par = 'UUID_CAISSIER',
  date_validation = NOW(),
  motif_rejet = 'Preuve de paiement illisible ou invalide'
WHERE id = 'UUID_PAIEMENT';
```

## 🎯 Intégration avec le Portail Parent

### Comment le parent voit l'inscription de son enfant

```sql
-- Via le portail parent
SELECT 
  i.id,
  i.statut as statut_inscription,
  i.type_inscription,
  i.annee_niveau,
  i.date_inscription,
  i.numero_carte,
  p.nom as parcours,
  aa.libelle as annee_academique,
  pi.statut as statut_paiement,
  pi.montant,
  pi.methode_paiement,
  pi.date_paiement,
  pi.preuve_url
FROM inscription i
JOIN etudiant e ON e.id = i.etudiant_id
JOIN parcours p ON p.id = i.parcours_id
JOIN annee_academique aa ON aa.id = i.annee_academique_id
LEFT JOIN paiement_inscription pi ON pi.inscription_id = i.id
WHERE e.email_parent = 'parent@email.com'  -- ✅ Liaison par email
  AND aa.active = true
ORDER BY i.created_at DESC;
```

### Fonctionnalités pour le parent

1. **Consulter le statut d'inscription**
   - Statut : en_attente, validee, annulee
   - Date d'inscription
   - Parcours et niveau

2. **Consulter le statut de paiement**
   - Statut : en_attente, valide, rejete
   - Montant payé
   - Méthode de paiement
   - Date de paiement

3. **Soumettre une preuve de paiement** (si paiement en ligne)
   - Upload de fichier (PDF, image)
   - Référence de paiement
   - Montant

4. **Recevoir des notifications**
   - Inscription validée
   - Paiement validé
   - Paiement rejeté (avec motif)

## 📊 Diagramme de Flux

```
┌─────────────┐
│  ÉTUDIANT   │
└──────┬──────┘
       │
       ├─────────────────────────────────────────┐
       │                                         │
       ▼                                         ▼
┌──────────────────┐                  ┌──────────────────┐
│  INSCRIPTION     │                  │  INSCRIPTION     │
│    LOCALE        │                  │   EN LIGNE       │
└────────┬─────────┘                  └────────┬─────────┘
         │                                     │
         ▼                                     ▼
┌──────────────────┐                  ┌──────────────────┐
│  Paiement à la   │                  │  Paiement en     │
│     Caisse       │                  │     ligne        │
│  (espèces)       │                  │  (mobile_money)  │
└────────┬─────────┘                  └────────┬─────────┘
         │                                     │
         │                                     ▼
         │                            ┌──────────────────┐
         │                            │  Upload preuve   │
         │                            │   de paiement    │
         │                            └────────┬─────────┘
         │                                     │
         ▼                                     ▼
┌──────────────────────────────────────────────────────┐
│              VALIDATION PAR CAISSIER                 │
│  - Vérifie le paiement                               │
│  - Valide ou rejette                                 │
└────────┬─────────────────────────────────────────────┘
         │
         ├──────────────────┬──────────────────┐
         │                  │                  │
         ▼                  ▼                  ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│   VALIDÉ       │  │    REJETÉ      │  │  EN ATTENTE    │
│                │  │                │  │                │
│ statut=valide  │  │ statut=rejete  │  │ statut=        │
│                │  │ + motif_rejet  │  │ en_attente     │
└────────┬───────┘  └────────────────┘  └────────────────┘
         │
         ▼
┌──────────────────┐
│  INSCRIPTION     │
│    VALIDÉE       │
│                  │
│ statut=validee   │
│ + numero_carte   │
└──────────────────┘
```

## ✅ Résumé

### Inscription Locale
- ✅ Créée par le secrétariat
- ✅ Paiement en espèces à la caisse
- ✅ Validation immédiate
- ✅ Carte étudiant générée

### Inscription En Ligne
- ✅ Créée par l'étudiant via le portail
- ✅ Paiement en ligne (mobile money, virement, etc.)
- ✅ Upload de preuve de paiement
- ✅ Validation manuelle par le caissier
- ✅ Notification à l'étudiant et au parent

### Tables Utilisées
- ✅ `inscription` - Gestion des inscriptions
- ✅ `paiement_inscription` - Gestion des paiements
- ✅ Pas de modification de structure nécessaire
- ✅ Système déjà en place et fonctionnel

---

**Date d'analyse :** 18 Mai 2026  
**Basé sur :** BD.sql  
**Statut :** ✅ Système complet et opérationnel