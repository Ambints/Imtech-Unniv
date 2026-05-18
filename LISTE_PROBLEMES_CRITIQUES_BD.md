# 🔴 LISTE DÉTAILLÉE DES PROBLÈMES CRITIQUES DE LA BASE DE DONNÉES

**Date** : 18 Mai 2026  
**Base** : Imtech_SaaS (PostgreSQL 17)  
**Analyste** : IBM Bob

---

## 1️⃣ INCOHÉRENCES CONTRAINTES STATUT DIPLÔME

### 🔍 Problème
La table `diplome` a **3 définitions différentes** de la contrainte `statut` selon les fichiers.

### 📍 Localisations

#### Définition 1 : `backend/src/scolarite/migrations/001_add_scolarite_tables.sql`
```sql
-- Ligne 97-98
CHECK (statut IN ('en_attente', 'delivre', 'retire', 'annule', 'remplace'))
```
**Statuts** : 5 valeurs (manque `pret_signature` et `signe`)

#### Définition 2 : `backend/src/president/migrations/002_add_diplome_statut_and_indexes.sql`
```sql
-- Lignes 22-30
CHECK (statut IN (
    'en_attente',           -- Diplôme en attente de génération
    'pret_signature',       -- Diplôme généré, prêt pour signature président
    'signe',                -- Diplôme signé par le président
    'delivre',              -- Diplôme délivré à l'étudiant
    'retire',               -- Diplôme retiré par l'étudiant
    'annule',               -- Diplôme annulé
    'remplace'              -- Diplôme remplacé par un nouveau
))
```
**Statuts** : 7 valeurs (version complète)

#### Définition 3 : `BD.sql` (backup réel)
```sql
-- Lignes 2048-2065 (tenant_universite_d_antsiranana)
-- Lignes 1200-1220 (tenant_ispm)
CHECK (type_diplome IN ('Licence', 'Master', 'Doctorat', 'BTS', 'DUT', 'Certificat'))
-- Mais PAS de contrainte sur la colonne 'statut' !
```
**Statuts** : Aucune contrainte visible dans le backup

### ⚠️ Impact
- Nouveaux tenants créés avec `tenant-schema.sql` → 5 statuts
- Tenants migrés avec script président → 7 statuts
- Tenants existants (backup) → Pas de contrainte
- **Risque** : Rejet de données valides, incohérence applicative

### ✅ Solution Recommandée
```sql
-- À appliquer sur TOUS les schémas tenant
ALTER TABLE {schema}.diplome 
DROP CONSTRAINT IF EXISTS diplome_statut_check;

ALTER TABLE {schema}.diplome 
ADD CONSTRAINT diplome_statut_check 
CHECK (statut IN (
    'en_attente', 'pret_signature', 'signe', 
    'delivre', 'retire', 'annule', 'remplace'
));
```

---

## 2️⃣ COLONNES MANQUANTES ENTRE MIGRATIONS ET SCHÉMA DE BASE

### 🔍 Problème
Les migrations ajoutent des colonnes qui ne sont **pas présentes** dans `tenant-schema.sql`, créant des incohérences entre anciens et nouveaux tenants.

### 📍 Liste Complète des Colonnes Manquantes

#### A. Table `diplome`

**Fichier source** : `backend/src/president/migrations/001_add_president_tables.sql` (lignes 186-203)

| Colonne | Type | Défaut | Présent dans tenant-schema.sql |
|---------|------|--------|-------------------------------|
| `signe_president` | BOOLEAN | FALSE | ❌ NON |
| `date_signature_president` | TIMESTAMP | NULL | ❌ NON |
| `signature_hash` | VARCHAR(128) | NULL | ❌ NON |
| `mention_speciale` | TEXT | NULL | ❌ NON |

**Impact** : Module président ne peut pas fonctionner sur nouveaux tenants

#### B. Table `contrat_personnel`

**Fichier source** : `backend/src/president/migrations/001_add_president_tables.sql` (lignes 133-165)

