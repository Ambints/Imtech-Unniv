# 🚀 GUIDE DE DÉPLOIEMENT - ALIGNEMENT SCHÉMA TENANT (Windows)

## 📋 Prérequis

1. **PostgreSQL installé** avec `psql` dans le PATH
2. **PowerShell** (inclus dans Windows)
3. **Accès administrateur** à la base de données

---

## 🎯 Méthode 1: Script PowerShell Automatisé (RECOMMANDÉ)

### Étape 1: Ouvrir PowerShell

```powershell
# Naviguer vers le dossier du projet
cd "E:\Folder\L2\Alt\IMTECH UNIVERSITY\imtech-university"
```

### Étape 2: Autoriser l'exécution de scripts (si nécessaire)

```powershell
# Vérifier la politique d'exécution
Get-ExecutionPolicy

# Si "Restricted", autoriser temporairement
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

### Étape 3: Exécuter le script de déploiement

#### Option A: Tester sur UN tenant (RECOMMANDÉ pour commencer)

```powershell
.\backend\scripts\deploy-alignment.ps1 -TenantName "tenant_ispm"
```

#### Option B: Appliquer sur TOUS les tenants

```powershell
.\backend\scripts\deploy-alignment.ps1 -AllTenants
```

#### Option C: Mode test (Dry Run - aucune modification)

```powershell
.\backend\scripts\deploy-alignment.ps1 -TenantName "tenant_ispm" -DryRun
```

### Étape 4: Vérifier les résultats

Le script affichera:
- ✅ Connexion réussie
- ✅ Script chargé avec succès
- ✅ Alignement appliqué sur [tenant_name]

---

## 🎯 Méthode 2: Commandes PostgreSQL Manuelles

### Étape 1: Se connecter à PostgreSQL

```powershell
# Ouvrir psql
psql -h localhost -U postgres -d imtech_saas
```

### Étape 2: Charger le script SQL

```sql
-- Dans psql, exécuter:
\i 'E:/Folder/L2/Alt/IMTECH UNIVERSITY/imtech-university/backend/scripts/migration-align-tenant-schema.sql'
```

**Note**: Utilisez des slashes `/` au lieu de backslashes `\` dans les chemins psql.

### Étape 3: Appliquer sur un tenant

```sql
-- Tester sur tenant_ispm
SELECT apply_tenant_schema_alignment('tenant_ispm');
```

### Étape 4: Appliquer sur tous les tenants

```sql
-- Appliquer sur tous
SELECT * FROM apply_alignment_to_all_tenants();
```

---

## 🔍 Vérifications Post-Déploiement

### Dans psql:

```sql
-- 1. Vérifier les nouvelles tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'tenant_ispm' 
AND table_name IN (
    'archive_scolarite', 'attestation', 'deliberation', 
    'resultat_ue', 'resultat_semestre', 'verrouillage_notes',
    'suplement_diplome', 'transfert_etudiant', 'paiement_inscription'
)
ORDER BY table_name;

-- 2. Compter les tables (doit être >= 83)
SELECT COUNT(*) as nombre_tables
FROM information_schema.tables 
WHERE table_schema = 'tenant_ispm' 
AND table_type = 'BASE TABLE';

-- 3. Vérifier les nouvelles colonnes dans utilisateur
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'tenant_ispm' 
AND table_name = 'utilisateur'
AND column_name IN ('tenant_id', 'parcours_assignes');

-- 4. Vérifier les séquences
SELECT sequence_name 
FROM information_schema.sequences 
WHERE sequence_schema = 'tenant_ispm'
AND sequence_name IN ('seq_recu', 'convention_id_seq', 'delegation_signature_id_seq', 'evaluation_personnel_id_seq');
```

---

## ⚠️ Résolution de Problèmes

### Problème 1: "psql n'est pas reconnu"

**Solution**: Ajouter PostgreSQL au PATH

```powershell
# Trouver l'installation PostgreSQL
$pgPath = "C:\Program Files\PostgreSQL\16\bin"  # Ajuster la version

# Ajouter temporairement au PATH
$env:Path += ";$pgPath"

