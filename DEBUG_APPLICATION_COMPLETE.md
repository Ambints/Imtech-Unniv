# Guide de Débogage Complet de l'Application IMTECH University

## Date de création: 2026-05-19

---

## 🎯 Objectif
Ce document fournit un guide complet pour déboguer et rendre l'application 100% fonctionnelle sans modification de code ni de structure de base de données.

---

## 📋 Table des Matières
1. [Vérifications Préliminaires](#1-vérifications-préliminaires)
2. [Configuration de l'Environnement](#2-configuration-de-lenvironnement)
3. [Vérification de la Base de Données](#3-vérification-de-la-base-de-données)
4. [Tests des Modules Backend](#4-tests-des-modules-backend)
5. [Tests du Frontend](#5-tests-du-frontend)
6. [Vérification des Permissions et Rôles](#6-vérification-des-permissions-et-rôles)
7. [Tests d'Intégration](#7-tests-dintégration)
8. [Résolution des Problèmes Courants](#8-résolution-des-problèmes-courants)
9. [Checklist de Validation Finale](#9-checklist-de-validation-finale)

---

## 1. Vérifications Préliminaires

### 1.1 Vérifier les Services Requis

```powershell
# Vérifier PostgreSQL
Get-Service -Name postgresql*

# Vérifier Node.js
node --version
npm --version

# Vérifier les ports disponibles
netstat -ano | findstr "3000 5000 5432"
```

**Résultat attendu:**
- PostgreSQL: Running
- Node.js: v18+ ou v20+
- Ports 3000, 5000, 5432 disponibles ou utilisés par l'application

### 1.2 Vérifier les Variables d'Environnement

**Backend (.env):**
```bash
# Vérifier que ces variables existent
cat backend/.env | Select-String "DATABASE_URL|JWT_SECRET|PORT"
```

**Frontend (.env):**
```bash
# Vérifier que ces variables existent
cat frontend/.env | Select-String "VITE_API_URL"
```

**Action si manquant:**
- Copier `.env.example` vers `.env`
- Remplir les valeurs appropriées

---

## 2. Configuration de l'Environnement

### 2.1 Installation des Dépendances

```powershell
# Backend
cd backend
npm install
npm audit fix --force

# Frontend
cd ../frontend
npm install
npm audit fix --force
```

### 2.2 Vérification des Dépendances Critiques

```powershell
# Backend - Vérifier les packages critiques
cd backend
npm list @nestjs/core @nestjs/typeorm typeorm pg

# Frontend - Vérifier les packages critiques
cd ../frontend
npm list react react-dom @tanstack/react-query axios
```

**Action si erreur:**
- Supprimer `node_modules` et `package-lock.json`
- Réinstaller: `npm install`

---

## 3. Vérification de la Base de Données

### 3.1 Connexion à la Base de Données

```powershell
# Se connecter à PostgreSQL
psql -U postgres -d imtech_university

# Ou avec l'URL complète
psql "postgresql://username:password@localhost:5432/imtech_university"
```

### 3.2 Vérifier les Schémas Existants

```sql
-- Lister tous les schémas
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
ORDER BY schema_name;

-- Résultat attendu: public, tenant_ispm, tenant_demo, etc.
```

### 3.3 Vérifier les Tables Principales

```sql
-- Tables du schéma public
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Tables critiques attendues:
-- - super_admin
-- - tenant
-- - plan
-- - subscription
```

### 3.4 Vérifier les Tables Tenant (exemple: tenant_ispm)

```sql
-- Changer de schéma
SET search_path TO tenant_ispm;

-- Lister les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'tenant_ispm' 
ORDER BY table_name;

-- Tables critiques attendues:
-- - utilisateur
-- - etudiant
-- - enseignant
-- - parcours
-- - departement
-- - annee_academique
-- - inscription
-- - paiement_inscription
-- - note
-- - emploi_du_temps
-- - etc.
```

### 3.5 Vérifier l'Intégrité des Données

```sql
-- Vérifier les tenants actifs
SELECT id, nom, subdomain, is_active, subscription_status 
FROM public.tenant 
WHERE is_active = true;

-- Vérifier les utilisateurs super admin
SELECT id, email, nom, prenom 
FROM public.super_admin;

-- Vérifier les utilisateurs d'un tenant
SET search_path TO tenant_ispm;
SELECT id, email, nom, prenom, role, is_active 
FROM utilisateur 
LIMIT 10;

-- Vérifier les étudiants
SELECT COUNT(*) as total_etudiants FROM etudiant;

-- Vérifier les enseignants
SELECT COUNT(*) as total_enseignants FROM enseignant;

-- Vérifier les inscriptions actives
SELECT COUNT(*) as inscriptions_actives 
FROM inscription 
WHERE statut = 'validee';
```

### 3.6 Vérifier les Contraintes et Index

```sql
-- Vérifier les contraintes de clés étrangères
SELECT 
    tc.table_schema, 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'tenant_ispm'
AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

-- Vérifier les index
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'tenant_ispm'
ORDER BY tablename, indexname;
```

---

## 4. Tests des Modules Backend

### 4.1 Démarrage du Backend

```powershell
cd backend
npm run start:dev
```

**Vérifications:**
- ✅ Le serveur démarre sans erreur
- ✅ Message: "Application is running on: http://localhost:5000"
- ✅ Connexion à la base de données réussie
- ✅ Pas d'erreurs de migration

### 4.2 Test de l'API Health Check

```powershell
# Test simple
curl http://localhost:5000/health

# Ou avec Invoke-WebRequest
Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET
```

**Résultat attendu:**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  }
}
```

### 4.3 Test d'Authentification

```powershell
# Test login super admin
$body = @{
    email = "admin@imtech.com"
    password = "Admin@123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

**Résultat attendu:**
- Status: 200 OK
- Body contient: `access_token`, `user` avec `role: 'super_admin'`

### 4.4 Test des Endpoints Principaux

#### A. Module Tenants

```powershell
# Récupérer le token d'abord
$token = "VOTRE_TOKEN_ICI"

# Lister les tenants
Invoke-WebRequest -Uri "http://localhost:5000/api/tenants" `
    -Method GET `
    -Headers @{Authorization="Bearer $token"}
```

#### B. Module Utilisateurs

```powershell
# Lister les utilisateurs d'un tenant
Invoke-WebRequest -Uri "http://localhost:5000/api/users" `
    -Method GET `
    -Headers @{
        Authorization="Bearer $token"
        "X-Tenant-ID"="tenant_ispm"
    }
```

#### C. Module Étudiants

```powershell
# Lister les étudiants
Invoke-WebRequest -Uri "http://localhost:5000/api/etudiants" `
    -Method GET `
    -Headers @{
        Authorization="Bearer $token"
        "X-Tenant-ID"="tenant_ispm"
    }
```

#### D. Module Enseignants

```powershell
# Lister les enseignants
Invoke-WebRequest -Uri "http://localhost:5000/api/enseignants" `
    -Method GET `
    -Headers @{
        Authorization="Bearer $token"
        "X-Tenant-ID"="tenant_ispm"
    }
```

#### E. Module Scolarité

```powershell
# Lister les parcours
Invoke-WebRequest -Uri "http://localhost:5000/api/scolarite/parcours" `
    -Method GET `
    -Headers @{
        Authorization="Bearer $token"
        "X-Tenant-ID"="tenant_ispm"
    }

# Lister les inscriptions
Invoke-WebRequest -Uri "http://localhost:5000/api/scolarite/inscriptions" `
    -Method GET `
    -Headers @{
        Authorization="Bearer $token"
        "X-Tenant-ID"="tenant_ispm"
    }
```

#### F. Module Économat

```powershell
# Vérifier le budget annuel
Invoke-WebRequest -Uri "http://localhost:5000/api/economat/budget" `
    -Method GET `
    -Headers @{
        Authorization="Bearer $token"
        "X-Tenant-ID"="tenant_ispm"
    }

# Vérifier les dépenses
Invoke-WebRequest -Uri "http://localhost:5000/api/economat/depenses" `
    -Method GET `
    -Headers @{
        Authorization="Bearer $token"
        "X-Tenant-ID"="tenant_ispm"
    }
```

#### G. Module RH

```powershell
# Lister le personnel
Invoke-WebRequest -Uri "http://localhost:5000/api/rh/personnel" `
    -Method GET `
    -Headers @{
        Authorization="Bearer $token"
        "X-Tenant-ID"="tenant_ispm"
    }
```

#### H. Module Président

```powershell
# Dashboard président
Invoke-WebRequest -Uri "http://localhost:5000/api/president/dashboard" `
    -Method GET `
    -Headers @{
        Authorization="Bearer $token"
        "X-Tenant-ID"="tenant_ispm"
    }
```

### 4.5 Vérification des Logs Backend

```powershell
# Surveiller les logs en temps réel
cd backend
npm run start:dev

# Dans un autre terminal, surveiller les erreurs
Get-Content -Path "backend/logs/error.log" -Wait -Tail 50
```

**Points à vérifier:**
- ✅ Pas d'erreurs de connexion DB
- ✅ Pas d'erreurs de middleware tenant
- ✅ Pas d'erreurs d'authentification
- ✅ Pas d'erreurs de validation

---

## 5. Tests du Frontend

### 5.1 Démarrage du Frontend

```powershell
cd frontend
npm run dev
```

**Vérifications:**
- ✅ Le serveur démarre sur http://localhost:3000
- ✅ Pas d'erreurs de compilation
- ✅ Pas d'erreurs de dépendances

### 5.2 Test de la Page de Connexion

**Navigation:**
1. Ouvrir http://localhost:3000
2. Vérifier que la page de login s'affiche

**Tests à effectuer:**
- ✅ Formulaire de connexion visible
- ✅ Champs email et password fonctionnels
- ✅ Bouton de connexion cliquable
- ✅ Messages d'erreur s'affichent correctement

**Test de connexion:**
```
Email: admin@imtech.com
Password: Admin@123
```

### 5.3 Test du Dashboard Super Admin

**Après connexion réussie:**
- ✅ Redirection vers /super-admin/dashboard
- ✅ Menu latéral visible
- ✅ Statistiques affichées
- ✅ Pas d'erreurs dans la console

**Vérifier les sections:**
1. **Gestion des Tenants**
   - Liste des tenants visible
   - Bouton "Créer un tenant" fonctionnel
   - Actions (éditer, désactiver) disponibles

2. **Gestion des Plans**
   - Liste des plans d'abonnement
   - Création/modification de plans

3. **Gestion des Abonnements**
   - Liste des abonnements actifs
   - Statuts corrects

### 5.4 Test des Modules Tenant

**Se connecter avec un compte tenant:**
```
Email: secretaire@ispm.edu
Password: [mot de passe du tenant]
```

#### A. Module Scolarité

**Navigation:** `/scolarite/*`

**Tests:**
- ✅ `/scolarite/etudiants` - Liste des étudiants
- ✅ `/scolarite/inscriptions` - Gestion des inscriptions
- ✅ `/scolarite/parcours` - Liste des parcours
- ✅ `/scolarite/notes` - Saisie des notes
- ✅ `/scolarite/emploi-du-temps` - Emploi du temps

#### B. Module Enseignant

**Navigation:** `/enseignant/*`

**Tests:**
- ✅ `/enseignant/dashboard` - Dashboard enseignant
- ✅ `/enseignant/cours` - Mes cours
- ✅ `/enseignant/notes` - Saisie des notes
- ✅ `/enseignant/absences` - Gestion des absences
- ✅ `/enseignant/messagerie` - Messagerie

#### C. Module Économat

**Navigation:** `/economat/*`

**Tests:**
- ✅ `/economat/budget` - Budget annuel
- ✅ `/economat/depenses` - Gestion des dépenses
- ✅ `/economat/recouvrements` - Recouvrements
- ✅ `/economat/fournisseurs` - Gestion des fournisseurs
- ✅ `/economat/rapports` - Rapports financiers

#### D. Module RH

**Navigation:** `/rh/*`

**Tests:**
- ✅ `/rh/personnel` - Gestion du personnel
- ✅ `/rh/contrats` - Gestion des contrats
- ✅ `/rh/conges` - Gestion des congés
- ✅ `/rh/evaluations` - Évaluations du personnel
- ✅ `/rh/paie` - Gestion de la paie

#### E. Module Président

**Navigation:** `/president/*`

**Tests:**
- ✅ `/president/dashboard` - Dashboard président
- ✅ `/president/statistiques` - Statistiques globales
- ✅ `/president/rapports` - Rapports institutionnels
- ✅ `/president/decisions` - Validation des décisions

#### F. Module Logistique

**Navigation:** `/logistique/*`

**Tests:**
- ✅ `/logistique/salles` - Gestion des salles
- ✅ `/logistique/equipements` - Gestion des équipements
- ✅ `/logistique/maintenance` - Maintenance
- ✅ `/logistique/reservations` - Réservations

### 5.5 Vérification de la Console Navigateur

**Ouvrir les DevTools (F12):**

**Console:**
- ✅ Pas d'erreurs JavaScript
- ✅ Pas d'erreurs de requêtes API (404, 500)
- ✅ Pas d'avertissements critiques

**Network:**
- ✅ Toutes les requêtes API retournent 200 ou 201
- ✅ Pas de requêtes en échec
- ✅ Temps de réponse acceptable (<2s)

**Application/Storage:**
- ✅ Token JWT stocké correctement
- ✅ Informations utilisateur en localStorage
- ✅ Tenant ID présent si applicable

---

## 6. Vérification des Permissions et Rôles

### 6.1 Vérifier les Rôles dans la Base de Données

```sql
-- Rôles disponibles dans le système
SET search_path TO tenant_ispm;

SELECT DISTINCT role 
FROM utilisateur 
ORDER BY role;

-- Résultat attendu:
-- - super_admin (dans public.super_admin)
-- - president
-- - secretaire_general
-- - responsable_scolarite
-- - responsable_rh
-- - responsable_economat
-- - responsable_logistique
-- - enseignant
-- - etudiant
-- - parent
```

### 6.2 Tester les Permissions par Rôle

#### A. Super Admin

**Accès attendu:**
- ✅ Tous les modules
- ✅ Gestion des tenants
- ✅ Gestion des plans
- ✅ Gestion des abonnements
- ✅ Configuration globale

**Test:**
```powershell
# Tester l'accès à un endpoint super admin
Invoke-WebRequest -Uri "http://localhost:5000/api/tenants" `
    -Method GET `
    -Headers @{Authorization="Bearer $superAdminToken"}
```

#### B. Président

**Accès attendu:**
- ✅ Dashboard président
- ✅ Statistiques globales
- ✅ Validation des décisions importantes
- ✅ Rapports institutionnels
- ❌ Pas d'accès à la gestion des tenants

**Test:**
```powershell
# Tester l'accès au dashboard président
Invoke-WebRequest -Uri "http://localhost:5000/api/president/dashboard" `
    -Method GET `
    -Headers @{
        Authorization="Bearer $presidentToken"
        "X-Tenant-ID"="tenant_ispm"
    }
```

#### C. Secrétaire Général

**Accès attendu:**
- ✅ Module scolarité complet
- ✅ Gestion des étudiants
- ✅ Gestion des inscriptions
- ✅ Gestion des parcours
- ❌ Pas d'accès aux modules RH, Économat

#### D. Enseignant

**Accès attendu:**
- ✅ Ses cours uniquement
- ✅ Saisie des notes pour ses cours
- ✅ Gestion des absences pour ses cours
- ✅ Messagerie
- ❌ Pas d'accès aux autres cours

#### E. Étudiant

**Accès attendu:**
- ✅ Son profil
- ✅ Ses notes
- ✅ Son emploi du temps
- ✅ Ses paiements
- ❌ Pas d'accès aux autres étudiants

### 6.3 Vérifier les Guards et Middlewares

**Dans les logs backend, vérifier:**
- ✅ Middleware tenant s'exécute correctement
- ✅ Guards d'authentification fonctionnent
- ✅ Guards de rôles bloquent les accès non autorisés
- ✅ Pas de bypass de sécurité

---

## 7. Tests d'Intégration

### 7.1 Scénario: Inscription d'un Nouvel Étudiant

**Étapes:**
1. Se connecter en tant que secrétaire
2. Aller dans Scolarité > Étudiants
3. Cliquer sur "Nouvel étudiant"
4. Remplir le formulaire
5. Soumettre

**Vérifications:**
- ✅ Formulaire se soumet sans erreur
- ✅ Étudiant créé dans la base de données
- ✅ Compte utilisateur créé automatiquement
- ✅ Email de bienvenue envoyé (si configuré)
- ✅ Étudiant apparaît dans la liste

**Vérification DB:**
```sql
SET search_path TO tenant_ispm;

-- Vérifier le dernier étudiant créé
SELECT e.*, u.email, u.is_active
FROM etudiant e
JOIN utilisateur u ON e.utilisateur_id = u.id
ORDER BY e.created_at DESC
LIMIT 1;
```

### 7.2 Scénario: Inscription à un Parcours

**Étapes:**
1. Sélectionner l'étudiant créé
2. Cliquer sur "Inscrire à un parcours"
3. Choisir le parcours et l'année académique
4. Soumettre

**Vérifications:**
- ✅ Inscription créée avec statut "en_attente"
- ✅ Échéancier de paiement généré
- ✅ Inscription visible dans la liste

**Vérification DB:**
```sql
SET search_path TO tenant_ispm;

-- Vérifier l'inscription
SELECT i.*, p.nom as parcours_nom, aa.annee
FROM inscription i
JOIN parcours p ON i.parcours_id = p.id
JOIN annee_academique aa ON i.annee_academique_id = aa.id
WHERE i.etudiant_id = [ID_ETUDIANT]
ORDER BY i.created_at DESC
LIMIT 1;

-- Vérifier l'échéancier
SELECT * FROM echeancier_paiement
WHERE inscription_id = [ID_INSCRIPTION]
ORDER BY date_echeance;
```

### 7.3 Scénario: Paiement de Frais

**Étapes:**
1. Aller dans Économat > Recouvrements
2. Rechercher l'étudiant
3. Enregistrer un paiement
4. Soumettre

**Vérifications:**
- ✅ Paiement enregistré
- ✅ Échéance marquée comme payée
- ✅ Reçu généré
- ✅ Solde mis à jour

**Vérification DB:**
```sql
SET search_path TO tenant_ispm;

-- Vérifier le paiement
SELECT * FROM paiement_inscription
WHERE inscription_id = [ID_INSCRIPTION]
ORDER BY date_paiement DESC
LIMIT 1;

-- Vérifier le solde
SELECT 
    i.id,
    i.montant_total,
    COALESCE(SUM(pi.montant), 0) as total_paye,
    i.montant_total - COALESCE(SUM(pi.montant), 0) as solde
FROM inscription i
LEFT JOIN paiement_inscription pi ON i.id = pi.inscription_id
WHERE i.id = [ID_INSCRIPTION]
GROUP BY i.id, i.montant_total;
```

### 7.4 Scénario: Saisie de Notes

**Étapes:**
1. Se connecter en tant qu'enseignant
2. Aller dans Mes Cours
3. Sélectionner un cours
4. Cliquer sur "Saisir les notes"
5. Entrer les notes pour les étudiants
6. Soumettre

**Vérifications:**
- ✅ Notes enregistrées
- ✅ Moyennes calculées automatiquement
- ✅ Notes visibles pour les étudiants
- ✅ Notifications envoyées (si configuré)

**Vérification DB:**
```sql
SET search_path TO tenant_ispm;

-- Vérifier les notes saisies
SELECT 
    n.*,
    e.nom || ' ' || e.prenom as etudiant,
    m.nom as matiere
FROM note n
JOIN etudiant e ON n.etudiant_id = e.id
JOIN matiere m ON n.matiere_id = m.id
WHERE n.enseignant_id = [ID_ENSEIGNANT]
ORDER BY n.created_at DESC
LIMIT 10;
```

### 7.5 Scénario: Génération de Rapport

**Étapes:**
1. Se connecter en tant que président
2. Aller dans Rapports
3. Sélectionner le type de rapport
4. Choisir la période
5. Générer le rapport

**Vérifications:**
- ✅ Rapport généré sans erreur
- ✅ Données correctes et cohérentes
- ✅ Export PDF/Excel fonctionne
- ✅ Graphiques s'affichent correctement

---

## 8. Résolution des Problèmes Courants

### 8.1 Erreur: "Cannot connect to database"

**Diagnostic:**
```powershell
# Vérifier que PostgreSQL est en cours d'exécution
Get-Service -Name postgresql*

# Tester la connexion
psql -U postgres -d imtech_university
```

**Solutions:**
1. Démarrer PostgreSQL: `Start-Service postgresql-x64-14`
2. Vérifier les credentials dans `.env`
3. Vérifier que le port 5432 est disponible

### 8.2 Erreur: "Tenant not found"

**Diagnostic:**
```sql
-- Vérifier les tenants actifs
SELECT id, nom, subdomain, is_active 
FROM public.tenant;
```

**Solutions:**
1. Vérifier que le tenant existe et est actif
2. Vérifier le header `X-Tenant-ID` dans les requêtes
3. Vérifier le middleware tenant dans le backend

### 8.3 Erreur: "Unauthorized" ou "Forbidden"

**Diagnostic:**
```powershell
# Vérifier le token JWT
# Décoder le token sur jwt.io
```

**Solutions:**
1. Vérifier que le token n'est pas expiré
2. Vérifier que le rôle de l'utilisateur est correct
3. Vérifier les guards dans le backend
4. Se reconnecter pour obtenir un nouveau token

### 8.4 Erreur: "Column does not exist"

**Diagnostic:**
```sql
-- Vérifier la structure de la table
\d+ tenant_ispm.nom_de_la_table

-- Ou
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'tenant_ispm' 
AND table_name = 'nom_de_la_table';
```

**Solutions:**
1. Vérifier que toutes les migrations ont été exécutées
2. Comparer avec le schéma attendu dans `tenant-schema.sql`
3. Vérifier les noms de colonnes dans les entités TypeORM

### 8.5 Erreur: "CORS policy blocked"

**Diagnostic:**
- Vérifier les logs de la console navigateur
- Vérifier l'URL de l'API dans le frontend

**Solutions:**
1. Vérifier la configuration CORS dans `main.ts` du backend
2. Vérifier que `VITE_API_URL` est correct dans `.env` du frontend
3. Redémarrer le backend après modification

### 8.6 Erreur: "Module not found" (Frontend)

**Diagnostic:**
```powershell
cd frontend
npm list [nom-du-package]
```

**Solutions:**
1. Réinstaller les dépendances: `npm install`
2. Vérifier les imports dans les fichiers
3. Vérifier les alias de chemin dans `vite.config.ts`

### 8.7 Erreur: "Port already in use"

**Diagnostic:**
```powershell
# Trouver le processus utilisant le port
netstat -ano | findstr "3000"
netstat -ano | findstr "5000"
```

**Solutions:**
1. Tuer le processus: `taskkill /PID [PID] /F`
2. Changer le port dans la configuration
3. Redémarrer l'ordinateur si nécessaire

### 8.8 Erreur: "Cannot read property of undefined"

**Diagnostic:**
- Vérifier les logs de la console
- Vérifier les données retournées par l'API

**Solutions:**
1. Ajouter des vérifications null/undefined dans le code
2. Vérifier que l'API retourne les données attendues
3. Utiliser optional chaining (`?.`) dans le frontend

### 8.9 Erreur: "Transaction already started"

**Diagnostic:**
- Vérifier les logs du backend
- Vérifier les transactions imbriquées

**Solutions:**
1. Redémarrer le backend
2. Vérifier qu'il n'y a pas de transactions imbriquées
3. Utiliser `queryRunner.release()` correctement

### 8.10 Erreur: "Memory leak detected"

**Diagnostic:**
```powershell
# Surveiller l'utilisation mémoire
Get-Process node | Select-Object Name, WS
```

**Solutions:**
1. Redémarrer l'application
2. Vérifier les listeners d'événements non nettoyés
3. Vérifier les connexions DB non fermées
4. Utiliser `useEffect` cleanup dans React

---

## 9. Checklist de Validation Finale

### 9.1 Infrastructure

- [ ] PostgreSQL en cours d'exécution
- [ ] Base de données `imtech_university` existe
- [ ] Tous les schémas tenant créés
- [ ] Toutes les tables créées
- [ ] Données de test présentes

### 9.2 Backend

- [ ] Backend démarre sans erreur
- [ ] Connexion DB réussie
- [ ] Tous les modules chargés
- [ ] API Health check répond
- [ ] Swagger documentation accessible (si activé)
- [ ] Logs ne montrent pas d'erreurs critiques

### 9.3 Frontend

- [ ] Frontend démarre sans erreur
- [ ] Pas d'erreurs de compilation
- [ ] Page de login accessible
- [ ] Connexion réussie
- [ ] Dashboard s'affiche correctement
- [ ] Tous les menus accessibles
- [ ] Pas d'erreurs dans la console

### 9.4 Authentification & Autorisation

- [ ] Login super admin fonctionne
- [ ] Login utilisateur tenant fonctionne
- [ ] JWT généré et stocké correctement
- [ ] Refresh token fonctionne
- [ ] Logout fonctionne
- [ ] Guards de rôles fonctionnent
- [ ] Accès non autorisés bloqués

### 9.5 Modules Fonctionnels

#### Super Admin
- [ ] Gestion des tenants
- [ ] Gestion des plans
- [ ] Gestion des abonnements
- [ ] Configuration globale

#### Scolarité
- [ ] Gestion des étudiants
- [ ] Gestion des inscriptions
- [ ] Gestion des parcours
- [ ] Saisie des notes
- [ ] Emploi du temps
- [ ] Génération de documents

#### Enseignant
- [ ] Dashboard enseignant
- [ ] Mes cours
- [ ] Saisie des notes
- [ ] Gestion des absences
- [ ] Messagerie

#### Économat
- [ ] Budget annuel
- [ ] Gestion des dépenses
- [ ] Recouvrements
- [ ] Gestion des fournisseurs
- [ ] Rapports financiers

#### RH
- [ ] Gestion du personnel
- [ ] Gestion des contrats
- [ ] Gestion des congés
- [ ] Évaluations
- [ ] Gestion de la paie

#### Président
- [ ] Dashboard président
- [ ] Statistiques globales
- [ ] Validation des décisions
- [ ] Rapports institutionnels

#### Logistique
- [ ] Gestion des salles
- [ ] Gestion des équipements
- [ ] Maintenance
- [ ] Réservations

### 9.6 Intégrations

- [ ] Génération de PDF
- [ ] Export Excel
- [ ] Envoi d'emails (si configuré)
- [ ] Notifications en temps réel (si configuré)
- [ ] Upload de fichiers

### 9.7 Performance

- [ ] Temps de chargement < 3s
- [ ] Requêtes API < 2s
- [ ] Pas de fuites mémoire
- [ ] Pagination fonctionne
- [ ] Recherche performante

### 9.8 Sécurité

- [ ] Mots de passe hashés
- [ ] JWT sécurisés
- [ ] CORS configuré correctement
- [ ] Validation des entrées
- [ ] Protection contre SQL injection
- [ ] Protection contre XSS
- [ ] HTTPS en production (si applicable)

---

## 10. Commandes Utiles de Débogage

### 10.1 Base de Données

```sql
-- Vérifier la taille de la base de données
SELECT pg_size_pretty(pg_database_size('imtech_university'));

-- Vérifier les connexions actives
SELECT * FROM pg_stat_activity 
WHERE datname = 'imtech_university';

-- Vérifier les requêtes lentes
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Analyser une table
ANALYZE tenant_ispm.etudiant;

-- Vacuum une table
VACUUM ANALYZE tenant_ispm.etudiant;

-- Vérifier les index inutilisés
SELECT schemaname, tablename, indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname = 'tenant_ispm';
```

### 10.2 Backend

```powershell
# Logs en temps réel
cd backend
npm run start:dev | Tee-Object -FilePath debug.log

# Vérifier les dépendances obsolètes
npm outdated

# Audit de sécurité
npm audit

# Nettoyer le cache
npm cache clean --force

# Rebuild
rm -rf node_modules package-lock.json
npm install
```

### 10.3 Frontend

```powershell
# Build de production pour tester
cd frontend
npm run build

# Prévisualiser le build
npm run preview

# Analyser le bundle
npm run build -- --mode analyze

# Nettoyer le cache
rm -rf node_modules .vite package-lock.json
npm install
```

---

## 11. Monitoring et Logs

### 11.1 Logs Backend

**Emplacement:** `backend/logs/`

**Fichiers:**
- `error.log` - Erreurs critiques
- `combined.log` - Tous les logs
- `access.log` - Logs d'accès API

**Surveillance:**
```powershell
# Surveiller les erreurs
Get-Content backend/logs/error.log -Wait -Tail 50

# Filtrer par type
Get-Content backend/logs/combined.log | Select-String "ERROR"
```

### 11.2 Logs PostgreSQL

**Emplacement:** Dépend de l'installation

**Surveillance:**
```sql
-- Activer le logging des requêtes lentes
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 seconde
SELECT pg_reload_conf();

-- Voir les logs
SHOW log_directory;
SHOW log_filename;
```

### 11.3 Métriques de Performance

**Backend:**
```typescript
// Ajouter dans main.ts pour monitoring
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} - ${duration}ms`);
  });
  next();
});
```

**Frontend:**
```typescript
// Utiliser React DevTools Profiler
// Mesurer les temps de rendu
```

---

## 12. Procédure de Validation Complète

### Étape 1: Préparation (15 min)
1. Vérifier que tous les services sont démarrés
2. Vérifier les variables d'environnement
3. Vérifier la connexion à la base de données
4. Nettoyer les logs précédents

### Étape 2: Tests Backend (30 min)
1. Démarrer le backend
2. Tester tous les endpoints principaux
3. Vérifier les logs pour les erreurs
4. Tester l'authentification
5. Tester les permissions

### Étape 3: Tests Frontend (30 min)
1. Démarrer le frontend
2. Tester la connexion
3. Parcourir tous les modules
4. Tester les formulaires
5. Vérifier la console pour les erreurs

### Étape 4: Tests d'Intégration (45 min)
1. Exécuter les scénarios de test
2. Vérifier les données dans la DB
3. Tester les workflows complets
4. Vérifier les notifications/emails

### Étape 5: Tests de Performance (20 min)
1. Mesurer les temps de chargement
2. Tester avec plusieurs utilisateurs simultanés
3. Vérifier l'utilisation mémoire
4. Tester la pagination sur grandes listes

### Étape 6: Validation Finale (10 min)
1. Remplir la checklist de validation
2. Documenter les problèmes trouvés
3. Créer un rapport de test
4. Planifier les corrections si nécessaire

---

## 13. Rapport de Test Template

```markdown
# Rapport de Test - [Date]

## Environnement
- OS: Windows 11
- Node.js: v[version]
- PostgreSQL: v[version]
- Backend: Running on port 5000
- Frontend: Running on port 3000

## Résultats des Tests

### Infrastructure ✅/❌
- [ ] PostgreSQL: [Status]
- [ ] Base de données: [Status]
- [ ] Schémas tenant: [Status]

### Backend ✅/❌
- [ ] Démarrage: [Status]
- [ ] API Health: [Status]
- [ ] Authentification: [Status]
- [ ] Modules: [Status]

### Frontend ✅/❌
- [ ] Démarrage: [Status]
- [ ] Login: [Status]
- [ ] Navigation: [Status]
- [ ] Modules: [Status]

### Tests d'Intégration ✅/❌
- [ ] Inscription étudiant: [Status]
- [ ] Paiement: [Status]
- [ ] Saisie notes: [Status]
- [ ] Génération rapports: [Status]

## Problèmes Identifiés
1. [Description du problème]
   - Sévérité: Critique/Majeur/Mineur
   - Module: [Nom du module]
   - Solution proposée: [Description]

## Recommandations
1. [Recommandation 1]
2. [Recommandation 2]

## Conclusion
[Résumé général de l'état de l'application]
```

---

## 14. Contacts et Support

### Documentation
- Spécifications: Voir fichiers `SPECIFICATION_*.md`
- Guides: Voir fichiers `GUIDE_*.md`
- Schéma DB: `tenant-schema.sql`

### Logs Importants
- Backend: `backend/logs/`
- PostgreSQL: Voir configuration PostgreSQL
- Frontend: Console navigateur (F12)

### Commandes d'Urgence

```powershell
# Redémarrer tout
# 1. Arrêter les services
taskkill /F /IM node.exe

# 2. Redémarrer PostgreSQL
Restart-Service postgresql-x64-14

# 3. Redémarrer backend
cd backend
npm run start:dev

# 4. Redémarrer frontend
cd frontend
npm run dev
```

---

## 15. Conclusion

Ce guide fournit une approche systématique pour déboguer et valider l'application IMTECH University. Suivez les étapes dans l'ordre, documentez vos résultats, et utilisez la checklist pour vous assurer que tous les aspects sont testés.

**Points clés à retenir:**
1. Toujours vérifier l'infrastructure d'abord
2. Tester le backend avant le frontend
3. Vérifier les logs régulièrement
4. Documenter tous les problèmes trouvés
5. Tester les scénarios d'utilisation réels
6. Valider les permissions et la sécurité

**En cas de problème persistant:**
1. Consulter la section "Résolution des Problèmes Courants"
2. Vérifier les logs détaillés
3. Tester avec des données minimales
4. Isoler le problème (backend vs frontend vs DB)
5. Documenter et créer un rapport

---

**Version:** 1.0  
**Dernière mise à jour:** 2026-05-19  
**Auteur:** Bob - Software Engineer