| Colonne | Type | Défaut | Présent dans tenant-schema.sql |
|---------|------|--------|-------------------------------|
| `statut_validation` | VARCHAR(30) | 'en_attente' | ❌ NON |
| `valide_par` | UUID | NULL | ❌ NON |
| `valide_le` | TIMESTAMP | NULL | ❌ NON |
| `commentaire_president` | TEXT | NULL | ❌ NON |
| `conditions_speciales` | TEXT | NULL | ❌ NON |

**Impact** : Validation présidentielle des recrutements impossible

#### C. Table `depense`

**Fichier source** : `backend/src/president/migrations/001_add_president_tables.sql` (lignes 169-181)

| Colonne | Type | Défaut | Présent dans tenant-schema.sql |
|---------|------|--------|-------------------------------|
| `necessite_validation_president` | BOOLEAN (GENERATED) | AS (montant >= 1000000) | ❌ NON |
| `commentaire_validation` | TEXT | NULL | ❌ NON |

**Impact** : Validation présidentielle des investissements impossible

#### D. Table `calendrier_academique`

**Fichier source** : `backend/src/president/migrations/001_add_president_tables.sql` (lignes 207-236)

| Colonne | Type | Défaut | Présent dans tenant-schema.sql |
|---------|------|--------|-------------------------------|
| `statut` | VARCHAR(30) | 'en_attente_validation' | ❌ NON |
| `valide_par` | UUID | NULL | ❌ NON |
| `date_validation` | TIMESTAMP | NULL | ❌ NON |
| `commentaire_validation` | TEXT | NULL | ❌ NON |

**Impact** : Workflow de validation du calendrier manquant

#### E. Table `parcours`

**Fichier source** : `backend/src/president/migrations/001_add_president_tables.sql` (lignes 238-255)

| Colonne | Type | Défaut | Présent dans tenant-schema.sql |
|---------|------|--------|-------------------------------|
| `date_ouverture` | DATE | NULL | ❌ NON |
| `date_fermeture` | DATE | NULL | ❌ NON |
| `motif_fermeture` | TEXT | NULL | ❌ NON |
| `ferme_par` | UUID | NULL | ❌ NON |

**Impact** : Gestion ouverture/fermeture parcours par président impossible

### 📍 Tables Complètement Absentes

#### F. Table `convention`

**Fichier source** : `backend/src/president/migrations/001_add_president_tables.sql` (lignes 16-53)

**Statut** : ❌ Absente de `tenant-schema.sql`

**Colonnes** : 21 colonnes (id, intitule, partenaire, type_partenaire, objet_convention, date_signature, date_debut_effet, date_fin_effet, montant_engagement, document_url, statut, signe_president, signature_hash, representant_partenaire, remarques, cree_par, signe_par, date_signature_president, created_at, updated_at)

#### G. Table `delegation_signature`

**Fichier source** : `backend/src/president/migrations/001_add_president_tables.sql` (lignes 58-87)

**Statut** : ❌ Absente de `tenant-schema.sql`

**Colonnes** : 12 colonnes (id, delegant_id, delegataire_id, types_actes, date_debut, date_fin, conditions, statut, date_revocation, revoque_par, motif_revocation, created_at, updated_at)

#### H. Table `conseil_discipline`

**Fichier source** : `backend/src/president/migrations/001_add_president_tables.sql` (lignes 93-129)

**Statut** : ❌ Absente de `tenant-schema.sql`

**Colonnes** : 19 colonnes (id, etudiant_id, date_conseil, motif_convocation, incidents_lies, membres_presents, deliberation, decision, justification_decision, droit_appel, delai_appel_jours, statut, proces_verbal_url, parent_present, decision_president, motivation_president, duree_suspension_jours, statue_par, statue_le, created_at, updated_at)

#### I. Table `absence_enseignant`

**Fichier source** : `BD.sql` (lignes 484-502 pour tenant_ispm)

**Statut** : ❌ Absente de `tenant-schema.sql`