# Vérifier
psql --version
```

### Problème 2: "Mot de passe incorrect"

**Solution**: Vérifier les credentials PostgreSQL

```powershell
# Tester la connexion
psql -h localhost -U postgres -d imtech_saas -c "SELECT version();"
```

### Problème 3: "Le schéma n'existe pas"

**Solution**: Vérifier les tenants disponibles

```sql
-- Dans psql
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name LIKE 'tenant_%';
```

### Problème 4: "Erreur lors du chargement du script"

**Solution**: Vérifier le chemin du fichier

```powershell
# Vérifier que le fichier existe
Test-Path ".\backend\scripts\migration-align-tenant-schema.sql"

# Afficher le chemin complet
Get-Item ".\backend\scripts\migration-align-tenant-schema.sql" | Select-Object FullName
```

---

## 🔄 Rollback (Annulation)

Si vous devez annuler les modifications:

### Option 1: Restaurer depuis un backup

```powershell
# Si vous avez fait un backup avant
psql -h localhost -U postgres -d imtech_saas -f "backup_avant_migration.sql"
```

### Option 2: Supprimer manuellement les tables ajoutées

```sql
-- Dans psql, pour chaque tenant
DROP TABLE IF EXISTS tenant_ispm.archive_scolarite CASCADE;
DROP TABLE IF EXISTS tenant_ispm.attestation CASCADE;
DROP TABLE IF EXISTS tenant_ispm.deliberation CASCADE;
DROP TABLE IF EXISTS tenant_ispm.resultat_ue CASCADE;
DROP TABLE IF EXISTS tenant_ispm.resultat_semestre CASCADE;
DROP TABLE IF EXISTS tenant_ispm.verrouillage_notes CASCADE;
DROP TABLE IF EXISTS tenant_ispm.suplement_diplome CASCADE;
DROP TABLE IF EXISTS tenant_ispm.transfert_etudiant CASCADE;
DROP TABLE IF EXISTS tenant_ispm.paiement_inscription CASCADE;

-- Supprimer les séquences
DROP SEQUENCE IF EXISTS tenant_ispm.seq_recu;
DROP SEQUENCE IF EXISTS tenant_ispm.convention_id_seq;
DROP SEQUENCE IF EXISTS tenant_ispm.delegation_signature_id_seq;
DROP SEQUENCE IF EXISTS tenant_ispm.evaluation_personnel_id_seq;
```

---

## 📊 Résumé des Modifications

### Tables Ajoutées (9)
- ✅ archive_scolarite
- ✅ attestation
- ✅ deliberation
- ✅ resultat_ue
- ✅ resultat_semestre
- ✅ verrouillage_notes
- ✅ suplement_diplome
- ✅ transfert_etudiant
- ✅ paiement_inscription

### Colonnes Ajoutées
- **utilisateur**: tenant_id, parcours_assignes
- **parcours**: date_ouverture, motif_ouverture, conditions_ouverture, date_fermeture, motif_fermeture, valide_par_president
- **contrat_personnel**: valide_par, valide_le, commentaire_president, conditions_speciales
- **depense**: valide_par_president, valide_le, motif_decision, conditions_speciales
- **calendrier_academique**: valide_par_president, valide_le, commentaire_president
- **grille_tarifaire**: montant_inscription, montant_scolarite, date_limite_paiement, modalites_paiement
- **paiement**: type_paiement, cloture_caisse_id, details_paiement

### Séquences Ajoutées (4)
- seq_recu
- convention_id_seq
- delegation_signature_id_seq
- evaluation_personnel_id_seq

### Index Ajoutés (30+)
- Index sur toutes les nouvelles tables
- Index de performance sur tables existantes

---

## 📞 Support

En cas de problème:
1. Vérifier les logs PostgreSQL
2. Consulter le fichier `GUIDE_DEPLOIEMENT_ALIGNEMENT_TENANT.md`
3. Vérifier les messages d'erreur dans PowerShell

---

## ✅ Checklist de Déploiement

- [ ] Backup de la base effectué
- [ ] PostgreSQL accessible
- [ ] Script PowerShell testé en mode DryRun
- [ ] Déploiement sur tenant_ispm réussi
- [ ] Vérifications post-déploiement OK
- [ ] Déploiement sur tous les tenants
- [ ] Tests d'intégration passés
- [ ] Documentation mise à jour

---

**Dernière mise à jour**: 2026-05-18  
**Version**: 1.0