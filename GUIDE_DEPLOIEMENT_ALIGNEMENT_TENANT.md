# 🚀 GUIDE DE DÉPLOIEMENT - ALIGNEMENT SCHÉMA TENANT

## 📋 Vue d'ensemble

Ce guide explique comment appliquer les modifications d'alignement du schéma tenant avec la structure de production.

**Date**: 2026-05-18  
**Fichiers créés**:
- ✅ `ANALYSE_TENANT_SCHEMA_ALIGNMENT.md` - Analyse détaillée
- ✅ `backend/scripts/migration-align-tenant-schema.sql` - Script de migration

---

## 🎯 Objectif

Ajouter aux schémas tenants existants:
- **9 tables manquantes**
- **Colonnes manquantes** dans 7 tables existantes
- **4 séquences**
- **Index critiques** pour les performances
- **Contraintes FK** appropriées

---

## ⚠️ PRÉREQUIS

1. **Backup de la base de données**
   ```bash
   pg_dump -h localhost -U postgres -d imtech_saas > backup_avant_migration_$(date +%Y%m%d).sql
   ```

2. **Accès PostgreSQL avec droits suffisants**
   ```sql
   -- Vérifier les permissions
   SELECT has_schema_privilege('tenant_ispm', 'CREATE');
   ```

3. **Environnement de test disponible** (recommandé)

---

## 📝 ÉTAPES DE DÉPLOIEMENT

### Étape 1: Charger le script de migration

```sql
-- Se connecter à la base de données
psql -h localhost -U postgres -d imtech_saas

-- Charger le script
\i backend/scripts/migration-align-tenant-schema.sql
```

### Étape 2: Tester sur UN tenant (recommandé)

```sql
-- Appliquer sur tenant_ispm en premier (test)
SELECT apply_tenant_schema_alignment('tenant_ispm');
```

**Résultat attendu**:
```
NOTICE:  🚀 Début de l'alignement du schéma: tenant_ispm
NOTICE:  📝 Ajout des colonnes manquantes...
NOTICE:  🔢 Création des séquences...
NOTICE:  📊 Création des tables manquantes...
NOTICE:  🔍 Création des index manquants...
NOTICE:  🔗 Ajout des contraintes de clés étrangères...
NOTICE:  ✅ SUCCÈS: Schéma tenant_ispm aligné avec succès

 apply_tenant_schema_alignment 
--------------------------------
 SUCCÈS: Schéma tenant_ispm aligné avec succès
```

### Étape 3: Vérifier les modifications

```sql
-- Vérifier les nouvelles tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'tenant_ispm' 
AND table_name IN (
    'archive_scolarite', 'attestation', 'deliberation', 
    'resultat_ue', 'resultat_semestre', 'verrouillage_notes',
    'suplement_diplome', 'transfert_etudiant', 'paiement_inscription'
)
ORDER BY table_name;

-- Vérifier les nouvelles colonnes dans utilisateur
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'tenant_ispm' 
AND table_name = 'utilisateur'
AND column_name IN ('tenant_id', 'parcours_assignes');

-- Vérifier les nouvelles colonnes dans parcours
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'tenant_ispm' 
AND table_name = 'parcours'
AND column_name IN ('date_ouverture', 'motif_ouverture', 'valide_par_president');

-- Vérifier les séquences
SELECT sequence_name 
FROM information_schema.sequences 
WHERE sequence_schema = 'tenant_ispm'
AND sequence_name IN ('seq_recu', 'convention_id_seq', 'delegation_signature_id_seq', 'evaluation_personnel_id_seq');

-- Vérifier les index
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'tenant_ispm'
AND indexname LIKE 'idx_%'
ORDER BY indexname;
```

### Étape 4: Appliquer sur tous les tenants

**Si le test est réussi**, appliquer sur tous les tenants:

```sql
-- Appliquer sur tous les tenants automatiquement
SELECT * FROM apply_alignment_to_all_tenants();
```

**OU** appliquer manuellement sur chaque tenant:

```sql
-- Tenant par tenant
SELECT apply_tenant_schema_alignment('tenant_universite_d_antsiranana');
-- Ajouter d'autres tenants si nécessaire
```

---

## 🔍 VÉRIFICATIONS POST-DÉPLOIEMENT

### 1. Vérifier le nombre de tables