**Colonnes** : 15 colonnes (id, enseignant_id, seance_id, date_absence, heure_debut, heure_fin, motif, justification, justificatif_url, est_justifiee, statut, declaree_par, validee_par, date_validation, created_at, updated_at)

#### J. Table `rattrapage`

**Fichier source** : `backend/src/tenants/tenant-schema.sql` (lignes 495-510)

**Statut** : ✅ Présente dans tenant-schema.sql mais ❌ absente de BD.sql (backup)

**Incohérence** : Définie dans le schéma de création mais pas dans la base réelle

#### K. Table `message_enseignant`

**Fichier source** : `backend/src/tenants/tenant-schema.sql` (lignes 1976-2003)

**Statut** : ✅ Présente dans tenant-schema.sql

**Vérification BD.sql** : ✅ Présente (lignes 1024-1039)

#### L. Table `message_destinataire`

**Fichier source** : `backend/src/tenants/tenant-schema.sql` (lignes 2006-2016)

**Statut** : ✅ Présente dans tenant-schema.sql

**Vérification BD.sql** : ✅ Présente (lignes 1016-1022)

### ✅ Solution Recommandée

**Mettre à jour `tenant-schema.sql`** avec toutes les colonnes et tables manquantes pour garantir la cohérence.

---

## 3️⃣ CLÉS ÉTRANGÈRES ABSENTES SUR RELATIONS CRITIQUES

### 🔍 Problème
Certaines colonnes référencent d'autres tables mais **n'ont pas de contrainte FK**, risquant des orphelins.

### 📍 Liste des FK Manquantes

#### A. Table `convention`

**Fichier** : `backend/src/president/migrations/001_add_president_tables.sql`

| Colonne | Référence | Statut FK | Ligne |
|---------|-----------|-----------|-------|
| `cree_par` | `utilisateur(id)` | ❌ MANQUANTE | 32 |
| `signe_par` | `utilisateur(id)` | ❌ MANQUANTE | 33 |

**Code actuel** :
```sql
cree_par UUID NOT NULL,
signe_par UUID,
```

**Code recommandé** :
```sql
cree_par UUID NOT NULL REFERENCES utilisateur(id) ON DELETE RESTRICT,
signe_par UUID REFERENCES utilisateur(id) ON DELETE SET NULL,
```

#### B. Table `message_enseignant`

**Fichier** : `backend/src/tenants/tenant-schema.sql` (lignes 1976-2003)

| Colonne | Référence | Statut FK | Ligne |
|---------|-----------|-----------|-------|
| `enseignant_id` | `utilisateur(id)` | ✅ PRÉSENTE | 1999 |
| `etudiant_id` | `etudiant(id)` | ✅ PRÉSENTE | 2000 |
| `classe_id` | `classe(id)` | ❌ MANQUANTE | 1987 |
| `parcours_id` | `parcours(id)` | ✅ PRÉSENTE | 2001 |
| `niveau_id` | `niveau_etude(id)` | ✅ PRÉSENTE | 2002 |

**Problème** : La colonne `classe_id` référence une table `classe` qui **n'existe pas** dans le schéma !

**Solutions possibles** :
1. Créer la table `classe`
2. Supprimer la colonne `classe_id`
3. Remplacer par `parcours_id` + `annee_niveau`

#### C. Table `audit_log` (schéma public)

**Fichier** : `backend/src/president/migrations/001_add_president_tables.sql` (lignes 261-278)

| Colonne | Référence | Statut FK | Ligne |
|---------|-----------|-----------|-------|
| `utilisateur_id` | `utilisateur(id)` | ❌ VOLONTAIREMENT ABSENTE | 264 |

**Note** : C'est **correct** pour un journal d'audit (éviter les cascades)

#### D. Table `paiement`

**Fichier** : `BD.sql` et `tenant-schema.sql`

