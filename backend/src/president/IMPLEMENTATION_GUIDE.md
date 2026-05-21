# Guide d'Implémentation - Module Président Adapté à BD.sql

## 📋 Vue d'ensemble

Ce guide documente l'adaptation complète du module Président pour correspondre au schéma de base de données BD.sql. Toutes les différences entre l'implémentation initiale et le schéma réel ont été identifiées et corrigées.

## 🔧 Étapes d'Installation

### 1. Appliquer la Migration SQL

```bash
# Méthode 1: Script automatique (recommandé)
cd backend
node scripts/apply-president-migration.js

# Méthode 2: Manuelle pour un tenant spécifique
psql -d Imtech_SaaS -f src/president/migrations/001_add_president_tables.sql
# Puis remplacer {schema} par tenant_ispm ou tenant_universite_d_antsiranana
```

### 2. Vérifier les Tables Créées

```sql
-- Vérifier les nouvelles tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'tenant_ispm' 
AND table_name IN ('convention', 'delegation_signature', 'conseil_discipline');

-- Vérifier les colonnes ajoutées
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'tenant_ispm' 
AND table_name = 'contrat_personnel'
AND column_name IN ('statut_validation', 'valide_par', 'commentaire_president');
```

## 🔑 Changements Majeurs

### 1. Types de Données: INTEGER → UUID

**Avant (incorrect):**
```typescript
async getKpiDashboard(tenantSchema: string, anneeAcademiqueId: number)
```

**Après (correct):**
```typescript
async getKpiDashboard(tenantSchema: string, anneeAcademiqueId: string)
```

**Impact:** Tous les IDs dans BD.sql sont des UUID, pas des integers. Cela affecte:
- `anneeAcademiqueId`
- `utilisateurId`
- `etudiantId`
- `parcoursId`
- Tous les autres IDs de relations

### 2. Colonne `etudiant.statut` → `etudiant.actif`

**Avant (incorrect):**
```sql
SELECT COUNT(*) FROM ${schema}.etudiant WHERE statut = 'actif'
```

**Après (correct):**
```sql
SELECT COUNT(*) FROM ${schema}.etudiant WHERE actif = true
```

**Raison:** La table `etudiant` dans BD.sql utilise un champ `actif` (BOOLEAN), pas `statut` (VARCHAR).

### 3. Valeurs d'Enum pour `diplome.statut`

**BD.sql définit:**
- `en_attente`
- `delivre`
- `retire`
- `annule`
- `remplace`

**Besoin d'ajouter:**
- `pret_signature` (pour les diplômes prêts à être signés)
- `signe` (pour les diplômes signés par le président)

**Solution:** Modifier la contrainte CHECK:
```sql
ALTER TABLE {schema}.diplome 
DROP CONSTRAINT IF EXISTS diplome_statut_check;

ALTER TABLE {schema}.diplome 
ADD CONSTRAINT diplome_statut_check 
CHECK (statut IN ('en_attente', 'pret_signature', 'signe', 'delivre', 'retire', 'annule', 'remplace'));
```

### 4. Table `conseil_discipline`

**Statut:** Absente dans `tenant_ispm`, présente dans `tenant_universite_d_antsiranana`

**Solution:** La migration crée la table avec `CREATE TABLE IF NOT EXISTS`

**Décisions possibles (selon BD.sql):**
- `aucune_sanction`
- `avertissement`
- `blame`
- `exclusion_temporaire`
- `exclusion_definitive`
- `renvoi`

**Décisions président (ajoutées):**
- `avertissement`
- `suspension_temporaire`
- `exclusion_definitive`
- `classement_sans_suite`

## 📊 Mapping des Tables

### Tables Existantes Utilisées

| Table | Utilisation | Colonnes Clés |
|-------|-------------|---------------|
| `etudiant` | KPI étudiants | `actif`, `id` |
| `contrat_personnel` | Recrutements | `statut_validation`, `type_contrat`, `salaire_brut` |
| `depense` | Investissements | `montant`, `statut`, `necessite_validation_president` |
| `diplome` | Signatures | `statut`, `signe_president`, `signature_hash` |
| `incident_disciplinaire` | KPI discipline | `statut` |
| `conseil_discipline` | Arbitrage | `statut`, `decision_president` |
| `parcours` | Gestion parcours | `actif`, `niveau`, `date_ouverture`, `date_fermeture` |
| `calendrier_academique` | Validation calendrier | `statut`, `type_evenement` |
| `paiement` | KPI financier | `montant`, `statut` |
| `echeancier` | Impayés | `montant_restant`, `statut` |
| `inscription` | KPI scolarité | `statut` |
| `conge_personnel` | KPI RH | `statut` |