```sql
-- Doit retourner au moins 83 tables (74 + 9 nouvelles)
SELECT COUNT(*) as nombre_tables
FROM information_schema.tables 
WHERE table_schema = 'tenant_ispm' 
AND table_type = 'BASE TABLE';
```

### 2. Vérifier l'intégrité des FK

```sql
-- Vérifier qu'il n'y a pas de FK cassées
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'tenant_ispm'
AND tc.table_name IN (
    'archive_scolarite', 'attestation', 'deliberation', 
    'resultat_ue', 'resultat_semestre', 'verrouillage_notes',
    'suplement_diplome', 'transfert_etudiant', 'paiement_inscription'
);
```

### 3. Tester les nouvelles tables

```sql
-- Test d'insertion dans attestation
INSERT INTO tenant_ispm.attestation (
    etudiant_id, 
    type_attestation, 
    numero_attestation,
    statut
) VALUES (
    (SELECT id FROM tenant_ispm.etudiant LIMIT 1),
    'scolarite',
    'ATT-2026-000001',
    'en_attente'
);

-- Vérifier l'insertion
SELECT * FROM tenant_ispm.attestation ORDER BY created_at DESC LIMIT 1;

-- Nettoyer le test
DELETE FROM tenant_ispm.attestation WHERE numero_attestation = 'ATT-2026-000001';
```

---

## 🔄 ROLLBACK (en cas de problème)

Si des problèmes surviennent, restaurer depuis le backup:

```bash
# Arrêter l'application
# Restaurer la base
psql -h localhost -U postgres -d imtech_saas < backup_avant_migration_YYYYMMDD.sql
```

---

## 📊 IMPACT SUR L'APPLICATION

### Modifications nécessaires dans le code

#### 1. Services Backend à mettre à jour

**Créer de nouveaux services**:
```typescript
// backend/src/scolarite/services/attestation.service.ts
// backend/src/scolarite/services/deliberation.service.ts
// backend/src/scolarite/services/resultat.service.ts
// backend/src/scolarite/services/archive.service.ts
// backend/src/scolarite/services/transfert.service.ts
```

#### 2. Entités TypeORM à créer

```typescript
// backend/src/scolarite/entities/attestation.entity.ts
// backend/src/scolarite/entities/deliberation.entity.ts
// backend/src/scolarite/entities/resultat-ue.entity.ts
// backend/src/scolarite/entities/resultat-semestre.entity.ts
// backend/src/scolarite/entities/verrouillage-notes.entity.ts
// backend/src/scolarite/entities/suplement-diplome.entity.ts
// backend/src/scolarite/entities/transfert-etudiant.entity.ts
// backend/src/scolarite/entities/paiement-inscription.entity.ts
// backend/src/scolarite/entities/archive-scolarite.entity.ts
```

#### 3. DTOs à créer

```typescript
// backend/src/scolarite/dto/create-attestation.dto.ts
// backend/src/scolarite/dto/create-deliberation.dto.ts
// etc.
```

#### 4. Controllers à mettre à jour

```typescript
// backend/src/scolarite/scolarite.controller.ts
// Ajouter les endpoints pour les nouvelles fonctionnalités
```

---

## ✅ CHECKLIST DE DÉPLOIEMENT

- [ ] Backup de la base de données effectué
- [ ] Script de migration chargé dans PostgreSQL
- [ ] Test sur tenant_ispm réussi
- [ ] Vérifications post-test OK
- [ ] Application sur tous les tenants
- [ ] Vérifications finales OK
- [ ] Tests d'intégration passés
- [ ] Documentation mise à jour
- [ ] Équipe informée des nouvelles fonctionnalités

---

## 📞 SUPPORT

En cas de problème:
1. Consulter les logs PostgreSQL
2. Vérifier les messages NOTICE dans la sortie SQL
3. Contacter l'équipe technique avec les détails de l'erreur

---

## 📈 PROCHAINES ÉTAPES

Après le déploiement réussi:

1. **Développer les services backend** pour les nouvelles tables
2. **Créer les interfaces frontend** pour:
   - Gestion des attestations
   - Délibérations
   - Consultation des résultats
   - Archives scolarité
   - Transferts d'étudiants
3. **Mettre à jour la documentation utilisateur**
4. **Former les utilisateurs** aux nouvelles fonctionnalités

---

**Document créé le**: 2026-05-18  
**Version**: 1.0  
**Statut**: Prêt pour déploiement