| Colonne | Référence | Statut FK | Vérification |
|---------|-----------|-----------|--------------|
| `inscription_id` | `inscription(id)` | ✅ PRÉSENTE | OK |
| `echeancier_id` | `echeancier(id)` | ✅ PRÉSENTE | OK |
| `caissier_id` | `utilisateur(id)` | ✅ PRÉSENTE | OK |

**Statut** : ✅ Toutes les FK sont présentes

#### E. Table `support_cours`

**Fichier** : `backend/src/tenants/tenant-schema.sql` (lignes 1806-1822)

| Colonne | Référence | Statut FK | Ligne |
|---------|-----------|-----------|-------|
| `ec_id` | `element_constitutif(id)` | ✅ PRÉSENTE | 1813 |
| `auteur_id` | `utilisateur(id)` | ✅ PRÉSENTE | 1814 |

**Statut** : ✅ Toutes les FK sont présentes

### ✅ Solution Recommandée

```sql
-- 1. Ajouter FK manquantes sur convention
ALTER TABLE {schema}.convention
ADD CONSTRAINT fk_convention_cree_par 
FOREIGN KEY (cree_par) REFERENCES {schema}.utilisateur(id) ON DELETE RESTRICT;

ALTER TABLE {schema}.convention
ADD CONSTRAINT fk_convention_signe_par 
FOREIGN KEY (signe_par) REFERENCES {schema}.utilisateur(id) ON DELETE SET NULL;

-- 2. Résoudre le problème classe_id
-- Option A : Supprimer la colonne
ALTER TABLE {schema}.message_enseignant DROP COLUMN classe_id;

-- Option B : Créer la table classe (si nécessaire)
CREATE TABLE IF NOT EXISTS {schema}.classe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcours_id UUID NOT NULL REFERENCES {schema}.parcours(id),
    annee_niveau SMALLINT NOT NULL,
    code VARCHAR(50) NOT NULL,
    libelle VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4️⃣ INDEX MANQUANTS SUR COLONNES FRÉQUEMMENT INTERROGÉES

### 🔍 Problème
Certaines colonnes utilisées dans les WHERE, JOIN et ORDER BY **n'ont pas d'index**, causant des full table scans.

### 📍 Liste des Index Manquants

#### A. Recherches de Paiements

**Table** : `paiement`  
**Requêtes fréquentes** : Filtrage par date et mode de paiement

```sql
-- Index manquant
CREATE INDEX IF NOT EXISTS idx_paiement_date_mode 
ON paiement(date_paiement DESC, mode_paiement) 
WHERE statut = 'valide';
```

**Impact** : Requêtes de statistiques financières lentes

#### B. Statistiques d'Assiduité

**Table** : `presence`  
**Requêtes fréquentes** : Comptage par date et statut

```sql
-- Index manquant
CREATE INDEX IF NOT EXISTS idx_presence_date_statut 
ON presence(date_seance, statut) 
INCLUDE (etudiant_id);
```

**Impact** : Rapports d'assiduité lents

#### C. Notes par Session

**Table** : `note`  
**Requêtes fréquentes** : Récupération notes par session et étudiant

```sql
-- Index manquant
CREATE INDEX IF NOT EXISTS idx_note_session_etudiant 
ON note(session_id, etudiant_id) 
INCLUDE (valeur, verrouille);
```

**Impact** : Affichage bulletins lent

#### D. Étudiants Actifs par Parcours

**Table** : `inscription`  
**Requêtes fréquentes** : Liste étudiants inscrits par parcours

```sql
-- Index manquant
CREATE INDEX IF NOT EXISTS idx_inscription_actif_parcours 
ON inscription(parcours_id, annee_academique_id) 
WHERE statut = 'validee';
```

**Impact** : Listes de classe lentes

#### E. Incidents Disciplinaires Ouverts

**Table** : `incident_disciplinaire`  
**Requêtes fréquentes** : KPI président, alertes

```sql
-- Index manquant
CREATE INDEX IF NOT EXISTS idx_incident_statut_date 
ON incident_disciplinaire(statut, date_incident DESC) 
WHERE statut IN ('ouvert', 'en_cours', 'arbitrage');
```

**Impact** : Dashboard président lent

#### F. Notifications Non Lues

**Table** : `notification`  
**Requêtes fréquentes** : Compteur notifications par utilisateur

```sql
-- Index manquant
CREATE INDEX IF NOT EXISTS idx_notification_lue 
ON notification(utilisateur_id, lue, created_at DESC);
```

**Impact** : Chargement notifications lent

#### G. Messages Non Lus

**Table** : `message`  
**Requêtes fréquentes** : Boîte de réception

```sql
-- Index manquant
CREATE INDEX IF NOT EXISTS idx_message_lu 
ON message(destinataire_id, lu, created_at DESC);
```

**Impact** : Messagerie lente

#### H. Emploi du Temps par Enseignant

**Table** : `emploi_du_temps`  
**Requêtes fréquentes** : Planning enseignant

```sql
-- Index existant à vérifier
-- Si absent, créer:
CREATE INDEX IF NOT EXISTS idx_edt_enseignant_date 
ON emploi_du_temps(affectation_id, date_seance);
```

**Impact** : Affichage planning lent

#### I. Stock Sous Seuil

**Table** : `stock`  
**Requêtes fréquentes** : Alertes logistique

```sql
-- Index existant (ligne 1177 de tenant-schema.sql)
CREATE INDEX IF NOT EXISTS idx_stock_seuil 
ON stock(quantite_stock, seuil_alerte);
```

**Statut** : ✅ Index présent

#### J. Tickets Maintenance Ouverts

**Table** : `ticket_maintenance`  
**Requêtes fréquentes** : Dashboard logistique

```sql
-- Index existant (ligne 1176 de tenant-schema.sql)
CREATE INDEX IF NOT EXISTS idx_ticket_statut 
ON ticket_maintenance(statut, priorite);
```

**Statut** : ✅ Index présent

### 📊 Résumé Index Manquants

| Table | Index Manquant | Priorité | Impact |
|-------|----------------|----------|--------|
| `paiement` | date_mode | 🔴 HAUTE | Stats financières |
| `presence` | date_statut | 🔴 HAUTE | Rapports assiduité |
| `note` | session_etudiant | 🔴 HAUTE | Bulletins |
| `inscription` | parcours_actif | 🟠 MOYENNE | Listes classe |
| `incident_disciplinaire` | statut_date | 🟠 MOYENNE | Dashboard |
| `notification` | user_lue | 🟡 BASSE | UX |
| `message` | dest_lu | 🟡 BASSE | UX |

### ✅ Solution Recommandée

Script SQL à exécuter sur tous les schémas tenant :

```sql
-- Script: add_missing_indexes.sql
-- À exécuter pour chaque schéma tenant