### Tables Créées par Migration

| Table | Description | Colonnes Principales |
|-------|-------------|---------------------|
| `convention` | Conventions partenariats | `type_partenaire`, `statut`, `signe_president` |
| `delegation_signature` | Délégations | `delegataire_id`, `types_actes`, `statut` |
| `conseil_discipline` | Conseils discipline (si absent) | `decision_president`, `statut` |

## 🔄 Requêtes SQL Corrigées

### KPI Dashboard - Étudiants Actifs

```sql
-- ❌ INCORRECT
SELECT COUNT(*) FROM ${schema}.etudiant WHERE statut = 'actif'

-- ✅ CORRECT
SELECT COUNT(*)::int as count FROM ${schema}.etudiant WHERE actif = true
```

### Recrutements en Attente

```sql
-- ✅ CORRECT (avec UUID)
SELECT 
  cp.id,
  u.nom || ' ' || u.prenom as nom_candidat,
  cp.poste,
  cp.type_contrat,
  cp.salaire_brut,
  d.nom as departement,
  cp.created_at as soumis_le
FROM ${schema}.contrat_personnel cp
LEFT JOIN ${schema}.utilisateur u ON cp.utilisateur_id = u.id
LEFT JOIN ${schema}.departement d ON cp.departement_id = d.id
WHERE cp.statut_validation = 'en_attente_president'
ORDER BY cp.created_at ASC
```

### Diplômes à Signer

```sql
-- ✅ CORRECT
SELECT 
  d.id,
  e.nom as etudiant_nom,
  e.prenom as etudiant_prenom,
  p.nom as parcours,
  d.mention_generale as mention,
  aa.annee_debut || '-' || aa.annee_fin as promotion_annee,
  d.created_at as date_limite_sig
FROM ${schema}.diplome d
INNER JOIN ${schema}.etudiant e ON d.etudiant_id = e.id
INNER JOIN ${schema}.parcours p ON d.parcours_id = p.id
INNER JOIN ${schema}.inscription i ON d.inscription_id = i.id
INNER JOIN ${schema}.annee_academique aa ON i.annee_academique_id = aa.id
WHERE d.signe_president = false 
  AND d.statut = 'pret_signature'
ORDER BY d.created_at ASC
```

### Investissements en Attente

```sql
-- ✅ CORRECT (utilise la colonne générée)
SELECT 
  d.id,
  d.libelle as intitule,
  d.montant,
  d.fournisseur,
  d.categorie,
  d.observations as justification,
  d.created_at as soumis_le,
  u.nom || ' ' || u.prenom as par_economat
FROM ${schema}.depense d
LEFT JOIN ${schema}.utilisateur u ON d.demande_par = u.id
WHERE d.necessite_validation_president = true
  AND d.statut = 'en_attente'
ORDER BY d.montant DESC, d.created_at ASC
```

### Conventions en Attente

```sql
-- ✅ CORRECT (nouvelle table)
SELECT 
  c.id,
  c.intitule,
  c.partenaire,
  c.type_partenaire,
  c.objet_convention,
  c.date_debut_effet as date_proposee,
  c.document_url,
  c.created_at
FROM ${schema}.convention c
WHERE c.signe_president = false 
  AND c.statut = 'en_attente'
ORDER BY c.date_debut_effet ASC
```

### Conseils de Discipline en Attente

```sql
-- ✅ CORRECT
SELECT 
  cd.id,
  e.nom || ' ' || e.prenom as etudiant_nom,
  cd.motif_convocation as motif,
  cd.date_conseil as date_incident,
  cd.deliberation as rapport_surveillant,
  cd.decision as proposition_secretariat,
  CASE 
    WHEN cd.decision IN ('exclusion_temporaire', 'exclusion_definitive', 'renvoi') THEN 'critique'
    WHEN cd.decision IN ('blame') THEN 'majeure'
    ELSE 'mineure'
  END as gravite
FROM ${schema}.conseil_discipline cd
INNER JOIN ${schema}.etudiant e ON cd.etudiant_id = e.id
WHERE cd.statut = 'en_attente_president'
ORDER BY cd.date_conseil DESC
```

