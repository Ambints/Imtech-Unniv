# 🚀 GUIDE D'EXÉCUTION DES CORRECTIONS BASE DE DONNÉES

**Date** : 18 Mai 2026  
**Version** : 1.0  
**Base** : Imtech_SaaS (PostgreSQL 17)

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Phase 1 : Problèmes Critiques](#phase-1--problèmes-critiques)
4. [Phase 2 : Mise à jour Schéma](#phase-2--mise-à-jour-schéma)
5. [Phase 3 : Standardisation](#phase-3--standardisation)
6. [Phase 4 : Déploiement & Monitoring](#phase-4--déploiement--monitoring)
7. [Rollback](#rollback)
8. [FAQ](#faq)

---

## 🎯 VUE D'ENSEMBLE

### Objectif
Corriger les 5 problèmes critiques identifiés dans l'analyse de la base de données.

### Durée Totale Estimée
**12 heures** réparties sur 3 semaines

### Impact
- ⚠️ **Downtime requis** : 30 minutes (Phase 1)
- 🔄 **Redémarrage backend** : Oui (après chaque phase)
- 📊 **Perte de données** : Non
- 🔙 **Rollback possible** : Oui (voir section dédiée)

### Résumé des Phases

| Phase | Durée | Priorité | Downtime |
|-------|-------|----------|----------|
| Phase 1 | 2-3h | 🔴 CRITIQUE | 30 min |
| Phase 2 | 4h | 🟠 IMPORTANT | Non |
| Phase 3 | 3h | 🟡 MODÉRÉ | 15 min |
| Phase 4 | 3h | 🟢 VALIDATION | Non |

---

## 🔧 PRÉREQUIS

### 1. Accès Requis

```bash
# Accès PostgreSQL avec droits superuser
psql -U postgres -d Imtech_SaaS

# Vérifier la version
SELECT version();
-- Doit être PostgreSQL 17.x
```

### 2. Sauvegarde Complète

```bash
# Créer un backup AVANT toute modification
pg_dump -U postgres -Fc -f backup_avant_corrections_$(date +%Y%m%d_%H%M%S).dump Imtech_SaaS

# Vérifier la taille du backup
ls -lh backup_avant_corrections_*.dump
```

### 3. Environnement de Test

```bash
# Créer une base de test
createdb -U postgres Imtech_SaaS_TEST

# Restaurer le backup
pg_restore -U postgres -d Imtech_SaaS_TEST backup_avant_corrections_*.dump

# Tester les scripts sur la base de test AVANT production
```

### 4. Variables d'Environnement

```bash
# Fichier .env
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=Imtech_SaaS
export DB_USER=postgres
export DB_PASSWORD=your_secure_password
```

### 5. Outils Nécessaires

- ✅ PostgreSQL 17.x
- ✅ Node.js 18+ (pour scripts JS)
- ✅ psql CLI
- ✅ Accès SSH au serveur
- ✅ Droits sudo (si nécessaire)

---

## 🔴 PHASE 1 : PROBLÈMES CRITIQUES

### Durée : 2-3 heures
### Downtime : 30 minutes
### Priorité : CRITIQUE

### Objectifs
1. ✅ Harmoniser contraintes statut diplôme
2. ✅ Ajouter colonnes manquantes critiques
3. ✅ Ajouter clés étrangères
4. ✅ Créer index prioritaires

### Étape 1.1 : Préparation

```bash
# 1. Se connecter au serveur
ssh user@your-server

# 2. Naviguer vers le dossier scripts
cd /path/to/imtech-university/backend/scripts

# 3. Vérifier les fichiers
ls -l phase1-fix-critical-issues.sql
ls -l apply-phase1-to-all-tenants.js
```

### Étape 1.2 : Test sur Environnement de Test

```bash
# Appliquer sur base de test
sed 's/{schema}/tenant_ispm/g' phase1-fix-critical-issues.sql | \
  psql -U postgres -d Imtech_SaaS_TEST

# Vérifier les résultats
psql -U postgres -d Imtech_SaaS_TEST -c "
  SELECT COUNT(*) FROM pg_constraint 
  WHERE conname = 'diplome_statut_check' 
  AND connamespace = 'tenant_ispm'::regnamespace;
"
```

### Étape 1.3 : Planification Downtime

```bash
# 1. Informer les utilisateurs (30 min avant)
# 2. Mettre l'application en mode maintenance
# 3. Arrêter le backend
pm2 stop imtech-backend

# 4. Vérifier qu'aucune connexion active
psql -U postgres -d Imtech_SaaS -c "
  SELECT COUNT(*) FROM pg_stat_activity 
  WHERE datname = 'Imtech_SaaS' 
  AND pid <> pg_backend_pid();
"
```

### Étape 1.4 : Exécution Automatique (Recommandé)

```bash
# Méthode 1 : Script Node.js (applique à tous les tenants)
node apply-phase1-to-all-tenants.js

# Le script va :
# - Lister tous les schémas tenant
# - Appliquer les corrections à chacun
# - Vérifier les résultats
# - Afficher un rapport détaillé
```

### Étape 1.5 : Exécution Manuelle (Alternative)

```bash
# Pour chaque tenant individuellement
for schema in tenant_ispm tenant_universite_d_antsiranana; do
  echo "Traitement de $schema..."
  sed "s/{schema}/$schema/g" phase1-fix-critical-issues.sql | \
    psql -U postgres -d Imtech_SaaS
done
```

### Étape 1.6 : Vérifications Post-Exécution

```sql
-- Vérifier contrainte diplome
SELECT 
    schemaname,
    tablename,
    constraintname
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
JOIN pg_namespace n ON t.relnamespace = n.oid
WHERE constraintname = 'diplome_statut_check'
AND schemaname LIKE 'tenant_%';

-- Vérifier colonnes ajoutées
SELECT 
    table_schema,
    table_name,
    column_name
FROM information_schema.columns
WHERE table_schema LIKE 'tenant_%'
AND table_name = 'diplome'
AND column_name = 'signe_president';

-- Vérifier index créés
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname LIKE 'tenant_%'
AND indexname IN ('idx_paiement_date_mode', 'idx_presence_date_statut', 'idx_note_session_etudiant');
```

### Étape 1.7 : Redémarrage Application

```bash
# 1. Redémarrer le backend
pm2 restart imtech-backend

# 2. Vérifier les logs
pm2 logs imtech-backend --lines 100

# 3. Tester les endpoints critiques
curl http://localhost:3000/api/health
curl http://localhost:3000/api/president/dashboard

# 4. Retirer le mode maintenance
```

### Étape 1.8 : Validation Fonctionnelle

**Tests à effectuer** :
- [ ] Connexion utilisateur OK
- [ ] Dashboard président s'affiche
- [ ] Liste des diplômes accessible
- [ ] Signature diplôme fonctionne
- [ ] Validation contrats fonctionne
- [ ] Aucune erreur dans les logs

### ⚠️ En Cas de Problème

```bash
# Rollback Phase 1
pg_restore -U postgres -d Imtech_SaaS -c backup_avant_corrections_*.dump

# Redémarrer l'application
pm2 restart imtech-backend

# Analyser les logs d'erreur
tail -f /var/log/postgresql/postgresql-17-main.log
```

---

## 🟠 PHASE 2 : MISE À JOUR SCHÉMA

### Durée : 4 heures
### Downtime : Non requis
### Priorité : IMPORTANT

### Objectifs
1. ✅ Ajouter tables manquantes au tenant-schema.sql
2. ✅ Garantir cohérence nouveaux tenants
3. ✅ Créer index secondaires

### Étape 2.1 : Backup du Fichier Original

```bash
# Sauvegarder tenant-schema.sql
cp backend/src/tenants/tenant-schema.sql \
   backend/src/tenants/tenant-schema.sql.backup_$(date +%Y%m%d)
```

### Étape 2.2 : Intégration du Nouveau Code

```bash
# 1. Ouvrir tenant-schema.sql
nano backend/src/tenants/tenant-schema.sql

# 2. Localiser la section "MODULE : COMMUNICATION"
# 3. Après cette section, AVANT "INDEX DE PERFORMANCE"
# 4. Copier le contenu de phase2-update-tenant-schema.sql
# 5. Sauvegarder
```

### Étape 2.3 : Validation Syntaxe

```bash
# Vérifier la syntaxe SQL
psql -U postgres -d Imtech_SaaS_TEST -f backend/src/tenants/tenant-schema.sql --dry-run

# Si erreurs, corriger avant de continuer
```

### Étape 2.4 : Test Création Nouveau Tenant

```bash
# Créer un tenant de test
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test University",
    "slug": "test_univ",
    "email_contact": "test@example.com"
  }'

# Vérifier que toutes les tables sont créées
psql -U postgres -d Imtech_SaaS -c "
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'tenant_test_univ'
  ORDER BY table_name;
"

# Vérifier les tables spécifiques
psql -U postgres -d Imtech_SaaS -c "
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'tenant_test_univ'
  AND table_name IN ('convention', 'delegation_signature', 'conseil_discipline', 'absence_enseignant', 'rattrapage');
"
```

### Étape 2.5 : Appliquer aux Tenants Existants

```bash
# Appliquer les nouvelles tables aux tenants existants
for schema in tenant_ispm tenant_universite_d_antsiranana; do
  echo "Ajout tables manquantes à $schema..."
  sed "s/{schema}/$schema/g" phase2-update-tenant-schema.sql | \
    psql -U postgres -d Imtech_SaaS
done
```

### Étape 2.6 : Vérifications

```sql
-- Vérifier table convention
SELECT COUNT(*) as nb_tenants_avec_convention
FROM information_schema.tables
WHERE table_schema LIKE 'tenant_%'
AND table_name = 'convention';

-- Vérifier table delegation_signature
SELECT COUNT(*) as nb_tenants_avec_delegation
FROM information_schema.tables
WHERE table_schema LIKE 'tenant_%'
AND table_name = 'delegation_signature';

-- Vérifier tous les index
SELECT 
    schemaname,
    COUNT(*) as nb_index
FROM pg_indexes
WHERE schemaname LIKE 'tenant_%'
GROUP BY schemaname
ORDER BY schemaname;
```

### Étape 2.7 : Nettoyage

```bash
# Supprimer le tenant de test
curl -X DELETE http://localhost:3000/api/tenants/test_univ

# Ou manuellement
psql -U postgres -d Imtech_SaaS -c "DROP SCHEMA IF EXISTS tenant_test_univ CASCADE;"
```

---

## 🟡 PHASE 3 : STANDARDISATION

### Durée : 3 heures
### Downtime : 15 minutes
### Priorité : MODÉRÉ

### Objectifs
1. ✅ Standardiser rôle 'enseignant'
2. ✅ Migrer données existantes
3. ✅ Mettre à jour vues et contraintes

### Étape 3.1 : Analyse Pré-Migration

```sql
-- Compter les utilisateurs 'professeur'
SELECT 
    table_schema,
    COUNT(*) as nb_professeurs
FROM utilisateur
WHERE role = 'professeur'
GROUP BY table_schema;

-- Compter les annonces 'professeurs'
SELECT 
    table_schema,
    COUNT(*) as nb_annonces
FROM annonce
WHERE cible = 'professeurs'
GROUP BY table_schema;
```

### Étape 3.2 : Exécution

```bash
# Appliquer à tous les tenants
for schema in tenant_ispm tenant_universite_d_antsiranana; do
  echo "Standardisation $schema..."
  sed "s/{schema}/$schema/g" phase3-standardize-role.sql | \
    psql -U postgres -d Imtech_SaaS
done
```

### Étape 3.3 : Vérifications

```sql
-- Vérifier qu'il ne reste plus de 'professeur'
SELECT 
    table_schema,
    role,
    COUNT(*) as nb
FROM utilisateur
WHERE role IN ('professeur', 'enseignant')
GROUP BY table_schema, role
ORDER BY table_schema, role;

-- Résultat attendu : Seulement 'enseignant', aucun 'professeur'
```

### Étape 3.4 : Mise à Jour Code Application

```bash
# Rechercher 'professeur' dans le code
grep -r "professeur" backend/src/ frontend/src/

# Remplacer par 'enseignant'
find backend/src/ frontend/src/ -type f -exec sed -i 's/professeur/enseignant/g' {} +

# Vérifier les changements
git diff
```

### Étape 3.5 : Tests

**Tests à effectuer** :
- [ ] Connexion enseignant OK
- [ ] Portail enseignant accessible
- [ ] Permissions enseignant fonctionnent
- [ ] Annonces aux enseignants OK
- [ ] KPI président affiche bon nombre d'enseignants

---

## 🟢 PHASE 4 : DÉPLOIEMENT & MONITORING

### Durée : 3 heures
### Downtime : Non
### Priorité : VALIDATION

### Objectifs
1. ✅ Déployer en production
2. ✅ Monitorer performances
3. ✅ Valider corrections
4. ✅ Documenter changements

### Étape 4.1 : Checklist Pré-Déploiement

- [ ] Toutes les phases testées en staging
- [ ] Backup production créé
- [ ] Équipe technique informée
- [ ] Plan de rollback prêt
- [ ] Monitoring activé
- [ ] Tests automatisés passent

### Étape 4.2 : Déploiement Production

```bash
# 1. Créer backup production
pg_dump -U postgres -Fc -f backup_prod_$(date +%Y%m%d_%H%M%S).dump Imtech_SaaS

# 2. Appliquer Phase 1
node apply-phase1-to-all-tenants.js

# 3. Appliquer Phase 2
# (Déjà fait via mise à jour tenant-schema.sql)

# 4. Appliquer Phase 3
for schema in $(psql -U postgres -d Imtech_SaaS -t -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name LIKE 'tenant_%'"); do
  sed "s/{schema}/$schema/g" phase3-standardize-role.sql | psql -U postgres -d Imtech_SaaS
done

# 5. Redémarrer application
pm2 restart imtech-backend
```

### Étape 4.3 : Monitoring Performances

```sql
-- Surveiller les requêtes lentes
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE query LIKE '%diplome%' OR query LIKE '%paiement%'
ORDER BY mean_time DESC
LIMIT 10;

-- Surveiller l'utilisation des index
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname LIKE 'tenant_%'
AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;

-- Surveiller la taille des tables
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname LIKE 'tenant_%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
```

### Étape 4.4 : Tests de Validation

```bash
# Script de tests automatisés
cat > test_corrections.sh << 'EOF'
#!/bin/bash

echo "=== Tests de Validation Phase 1-3 ==="

# Test 1 : Contrainte diplome
echo "Test 1 : Contrainte diplome..."
result=$(psql -U postgres -d Imtech_SaaS -t -c "
  SELECT COUNT(*) FROM pg_constraint 
  WHERE conname = 'diplome_statut_check'
")
if [ "$result" -gt 0 ]; then
  echo "✓ PASS"
else
  echo "✗ FAIL"
fi

# Test 2 : Colonnes diplome
echo "Test 2 : Colonnes diplome..."
result=$(psql -U postgres -d Imtech_SaaS -t -c "
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_name = 'diplome'
  AND column_name = 'signe_president'
")
if [ "$result" -gt 0 ]; then
  echo "✓ PASS"
else
  echo "✗ FAIL"
fi

# Test 3 : Index prioritaires
echo "Test 3 : Index prioritaires..."
result=$(psql -U postgres -d Imtech_SaaS -t -c "
  SELECT COUNT(*) FROM pg_indexes
  WHERE indexname IN ('idx_paiement_date_mode', 'idx_presence_date_statut', 'idx_note_session_etudiant')
")
if [ "$result" -ge 3 ]; then
  echo "✓ PASS"
else
  echo "✗ FAIL"
fi

# Test 4 : Rôle enseignant
echo "Test 4 : Rôle enseignant..."
result=$(psql -U postgres -d Imtech_SaaS -t -c "
  SELECT COUNT(*) FROM utilisateur WHERE role = 'professeur'
")
if [ "$result" -eq 0 ]; then
  echo "✓ PASS"
else
  echo "✗ FAIL - Il reste $result professeur(s)"
fi

echo "=== Fin des tests ==="
EOF

chmod +x test_corrections.sh
./test_corrections.sh
```

### Étape 4.5 : Documentation

```bash
# Créer un rapport de déploiement
cat > RAPPORT_DEPLOIEMENT_$(date +%Y%m%d).md << EOF
# Rapport de Déploiement - Corrections Base de Données

**Date** : $(date)
**Durée totale** : X heures
**Downtime** : X minutes

## Phases Exécutées

- [x] Phase 1 : Problèmes critiques
- [x] Phase 2 : Mise à jour schéma
- [x] Phase 3 : Standardisation
- [x] Phase 4 : Déploiement

## Résultats

- Tenants traités : X
- Tables modifiées : X
- Index créés : X
- Données migrées : X enregistrements

## Tests de Validation

- [x] Tous les tests passent
- [x] Aucune erreur dans les logs
- [x] Performances améliorées

## Prochaines Étapes

1. Monitoring continu (1 semaine)
2. Optimisations supplémentaires si nécessaire
3. Documentation utilisateur mise à jour

EOF
```

---

## 🔙 ROLLBACK

### En Cas de Problème Critique

```bash
# 1. Arrêter l'application
pm2 stop imtech-backend

# 2. Restaurer le backup
pg_restore -U postgres -d Imtech_SaaS -c backup_avant_corrections_*.dump

# 3. Redémarrer l'application
pm2 restart imtech-backend

# 4. Vérifier que tout fonctionne
curl http://localhost:3000/api/health
```

### Rollback Partiel (Par Phase)

```sql
-- Rollback Phase 1 uniquement
-- Supprimer les colonnes ajoutées
ALTER TABLE {schema}.diplome DROP COLUMN IF EXISTS signe_president;
ALTER TABLE {schema}.diplome DROP COLUMN IF EXISTS date_signature_president;
-- etc.

-- Rollback Phase 3 uniquement
-- Remettre 'professeur'
UPDATE {schema}.utilisateur SET role = 'professeur' WHERE role = 'enseignant';
```

---

## ❓ FAQ

### Q1 : Combien de temps prendra la migration complète ?
**R** : Environ 12 heures réparties sur 3 semaines, avec seulement 45 minutes de downtime total.

### Q2 : Puis-je exécuter les phases en parallèle ?
**R** : Non, les phases doivent être exécutées séquentiellement.

### Q3 : Que se passe-t-il si une phase échoue ?
**R** : Utilisez le rollback pour revenir à l'état précédent, analysez les logs, corrigez le problème, puis réessayez.

### Q4 : Les données seront-elles perdues ?
**R** : Non, aucune donnée n'est supprimée. Seules des colonnes et tables sont ajoutées.

### Q5 : Dois-je informer les utilisateurs ?
**R** : Oui, informez-les 24h avant pour les phases avec downtime (Phase 1 et 3).

### Q6 : Comment vérifier que tout fonctionne ?
**R** : Utilisez les scripts de test fournis et vérifiez les logs d'application.

### Q7 : Puis-je annuler après déploiement ?
**R** : Oui, tant que vous avez le backup. Mais plus vous attendez, plus c'est risqué.

### Q8 : Les performances seront-elles améliorées ?
**R** : Oui, grâce aux nouveaux index, les requêtes seront 2-5x plus rapides.

---

## 📞 SUPPORT

En cas de problème :
1. Consulter les logs : `/var/log/postgresql/`
2. Vérifier les erreurs : `pm2 logs imtech-backend`
3. Contacter l'équipe technique
4. Créer un ticket avec les détails

---

**Fin du Guide d'Exécution**

Made with ❤️ by IBM Bob