-- 1. Paiements
CREATE INDEX IF NOT EXISTS idx_paiement_date_mode 
ON paiement(date_paiement DESC, mode_paiement) 
WHERE statut = 'valide';

-- 2. Présences
CREATE INDEX IF NOT EXISTS idx_presence_date_statut 
ON presence(date_seance, statut) 
INCLUDE (etudiant_id);

-- 3. Notes
CREATE INDEX IF NOT EXISTS idx_note_session_etudiant 
ON note(session_id, etudiant_id) 
INCLUDE (valeur, verrouille);

-- 4. Inscriptions
CREATE INDEX IF NOT EXISTS idx_inscription_actif_parcours 
ON inscription(parcours_id, annee_academique_id) 
WHERE statut = 'validee';

-- 5. Incidents
CREATE INDEX IF NOT EXISTS idx_incident_statut_date 
ON incident_disciplinaire(statut, date_incident DESC) 
WHERE statut IN ('ouvert', 'en_cours', 'arbitrage');

-- 6. Notifications
CREATE INDEX IF NOT EXISTS idx_notification_lue 
ON notification(utilisateur_id, lue, created_at DESC);

-- 7. Messages
CREATE INDEX IF NOT EXISTS idx_message_lu 
ON message(destinataire_id, lu, created_at DESC);