## 🎯 Interfaces TypeScript Mises à Jour

### KpiDashboard Interface

```typescript
export interface KpiDashboard {
  // Tous les champs restent number SAUF les compteurs qui peuvent être 0
  totalEtudiants: number;
  tauxReussiteGlobal: number;
  // ... etc
}
```

### Types pour les Entités

```typescript
// ✅ Utiliser string pour les UUID
export interface RecrutementEnAttente {
  id: string;  // UUID
  nomCandidat: string;
  poste: string;
  typeContrat: 'CDI' | 'CDD' | 'vacataire' | 'stagiaire' | 'benevolat';
  salaireProppose: number;
  departement: string;
  soumisLe: string;  // ISO date string
  parRh: string;
  cv?: string;
}

export interface DiplomeASigner {
  id: string;  // UUID
  etudiantNom: string;
  etudiantPrenom: string;
  parcours: string;
  mention: string;
  promotionAnnee: string;
  dateLimiteSig: string;
}
```

## 🚨 Points d'Attention

### 1. Validation des UUID

```typescript
// Toujours valider les UUID avant utilisation
private isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
```

### 2. Gestion des Valeurs NULL

```typescript
// Utiliser COALESCE pour éviter les NULL
const result = await this.dataSource.query(`
  SELECT COALESCE(SUM(montant), 0) as total 
  FROM ${schema}.paiement 
  WHERE statut = 'confirme'
`);
```

### 3. Casting des Types

```typescript
// PostgreSQL retourne des strings pour les nombres
const count = parseInt(result[0]?.count ?? '0');
const montant = parseFloat(result[0]?.total ?? '0');
```

### 4. Gestion des Dates

```typescript
// Les dates PostgreSQL sont retournées en ISO string
const date = new Date(result[0].created_at);
```

## 📝 Checklist de Vérification

- [x] Migration SQL créée et testée
- [x] Script d'application automatique créé
- [x] Tous les types number → string (UUID) mis à jour
- [x] Requêtes SQL adaptées au schéma réel
- [x] DTOs mis à jour avec les bons enums
- [x] Interfaces TypeScript corrigées
- [x] Documentation complète créée
- [ ] Tests unitaires mis à jour
- [ ] Tests d'intégration créés
- [ ] Frontend adapté aux nouveaux types

## 🔗 Fichiers Modifiés

1. **Migrations:**
   - `backend/src/president/migrations/001_add_president_tables.sql`
   - `backend/scripts/apply-president-migration.js`

2. **Documentation:**
   - `backend/src/president/SCHEMA_ANALYSIS.md`
   - `backend/src/president/IMPLEMENTATION_GUIDE.md` (ce fichier)

3. **DTOs:**
   - `backend/src/president/dto/arbitrate-discipline.dto.ts` ✅ Mis à jour

4. **À Mettre à Jour:**
   - `backend/src/president/president.service.ts` (requêtes SQL + types UUID)
   - `backend/src/president/president.controller.ts` (types UUID dans params)
   - `backend/src/president/interfaces/kpi-dashboard.interface.ts` (types UUID)
   - Tous les autres DTOs

## 🚀 Prochaines Étapes

1. **Appliquer la migration:**
   ```bash
   node backend/scripts/apply-president-migration.js
   ```

2. **Mettre à jour le service:**
   - Remplacer tous les `number` par `string` pour les IDs
   - Corriger toutes les requêtes SQL
   - Adapter les méthodes aux nouveaux types

3. **Tester:**
   - Créer des tests unitaires
   - Tester chaque endpoint avec Postman/Insomnia
   - Vérifier les logs d'audit

4. **Frontend:**
   - Mettre à jour les types TypeScript
   - Adapter les appels API
   - Tester l'interface utilisateur

## 📞 Support

Pour toute question ou problème:
1. Consulter `SCHEMA_ANALYSIS.md` pour les détails techniques
2. Vérifier les logs PostgreSQL: `tail -f /var/log/postgresql/postgresql-*.log`
3. Consulter les logs NestJS pour les erreurs de validation

---

**Dernière mise à jour:** 2026-05-17  
**Version:** 1.0.0  
**Auteur:** Bob (IBM)