-- Analyser les tables après création des index
ANALYZE paiement;
ANALYZE presence;
ANALYZE note;
ANALYZE inscription;
ANALYZE incident_disciplinaire;
ANALYZE notification;
ANALYZE message;
```

---

## 5️⃣ RÔLE 'PROFESSEUR' VS 'ENSEIGNANT' NON STANDARDISÉ

### 🔍 Problème
Le système utilise **deux termes différents** pour désigner le même rôle, créant confusion et bugs potentiels.

### 📍 Occurrences de 'professeur'

#### A. Fichier `Shema.sql`

**Ligne 156** :
```sql
CHECK (role IN (
    'president', 'resp_pedagogique', 'secretaire_parcours',
    'surveillant_general', 'scolarite', 'rh',
    'economat', 'caissier', 'communication',
    'logistique', 'entretien', 'admin',
    'etudiant', 'parent', 'professeur'  -- ❌ PROFESSEUR
))
```

**Ligne 557** :
```sql
CHECK (cible IN ('tous', 'etudiants', 'parents', 'professeurs', 'personnel', 'parcours'))
                                                    -- ❌ PROFESSEURS (pluriel)
```

**Ligne 1245** :
```sql
WHERE role = 'professeur' AND actif = TRUE  -- ❌ PROFESSEUR
```

#### B. Fichier `BD.sql`

**Ligne 3000** (vue_kpi_president pour tenant_universite_d_antsiranana) :
```sql
WHERE (((utilisateur.role)::text = 'professeur'::text) AND (utilisateur.actif = true))
-- ❌ PROFESSEUR
```

**Ligne 2500** (vue_kpi_president pour tenant_ispm) :
```sql
WHERE (((utilisateur.role)::text = 'professeur'::text) AND (utilisateur.actif = true))
-- ❌ PROFESSEUR
```

### 📍 Occurrences de 'enseignant'

#### A. Fichier `tenant-schema.sql`

**Ligne 40** :
```sql
CHECK (role IN (
    'president', 'resp_pedagogique', 'secretaire_parcours',
    'surveillant_general', 'scolarite', 'rh',
    'economat', 'caissier', 'communication',
    'logistique', 'entretien', 'admin',
    'etudiant', 'parent', 'enseignant'  -- ✅ ENSEIGNANT
))
```

**Ligne 252** :
```sql
CREATE TABLE IF NOT EXISTS enseignant (  -- ✅ Table ENSEIGNANT
```

**Ligne 1043** :
```sql
('enseignant', 'publier_cours', 'Publier supports de cours', true, ...)
-- ✅ ENSEIGNANT
```

#### B. Fichier `BD.sql`

**Lignes 252-269** (tenant_ispm) :
```sql
CREATE TABLE tenant_ispm.enseignant (  -- ✅ Table ENSEIGNANT
```

**Lignes 1800-1820** (tenant_universite_d_antsiranana) :
```sql
CREATE TABLE tenant_universite_d_antsiranana.enseignant (  -- ✅ Table ENSEIGNANT
```

### 📊 Statistiques d'Utilisation

| Terme | Fichiers | Occurrences | Contexte |
|-------|----------|-------------|----------|
| `professeur` | Shema.sql, BD.sql | ~15 | Contraintes CHECK, vues |
| `enseignant` | tenant-schema.sql, BD.sql | ~50 | Tables, FK, index |

### ⚠️ Impact

1. **Confusion développeurs** : Quel terme utiliser ?
2. **Bugs potentiels** : Requêtes avec mauvais rôle
3. **Incohérence données** : Certains users avec 'professeur', d'autres 'enseignant'
4. **Maintenance difficile** : Deux termes à gérer

### ✅ Solution Recommandée

**Standardiser sur 'enseignant'** (terme le plus utilisé)

#### Étape 1 : Mettre à jour les contraintes

```sql
-- Pour chaque schéma tenant
ALTER TABLE {schema}.utilisateur 
DROP CONSTRAINT IF EXISTS utilisateur_role_check;

ALTER TABLE {schema}.utilisateur 
ADD CONSTRAINT utilisateur_role_check 
CHECK (role IN (
    'president', 'resp_pedagogique', 'secretaire_parcours',
    'surveillant_general', 'scolarite', 'rh',
    'economat', 'caissier', 'communication',
    'logistique', 'entretien', 'admin',
    'etudiant', 'parent', 'enseignant'  -- ✅ Standardisé
));
```

#### Étape 2 : Migrer les données existantes

```sql
-- Mettre à jour les utilisateurs avec rôle 'professeur'
UPDATE {schema}.utilisateur 
SET role = 'enseignant' 
WHERE role = 'professeur';
```

#### Étape 3 : Mettre à jour les vues

```sql
-- Recréer vue_kpi_president
CREATE OR REPLACE VIEW {schema}.vue_kpi_president AS
SELECT
    (SELECT COUNT(*) FROM etudiant WHERE actif = TRUE) AS total_etudiants,
    (SELECT COUNT(*) FROM utilisateur 
     WHERE role = 'enseignant' AND actif = TRUE) AS total_enseignants,  -- ✅ Corrigé
    -- ... reste de la vue
```

#### Étape 4 : Mettre à jour la contrainte annonce.cible

```sql
ALTER TABLE {schema}.annonce 
DROP CONSTRAINT IF EXISTS annonce_cible_check;

ALTER TABLE {schema}.annonce 
ADD CONSTRAINT annonce_cible_check 
CHECK (cible IN ('tous', 'etudiants', 'parents', 'enseignants', 'personnel', 'parcours'));
                                                    -- ✅ 'enseignants' au lieu de 'professeurs'
```

#### Étape 5 : Mettre à jour les données annonce

```sql
UPDATE {schema}.annonce 
SET cible = 'enseignants' 
WHERE cible = 'professeurs';
```

### 📝 Fichiers à Modifier

1. ✅ `backend/src/tenants/tenant-schema.sql` - Déjà correct
2. ❌ `Shema.sql` - À corriger (lignes 156, 557, 1245)
3. ❌ `BD.sql` - À corriger (vues KPI)
4. ✅ Vérifier le code TypeScript/NestJS pour cohérence

---

## 📊 RÉSUMÉ GLOBAL

| # | Problème | Fichiers Affectés | Priorité | Effort |
|---|----------|-------------------|----------|--------|
| 1 | Contraintes statut diplôme | 3 fichiers | 🔴 CRITIQUE | 2h |
| 2 | Colonnes manquantes | tenant-schema.sql | 🔴 CRITIQUE | 4h |
| 3 | FK absentes | 2 tables | 🟠 IMPORTANT | 1h |
| 4 | Index manquants | 7 tables | 🟠 IMPORTANT | 2h |
| 5 | Rôle professeur/enseignant | 3 fichiers | 🟡 MODÉRÉ | 3h |

**Temps total estimé** : 12 heures de travail

---

## 🚀 PLAN D'EXÉCUTION RECOMMANDÉ

### Phase 1 : Immédiat (Jour 1)
1. ✅ Harmoniser contraintes statut diplôme
2. ✅ Ajouter FK manquantes sur convention
3. ✅ Créer index critiques (paiement, presence, note)

### Phase 2 : Court terme (Semaine 1)
4. ✅ Mettre à jour tenant-schema.sql avec toutes les colonnes
5. ✅ Ajouter tables manquantes (convention, delegation, conseil_discipline)
6. ✅ Créer index secondaires

### Phase 3 : Moyen terme (Semaine 2)
7. ✅ Standardiser rôle enseignant
8. ✅ Migrer données existantes
9. ✅ Tester sur environnement de staging

### Phase 4 : Validation (Semaine 3)
10. ✅ Déployer en production
11. ✅ Monitorer performances
12. ✅ Documenter changements

---

**Fin du document**